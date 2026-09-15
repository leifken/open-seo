import { describe, expect, it, vi } from "vitest";
import { pgDb, withPgClient } from "./pg-client";

const mocks = vi.hoisted(() => ({
  postgres: vi.fn(() => ({
    // drizzle-orm/postgres-js registers its parsers on the client at construction.
    options: { parsers: {}, serializers: {} },
    unsafe: vi.fn(),
  })),
}));

vi.mock("postgres", () => ({ default: mocks.postgres }));
vi.mock("cloudflare:workers", () => ({
  env: {
    DATABASE_PROVIDER: "postgres",
    HYPERDRIVE: { connectionString: "postgres://openseo@localhost/openseo" },
  },
}));

describe("node-runtime pg-client", () => {
  it("serves parallel request scopes from one bounded pool per process", async () => {
    await Promise.all(
      Array.from({ length: 50 }, () => withPgClient(async () => pgDb.$client)),
    );

    expect(mocks.postgres).toHaveBeenCalledTimes(1);
    expect(mocks.postgres).toHaveBeenCalledWith(
      "postgres://openseo@localhost/openseo",
      expect.objectContaining({
        max: 20,
        idle_timeout: 30,
        max_lifetime: 1800,
        connect_timeout: 10,
      }),
    );
  });
});
