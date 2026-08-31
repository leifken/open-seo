import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { aJ as RESEARCH_SCOPE_LABELS, aK as RESEARCH_SCOPES, aL as RESEARCH_SCOPE_DESCRIPTIONS, aM as RESEARCH_SCOPE_EXAMPLES } from "../entry.js";
function ResearchScopeSelect({
  value,
  onChange,
  disabledReason,
  className = "",
  "aria-label": ariaLabel = "Research scope"
}) {
  const [open, setOpen] = useState(false);
  const [activeScope, setActiveScope] = useState(value);
  const containerRef = useRef(null);
  useEffect(() => {
    if (open) setActiveScope(value);
  }, [open, value]);
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event) => {
      const target = event.target;
      if (target instanceof Node && !containerRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);
  const select = (scope) => {
    onChange(scope);
    setOpen(false);
  };
  const moveActive = (step) => {
    const currentIndex = RESEARCH_SCOPES.indexOf(activeScope);
    const nextIndex = Math.min(
      Math.max(currentIndex + step, 0),
      RESEARCH_SCOPES.length - 1
    );
    const next = RESEARCH_SCOPES[nextIndex];
    if (next) setActiveScope(next);
  };
  const handleKeyDown = (event) => {
    if (!open) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveActive(-1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        select(activeScope);
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        break;
    }
  };
  return /* @__PURE__ */ jsxs("div", { ref: containerRef, className: `relative ${className}`, children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "select select-bordered flex w-full items-center justify-between gap-2 text-left font-normal",
        "aria-label": ariaLabel,
        "aria-haspopup": "listbox",
        "aria-expanded": open,
        disabled: disabledReason != null,
        title: disabledReason,
        onClick: () => setOpen((prev) => !prev),
        onKeyDown: handleKeyDown,
        children: [
          /* @__PURE__ */ jsx("span", { className: "truncate", children: RESEARCH_SCOPE_LABELS[value] }),
          /* @__PURE__ */ jsx(ChevronDown, { className: "size-4 shrink-0 text-base-content/60" })
        ]
      }
    ),
    open ? /* @__PURE__ */ jsx(
      "ul",
      {
        role: "listbox",
        "aria-label": ariaLabel,
        className: "menu absolute right-0 z-30 mt-2 w-72 flex-nowrap rounded-box border border-base-300 bg-base-100 p-2 shadow-lg",
        children: RESEARCH_SCOPES.map((scope) => {
          const isSelected = scope === value;
          return /* @__PURE__ */ jsx("li", { role: "option", "aria-selected": isSelected, children: /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              className: `w-full items-start ${scope === activeScope ? "menu-focus" : ""}`,
              onClick: () => select(scope),
              onMouseEnter: () => setActiveScope(scope),
              children: [
                /* @__PURE__ */ jsxs("span", { className: "flex-1", children: [
                  /* @__PURE__ */ jsx("span", { className: "block", children: RESEARCH_SCOPE_LABELS[scope] }),
                  /* @__PURE__ */ jsx("span", { className: "block text-xs text-base-content/60", children: RESEARCH_SCOPE_DESCRIPTIONS[scope] }),
                  /* @__PURE__ */ jsx("span", { className: "block font-mono text-xs text-base-content/40", children: RESEARCH_SCOPE_EXAMPLES[scope] })
                ] }),
                isSelected ? /* @__PURE__ */ jsx(Check, { className: "mt-1 size-4 shrink-0 text-primary" }) : null
              ]
            }
          ) }, scope);
        })
      }
    ) : null
  ] });
}
export {
  ResearchScopeSelect as R
};
