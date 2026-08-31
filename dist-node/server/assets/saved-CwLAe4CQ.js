import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useQueryClient, useQuery, keepPreviousData, useMutation } from "@tanstack/react-query";
import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Tags, Copy, Sheet, FileDown, Trash2, X, Search, Plus, Check, Loader2, RotateCcw, Minus, Pencil, Tag, ChevronDown, MoreHorizontal, SlidersHorizontal, RefreshCw, Download, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { a5 as TableBulkActionBar, a6 as TableBulkActionButton, am as TableBulkExportMenu, a2 as useSelectionAnchor, K as makeSelectionColumn, S as SortableHeader, a3 as useAppTable, a4 as AppDataTable, a8 as exportTableToSheets, p as getStandardErrorMessage, c as captureClientEvent, D as downloadCsv, E as buildCsv, ao as Route } from "./router-BZ-5uDXB.js";
import { M as Modal } from "./Modal-81iy_nBW.js";
import { ch as resolveTagColor, ci as tagDotClass, cj as tagChipClass, ck as TAG_COLOR_KEYS, cl as tagSwatchClass } from "../entry.js";
import { K as KEYWORD_RESEARCH_HEADERS } from "./keywordControllerActions-DAf9tszu.js";
import { createColumnHelper } from "@tanstack/react-table";
import { D as DifficultyBadge } from "./DifficultyBadge-C2djn1uR.js";
import { I as IntentBadge } from "./IntentBadge-BQdec1XR.js";
import { e as exportSavedKeywords, d as deleteSavedKeywordTag, u as updateSavedKeywordTag, g as getSavedKeywords, a as removeSavedKeywords, b as updateSavedKeywordTags, c as refreshSavedKeywordMetrics } from "./keywords-BbbgimDM.js";
import { useForm, useStore } from "@tanstack/react-form";
import "@tanstack/react-router";
import "zod";
import "./middleware-CvzXieP6.js";
import "@tanstack/query-core";
import "./selfHostedOAuth-DmcaPqZ5.js";
import "drizzle-orm";
import "jose";
import "./ai-search-BV1mIqc0.js";
import "./audit-SZdMhI6q.js";
import "autumn-js/react";
import "react-dom";
import "@better-auth/api-key/client";
import "papaparse";
import "remeda";
import "recharts";
import "./lighthouse-CiThJE4g.js";
import "./lighthouse-CxIZIYPF.js";
import "node:async_hooks";
import "node:crypto";
import "ioredis";
import "node:fs/promises";
import "node:path";
import "node:fs";
import "better-sqlite3";
import "bullmq";
import "postgres";
import "@modelcontextprotocol/client";
import "@modelcontextprotocol/client/validators/cf-worker";
import "@modelcontextprotocol/sdk/types.js";
import "node:diagnostics_channel";
import "drizzle-orm/d1";
import "drizzle-orm/sqlite-core";
import "drizzle-orm/postgres-js";
import "drizzle-orm/pg-core";
import "jose/errors";
import "node:os";
import "@better-auth/api-key";
import "posthog-node";
import "@modelcontextprotocol/server";
import "tldts";
import "srvx";
import "@tanstack/react-router/ssr/server";
import "robots-parser";
import "fast-xml-parser";
function SavedKeywordsBulkActionBar({
  selectedCount,
  onCopy,
  onOpenTags,
  onExportCsv,
  onExportSheets,
  onDelete,
  onClear,
  exportingSelection
}) {
  if (selectedCount === 0) return null;
  const exportBusy = exportingSelection != null;
  return /* @__PURE__ */ jsx(
    TableBulkActionBar,
    {
      selectedCount,
      onClear,
      actions: /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.5 px-1.5", children: [
          /* @__PURE__ */ jsx(
            TableBulkActionButton,
            {
              icon: /* @__PURE__ */ jsx(Tags, { className: "size-3.5" }),
              onClick: onOpenTags,
              children: "Tag"
            }
          ),
          /* @__PURE__ */ jsx(
            TableBulkExportMenu,
            {
              busy: exportBusy,
              actions: [
                {
                  label: "Copy keywords",
                  icon: /* @__PURE__ */ jsx(Copy, { className: "size-4" }),
                  onClick: onCopy
                },
                {
                  label: "Export to Sheets",
                  icon: /* @__PURE__ */ jsx(Sheet, { className: "size-4" }),
                  onClick: onExportSheets
                },
                {
                  label: "Export CSV",
                  icon: /* @__PURE__ */ jsx(FileDown, { className: "size-4" }),
                  onClick: onExportCsv
                }
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center border-l border-base-content/10 px-1.5", children: /* @__PURE__ */ jsx(
          TableBulkActionButton,
          {
            icon: /* @__PURE__ */ jsx(Trash2, { className: "size-3.5" }),
            onClick: onDelete,
            variant: "danger",
            children: "Delete"
          }
        ) })
      ] })
    }
  );
}
const SIZE_CLASS = {
  xs: "h-5 px-1.5 text-[11px]",
  sm: "h-6 px-2 text-xs",
  md: "h-7 px-2.5 text-sm"
};
function TagChip({
  tag,
  size = "sm",
  trailing,
  onClick,
  selected,
  title
}) {
  const color = resolveTagColor(tag);
  const base = `inline-flex items-center gap-1.5 rounded-md font-medium ${SIZE_CLASS[size]} ${tagChipClass(color)}`;
  const interactive = onClick ? "cursor-pointer hover:brightness-110 transition" : "";
  const ring = selected ? "ring-2 ring-offset-1 ring-offset-base-100" : "";
  const content = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "span",
      {
        className: `size-1.5 shrink-0 rounded-full ${tagDotClass(color)}`
      }
    ),
    /* @__PURE__ */ jsx("span", { className: "truncate", children: tag.name }),
    trailing
  ] });
  if (onClick) {
    return /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        title,
        className: `${base} ${interactive} ${ring}`,
        onClick,
        children: content
      }
    );
  }
  return /* @__PURE__ */ jsx("span", { title, className: `${base} ${ring}`, children: content });
}
function SavedKeywordsBulkTagsModal({
  availableTags,
  selectedCount,
  selectedRowTags,
  isPending,
  onClose,
  onApply
}) {
  const [mode, setMode] = useState("add");
  const [query, setQuery] = useState("");
  const [addNames, setAddNames] = useState([]);
  const [removeIds, setRemoveIds] = useState([]);
  const inputRef = useRef(null);
  const normalizedAddSet = useMemo(
    () => new Set(addNames.map((name) => name.toLocaleLowerCase())),
    [addNames]
  );
  const availableByNormalized = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const tag of availableTags) {
      map.set(tag.normalizedName, tag);
    }
    return map;
  }, [availableTags]);
  const filteredAvailable = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    if (!q) return availableTags;
    return availableTags.filter((tag) => tag.normalizedName.includes(q));
  }, [availableTags, query]);
  const trimmedQuery = query.trim();
  const queryNormalized = trimmedQuery.toLocaleLowerCase();
  const showCreate = mode === "add" && trimmedQuery.length > 0 && !availableByNormalized.has(queryNormalized) && !normalizedAddSet.has(queryNormalized);
  const canApply = !isPending && (addNames.length > 0 || removeIds.length > 0);
  const handleToggleAdd = (tag) => {
    setAddNames(
      (current) => normalizedAddSet.has(tag.normalizedName) ? current.filter(
        (name) => name.toLocaleLowerCase() !== tag.normalizedName
      ) : [...current, tag.name]
    );
    setRemoveIds((current) => current.filter((id) => id !== tag.id));
  };
  const handleCreate = () => {
    if (!trimmedQuery) return;
    setAddNames(
      (current) => current.some((name) => name.toLocaleLowerCase() === queryNormalized) ? current : [...current, trimmedQuery]
    );
    setQuery("");
    inputRef.current?.focus();
  };
  const handleToggleRemove = (tag) => {
    setRemoveIds(
      (current) => current.includes(tag.id) ? current.filter((id) => id !== tag.id) : [...current, tag.id]
    );
    setAddNames(
      (current) => current.filter((name) => name.toLocaleLowerCase() !== tag.normalizedName)
    );
  };
  return /* @__PURE__ */ jsx(Modal, { maxWidth: "max-w-lg", onClose, labelledBy: "bulk-tags-title", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { id: "bulk-tags-title", className: "text-lg font-semibold", children: "Update tags" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-base-content/65", children: [
        "Apply or remove tags across ",
        selectedCount,
        " selected keyword",
        selectedCount !== 1 ? "s" : "",
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "inline-flex rounded-md border border-base-300 bg-base-200/40 p-0.5 text-sm", children: [
      /* @__PURE__ */ jsx(
        SegmentButton,
        {
          active: mode === "add",
          onClick: () => setMode("add"),
          label: "Add tags",
          count: addNames.length
        }
      ),
      /* @__PURE__ */ jsx(
        SegmentButton,
        {
          active: mode === "remove",
          onClick: () => setMode("remove"),
          label: "Remove tags",
          count: removeIds.length,
          disabled: selectedRowTags.length === 0
        }
      )
    ] }),
    mode === "add" ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      addNames.length > 0 ? /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-1.5 rounded-md border border-base-300 bg-base-200/40 px-2 py-2", children: addNames.map((name) => {
        const existing = availableByNormalized.get(
          name.toLocaleLowerCase()
        );
        const tag = existing ?? {
          id: `new:${name}`,
          name,
          normalizedName: name.toLocaleLowerCase(),
          color: null
        };
        return /* @__PURE__ */ jsx(
          TagChip,
          {
            tag,
            size: "sm",
            onClick: () => setAddNames(
              (current) => current.filter(
                (existingName) => existingName !== name
              )
            ),
            trailing: /* @__PURE__ */ jsx(X, { className: "size-3 opacity-70" }),
            title: "Remove from selection"
          },
          name
        );
      }) }) : null,
      /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 rounded-md border border-base-300 bg-base-100 px-2 py-2", children: [
        /* @__PURE__ */ jsx(Search, { className: "size-3.5 opacity-50" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            ref: inputRef,
            value: query,
            onChange: (event) => setQuery(event.target.value),
            onKeyDown: (event) => {
              if (event.key === "Enter" && showCreate) {
                event.preventDefault();
                handleCreate();
              }
            },
            placeholder: "Search or create…",
            className: "min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-base-content/40"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "max-h-56 overflow-y-auto rounded-md border border-base-300", children: [
        showCreate ? /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: handleCreate,
            className: "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-base-200",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "size-3.5 text-primary" }),
              /* @__PURE__ */ jsx("span", { className: "text-base-content/70", children: "Create" }),
              /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
                "“",
                trimmedQuery,
                "”"
              ] })
            ]
          }
        ) : null,
        filteredAvailable.length === 0 && !showCreate ? /* @__PURE__ */ jsx("div", { className: "px-3 py-6 text-center text-xs text-base-content/55", children: availableTags.length === 0 ? "No tags yet. Type a name above to create one." : "No tags match that search." }) : null,
        filteredAvailable.map((tag) => {
          const checked = normalizedAddSet.has(tag.normalizedName);
          const color = resolveTagColor(tag);
          return /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => handleToggleAdd(tag),
              className: "flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-base-200",
              children: [
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: `flex size-4 shrink-0 items-center justify-center rounded border ${checked ? "border-primary bg-primary text-primary-content" : "border-base-300"}`,
                    children: checked ? /* @__PURE__ */ jsx(Check, { className: "size-3" }) : null
                  }
                ),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: `size-2 shrink-0 rounded-full ${tagDotClass(color)}`
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "flex-1 truncate text-sm", children: tag.name }),
                /* @__PURE__ */ jsx("span", { className: "text-[11px] tabular-nums text-base-content/45", children: tag.keywordCount })
              ]
            },
            tag.id
          );
        })
      ] })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      selectedRowTags.length === 0 ? /* @__PURE__ */ jsx("div", { className: "rounded-md border border-base-300 bg-base-200/40 px-3 py-6 text-center text-xs text-base-content/55", children: "The selected keywords don't have any tags to remove." }) : /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5 rounded-md border border-base-300 p-3", children: selectedRowTags.map((tag) => {
        const checked = removeIds.includes(tag.id);
        return /* @__PURE__ */ jsx(
          TagChip,
          {
            tag,
            size: "sm",
            onClick: () => handleToggleRemove(tag),
            selected: checked,
            trailing: checked ? /* @__PURE__ */ jsx(Check, { className: "size-3" }) : null,
            title: checked ? "Will be removed" : "Click to remove"
          },
          tag.id
        );
      }) }),
      removeIds.length > 0 ? /* @__PURE__ */ jsxs("p", { className: "text-xs text-base-content/55", children: [
        removeIds.length,
        " tag",
        removeIds.length !== 1 ? "s" : "",
        " will be detached from the selected keywords."
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2 pt-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "rounded-md px-3 py-1.5 text-sm text-base-content/70 hover:bg-base-200",
          onClick: onClose,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-content disabled:opacity-50",
          disabled: !canApply,
          onClick: () => onApply({
            addTags: addNames.length > 0 ? addNames : void 0,
            removeTagIds: removeIds.length > 0 ? removeIds : void 0
          }),
          children: [
            isPending ? /* @__PURE__ */ jsx(Loader2, { className: "size-3.5 animate-spin" }) : null,
            "Apply"
          ]
        }
      )
    ] })
  ] }) });
}
function SegmentButton({
  active,
  onClick,
  label,
  count,
  disabled
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick,
      disabled,
      className: `inline-flex items-center gap-1.5 rounded px-3 py-1 text-sm transition ${active ? "bg-base-100 font-medium shadow-sm" : "text-base-content/65 hover:text-base-content"} disabled:opacity-40`,
      children: [
        label,
        count > 0 ? /* @__PURE__ */ jsx("span", { className: "inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-content", children: count }) : null
      ]
    }
  );
}
function SavedKeywordsFilterPanel({
  form,
  activeFilterCount,
  onReset
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3 border-b border-base-300 bg-gradient-to-b from-base-100 to-base-200/30 px-4 py-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "Refine results" }),
        activeFilterCount > 0 ? /* @__PURE__ */ jsxs("span", { className: "badge badge-xs badge-primary border-0 text-primary-content", children: [
          activeFilterCount,
          " active"
        ] }) : null
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "btn btn-xs btn-ghost gap-1",
          onClick: onReset,
          disabled: activeFilterCount === 0,
          children: [
            /* @__PURE__ */ jsx(RotateCcw, { className: "size-3" }),
            "Clear all"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-2 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsx(
        TermsTokenInput,
        {
          form,
          name: "include",
          label: "Include",
          variant: "include",
          placeholder: "Must contain… e.g. audit"
        }
      ),
      /* @__PURE__ */ jsx(
        TermsTokenInput,
        {
          form,
          name: "exclude",
          label: "Exclude",
          variant: "exclude",
          placeholder: "Must not contain… e.g. jobs"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-2 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsx(
        FilterRangeInputs,
        {
          form,
          title: "Search Volume",
          minName: "minVol",
          maxName: "maxVol",
          min: 0
        }
      ),
      /* @__PURE__ */ jsx(
        FilterRangeInputs,
        {
          form,
          title: "CPC (USD)",
          minName: "minCpc",
          maxName: "maxCpc",
          step: "0.01",
          min: 0
        }
      ),
      /* @__PURE__ */ jsx(
        FilterRangeInputs,
        {
          form,
          title: "Difficulty",
          minName: "minKd",
          maxName: "maxKd",
          min: 0,
          max: 100
        }
      )
    ] })
  ] });
}
const VARIANT_STYLES = {
  include: {
    icon: Plus,
    chip: "tag-chip-emerald ring-1 ring-inset",
    iconBg: "tag-chip-emerald ring-1 ring-inset"
  },
  exclude: {
    icon: Minus,
    chip: "tag-chip-rose ring-1 ring-inset",
    iconBg: "tag-chip-rose ring-1 ring-inset"
  }
};
function splitTerms(value) {
  return value.split(/[,+]/).map((term) => term.trim()).filter(Boolean);
}
function joinTerms(terms) {
  return terms.join(", ");
}
function TermsTokenInput({
  form,
  name,
  label,
  variant,
  placeholder
}) {
  const [draft, setDraft] = useState("");
  const styles = VARIANT_STYLES[variant];
  const Icon = styles.icon;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2 rounded-lg border border-base-300 bg-base-100 p-2.5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          className: `inline-flex size-4 items-center justify-center rounded ${styles.iconBg}`,
          children: /* @__PURE__ */ jsx(Icon, { className: "size-2.5" })
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-base-content/60", children: label })
    ] }),
    /* @__PURE__ */ jsx(form.Field, { name, children: (field) => {
      const terms = splitTerms(field.state.value);
      const commit = (next) => {
        field.handleChange(joinTerms([...new Set(next)]));
      };
      const addFromDraft = () => {
        const parsed = splitTerms(draft);
        if (parsed.length > 0) {
          commit([...terms, ...parsed]);
          setDraft("");
        }
      };
      const handleKeyDown = (event) => {
        if (event.key === "Enter" || event.key === ",") {
          event.preventDefault();
          addFromDraft();
        } else if (event.key === "Backspace" && draft.length === 0 && terms.length > 0) {
          commit(terms.slice(0, -1));
        }
      };
      return /* @__PURE__ */ jsxs("div", { className: "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-base-300 bg-base-200/30 px-2 py-1.5 focus-within:border-primary", children: [
        terms.map((term) => /* @__PURE__ */ jsxs(
          "span",
          {
            className: `inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs ${styles.chip}`,
            children: [
              term,
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: "opacity-70 hover:opacity-100",
                  "aria-label": `Remove ${term}`,
                  onClick: () => commit(terms.filter((existing) => existing !== term)),
                  children: /* @__PURE__ */ jsx(X, { className: "size-3" })
                }
              )
            ]
          },
          term
        )),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: draft,
            onChange: (event) => setDraft(event.target.value),
            onKeyDown: handleKeyDown,
            onBlur: addFromDraft,
            placeholder: terms.length === 0 ? placeholder : "",
            className: "min-w-[6rem] flex-1 bg-transparent text-xs outline-none placeholder:text-base-content/40"
          }
        )
      ] });
    } })
  ] });
}
function FilterRangeInputs({
  form,
  title,
  minName,
  maxName,
  step,
  min,
  max
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2 rounded-lg border border-base-300 bg-base-100 p-2.5", children: [
    /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-base-content/60", children: title }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsx(
        CompactRangeInput,
        {
          form,
          name: minName,
          placeholder: "Min",
          step,
          min,
          max
        }
      ),
      /* @__PURE__ */ jsx(
        CompactRangeInput,
        {
          form,
          name: maxName,
          placeholder: "Max",
          step,
          min,
          max
        }
      )
    ] })
  ] });
}
function CompactRangeInput({
  form,
  name,
  placeholder,
  step,
  min,
  max
}) {
  return /* @__PURE__ */ jsx(form.Field, { name, children: (field) => /* @__PURE__ */ jsx(
    "input",
    {
      className: "input input-bordered input-xs bg-base-100",
      placeholder,
      type: "number",
      step,
      min,
      max,
      value: field.state.value,
      onChange: (event) => field.handleChange(event.target.value)
    }
  ) });
}
function ManageTagRow({
  tag,
  isBusy,
  onSave,
  onDelete,
  onCancel
}) {
  const [name, setName] = useState(tag.name);
  const currentColor = resolveTagColor(tag);
  const [color, setColor] = useState(currentColor);
  const nameChanged = name.trim() !== tag.name && name.trim().length > 0;
  const colorChanged = color !== currentColor;
  const canSave = (nameChanged || colorChanged) && !isBusy;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2 border-y border-base-300 bg-base-200/40 px-3 py-2.5", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsx("label", { className: "text-[11px] font-semibold uppercase tracking-wide text-base-content/55", children: "Rename" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx(Pencil, { className: "size-3 opacity-50" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: name,
            onChange: (event) => setName(event.target.value),
            className: "min-w-0 flex-1 rounded border border-base-300 bg-base-100 px-2 py-1 text-sm outline-none focus:border-primary"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsx("label", { className: "text-[11px] font-semibold uppercase tracking-wide text-base-content/55", children: "Color" }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-1.5", children: TAG_COLOR_KEYS.map((key) => /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          "aria-label": key,
          className: `size-5 rounded-full transition ${tagSwatchClass(key)} ${color === key ? "ring-2 ring-offset-2 ring-offset-base-200 ring-base-content/40" : "hover:scale-110"}`,
          onClick: () => setColor(key)
        },
        key
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-1", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "inline-flex items-center gap-1 text-xs text-error hover:underline disabled:opacity-50",
          onClick: onDelete,
          disabled: isBusy,
          children: [
            /* @__PURE__ */ jsx(Trash2, { className: "size-3" }),
            "Delete"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "rounded px-2 py-1 text-xs text-base-content/70 hover:bg-base-300",
            onClick: onCancel,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "rounded bg-primary px-2 py-1 text-xs font-medium text-primary-content disabled:opacity-50",
            disabled: !canSave,
            onClick: () => onSave({
              name: nameChanged ? name.trim() : void 0,
              color: colorChanged ? color : void 0
            }),
            children: "Save"
          }
        )
      ] })
    ] })
  ] });
}
function SavedKeywordsTagFilter({
  availableTags,
  selectedTagIds,
  onToggleTagFilter,
  onClearSelection,
  onUpdateTag,
  onDeleteTag,
  busyTagIds
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [managingTagId, setManagingTagId] = useState(null);
  const containerRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const handleClick = (event) => {
      const target = event.target;
      if (target instanceof Node && containerRef.current && containerRef.current.contains(target)) {
        return;
      }
      setOpen(false);
      setManagingTagId(null);
    };
    const handleKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setManagingTagId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);
  const filteredTags = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    if (!q) return availableTags;
    return availableTags.filter((tag) => tag.normalizedName.includes(q));
  }, [availableTags, query]);
  const selectedTags = availableTags.filter(
    (tag) => selectedTagIds.includes(tag.id)
  );
  const hasSelection = selectedTagIds.length > 0;
  return /* @__PURE__ */ jsxs("div", { ref: containerRef, className: "relative", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: `inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm transition ${hasSelection ? "border-primary/50 bg-primary/10 text-base-content" : "border-base-300 bg-base-100 hover:border-base-content/30"}`,
        onClick: () => setOpen((v) => !v),
        children: [
          /* @__PURE__ */ jsx(Tag, { className: "size-3.5 opacity-70" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Tags" }),
          hasSelection ? /* @__PURE__ */ jsx("span", { className: "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-content", children: selectedTags.length }) : null,
          /* @__PURE__ */ jsx(ChevronDown, { className: "size-3.5 opacity-60" })
        ]
      }
    ),
    selectedTags.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-1.5", children: [
      selectedTags.map((tag) => /* @__PURE__ */ jsx(
        TagChip,
        {
          tag,
          size: "sm",
          selected: true,
          onClick: () => onToggleTagFilter(tag.id),
          trailing: /* @__PURE__ */ jsx(X, { className: "size-3 opacity-70" }),
          title: "Remove filter"
        },
        tag.id
      )),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "text-xs text-base-content/60 underline-offset-2 hover:text-base-content hover:underline",
          onClick: onClearSelection,
          children: "Clear"
        }
      )
    ] }) : null,
    open ? /* @__PURE__ */ jsx(
      TagFilterPopover,
      {
        availableTags,
        filteredTags,
        selectedTagIds,
        query,
        managingTagId,
        busyTagIds,
        onQueryChange: setQuery,
        onToggleTagFilter,
        onStartManaging: setManagingTagId,
        onUpdateTag: (tagId, input) => {
          onUpdateTag({ tagId, ...input });
          setManagingTagId(null);
        },
        onDeleteTag: (tagId) => {
          onDeleteTag(tagId);
          setManagingTagId(null);
        },
        onClearSelection
      }
    ) : null
  ] });
}
function TagFilterPopover({
  availableTags,
  filteredTags,
  selectedTagIds,
  query,
  managingTagId,
  busyTagIds,
  onQueryChange,
  onToggleTagFilter,
  onStartManaging,
  onUpdateTag,
  onDeleteTag,
  onClearSelection
}) {
  return /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-full z-20 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-2xl", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b border-base-300 p-2", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 rounded-md border border-base-300 bg-base-200/50 px-2 py-1.5", children: [
      /* @__PURE__ */ jsx(Search, { className: "size-3.5 opacity-50" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          autoFocus: true,
          value: query,
          onChange: (event) => onQueryChange(event.target.value),
          placeholder: "Search tags…",
          className: "min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-base-content/40"
        }
      ),
      query ? /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "text-base-content/40 hover:text-base-content",
          onClick: () => onQueryChange(""),
          children: /* @__PURE__ */ jsx(X, { className: "size-3.5" })
        }
      ) : null
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "max-h-72 overflow-y-auto py-1", children: [
      filteredTags.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-3 py-6 text-center text-xs text-base-content/55", children: availableTags.length === 0 ? "No tags yet. Add tags from a selection of keywords." : "No tags match that search." }) : null,
      filteredTags.map((tag) => /* @__PURE__ */ jsx(
        TagFilterRow,
        {
          tag,
          checked: selectedTagIds.includes(tag.id),
          isManaging: managingTagId === tag.id,
          isBusy: busyTagIds.has(tag.id),
          onToggle: () => onToggleTagFilter(tag.id),
          onStartManaging,
          onUpdate: (input) => onUpdateTag(tag.id, input),
          onDelete: () => onDeleteTag(tag.id)
        },
        tag.id
      ))
    ] }),
    selectedTagIds.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-t border-base-300 px-2 py-1.5 text-xs", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-base-content/55", children: [
        selectedTagIds.length,
        " selected"
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "rounded px-2 py-1 text-base-content/70 hover:bg-base-200",
          onClick: onClearSelection,
          children: "Clear all"
        }
      )
    ] }) : null
  ] });
}
function TagFilterRow({
  tag,
  checked,
  isManaging,
  isBusy,
  onToggle,
  onStartManaging,
  onUpdate,
  onDelete
}) {
  const color = resolveTagColor(tag);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "group flex items-center gap-2 px-2 py-1.5 hover:bg-base-200", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "flex min-w-0 flex-1 items-center gap-2 text-left",
          onClick: onToggle,
          children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: `flex size-4 shrink-0 items-center justify-center rounded border ${checked ? "border-primary bg-primary text-primary-content" : "border-base-300"}`,
                children: checked ? /* @__PURE__ */ jsx(Check, { className: "size-3" }) : null
              }
            ),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: `size-2 shrink-0 rounded-full ${tagDotClass(color)}`
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate text-sm", children: tag.name }),
            /* @__PURE__ */ jsx("span", { className: "shrink-0 text-[11px] tabular-nums text-base-content/45", children: tag.keywordCount })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: `rounded p-1 text-base-content/45 hover:bg-base-300 hover:text-base-content ${isManaging ? "bg-base-300 text-base-content" : ""}`,
          onClick: () => onStartManaging(isManaging ? null : tag.id),
          "aria-label": `Manage ${tag.name}`,
          children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "size-3.5" })
        }
      )
    ] }),
    isManaging ? /* @__PURE__ */ jsx(
      ManageTagRow,
      {
        tag,
        isBusy,
        onSave: onUpdate,
        onDelete,
        onCancel: () => onStartManaging(null)
      }
    ) : null
  ] });
}
function SavedKeywordsFilters({
  filtersForm,
  activeFilterCount,
  showFilters,
  onToggleFilters,
  onResetAllFilters,
  availableTags,
  selectedTagIds,
  busyTagIds,
  onToggleTagFilter,
  onClearTagSelection,
  onUpdateTag,
  onDeleteTag
}) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 border-b border-base-300 px-4 py-2.5", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: `btn btn-ghost btn-sm gap-1.5 ${showFilters ? "btn-active" : ""}`,
          onClick: onToggleFilters,
          title: "Toggle table filters",
          children: [
            /* @__PURE__ */ jsx(SlidersHorizontal, { className: "size-3.5" }),
            "Filters",
            activeFilterCount > 0 ? /* @__PURE__ */ jsx("span", { className: "badge badge-xs badge-primary border-0 text-primary-content", children: activeFilterCount }) : null
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        SavedKeywordsTagFilter,
        {
          availableTags,
          selectedTagIds,
          busyTagIds,
          onToggleTagFilter,
          onClearSelection: onClearTagSelection,
          onUpdateTag,
          onDeleteTag
        }
      )
    ] }),
    showFilters ? /* @__PURE__ */ jsx(
      SavedKeywordsFilterPanel,
      {
        form: filtersForm,
        activeFilterCount,
        onReset: onResetAllFilters
      }
    ) : null
  ] });
}
function SavedKeywordsHeader({
  totalCount,
  exporting,
  metricsRefreshing,
  onExportCsv,
  onExportSheets,
  onRefreshMetrics
}) {
  const disabled = totalCount === 0 || exporting != null;
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Saved Keywords" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: "Save keyword ideas from research, organize them with tags, and revisit when you're ready to act." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "dropdown dropdown-end", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            tabIndex: 0,
            disabled: disabled || metricsRefreshing,
            "aria-haspopup": "menu",
            className: `btn btn-ghost btn-sm gap-1.5 ${disabled || metricsRefreshing ? "btn-disabled" : ""}`,
            children: [
              /* @__PURE__ */ jsx(
                RefreshCw,
                {
                  className: `size-4 ${metricsRefreshing ? "animate-spin" : ""}`
                }
              ),
              metricsRefreshing ? "Updating..." : "Actions",
              /* @__PURE__ */ jsx(ChevronDown, { className: "size-3 opacity-60" })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "ul",
          {
            tabIndex: 0,
            role: "menu",
            className: "dropdown-content menu z-10 w-64 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg",
            children: /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: onRefreshMetrics,
                disabled: disabled || metricsRefreshing,
                children: [
                  /* @__PURE__ */ jsx(RefreshCw, { className: "size-4" }),
                  /* @__PURE__ */ jsxs("span", { className: "flex flex-col items-start", children: [
                    /* @__PURE__ */ jsx("span", { children: "Update keyword stats" }),
                    /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/50", children: "Volume, difficulty & CPC" })
                  ] })
                ]
              }
            ) })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "dropdown dropdown-end", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            tabIndex: 0,
            disabled,
            "aria-haspopup": "menu",
            className: `btn btn-ghost btn-sm gap-1.5 ${disabled ? "btn-disabled" : ""}`,
            children: [
              exporting != null ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsx(Download, { className: "size-4" }),
              "Export",
              /* @__PURE__ */ jsx(ChevronDown, { className: "size-3 opacity-60" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "ul",
          {
            tabIndex: 0,
            role: "menu",
            className: "dropdown-content menu z-10 w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg",
            children: [
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: onExportSheets,
                  disabled,
                  children: [
                    /* @__PURE__ */ jsx(Sheet, { className: "size-4" }),
                    "Export to Sheets"
                  ]
                }
              ) }),
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", { type: "button", onClick: onExportCsv, disabled, children: [
                /* @__PURE__ */ jsx(FileDown, { className: "size-4" }),
                "Export CSV"
              ] }) })
            ]
          }
        )
      ] })
    ] })
  ] });
}
function RemoveSavedKeywordsError({ message }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error", children: [
    /* @__PURE__ */ jsx(AlertCircle, { className: "mt-0.5 size-4 shrink-0" }),
    /* @__PURE__ */ jsx("span", { children: message })
  ] });
}
function DeleteSavedKeywordsModal({
  selectedCount,
  isPending,
  onClose,
  onConfirm
}) {
  return /* @__PURE__ */ jsxs(Modal, { onClose, labelledBy: "delete-keywords-title", children: [
    /* @__PURE__ */ jsx("h3", { id: "delete-keywords-title", className: "text-lg font-semibold", children: "Delete keywords?" }),
    /* @__PURE__ */ jsxs("p", { className: "text-sm text-base-content/70", children: [
      "This will permanently delete ",
      selectedCount,
      " saved keyword",
      selectedCount !== 1 ? "s" : "",
      "."
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "btn btn-ghost btn-sm",
          onClick: onClose,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "btn btn-error btn-sm gap-1",
          onClick: onConfirm,
          disabled: isPending,
          children: [
            isPending ? /* @__PURE__ */ jsx(Loader2, { className: "size-3 animate-spin" }) : null,
            "Delete ",
            selectedCount,
            " keyword",
            selectedCount !== 1 ? "s" : ""
          ]
        }
      )
    ] })
  ] });
}
const SAVED_KEYWORD_PAGE_SIZES = [50, 100, 250];
const SAVED_KEYWORD_EXPORT_HEADERS = [
  ...KEYWORD_RESEARCH_HEADERS,
  "Tags",
  "Fetched At"
];
function savedKeywordExportRow(row) {
  return [
    row.keyword,
    row.searchVolume ?? "",
    row.cpc ?? "",
    row.competition ?? "",
    row.keywordDifficulty ?? "",
    row.intent ?? "",
    row.tags.map((tag) => tag.name).join(", "),
    row.fetchedAt ?? ""
  ];
}
function toSavedKeywordSort(value) {
  if (value === "keyword" || value === "searchVolume" || value === "cpc" || value === "competition" || value === "keywordDifficulty" || value === "fetchedAt") {
    return value;
  }
  return "createdAt";
}
function formatSavedKeywordNumber(value) {
  if (value == null) return "-";
  return new Intl.NumberFormat().format(value);
}
function formatSavedKeywordDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}
function SavedKeywordsPagination({
  page,
  pageSize,
  totalCount,
  isLoading,
  onPageChange,
  onPageSizeChange
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(totalCount, page * pageSize);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 border-t border-base-300 px-4 py-3 sm:flex-row sm:items-center sm:justify-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm tabular-nums text-base-content/70", children: [
      /* @__PURE__ */ jsxs("span", { children: [
        start.toLocaleString(),
        "-",
        end.toLocaleString(),
        " of",
        " ",
        totalCount.toLocaleString()
      ] }),
      isLoading ? /* @__PURE__ */ jsx(Loader2, { className: "size-3.5 animate-spin" }) : null
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
      /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-base-content/70", children: [
        /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap", children: "Rows per page" }),
        /* @__PURE__ */ jsx(
          "select",
          {
            className: "select select-bordered select-sm w-20",
            value: pageSize,
            onChange: (event) => onPageSizeChange(parsePageSize(event.target.value)),
            children: SAVED_KEYWORD_PAGE_SIZES.map((size) => /* @__PURE__ */ jsx("option", { value: size, children: size }, size))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("span", { className: "whitespace-nowrap text-sm tabular-nums text-base-content/70", children: [
          "Page ",
          page.toLocaleString(),
          " of ",
          totalPages.toLocaleString()
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-ghost btn-sm btn-square",
              disabled: page <= 1 || isLoading,
              onClick: () => onPageChange(page - 1),
              "aria-label": "Previous page",
              children: /* @__PURE__ */ jsx(ChevronLeft, { className: "size-4" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-ghost btn-sm btn-square",
              disabled: page >= totalPages || isLoading,
              onClick: () => onPageChange(page + 1),
              "aria-label": "Next page",
              children: /* @__PURE__ */ jsx(ChevronRight, { className: "size-4" })
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function parsePageSize(value) {
  const parsed = Number(value);
  return SAVED_KEYWORD_PAGE_SIZES.find((size) => size === parsed) ?? 50;
}
function SavedKeywordsStatus({
  totalCount,
  isFetching
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-1 text-xs text-base-content/60", children: [
    /* @__PURE__ */ jsxs("span", { children: [
      totalCount.toLocaleString(),
      " saved keyword",
      totalCount === 1 ? "" : "s"
    ] }),
    isFetching ? /* @__PURE__ */ jsx(Loader2, { className: "size-3 animate-spin" }) : null
  ] });
}
const columnHelper = createColumnHelper();
function SavedKeywordsTable({
  rows,
  rowSelection,
  sorting,
  isLoading,
  hasActiveFilters,
  onRowSelectionChange,
  onSortingChange
}) {
  const selectAnchorRef = useSelectionAnchor();
  const columns = useMemo(
    () => [
      makeSelectionColumn(selectAnchorRef),
      columnHelper.accessor("keyword", {
        header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "Keyword" }),
        cell: ({ getValue }) => /* @__PURE__ */ jsx("span", { className: "font-medium", children: getValue() })
      }),
      columnHelper.accessor("searchVolume", {
        header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "Volume" }),
        cell: ({ getValue }) => formatSavedKeywordNumber(getValue())
      }),
      columnHelper.accessor("cpc", {
        header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "CPC" }),
        cell: ({ getValue }) => {
          const value = getValue();
          return value == null ? "-" : `$${value.toFixed(2)}`;
        }
      }),
      columnHelper.accessor("competition", {
        header: ({ column }) => /* @__PURE__ */ jsx(
          SortableHeader,
          {
            column,
            label: "Competition",
            helpText: "Paid-search competition from Google Ads (0-1): higher means more advertisers bidding."
          }
        ),
        cell: ({ getValue }) => {
          const value = getValue();
          return value == null ? "-" : value.toFixed(2);
        }
      }),
      columnHelper.accessor("keywordDifficulty", {
        header: ({ column }) => /* @__PURE__ */ jsx(
          SortableHeader,
          {
            column,
            label: "Difficulty",
            helpText: "Organic ranking difficulty (0-100): higher means harder to reach Google's top 10."
          }
        ),
        cell: ({ getValue }) => /* @__PURE__ */ jsx(DifficultyBadge, { value: getValue() })
      }),
      columnHelper.accessor("intent", {
        header: () => "Intent",
        cell: ({ getValue }) => /* @__PURE__ */ jsx(IntentBadge, { intent: normalizeIntent(getValue()) }),
        enableSorting: false
      }),
      columnHelper.display({
        id: "tags",
        header: () => "Tags",
        cell: ({ row }) => /* @__PURE__ */ jsx(TagList, { tags: row.original.tags }),
        enableSorting: false,
        meta: { cellClassName: "min-w-40 max-w-64" }
      }),
      columnHelper.accessor("fetchedAt", {
        header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "Last Fetched" }),
        cell: ({ getValue }) => /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/55", children: formatSavedKeywordDate(getValue()) })
      })
    ],
    [selectAnchorRef]
  );
  const table = useAppTable({
    data: rows,
    columns,
    state: { rowSelection, sorting },
    onRowSelectionChange,
    onSortingChange,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    manualSorting: true
  });
  return /* @__PURE__ */ jsx(
    AppDataTable,
    {
      table,
      className: "table table-sm",
      isLoading,
      loading: /* @__PURE__ */ jsx(SavedKeywordsSkeleton, {}),
      empty: /* @__PURE__ */ jsx(SavedKeywordsEmptyState, { hasActiveFilters })
    }
  );
}
function normalizeIntent(value) {
  switch (value) {
    case "informational":
    case "commercial":
    case "transactional":
    case "navigational":
    case "unknown":
      return value;
    default:
      return "unknown";
  }
}
function TagList({ tags }) {
  if (tags.length === 0) {
    return /* @__PURE__ */ jsx("span", { className: "text-base-content/35", children: "-" });
  }
  return /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: tags.map((tag) => /* @__PURE__ */ jsx(TagChip, { tag, size: "xs" }, tag.id)) });
}
function SavedKeywordsSkeleton() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", "aria-busy": true, children: [
    /* @__PURE__ */ jsx("div", { className: "skeleton h-4 w-48" }),
    Array.from({ length: 8 }).map((_, index) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-9 items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "skeleton h-4" }),
      /* @__PURE__ */ jsx("div", { className: "skeleton col-span-2 h-4" }),
      /* @__PURE__ */ jsx("div", { className: "skeleton h-4" }),
      /* @__PURE__ */ jsx("div", { className: "skeleton h-4" }),
      /* @__PURE__ */ jsx("div", { className: "skeleton h-4" }),
      /* @__PURE__ */ jsx("div", { className: "skeleton h-4" }),
      /* @__PURE__ */ jsx("div", { className: "skeleton h-4" }),
      /* @__PURE__ */ jsx("div", { className: "skeleton h-4" })
    ] }, index))
  ] });
}
function SavedKeywordsEmptyState({
  hasActiveFilters
}) {
  return /* @__PURE__ */ jsxs("div", { className: "py-12 text-center text-sm text-base-content/55", children: [
    /* @__PURE__ */ jsx(Search, { className: "mx-auto mb-2 size-8 opacity-40" }),
    /* @__PURE__ */ jsx("p", { children: hasActiveFilters ? "No saved keywords match the current filters." : "No saved keywords yet. Use the Keyword Research page to find and save keywords." })
  ] });
}
const EMPTY_SAVED_KEYWORDS_FILTERS = {
  include: "",
  exclude: "",
  minVol: "",
  maxVol: "",
  minCpc: "",
  maxCpc: "",
  minKd: "",
  maxKd: ""
};
function parseTerms(value) {
  return value.toLowerCase().split(/[,+]/).map((term) => term.trim()).filter(Boolean);
}
function clamp(value, bounds) {
  if (bounds.min != null && value < bounds.min) return bounds.min;
  if (bounds.max != null && value > bounds.max) return bounds.max;
  return value;
}
function toIntOrUndef(value, bounds = {}) {
  if (!value.trim()) return void 0;
  const n = Number(value);
  if (!Number.isFinite(n)) return void 0;
  return Math.trunc(clamp(n, bounds));
}
function toFloatOrUndef(value, bounds = {}) {
  if (!value.trim()) return void 0;
  const n = Number(value);
  if (!Number.isFinite(n)) return void 0;
  return clamp(n, bounds);
}
function compileSavedKeywordsFilters(values) {
  const includeTerms = parseTerms(values.include);
  const excludeTerms = parseTerms(values.exclude);
  return {
    includeTerms: includeTerms.length > 0 ? includeTerms : void 0,
    excludeTerms: excludeTerms.length > 0 ? excludeTerms : void 0,
    minVolume: toIntOrUndef(values.minVol, { min: 0 }),
    maxVolume: toIntOrUndef(values.maxVol, { min: 0 }),
    minCpc: toFloatOrUndef(values.minCpc, { min: 0 }),
    maxCpc: toFloatOrUndef(values.maxCpc, { min: 0 }),
    minDifficulty: toIntOrUndef(values.minKd, { min: 0, max: 100 }),
    maxDifficulty: toIntOrUndef(values.maxKd, { min: 0, max: 100 })
  };
}
function countActiveSavedKeywordsFilters(values) {
  return Object.values(values).filter((value) => value.trim() !== "").length;
}
function useSavedKeywordsExport(params) {
  const [exporting, setExporting] = useState(null);
  const [exportingSelection, setExportingSelection] = useState(null);
  const exportInput = useMemo(
    () => ({
      projectId: params.projectId,
      ...params.appliedFilters,
      tagIds: params.selectedTagIds.length > 0 ? params.selectedTagIds : void 0,
      sort: params.sort,
      order: params.order
    }),
    [
      params.appliedFilters,
      params.order,
      params.projectId,
      params.selectedTagIds,
      params.sort
    ]
  );
  const loadFilteredRows = async () => {
    const result = await exportSavedKeywords({ data: exportInput });
    return result.rows;
  };
  const exportFilteredCsv = async () => {
    setExporting("csv");
    try {
      const rows = await loadFilteredRows();
      if (rows.length === 0) {
        toast.error("No keywords to export");
        return;
      }
      downloadKeywordCsv(rows);
      captureClientEvent("data:export", {
        source_feature: "saved_keywords",
        result_count: rows.length
      });
    } catch (error) {
      toast.error(getStandardErrorMessage(error, "Could not export CSV"));
    } finally {
      setExporting(null);
    }
  };
  const exportFilteredSheets = async () => {
    setExporting("sheets");
    try {
      const rows = await loadFilteredRows();
      await exportTableToSheets({
        headers: SAVED_KEYWORD_EXPORT_HEADERS,
        rows: rows.map(savedKeywordExportRow),
        feature: "saved_keywords"
      });
    } catch (error) {
      toast.error(getStandardErrorMessage(error, "Could not export to Sheets"));
    } finally {
      setExporting(null);
    }
  };
  const exportSelectionCsv = (selectedRows) => {
    if (selectedRows.length === 0) return;
    setExportingSelection("csv");
    try {
      downloadKeywordCsv(selectedRows);
      captureClientEvent("data:export", {
        source_feature: "saved_keywords",
        result_count: selectedRows.length,
        scope: "selection"
      });
    } finally {
      setExportingSelection(null);
    }
  };
  const exportSelectionSheets = async (selectedRows) => {
    if (selectedRows.length === 0) return;
    setExportingSelection("sheets");
    try {
      await exportTableToSheets({
        headers: SAVED_KEYWORD_EXPORT_HEADERS,
        rows: selectedRows.map(savedKeywordExportRow),
        feature: "saved_keywords"
      });
    } catch (error) {
      toast.error(getStandardErrorMessage(error, "Could not export to Sheets"));
    } finally {
      setExportingSelection(null);
    }
  };
  return {
    exporting,
    exportingSelection,
    exportFilteredCsv,
    exportFilteredSheets,
    exportSelectionCsv,
    exportSelectionSheets
  };
}
function downloadKeywordCsv(rows) {
  const csvRows = rows.map(savedKeywordExportRow).map(
    (row) => row.map(
      (cell, index) => (index === 2 || index === 3) && typeof cell === "number" ? cell.toFixed(2) : cell
    )
  );
  downloadCsv(
    "saved-keywords.csv",
    buildCsv(SAVED_KEYWORD_EXPORT_HEADERS, csvRows)
  );
}
const FILTER_KEYS = [
  "include",
  "exclude",
  "minVol",
  "maxVol",
  "minCpc",
  "maxCpc",
  "minKd",
  "maxKd"
];
function useSavedKeywordsFilters() {
  const filtersForm = useForm({ defaultValues: EMPTY_SAVED_KEYWORDS_FILTERS });
  const values = useStore(filtersForm.store, (s) => s.values);
  const activeFilterCount = countActiveSavedKeywordsFilters(values);
  const resetFilters = useCallback(() => {
    for (const key of FILTER_KEYS) {
      filtersForm.setFieldValue(key, "");
    }
  }, [filtersForm]);
  return { filtersForm, values, activeFilterCount, resetFilters };
}
function useTagManage(projectId) {
  const queryClient = useQueryClient();
  const [busyTagIds, setBusyTagIds] = useState(/* @__PURE__ */ new Set());
  const markBusy = (tagId, busy) => {
    setBusyTagIds((current) => {
      const next = new Set(current);
      if (busy) next.add(tagId);
      else next.delete(tagId);
      return next;
    });
  };
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["savedKeywords", projectId] });
  const updateTag = async (input) => {
    markBusy(input.tagId, true);
    try {
      await updateSavedKeywordTag({
        data: {
          projectId,
          tagId: input.tagId,
          name: input.name,
          color: input.color ?? void 0
        }
      });
      await invalidate();
      toast.success("Tag updated");
    } catch (error) {
      toast.error(getStandardErrorMessage(error, "Could not update tag"));
    } finally {
      markBusy(input.tagId, false);
    }
  };
  const deleteTag = async (tagId) => {
    markBusy(tagId, true);
    try {
      await deleteSavedKeywordTag({ data: { projectId, tagId } });
      await invalidate();
      toast.success("Tag deleted");
      return true;
    } catch (error) {
      toast.error(
        getStandardErrorMessage(
          error,
          "Could not delete tag. Detach it from all keywords and try again."
        )
      );
      return false;
    } finally {
      markBusy(tagId, false);
    }
  };
  return { busyTagIds, updateTag, deleteTag };
}
const FILTER_DEBOUNCE_MS = 350;
function SavedKeywordsPage() {
  const {
    projectId
  } = Route.useParams();
  const queryClient = useQueryClient();
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sorting, setSorting] = useState([{
    id: "fetchedAt",
    desc: true
  }]);
  const [rowSelection, setRowSelection] = useState({});
  const [removeError, setRemoveError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const filters = useSavedKeywordsFilters();
  const [committedFilterValues, setCommittedFilterValues] = useState(filters.values);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCommittedFilterValues(filters.values);
      setPage(1);
    }, FILTER_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [filters.values]);
  const appliedFilters = useMemo(() => compileSavedKeywordsFilters(committedFilterValues), [committedFilterValues]);
  const exportFilters = useMemo(() => compileSavedKeywordsFilters(filters.values), [filters.values]);
  const sortState = sorting[0];
  const sort = toSavedKeywordSort(sortState?.id);
  const order = sortState ? sortState.desc ? "desc" : "asc" : "desc";
  const tagFilterKey = selectedTagIds.join("|");
  const hasActiveFilters = filters.activeFilterCount > 0 || selectedTagIds.length > 0;
  const queryInput = useMemo(() => ({
    projectId,
    ...appliedFilters,
    tagIds: selectedTagIds.length > 0 ? selectedTagIds : void 0,
    page,
    pageSize,
    sort,
    order
  }), [appliedFilters, order, page, pageSize, projectId, selectedTagIds, sort]);
  const {
    data,
    isLoading,
    isFetching
  } = useQuery({
    queryKey: ["savedKeywords", projectId, queryInput],
    queryFn: () => getSavedKeywords({
      data: queryInput
    }),
    placeholderData: keepPreviousData
  });
  const savedKeywords = data?.rows ?? [];
  const availableTags = data?.tags ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const selectedRows = savedKeywords.filter((row) => rowSelection[row.id]);
  const selectedIds = selectedRows.map((row) => row.id);
  const selectedCount = selectedIds.length;
  const selectedRowTags = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const row of selectedRows) {
      for (const tag of row.tags) {
        if (!map.has(tag.id)) map.set(tag.id, tag);
      }
    }
    return [...map.values()].toSorted((a, b) => a.normalizedName.localeCompare(b.normalizedName));
  }, [selectedRows]);
  useEffect(() => {
    setRowSelection({});
  }, [page, pageSize, appliedFilters, tagFilterKey, sort, order]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const invalidateSavedKeywords = () => queryClient.invalidateQueries({
    queryKey: ["savedKeywords", projectId]
  });
  const removeMutation = useMutation({
    mutationFn: (savedKeywordIds) => removeSavedKeywords({
      data: {
        projectId,
        savedKeywordIds
      }
    }),
    onSuccess: (result) => {
      setRowSelection({});
      setShowConfirm(false);
      setRemoveError(null);
      void invalidateSavedKeywords();
      captureClientEvent("saved_keywords:bulk_remove", {
        count: result.deletedCount
      });
      toast.success(`${result.deletedCount} keyword${result.deletedCount !== 1 ? "s" : ""} removed`);
    },
    onError: (error) => {
      setRemoveError(getStandardErrorMessage(error, "Remove failed."));
    }
  });
  const tagMutation = useMutation({
    mutationFn: (input) => updateSavedKeywordTags({
      data: {
        projectId,
        savedKeywordIds: input.savedKeywordIds,
        addTags: input.addTags,
        removeTagIds: input.removeTagIds
      }
    }),
    onSuccess: (result) => {
      setRowSelection({});
      setShowTagModal(false);
      void invalidateSavedKeywords();
      toast.success(`Updated tags for ${result.taggedCount} keyword${result.taggedCount !== 1 ? "s" : ""}`);
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Could not update tags"));
    }
  });
  const refreshMetricsMutation = useMutation({
    mutationFn: () => refreshSavedKeywordMetrics({
      data: {
        projectId
      }
    }),
    onSuccess: (result) => {
      void invalidateSavedKeywords();
      toast.success(`Updated stats for ${result.updated} keyword${result.updated !== 1 ? "s" : ""}`);
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Could not update keyword stats."));
    }
  });
  const tagManage = useTagManage(projectId);
  const exporter = useSavedKeywordsExport({
    projectId,
    appliedFilters: exportFilters,
    selectedTagIds,
    sort,
    order
  });
  const handleSortingChange = (updater) => {
    setSorting((current) => typeof updater === "function" ? updater(current) : updater);
    setPage(1);
  };
  const handleDeleteTag = async (tagId) => {
    const ok = await tagManage.deleteTag(tagId);
    if (ok) {
      setSelectedTagIds((current) => current.filter((id) => id !== tagId));
    }
  };
  const handleClearAllFilters = () => {
    filters.resetFilters();
    setSelectedTagIds([]);
    setPage(1);
  };
  return /* @__PURE__ */ jsx("div", { className: "overflow-auto px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-8", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl space-y-4", children: [
    /* @__PURE__ */ jsx(SavedKeywordsHeader, { totalCount, exporting: exporter.exporting, metricsRefreshing: refreshMetricsMutation.isPending, onExportCsv: () => void exporter.exportFilteredCsv(), onExportSheets: () => void exporter.exportFilteredSheets(), onRefreshMetrics: () => refreshMetricsMutation.mutate() }),
    /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-lg border border-base-300 bg-base-100", children: [
      /* @__PURE__ */ jsx(SavedKeywordsFilters, { filtersForm: filters.filtersForm, activeFilterCount: filters.activeFilterCount, showFilters, onToggleFilters: () => setShowFilters((v) => !v), onResetAllFilters: handleClearAllFilters, availableTags, selectedTagIds, busyTagIds: tagManage.busyTagIds, onToggleTagFilter: (tagId) => {
        setSelectedTagIds((current) => current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId]);
        setPage(1);
      }, onClearTagSelection: () => {
        setSelectedTagIds([]);
        setPage(1);
      }, onUpdateTag: (input) => void tagManage.updateTag(input), onDeleteTag: (tagId) => void handleDeleteTag(tagId) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 p-4", children: [
        removeError ? /* @__PURE__ */ jsx(RemoveSavedKeywordsError, { message: removeError }) : null,
        /* @__PURE__ */ jsx(SavedKeywordsStatus, { totalCount, isFetching: isFetching && !isLoading }),
        /* @__PURE__ */ jsx(SavedKeywordsTable, { rows: savedKeywords, rowSelection, sorting, isLoading, hasActiveFilters, onRowSelectionChange: setRowSelection, onSortingChange: handleSortingChange })
      ] }),
      /* @__PURE__ */ jsx(SavedKeywordsPagination, { page, pageSize, totalCount, isLoading: isFetching, onPageChange: setPage, onPageSizeChange: (nextPageSize) => {
        setPageSize(nextPageSize);
        setPage(1);
      } })
    ] }),
    /* @__PURE__ */ jsx(SavedKeywordsBulkActionBar, { selectedCount, exportingSelection: exporter.exportingSelection, onCopy: () => {
      void navigator.clipboard.writeText(selectedRows.map((row) => row.keyword).join("\n"));
      toast.success(`${selectedCount} keyword${selectedCount !== 1 ? "s" : ""} copied`);
    }, onOpenTags: () => setShowTagModal(true), onExportCsv: () => exporter.exportSelectionCsv(selectedRows), onExportSheets: () => void exporter.exportSelectionSheets(selectedRows), onDelete: () => setShowConfirm(true), onClear: () => setRowSelection({}) }),
    showConfirm ? /* @__PURE__ */ jsx(DeleteSavedKeywordsModal, { selectedCount, isPending: removeMutation.isPending, onClose: () => setShowConfirm(false), onConfirm: () => removeMutation.mutate(selectedIds) }) : null,
    showTagModal ? /* @__PURE__ */ jsx(SavedKeywordsBulkTagsModal, { availableTags, selectedCount, selectedRowTags, isPending: tagMutation.isPending, onClose: () => setShowTagModal(false), onApply: ({
      addTags,
      removeTagIds
    }) => tagMutation.mutate({
      savedKeywordIds: selectedIds,
      addTags,
      removeTagIds
    }) }) : null
  ] }) });
}
export {
  SavedKeywordsPage as component
};
