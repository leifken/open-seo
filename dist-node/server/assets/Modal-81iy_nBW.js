import { jsx } from "react/jsx-runtime";
import { useEffect } from "react";
function Modal({
  maxWidth = "max-w-sm",
  children,
  onClose,
  labelledBy
}) {
  useEffect(() => {
    if (!onClose) return;
    const handleKeyDown = (event) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4", children: /* @__PURE__ */ jsx(
    "div",
    {
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": labelledBy,
      className: `card bg-base-100 border border-base-300 w-full ${maxWidth} max-h-full shadow-xl`,
      children: /* @__PURE__ */ jsx("div", { className: "card-body gap-4 overflow-y-auto", children })
    }
  ) });
}
export {
  Modal as M
};
