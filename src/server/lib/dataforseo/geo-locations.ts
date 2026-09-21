import { z } from "zod";
import { serpApi } from "@/server/lib/dataforseo/core";
import { assertOk } from "@/server/lib/dataforseo/envelope";
import type { GeoLocation } from "@/server/lib/geo-location-resolver";

// LEIFKEN (SEO-5): the full Google geotarget list of one country, as the
// location resolver needs it. Same free endpoint as serp-locations.ts
// (GET /v3/serp/google/locations/{iso}, cost 0), but it keeps the types the
// local market tools resolve against — including State (Bundesland) and
// District (Kreis), which the UI location picker deliberately leaves out.
// Verified 21.09.2026: the SERP and the Google Ads location lists for "de"
// are identical (14,547 entries, same codes), so one list serves the SERP,
// Maps and Google Ads search volume endpoints.

// Postal codes (8,074 of the German entries), airports and universities are
// never what a local market question means; dropping them keeps the cached
// list at roughly 6,500 German rows.
const RESOLVABLE_LOCATION_TYPES = new Set([
  "Country",
  "State",
  "Region",
  "District",
  "County",
  "DMA Region",
  "City",
  "Municipality",
  "Neighborhood",
]);

const locationItemSchema = z.object({
  location_code: z.number(),
  location_name: z.string(),
  location_type: z.string().nullable().optional(),
});

/** Free ($0) at DataForSEO, so it returns plain data, no billing envelope. */
export async function fetchGeoLocationsForCountry(
  countryIso: string,
): Promise<GeoLocation[]> {
  const response = await serpApi().googleLocationsCountry(
    countryIso.toLowerCase(),
  );
  const task = assertOk(response);
  return (task.result ?? [])
    .map((item) => locationItemSchema.safeParse(item))
    .flatMap((parsed) => (parsed.success ? [parsed.data] : []))
    .filter((item) => RESOLVABLE_LOCATION_TYPES.has(item.location_type ?? ""))
    .map((item) => ({
      code: item.location_code,
      name: item.location_name,
      type: item.location_type ?? "",
    }));
}
