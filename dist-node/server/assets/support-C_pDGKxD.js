import { jsx, jsxs } from "react/jsx-runtime";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
const SUPPORT_EMAIL = "ben@openseo.so";
const DISCORD_URL = "https://discord.gg/c9uGs3cFXr";
const GITHUB_URL = "https://github.com/every-app/open-seo";
function SupportPage() {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(SUPPORT_EMAIL);
    toast.success("Email copied to clipboard");
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  return /* @__PURE__ */ jsx("div", { className: "h-full overflow-auto bg-base-100 px-4 py-8 pb-24 md:px-6 md:py-12 md:pb-8", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-xl", children: [
    /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-base-content/40", children: "Help & Community" }),
    /* @__PURE__ */ jsx("h1", { className: "mt-1 text-2xl font-bold tracking-tight", children: "We want to hear from you" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-base-content/60", children: "We want to talk to you! We're super open to feedback and want to learn how you work so we can make OpenSEO better." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-base-300 px-5 py-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "Email" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-base-content/60", children: "Send ideas, problems, questions, or feedback directly." }),
        /* @__PURE__ */ jsxs("button", { type: "button", onClick: handleCopy, className: "mt-3 inline-flex items-center gap-2 rounded-md border border-base-300 bg-base-200/50 px-3 py-1.5 text-sm font-medium text-base-content transition-colors hover:bg-base-200", children: [
          /* @__PURE__ */ jsx("span", { className: "font-mono text-xs", children: SUPPORT_EMAIL }),
          copied ? /* @__PURE__ */ jsx(Check, { className: "size-3.5 text-success" }) : /* @__PURE__ */ jsx(Copy, { className: "size-3.5 text-base-content/40" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("a", { href: DISCORD_URL, target: "_blank", rel: "noreferrer", className: "block rounded-lg border border-base-300 px-5 py-4 transition-colors hover:border-base-content/20", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "Discord" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-base-content/60", children: "Ask for help, share ideas and learn from the community." }),
        /* @__PURE__ */ jsxs("span", { className: "mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-base-content", children: [
          "Join the Discord",
          /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "→" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("a", { href: `${GITHUB_URL}/issues`, target: "_blank", rel: "noreferrer", className: "block rounded-lg border border-base-300 px-5 py-4 transition-colors hover:border-base-content/20", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "GitHub Issues" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-base-content/60", children: "Report bugs or request features on GitHub." }),
        /* @__PURE__ */ jsxs("span", { className: "mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-base-content", children: [
          "Open an issue",
          /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "→" })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  SupportPage as component
};
