import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { ShieldAlert, ArrowUpRight } from "lucide-react";
import { b4 as getAuthMode, aB as isHostedClientAuthMode } from "../entry.js";
import { c as captureClientEvent } from "./router-BZ-5uDXB.js";
import { C as CopyButton, a as Collapsible, b as CodeBlock } from "./SetupControls-CIzHWqFw.js";
import "node:async_hooks";
import "node:crypto";
import "ioredis";
import "node:fs/promises";
import "node:path";
import "node:fs";
import "better-sqlite3";
import "bullmq";
import "postgres";
import "zod";
import "@modelcontextprotocol/client";
import "@modelcontextprotocol/client/validators/cf-worker";
import "@modelcontextprotocol/sdk/types.js";
import "node:diagnostics_channel";
import "jose";
import "drizzle-orm/d1";
import "drizzle-orm/sqlite-core";
import "drizzle-orm";
import "drizzle-orm/postgres-js";
import "drizzle-orm/pg-core";
import "jose/errors";
import "node:os";
import "@better-auth/api-key";
import "posthog-node";
import "@modelcontextprotocol/server";
import "remeda";
import "tldts";
import "srvx";
import "react";
import "@tanstack/react-router/ssr/server";
import "robots-parser";
import "fast-xml-parser";
import "@tanstack/react-query";
import "./middleware-CvzXieP6.js";
import "@tanstack/query-core";
import "./selfHostedOAuth-DmcaPqZ5.js";
import "./ai-search-BV1mIqc0.js";
import "./audit-SZdMhI6q.js";
import "autumn-js/react";
import "react-dom";
import "@tanstack/react-form";
import "sonner";
import "@better-auth/api-key/client";
import "papaparse";
import "@tanstack/react-table";
import "recharts";
import "./lighthouse-CiThJE4g.js";
import "./lighthouse-CxIZIYPF.js";
function ClaudeIcon(props) {
  return /* @__PURE__ */ jsx(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 256 257",
      preserveAspectRatio: "xMidYMid",
      "aria-hidden": "true",
      ...props,
      children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#D97757",
          d: "m50.228 170.321 50.357-28.257.843-2.463-.843-1.361h-2.462l-8.426-.518-28.775-.778-24.952-1.037-24.175-1.296-6.092-1.297L0 125.796l.583-3.759 5.12-3.434 7.324.648 16.202 1.101 24.304 1.685 17.629 1.037 26.118 2.722h4.148l.583-1.685-1.426-1.037-1.101-1.037-25.147-17.045-27.22-18.017-14.258-10.37-7.713-5.25-3.888-4.925-1.685-10.758 7-7.713 9.397.649 2.398.648 9.527 7.323 20.35 15.75L94.817 91.9l3.889 3.24 1.555-1.102.195-.777-1.75-2.917-14.453-26.118-15.425-26.572-6.87-11.018-1.814-6.61c-.648-2.723-1.102-4.991-1.102-7.778l7.972-10.823L71.42 0 82.05 1.426l4.472 3.888 6.61 15.101 10.694 23.786 16.591 32.34 4.861 9.592 2.592 8.879.973 2.722h1.685v-1.556l1.36-18.211 2.528-22.36 2.463-28.776.843-8.1 4.018-9.722 7.971-5.25 6.222 2.981 5.12 7.324-.713 4.73-3.046 19.768-5.962 30.98-3.889 20.739h2.268l2.593-2.593 10.499-13.934 17.628-22.036 7.778-8.749 9.073-9.657 5.833-4.601h11.018l8.1 12.055-3.628 12.443-11.342 14.388-9.398 12.184-13.48 18.147-8.426 14.518.778 1.166 2.01-.194 30.46-6.481 16.462-2.982 19.637-3.37 8.88 4.148.971 4.213-3.5 8.62-20.998 5.184-24.628 4.926-36.682 8.685-.454.324.519.648 16.526 1.555 7.065.389h17.304l32.21 2.398 8.426 5.574 5.055 6.805-.843 5.184-12.962 6.611-17.498-4.148-40.83-9.721-14-3.5h-1.944v1.167l11.666 11.406 21.387 19.314 26.767 24.887 1.36 6.157-3.434 4.86-3.63-.518-23.526-17.693-9.073-7.972-20.545-17.304h-1.36v1.814l4.73 6.935 25.017 37.59 1.296 11.536-1.814 3.76-6.481 2.268-7.13-1.297-14.647-20.544-15.1-23.138-12.185-20.739-1.49.843-7.194 77.448-3.37 3.953-7.778 2.981-6.48-4.925-3.436-7.972 3.435-15.749 4.148-20.544 3.37-16.333 3.046-20.285 1.815-6.74-.13-.454-1.49.194-15.295 20.999-23.267 31.433-18.406 19.702-4.407 1.75-7.648-3.954.713-7.064 4.277-6.286 25.47-32.405 15.36-20.092 9.917-11.6-.065-1.686h-.583L44.07 198.125l-12.055 1.555-5.185-4.86.648-7.972 2.463-2.593 20.35-13.999-.064.065Z"
        }
      )
    }
  );
}
function CodexIcon(props) {
  return /* @__PURE__ */ jsx(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      fillRule: "evenodd",
      clipRule: "evenodd",
      "aria-hidden": "true",
      ...props,
      children: /* @__PURE__ */ jsx("path", { d: "M8.086.457a6.105 6.105 0 013.046-.415c1.333.153 2.521.72 3.564 1.7a.117.117 0 00.107.029c1.408-.346 2.762-.224 4.061.366l.063.03.154.076c1.357.703 2.33 1.77 2.918 3.198.278.679.418 1.388.421 2.126a5.655 5.655 0 01-.18 1.631.167.167 0 00.04.155 5.982 5.982 0 011.578 2.891c.385 1.901-.01 3.615-1.183 5.14l-.182.22a6.063 6.063 0 01-2.934 1.851.162.162 0 00-.108.102c-.255.736-.511 1.364-.987 1.992-1.199 1.582-2.962 2.462-4.948 2.451-1.583-.008-2.986-.587-4.21-1.736a.145.145 0 00-.14-.032c-.518.167-1.04.191-1.604.185a5.924 5.924 0 01-2.595-.622 6.058 6.058 0 01-2.146-1.781c-.203-.269-.404-.522-.551-.821a7.74 7.74 0 01-.495-1.283 6.11 6.11 0 01-.017-3.064.166.166 0 00.008-.074.115.115 0 00-.037-.064 5.958 5.958 0 01-1.38-2.202 5.196 5.196 0 01-.333-1.589 6.915 6.915 0 01.188-2.132c.45-1.484 1.309-2.648 2.577-3.493.282-.188.55-.334.802-.438.286-.12.573-.22.861-.304a.129.129 0 00.087-.087A6.016 6.016 0 015.635 2.31C6.315 1.464 7.132.846 8.086.457zm-.804 7.85a.848.848 0 00-1.473.842l1.694 2.965-1.688 2.848a.849.849 0 001.46.864l1.94-3.272a.849.849 0 00.007-.854l-1.94-3.393zm5.446 6.24a.849.849 0 000 1.695h4.848a.849.849 0 000-1.696h-4.848z" })
    }
  );
}
const toolCategories = [
  {
    label: "Project Context",
    tools: [
      {
        name: "get_project_context",
        title: "Get project context",
        description: "Read your project's goals, positioning, competitors, and key pages."
      },
      {
        name: "update_project_context",
        title: "Update project context",
        description: "Save what an agent learned back to your shared project context."
      }
    ]
  },
  {
    label: "Keywords",
    tools: [
      {
        name: "research_keywords",
        title: "Research keywords",
        description: "Get keyword ideas with volume, difficulty, and CPC."
      },
      {
        name: "get_rank_tracker",
        title: "Get rank tracking positions",
        description: "Read tracked keyword positions."
      },
      {
        name: "create_rank_tracker",
        title: "Create a rank tracker",
        description: "Configure a domain for rank tracking."
      },
      {
        name: "add_rank_tracking_keywords",
        title: "Add tracked keywords",
        description: "Add keywords to an existing rank tracker."
      },
      {
        name: "remove_rank_tracking_keywords",
        title: "Remove tracked keywords",
        description: "Stop tracking selected keyword IDs."
      },
      {
        name: "estimate_rank_tracker_cost",
        title: "Estimate rank check cost",
        description: "Preview the cost of an explicit rank check."
      },
      {
        name: "run_rank_tracker",
        title: "Run a rank check",
        description: "Check a tracker's current positions now."
      },
      {
        name: "get_keyword_metrics",
        title: "Get keyword metrics",
        description: "Volume, difficulty, intent, CPC, and trends for any keyword list."
      },
      {
        name: "list_saved_keywords",
        title: "Get saved keywords",
        description: "Pull your saved keyword lists."
      },
      {
        name: "save_keywords",
        title: "Save keywords",
        description: "Save keywords back to OpenSEO."
      }
    ]
  },
  {
    label: "Competitive Research",
    tools: [
      {
        name: "get_serp_results",
        title: "Get SERP results",
        description: "See live Google results for a keyword."
      },
      {
        name: "find_serp_competitors",
        title: "Find SERP competitors",
        description: "Compare domains across a keyword set."
      },
      {
        name: "get_ranked_keywords",
        title: "Get ranked keywords",
        description: "Find exact keyword, page, and rank rows."
      },
      {
        name: "get_domain_overview",
        title: "Get domain overview",
        description: "Summarize a domain's organic footprint."
      },
      {
        name: "get_domain_keyword_suggestions",
        title: "Get domain keywords",
        description: "Find keywords a domain already ranks for."
      },
      {
        name: "get_backlinks_overview",
        title: "Get backlinks overview",
        description: "Check backlink and referring-domain stats."
      },
      {
        name: "get_backlinks_profile",
        title: "Get backlinks profile",
        description: "Fetch paginated link-level backlink rows."
      }
    ]
  },
  {
    label: "Local Business",
    tools: [
      {
        name: "search_local_businesses",
        title: "Search local businesses",
        description: "Find local business candidates near a coordinate."
      },
      {
        name: "get_local_serp_results",
        title: "Get local SERP results",
        description: "Fetch one Maps or Local Finder result set."
      },
      {
        name: "get_google_business_questions",
        title: "Get business questions",
        description: "Read Google Business Profile Q&A rows."
      },
      {
        name: "get_business_profile",
        title: "Get business profile",
        description: "Audit a Google Business Profile's categories, rating, hours, and claim status."
      },
      {
        name: "get_business_reviews",
        title: "Get business reviews",
        description: "Collect Google reviews, including owner replies and other-site sources."
      },
      {
        name: "get_business_updates",
        title: "Get business updates",
        description: "Check posting activity on a Google Business Profile."
      },
      {
        name: "list_business_categories",
        title: "List business categories",
        description: "Find valid Google Business category slugs."
      },
      {
        name: "get_local_rank_grid",
        title: "Get local rank grid",
        description: "Check Google Maps rank at each point of a grid around a business."
      }
    ]
  },
  {
    label: "Search Console",
    tools: [
      {
        name: "get_search_console_performance",
        title: "Get Search Console performance",
        description: "Read clicks, impressions, CTR, and position from Search Console."
      },
      {
        name: "inspect_urls",
        title: "Inspect URLs",
        description: "Check index status, crawl, and canonical for up to 10 URLs."
      }
    ]
  },
  {
    label: "Google Analytics",
    tools: [
      {
        name: "get_google_analytics_organic_overview",
        title: "Get organic overview",
        description: "Compare top-line organic performance with the previous period."
      },
      {
        name: "get_google_analytics_organic_landing_pages",
        title: "Get organic landing pages",
        description: "Read organic sessions, engagement, key events, and revenue by landing page."
      },
      {
        name: "get_google_analytics_page_performance",
        title: "Get page performance",
        description: "Read page views, users, engagement time, and key events."
      },
      {
        name: "get_google_analytics_key_events",
        title: "Get key events",
        description: "Read key-event outcomes by event or landing page."
      },
      {
        name: "get_search_opportunities",
        title: "Get search opportunities",
        description: "Join Search Console demand with Analytics outcomes to prioritize pages."
      },
      {
        name: "get_google_analytics_traffic_acquisition",
        title: "Get traffic acquisition",
        description: "Compare channels, source/medium, or campaigns using session outcomes."
      },
      {
        name: "get_google_analytics_measurement_health",
        title: "Check measurement health",
        description: "Inspect streams, enhanced measurement, key events, and custom definitions."
      },
      {
        name: "get_google_analytics_ecommerce_performance",
        title: "Get ecommerce performance",
        description: "Read product-funnel or landing-page transaction performance."
      },
      {
        name: "get_google_analytics_site_search",
        title: "Get site search",
        description: "Read measured internal search terms and outcomes."
      },
      {
        name: "get_google_analytics_audience_breakdown",
        title: "Get audience breakdown",
        description: "Compare device, country, or new-versus-returning audiences."
      }
    ]
  }
];
function AvailableTools() {
  return /* @__PURE__ */ jsx("div", { className: "grid gap-x-8 gap-y-8 md:grid-cols-2", children: toolCategories.map((cat) => /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-base-content/50", children: cat.label }),
    /* @__PURE__ */ jsx("ul", { className: "mt-3 space-y-3", children: cat.tools.map((tool) => /* @__PURE__ */ jsxs("li", { className: "flex flex-col gap-0.5", children: [
      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-base-content", children: tool.title }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/60 leading-relaxed", children: tool.description })
    ] }, tool.name)) })
  ] }, cat.label)) });
}
const DISCORD_URL = "https://discord.gg/c9uGs3cFXr";
const SUPPORT_EMAIL = "ben@openseo.so";
const SAM_GITHUB_URL = "https://github.com/every-app/sam";
const SKILL_NAMES = ["seo-project-setup", "seo-coach", "keyword-research", "keyword-clustering", "competitive-landscape", "competitor-analysis", "link-prospecting", "local-seo", "seo-audit"];
const SKILLS_INSTALL = `npx skills add every-app/open-seo`;
const ALL_SKILLS_INSTALL = `npx skills add every-app/open-seo --skill '*'`;
const CLAUDE_CODE_SKILLS_INSTALL = `npx skills add every-app/open-seo --skill '*' --agent claude-code`;
const CODEX_SKILLS_INSTALL = `npx skills add every-app/open-seo --skill '*' --agent codex`;
const SKILLS_MANUAL_INSTALL = `git clone https://github.com/every-app/open-seo.git

# Codex
mkdir -p ~/.codex/skills
cp -R open-seo/.agents/skills/* ~/.codex/skills/

# Claude Code
mkdir -p ~/.claude/skills
cp -R open-seo/.agents/skills/* ~/.claude/skills/`;
function AiPage() {
  const mcpUrl = typeof window === "undefined" ? "https://app.openseo.so/mcp" : `${window.location.origin}/mcp`;
  return /* @__PURE__ */ jsx("div", { className: "h-full overflow-auto bg-base-100 px-4 py-12 md:px-6 md:py-16 pb-24 md:pb-12", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "AI & MCP" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-base-content/70 leading-relaxed", children: "Connect your AI agent to OpenSEO. Run keyword research, SERP analysis, domain lookups, and backlink reviews from your editor or chat." }),
    getAuthMode(void 0) === "cloudflare_access" ? /* @__PURE__ */ jsxs("div", { className: "alert alert-warning mt-6 text-sm", role: "alert", children: [
      /* @__PURE__ */ jsx(ShieldAlert, { className: "size-4 shrink-0" }),
      /* @__PURE__ */ jsxs("span", { children: [
        "This instance is behind Cloudflare Access. MCP clients cannot connect until Managed OAuth is enabled on your Access application.",
        " ",
        /* @__PURE__ */ jsx("a", { href: "https://openseo.so/docs/self-hosting/cloudflare#connect-the-mcp-server-through-cloudflare-access", target: "_blank", rel: "noreferrer", className: "link font-medium", children: "Setup guide" })
      ] })
    ] }) : null,
    /* @__PURE__ */ jsxs("section", { className: "mt-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-base-300 bg-base-200 px-4 py-3.5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-base-content/50", children: "MCP server URL" }),
          /* @__PURE__ */ jsx(CopyButton, { value: mcpUrl, successMessage: "MCP URL copied", onCopy: () => captureClientEvent("mcp:setup_url_copy") })
        ] }),
        /* @__PURE__ */ jsx("code", { className: "mt-2 block break-all font-mono text-sm text-base-content", children: mcpUrl })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-2.5 text-xs text-base-content/55 leading-relaxed", children: "Paste this into any MCP client. This URL points at the OpenSEO instance you are using now, whether hosted, self-hosted, or local. Sign in with OpenSEO when prompted." }),
      isHostedClientAuthMode() ? /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-base-content/55", children: [
        "For headless or CI setups, use an API key from",
        " ",
        /* @__PURE__ */ jsx(Link, { className: "link link-primary", to: "/settings", children: "Settings" }),
        " ",
        "instead of the OAuth login."
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-10", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold", children: "Setup guides" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm text-base-content/70", children: "Pick your agent." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 divide-y divide-base-300 overflow-hidden rounded-lg border border-base-300 bg-base-200", children: [
        /* @__PURE__ */ jsxs(Collapsible, { id: "claude-code", title: "Claude Code", subtitle: "Add with the CLI", icon: /* @__PURE__ */ jsx(ClaudeIcon, { className: "size-5" }), children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: "Run this in your terminal:" }),
          /* @__PURE__ */ jsx(CodeBlock, { code: `claude mcp add --transport http --scope user openseo ${mcpUrl}`, onCopy: () => captureClientEvent("mcp:setup_command_copy", {
            agent: "claude-code"
          }) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: "Approve the login when prompted." })
        ] }),
        /* @__PURE__ */ jsxs(Collapsible, { id: "claude-desktop", title: "Claude Desktop", subtitle: "Add a custom connector", icon: /* @__PURE__ */ jsx(ClaudeIcon, { className: "size-5" }), children: [
          /* @__PURE__ */ jsxs("ol", { className: "ml-5 list-decimal space-y-1.5 text-sm text-base-content/70 leading-relaxed", children: [
            /* @__PURE__ */ jsxs("li", { children: [
              "Open ",
              /* @__PURE__ */ jsx("span", { className: "text-base-content", children: "Settings" }),
              " →",
              " ",
              /* @__PURE__ */ jsx("span", { className: "text-base-content", children: "Connectors" }),
              "."
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              "Click",
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-medium text-base-content", children: "Add custom connector" }),
              "."
            ] }),
            /* @__PURE__ */ jsx("li", { children: "Paste the MCP URL above and click Add." }),
            /* @__PURE__ */ jsx("li", { children: "Approve the OpenSEO login when prompted." }),
            /* @__PURE__ */ jsxs("li", { children: [
              "Optional: after OpenSEO connects, click",
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-medium text-base-content", children: "Configure" }),
              ", then choose",
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-medium text-base-content", children: "Always Approved" }),
              ", except for any tools you want Claude to ask before using."
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/55 leading-relaxed", children: "Requires a Claude Pro, Max, Team, or Enterprise plan." })
        ] }),
        /* @__PURE__ */ jsxs(Collapsible, { id: "codex", title: "Codex", subtitle: "Add with the CLI", icon: /* @__PURE__ */ jsx(CodexIcon, { className: "size-5" }), children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: "Run this in your terminal:" }),
          /* @__PURE__ */ jsx(CodeBlock, { code: `codex mcp add openseo --url ${mcpUrl}`, onCopy: () => captureClientEvent("mcp:setup_command_copy", {
            agent: "codex"
          }) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: "Approve the login when prompted." })
        ] }),
        /* @__PURE__ */ jsx(Collapsible, { id: "codex-desktop", title: "Codex Desktop", subtitle: "Settings → Integrations & MCP", icon: /* @__PURE__ */ jsx(CodexIcon, { className: "size-5" }), children: /* @__PURE__ */ jsxs("ol", { className: "ml-5 list-decimal space-y-1.5 text-sm text-base-content/70 leading-relaxed", children: [
          /* @__PURE__ */ jsxs("li", { children: [
            "Open",
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-base-content", children: "Settings → Integrations & MCP" }),
            "."
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            "Click",
            " ",
            /* @__PURE__ */ jsx("span", { className: "font-medium text-base-content", children: "Add your own" }),
            "."
          ] }),
          /* @__PURE__ */ jsx("li", { children: "Paste the MCP URL above." }),
          /* @__PURE__ */ jsx("li", { children: "Approve the OpenSEO login when prompted." })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold", children: "OpenSEO Skills" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm text-base-content/70 leading-relaxed", children: "Skills give Codex and Claude Code reusable SEO workflows that can call your OpenSEO MCP tools when live SERP, keyword, backlink, or domain data is needed." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 divide-y divide-base-300 overflow-hidden rounded-lg border border-base-300 bg-base-200", children: [
        /* @__PURE__ */ jsxs(Collapsible, { id: "skills-add", title: "Install with skills add", subtitle: "Recommended cross-agent installer", children: [
          /* @__PURE__ */ jsx(CodeBlock, { code: SKILLS_INSTALL }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: "You can also auto-accept each OpenSEO skill:" }),
          /* @__PURE__ */ jsx(CodeBlock, { code: ALL_SKILLS_INSTALL })
        ] }),
        /* @__PURE__ */ jsx(Collapsible, { id: "claude-code-skills", title: "Install for Claude Code", subtitle: "Target Claude Code only", icon: /* @__PURE__ */ jsx(ClaudeIcon, { className: "size-5" }), children: /* @__PURE__ */ jsx(CodeBlock, { code: CLAUDE_CODE_SKILLS_INSTALL }) }),
        /* @__PURE__ */ jsx(Collapsible, { id: "codex-skills", title: "Install for Codex", subtitle: "Target OpenAI Codex only", icon: /* @__PURE__ */ jsx(CodexIcon, { className: "size-5" }), children: /* @__PURE__ */ jsx(CodeBlock, { code: CODEX_SKILLS_INSTALL }) }),
        /* @__PURE__ */ jsx(Collapsible, { id: "manual-skills", title: "Manual GitHub install", subtitle: "Clone the repo and copy the skills", children: /* @__PURE__ */ jsx(CodeBlock, { code: SKILLS_MANUAL_INSTALL }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-5", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-base-content/70 leading-relaxed", children: [
          "Start with",
          " ",
          /* @__PURE__ */ jsx("span", { className: "font-mono text-base-content", children: "/seo-project-setup" }),
          ". It will ask about your project and save your goals, positioning, and competitors to your project context."
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-xs font-medium uppercase tracking-wide text-base-content/50", children: "Available skills" }),
        /* @__PURE__ */ jsx("ul", { className: "mt-2 grid gap-1.5 text-sm text-base-content/70 sm:grid-cols-2", children: SKILL_NAMES.map((skill) => /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-base-content/35", children: "-" }),
          /* @__PURE__ */ jsx("span", { children: skill })
        ] }, skill)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold", children: "Available tools" }),
      /* @__PURE__ */ jsx("div", { className: "mt-5", children: /* @__PURE__ */ jsx(AvailableTools, {}) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold", children: "Sam: AI SEO teammate" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm text-base-content/70 leading-relaxed", children: "Sam is an experimental content workflow for Claude Code and other coding agents. It combines keyword research, source discovery, drafting, and QA." }),
      /* @__PURE__ */ jsxs("a", { href: SAM_GITHUB_URL, target: "_blank", rel: "noreferrer", className: "mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-base-content transition-colors hover:text-base-content/60", children: [
        "View Sam on GitHub",
        /* @__PURE__ */ jsx(ArrowUpRight, { className: "size-3.5" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold", children: "Roadmap" }),
      /* @__PURE__ */ jsx("ul", { className: "mt-4 space-y-3", children: [{
        title: "In-app SEO Research Agent",
        description: "Ask questions and run research without leaving OpenSEO"
      }, {
        title: "Content Assistant",
        description: "Generate drafts using saved keywords and business context"
      }].map((item) => /* @__PURE__ */ jsxs("li", { className: "flex gap-2.5 text-sm", children: [
        /* @__PURE__ */ jsx("span", { className: "mt-[2px] shrink-0 text-base-content/40", children: "—" }),
        /* @__PURE__ */ jsxs("span", { className: "text-base-content/70", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-base-content", children: item.title }),
          /* @__PURE__ */ jsx("br", {}),
          item.description
        ] })
      ] }, item.title)) })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "mt-12 text-xs text-base-content/55 leading-relaxed", children: [
      "Have feedback? Reach out on",
      " ",
      /* @__PURE__ */ jsx("a", { className: "link link-primary", href: DISCORD_URL, target: "_blank", rel: "noreferrer", children: "Discord" }),
      " ",
      "or email",
      " ",
      /* @__PURE__ */ jsx("a", { className: "link link-primary", href: `mailto:${SUPPORT_EMAIL}`, children: SUPPORT_EMAIL }),
      "."
    ] })
  ] }) });
}
export {
  AiPage as component
};
