import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearGeoLocationMemoryCache,
  loadGeoLocations,
  matchGeoLocation,
  resolveGeoLocations,
  type GeoLocation,
} from "./geo-location-resolver";

const mocks = vi.hoisted(() => ({
  fetchGeoLocationsForCountry: vi.fn(),
  kv: new Map<string, string>(),
}));

vi.mock("cloudflare:workers", () => ({
  env: {
    KV: {
      get: (key: string) => {
        const value = mocks.kv.get(key);
        return Promise.resolve(value == null ? null : JSON.parse(value));
      },
      put: (key: string, value: string) => {
        mocks.kv.set(key, value);
        return Promise.resolve();
      },
    },
  },
}));

vi.mock("@/server/lib/dataforseo", () => ({
  fetchGeoLocationsForCountry: mocks.fetchGeoLocationsForCountry,
}));

// Real entries from GET /v3/serp/google/locations/de (21.09.2026).
const DE: GeoLocation[] = [
  { code: 2276, name: "Germany", type: "Country" },
  { code: 20235, name: "North Rhine-Westphalia,Germany", type: "State" },
  { code: 20234, name: "Lower Saxony,Germany", type: "State" },
  { code: 20231, name: "Hessen,Germany", type: "State" },
  {
    code: 1004707,
    name: "Munster,North Rhine-Westphalia,Germany",
    type: "City",
  },
  { code: 9048583, name: "Munster,Lower Saxony,Germany", type: "City" },
  { code: 9048584, name: "Munster,Hessen,Germany", type: "City" },
  {
    code: 1004599,
    name: "Borken,Borken,North Rhine-Westphalia,Germany",
    type: "City",
  },
  {
    code: 9197391,
    name: "Borken,Borken,North Rhine-Westphalia,Germany",
    type: "Municipality",
  },
  {
    code: 9117068,
    name: "Borken,North Rhine-Westphalia,Germany",
    type: "District",
  },
  { code: 9208054, name: "Borken,Hessen,Germany", type: "City" },
  {
    code: 1004606,
    name: "Coesfeld,Coesfeld,North Rhine-Westphalia,Germany",
    type: "City",
  },
  {
    code: 9117095,
    name: "Coesfeld,North Rhine-Westphalia,Germany",
    type: "District",
  },
  {
    code: 9048619,
    name: "Nottuln,Nottuln,North Rhine-Westphalia,Germany",
    type: "City",
  },
  {
    code: 9219165,
    name: "Nottuln,North Rhine-Westphalia,Germany",
    type: "Municipality",
  },
  {
    code: 1004613,
    name: "Dulmen,North Rhine-Westphalia,Germany",
    type: "City",
  },
  {
    code: 1004607,
    name: "Cologne,North Rhine-Westphalia,Germany",
    type: "City",
  },
  {
    code: 9117598,
    name: "Rhein-Erft District,North Rhine-Westphalia,Germany",
    type: "District",
  },
  { code: 1004507, name: "Hanover,Lower Saxony,Germany", type: "City" },
  {
    code: 9116499,
    name: "Hanover Region,Lower Saxony,Germany",
    type: "District",
  },
];

beforeEach(() => {
  mocks.kv.clear();
  clearGeoLocationMemoryCache();
  mocks.fetchGeoLocationsForCountry.mockResolvedValue(DE);
});

describe("matchGeoLocation", () => {
  it.each([
    ["Münster", 1004707],
    ["Dülmen", 1004613],
    ["Coesfeld", 1004606],
    ["Kreis Coesfeld", 9117095],
    ["Landkreis Borken", 9117068],
    ["Borken", 1004599],
    ["Nottuln", 9048619],
    ["Nordrhein-Westfalen", 20235],
    ["NRW", 20235],
    ["Köln", 1004607],
    ["Rhein-Erft-Kreis", 9117598],
    ["Region Hannover", 9116499],
    ["Münster, Niedersachsen", 9048583],
    ["Borken, Hessen", 9208054],
    ["Deutschland", 2276],
    ["1004707", 1004707],
    [9117068, 9117068],
  ])("resolves %s to %i", (input, code) => {
    expect(matchGeoLocation(input, DE).locationCode).toBe(code);
  });

  it("names the other places an ambiguous name could mean", () => {
    expect(matchGeoLocation("Münster", DE).alternatives).toEqual([
      expect.objectContaining({ locationCode: 9048583 }),
      expect.objectContaining({ locationCode: 9048584 }),
    ]);
  });

  it("passes an unknown numeric code through instead of guessing", () => {
    expect(matchGeoLocation(48301, DE)).toMatchObject({
      locationCode: 48301,
      locationType: "unknown",
    });
  });

  it("rejects an unknown name with suggestions", () => {
    expect(() => matchGeoLocation("Münsterland-Nord", DE)).toThrow(
      /not found\. Similar: Munster,North Rhine-Westphalia,Germany/,
    );
    expect(() => matchGeoLocation("Kreis Nottuln", DE)).toThrow(/not found/);
  });
});

describe("loadGeoLocations", () => {
  it("fetches once, then serves memory and the 30-day cache; refresh re-reads", async () => {
    expect((await loadGeoLocations("DE")).source).toBe("dataforseo");
    expect((await loadGeoLocations("de")).source).toBe("memory");
    clearGeoLocationMemoryCache();
    expect((await loadGeoLocations("de")).source).toBe("cache");
    expect(mocks.fetchGeoLocationsForCountry).toHaveBeenCalledTimes(1);

    await loadGeoLocations("de", { refresh: true });
    expect(mocks.fetchGeoLocationsForCountry).toHaveBeenCalledTimes(2);
  });

  it("resolves codes alone without loading the list", async () => {
    await resolveGeoLocations([1004707, "9117095"], "de");
    expect(mocks.fetchGeoLocationsForCountry).not.toHaveBeenCalled();
  });
});
