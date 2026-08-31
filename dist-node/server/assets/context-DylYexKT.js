import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Trash2, Plus, Pencil } from "lucide-react";
import { m as createSsrRpc, p as getStandardErrorMessage, ab as Route } from "./router-DHiBnyXs.js";
import { h as createServerFn, aj as getProjectContextSchema, al as updateProjectContextSchema, bH as KEY_PAGE_ROLES, bI as PROJECT_CONTEXT_SECTION_KEYS, bJ as PROJECT_CONTEXT_SECTION_LABELS, bK as PROSE_MAX_CHARS } from "../entry.js";
import { r as requireProjectContext } from "./middleware-Doy-pxkJ.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "zod";
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
const getProjectContext = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getProjectContextSchema).handler(createSsrRpc("7a3ccd49a583d669523ebc977678f95cac97fe4eaa09a3151a6af5732a78eb03"));
const updateProjectContext = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(updateProjectContextSchema).handler(createSsrRpc("a2d6a29497c1bebbf28ef40173a2712df71d7f163b0d27ba172aa05b8d2bd882"));
function projectContextQueryKey(projectId) {
  return ["projectContext", projectId];
}
function useContextUpdate(projectId) {
  const queryClient = useQueryClient();
  const queryKey = projectContextQueryKey(projectId);
  return useMutation({
    mutationFn: (updates) => updateProjectContext({ data: { projectId, updates } }),
    // An in-flight refetch would overwrite the fresher setQueryData below
    // with its pre-mutation snapshot.
    onMutate: () => queryClient.cancelQueries({ queryKey }),
    onSuccess: (context) => {
      queryClient.setQueryData(queryKey, context);
      toast.success("Project context updated");
    },
    onError: (error) => toast.error(getStandardErrorMessage(error, "Couldn't save your changes")),
    // The page instantiates this mutation per section, so two concurrent
    // patches can settle out of order and the slower (earlier-snapshotted)
    // response can land in the cache last; a settle-time refetch converges
    // the page back onto the server's state.
    onSettled: () => queryClient.invalidateQueries({ queryKey })
  });
}
const AUTHOR_LABELS = {
  user: "you",
  sam: "SAM",
  mcp: "your AI client"
};
function Provenance({ by, at }) {
  return /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/40", children: at ? `Updated by ${AUTHOR_LABELS[by]} · ${formatRelativeTime(at)}` : `Added by ${AUTHOR_LABELS[by]}` });
}
function formatRelativeTime(iso) {
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return "recently";
  const minutes = Math.floor((Date.now() - timestamp) / 6e4);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
function SectionHeader({
  title,
  hint,
  action
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium text-base-content/50", children: title }),
      hint ? /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50", children: hint }) : null
    ] }),
    action
  ] });
}
function EmptyState({ children }) {
  return /* @__PURE__ */ jsx("p", { className: "rounded-lg border border-dashed border-base-300 px-4 py-3 text-sm text-base-content/60", children });
}
const listClass = "divide-y divide-base-300 overflow-hidden rounded-lg border border-base-300";
function RowActions({ children }) {
  return /* @__PURE__ */ jsx("div", { className: "flex shrink-0 items-center gap-1", children });
}
function ConfirmDeleteButton({
  label,
  pending,
  onConfirm
}) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "btn btn-error btn-xs",
          disabled: pending,
          onClick: () => {
            setConfirming(false);
            onConfirm();
          },
          children: "Remove"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "btn btn-ghost btn-xs",
          onClick: () => setConfirming(false),
          children: "Cancel"
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      className: "btn btn-ghost btn-xs text-error",
      "aria-label": label,
      disabled: pending,
      onClick: () => setConfirming(true),
      children: /* @__PURE__ */ jsx(Trash2, { className: "size-3.5" })
    }
  );
}
function FormActions({
  pending,
  disabled,
  onCancel
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: "btn btn-ghost btn-xs",
        onClick: onCancel,
        disabled: pending,
        children: "Cancel"
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "submit",
        className: "btn btn-primary btn-xs",
        disabled: disabled || pending,
        children: "Save"
      }
    )
  ] });
}
function CompetitorsSection({
  projectId,
  competitors
}) {
  const update = useContextUpdate(projectId);
  const [adding, setAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const save = (previousDomain, draft) => {
    const ops = [];
    if (previousDomain && previousDomain !== draft.domain.trim()) {
      ops.push({ removeCompetitors: [previousDomain] });
    }
    ops.push({
      addCompetitors: [
        {
          domain: draft.domain.trim(),
          name: draft.name.trim(),
          notes: draft.notes.trim()
        }
      ]
    });
    update.mutate(ops, {
      onSuccess: () => {
        setAdding(false);
        setEditingId(null);
      }
    });
  };
  return /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx(
      SectionHeader,
      {
        title: "Competitors",
        hint: "The sites you measure yourself against.",
        action: /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: "btn btn-ghost btn-xs",
            onClick: () => setAdding(true),
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "size-3.5" }),
              "Add competitor"
            ]
          }
        )
      }
    ),
    adding ? /* @__PURE__ */ jsx("div", { className: listClass, children: /* @__PURE__ */ jsx(
      CompetitorForm,
      {
        pending: update.isPending,
        onCancel: () => setAdding(false),
        onSave: (draft) => save(null, draft)
      }
    ) }) : null,
    competitors.length === 0 ? adding ? null : /* @__PURE__ */ jsx(EmptyState, { children: "No competitors yet. Add the sites you compete with, or ask SAM to find them from your rankings and save them here." }) : /* @__PURE__ */ jsx("ul", { className: listClass, children: competitors.map(
      (competitor) => editingId === competitor.id ? /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
        CompetitorForm,
        {
          initial: competitor,
          pending: update.isPending,
          onCancel: () => setEditingId(null),
          onSave: (draft) => save(competitor.domain, draft)
        }
      ) }, competitor.id) : /* @__PURE__ */ jsxs(
        "li",
        {
          className: "flex items-start justify-between gap-3 p-3",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 space-y-0.5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-baseline gap-x-2", children: [
                /* @__PURE__ */ jsx("span", { className: "truncate text-sm font-medium", children: competitor.domain }),
                competitor.name ? /* @__PURE__ */ jsx("span", { className: "truncate text-xs text-base-content/60", children: competitor.name }) : null
              ] }),
              competitor.notes ? /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: competitor.notes }) : null,
              /* @__PURE__ */ jsx(
                Provenance,
                {
                  by: competitor.updatedBy,
                  at: competitor.updatedAt
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(RowActions, { children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: "btn btn-ghost btn-xs",
                  "aria-label": `Edit ${competitor.domain}`,
                  onClick: () => setEditingId(competitor.id),
                  children: /* @__PURE__ */ jsx(Pencil, { className: "size-3.5" })
                }
              ),
              /* @__PURE__ */ jsx(
                ConfirmDeleteButton,
                {
                  label: `Remove ${competitor.domain}`,
                  pending: update.isPending,
                  onConfirm: () => update.mutate([
                    { removeCompetitors: [competitor.domain] }
                  ])
                }
              )
            ] })
          ]
        },
        competitor.id
      )
    ) })
  ] });
}
function CompetitorForm({
  initial,
  pending,
  onCancel,
  onSave
}) {
  const [draft, setDraft] = React.useState({
    domain: initial?.domain ?? "",
    name: initial?.name ?? "",
    notes: initial?.notes ?? ""
  });
  return /* @__PURE__ */ jsxs(
    "form",
    {
      className: "space-y-2 bg-base-200/40 p-3",
      onSubmit: (event) => {
        event.preventDefault();
        if (!draft.domain.trim() || pending) return;
        onSave(draft);
      },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              autoFocus: true,
              type: "text",
              value: draft.domain,
              onChange: (event) => setDraft({ ...draft, domain: event.target.value }),
              placeholder: "competitor.com",
              maxLength: 255,
              className: "input input-bordered input-sm w-full",
              "aria-label": "Competitor domain"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: draft.name,
              onChange: (event) => setDraft({ ...draft, name: event.target.value }),
              placeholder: "Name (optional)",
              maxLength: 120,
              className: "input input-bordered input-sm w-full",
              "aria-label": "Competitor name"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: draft.notes,
            onChange: (event) => setDraft({ ...draft, notes: event.target.value }),
            placeholder: "Why they matter — e.g. wins every comparison keyword (optional)",
            maxLength: 500,
            className: "input input-bordered input-sm w-full",
            "aria-label": "Competitor notes"
          }
        ),
        /* @__PURE__ */ jsx(
          FormActions,
          {
            pending,
            disabled: !draft.domain.trim(),
            onCancel
          }
        )
      ]
    }
  );
}
const ROLE_LABELS = {
  hub: "Hub page",
  spoke: "Supporting page",
  money: "Money page",
  other: "Other"
};
function KeyPagesSection({
  projectId,
  keyPages
}) {
  const update = useContextUpdate(projectId);
  const [adding, setAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const save = (previousUrl, draft) => {
    const ops = [];
    if (previousUrl && previousUrl !== draft.url.trim()) {
      ops.push({ removeKeyPages: [previousUrl] });
    }
    ops.push({
      addKeyPages: [
        {
          url: draft.url.trim(),
          role: draft.role,
          topic: draft.topic.trim(),
          notes: draft.notes.trim()
        }
      ]
    });
    update.mutate(ops, {
      onSuccess: () => {
        setAdding(false);
        setEditingId(null);
      }
    });
  };
  return /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx(
      SectionHeader,
      {
        title: "Key pages",
        hint: "A shortlist of the pages that carry the site — not an inventory.",
        action: /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: "btn btn-ghost btn-xs",
            onClick: () => setAdding(true),
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "size-3.5" }),
              "Add page"
            ]
          }
        )
      }
    ),
    adding ? /* @__PURE__ */ jsx("div", { className: listClass, children: /* @__PURE__ */ jsx(
      KeyPageForm,
      {
        pending: update.isPending,
        onCancel: () => setAdding(false),
        onSave: (draft) => save(null, draft)
      }
    ) }) : null,
    keyPages.length === 0 ? adding ? null : /* @__PURE__ */ jsx(EmptyState, { children: "No key pages yet. Add the handful that has to rank, or let an agent propose them from your last site audit." }) : /* @__PURE__ */ jsx("ul", { className: listClass, children: keyPages.map(
      (page) => editingId === page.id ? /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
        KeyPageForm,
        {
          initial: page,
          pending: update.isPending,
          onCancel: () => setEditingId(null),
          onSave: (draft) => save(page.url, draft)
        }
      ) }, page.id) : /* @__PURE__ */ jsxs(
        "li",
        {
          className: "flex items-start justify-between gap-3 p-3",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 space-y-0.5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-baseline gap-x-2", children: [
                /* @__PURE__ */ jsx("span", { className: "truncate text-sm font-medium", children: page.url }),
                /* @__PURE__ */ jsx("span", { className: "badge badge-ghost badge-sm shrink-0", children: ROLE_LABELS[page.role] })
              ] }),
              page.topic ? /* @__PURE__ */ jsxs("p", { className: "text-sm text-base-content/70", children: [
                "Target: ",
                page.topic
              ] }) : null,
              page.notes ? /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: page.notes }) : null,
              /* @__PURE__ */ jsx(Provenance, { by: page.updatedBy, at: page.updatedAt })
            ] }),
            /* @__PURE__ */ jsxs(RowActions, { children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: "btn btn-ghost btn-xs",
                  "aria-label": `Edit ${page.url}`,
                  onClick: () => setEditingId(page.id),
                  children: /* @__PURE__ */ jsx(Pencil, { className: "size-3.5" })
                }
              ),
              /* @__PURE__ */ jsx(
                ConfirmDeleteButton,
                {
                  label: `Remove ${page.url}`,
                  pending: update.isPending,
                  onConfirm: () => update.mutate([{ removeKeyPages: [page.url] }])
                }
              )
            ] })
          ]
        },
        page.id
      )
    ) })
  ] });
}
function KeyPageForm({
  initial,
  pending,
  onCancel,
  onSave
}) {
  const [draft, setDraft] = React.useState({
    url: initial?.url ?? "",
    role: initial?.role ?? "other",
    topic: initial?.topic ?? "",
    notes: initial?.notes ?? ""
  });
  return /* @__PURE__ */ jsxs(
    "form",
    {
      className: "space-y-2 bg-base-200/40 p-3",
      onSubmit: (event) => {
        event.preventDefault();
        if (!draft.url.trim() || pending) return;
        onSave(draft);
      },
      children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            autoFocus: true,
            type: "text",
            value: draft.url,
            onChange: (event) => setDraft({ ...draft, url: event.target.value }),
            placeholder: "example.com/pricing",
            maxLength: 2048,
            className: "input input-bordered input-sm w-full",
            "aria-label": "Page URL"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(
            "select",
            {
              value: draft.role,
              onChange: (event) => setDraft({
                ...draft,
                role: KEY_PAGE_ROLES.find((role) => role === event.target.value) ?? draft.role
              }),
              className: "select select-bordered select-sm w-full",
              "aria-label": "Page role",
              children: KEY_PAGE_ROLES.map((role) => /* @__PURE__ */ jsx("option", { value: role, children: ROLE_LABELS[role] }, role))
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: draft.topic,
              onChange: (event) => setDraft({ ...draft, topic: event.target.value }),
              placeholder: "Target topic (optional)",
              maxLength: 200,
              className: "input input-bordered input-sm w-full",
              "aria-label": "Target topic"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: draft.notes,
            onChange: (event) => setDraft({ ...draft, notes: event.target.value }),
            placeholder: "Notes (optional)",
            maxLength: 500,
            className: "input input-bordered input-sm w-full",
            "aria-label": "Page notes"
          }
        ),
        /* @__PURE__ */ jsx(
          FormActions,
          {
            pending,
            disabled: !draft.url.trim(),
            onCancel
          }
        )
      ]
    }
  );
}
const SECTION_HINTS = {
  business_overview: "What you sell, who buys it, and where.",
  current_goal: "What you're pushing for right now, and by when.",
  positioning: "Why someone picks you over the alternatives.",
  writing_preferences: "Voice, words to avoid, topics that are off-limits."
};
const SECTION_PLACEHOLDERS = {
  business_overview: "e.g. Booking software for independent restaurants in the US and Canada. Buyers are owner-operators, not marketers.",
  current_goal: "e.g. Double organic signups by Q4. Comparison pages are the current bet.",
  positioning: "e.g. The only booking tool that sets up in an afternoon. Cheaper than the incumbents, simpler than the DIY stack.",
  writing_preferences: "e.g. Plain and direct, no hype. Never say 'seamless' or 'game-changing'. Don't write about competitor pricing."
};
function ProjectContextPage({ projectId }) {
  const contextQuery = useQuery({
    queryKey: projectContextQueryKey(projectId),
    queryFn: () => getProjectContext({ data: { projectId } }),
    // This page exists to inspect what agents just wrote; the app-wide
    // 5-minute staleTime would show pre-SAM-turn memory as current.
    staleTime: 0
  });
  if (contextQuery.isPending) {
    return /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx("span", { className: "loading loading-spinner loading-md" }) });
  }
  if (contextQuery.isError) {
    return /* @__PURE__ */ jsx("div", { className: "alert alert-error", children: /* @__PURE__ */ jsx("span", { className: "text-sm", children: getStandardErrorMessage(
      contextQuery.error,
      "Failed to load project context"
    ) }) });
  }
  const context = contextQuery.data;
  return (
    // key remounts the whole page when the project switches under it, so no
    // draft, open form, or edit state can carry over to another project.
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: "What SAM, Claude Code, and any connected MCP client know about this project. They read it before they work and write back what they learn, so correct anything that looks wrong." }),
      /* @__PURE__ */ jsx(
        ProseSections,
        {
          projectId,
          sections: context.sections,
          missingSections: context.missingSections
        }
      ),
      /* @__PURE__ */ jsx(
        CompetitorsSection,
        {
          projectId,
          competitors: context.competitors
        }
      ),
      /* @__PURE__ */ jsx(KeyPagesSection, { projectId, keyPages: context.keyPages }),
      /* @__PURE__ */ jsx(
        CustomSections,
        {
          projectId,
          customSections: context.customSections
        }
      ),
      /* @__PURE__ */ jsx(ResearchLog, { projectId, researchLog: context.researchLog })
    ] }, projectId)
  );
}
function ProseSections({
  projectId,
  sections,
  missingSections
}) {
  const update = useContextUpdate(projectId);
  const stored = new Map(sections.map((section) => [section.key, section]));
  const [drafts, setDrafts] = React.useState({});
  const draftOf = (key) => drafts[key] ?? stored.get(key)?.content ?? "";
  const changed = PROJECT_CONTEXT_SECTION_KEYS.filter(
    (key) => draftOf(key).trim() !== (stored.get(key)?.content ?? "")
  );
  const handleSubmit = (event) => {
    event.preventDefault();
    if (update.isPending || changed.length === 0) return;
    update.mutate(
      changed.map((key) => ({ section: key, content: draftOf(key).trim() })),
      // Unpin every draft the save made redundant — one that now matches the
      // server — so those sections render from the query again (a pinned
      // draft would silently overwrite a later agent write on the next
      // save). Anything typed while the request was in flight still differs
      // and stays pinned instead of snapping back.
      {
        onSuccess: (context) => {
          const saved = new Map(
            context.sections.map((section) => [section.key, section.content])
          );
          setDrafts(
            (current) => Object.fromEntries(
              Object.entries(current).filter(
                ([key, value]) => value.trim() !== (saved.get(key) ?? "")
              )
            )
          );
        }
      }
    );
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
    missingSections.length === PROJECT_CONTEXT_SECTION_KEYS.length ? /* @__PURE__ */ jsx(EmptyState, { children: "Nothing written down yet. Fill in what you can — or ask SAM to draft it from your site and confirm what it got right." }) : null,
    PROJECT_CONTEXT_SECTION_KEYS.map((key) => {
      const section = stored.get(key);
      return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-baseline justify-between gap-x-3", children: [
          /* @__PURE__ */ jsx(
            "label",
            {
              htmlFor: `context-${key}`,
              className: "text-sm font-medium text-base-content",
              children: PROJECT_CONTEXT_SECTION_LABELS[key]
            }
          ),
          section ? /* @__PURE__ */ jsx(Provenance, { by: section.updatedBy, at: section.updatedAt }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/40", children: "Empty" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50", children: SECTION_HINTS[key] }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: `context-${key}`,
            value: draftOf(key),
            onChange: (event) => {
              const value = event.target.value;
              setDrafts((current) => {
                if (value === (stored.get(key)?.content ?? "")) {
                  const { [key]: _dropped, ...rest } = current;
                  return rest;
                }
                return { ...current, [key]: value };
              });
            },
            rows: 4,
            maxLength: PROSE_MAX_CHARS,
            placeholder: SECTION_PLACEHOLDERS[key],
            className: "textarea textarea-bordered w-full text-sm"
          }
        )
      ] }, key);
    }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(
      "button",
      {
        type: "submit",
        className: "btn btn-primary btn-sm",
        disabled: update.isPending || changed.length === 0,
        children: "Save changes"
      }
    ) })
  ] });
}
function CustomSections({
  projectId,
  customSections
}) {
  const update = useContextUpdate(projectId);
  const [editingSlug, setEditingSlug] = React.useState(null);
  return /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx(
      SectionHeader,
      {
        title: "Custom sections",
        hint: "Anything an agent wrote down that didn't fit the sections above."
      }
    ),
    customSections.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { children: "Nothing here yet. Agents add a section when they learn something important that has nowhere else to live." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: customSections.map(
      (custom) => editingSlug === custom.slug ? /* @__PURE__ */ jsx(
        CustomSectionForm,
        {
          custom,
          pending: update.isPending,
          onCancel: () => setEditingSlug(null),
          onSave: (title, content) => update.mutate(
            [{ customSection: custom.slug, title, content }],
            { onSuccess: () => setEditingSlug(null) }
          )
        },
        custom.slug
      ) : /* @__PURE__ */ jsxs(
        "div",
        {
          className: "space-y-2 rounded-lg border border-base-300 p-3",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("h3", { className: "truncate text-sm font-medium", children: custom.title ?? custom.slug }),
                /* @__PURE__ */ jsx(Provenance, { by: custom.updatedBy, at: custom.updatedAt })
              ] }),
              /* @__PURE__ */ jsxs(RowActions, { children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "btn btn-ghost btn-xs",
                    "aria-label": `Edit ${custom.title ?? custom.slug}`,
                    onClick: () => setEditingSlug(custom.slug),
                    children: /* @__PURE__ */ jsx(Pencil, { className: "size-3.5" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  ConfirmDeleteButton,
                  {
                    label: `Delete ${custom.title ?? custom.slug}`,
                    pending: update.isPending,
                    onConfirm: () => update.mutate([{ deleteCustomSection: custom.slug }])
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "whitespace-pre-wrap text-sm text-base-content/70", children: custom.content })
          ]
        },
        custom.slug
      )
    ) })
  ] });
}
function CustomSectionForm({
  custom,
  pending,
  onCancel,
  onSave
}) {
  const [title, setTitle] = React.useState(custom.title ?? "");
  const [content, setContent] = React.useState(custom.content);
  return /* @__PURE__ */ jsxs(
    "form",
    {
      className: "space-y-2 rounded-lg border border-base-300 bg-base-200/40 p-3",
      onSubmit: (event) => {
        event.preventDefault();
        if (pending || !content.trim()) return;
        onSave(title.trim() || custom.slug, content);
      },
      children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: title,
            onChange: (event) => setTitle(event.target.value),
            placeholder: custom.slug,
            maxLength: 120,
            className: "input input-bordered input-sm w-full",
            "aria-label": "Section title"
          }
        ),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: content,
            onChange: (event) => setContent(event.target.value),
            rows: 5,
            maxLength: PROSE_MAX_CHARS,
            className: "textarea textarea-bordered w-full text-sm",
            "aria-label": "Section content"
          }
        ),
        /* @__PURE__ */ jsx(
          FormActions,
          {
            pending,
            disabled: !content.trim(),
            onCancel
          }
        )
      ]
    }
  );
}
function ResearchLog({
  projectId,
  researchLog
}) {
  const update = useContextUpdate(projectId);
  return /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx(
      SectionHeader,
      {
        title: "Research log",
        hint: "What's already been looked up, so nobody buys the same data twice."
      }
    ),
    researchLog.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { children: "Nothing logged yet. Agents record paid research here as they run it." }) : /* @__PURE__ */ jsx("ul", { className: listClass, children: researchLog.map((entry) => /* @__PURE__ */ jsxs(
      "li",
      {
        className: "flex items-start justify-between gap-3 p-3",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 space-y-0.5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/80", children: entry.summary }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-baseline gap-x-2 text-xs text-base-content/40", children: [
              /* @__PURE__ */ jsx("span", { children: entry.entryDate }),
              /* @__PURE__ */ jsx(Provenance, { by: entry.createdBy })
            ] })
          ] }),
          /* @__PURE__ */ jsx(RowActions, { children: /* @__PURE__ */ jsx(
            ConfirmDeleteButton,
            {
              label: `Delete log entry from ${entry.entryDate}`,
              pending: update.isPending,
              onConfirm: () => update.mutate([{ removeResearchLog: [entry.id] }])
            }
          ) })
        ]
      },
      entry.id
    )) })
  ] });
}
function ProjectContextRoute() {
  const {
    projectId
  } = Route.useParams();
  return /* @__PURE__ */ jsx(ProjectContextPage, { projectId });
}
export {
  ProjectContextRoute as component
};
