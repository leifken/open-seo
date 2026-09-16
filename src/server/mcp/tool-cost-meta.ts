import {
  type CallToolResult,
  ProtocolError,
  ProtocolErrorCode,
} from "@modelcontextprotocol/server";
import {
  runWithDataforseoCostLedger,
  type DataforseoCostSummary,
} from "@/server/lib/dataforseo/cost-ledger";
import { asAppError } from "@/server/lib/errors";

// LEIFKEN addition (RankMeister SEO-4). Wraps every registered MCP tool so its
// response carries the real DataForSEO cost of the call in `meta` (both
// `structuredContent.meta` and `_meta`), and so a failed call still returns
// that cost next to `isError: true`.
//
// Contract for callers (Motor, CRM):
//  - meta.costUsd          USD, sum of DataForSEO `cost` of every task this call
//                          started (0 when it made no paid call or hit a cache)
//  - meta.dataforseoCalls  number of DataForSEO tasks behind costUsd
//  - meta.costBreakdown    per endpoint path: calls and costUsd (only when > 0 calls)
//  - meta.costNote         only for tools whose spend happens later in a
//                          background workflow (not included in costUsd)

const BACKGROUND_COST_NOTES: Record<string, string> = {
  run_rank_tracker:
    "The rank check runs in a background workflow, so its DataForSEO cost is not included in costUsd. structuredContent.estimatedCostUsd holds the live-price estimate for the run.",
  run_site_audit:
    "Crawling is free. Lighthouse tests (runLighthouse: true) run later in the audit workflow at about $0.005 per test (one mobile and one desktop test per sampled page); that cost is not included in costUsd.",
};

type CostMeta = {
  costUsd: number;
  costCurrency: "USD";
  dataforseoCalls: number;
  costBreakdown?: DataforseoCostSummary["costBreakdown"];
  costNote?: string;
};

export function buildCostMeta(
  toolName: string,
  cost: DataforseoCostSummary,
): CostMeta {
  const note = BACKGROUND_COST_NOTES[toolName];
  return {
    costUsd: cost.costUsd,
    costCurrency: "USD",
    dataforseoCalls: cost.dataforseoCalls,
    ...(cost.costBreakdown.length > 0
      ? { costBreakdown: cost.costBreakdown }
      : {}),
    ...(note ? { costNote: note } : {}),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function withCostMeta(result: CallToolResult, costMeta: CostMeta) {
  const structured = result.structuredContent;
  return {
    ...result,
    ...(isRecord(structured)
      ? {
          structuredContent: {
            ...structured,
            meta: {
              ...(isRecord(structured.meta) ? structured.meta : {}),
              ...costMeta,
            },
          },
        }
      : {}),
    _meta: { ...result._meta, ...costMeta },
  } satisfies CallToolResult;
}

/**
 * Same text the MCP SDK would put into its own error result
 * (`error.message`), plus a machine-readable code and the cost meta.
 */
function errorResultWithCostMeta(
  error: unknown,
  costMeta: CostMeta,
): CallToolResult {
  const message = error instanceof Error ? error.message : String(error);
  const code = asAppError(error)?.code ?? "INTERNAL_ERROR";
  return {
    content: [{ type: "text", text: message }],
    isError: true,
    structuredContent: { error: { code, message }, meta: costMeta },
    _meta: costMeta,
  };
}

export function withDataforseoCostMeta<TArgs, TContext>(
  toolName: string,
  handler: (args: TArgs, context: TContext) => Promise<CallToolResult>,
): (args: TArgs, context: TContext) => Promise<CallToolResult> {
  return async (args, context) => {
    const outcome = await runWithDataforseoCostLedger(() =>
      handler(args, context),
    );
    const costMeta = buildCostMeta(toolName, outcome.cost);
    if (outcome.ok) return withCostMeta(outcome.value, costMeta);

    // The SDK needs this one to surface as a protocol error, not a tool error.
    // .code is a plain `number` on ProtocolError, so compare against the enum
    // member's numeric value rather than the enum type itself.
    if (
      outcome.error instanceof ProtocolError &&
      outcome.error.code === (ProtocolErrorCode.UrlElicitationRequired as number)
    ) {
      throw outcome.error;
    }
    return errorResultWithCostMeta(outcome.error, costMeta);
  };
}
