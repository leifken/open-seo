import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type * as GscConnectionRepositoryModule from "./GscConnectionRepository";

// The real repository module is loaded after its database dependency is bound
// to this in-memory database. Module-level dependency injection is the reason
// this test needs one dynamic import.
vi.mock("cloudflare:workers", () => ({
  env: { DATABASE_PROVIDER: "d1" },
}));

let client: Client;
let GscConnectionRepository: typeof GscConnectionRepositoryModule.GscConnectionRepository;

beforeAll(async () => {
  client = createClient({ url: "file::memory:" });
  const testDb = drizzle(client);
  vi.doMock("@/db", () => ({ db: testDb }));
  await client.executeMultiple(`
    CREATE TABLE gsc_connections (
      id text PRIMARY KEY,
      project_id text NOT NULL,
      organization_id text NOT NULL,
      site_url text NOT NULL,
      connected_by_user_id text NOT NULL,
      gsc_account_id text,
      connected_account_email text,
      created_at text NOT NULL DEFAULT (current_timestamp),
      updated_at text NOT NULL DEFAULT (current_timestamp)
    );
    CREATE UNIQUE INDEX gsc_connections_project_idx
      ON gsc_connections (project_id);
  `);
  ({ GscConnectionRepository } = await import("./GscConnectionRepository"));
});

afterAll(() => {
  client.close();
});

beforeEach(async () => {
  await client.execute("DELETE FROM gsc_connections");
});

describe("GscConnectionRepository.upsert", () => {
  it("replaces the selected property while keeping one row per project", async () => {
    await GscConnectionRepository.upsert({
      projectId: "project-1",
      organizationId: "organization-1",
      siteUrl: "https://example.com/",
      connectedByUserId: "user-1",
      gscAccountId: "account-1",
      connectedAccountEmail: "first@example.com",
    });

    await GscConnectionRepository.upsert({
      projectId: "project-1",
      organizationId: "organization-1",
      siteUrl: "sc-domain:example.com",
      connectedByUserId: "user-1",
      gscAccountId: "account-1",
      connectedAccountEmail: "first@example.com",
    });

    expect(
      await client.execute(
        "SELECT project_id, site_url FROM gsc_connections WHERE project_id = 'project-1'",
      ),
    ).toMatchObject({
      rows: [
        {
          project_id: "project-1",
          site_url: "sc-domain:example.com",
        },
      ],
    });
  });

  it("does not retain another grant's email when userinfo is unavailable", async () => {
    await GscConnectionRepository.upsert({
      projectId: "project-1",
      organizationId: "organization-1",
      siteUrl: "https://example.com/",
      connectedByUserId: "user-1",
      gscAccountId: "account-1",
      connectedAccountEmail: "first@example.com",
    });

    await GscConnectionRepository.upsert({
      projectId: "project-1",
      organizationId: "organization-1",
      siteUrl: "https://www.example.com/",
      connectedByUserId: "user-2",
      gscAccountId: "account-2",
      connectedAccountEmail: null,
    });

    await expect(
      GscConnectionRepository.getByProjectId("project-1"),
    ).resolves.toMatchObject({
      siteUrl: "https://www.example.com/",
      connectedByUserId: "user-2",
      gscAccountId: "account-2",
      connectedAccountEmail: null,
    });
  });
});
