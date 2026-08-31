import { jsx, jsxs } from "react/jsx-runtime";
import { ExternalLink } from "lucide-react";
function formatUrlForDisplay(value) {
  try {
    const url = new URL(value);
    const hash = url.hash.startsWith("#:~:") ? "" : url.hash;
    const cleaned = `${url.protocol}//${url.host}${url.pathname}${url.search}${hash}`;
    try {
      return decodeURI(cleaned);
    } catch {
      return cleaned;
    }
  } catch {
    return value;
  }
}
function resolveUrlHref(value, baseDomain) {
  if (!value) return null;
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value)) {
    return getSafeExternalUrl(value);
  }
  if (!baseDomain) return null;
  return getSafeExternalUrl(
    `https://${baseDomain}${value.startsWith("/") ? value : `/${value}`}`
  );
}
function ExternalUrlCell({
  value,
  label,
  baseDomain,
  className = "link link-primary inline-flex items-center gap-1",
  display = "formatted",
  empty = "-"
}) {
  const href = resolveUrlHref(value, baseDomain);
  if (!value || !href) {
    return /* @__PURE__ */ jsx("span", { className: "text-base-content/40", children: empty });
  }
  const visibleLabel = label ?? getUrlDisplayLabel(value, display);
  return /* @__PURE__ */ jsxs("a", { className, href, target: "_blank", rel: "noreferrer", children: [
    /* @__PURE__ */ jsx("span", { className: "truncate", children: visibleLabel }),
    /* @__PURE__ */ jsx(ExternalLink, { className: "size-3 shrink-0" })
  ] });
}
function getUrlDisplayLabel(value, display) {
  if (display === "raw") return value;
  if (display === "path") {
    try {
      return new URL(value).pathname;
    } catch {
      return value;
    }
  }
  return formatUrlForDisplay(value);
}
function getSafeExternalUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}
export {
  ExternalUrlCell as E,
  formatUrlForDisplay as f,
  getSafeExternalUrl as g
};
