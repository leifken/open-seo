import { jsx } from "react/jsx-runtime";
import { useNavigate, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { k as Route, u as useSession, l as getCurrentAuthRedirect, A as AuthPageShell } from "./router-DHiBnyXs.js";
import { az as isHostedClientAuthMode } from "../entry.js";
import "lucide-react";
import "zod";
import "@tanstack/react-query";
import "./middleware-Doy-pxkJ.js";
import "@tanstack/query-core";
import "./selfHostedOAuth-C3UAQwsK.js";
import "drizzle-orm";
import "jose";
import "./ai-search-BV1mIqc0.js";
import "./audit-SZdMhI6q.js";
import "autumn-js/react";
import "react-dom";
import "@tanstack/react-form";
import "sonner";
import "@better-auth/api-key/client";
import "papaparse";
import "@tanstack/react-table";
import "remeda";
import "recharts";
import "./lighthouse-CiThJE4g.js";
import "./lighthouse-CxIZIYPF.js";
import "node:async_hooks";
import "node:crypto";
import "ioredis";
import "node:fs/promises";
import "node:path";
import "@modelcontextprotocol/client";
import "@modelcontextprotocol/client/validators/cf-worker";
import "@modelcontextprotocol/sdk/types.js";
import "node:diagnostics_channel";
import "drizzle-orm/d1";
import "drizzle-orm/sqlite-core";
import "drizzle-orm/postgres-js";
import "postgres";
import "drizzle-orm/pg-core";
import "jose/errors";
import "node:fs";
import "node:os";
import "@better-auth/api-key";
import "posthog-node";
import "@modelcontextprotocol/server";
import "tldts";
import "srvx";
import "@tanstack/react-router/ssr/server";
function AuthPageLayout() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const {
    data: session,
    isPending
  } = useSession();
  const isHostedMode = isHostedClientAuthMode();
  const redirectTo = getCurrentAuthRedirect(search.redirect);
  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }
    void navigate({
      href: redirectTo,
      replace: true
    });
  }, [navigate, redirectTo, session?.user?.id]);
  if (isHostedMode && (isPending || session?.user?.id)) {
    return null;
  }
  return /* @__PURE__ */ jsx(AuthPageShell, { children: /* @__PURE__ */ jsx(Outlet, {}) });
}
export {
  AuthPageLayout as component
};
