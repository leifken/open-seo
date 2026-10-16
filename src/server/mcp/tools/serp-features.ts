import { z } from "zod";
import type { SerpLiveItem } from "@/server/lib/dataforseo/serp";
const AI_OVERVIEW_TEXT_LIMIT = 600;

const aiOverviewReferenceSchema = z
  .object({
    source: z.string().nullable().optional(),
    domain: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
  })
  .passthrough();

const aiOverviewItemSchema = z
  .object({
    markdown: z.string().nullable().optional(),
    references: z.array(aiOverviewReferenceSchema).nullable().optional(),
  })
  .passthrough();

type AiOverview =
  | { present: false }
  | {
      present: true;
      text: string;
      sources: Array<{
        domain: string | null;
        url: string | null;
        title: string | null;
      }>;
    };

export function extractAiOverview(items: SerpLiveItem[]): AiOverview {
  const raw = items.find((item) => item.type === "ai_overview");
  if (!raw) return { present: false };
  const parsed = aiOverviewItemSchema.safeParse(raw);
  if (!parsed.success) return { present: false };
  const fullText = parsed.data.markdown ?? "";
  const text =
    fullText.length > AI_OVERVIEW_TEXT_LIMIT
      ? `${fullText.slice(0, AI_OVERVIEW_TEXT_LIMIT)}…`
      : fullText;
  const sources = (parsed.data.references ?? [])
    .map((ref) => ({
      domain: ref.domain ?? null,
      url: ref.url ?? null,
      title: ref.title ?? null,
    }))
    .filter((source) => source.domain !== null || source.url !== null);
  return { present: true, text, sources };
}

const peopleAlsoAskExpandedSchema = z
  .object({
    domain: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
  })
  .passthrough();

const peopleAlsoAskElementSchema = z
  .object({
    title: z.string().nullable().optional(),
    expanded_element: z
      .array(peopleAlsoAskExpandedSchema)
      .nullable()
      .optional(),
  })
  .passthrough();

const peopleAlsoAskItemSchema = z
  .object({
    items: z.array(peopleAlsoAskElementSchema).nullable().optional(),
  })
  .passthrough();

type PeopleAlsoAskQuestion = {
  question: string;
  source: {
    domain: string | null;
    url: string | null;
    title: string | null;
  } | null;
};

export function extractPeopleAlsoAsk(
  items: SerpLiveItem[],
): PeopleAlsoAskQuestion[] {
  const raw = items.find((item) => item.type === "people_also_ask");
  if (!raw) return [];
  const parsed = peopleAlsoAskItemSchema.safeParse(raw);
  if (!parsed.success) return [];
  return (parsed.data.items ?? [])
    .filter((q) => q.title)
    .map((q) => {
      const firstSource = q.expanded_element?.[0];
      return {
        question: q.title ?? "",
        source: firstSource
          ? {
              domain: firstSource.domain ?? null,
              url: firstSource.url ?? null,
              title: firstSource.title ?? null,
            }
          : null,
      };
    });
}

const localPackItemSchema = z
  .object({
    rank_group: z.number().nullable().optional(),
    title: z.string().nullable().optional(),
    domain: z.string().nullable().optional(),
    cid: z.string().nullable().optional(),
    rating: z
      .object({
        value: z.number().nullable().optional(),
        votes_count: z.number().nullable().optional(),
      })
      .passthrough()
      .nullable()
      .optional(),
  })
  .passthrough();

type LocalPackEntry = {
  name: string | null;
  domain: string | null;
  /** LEIFKEN (SEO-5): Google CID, to match the business across tools. */
  cid: string | null;
  rating: number | null;
  ratingCount: number | null;
  rank: number | null;
};

export function extractLocalPack(items: SerpLiveItem[]): LocalPackEntry[] {
  return items
    .filter((item) => item.type === "local_pack")
    .map((raw): LocalPackEntry | null => {
      const parsed = localPackItemSchema.safeParse(raw);
      if (!parsed.success) return null;
      return {
        name: parsed.data.title ?? null,
        domain: parsed.data.domain ?? null,
        cid: parsed.data.cid ?? null,
        rating: parsed.data.rating?.value ?? null,
        ratingCount: parsed.data.rating?.votes_count ?? null,
        rank: parsed.data.rank_group ?? null,
      };
    })
    .filter((entry): entry is LocalPackEntry => entry !== null);
}
