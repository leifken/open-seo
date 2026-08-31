import { c as createServerRpc } from "./createServerRpc-CXhnBwFB.js";
import { i as createServerFn, aT as resolveDateRange, G as GscService, aU as GscNotConnectedError, aV as isExpectedGrantFailure } from "../entry.js";
import { r as requireProjectContext } from "./middleware-CwR3-L1M.js";
import { s as searchPerformanceInputSchema, a as searchPerformanceTableInputSchema, b as searchPerformanceTableExportInputSchema } from "./search-performance-DEaTIWHa.js";
import "node:async_hooks";
import "node:crypto";
import "ioredis";
import "node:fs/promises";
import "node:path";
import "node:fs";
import "better-sqlite3";
import "bullmq";
import "postgres";
import "zod";
import "@modelcontextprotocol/client";
import "@modelcontextprotocol/client/validators/cf-worker";
import "@modelcontextprotocol/sdk/types.js";
import "node:diagnostics_channel";
import "jose";
import "drizzle-orm/d1";
import "drizzle-orm/sqlite-core";
import "drizzle-orm";
import "drizzle-orm/postgres-js";
import "drizzle-orm/pg-core";
import "jose/errors";
import "node:os";
import "@better-auth/api-key";
import "posthog-node";
import "@modelcontextprotocol/server";
import "remeda";
import "tldts";
import "srvx";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "robots-parser";
import "fast-xml-parser";
const STRIKING_DISTANCE_MIN_POSITION = 5;
const STRIKING_DISTANCE_MAX_POSITION = 20;
const STRIKING_DISTANCE_ROW_LIMIT = 100;
function sumSearchTotals(rows) {
  let clicks = 0;
  let impressions = 0;
  let weightedPosition = 0;
  for (const row of rows) {
    clicks += row.clicks;
    impressions += row.impressions;
    weightedPosition += row.position * row.impressions;
  }
  return {
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position: impressions > 0 ? weightedPosition / impressions : 0
  };
}
function toDimensionRows(rows) {
  const output = [];
  for (const row of rows) {
    const key = row.keys?.[0];
    if (!key) continue;
    output.push({
      key,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position
    });
  }
  return output;
}
function buildStrikingDistanceRows(rows, limit = STRIKING_DISTANCE_ROW_LIMIT) {
  const topPageByQuery = /* @__PURE__ */ new Map();
  for (const row of rows) {
    const query = row.keys?.[0];
    const page = row.keys?.[1];
    if (!query || !page) continue;
    const current = topPageByQuery.get(query);
    const isBetter = !current || row.position < current.position || row.position === current.position && row.impressions > current.impressions;
    if (!isBetter) continue;
    topPageByQuery.set(query, {
      query,
      page,
      clicks: row.clicks,
      impressions: row.impressions,
      position: row.position
    });
  }
  return Array.from(topPageByQuery.values()).filter(
    (row) => row.position >= STRIKING_DISTANCE_MIN_POSITION && row.position <= STRIKING_DISTANCE_MAX_POSITION
  ).toSorted((a, b) => b.impressions - a.impressions).slice(0, limit);
}
function previousPeriod(startDate, endDate) {
  const dayMs = 24 * 60 * 60 * 1e3;
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  const lengthMs = Math.max(end - start, 0);
  const prevEnd = start - dayMs;
  const prevStart = prevEnd - lengthMs;
  return {
    startDate: formatUtcDate(prevStart),
    endDate: formatUtcDate(prevEnd)
  };
}
function formatUtcDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}
const STRIKING_DISTANCE_FETCH_LIMIT = 1e3;
const DAILY_ROW_LIMIT = 200;
const COUNTRY_ROW_LIMIT = 25;
const EXPORT_ROW_LIMIT = 1e3;
function buildGscFilters(data) {
  const deviceFilters = data.device ? [{
    dimension: "device",
    operator: "equals",
    expression: data.device
  }] : [];
  const filters = data.country ? [...deviceFilters, {
    dimension: "country",
    operator: "equals",
    expression: data.country
  }] : deviceFilters;
  return {
    deviceFilters,
    filters
  };
}
function isExpectedConnectionFailure(error) {
  return error instanceof GscNotConnectedError || isExpectedGrantFailure(error);
}
const getSearchPerformanceReport_createServerFn_handler = createServerRpc({
  id: "a251675043aa688af223c180c37e19f98f6652a33f993dc7d1b14c4ce4ed3589",
  name: "getSearchPerformanceReport",
  filename: "src/serverFunctions/searchPerformance.ts"
}, (opts) => getSearchPerformanceReport.__executeServer(opts));
const getSearchPerformanceReport = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(searchPerformanceInputSchema).handler(getSearchPerformanceReport_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    startDate,
    endDate
  } = resolveDateRange({
    dateRange: data.dateRange
  });
  const prev = previousPeriod(startDate, endDate);
  const projectId = context.projectId;
  const {
    deviceFilters,
    filters
  } = buildGscFilters(data);
  try {
    const [current, previous, queryPages, countries] = await Promise.all([GscService.getPerformance({
      projectId,
      startDate,
      endDate,
      dimensions: ["date"],
      filters,
      rowLimit: DAILY_ROW_LIMIT
    }), GscService.getPerformance({
      projectId,
      startDate: prev.startDate,
      endDate: prev.endDate,
      dimensions: ["date"],
      filters,
      rowLimit: DAILY_ROW_LIMIT
    }), GscService.getPerformance({
      projectId,
      startDate,
      endDate,
      dimensions: ["query", "page"],
      filters,
      rowLimit: STRIKING_DISTANCE_FETCH_LIMIT
    }), GscService.getPerformance({
      projectId,
      startDate,
      endDate,
      dimensions: ["country"],
      filters: deviceFilters,
      rowLimit: COUNTRY_ROW_LIMIT
    })]);
    return {
      connected: true,
      range: {
        startDate,
        endDate,
        prevStartDate: prev.startDate,
        prevEndDate: prev.endDate
      },
      totals: sumSearchTotals(current.rows),
      prevTotals: sumSearchTotals(previous.rows),
      strikingDistance: buildStrikingDistanceRows(queryPages.rows),
      countries: toDimensionRows(countries.rows)
    };
  } catch (error) {
    if (isExpectedConnectionFailure(error)) {
      return {
        connected: false
      };
    }
    throw error;
  }
});
const getSearchPerformanceTable_createServerFn_handler = createServerRpc({
  id: "a4aee3230867065a09c55145cf58c1f5bc0fb9ed2f053bda4ac2d635a4d2bcb4",
  name: "getSearchPerformanceTable",
  filename: "src/serverFunctions/searchPerformance.ts"
}, (opts) => getSearchPerformanceTable.__executeServer(opts));
const getSearchPerformanceTable = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(searchPerformanceTableInputSchema).handler(getSearchPerformanceTable_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    startDate,
    endDate
  } = resolveDateRange({
    dateRange: data.dateRange
  });
  const {
    filters
  } = buildGscFilters(data);
  const offset = (data.page - 1) * data.pageSize;
  try {
    const result = await GscService.getPerformance({
      projectId: context.projectId,
      startDate,
      endDate,
      dimensions: [data.dimension],
      filters,
      // One extra row tells us whether a further page exists.
      rowLimit: data.pageSize + 1,
      startRow: offset
    });
    const fetched = toDimensionRows(result.rows);
    const hasNextPage = fetched.length > data.pageSize;
    const rows = hasNextPage ? fetched.slice(0, data.pageSize) : fetched;
    return {
      connected: true,
      dimension: data.dimension,
      page: data.page,
      pageSize: data.pageSize,
      hasNextPage,
      rows
    };
  } catch (error) {
    if (isExpectedConnectionFailure(error)) {
      return {
        connected: false
      };
    }
    throw error;
  }
});
const exportSearchPerformanceTable_createServerFn_handler = createServerRpc({
  id: "03f6b933adea1749a90a3091b941383771384ee499865ac928e32750bb3b6da1",
  name: "exportSearchPerformanceTable",
  filename: "src/serverFunctions/searchPerformance.ts"
}, (opts) => exportSearchPerformanceTable.__executeServer(opts));
const exportSearchPerformanceTable = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(searchPerformanceTableExportInputSchema).handler(exportSearchPerformanceTable_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    startDate,
    endDate
  } = resolveDateRange({
    dateRange: data.dateRange
  });
  const {
    filters
  } = buildGscFilters(data);
  const result = await GscService.getPerformance({
    projectId: context.projectId,
    startDate,
    endDate,
    dimensions: [data.dimension],
    filters,
    rowLimit: EXPORT_ROW_LIMIT
  });
  return {
    dimension: data.dimension,
    rows: toDimensionRows(result.rows)
  };
});
export {
  exportSearchPerformanceTable_createServerFn_handler,
  getSearchPerformanceReport_createServerFn_handler,
  getSearchPerformanceTable_createServerFn_handler
};
