import { jsx, jsxs } from "react/jsx-runtime";
import { Outlet } from "@tanstack/react-router";
function RankTrackingLayout() {
  return /* @__PURE__ */ jsx("div", { className: "px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Rank Tracking" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: "Track keyword positions across domains" })
    ] }),
    /* @__PURE__ */ jsx(Outlet, {})
  ] }) });
}
export {
  RankTrackingLayout as component
};
