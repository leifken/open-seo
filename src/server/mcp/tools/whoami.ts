import { autumn } from "@/server/billing/autumn";
import {
  AUTUMN_SEO_DATA_BALANCE_FEATURE_ID,
  AUTUMN_SEO_DATA_TOPUP_BALANCE_FEATURE_ID,
} from "@/shared/billing";
import { mcpResponse } from "@/server/mcp/formatters";
import { type ToolContext } from "@/server/mcp/context";
import { isHostedServerAuthMode } from "@/server/lib/runtime-env";
import { optionalMetaOutputSchema } from "@/server/mcp/output-schemas";
import { fetchUserData } from "@/server/lib/dataforseo";
import { buildCacheKey, getCached, setCached } from "@/server/lib/r2-cache";
import { z } from "zod";

async function checkBalance(featureId: string, customerId: string) {
  try {
    const result = await autumn.check({ customerId, featureId });
    return result.balance?.remaining ?? null;
  } catch {
    return null;
  }
}

// LEIFKEN (RankMeister SEO-4 Punkt 2): the actual DataForSEO account balance,
// not the hosted-billing credit balance above — the number that answers "can
// we still afford to call DataForSEO right now?" GET /v3/appendix/user_data
// is free at DataForSEO, but whoami is called often (every agent session
// tends to open with it), so the result is still cached briefly rather than
// hitting DataForSEO on every call.
const ACCOUNT_BALANCE_CACHE_NAMESPACE = "dataforseo:account-balance";
const ACCOUNT_BALANCE_CACHE_TTL_SECONDS = 5 * 60;

const accountBalanceSchema = z.object({
  balanceUsd: z.number().nullable(),
  depositedTotalUsd: z.number().nullable(),
  fetchedAt: z.string(),
});

type DataforseoAccountBalance = z.infer<typeof accountBalanceSchema>;

async function getDataforseoAccountBalance(): Promise<DataforseoAccountBalance | null> {
  const cacheKey = await buildCacheKey(ACCOUNT_BALANCE_CACHE_NAMESPACE, {});
  const cached = accountBalanceSchema.safeParse(await getCached(cacheKey));
  if (cached.success) return cached.data;

  let account;
  try {
    account = await fetchUserData();
  } catch {
    // whoami is a free, best-effort diagnostic — a DataForSEO outage or a
    // missing/invalid key must not make the whole call fail, only omit this
    // one field. get_business_profile and friends still raise properly if
    // the key is actually broken.
    return null;
  }
  if (!account) return null;

  const balance: DataforseoAccountBalance = {
    balanceUsd: account.money?.balance ?? null,
    depositedTotalUsd: account.money?.total ?? null,
    fetchedAt: new Date().toISOString(),
  };
  await setCached(cacheKey, balance, ACCOUNT_BALANCE_CACHE_TTL_SECONDS);
  return balance;
}

function formatUsd(value: number | null): string {
  return value == null ? "unknown" : `$${value.toFixed(2)}`;
}

export const whoamiTool = {
  name: "whoami",
  config: {
    title: "Who am I",
    description:
      "Confirms the connected OpenSEO account, server mode, token scopes, current credit balance, and the real DataForSEO account balance (GET /v3/appendix/user_data, cached for 5 minutes) when the user asks to check their account or connection. Uses no credits — does not make a billable DataForSEO call.",
    inputSchema: {} as Record<string, never>,
    outputSchema: {
      userEmail: z.string(),
      scopes: z.array(z.string()),
      mode: z.enum(["hosted", "self-hosted"]),
      creditsRemaining: z.number().nullable(),
      dataforseoAccountBalance: accountBalanceSchema.nullable(),
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  handler: async (_args: Record<string, never>, context: ToolContext) => {
    const auth = context.auth;
    const isHosted = await isHostedServerAuthMode();
    const [creditsRemaining, dataforseoAccountBalance] = await Promise.all([
      isHosted
        ? Promise.all([
            checkBalance(
              AUTUMN_SEO_DATA_BALANCE_FEATURE_ID,
              auth.organizationId,
            ),
            checkBalance(
              AUTUMN_SEO_DATA_TOPUP_BALANCE_FEATURE_ID,
              auth.organizationId,
            ),
          ]).then(([base, topup]) => (base ?? 0) + (topup ?? 0))
        : Promise.resolve(null as number | null),
      getDataforseoAccountBalance(),
    ]);
    const lines = [
      `Account: ${auth.userEmail}`,
      `Mode: ${isHosted ? "hosted" : "self-hosted"}`,
      `Scopes: ${auth.scopes.length > 0 ? auth.scopes.join(", ") : "none"}`,
    ];
    if (isHosted) {
      lines.push(
        `Credits remaining: ${creditsRemaining != null ? creditsRemaining.toLocaleString() : "unknown"}`,
      );
    }
    lines.push(
      dataforseoAccountBalance
        ? `DataForSEO account balance: ${formatUsd(dataforseoAccountBalance.balanceUsd)} left of ${formatUsd(dataforseoAccountBalance.depositedTotalUsd)} deposited (as of ${dataforseoAccountBalance.fetchedAt}).`
        : "DataForSEO account balance: unknown (could not reach DataForSEO's appendix/user_data endpoint).",
    );
    return mcpResponse({
      text: lines.join("\n"),
      meta: {
        creditsRemaining: creditsRemaining ?? undefined,
      },
      structuredContent: {
        userEmail: auth.userEmail,
        scopes: auth.scopes,
        mode: isHosted ? "hosted" : "self-hosted",
        creditsRemaining,
        dataforseoAccountBalance,
      },
    });
  },
};
