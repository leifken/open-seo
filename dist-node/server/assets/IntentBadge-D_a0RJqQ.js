import { jsxs, jsx } from "react/jsx-runtime";
import { createPortal } from "react-dom";
import { C as useFloatingTooltip, F as FloatingTooltip } from "./router-DHiBnyXs.js";
const COLORS = {
  informational: "border-info/30 bg-info/15 text-info",
  commercial: "border-warning/35 bg-warning/20 text-warning",
  transactional: "border-success/30 bg-success/15 text-success",
  navigational: "border-primary/30 bg-primary/15 text-primary",
  unknown: "border-base-300 bg-base-200 text-base-content/60"
};
const SHORT_LABELS = {
  informational: "Info",
  commercial: "Comm",
  transactional: "Trans",
  navigational: "Nav",
  unknown: "?"
};
const INTENT_LABELS = {
  informational: "Informational",
  commercial: "Commercial",
  transactional: "Transactional",
  navigational: "Navigational",
  unknown: "Unknown"
};
const DESCRIPTIONS = {
  informational: {
    label: INTENT_LABELS.informational,
    description: "The searcher wants information or answers. Use this for educational content, guides, and comparison-light explainers."
  },
  commercial: {
    label: INTENT_LABELS.commercial,
    description: "The searcher is researching options before a purchase. Treat this as buying intent for comparisons, alternatives, and product-led pages."
  },
  transactional: {
    label: INTENT_LABELS.transactional,
    description: "The searcher is ready to complete an action, often a purchase. Prioritize clear offers, pricing, trials, or conversion paths."
  },
  navigational: {
    label: INTENT_LABELS.navigational,
    description: "The searcher is looking for a specific site, brand, or page. These queries usually reward matching the expected destination."
  },
  unknown: {
    label: INTENT_LABELS.unknown,
    description: "Intent was not available for this keyword, so avoid making content strategy decisions from this badge alone."
  }
};
function IntentBadge({ intent }) {
  const tooltip = useFloatingTooltip({ delayMs: 0 });
  const details = DESCRIPTIONS[intent];
  return /* @__PURE__ */ jsxs(
    "span",
    {
      ref: tooltip.triggerRef,
      className: `inline-flex h-6 min-w-11 cursor-help items-center justify-center rounded-full border px-2 text-xs font-semibold leading-none ${COLORS[intent]}`,
      tabIndex: 0,
      "aria-label": `${details.label} search intent`,
      "aria-describedby": tooltip.isOpen ? tooltip.tooltipId : void 0,
      onMouseEnter: tooltip.open,
      onMouseLeave: tooltip.close,
      onFocus: tooltip.open,
      onBlur: tooltip.close,
      onKeyDown: (e) => {
        if (e.key === "Escape") tooltip.close();
      },
      children: [
        SHORT_LABELS[intent],
        tooltip.isOpen && typeof document !== "undefined" ? createPortal(
          /* @__PURE__ */ jsxs(FloatingTooltip, { id: tooltip.tooltipId, position: tooltip.position, children: [
            /* @__PURE__ */ jsx("span", { className: "block font-semibold", children: details.label }),
            /* @__PURE__ */ jsx("span", { className: "mt-1 block", children: details.description })
          ] }),
          document.body
        ) : null
      ]
    }
  );
}
export {
  IntentBadge as I,
  INTENT_LABELS as a
};
