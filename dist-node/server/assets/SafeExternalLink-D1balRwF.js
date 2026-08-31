import { jsx, jsxs } from "react/jsx-runtime";
import { ExternalLink } from "lucide-react";
import { g as getSafeExternalUrl } from "./url-D1aM6mYO.js";
function SafeExternalLink({
  url,
  label,
  className
}) {
  const safeUrl = getSafeExternalUrl(url);
  if (!safeUrl) {
    return /* @__PURE__ */ jsx("span", { className, children: label });
  }
  return /* @__PURE__ */ jsxs("a", { className, href: safeUrl, target: "_blank", rel: "noreferrer", children: [
    label,
    /* @__PURE__ */ jsx(ExternalLink, { className: "size-3 shrink-0" })
  ] });
}
export {
  SafeExternalLink as S
};
