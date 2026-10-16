import type { LabsKeywordDataItem } from "./labs";
import { z } from "zod";
import { dataforseoPost } from "@/server/lib/dataforseo/core";
import {
  assertOk,
  buildTaskBilling,
  parseTaskItems,
  type DataforseoApiResponse,
} from "@/server/lib/dataforseo/envelope";

const intersectionItemSchema = z.looseObject({
  first_domain_serp_element: z
    .record(z.string(), z.unknown())
    .nullable()
    .optional(),
  second_domain_serp_element: z
    .record(z.string(), z.unknown())
    .nullable()
    .optional(),
});
const keywordDataSchema = z.looseObject({
  keyword: z.string().nullable().optional(),
  keyword_info: z
    .looseObject({
      search_volume: z.number().nullable().optional(),
      cpc: z.number().nullable().optional(),
    })
    .nullable()
    .optional(),
});
const historicalItemSchema = z.looseObject({
  year: z.number().nullable().optional(),
  month: z.number().nullable().optional(),
});
// LEIFKEN (RankMeister SEO-4 Punkt 5): keyword gap. `intersections: false`
// asks DataForSEO for the FULL union of both domains' rankings (not just the
// keywords they share) so a "gap" — target1 not ranking, target2 ranking —
// is computable from first_domain_serp_element/second_domain_serp_element
// being present or null; the MCP tool (get_keyword_gap) does that filtering.
export async function fetchDomainIntersection(input: {
  target1: string;
  target2: string;
  locationCode: number;
  languageCode: string;
  intersections?: boolean;
  limit: number;
  offset?: number;
}): Promise<DataforseoApiResponse<z.infer<typeof intersectionItemSchema>[]>> {
  const response = await dataforseoPost(
    "/v3/dataforseo_labs/google/domain_intersection/live",
    [
      {
        target_1: input.target1,
        target_2: input.target2,
        location_code: input.locationCode,
        language_code: input.languageCode,
        intersections: input.intersections,
        limit: input.limit,
        offset: input.offset,
      },
    ],
  );
  const task = assertOk(response);
  return {
    data: parseTaskItems(
      "fetchDomainIntersection",
      task,
      intersectionItemSchema,
    ),
    billing: buildTaskBilling(task),
  };
}

export async function fetchHistoricalRankOverview(input: {
  target: string;
  locationCode: number;
  languageCode: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<DataforseoApiResponse<z.infer<typeof historicalItemSchema>[]>> {
  const response = await dataforseoPost(
    "/v3/dataforseo_labs/google/historical_rank_overview/live",
    [
      {
        target: input.target,
        location_code: input.locationCode,
        language_code: input.languageCode,
        date_from: input.dateFrom,
        date_to: input.dateTo,
        // DataForSEO's own guidance: always set this to reconcile database
        // changes across months.
        correlate: true,
      },
    ],
  );
  const task = assertOk(response);
  return {
    data: parseTaskItems(
      "fetchHistoricalRankOverview",
      task,
      historicalItemSchema,
    ),
    billing: buildTaskBilling(task),
  };
}

export async function fetchKeywordsForSite(input: {
  target: string;
  locationCode: number;
  languageCode: string;
  includeSubdomains?: boolean;
  limit: number;
  offset?: number;
}): Promise<DataforseoApiResponse<LabsKeywordDataItem[]>> {
  const response = await dataforseoPost(
    "/v3/dataforseo_labs/google/keywords_for_site/live",
    [
      {
        target: input.target,
        location_code: input.locationCode,
        language_code: input.languageCode,
        include_subdomains: input.includeSubdomains,
        limit: input.limit,
        offset: input.offset,
      },
    ],
  );
  const task = assertOk(response);
  return {
    data: parseTaskItems("fetchKeywordsForSite", task, keywordDataSchema),
    billing: buildTaskBilling(task),
  };
}
