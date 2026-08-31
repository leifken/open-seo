import { jsxs, jsx } from "react/jsx-runtime";
import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { RotateCcw, AlertTriangle } from "lucide-react";
import { bw as MAX_DATAFORSEO_FILTER_CONDITIONS } from "../entry.js";
function isDomainDebugEnabled() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("debug:domain-overview") === "1" || new URLSearchParams(window.location.search).get("debugDomain") === "1";
}
function debugDomain(event, payload) {
  if (!isDomainDebugEnabled()) return;
  const entry = {
    event,
    t: Math.round(performance.now()),
    ...payload
  };
  console.info("[domain-debug]", JSON.stringify(entry));
}
function useDomainRenderDebug(name, payload) {
  const countRef = useRef(0);
  countRef.current += 1;
  useEffect(() => {
    debugDomain(`${name}:render`, {
      count: countRef.current,
      ...payload
    });
  });
}
function FilterFieldLabel({ children }) {
  return /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold uppercase tracking-wide text-base-content/60", children });
}
function FilterTextInput({
  label,
  value,
  onChange,
  placeholder
}) {
  return /* @__PURE__ */ jsxs("label", { className: "form-control gap-1.5", children: [
    /* @__PURE__ */ jsx(FilterFieldLabel, { children: label }),
    /* @__PURE__ */ jsx(
      "input",
      {
        className: "input input-bordered input-sm w-full bg-base-100",
        placeholder,
        value,
        onChange: (event) => onChange(event.target.value)
      }
    )
  ] });
}
function FilterNumberInput({
  value,
  onChange,
  placeholder,
  step
}) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      className: "input input-bordered input-xs bg-base-100",
      type: "text",
      inputMode: "decimal",
      step,
      value,
      placeholder,
      onChange: (event) => onChange(event.target.value)
    }
  );
}
function FilterRangeGroup({
  title,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-base-300 bg-base-100 p-2.5 space-y-2", children: [
    /* @__PURE__ */ jsx(FilterFieldLabel, { children: title }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children })
  ] });
}
function DomainFilterPanel({
  debugName,
  activeFilterCount,
  appliedFilters,
  fields,
  textFields,
  rangeFields,
  countConditions,
  maxConditions = MAX_DATAFORSEO_FILTER_CONDITIONS,
  onApply,
  onClear,
  renderExtra
}) {
  const appliedKey = useMemo(
    () => fields.map((key) => appliedFilters[key]).join("|"),
    [appliedFilters, fields]
  );
  const [draftFilters, setDraftFilters] = useState(appliedFilters);
  useEffect(() => {
    setDraftFilters(appliedFilters);
  }, [appliedKey]);
  const meta = useMemo(
    () => getFilterMeta({
      values: draftFilters,
      appliedFilters,
      fields,
      countConditions,
      maxConditions
    }),
    [appliedFilters, countConditions, draftFilters, fields, maxConditions]
  );
  useDomainRenderDebug(debugName, {
    activeFilterCount,
    conditionCount: meta.conditionCount,
    dirtyCount: meta.dirtyCount
  });
  const applyFilters = useCallback(() => {
    if (meta.overLimit) return;
    debugDomain(`${debugName}:apply`, {
      conditionCount: meta.conditionCount,
      dirtyCount: meta.dirtyCount,
      draftFilters
    });
    onApply(draftFilters);
  }, [
    debugName,
    draftFilters,
    meta.conditionCount,
    meta.dirtyCount,
    meta.overLimit,
    onApply
  ]);
  const cancelFilterEdits = useCallback(() => {
    debugDomain(`${debugName}:cancel`);
    setDraftFilters(appliedFilters);
  }, [appliedFilters, debugName]);
  const resetFilters = useCallback(() => {
    debugDomain(`${debugName}:clear`);
    setDraftFilters((current) => {
      const next = { ...current };
      for (const key of fields) Object.assign(next, { [key]: "" });
      return next;
    });
    onClear();
  }, [debugName, fields, onClear]);
  const handleKeyDown = (event) => {
    if (event.key !== "Enter") return;
    if (event.target instanceof HTMLButtonElement) return;
    if (meta.overLimit) return;
    event.preventDefault();
    applyFilters();
  };
  const handleValueChange = useCallback(
    (key, value) => {
      debugDomain(`${debugName}:draft-change`, {
        field: String(key),
        valueLength: value.length
      });
      setDraftFilters((current) => ({ ...current, [key]: value }));
    },
    [debugName]
  );
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "border-b border-base-300 bg-gradient-to-b from-base-100 to-base-200/30 px-4 py-3 space-y-3",
      onKeyDown: handleKeyDown,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "Refine table results" }),
            activeFilterCount > 0 ? /* @__PURE__ */ jsxs("span", { className: "badge badge-xs badge-primary border-0 text-primary-content", children: [
              activeFilterCount,
              " active"
            ] }) : null,
            meta.dirtyCount > 0 ? /* @__PURE__ */ jsxs("span", { className: "badge badge-xs badge-warning border-0", children: [
              meta.dirtyCount,
              " unapplied"
            ] }) : null
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              className: "btn btn-xs btn-ghost gap-1",
              onClick: resetFilters,
              disabled: activeFilterCount === 0 && !meta.isDirty,
              children: [
                /* @__PURE__ */ jsx(RotateCcw, { className: "size-3" }),
                "Clear all"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-3 lg:grid-cols-2", children: textFields.map((field) => /* @__PURE__ */ jsx(
          FilterTextInput,
          {
            label: field.label,
            placeholder: field.placeholder,
            value: draftFilters[field.key],
            onChange: (value) => handleValueChange(field.key, value)
          },
          String(field.key)
        )) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5", children: rangeFields.map((field) => /* @__PURE__ */ jsxs(FilterRangeGroup, { title: field.title, children: [
          /* @__PURE__ */ jsx(
            FilterNumberInput,
            {
              value: draftFilters[field.minKey],
              onChange: (value) => handleValueChange(field.minKey, value),
              placeholder: "Min",
              step: field.step
            }
          ),
          /* @__PURE__ */ jsx(
            FilterNumberInput,
            {
              value: draftFilters[field.maxKey],
              onChange: (value) => handleValueChange(field.maxKey, value),
              placeholder: "Max",
              step: field.step
            }
          )
        ] }, String(field.minKey))) }),
        renderExtra ? renderExtra(draftFilters, handleValueChange) : null,
        meta.overLimit ? /* @__PURE__ */ jsxs("div", { className: "alert alert-warning py-2 text-xs", children: [
          /* @__PURE__ */ jsx(AlertTriangle, { className: "size-4 shrink-0" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Too many filter conditions (",
            meta.conditionCount,
            " of ",
            maxConditions,
            " ",
            "max). Remove some terms or ranges before applying."
          ] })
        ] }) : null,
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 pt-1", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-base-content/50 tabular-nums", children: [
            meta.conditionCount,
            " / ",
            maxConditions,
            " conditions"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "btn btn-sm btn-ghost",
                onClick: cancelFilterEdits,
                disabled: !meta.isDirty,
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                className: "btn btn-sm btn-primary",
                onClick: applyFilters,
                disabled: !meta.isDirty || meta.overLimit,
                title: meta.overLimit ? `This scope leaves room for at most ${maxConditions} filter conditions per request` : void 0,
                children: [
                  "Apply filters",
                  meta.isDirty ? /* @__PURE__ */ jsx("span", { className: "badge badge-xs ml-1 border-0 bg-primary-content/20", children: meta.dirtyCount }) : null
                ]
              }
            )
          ] })
        ] })
      ]
    }
  );
}
function getFilterMeta({
  values,
  appliedFilters,
  fields,
  countConditions,
  maxConditions
}) {
  const conditionCount = countConditions(values);
  const dirtyCount = fields.reduce(
    (acc, key) => acc + (values[key].trim() !== appliedFilters[key].trim() ? 1 : 0),
    0
  );
  return {
    conditionCount,
    dirtyCount,
    isDirty: dirtyCount > 0,
    overLimit: conditionCount > maxConditions
  };
}
export {
  DomainFilterPanel as D,
  debugDomain as d,
  useDomainRenderDebug as u
};
