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

// --- LEIFKEN system/update endpoints (self-host addition) ------------------
// Session-gated via an internal sub-request to the app's own auth. Update
// status compares the RUNNING commit (SOURCE_COMMIT, injected by Coolify)
// against the deploy branch and the upstream repo; install triggers a
// Coolify deploy with a deploy-scoped token.
const UPDATE_REPO = process.env.UPDATE_REPO ?? "leifken/open-seo";
const UPDATE_BRANCH = process.env.UPDATE_BRANCH ?? "node-port";
const UPSTREAM_REPO = process.env.UPSTREAM_REPO ?? "every-app/open-seo";

async function hasSession(request) {
  try {
    const res = await appFetch(
      new Request(new URL("/api/auth/get-session", request.url), {
        headers: { cookie: request.headers.get("cookie") ?? "" },
      }),
    );
    const body = await res.json().catch(() => null);
    return Boolean(body && body.session);
  } catch {
    return false;
  }
}

async function githubJson(url) {
  const res = await fetch(url, {
    headers: { accept: "application/vnd.github+json", "user-agent": "leifken-seo-updater" },
  });
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${url}`);
  return res.json();
}

function mapCommits(list) {
  return (list ?? []).slice(-8).reverse().map((c) => ({
    sha: c.sha,
    message: c.commit?.message ?? "",
    date: c.commit?.committer?.date ?? "",
  }));
}

async function handleUpdateStatus() {
  const running = process.env.SOURCE_COMMIT ?? "";
  let branchAheadBy = 0;
  let branchLatest = [];
  let upstreamBehindBy = 0;
  let upstreamLatest = [];
  if (running) {
    const cmp = await githubJson(
      `https://api.github.com/repos/${UPDATE_REPO}/compare/${running}...${UPDATE_BRANCH}`,
    );
    branchAheadBy = cmp.ahead_by ?? 0;
    branchLatest = mapCommits(cmp.commits);
  }
  const upstreamOwner = UPDATE_REPO.split("/")[0];
  const upstreamCmp = await githubJson(
    `https://api.github.com/repos/${UPSTREAM_REPO}/compare/main...${upstreamOwner}:${UPDATE_REPO.split("/")[1]}:${UPDATE_BRANCH}`,
  );
  upstreamBehindBy = upstreamCmp.behind_by ?? 0;
  if (upstreamBehindBy > 0) {
    const upstreamCommits = await githubJson(
      `https://api.github.com/repos/${UPSTREAM_REPO}/commits?sha=main&per_page=${Math.min(upstreamBehindBy, 8)}`,
    );
    upstreamLatest = (upstreamCommits ?? []).map((c) => ({
      sha: c.sha,
      message: c.commit?.message ?? "",
      date: c.commit?.committer?.date ?? "",
    }));
  }
  return {
    runningCommit: running,
    branchAheadBy,
    branchLatest,
    upstreamBehindBy,
    upstreamLatest,
    deployConfigured: Boolean(
      process.env.COOLIFY_DEPLOY_TOKEN && process.env.COOLIFY_APP_UUID,
    ),
  };
}

async function handleUpdateDeploy() {
  const token = process.env.COOLIFY_DEPLOY_TOKEN;
  const uuid = process.env.COOLIFY_APP_UUID;
  const apiUrl = process.env.COOLIFY_API_URL ?? "http://coolify:8000/api/v1";
  if (!token || !uuid) {
    return { ok: false, status: 400, error: "Installations-Schlüssel ist nicht konfiguriert." };
  }
  // The server no longer builds: Coolify pulls ghcr.io/leifken/open-seo:sha-<commit>,
  // built by .github/workflows/image.yml. Only deploy once that image exists,
  // otherwise the pull fails (the running container would stay, but the update would not land).
  try {
    const branch = await githubJson(
      `https://api.github.com/repos/${UPDATE_REPO}/branches/${UPDATE_BRANCH}`,
    );
    const sha = branch?.commit?.sha ?? "";
    const runs = await githubJson(
      `https://api.github.com/repos/${UPDATE_REPO}/actions/workflows/image.yml/runs?head_sha=${sha}&per_page=1`,
    );
    const run = runs?.workflow_runs?.[0];
    if (!run || run.status !== "completed" || run.conclusion !== "success") {
      return {
        ok: false,
        status: 409,
        error: `Das Image für ${sha.slice(0, 7)} ist noch nicht fertig (${run ? `${run.status}/${run.conclusion ?? "läuft"}` : "kein Build gefunden"}). Bitte in einigen Minuten erneut.`,
      };
    }
  } catch (error) {
    return { ok: false, status: 502, error: `Image-Prüfung bei GitHub fehlgeschlagen: ${String(error)}` };
  }
  const res = await fetch(`${apiUrl}/deploy?uuid=${uuid}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    return { ok: false, status: 502, error: `Coolify antwortete mit ${res.status}.` };
  }
  return { ok: true, status: 200 };
}

// Profile pictures (see node-runtime/avatar-store.ts). Served to signed-in
// users only; the key is a hash, so it carries no personal data itself.
async function handleAvatar(request, pathname) {
  if (!(await hasSession(request))) {
    return new Response(null, { status: 401 });
  }
  const readAvatar = mod.readAvatar;
  if (!readAvatar) return new Response(null, { status: 404 });
  const stored = readAvatar(pathname.slice("/api/leifken/avatar/".length));
  if (!stored) return new Response(null, { status: 404 });
  return new Response(stored.body, {
    headers: {
      "content-type": stored.contentType,
      "cache-control": "private, max-age=300",
    },
  });
}

async function handleLeifkenApi(request, pathname) {
  if (pathname.startsWith("/api/leifken/avatar/")) {
    return handleAvatar(request, pathname);
  }
  if (!(await hasSession(request))) {
    return Response.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  try {
    if (pathname === "/api/leifken/update-status") {
      return Response.json(await handleUpdateStatus());
    }
    if (pathname === "/api/leifken/update-deploy" && request.method === "POST") {
      const result = await handleUpdateDeploy();
      return Response.json(
        result.ok ? { started: true } : { error: result.error },
        { status: result.status },
      );
    }
  } catch (err) {
    console.error("[leifken-api] failed:", err);
    return Response.json({ error: "Interner Fehler." }, { status: 500 });
  }
  return Response.json({ error: "Unbekannter Endpunkt." }, { status: 404 });
}

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
    const pathname = new URL(request.url).pathname;
    if (pathname.startsWith("/api/leifken/")) {
      return handleLeifkenApi(request, pathname);
    }
    const isAgentPath = pathname.startsWith("/agents/");
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
