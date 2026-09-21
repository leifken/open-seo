import { z } from "zod";
import { createDataforseoClient } from "@/server/lib/dataforseo";
import { buildProjectMeta } from "@/server/mcp/context";
import { mcpResponse } from "@/server/mcp/formatters";
import {
  looseObjectOutputSchema,
  optionalMetaOutputSchema,
} from "@/server/mcp/output-schemas";
import { withMcpProjectAuth } from "@/server/mcp/project-auth";
import {
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

/**
 * Thin MCP wrappers around two real-browser AI-answer scrapers
 * (RankMeister SEO-4 Punkt 5 "LLM Scraper für ChatGPT und Gemini mit Ort und
 * Sprache"). See the file-level note in
 * src/server/lib/dataforseo/llm-scraper.ts for why the "Gemini" tool below
 * calls Google's AI Mode rather than a dedicated Gemini scraper — DataForSEO
 * does not offer one, and Gemini's own llm_responses endpoint rejects
 * location targeting. No business logic here, same as ai-visibility-tools.ts.
 */

const ANSWER_TEXT_PREVIEW_LENGTH = 1500;

// ---------------------------------------------------------------------------
// get_chatgpt_answer
// ---------------------------------------------------------------------------

const getChatGptAnswerInputSchema = {
  projectId: projectIdSchema,
  query: z
    .string()
    .min(1)
    .max(700)
    .describe("The question or search phrase to send to ChatGPT."),
  locationCode: locationCodeSchema.optional(),
  languageCode: languageCodeSchema.optional(),
  forceWebSearch: z
    .boolean()
    .optional()
    .describe(
      "Ask ChatGPT to use web search. Defaults to false. Note: even when true, DataForSEO does not guarantee web sources are cited in the answer.",
    ),
} as const;

type GetChatGptAnswerArgs = z.infer<
  z.ZodObject<typeof getChatGptAnswerInputSchema>
>;

const CHATGPT_SOURCE_COLUMNS: McpTableColumn<unknown>[] = [
  { header: "title", value: (row) => readPath(row, "title") },
  { header: "domain", value: (row) => readPath(row, "domain") },
  { header: "url", value: (row) => readPath(row, "url") },
];

export const getChatGptAnswerTool = {
  name: "get_chatgpt_answer",
  config: {
    title: "Get ChatGPT answer",
    description:
      "Scrapes a real chatgpt.com answer for one query, with location and language control (DataForSEO endpoint ai_optimization/chat_gpt/llm_scraper/live/advanced — a genuine browser scrape, not the LLM Responses API). Returns the answer markdown, cited/considered sources, fan-out queries, and any brand entities ChatGPT mentioned. Use it to see exactly what a local user asking this in ChatGPT would see. Charges DataForSEO credits.",
    inputSchema: getChatGptAnswerInputSchema,
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
  handler: withMcpProjectAuth(async (args: GetChatGptAnswerArgs, context) => {
    const { locationCode, languageCode } = resolveMarket(args, context.project);
    const client = createDataforseoClient(context.billing);
    const result = await client.aiSearch.chatGptScrape({
      keyword: args.query,
      locationCode,
      languageCode,
      forceWebSearch: args.forceWebSearch,
    });

    const brandNames = (result.brand_entities ?? [])
      .map((entity) => entity.title)
      .filter((title): title is string => typeof title === "string");

    const lines = [
      `ChatGPT answer for "${args.query}" (location ${result.location_code ?? locationCode}, language ${result.language_code ?? languageCode}${result.model ? `, model ${result.model}` : ""}).`,
    ];
    lines.push(
      "",
      result.markdown
        ? truncatedCell(ANSWER_TEXT_PREVIEW_LENGTH)(result.markdown)
        : "(no answer text returned)",
    );
    if (brandNames.length > 0) {
      lines.push("", `Brands mentioned: ${brandNames.join(", ")}`);
    }
    if (result.sources && result.sources.length > 0) {
      lines.push(
        "",
        "Sources:",
        formatMcpTable(result.sources, CHATGPT_SOURCE_COLUMNS),
      );
    }
    if (result.check_url) lines.push("", `check_url: ${result.check_url}`);

    return mcpResponse({
      text: lines.join("\n"),
      meta: buildProjectMeta(
        context,
        args.projectId,
        `/p/${args.projectId}/prompt-explorer`,
      ),
      structuredContent: { result },
    });
  }),
};

// ---------------------------------------------------------------------------
// get_gemini_ai_answer
// ---------------------------------------------------------------------------

const getGeminiAiAnswerInputSchema = {
  projectId: projectIdSchema,
  query: z
    .string()
    .min(1)
    .max(700)
    .describe("The question or search phrase to run through Google AI Mode."),
  locationCode: locationCodeSchema.optional(),
  languageCode: languageCodeSchema.optional(),
  device: z
    .enum(["desktop", "mobile"])
    .optional()
    .describe(
      "Device the AI Mode result is rendered for. Defaults to desktop.",
    ),
} as const;

type GetGeminiAiAnswerArgs = z.infer<
  z.ZodObject<typeof getGeminiAiAnswerInputSchema>
>;

const AI_MODE_REFERENCE_COLUMNS: McpTableColumn<unknown>[] = [
  { header: "title", value: (row) => readPath(row, "title") },
  { header: "domain", value: (row) => readPath(row, "domain") },
  { header: "url", value: (row) => readPath(row, "url") },
];

export const getGeminiAiAnswerTool = {
  name: "get_gemini_ai_answer",
  config: {
    title: "Get Gemini (Google AI Mode) answer",
    description:
      "Scrapes a real Google AI Mode answer (DataForSEO endpoint serp/google/ai_mode/live/advanced) with location and language control. IMPORTANT: this is the closest real substitute for a 'Gemini scraper' — DataForSEO has no dedicated browser scraper for the standalone Gemini app, and Gemini's own llm_responses API rejects location targeting entirely. AI Mode is Google Search's Gemini-powered answer surface and is location/language accurate; it is not literally gemini.google.com. Returns the answer markdown and its cited references. Charges DataForSEO credits.",
    inputSchema: getGeminiAiAnswerInputSchema,
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
  handler: withMcpProjectAuth(async (args: GetGeminiAiAnswerArgs, context) => {
    const { locationCode, languageCode } = resolveMarket(args, context.project);
    const client = createDataforseoClient(context.billing);
    const result = await client.aiSearch.googleAiModeScrape({
      keyword: args.query,
      locationCode,
      languageCode,
      device: args.device,
    });

    const overview = result.items?.[0];
    const lines = [
      `Google AI Mode answer for "${args.query}" (location ${result.location_code ?? locationCode}, language ${result.language_code ?? languageCode}).`,
    ];
    if (!overview) {
      lines.push(
        "",
        "No AI Mode answer was shown for this query in this market.",
      );
    } else {
      lines.push(
        "",
        overview.markdown
          ? truncatedCell(ANSWER_TEXT_PREVIEW_LENGTH)(overview.markdown)
          : "(no answer text returned)",
      );
      if (overview.references && overview.references.length > 0) {
        lines.push(
          "",
          "References:",
          formatMcpTable(overview.references, AI_MODE_REFERENCE_COLUMNS),
        );
      }
    }
    if (result.check_url) lines.push("", `check_url: ${result.check_url}`);

    return mcpResponse({
      text: lines.join("\n"),
      meta: buildProjectMeta(
        context,
        args.projectId,
        `/p/${args.projectId}/prompt-explorer`,
      ),
      structuredContent: { result },
    });
  }),
};
