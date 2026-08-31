// Production launcher for the Node runtime build (vite.config.node.ts).
// Serves the built server entry with srvx; client assets are served as
// static files (hashed names), everything else — SSR, server functions,
// MCP, auth — falls through to the app handler.
// Usage: node scripts/serve-node.mjs (after `pnpm build:node`).
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const serverEntry = path.join(root, "dist-node", "server", "entry.js");
const clientDir = path.join(root, "dist-node", "client");

// Load order matters: the server entry installs the Cloudflare WebSocket/
// Response globals (chat agents), and srvx captures the globals it wraps at
// import time — so the entry must be evaluated BEFORE srvx.
const mod = await import(serverEntry);
const appFetch = mod.default.fetch;
const { serve } = await import("srvx");
const { staticMiddleware } = await import("srvx/static");

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

// partyserver copies agent requests via `new Request(req)`, and undici's
// brand check rejects srvx's own Request class there — normalize /agents/*
// requests into genuine undici Requests before they reach the handler.
function toNativeRequest(request) {
  const headers = new Headers();
  for (const [name, value] of request.headers) headers.set(name, value);
  const init = { method: request.method, headers };
  if (request.method !== "GET" && request.method !== "HEAD" && request.body) {
    init.body = request.body;
    init.duplex = "half";
  }
  return new Request(request.url, init);
}

const server = serve({
  port: Number(process.env.PORT ?? 3001),
  middleware: [staticMiddleware({ dir: clientDir })],
  fetch: async (request) => {
    const isAgentPath = new URL(request.url).pathname.startsWith("/agents/");
    const response = await appFetch(
      isAgentPath ? toNativeRequest(request) : request,
    );
    return germanUi ? injectI18n(response) : response;
  },
});

// --- WebSocket bridge for the chat agents (/agents/*) ---------------------
// The agents SDK speaks its protocol over WebSockets; srvx doesn't handle
// upgrades, so we take them from the raw node:http server. The handshake is
// completed with `ws` first, then a SYNTHETIC request (original headers plus
// upgrade/connection, which proxies strip as hop-by-hop) runs through the
// untouched upstream fetch chain — auth hooks included. The WebSocketPair
// shim in src/node-runtime/cf-websocket-globals.ts picks the parked socket up.
const { WebSocketServer } = await import("ws");
const wss = new WebSocketServer({ noServer: true });
const setPendingSocket = globalThis.__cfSetPendingNodeSocket;

const nodeHttpServer = server.node?.server;
if (nodeHttpServer && typeof setPendingSocket === "function") {
  nodeHttpServer.on("upgrade", (req, socket, head) => {
    if (!req.url?.startsWith("/agents/")) {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (realWs) => {
      const headers = new Headers();
      for (const [name, value] of Object.entries(req.headers)) {
        if (typeof value === "string") headers.set(name, value);
        else if (Array.isArray(value)) headers.set(name, value.join(", "));
      }
      headers.set("upgrade", "websocket");
      headers.set("connection", "Upgrade");
      const proto = headers.get("x-forwarded-proto") ?? "http";
      const host = headers.get("x-forwarded-host") ?? headers.get("host") ?? "localhost";
      const syntheticRequest = new Request(`${proto}://${host}${req.url}`, {
        method: "GET",
        headers,
      });
      setPendingSocket(realWs);
      appFetch(syntheticRequest)
        .then((response) => {
          if (response.status !== 101) {
            console.warn(
              `[ws-bridge] ${req.url} rejected with ${response.status}`,
            );
            realWs.close(4001, `HTTP ${response.status}`);
          }
        })
        .catch((err) => {
          console.error("[ws-bridge] agent upgrade failed:", err);
          realWs.close(1011, "internal error");
        })
        .finally(() => setPendingSocket(null));
    });
  });
  console.log("[openseo-node] websocket bridge armed for /agents/*");
}

console.log(
  `[openseo-node] listening on :${process.env.PORT ?? 3001} (AUTH_MODE=${process.env.AUTH_MODE ?? "<unset>"})`,
);
