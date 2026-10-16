import { waitUntil } from "cloudflare:workers";
import { recordDataforseoCost } from "./cost-ledger";
import {
  DataforseoChargedTaskError,
  type DataforseoApiCallCost,
  type DataforseoApiResponse,
} from "./envelope";
import {
  getOrCreateOrganizationCustomer,
  reserveUsageCredits,
  settleUsageCredits,
  type BillingCustomerContext,
} from "@/server/billing/subscription";
import {
  mapDataforseoPathToCreditFeature,
  type CreditFeature,
} from "@/shared/billing-credit-features";
import {
  getOptionalEnvValue,
  isHostedServerAuthMode,
} from "@/server/lib/runtime-env";
import { AppError } from "@/server/lib/errors";
/**
 * The one seam every DataForSEO charge passes through (hosted mode only).
 * Order: reserve the estimate on the org's credits -> provider calls -> settle
 * the hold on their real cost. The hold is atomic in Autumn, so concurrent
 * calls cannot all pass on one stale balance reading.
 *
 * A batch of calls shares one hold and one settle per credit pool it draws
 * on, with each call placed and refused as its own hold would be (see
 * reserveUsageCredits): holding and settling per call sent up to 40 Autumn
 * requests per rank check batch, and enough of them hit the SDK's timeout to
 * drop charges.
 */
export async function meterDataforseoCalls<T>(
  customer: BillingCustomerContext,
  executes: Array<() => Promise<DataforseoApiResponse<T>>>,
  callCredits: number[],
  creditFeature?: CreditFeature,
): Promise<PromiseSettledResult<T>[]> {
  if (executes.length === 0) return [];
  executes = executes.map((execute) => async () => {
    try {
      const result = await execute();
      recordDataforseoCost(result.billing);
      return result;
    } catch (error) {
      if (error instanceof DataforseoChargedTaskError)
        recordDataforseoCost(error.billing);
      throw error;
    }
  });
  const isHostedMode =
    (await isHostedServerAuthMode()) &&
    (await getOptionalEnvValue("BILLING_DISABLED")) !== "true";

  if (!isHostedMode) {
    return Promise.allSettled(
      executes.map(async (execute) => (await execute()).data),
    );
  }

  const billingCustomer = await getOrCreateOrganizationCustomer(customer);
  const { holds, refusedCalls } = await reserveUsageCredits({
    customer,
    customerId: billingCustomer.id,
    callCredits,
    creditFeature,
  });

  const work = (async () => {
    const billed: Array<DataforseoApiCallCost | null> = executes.map(
      () => null,
    );
    const settled = await Promise.allSettled(
      executes.map(async (execute, index) => {
        if (refusedCalls.includes(index)) {
          throw new AppError("INSUFFICIENT_CREDITS");
        }
        try {
          const result = await execute();
          billed[index] = result.billing;
          return result.data;
        } catch (error) {
          // Transport / auth / upstream failure: nothing was billed.
          if (!(error instanceof DataforseoChargedTaskError)) throw error;
          // A malformed request (DataForSEO "Invalid Field: ...") that
          // DataForSEO did not bill returns no value to the customer, so don't
          // charge — surface it as a non-reportable VALIDATION_ERROR. If
          // DataForSEO still billed us (costUsd > 0), charge that cost so the
          // spend stays metered and visible instead of silently eaten.
          if (error.isInvalidField && error.billing.costUsd <= 0) {
            throw new AppError("VALIDATION_ERROR", error.message);
          }
          billed[index] = error.billing;
          throw error;
        }
      }),
    );

    for (const hold of holds) {
      const costs = hold.callIndexes
        .map((index) => billed[index])
        .filter((cost) => cost !== null);
      await settleUsageCredits({
        customer,
        hold,
        creditFeature:
          creditFeature ??
          (costs.length > 0
            ? mapDataforseoPathToCreditFeature(costs[0].path)
            : undefined),
        costs,
      });
    }
    return settled;
  })();

  // Register the calls + settle with the request: workerd cancels pending I/O
  // once the client goes away, and a hold that never settles would let a
  // disconnect-after-dispatch skip the deduction. The rejection is handled by
  // the await below; the background handle only keeps the chain alive.
  try {
    waitUntil(work.catch(() => undefined));
  } catch {
    // No request context (Workflow step, tests): the await below runs it.
  }
  return await work;
}

export async function meterDataforseoCall<T>(
  customer: BillingCustomerContext,
  execute: () => Promise<DataforseoApiResponse<T>>,
  estimatedCredits: number,
  creditFeature?: CreditFeature,
): Promise<T> {
  const [result] = await meterDataforseoCalls(
    customer,
    [execute],
    [estimatedCredits],
    creditFeature,
  );
  if (result.status === "rejected") throw result.reason;
  return result.value;
}
