import { z } from "zod";
import {
  resolveGeoLocations,
  type ResolvedGeoLocation,
} from "@/server/lib/geo-location-resolver";
import { getIsoCountryCode } from "@/shared/keyword-locations";

// LEIFKEN (SEO-5): the one way MCP tools accept a city, district or state.
// A place is a name ("Münster", "Kreis Borken", "Nordrhein-Westfalen",
// "Münster, NRW") or a DataForSEO location code (1004707).

export const placeSchema = z
  .union([z.string().trim().min(1).max(120), z.number().int().positive()])
  .describe(
    'A place: German or English name ("Münster", "Kreis Coesfeld", "Nordrhein-Westfalen", "Münster, NRW" to disambiguate) or a DataForSEO location code (e.g. 1004707). "Kreis"/"Landkreis" selects the district, a plain name the city. resolve_locations shows how a name resolves, free of charge.',
  );

export const countryCodeSchema = z
  .string()
  .regex(/^[a-zA-Z]{2}$/)
  .describe(
    "ISO 3166-1 alpha-2 country the place names belong to (e.g. 'de'). Defaults to the project's country.",
  );

export function resolveCountryIso(
  countryCode: string | undefined,
  project: { locationCode: number },
): string {
  return (countryCode ?? getIsoCountryCode(project.locationCode)).toLowerCase();
}

export async function resolvePlaces(
  places: Array<string | number>,
  countryCode: string | undefined,
  project: { locationCode: number },
): Promise<ResolvedGeoLocation[]> {
  return resolveGeoLocations(places, resolveCountryIso(countryCode, project));
}

/** meta fields every location-scoped tool reports (SEO-5: code in meta). */
export function locationMeta(resolved: ResolvedGeoLocation[]) {
  return {
    locationCodes: resolved.map((location) => location.locationCode),
    locations: resolved.map((location) => ({
      input: location.input,
      locationCode: location.locationCode,
      locationName: location.locationName,
      locationType: location.locationType,
    })),
  };
}

export function describeLocation(location: ResolvedGeoLocation): string {
  return `${location.locationName} (${location.locationType}, ${location.locationCode})`;
}
