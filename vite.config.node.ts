// Node-runtime build config for the LEIFKEN self-host port. Mirrors
// vite.config.ts but swaps the Cloudflare Workers runtime for the Node
// compatibility layer in src/node-runtime/ (see its README):
//   - no @cloudflare/vite-plugin, no lean-worker-bundle plugin
//   - `cloudflare:*` virtual modules resolve to the Node shims
//   - the TanStack Start server entry is the Node entry, which delegates to
//     the untouched upstream src/server.ts with a Node-built env.
// Usage: vite build --config vite.config.node.ts / vite dev --config ...
import path from "node:path";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig, loadEnv, type Plugin } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const shim = (file: string) =>
  path.resolve(import.meta.dirname, "src/node-runtime", file);

// Upstream's Postgres client (src/db/pg/client.ts) opens one connection per
// request and relies on Workers reclaiming it — in Node that leaks a
// connection per request. Every import that resolves to that file (`@/db/pg/
// client`, `./pg/client`) is redirected to the pooled shim instead, so the
// upstream file stays untouched. See src/node-runtime/pg-client.ts.
const upstreamPgClient = path.resolve(
  import.meta.dirname,
  "src/db/pg/client.ts",
);
const pooledPgClientPlugin: Plugin = {
  name: "node-runtime-pg-client",
  enforce: "pre",
  async resolveId(source, importer, options) {
    if (!source.endsWith("/pg/client")) return null;
    const resolved = await this.resolve(source, importer, {
      ...options,
      skipSelf: true,
    });
    return resolved?.id === upstreamPgClient ? shim("pg-client.ts") : null;
  },
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = process.env.PORT
    ? Number(process.env.PORT)
    : env.PORT
      ? Number(env.PORT)
      : 3001;
  const allowedHosts = [
    env.ALLOWED_HOST,
    env.BETTER_AUTH_URL ? new URL(env.BETTER_AUTH_URL).hostname : undefined,
  ].filter((host): host is string => Boolean(host));

  return {
    // Keep in sync with vite.config.ts — the client build inlines these.
    envPrefix: [
      "VITE_",
      "AUTH_MODE",
      "BYPASS_EMAIL_VERIFICATION",
      "SIGNUP_DISABLED",
      "GOOGLE_AUTH_DISABLED",
      "AUTHENTIK_AUTH_ENABLED",
      "BILLING_DISABLED",
      "POSTHOG_PUBLIC_KEY",
      "POSTHOG_HOST",
      "TURNSTILE_SITE_KEY",
    ],
    resolve: {
      alias: {
        "cloudflare:workers": shim("cf-workers-shim.ts"),
        "cloudflare:workflows": shim("cf-workflows-shim.ts"),
        "cloudflare:email": shim("cf-email-shim.ts"),
      },
    },
    ssr: {
      // These packages import `cloudflare:*` themselves. Bundling them (instead
      // of leaving them external) routes those imports through the aliases
      // above; externalized they would hit Node's loader and crash at boot.
      noExternal: [
        "agents",
        "partyserver",
        "@cloudflare/workers-oauth-provider",
        "@cloudflare/ai-chat",
        "@cloudflare/think",
      ],
    },
    server: {
      allowedHosts,
      port,
    },
    build: {
      outDir: "dist-node",
    },
    plugins: [
      tsConfigPaths(),
      pooledPgClientPlugin,
      tanstackStart({
        server: {
          entry: "node-runtime/entry.ts",
        },
      }),
      viteReact(),
      tailwindcss(),
    ],
  };
});
