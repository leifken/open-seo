import type { z } from "zod";
import { buildProjectMeta } from "@/server/mcp/context";
import { mcpResponse } from "@/server/mcp/formatters";
import {
  looseObjectOutputSchema,
  optionalMetaOutputSchema,
} from "@/server/mcp/output-schemas";
import { withMcpProjectAuth } from "@/server/mcp/project-auth";
import {
  formatMcpCell,
  formatMcpTable,
  readPath,
  truncatedCell,
  type McpTableColumn,
} from "@/server/mcp/table";
import {
  languageCodeSchema,
  locationCodeSchema,
  projectIdSchema,
} from "@/server/mcp/schemas";
import { resolveMarket } from "@/shared/keyword-locations";
import { RESEARCH_SCOPE_PARAM_DESCRIPTION } from "@/shared/researchScope";
import { getBrandLookup } from "@/server/features/ai-search/services/brandLookup";
import { explorePrompt } from "@/server/features/ai-search/services/promptExplorer";
import {
  brandLookupInputSchema,
  promptExplorerInputSchema,
  PROMPT_EXPLORER_MODELS,
  type BrandLookupResult,
  type PromptExplorerResult,
} from "@/types/schemas/ai-search";

/**
 * Thin MCP wrappers around the AI Search feature's two stateless services
 * (Brand Lookup, Prompt Explorer). No new business logic lives here — both
 * handlers just resolve the project's default market/billing context and
 * hand off to the existing service functions, the same way the app's own
 * server functions in src/serverFunctions/ai-search.ts do.
 *
 * `src/serverFunctions/ai-search.ts` gates both calls behind
 * `assertPaidPlan`, which is a hosted-billing concern
 * (`isHostedServerAuthMode()`): self-hosted deployments pay DataForSEO
 * directly and aren't gated, and this MCP server only ever runs
 * self-hosted, so that check is intentionally not repeated here.
 */

// ---------------------------------------------------------------------------
// get_ai_visibility
// ---------------------------------------------------------------------------

const getAiVisibilityInputSchema = {
  projectId: projectIdSchema,
  query: brandLookupInputSchema.shape.query.describe(
    "Brand name or domain to look up AI visibility for.",
  ),
  competitors: brandLookupInputSchema.shape.competitors.describe(
    "Optional competitor brands/domains to compare Share of Voice against (max 5).",
  ),
  scope: brandLookupInputSchema.shape.scope.describe(
    `${RESEARCH_SCOPE_PARAM_DESCRIPTION} Only applies to domain/URL queries; ignored for brand-keyword queries.`,
  ),
  locationCode: locationCodeSchema.optional(),
  languageCode: languageCodeSchema.optional(),
} as const;

type GetAiVisibilityArgs = z.infer<
  z.ZodObject<typeof getAiVisibilityInputSchema>
>;

const AI_VISIBILITY_PLATFORM_COLUMNS: McpTableColumn<unknown>[] = [
  { header: "platform", value: (row) => readPath(row, "platform") },
  { header: "status", value: (row) => readPath(row, "status") },
  { header: "mentions", value: (row) => readPath(row, "mentions") },
  {
    header: "AI search volume",
    value: (row) => readPath(row, "aiSearchVolume"),
  },
];

const SHARE_OF_VOICE_COLUMNS: McpTableColumn<unknown>[] = [
  { header: "label", value: (row) => readPath(row, "label") },
  { header: "is target", value: (row) => readPath(row, "isTarget") },
  { header: "mentions", value: (row) => readPath(row, "mentions") },
  { header: "share %", value: (row) => readPath(row, "sharePct") },
];

const TOP_SOURCE_COLUMNS: McpTableColumn<unknown>[] = [
  { header: "domain", value: (row) => readPath(row, "domain") },
  { header: "platform", value: (row) => readPath(row, "platform") },
  { header: "mentions", value: (row) => readPath(row, "mentions") },
];

function buildAiVisibilitySummary(result: BrandLookupResult): string {
  const lines: string[] = [
    `AI visibility for ${result.resolvedTarget} (${result.detectedTargetType}${
      result.scope ? `, scope: ${result.scope}` : ""
    }).`,
  ];

  if (!result.hasData) {
    lines.push("No AI-search mentions were found for this target.");
    return lines.join("\n");
  }

  lines.push(
    `Total mentions: ${formatMcpCell(result.totalMentions)}. Total AI search volume: ${formatMcpCell(
      result.totalAiSearchVolume,
    )}.`,
  );
  if (result.aggregatesAreDomainLevel) {
    lines.push(
      "Note: totals, per-platform counts, and Share of Voice are domain-wide — the LLM mentions API has no URL-level targeting. Only the top-sources rows are scoped to the requested path.",
    );
  }

  lines.push("", "Mentions by platform:");
  lines.push(
    formatMcpTable(result.perPlatform, AI_VISIBILITY_PLATFORM_COLUMNS),
  );

  if (result.shareOfVoice) {
    lines.push(
      "",
      `Share of Voice (platforms: ${
        result.shareOfVoice.platforms.join(", ") || "none succeeded"
      }):`,
    );
    lines.push(
      formatMcpTable(result.shareOfVoice.entries, SHARE_OF_VOICE_COLUMNS),
    );
  }

  if (result.topPages.length > 0) {
    lines.push("", "Top sources:");
    lines.push(
      formatMcpTable(result.topPages.slice(0, 10), TOP_SOURCE_COLUMNS),
    );
  }

  return lines.join("\n");
}

export const getAiVisibilityTool = {
  name: "get_ai_visibility",
  config: {
    title: "Get AI visibility",
    description:
      "Look up how often a brand or domain is mentioned across AI answer engines (ChatGPT, Google AI Overview), including per-platform mention counts, AI search volume, top cited sources, and optional Share-of-Voice against up to 5 competitors. Charges DataForSEO credits: this fans out to the LLM Mentions endpoints (aggregated metrics, top pages, mentions search) for each platform, plus one cross-aggregated call per platform when competitors are supplied.",
    inputSchema: getAiVisibilityInputSchema,
    outputSchema: {
      result: looseObjectOutputSchema,
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: true,
      openWorldHint: true,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(async (args: GetAiVisibilityArgs, context) => {
    const { locationCode, languageCode } = resolveMarket(args, context.project);

    const result = await getBrandLookup(
      {
        projectId: args.projectId,
        query: args.query,
        competitors: args.competitors,
        scope: args.scope,
        locationCode,
        languageCode,
      },
      context.billing,
    );

    return mcpResponse({
      text: buildAiVisibilitySummary(result),
      meta: buildProjectMeta(
        context,
        args.projectId,
        `/p/${args.projectId}/brand-lookup`,
      ),
      structuredContent: { result },
    });
  }),
};

// ---------------------------------------------------------------------------
// explore_ai_prompt
// ---------------------------------------------------------------------------

const exploreAiPromptInputSchema = {
  projectId: projectIdSchema,
  prompt: promptExplorerInputSchema.shape.prompt.describe(
    "The prompt to ask each model (1-500 characters).",
  ),
  models: promptExplorerInputSchema.shape.models
    .default([...PROMPT_EXPLORER_MODELS])
    .describe(
      "Which LLMs to ask: chat_gpt, claude, gemini, perplexity (1-4 models). Defaults to all four. Each requested model is a separate paid LLM Responses call.",
    ),
  highlightBrand: promptExplorerInputSchema.shape.highlightBrand.describe(
    "Optional brand name to flag as mentioned/not mentioned in each model's answer and citations.",
  ),
  webSearch: promptExplorerInputSchema.shape.webSearch.describe(
    "Let each model use web search while answering. Defaults to true.",
  ),
  webSearchCountryCode:
    promptExplorerInputSchema.shape.webSearchCountryCode.describe(
      "Two-letter ISO country code for the web-search component of the answer (e.g. 'DE', 'US'). Optional.",
    ),
} as const;

type ExploreAiPromptArgs = z.infer<
  z.ZodObject<typeof exploreAiPromptInputSchema>
>;

const PROMPT_TEXT_PREVIEW_LENGTH = 300;

function buildPromptExplorerSummary(result: PromptExplorerResult): string {
  const lines: string[] = [`Prompt: "${result.prompt}"`];
  if (result.highlightBrand) {
    lines.push(`Highlighting brand: ${result.highlightBrand}`);
  }

  for (const modelResult of result.results) {
    lines.push("");
    if (modelResult.status === "error") {
      lines.push(
        `${modelResult.model}: error (${modelResult.errorCode}) — ${modelResult.message}`,
      );
      continue;
    }

    const mentionNote = result.highlightBrand
      ? `brand mentioned: ${modelResult.brandMentioned ? "yes" : "no"}`
      : null;
    const header = [modelResult.model, mentionNote].filter(Boolean).join(" — ");
    lines.push(`${header}:`);
    lines.push(truncatedCell(PROMPT_TEXT_PREVIEW_LENGTH)(modelResult.text));
  }

  return lines.join("\n");
}

export const exploreAiPromptTool = {
  name: "explore_ai_prompt",
  config: {
    title: "Explore an AI prompt",
    description:
      "Ask one prompt across up to four LLMs (ChatGPT, Claude, Gemini, Perplexity) and compare the answers, citations, and fan-out queries side by side. Charges DataForSEO credits: each requested model is one paid LLM Responses call, so asking all four models costs four calls.",
    inputSchema: exploreAiPromptInputSchema,
    outputSchema: {
      result: looseObjectOutputSchema,
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: true,
      openWorldHint: true,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(async (args: ExploreAiPromptArgs, context) => {
    const result = await explorePrompt(
      {
        projectId: args.projectId,
        prompt: args.prompt,
        models: args.models,
        highlightBrand: args.highlightBrand,
        webSearch: args.webSearch,
        webSearchCountryCode: args.webSearchCountryCode,
      },
      context.billing,
    );

    return mcpResponse({
      text: buildPromptExplorerSummary(result),
      meta: buildProjectMeta(
        context,
        args.projectId,
        `/p/${args.projectId}/prompt-explorer`,
      ),
      structuredContent: { result },
    });
  }),
};
