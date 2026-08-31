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

// German UI (APP_LOCALE=de): inject the runtime translation layer into every
// HTML response. The upstream code stays English — the dictionary in
// public/leifken-i18n-de.json does the translating client-side, so community
// updates never conflict and new strings just render English until the
// dictionary catches up.
const I18N_SNIPPET = '<script defer src="/leifken-i18n.js"></script>';

function injectI18n(response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html") || !response.body) return response;

  // Stream-safe: buffer only until the first <head> tag (arrives in the
  // first chunk of the SSR stream), inject right after it, then pass through.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffered = "";
  let injected = false;
  const transform = new TransformStream({
    transform(chunk, controller) {
      if (injected) {
        controller.enqueue(chunk);
        return;
      }
      buffered += decoder.decode(chunk, { stream: true });
      const headEnd = buffered.indexOf("<head>");
      if (headEnd !== -1) {
        const at = headEnd + "<head>".length;
        controller.enqueue(
          encoder.encode(buffered.slice(0, at) + I18N_SNIPPET + buffered.slice(at)),
        );
        buffered = "";
        injected = true;
      } else if (buffered.length > 65536) {
        controller.enqueue(encoder.encode(buffered));
        buffered = "";
        injected = true;
      }
    },
    flush(controller) {
      if (buffered) controller.enqueue(encoder.encode(buffered));
    },
  });
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(response.body.pipeThrough(transform), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

const germanUi = process.env.APP_LOCALE === "de";

serve({
  port: Number(process.env.PORT ?? 3001),
  middleware: [staticMiddleware({ dir: clientDir })],
  fetch: async (request) => {
    const response = await appFetch(request);
    return germanUi ? injectI18n(response) : response;
  },
});

console.log(
  `[openseo-node] listening on :${process.env.PORT ?? 3001} (AUTH_MODE=${process.env.AUTH_MODE ?? "<unset>"})`,
);
