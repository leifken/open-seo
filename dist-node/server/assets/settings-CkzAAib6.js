import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Trash2, Monitor, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { b as authClient, p as getStandardErrorMessage, c as captureClientEvent, P as PortalMenu, o as useThemePreference, u as useSession } from "./router-DHiBnyXs.js";
import { C as CopyButton } from "./SetupControls-CIzHWqFw.js";
import { az as isHostedClientAuthMode, bh as version } from "../entry.js";
import "@tanstack/react-router";
import "zod";
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
const MAX_KEY_NAME_LENGTH = 32;
function ApiKeySettings() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [createdKey, setCreatedKey] = useState(null);
  const mcpUrl = typeof window === "undefined" ? "https://app.openseo.so/mcp" : `${window.location.origin}/mcp`;
  const apiKeysQuery = useQuery({
    queryKey: ["apiKeys"],
    queryFn: async () => {
      const result = await authClient.apiKey.list();
      if (result.error) {
        throw new Error(result.error.message ?? "Failed to load API keys");
      }
      return result.data.apiKeys.map((key) => ({
        id: key.id,
        name: key.name,
        start: key.start,
        createdAt: new Date(key.createdAt),
        lastRequest: key.lastRequest ? new Date(key.lastRequest) : null
      }));
    }
  });
  const createMutation = useMutation({
    mutationFn: async (keyName) => {
      const result = await authClient.apiKey.create({ name: keyName });
      if (result.error || !result.data?.key) {
        throw new Error(result.error?.message ?? "Failed to create the key");
      }
      return result.data.key;
    },
    onSuccess: (key) => {
      setCreatedKey(key);
      setName("");
      captureClientEvent("mcp:api_key_created");
      void queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error));
    }
  });
  const revokeMutation = useMutation({
    mutationFn: async (keyId) => {
      const result = await authClient.apiKey.delete({ keyId });
      if (result.error) {
        throw new Error(result.error.message ?? "Failed to revoke the key");
      }
    },
    onSuccess: () => {
      captureClientEvent("mcp:api_key_revoked");
      toast.success("API key revoked");
      void queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error));
    }
  });
  const apiKeys = apiKeysQuery.data ?? [];
  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setCreatedKey(null);
    setName("");
  };
  return /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium text-base-content/50", children: "API keys" }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Authenticate MCP clients when OAuth doesn't work" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-base-content/60", children: "Use this for remote agents like Hermes where the normal login flow doesn't work." }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm", children: /* @__PURE__ */ jsx(
          "a",
          {
            className: "link link-primary",
            href: "https://openseo.so/docs/mcp",
            target: "_blank",
            rel: "noreferrer",
            children: "Setup guide"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "btn btn-primary btn-sm",
          onClick: () => setIsCreateOpen(true),
          children: "Create API key"
        }
      )
    ] }),
    apiKeysQuery.isError ? /* @__PURE__ */ jsx("p", { className: "text-sm text-error", children: "We couldn't load your API keys." }) : apiKeys.length > 0 ? /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-lg border border-base-300", children: /* @__PURE__ */ jsxs("table", { className: "table table-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { children: "Name" }),
        /* @__PURE__ */ jsx("th", { children: "Key" }),
        /* @__PURE__ */ jsx("th", { children: "Created" }),
        /* @__PURE__ */ jsx("th", { children: "Last used" }),
        /* @__PURE__ */ jsx("th", { className: "w-10" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: apiKeys.map((key) => /* @__PURE__ */ jsxs("tr", { className: "hover", children: [
        /* @__PURE__ */ jsx("td", { className: "max-w-[220px] truncate font-medium", children: key.name || "Unnamed key" }),
        /* @__PURE__ */ jsxs(
          "td",
          {
            className: "font-mono text-xs text-base-content/70",
            "data-ph-mask": true,
            children: [
              key.start || "oseo_",
              "…"
            ]
          }
        ),
        /* @__PURE__ */ jsx("td", { className: "text-xs text-base-content/70", children: key.createdAt.toLocaleDateString() }),
        /* @__PURE__ */ jsx("td", { className: "text-xs text-base-content/70", children: key.lastRequest ? key.lastRequest.toLocaleDateString() : "Never" }),
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(
          PortalMenu,
          {
            ariaLabel: `Actions for ${key.name || "API key"}`,
            children: (close) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
              "button",
              {
                className: "text-error",
                disabled: revokeMutation.isPending && revokeMutation.variables === key.id,
                onClick: () => {
                  close();
                  if (window.confirm(
                    `Revoke "${key.name || "Unnamed key"}"? Clients using it will stop working.`
                  )) {
                    revokeMutation.mutate(key.id);
                  }
                },
                children: [
                  /* @__PURE__ */ jsx(Trash2, { className: "size-3.5" }),
                  "Revoke key"
                ]
              }
            ) })
          }
        ) })
      ] }, key.id)) })
    ] }) }) : null,
    isCreateOpen ? /* @__PURE__ */ jsxs("div", { className: "modal modal-open", children: [
      /* @__PURE__ */ jsx("div", { className: "modal-box max-w-md", children: createdKey ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold", children: "Copy your new API key" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm text-base-content/60", children: [
          "It won't be shown again. Send it as",
          " ",
          /* @__PURE__ */ jsx("span", { className: "font-mono text-xs", children: "Authorization: Bearer" }),
          " ",
          "to ",
          /* @__PURE__ */ jsx("span", { className: "font-mono text-xs", children: mcpUrl }),
          "."
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "code",
            {
              className: "min-w-0 flex-1 overflow-x-auto rounded bg-base-200 px-2.5 py-2 font-mono text-xs",
              "data-ph-mask": true,
              children: createdKey
            }
          ),
          /* @__PURE__ */ jsx(
            CopyButton,
            {
              value: createdKey,
              successMessage: "API key copied",
              iconOnly: true
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "modal-action", children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "btn btn-primary btn-sm",
            onClick: closeCreateModal,
            children: "Done"
          }
        ) })
      ] }) : /* @__PURE__ */ jsxs(
        "form",
        {
          onSubmit: (event) => {
            event.preventDefault();
            if (name.trim()) createMutation.mutate(name.trim());
          },
          children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold", children: "Create API key" }),
            /* @__PURE__ */ jsxs("label", { className: "form-control mt-4 w-full", children: [
              /* @__PURE__ */ jsx("span", { className: "label-text pb-1 text-xs text-base-content/60", children: "Name" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  className: "input input-sm input-bordered w-full",
                  placeholder: "Claude Code on laptop",
                  value: name,
                  maxLength: MAX_KEY_NAME_LENGTH,
                  onChange: (event) => setName(event.currentTarget.value),
                  required: true,
                  autoFocus: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "modal-action", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: "btn btn-ghost btn-sm",
                  onClick: closeCreateModal,
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  className: "btn btn-primary btn-sm",
                  disabled: createMutation.isPending || !name.trim(),
                  children: createMutation.isPending ? "Creating…" : "Create"
                }
              )
            ] })
          ]
        }
      ) }),
      createdKey ? /* @__PURE__ */ jsx("div", { className: "modal-backdrop" }) : /* @__PURE__ */ jsx("div", { className: "modal-backdrop", onClick: closeCreateModal })
    ] }) : null
  ] });
}
const THEME_OPTIONS = [{
  value: "system",
  label: "System",
  icon: Monitor
}, {
  value: "light",
  label: "Light",
  icon: Sun
}, {
  value: "dark",
  label: "Dark",
  icon: Moon
}];
function SettingsPage() {
  const isHosted = isHostedClientAuthMode();
  const {
    themePreference,
    setThemePreference
  } = useThemePreference();
  const {
    data: session,
    isPending: isSessionPending
  } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const analyticsEnabled = session?.user?.analyticsOptedOut !== true;
  async function updateAnalyticsPreference(enabled) {
    setIsSaving(true);
    try {
      const result = await authClient.updateUser({
        analyticsOptedOut: !enabled
      });
      if (result.error) {
        toast.error("We couldn't update your analytics setting.");
      } else {
        toast.success(enabled ? "Analytics enabled" : "Analytics disabled");
      }
    } catch {
      toast.error("We couldn't update your analytics setting.");
    } finally {
      setIsSaving(false);
    }
  }
  return /* @__PURE__ */ jsx("div", { className: "h-full overflow-auto bg-base-100 px-4 py-8 pb-24 md:px-6 md:py-12 md:pb-8", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl space-y-10", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Settings" }),
    /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium text-base-content/50", children: "Appearance" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-6", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Theme" }),
        /* @__PURE__ */ jsx("div", { role: "radiogroup", "aria-label": "Theme preference", className: "flex gap-0.5 rounded-lg bg-base-200 p-0.5", children: THEME_OPTIONS.map((option) => {
          const isActive = option.value === themePreference;
          const Icon = option.icon;
          return /* @__PURE__ */ jsx("button", { type: "button", role: "radio", "aria-checked": isActive, "aria-label": option.label, className: `flex cursor-pointer items-center justify-center rounded-md px-3 py-1.5 transition-colors ${isActive ? "bg-base-100 text-base-content shadow-sm" : "text-base-content/50 hover:text-base-content/80"}`, onClick: () => setThemePreference(option.value), children: /* @__PURE__ */ jsx(Icon, { className: "size-4" }) }, option.value);
        }) })
      ] })
    ] }),
    isHosted ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(ApiKeySettings, {}),
      /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium text-base-content/50", children: "Analytics" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Help improve OpenSEO" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-base-content/60", children: "Share analytics and usage data." })
          ] }),
          /* @__PURE__ */ jsx("input", { type: "checkbox", className: "toggle toggle-primary", checked: analyticsEnabled, disabled: isSessionPending || isSaving || !session?.user, onChange: (event) => {
            void updateAnalyticsPreference(event.currentTarget.checked);
          }, "aria-label": "Enable product analytics" })
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium text-base-content/50", children: "About" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-6", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Version" }),
        /* @__PURE__ */ jsxs("span", { className: "font-mono text-sm text-base-content/60", children: [
          "v",
          version
        ] })
      ] })
    ] })
  ] }) });
}
export {
  SettingsPage as component
};
