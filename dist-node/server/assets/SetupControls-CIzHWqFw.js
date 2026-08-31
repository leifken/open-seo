import { jsx, jsxs } from "react/jsx-runtime";
import { Check, Copy, ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
function Collapsible({
  id,
  title,
  subtitle,
  icon,
  children
}) {
  const [open, setOpen] = useState(false);
  const contentId = `collapsible-${id}`;
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => setOpen((value) => !value),
        "aria-expanded": open,
        "aria-controls": contentId,
        className: "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-base-300/50",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [
            icon ? /* @__PURE__ */ jsx("span", { className: "flex size-5 shrink-0 items-center justify-center text-base-content", children: icon }) : null,
            /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-col gap-0.5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-base-content", children: title }),
              subtitle ? /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/55", children: subtitle }) : null
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            ChevronDown,
            {
              className: `size-4 shrink-0 text-base-content/50 transition-transform ${open ? "rotate-180" : ""}`
            }
          )
        ]
      }
    ),
    open ? /* @__PURE__ */ jsx("div", { id: contentId, className: "space-y-4 px-4 pb-6 pt-3", children }) : null
  ] });
}
function CodeBlock({
  code,
  onCopy
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-stretch overflow-hidden rounded-md border border-base-300 bg-base-100", children: [
    /* @__PURE__ */ jsx("pre", { className: "min-w-0 flex-1 overflow-x-auto p-3 text-xs leading-relaxed text-base-content", children: /* @__PURE__ */ jsx("code", { className: "font-mono", children: code }) }),
    /* @__PURE__ */ jsx("div", { className: "flex shrink-0 items-start border-l border-base-300 p-1.5", children: /* @__PURE__ */ jsx(
      CopyButton,
      {
        value: code,
        successMessage: "Copied to clipboard",
        iconOnly: true,
        onCopy
      }
    ) })
  ] });
}
function CopyButton({
  value,
  successMessage,
  iconOnly = false,
  onCopy
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      toast.error("Clipboard not available");
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      toast.success(successMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
      onCopy?.();
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };
  if (iconOnly) {
    return /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: handleCopy,
        "aria-label": "Copy",
        className: "flex size-7 items-center justify-center rounded-md text-base-content/60 transition-colors hover:bg-base-200 hover:text-base-content",
        children: copied ? /* @__PURE__ */ jsx(Check, { className: "size-3.5 text-success" }) : /* @__PURE__ */ jsx(Copy, { className: "size-3.5" })
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick: handleCopy,
      className: "inline-flex items-center gap-1.5 rounded-md border border-base-300 bg-base-100 px-2 py-1 text-xs font-medium text-base-content/70 transition-colors hover:bg-base-300/50 hover:text-base-content",
      children: [
        copied ? /* @__PURE__ */ jsx(Check, { className: "size-3 text-success" }) : /* @__PURE__ */ jsx(Copy, { className: "size-3" }),
        "Copy"
      ]
    }
  );
}
export {
  CopyButton as C,
  Collapsible as a,
  CodeBlock as b
};
