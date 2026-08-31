import { jsx } from "react/jsx-runtime";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
function Markdown({ children, className }) {
  return /* @__PURE__ */ jsx("div", { className, children: /* @__PURE__ */ jsx(
    ReactMarkdown,
    {
      remarkPlugins: [remarkGfm],
      components: MARKDOWN_COMPONENTS,
      children
    }
  ) });
}
function SafeAnchor({ href, children, ...rest }) {
  const safeHref = isHttpUrl(href) ? href : void 0;
  if (!safeHref) {
    return /* @__PURE__ */ jsx("span", { className: "underline decoration-dotted", children });
  }
  return /* @__PURE__ */ jsx(
    "a",
    {
      ...rest,
      href: safeHref,
      target: "_blank",
      rel: "noreferrer",
      className: "link link-primary",
      children
    }
  );
}
function isHttpUrl(value) {
  if (!value) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (url.username || url.password) return false;
    return true;
  } catch {
    return false;
  }
}
const MARKDOWN_COMPONENTS = {
  h1: ({ children }) => /* @__PURE__ */ jsx("h1", { className: "mt-5 mb-2 text-base font-semibold first:mt-0", children }),
  h2: ({ children }) => /* @__PURE__ */ jsx("h2", { className: "mt-5 mb-2 text-sm font-semibold first:mt-0", children }),
  h3: ({ children }) => /* @__PURE__ */ jsx("h3", { className: "mt-4 mb-1.5 text-sm font-semibold first:mt-0", children }),
  h4: ({ children }) => /* @__PURE__ */ jsx("h4", { className: "mt-3 mb-1 text-sm font-semibold first:mt-0", children }),
  p: ({ children }) => /* @__PURE__ */ jsx("p", { className: "my-2 leading-relaxed first:mt-0 last:mb-0", children }),
  ul: ({ children }) => /* @__PURE__ */ jsx("ul", { className: "my-2 ml-5 list-disc space-y-1", children }),
  ol: ({ children }) => /* @__PURE__ */ jsx("ol", { className: "my-2 ml-5 list-decimal space-y-1", children }),
  li: ({ children }) => /* @__PURE__ */ jsx("li", { className: "leading-relaxed", children }),
  a: SafeAnchor,
  strong: ({ children }) => /* @__PURE__ */ jsx("strong", { className: "font-semibold", children }),
  em: ({ children }) => /* @__PURE__ */ jsx("em", { className: "italic", children }),
  blockquote: ({ children }) => /* @__PURE__ */ jsx("blockquote", { className: "my-2 border-l-2 border-base-300 pl-3 text-base-content/80 italic", children }),
  hr: () => /* @__PURE__ */ jsx("hr", { className: "my-3 border-base-300" }),
  code: ({ children, className }) => {
    if (typeof className === "string" && className.startsWith("language-")) {
      return /* @__PURE__ */ jsx("code", { className, children });
    }
    return /* @__PURE__ */ jsx("code", { className: "rounded bg-base-200 px-1 py-0.5 text-xs font-mono", children });
  },
  pre: ({ children }) => /* @__PURE__ */ jsx("pre", { className: "my-2 overflow-x-auto rounded-lg bg-base-200 p-3 text-xs font-mono", children }),
  table: ({ children }) => /* @__PURE__ */ jsx("div", { className: "my-3 overflow-x-auto", children: /* @__PURE__ */ jsx("table", { className: "table table-sm border border-base-300", children }) }),
  thead: ({ children }) => /* @__PURE__ */ jsx("thead", { children }),
  tbody: ({ children }) => /* @__PURE__ */ jsx("tbody", { children }),
  tr: ({ children }) => /* @__PURE__ */ jsx("tr", { className: "border-b border-base-300 last:border-0", children }),
  th: ({ children }) => /* @__PURE__ */ jsx("th", { className: "px-2 py-1.5 text-left font-semibold", children }),
  td: ({ children }) => /* @__PURE__ */ jsx("td", { className: "px-2 py-1.5 align-top", children })
};
export {
  MARKDOWN_COMPONENTS as M,
  Markdown as a
};
