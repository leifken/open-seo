import { z } from "zod";
const SEARCH_PERFORMANCE_RANGES = [
  "last_7_days",
  "last_28_days",
  "last_3_months"
];
const GSC_DEVICES = ["DESKTOP", "MOBILE", "TABLET"];
const searchPerformanceFilterShape = {
  projectId: z.string().min(1),
  dateRange: z.enum(SEARCH_PERFORMANCE_RANGES).default("last_28_days"),
  device: z.enum(GSC_DEVICES).optional(),
  // ISO-3166-1 alpha-3, the code GSC returns in `country` dimension keys.
  country: z.string().length(3).transform((value) => value.toLowerCase()).optional()
};
const searchPerformanceInputSchema = z.object(
  searchPerformanceFilterShape
);
const SEARCH_PERFORMANCE_TABLE_DIMENSIONS = ["query", "page"];
const SEARCH_PERFORMANCE_PAGE_SIZES = [25, 50, 100];
const SEARCH_PERFORMANCE_DEFAULT_PAGE_SIZE = 25;
const searchPerformanceTableInputSchema = z.object({
  ...searchPerformanceFilterShape,
  dimension: z.enum(SEARCH_PERFORMANCE_TABLE_DIMENSIONS),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().refine(
    (value) => SEARCH_PERFORMANCE_PAGE_SIZES.includes(value)
  ).default(SEARCH_PERFORMANCE_DEFAULT_PAGE_SIZE)
});
const searchPerformanceTableExportInputSchema = z.object({
  ...searchPerformanceFilterShape,
  dimension: z.enum(SEARCH_PERFORMANCE_TABLE_DIMENSIONS)
});
export {
  GSC_DEVICES as G,
  SEARCH_PERFORMANCE_PAGE_SIZES as S,
  searchPerformanceTableInputSchema as a,
  searchPerformanceTableExportInputSchema as b,
  SEARCH_PERFORMANCE_DEFAULT_PAGE_SIZE as c,
  SEARCH_PERFORMANCE_RANGES as d,
  searchPerformanceInputSchema as s
};
