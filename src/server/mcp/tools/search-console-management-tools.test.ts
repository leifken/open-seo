import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/server/lib/errors";
import {
  connectSearchConsolePropertyTool,
  getSearchConsoleConnectionTool,
  listSearchConsolePropertiesTool,
} from "./search-console-tools";
import { makeToolContext } from "./tool-test-support";

const mocks = vi.hoisted(() => ({
  getProjectForOrganization: vi.fn(),
  listSitesForOrganizationWithGrantStatus: vi.fn(),
  setSite: vi.fn(),
  getConnection: vi.fn(),
}));

vi.mock("cloudflare:workers", () => ({ env: {} }));
vi.mock("@/server/features/google/oauth-config", () => ({
  hasSelfHostedGoogleOAuthConfig: vi.fn(),
}));
vi.mock("@/server/lib/runtime-env", () => ({
  isHostedServerAuthMode: vi.fn(),
}));
vi.mock("@/server/features/projects/services/ProjectService", () => ({
  ProjectService: {
    getProjectForOrganization: mocks.getProjectForOrganization,
  },
}));
vi.mock("@/server/features/gsc/services/GscService", () => ({
  GscService: {
    listSitesForOrganizationWithGrantStatus:
      mocks.listSitesForOrganizationWithGrantStatus,
    setSite: mocks.setSite,
    getConnection: mocks.getConnection,
  },
}));

const toolContext = makeToolContext();

// Google Search Console API `sites.list` response envelope and SiteEntry fields:
// https://developers.google.com/webmaster-tools/v1/sites/list#response
const sitesListResponse = {
  siteEntry: [
    { siteUrl: "sc-domain:example.com", permissionLevel: "siteOwner" },
    { siteUrl: "https://example.com/", permissionLevel: "siteFullUser" },
    {
      siteUrl: "https://www.example.com/",
      permissionLevel: "siteRestrictedUser",
    },
    {
      siteUrl: "http://example.com/",
      permissionLevel: "siteUnverifiedUser",
    },
    { siteUrl: "sc-domain:other.test", permissionLevel: "siteOwner" },
  ],
};

type Site = (typeof sitesListResponse.siteEntry)[number];

function organizationSiteList(sites: Site[] = sitesListResponse.siteEntry) {
  return {
    accounts: [
      {
        userId: "gsc_owner",
        accountId: "google_sub_1",
        email: "search-console@example.com",
        requiresReconnect: false,
        sites,
      },
    ],
  };
}

function connect(siteUrl?: string) {
  return connectSearchConsolePropertyTool.handler(
    { projectId: "project_1", siteUrl },
    toolContext,
  );
}

beforeEach(() => {
  mocks.getProjectForOrganization.mockResolvedValue({
    id: "project_1",
    domain: "example.com",
    locationCode: 2840,
    languageCode: "en",
  });
  mocks.listSitesForOrganizationWithGrantStatus.mockResolvedValue(
    organizationSiteList(),
  );
  mocks.setSite.mockImplementation(async (input: { siteUrl: string }) => ({
    siteUrl: input.siteUrl,
  }));
  mocks.getConnection.mockResolvedValue(null);
});

describe("list_search_console_properties", () => {
  it("lists literal properties with permission and verification state", async () => {
    const result = await listSearchConsolePropertiesTool.handler(
      {},
      toolContext,
    );

    expect(mocks.listSitesForOrganizationWithGrantStatus).toHaveBeenCalledWith(
      "org_123",
    );
    expect(result.structuredContent).toMatchObject({
      ok: true,
      status: "verfuegbar",
      properties: [
        {
          siteUrl: "sc-domain:example.com",
          permissionLevel: "siteOwner",
          verified: true,
        },
        {
          siteUrl: "https://example.com/",
          permissionLevel: "siteFullUser",
          verified: true,
        },
        {
          siteUrl: "https://www.example.com/",
          permissionLevel: "siteRestrictedUser",
          verified: true,
        },
        {
          siteUrl: "http://example.com/",
          permissionLevel: "siteUnverifiedUser",
          verified: false,
        },
        {
          siteUrl: "sc-domain:other.test",
          permissionLevel: "siteOwner",
          verified: true,
        },
      ],
    });
  });

  it("returns keine_google_freigabe without an MCP error", async () => {
    mocks.listSitesForOrganizationWithGrantStatus.mockResolvedValue({
      accounts: [],
    });

    const result = await listSearchConsolePropertiesTool.handler(
      {},
      toolContext,
    );

    expect(result.isError).not.toBe(true);
    expect(result.structuredContent).toEqual({
      ok: false,
      status: "keine_google_freigabe",
      properties: [],
    });
  });
});

describe("connect_search_console_property", () => {
  it("automatically prefers the verified domain property", async () => {
    const result = await connect();

    expect(mocks.setSite).toHaveBeenCalledWith({
      projectId: "project_1",
      organizationId: "org_123",
      siteUrl: "sc-domain:example.com",
      accountId: "google_sub_1",
      userId: "gsc_owner",
    });
    expect(result.structuredContent).toMatchObject({
      status: "verbunden",
      siteUrl: "sc-domain:example.com",
      permissionLevel: "siteOwner",
    });
  });

  it("accepts www and prefers HTTPS over HTTP", async () => {
    mocks.listSitesForOrganizationWithGrantStatus.mockResolvedValue(
      organizationSiteList([
        { siteUrl: "http://example.com/", permissionLevel: "siteOwner" },
        {
          siteUrl: "https://www.example.com/",
          permissionLevel: "siteFullUser",
        },
      ]),
    );

    const result = await connect();

    expect(mocks.setSite).toHaveBeenCalledWith(
      expect.objectContaining({ siteUrl: "https://www.example.com/" }),
    );
    expect(result.structuredContent).toMatchObject({
      status: "verbunden",
      siteUrl: "https://www.example.com/",
    });
  });

  it("does not connect an unverified property", async () => {
    mocks.listSitesForOrganizationWithGrantStatus.mockResolvedValue(
      organizationSiteList([
        {
          siteUrl: "https://example.com/",
          permissionLevel: "siteUnverifiedUser",
        },
      ]),
    );

    const result = await connect();

    expect(mocks.setSite).not.toHaveBeenCalled();
    expect(result.structuredContent).toMatchObject({
      status: "keine_passende_property",
      seenDomains: ["example.com"],
    });
  });

  it("never connects an explicit property from another domain", async () => {
    const result = await connect("sc-domain:other.test");

    expect(mocks.setSite).not.toHaveBeenCalled();
    expect(result.structuredContent).toMatchObject({
      status: "keine_passende_property",
      seenDomains: ["example.com", "www.example.com", "other.test"],
    });
  });

  it("returns keine_google_freigabe without writing", async () => {
    mocks.listSitesForOrganizationWithGrantStatus.mockResolvedValue({
      accounts: [],
    });

    const result = await connect();

    expect(result.isError).not.toBe(true);
    expect(result.structuredContent).toMatchObject({
      status: "keine_google_freigabe",
    });
    expect(mocks.setSite).not.toHaveBeenCalled();
  });

  it("returns projekt_unbekannt before listing properties", async () => {
    mocks.getProjectForOrganization.mockResolvedValue(null);

    const result = await connect();

    expect(result.structuredContent).toMatchObject({
      ok: false,
      status: "projekt_unbekannt",
    });
    expect(
      mocks.listSitesForOrganizationWithGrantStatus,
    ).not.toHaveBeenCalled();
  });

  it("switches to either exact URL property", async () => {
    const first = await connect("https://example.com/");
    const second = await connect("https://www.example.com/");

    expect(mocks.setSite).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ siteUrl: "https://example.com/" }),
    );
    expect(mocks.setSite).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ siteUrl: "https://www.example.com/" }),
    );
    expect(first.structuredContent).toMatchObject({
      siteUrl: "https://example.com/",
    });
    expect(second.structuredContent).toMatchObject({
      siteUrl: "https://www.example.com/",
    });
  });

  it("handles a property lost between listing and writing", async () => {
    mocks.setSite.mockRejectedValue(new AppError("FORBIDDEN"));

    const result = await connect();

    expect(result.structuredContent).toMatchObject({
      ok: false,
      status: "keine_passende_property",
    });
  });
});

describe("get_search_console_connection", () => {
  it("reports property, connection time, and account address", async () => {
    mocks.getConnection.mockResolvedValue({
      siteUrl: "sc-domain:example.com",
      createdAt: "2026-10-07T10:00:00.000Z",
      connectedAccountEmail: "search-console@example.com",
    });

    const result = await getSearchConsoleConnectionTool.handler(
      { projectId: "project_1" },
      toolContext,
    );

    expect(result.structuredContent).toMatchObject({
      status: "verbunden",
      connected: true,
      siteUrl: "sc-domain:example.com",
      connectedAt: "2026-10-07T10:00:00.000Z",
      connectedAccountEmail: "search-console@example.com",
    });
  });

  it("reports an unconnected project without an MCP error", async () => {
    const result = await getSearchConsoleConnectionTool.handler(
      { projectId: "project_1" },
      toolContext,
    );

    expect(result.isError).not.toBe(true);
    expect(result.structuredContent).toMatchObject({
      status: "nicht_verbunden",
      connected: false,
      siteUrl: null,
      connectedAt: null,
      connectedAccountEmail: null,
    });
  });
});
