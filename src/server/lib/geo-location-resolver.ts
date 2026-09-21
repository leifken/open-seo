import { env } from "cloudflare:workers";
import { z } from "zod";
import { fetchGeoLocationsForCountry } from "@/server/lib/dataforseo";
import { AppError } from "@/server/lib/errors";

// LEIFKEN (SEO-5): turns place names a person would type ("Münster",
// "Kreis Borken", "Nordrhein-Westfalen") into DataForSEO location codes.
//
// Source of truth is DataForSEO's own geotarget list for the country (free
// endpoint, see dataforseo/geo-locations.ts). Google's list uses English
// exonyms without diacritics ("Munster,North Rhine-Westphalia,Germany",
// "Cologne", "Bavaria") and types Landkreise as "District", so matching folds
// diacritics, maps the German names that differ, and reads "Kreis"/"Landkreis"
// as a request for a District.
//
// Cache: Redis (the Node runtime's KV shim) for 30 days, plus a short
// in-process copy so a batch of tool calls doesn't re-parse the ~500 KB list.
// Refresh path: resolve_locations with refresh: true (or any caller passing
// { refresh: true }) re-reads the list from DataForSEO and overwrites both.

export type GeoLocation = { code: number; name: string; type: string };

export type ResolvedGeoLocation = {
  /** What the caller asked for, verbatim. */
  input: string;
  locationCode: number;
  locationName: string;
  locationType: string;
  /** Other places the same name could have meant, best first. */
  alternatives?: Array<{
    locationCode: number;
    locationName: string;
    locationType: string;
  }>;
};

const cachedListSchema = z.array(
  z.object({ code: z.number(), name: z.string(), type: z.string() }),
);

const KV_TTL_SECONDS = 30 * 24 * 60 * 60;
const MEMORY_TTL_MS = 6 * 60 * 60 * 1000;
const CACHE_KEY_PREFIX = "geo-locations:v1:";
const MAX_ALTERNATIVES = 5;
const MAX_SUGGESTIONS = 5;

const memory = new Map<string, { loadedAt: number; rows: GeoLocation[] }>();
const inflight = new Map<string, Promise<GeoLocation[]>>();

/** Clears the in-process copy (tests, and the explicit refresh path). */
export function clearGeoLocationMemoryCache() {
  memory.clear();
}

async function fillFromDataforseo(iso: string): Promise<GeoLocation[]> {
  const pending = inflight.get(iso);
  if (pending) return pending;
  const fill = fetchGeoLocationsForCountry(iso)
    .then(async (rows) => {
      if (rows.length === 0) {
        throw new AppError(
          "VALIDATION_ERROR",
          `DataForSEO has no locations for country "${iso}".`,
        );
      }
      await env.KV.put(CACHE_KEY_PREFIX + iso, JSON.stringify(rows), {
        expirationTtl: KV_TTL_SECONDS,
      });
      memory.set(iso, { loadedAt: Date.now(), rows });
      return rows;
    })
    .finally(() => inflight.delete(iso));
  inflight.set(iso, fill);
  return fill;
}

/** The resolvable location list of one country (ISO 3166-1 alpha-2). */
export async function loadGeoLocations(
  countryIso: string,
  options: { refresh?: boolean } = {},
): Promise<{ rows: GeoLocation[]; source: "memory" | "cache" | "dataforseo" }> {
  const iso = countryIso.toLowerCase();
  if (!options.refresh) {
    const hot = memory.get(iso);
    if (hot && Date.now() - hot.loadedAt < MEMORY_TTL_MS) {
      return { rows: hot.rows, source: "memory" };
    }
    const cached = cachedListSchema.safeParse(
      await env.KV.get(CACHE_KEY_PREFIX + iso, { type: "json" }),
    );
    if (cached.success && cached.data.length > 0) {
      memory.set(iso, { loadedAt: Date.now(), rows: cached.data });
      return { rows: cached.data, source: "cache" };
    }
  }
  return { rows: await fillFromDataforseo(iso), source: "dataforseo" };
}

// ---------------------------------------------------------------------------
// Matching (pure, exported for tests)
// ---------------------------------------------------------------------------

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ß/g, "ss")
    .toLowerCase()
    .replace(/[\s\-_/.]+/g, " ")
    .trim();
}

// German names Google lists under a different (English) name. Keys and values
// are folded. Only names that differ after folding diacritics belong here.
const GERMAN_ALIASES: Record<string, string> = {
  "nordrhein westfalen": "north rhine westphalia",
  nrw: "north rhine westphalia",
  bayern: "bavaria",
  niedersachsen: "lower saxony",
  sachsen: "saxony",
  "sachsen anhalt": "saxony anhalt",
  thuringen: "thuringia",
  "rheinland pfalz": "rhineland palatinate",
  deutschland: "germany",
  koln: "cologne",
  munchen: "munich",
  nurnberg: "nuremberg",
  hannover: "hanover",
};

function alias(folded: string): string {
  return GERMAN_ALIASES[folded] ?? folded;
}

type TypeHint = "district" | "city" | "state" | null;

const DISTRICT_TYPES = ["District", "County", "Region"];
const CITY_TYPES = ["City", "Municipality"];
const STATE_TYPES = ["State"];

// Plain names prefer the city: "Coesfeld" is the town, "Kreis Coesfeld" the
// Landkreis. States only win when nothing more local carries the name.
const DEFAULT_TYPE_ORDER = [
  "City",
  "Municipality",
  "District",
  "County",
  "Region",
  "DMA Region",
  "State",
  "Country",
  "Neighborhood",
];

const PREFIX_HINTS: Array<[RegExp, TypeHint]> = [
  [/^(landkreis|kreis|lk|region|stadteregion) /, "district"],
  [/^(stadt|gemeinde) /, "city"],
  [/^(bundesland|land) /, "state"],
];
const DISTRICT_SUFFIX = / (landkreis|kreis|district|region)$/;

function parseQuery(input: string): {
  name: string;
  qualifiers: string[];
  hint: TypeHint;
} {
  const [head = "", ...rest] = input.split(",");
  let name = fold(head);
  let hint: TypeHint = null;
  for (const [pattern, typeHint] of PREFIX_HINTS) {
    if (pattern.test(name)) {
      name = name.replace(pattern, "");
      hint = typeHint;
      break;
    }
  }
  if (DISTRICT_SUFFIX.test(name) && hint === null) {
    // "Rhein-Erft-Kreis" names a District; keep the full name as well as the
    // stem so "Rhein-Neckar-Kreis" (listed verbatim) still matches exactly.
    hint = "district";
  }
  return {
    name: alias(name),
    qualifiers: rest.map((part) => alias(fold(part))).filter(Boolean),
    hint,
  };
}

/** Keys a location answers to: its first name segment, and that segment
 *  without a trailing district word or parenthetical ("Halle (Saale)"). */
function locationKeys(location: GeoLocation): string[] {
  const first = fold(location.name.split(",")[0] ?? "");
  const keys = new Set([first]);
  keys.add(first.replace(DISTRICT_SUFFIX, ""));
  keys.add(
    fold((location.name.split(",")[0] ?? "").replace(/\s*\(.*\)\s*$/, "")),
  );
  return [...keys];
}

function allowedTypes(hint: TypeHint): string[] {
  if (hint === "district") return DISTRICT_TYPES;
  if (hint === "city") return CITY_TYPES;
  if (hint === "state") return STATE_TYPES;
  return DEFAULT_TYPE_ORDER;
}

function toResolved(input: string, location: GeoLocation) {
  return {
    input,
    locationCode: location.code,
    locationName: location.name,
    locationType: location.type,
  };
}

function suggestionsFor(name: string, rows: GeoLocation[]): string[] {
  const stem = name.slice(0, Math.max(3, Math.min(name.length, 5)));
  return rows
    .filter((row) => locationKeys(row).some((key) => key.startsWith(stem)))
    .toSorted(
      (a, b) =>
        DEFAULT_TYPE_ORDER.indexOf(a.type) -
          DEFAULT_TYPE_ORDER.indexOf(b.type) || a.code - b.code,
    )
    .slice(0, MAX_SUGGESTIONS)
    .map((row) => `${row.name} (${row.type}, ${row.code})`);
}

/**
 * Resolves one place name or location code against a country's list. Throws
 * VALIDATION_ERROR with suggestions when nothing matches.
 */
export function matchGeoLocation(
  input: string | number,
  rows: GeoLocation[],
): ResolvedGeoLocation {
  const raw = String(input).trim();
  if (/^\d+$/.test(raw)) {
    const code = Number(raw);
    const known = rows.find((row) => row.code === code);
    // An unknown code is passed through: it may be a valid geotarget of a
    // type this list leaves out (postal code), and DataForSEO rejects a truly
    // invalid one without charging.
    return known
      ? toResolved(raw, known)
      : {
          input: raw,
          locationCode: code,
          locationName: `location_code ${code}`,
          locationType: "unknown",
        };
  }

  const query = parseQuery(raw);
  if (!query.name) {
    throw new AppError("VALIDATION_ERROR", `Empty location "${raw}".`);
  }
  const types = allowedTypes(query.hint);
  const stem = query.name.replace(DISTRICT_SUFFIX, "");
  const candidates = rows
    .filter((row) => types.includes(row.type))
    .filter((row) => {
      const keys = locationKeys(row);
      return keys.includes(query.name) || keys.includes(stem);
    })
    .filter((row) => {
      const folded = fold(row.name);
      return query.qualifiers.every((qualifier) => folded.includes(qualifier));
    })
    .toSorted(
      (a, b) =>
        types.indexOf(a.type) - types.indexOf(b.type) || a.code - b.code,
    );

  const [best, ...others] = candidates;
  if (!best) {
    const suggestions = suggestionsFor(query.name, rows);
    throw new AppError(
      "VALIDATION_ERROR",
      `Location "${raw}" not found.${suggestions.length > 0 ? ` Similar: ${suggestions.join("; ")}.` : ""} Use a German or English place name, "Kreis <name>" for a Landkreis, add ", <Bundesland>" to disambiguate, or pass the numeric location code (resolve_locations lists candidates).`,
    );
  }
  return {
    ...toResolved(raw, best),
    ...(others.length > 0
      ? {
          alternatives: others.slice(0, MAX_ALTERNATIVES).map((row) => ({
            locationCode: row.code,
            locationName: row.name,
            locationType: row.type,
          })),
        }
      : {}),
  };
}

/** Resolves several places in one country, loading the list once. */
export async function resolveGeoLocations(
  inputs: Array<string | number>,
  countryIso: string,
  options: { refresh?: boolean } = {},
): Promise<ResolvedGeoLocation[]> {
  // Pure codes need no list, so a code-only call never touches DataForSEO.
  if (
    !options.refresh &&
    inputs.every((input) => /^\d+$/.test(String(input).trim()))
  ) {
    return inputs.map((input) => matchGeoLocation(input, []));
  }
  const { rows } = await loadGeoLocations(countryIso, options);
  return inputs.map((input) => matchGeoLocation(input, rows));
}
