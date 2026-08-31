// Production launcher for the Node runtime build (vite.config.node.ts).
// Serves the built server entry with srvx; client assets are served as
// static files (hashed names), everything else — SSR, server functions,
// MCP, auth — falls through to the app handler.
// Usage: node scripts/serve-node.mjs (after `pnpm build:node`).
import path from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "srvx";
import { staticMiddleware } from "srvx/static";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const serverEntry = path.join(root, "dist-node", "server", "entry.js");
const clientDir = path.join(root, "dist-node", "client");

const mod = await import(serverEntry);
const appFetch = mod.default.fetch;

serve({
  port: Number(process.env.PORT ?? 3001),
  middleware: [staticMiddleware({ dir: clientDir })],
  fetch: (request) => appFetch(request),
});

console.log(
  `[openseo-node] listening on :${process.env.PORT ?? 3001} (AUTH_MODE=${process.env.AUTH_MODE ?? "<unset>"})`,
);
