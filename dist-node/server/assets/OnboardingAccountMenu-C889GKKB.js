import { jsx, jsxs } from "react/jsx-runtime";
import { User, Settings } from "lucide-react";
import { T as ThemePreferenceMenuItems } from "./ThemePreferenceMenuItems-BM32tjA5.js";
import { v as signOutAndRedirect } from "./router-BZ-5uDXB.js";
function OnboardingAccountMenu({
  email
}) {
  if (!email) return null;
  const handleSignOut = () => signOutAndRedirect();
  return /* @__PURE__ */ jsx("div", { className: "fixed top-4 right-4", children: /* @__PURE__ */ jsxs("div", { className: "dropdown dropdown-end", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        tabIndex: 0,
        className: "btn btn-ghost btn-circle",
        "aria-label": "Open account menu",
        children: /* @__PURE__ */ jsx(User, { className: "h-5 w-5" })
      }
    ),
    /* @__PURE__ */ jsxs(
      "ul",
      {
        tabIndex: 0,
        className: "dropdown-content z-20 menu mt-3 min-w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg",
        children: [
          /* @__PURE__ */ jsx("li", { className: "menu-title max-w-full", children: /* @__PURE__ */ jsx("span", { className: "truncate text-base-content", "data-ph-mask": true, children: email }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", { href: "/settings", className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Settings, { className: "h-4 w-4" }),
            "Settings"
          ] }) }),
          /* @__PURE__ */ jsx(ThemePreferenceMenuItems, {}),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { type: "button", onClick: handleSignOut, children: "Sign out" }) })
        ]
      }
    )
  ] }) });
}
export {
  OnboardingAccountMenu as O
};
