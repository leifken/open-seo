import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect } from "react";
import { linkOptions, useRouter, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bot, LayoutDashboard, Search, Bookmark, TrendingUp, Globe, Link2, ClipboardCheck, Sparkles, MessageSquare, ChevronsUpDown, Settings, Check, Plus, FolderCog, Loader2, Archive, X, LayoutGrid, MessageCircle, CircleHelp, User, CreditCard, LogOut, AlertTriangle, ExternalLink, Menu } from "lucide-react";
import { h as GoogleGlyphMuted, i as getGscGrantStatus, G as GoogleGlyph, s as startGoogleLink } from "./startGoogleLink-CNjAawsm.js";
import { g as getProjects } from "./projects-D9ZqZqTc.js";
import { s as setLastProjectId, g as getLastProjectId } from "./active-project-DUKzBpe_.js";
import { C as CreateProjectModal } from "./CreateProjectModal-DAKgOvnC.js";
import { s as samSessionsQueryOptions, i as invalidateSamSessions, c as createSamSession, a as archiveSamSession } from "./samQueries-DoyXZlCQ.js";
import { T as ThemePreferenceMenuItems } from "./ThemePreferenceMenuItems-BM32tjA5.js";
import { u as useSession, v as signOutAndRedirect, Y as onboardingAnswersQueryOptions, ag as dismissGscNudge, c as captureClientEvent, m as createSsrRpc } from "./router-BZ-5uDXB.js";
import { aB as isHostedClientAuthMode, bo as BILLING_ROUTE, h as createServerFn, aC as isEmailVerificationBypassed } from "../entry.js";
import { M as Modal } from "./Modal-81iy_nBW.js";
import { a as requireAuthenticatedContext } from "./middleware-CvzXieP6.js";
const projectNavItems = [
  {
    to: "/p/$projectId",
    label: "Dashboard",
    icon: LayoutDashboard,
    // Without exact matching, the index path is a prefix of every project
    // route and the Dashboard item would render active everywhere.
    activeOptions: { exact: true, includeSearch: false }
  },
  {
    to: "/p/$projectId/keywords",
    label: "Keyword Research",
    icon: Search
  },
  {
    to: "/p/$projectId/saved",
    label: "Saved Keywords",
    icon: Bookmark
  },
  {
    to: "/p/$projectId/rank-tracking",
    label: "Rank Tracking",
    icon: TrendingUp
  },
  {
    to: "/p/$projectId/search-performance",
    label: "GSC Insights",
    icon: GoogleGlyphMuted
  },
  {
    to: "/p/$projectId/domain",
    label: "Domain Overview",
    icon: Globe
  },
  {
    to: "/p/$projectId/backlinks",
    label: "Backlinks",
    icon: Link2
  },
  {
    to: "/p/$projectId/audit",
    label: "Site Audit",
    icon: ClipboardCheck
  },
  {
    to: "/p/$projectId/brand-lookup",
    label: "Brand Lookup",
    icon: Sparkles
  },
  {
    to: "/p/$projectId/prompt-explorer",
    label: "Prompt Explorer",
    icon: MessageSquare
  }
];
const aiNavItem = linkOptions({
  to: "/ai",
  label: "AI & MCP",
  icon: Bot
});
const connectNavGroup = {
  label: "Connect",
  items: [aiNavItem]
};
function getProjectNavItems(projectId) {
  return linkOptions(
    projectNavItems.map((item) => ({
      ...item,
      params: { projectId },
      search: {}
    }))
  );
}
function getProjectNavGroups(projectId) {
  const all = getProjectNavItems(projectId);
  const byPath = (path) => all.find((i) => i.to === path);
  return [
    {
      label: "Overview",
      items: [byPath("/p/$projectId")]
    },
    {
      label: "Research",
      items: [
        byPath("/p/$projectId/keywords"),
        byPath("/p/$projectId/domain"),
        byPath("/p/$projectId/backlinks"),
        byPath("/p/$projectId/brand-lookup"),
        byPath("/p/$projectId/prompt-explorer")
      ]
    },
    {
      label: "My Site",
      items: [
        byPath("/p/$projectId/search-performance"),
        byPath("/p/$projectId/rank-tracking"),
        byPath("/p/$projectId/saved"),
        byPath("/p/$projectId/audit")
      ]
    }
  ];
}
const dataforseoHelpLinkOptions = linkOptions({
  to: "/help/dataforseo-api-key"
});
const SEARCH_THRESHOLD = 8;
function ProjectSwitcher({
  activeProjectId,
  onCloseDrawer
}) {
  const router = useRouter();
  const [creating, setCreating] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [highlightIndex, setHighlightIndex] = React.useState(0);
  const rootRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const searchInputRef = React.useRef(null);
  const listRef = React.useRef(null);
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects()
  });
  const projects = projectsQuery.data ?? [];
  const activeProject = projects.find((project) => project.id === activeProjectId) ?? null;
  const showSearch = projects.length >= SEARCH_THRESHOLD;
  const normalizedQuery = query.trim().toLowerCase();
  const filteredProjects = normalizedQuery ? projects.filter(
    (project) => project.name.toLowerCase().includes(normalizedQuery) || project.domain?.toLowerCase().includes(normalizedQuery)
  ) : projects;
  const openPanel = () => {
    setQuery("");
    setHighlightIndex(0);
    setOpen(true);
  };
  const closePanel = () => {
    setOpen(false);
    setQuery("");
  };
  React.useEffect(() => {
    if (!open || !showSearch) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    searchInputRef.current?.focus();
  }, [open, showSearch]);
  const handleSelect = (project) => {
    closePanel();
    onCloseDrawer?.();
    if (project.id === activeProjectId) return;
    setLastProjectId(project.id);
    const stayable = router.state.matches.findLast(
      (match) => match.fullPath.includes("$projectId") && match.fullPath.split("/").every(
        (segment) => !segment.startsWith("$") || segment === "$projectId"
      )
    );
    const template = stayable?.fullPath ?? "/p/$projectId";
    void router.navigate({
      href: template.split("$projectId").join(project.id).replace(/\/$/, "")
    });
  };
  const moveHighlight = (delta) => {
    setHighlightIndex((index) => {
      const next = index + delta;
      if (next < 0) return 0;
      if (next > filteredProjects.length - 1)
        return filteredProjects.length - 1;
      return next;
    });
  };
  const handleSearchKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveHighlight(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveHighlight(-1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const project = filteredProjects[highlightIndex] ?? filteredProjects[0];
      if (project) handleSelect(project);
    }
  };
  const handleTriggerKeyDown = (event) => {
    if (!showSearch) return;
    const isCharacter = event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey;
    if (isCharacter || event.key === "Backspace") {
      event.preventDefault();
      if (!open) setOpen(true);
      setQuery(
        (current) => isCharacter ? current + event.key : current.slice(0, -1)
      );
      setHighlightIndex(0);
      searchInputRef.current?.focus();
    } else if (!open && event.key === "ArrowDown") {
      event.preventDefault();
      openPanel();
    } else if (open && ["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) {
      handleSearchKeyDown(event);
    }
  };
  const handleRootKeyDown = (event) => {
    if (event.key !== "Escape" || !open) return;
    event.preventDefault();
    closePanel();
    triggerRef.current?.focus();
  };
  React.useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event) => {
      const target = event.target;
      if (!(target instanceof Node) || !rootRef.current?.contains(target)) {
        closePanel();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);
  const handleRootBlur = (event) => {
    if (!open) return;
    const next = event.relatedTarget;
    if (next instanceof Node && !rootRef.current?.contains(next)) closePanel();
  };
  React.useEffect(() => {
    const highlighted = listRef.current?.querySelector(
      '[data-highlighted="true"]'
    );
    highlighted?.scrollIntoView({ block: "nearest" });
  }, [highlightIndex]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: rootRef,
      onBlur: handleRootBlur,
      onKeyDown: handleRootKeyDown,
      className: "relative w-full",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-stretch rounded-lg border border-base-300 bg-base-100", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              ref: triggerRef,
              type: "button",
              "aria-label": "Switch project",
              "aria-expanded": open,
              "aria-haspopup": "listbox",
              onClick: () => open ? closePanel() : openPanel(),
              onKeyDown: handleTriggerKeyDown,
              className: "flex min-w-0 flex-1 items-center justify-between gap-2 rounded-l-lg px-3 py-1.5 text-left transition-colors hover:bg-base-200",
              children: [
                /* @__PURE__ */ jsxs("span", { className: "flex min-w-0 flex-col", children: [
                  /* @__PURE__ */ jsx("span", { className: "truncate text-sm font-medium text-base-content", children: activeProject?.name ?? "Select project" }),
                  activeProject?.domain ? /* @__PURE__ */ jsx("span", { className: "truncate text-xs font-normal text-base-content/50", children: activeProject.domain }) : null
                ] }),
                /* @__PURE__ */ jsx(ChevronsUpDown, { className: "size-3.5 shrink-0 text-base-content/40" })
              ]
            }
          ),
          activeProject ? /* @__PURE__ */ jsx(
            Link,
            {
              to: "/p/$projectId/settings",
              params: { projectId: activeProject.id },
              "aria-label": "Project settings",
              title: "Project settings",
              onClick: () => {
                closePanel();
                onCloseDrawer?.();
              },
              className: "flex shrink-0 items-center justify-center rounded-r-lg border-l border-base-300 px-2.5 text-base-content/60 transition-colors hover:bg-base-200 hover:text-base-content",
              children: /* @__PURE__ */ jsx(Settings, { className: "size-4" })
            }
          ) : null
        ] }),
        open ? /* @__PURE__ */ jsxs("div", { className: "absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-lg", children: [
          showSearch ? /* @__PURE__ */ jsx("div", { className: "border-b border-base-300 p-2", children: /* @__PURE__ */ jsxs("label", { className: "input input-sm w-full", children: [
            /* @__PURE__ */ jsx(Search, { className: "size-3.5 shrink-0 text-base-content/40" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                ref: searchInputRef,
                type: "text",
                value: query,
                placeholder: "Find project…",
                "aria-label": "Filter projects",
                "aria-controls": "project-switcher-listbox",
                "aria-activedescendant": filteredProjects[highlightIndex] ? `project-option-${filteredProjects[highlightIndex].id}` : void 0,
                className: "grow",
                onChange: (event) => {
                  setQuery(event.target.value);
                  setHighlightIndex(0);
                },
                onKeyDown: handleSearchKeyDown
              }
            )
          ] }) }) : null,
          projects.length > 0 ? (
            // Long project lists scroll inside the dropdown; without the cap the
            // menu grows past the viewport and the footer becomes unreachable.
            // flex-nowrap because daisyUI menus wrap into columns by default.
            /* @__PURE__ */ jsxs(
              "ul",
              {
                ref: listRef,
                id: "project-switcher-listbox",
                role: "listbox",
                "aria-label": "Projects",
                className: "menu max-h-[min(60vh,21rem)] w-full flex-nowrap overflow-y-auto p-2",
                children: [
                  filteredProjects.map((project, index) => {
                    const isActive = project.id === activeProjectId;
                    const isHighlighted = showSearch && index === highlightIndex;
                    return /* @__PURE__ */ jsx("li", { role: "presentation", children: /* @__PURE__ */ jsxs(
                      "button",
                      {
                        type: "button",
                        id: `project-option-${project.id}`,
                        role: "option",
                        "aria-selected": isActive,
                        "data-highlighted": isHighlighted || void 0,
                        onClick: () => handleSelect(project),
                        onMouseEnter: showSearch ? () => setHighlightIndex(index) : void 0,
                        className: isActive ? "active" : isHighlighted ? "bg-base-200" : "",
                        children: [
                          /* @__PURE__ */ jsxs("span", { className: "flex min-w-0 flex-1 flex-col", children: [
                            /* @__PURE__ */ jsx("span", { className: "truncate", children: project.name }),
                            project.domain ? /* @__PURE__ */ jsx("span", { className: "truncate text-xs text-base-content/50", children: project.domain }) : null
                          ] }),
                          isActive ? /* @__PURE__ */ jsx(Check, { className: "size-4 shrink-0 text-primary" }) : null
                        ]
                      }
                    ) }, project.id);
                  }),
                  filteredProjects.length === 0 ? /* @__PURE__ */ jsx("li", { className: "menu-disabled", children: /* @__PURE__ */ jsxs("span", { className: "text-base-content/50", children: [
                    "No projects match “",
                    query.trim(),
                    "”"
                  ] }) }) : null
                ]
              }
            )
          ) : null,
          /* @__PURE__ */ jsxs(
            "ul",
            {
              className: `menu w-full shrink-0 p-2 ${projects.length > 0 ? "border-t border-base-300" : ""}`,
              children: [
                /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      closePanel();
                      setCreating(true);
                    },
                    children: [
                      /* @__PURE__ */ jsx(Plus, { className: "size-4" }),
                      "New project"
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
                  Link,
                  {
                    to: "/projects",
                    onClick: () => {
                      closePanel();
                      onCloseDrawer?.();
                    },
                    children: [
                      /* @__PURE__ */ jsx(FolderCog, { className: "size-4" }),
                      "Manage projects"
                    ]
                  }
                ) })
              ]
            }
          )
        ] }) : null,
        creating ? /* @__PURE__ */ jsx(
          CreateProjectModal,
          {
            onClose: () => {
              setCreating(false);
              onCloseDrawer?.();
            }
          }
        ) : null
      ]
    }
  );
}
const BETA_NOTICE_DISMISSED_KEY = "sam-beta-notice-dismissed";
function BetaNotice() {
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    setDismissed(localStorage.getItem(BETA_NOTICE_DISMISSED_KEY) === "1");
  }, []);
  if (dismissed) return null;
  return /* @__PURE__ */ jsxs("div", { className: "mx-2 mb-2 rounded-lg border border-base-300 bg-base-100 p-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("span", { className: "badge badge-primary badge-sm", children: "Beta" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          "aria-label": "Dismiss",
          className: "btn btn-ghost btn-xs btn-square text-base-content/40",
          onClick: () => {
            localStorage.setItem(BETA_NOTICE_DISMISSED_KEY, "1");
            setDismissed(true);
          },
          children: /* @__PURE__ */ jsx(X, { className: "size-3.5" })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-xs text-base-content/70", children: "For more powerful AI workflows, use the OpenSEO MCP with your own agent like Claude Code or Hermes." }),
    /* @__PURE__ */ jsx(Link, { to: "/ai", className: "link link-primary mt-1.5 inline-block text-xs", children: "Set up the MCP →" })
  ] });
}
function ageLabel(timestamp) {
  const iso = timestamp.includes("T") ? timestamp : `${timestamp}Z`;
  const then = new Date(iso.replace(" ", "T")).getTime();
  if (Number.isNaN(then)) return "";
  const minutes = Math.max(0, Math.floor((Date.now() - then) / 6e4));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
function SamSidebarPanel({
  projectId,
  onNavigate
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeSessionId = location.search.s;
  const sessionsQuery = useQuery(samSessionsQueryOptions(projectId));
  const sessions = sessionsQuery.data ?? [];
  const goToSession = (sessionId) => {
    void navigate({
      to: "/p/$projectId/sam",
      params: { projectId },
      search: sessionId ? { s: sessionId } : {}
    });
    onNavigate?.();
  };
  const createSession = useMutation({
    mutationFn: () => createSamSession({ data: { projectId } }),
    onSuccess: ({ id }) => {
      invalidateSamSessions(projectId);
      goToSession(id);
    }
  });
  const archiveSession = useMutation({
    mutationFn: (sessionId) => archiveSamSession({ data: { sessionId } }),
    onSuccess: (_result, sessionId) => {
      invalidateSamSessions(projectId);
      if (sessionId === activeSessionId) {
        goToSession(sessions.find((s) => s.id !== sessionId)?.id);
      }
    }
  });
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-0 flex-1 flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "px-2 pb-1", children: /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "btn btn-ghost btn-sm btn-block justify-start gap-2 font-normal text-base-content/70 hover:text-base-content",
        disabled: createSession.isPending,
        onClick: () => createSession.mutate(),
        children: [
          createSession.isPending ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsx(Plus, { className: "size-4" }),
          "New chat"
        ]
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "min-h-0 flex-1 overflow-y-auto px-2 py-1", children: sessionsQuery.isLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-6 text-base-content/50", children: /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }) }) : sessions.length === 0 ? /* @__PURE__ */ jsx("p", { className: "px-2 py-6 text-center text-xs text-base-content/50", children: "No chats yet. Start a new one." }) : sessions.map((session) => {
      const isActive = session.id === activeSessionId;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: `group flex items-center gap-1 rounded-md px-1 ${isActive ? "bg-base-300/50" : "hover:bg-base-300/40"}`,
          children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => goToSession(session.id),
                className: "min-w-0 flex-1 truncate px-2 py-1.5 text-left text-sm text-base-content/80",
                children: session.title
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "shrink-0 text-xs text-base-content/40 group-hover:hidden", children: ageLabel(session.updatedAt) }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                "aria-label": "Archive chat",
                className: "btn btn-ghost btn-xs btn-square hidden group-hover:inline-flex",
                disabled: archiveSession.isPending,
                onClick: () => archiveSession.mutate(session.id),
                children: /* @__PURE__ */ jsx(Archive, { className: "size-3.5 text-base-content/50" })
              }
            )
          ]
        },
        session.id
      );
    }) }),
    /* @__PURE__ */ jsx(BetaNotice, {})
  ] });
}
function closeDropdown() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}
const navItemBaseClass = "relative flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-base-content/70";
const navItemClass = `${navItemBaseClass} transition-colors hover:bg-base-300/30 hover:text-base-content`;
const navItemActiveProps = {
  // Keep the active tint on hover so the active item does not fall back to the
  // lighter hover background of navItemClass.
  className: "bg-base-300/50 hover:bg-base-300/50 font-medium text-base-content"
};
function SidebarNavLink({
  icon: Icon,
  label,
  onNavigate,
  linkProps
}) {
  return /* @__PURE__ */ jsx(
    Link,
    {
      onClick: onNavigate,
      activeOptions: { exact: false, includeSearch: false },
      ...linkProps,
      className: navItemClass,
      activeProps: navItemActiveProps,
      children: ({ isActive }) => /* @__PURE__ */ jsxs(Fragment, { children: [
        isActive ? /* @__PURE__ */ jsx("div", { className: "absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-primary" }) : null,
        /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 shrink-0" }),
        /* @__PURE__ */ jsx("span", { className: "truncate", children: label })
      ] })
    }
  );
}
function Sidebar({ projectId, onNavigate, onClose }) {
  const navGroups = [
    ...projectId ? getProjectNavGroups(projectId) : [],
    connectNavGroup
  ];
  const navigate = useNavigate();
  const location = useLocation();
  const onSamRoute = location.pathname.includes("/sam");
  const [view, setView] = useState(
    onSamRoute ? "chat" : "browse"
  );
  useEffect(() => {
    setView(onSamRoute ? "chat" : "browse");
  }, [onSamRoute]);
  const openChat = () => {
    setView("chat");
    if (!projectId) return;
    if (!onSamRoute) {
      void navigate({
        to: "/p/$projectId/sam",
        params: { projectId },
        search: {}
      });
      onNavigate?.();
    }
  };
  const openBrowse = () => {
    setView("browse");
    if (!projectId || !onSamRoute) return;
    void navigate({ to: "/p/$projectId", params: { projectId } });
    onNavigate?.();
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full w-60 flex-col bg-base-200", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 pb-2 pt-3", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/",
          onClick: onNavigate,
          className: "text-base font-semibold text-base-content",
          children: "OpenSEO"
        }
      ),
      onClose ? /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onClose,
          className: "btn btn-ghost btn-sm btn-circle",
          "aria-label": "Close sidebar",
          children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" })
        }
      ) : null
    ] }),
    /* @__PURE__ */ jsx("div", { className: "px-3 pb-1", children: /* @__PURE__ */ jsx(
      ProjectSwitcher,
      {
        activeProjectId: projectId,
        onCloseDrawer: onNavigate
      }
    ) }),
    projectId ? (
      // Same underline tab idiom as the in-page tab strips (e.g. Domain
      // Overview's Top Keywords / Top Pages).
      /* @__PURE__ */ jsx("div", { className: "px-3 pb-1", children: /* @__PURE__ */ jsxs("div", { role: "tablist", className: "tabs tabs-border w-full", children: [
        /* @__PURE__ */ jsx(
          SidebarViewTab,
          {
            icon: LayoutGrid,
            label: "Browse",
            active: view === "browse",
            onClick: openBrowse
          }
        ),
        /* @__PURE__ */ jsx(
          SidebarViewTab,
          {
            icon: MessageCircle,
            label: "Chat",
            active: view === "chat",
            onClick: openChat
          }
        )
      ] }) })
    ) : null,
    view === "chat" && projectId ? /* @__PURE__ */ jsx(SamSidebarPanel, { projectId, onNavigate }) : /* @__PURE__ */ jsx("nav", { className: "min-h-0 flex-1 overflow-y-auto px-2 py-2", children: navGroups.map((group) => /* @__PURE__ */ jsxs("div", { className: "mb-1", children: [
      /* @__PURE__ */ jsx("div", { className: "px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-base-content/40", children: group.label }),
      group.items.map((item) => {
        const { icon, label, ...linkProps } = item;
        return /* @__PURE__ */ jsx(
          SidebarNavLink,
          {
            icon,
            label,
            onNavigate,
            linkProps
          },
          linkProps.to
        );
      })
    ] }, group.label)) }),
    /* @__PURE__ */ jsx(SidebarFooter, { onNavigate })
  ] });
}
function SidebarViewTab({
  icon: Icon,
  label,
  active,
  onClick
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      role: "tab",
      "aria-selected": active,
      onClick,
      className: `tab flex-1 gap-1.5 ${active ? "tab-active" : ""}`,
      children: [
        /* @__PURE__ */ jsx(Icon, { className: "size-4" }),
        label
      ]
    }
  );
}
function SidebarFooter({ onNavigate }) {
  const { data: session } = useSession();
  const isHostedMode = isHostedClientAuthMode();
  const email = session?.user?.email;
  const closeMenu = () => {
    closeDropdown();
    onNavigate?.();
  };
  return /* @__PURE__ */ jsxs("div", { className: "shrink-0 border-t border-base-300 px-2 py-2 pb-safe", children: [
    /* @__PURE__ */ jsx(
      SidebarNavLink,
      {
        icon: CircleHelp,
        label: "Help & Community",
        onNavigate,
        linkProps: { to: "/support" }
      }
    ),
    email ? /* @__PURE__ */ jsxs("div", { className: "dropdown dropdown-top w-full", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          tabIndex: 0,
          className: `${navItemClass} w-full`,
          "aria-label": "Open account menu",
          children: [
            /* @__PURE__ */ jsx(User, { className: "h-4 w-4 shrink-0" }),
            /* @__PURE__ */ jsx("span", { className: "truncate", "data-ph-mask": true, children: email })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "ul",
        {
          tabIndex: 0,
          className: "dropdown-content z-30 menu mb-1 w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg",
          children: [
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(Link, { to: "/settings", onClick: closeMenu, children: [
              /* @__PURE__ */ jsx(Settings, { className: "h-4 w-4" }),
              "Settings"
            ] }) }),
            isHostedMode ? /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(Link, { to: BILLING_ROUTE, onClick: closeMenu, children: [
              /* @__PURE__ */ jsx(CreditCard, { className: "h-4 w-4" }),
              "Billing"
            ] }) }) : null,
            /* @__PURE__ */ jsx(ThemePreferenceMenuItems, {}),
            isHostedMode ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(
                "li",
                {
                  "aria-hidden": true,
                  className: "pointer-events-none my-1 h-px bg-base-300 p-0"
                }
              ),
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  className: "text-error",
                  onClick: () => signOutAndRedirect(),
                  children: [
                    /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
                    "Sign out"
                  ]
                }
              ) })
            ] }) : null
          ]
        }
      )
    ] }) : /* @__PURE__ */ jsx(
      SidebarNavLink,
      {
        icon: Settings,
        label: "Settings",
        onNavigate,
        linkProps: { to: "/settings" }
      }
    )
  ] });
}
function SeoApiStatusBanners({
  shouldShowSeoApiWarning,
  seoApiKeyStatusError
}) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    shouldShowSeoApiWarning ? /* @__PURE__ */ jsx("div", { className: "shrink-0 px-4 py-2.5 md:px-6", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl", children: /* @__PURE__ */ jsxs("div", { className: "alert alert-warning", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "size-4 shrink-0" }),
      /* @__PURE__ */ jsxs("span", { className: "text-sm", children: [
        "Setup needed: add your DataForSEO API key to use OpenSEO features. See the quick steps on the",
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            ...dataforseoHelpLinkOptions,
            className: "link link-primary font-medium",
            children: "help page"
          }
        ),
        "."
      ] })
    ] }) }) }) : null,
    seoApiKeyStatusError ? /* @__PURE__ */ jsx("div", { className: "shrink-0 px-4 py-2.5 md:px-6", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl", children: /* @__PURE__ */ jsxs("div", { className: "alert alert-info", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "size-4 shrink-0" }),
      /* @__PURE__ */ jsxs("span", { className: "text-sm", children: [
        "We could not verify your DataForSEO setup. If features are not working, check the setup steps on the",
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            ...dataforseoHelpLinkOptions,
            className: "link link-primary font-medium",
            children: "help page"
          }
        ),
        "."
      ] })
    ] }) }) }) : null
  ] });
}
function MobileSidebarDrawer({
  open,
  projectId,
  onClose
}) {
  if (!open) return null;
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 md:hidden", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        "aria-label": "Close sidebar",
        className: "absolute inset-0 bg-black/45",
        onClick: onClose
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "absolute left-0 top-0 h-full shadow-xl", children: /* @__PURE__ */ jsx(Sidebar, { projectId, onNavigate: onClose, onClose }) })
  ] });
}
const MissingSeoSetupModal = React.forwardRef(({ isOpen, onClose }, ref) => {
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4", children: /* @__PURE__ */ jsxs(
    "div",
    {
      ref,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "dataforseo-setup-title",
      "aria-describedby": "dataforseo-setup-description",
      tabIndex: -1,
      className: "w-full max-w-lg rounded-xl border border-base-300 bg-base-100 p-5 shadow-2xl",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "rounded-full bg-warning/20 p-2 text-warning", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "size-5" }) }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(
              "h2",
              {
                id: "dataforseo-setup-title",
                className: "text-lg font-semibold text-base-content",
                children: "One quick setup step"
              }
            ),
            /* @__PURE__ */ jsx(
              "p",
              {
                id: "dataforseo-setup-description",
                className: "text-sm text-base-content/75",
                children: "Add your DataForSEO API key to start using OpenSEO."
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", children: [
          /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-ghost", onClick: onClose, children: "Dismiss" }),
          /* @__PURE__ */ jsxs(
            Link,
            {
              ...dataforseoHelpLinkOptions,
              className: "btn btn-primary",
              onClick: onClose,
              children: [
                "Open setup guide",
                /* @__PURE__ */ jsx(ExternalLink, { className: "size-4" })
              ]
            }
          )
        ] })
      ]
    }
  ) });
});
MissingSeoSetupModal.displayName = "MissingSeoSetupModal";
function GscReEngagementModal({
  projectId,
  suppressed
}) {
  const hosted = isHostedClientAuthMode();
  const queryClient = useQueryClient();
  const [closed, setClosed] = React.useState(false);
  const shownRef = React.useRef(false);
  const onboardingQuery = useQuery({
    ...onboardingAnswersQueryOptions(),
    enabled: hosted
  });
  const grantQuery = useQuery({
    queryKey: ["gscGrantStatus"],
    queryFn: () => getGscGrantStatus(),
    enabled: hosted
  });
  const dismissMutation = useMutation({
    mutationFn: () => dismissGscNudge(),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["onboardingAnswers"] });
    }
  });
  const eligible = hosted && !suppressed && !closed && onboardingQuery.isSuccess && grantQuery.isSuccess && Boolean(onboardingQuery.data?.completedAt) && !onboardingQuery.data?.gscNudgeDismissedAt && !grantQuery.data?.connected;
  React.useEffect(() => {
    if (eligible && !shownRef.current) {
      shownRef.current = true;
      captureClientEvent("gsc:nudge_shown");
    }
  }, [eligible]);
  if (!eligible) return null;
  function persistDismiss() {
    setClosed(true);
    dismissMutation.mutate();
  }
  function handleDismiss() {
    captureClientEvent("gsc:nudge_dismissed");
    persistDismiss();
  }
  function handleConnect() {
    captureClientEvent("gsc:nudge_connect_clicked");
    persistDismiss();
    const callbackURL = projectId ? `${window.location.origin}/p/${projectId}/settings/integrations` : window.location.href;
    void startGoogleLink("gsc", callbackURL);
  }
  return /* @__PURE__ */ jsxs(
    Modal,
    {
      maxWidth: "max-w-lg",
      onClose: handleDismiss,
      labelledBy: "gsc-nudge-title",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("h2", { id: "gsc-nudge-title", className: "text-lg font-semibold", children: "New: Connect Google Search Console" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: "Bring your real clicks, impressions, and rankings into OpenSEO and query them from Claude or Codex over MCP. It never uses credits." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", children: [
          /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-ghost", onClick: handleDismiss, children: "Maybe later" }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: handleConnect,
              className: "inline-flex items-center justify-center gap-2.5 rounded-lg border border-base-300 bg-base-100 px-4 py-2.5 text-sm font-semibold text-base-content shadow-sm transition hover:bg-base-200 hover:shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              children: [
                /* @__PURE__ */ jsx(GoogleGlyph, { className: "size-[18px]" }),
                "Connect with Google"
              ]
            }
          )
        ] })
      ]
    }
  );
}
const getSeoApiKeyStatus = createServerFn({
  method: "GET"
}).middleware(requireAuthenticatedContext).handler(createSsrRpc("b5858986f4b26fbc7f2cea62479e3b4d97d5c4af0a61b218af88501443a3939c"));
const DATAFORSEO_HELP_PATH = "/help/dataforseo-api-key";
function AuthenticatedAppLayout({
  children,
  projectId,
  banner
}) {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const setupModalRef = React.useRef(null);
  const [showMissingSeoApiKeyModal, setShowMissingSeoApiKeyModal] = React.useState(false);
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
    enabled: !projectId
  });
  const [rememberedProjectId] = React.useState(
    () => getLastProjectId()
  );
  const fallbackProjects = projectsQuery.data ?? [];
  const fallbackProjectId = fallbackProjects.find((project) => project.id === rememberedProjectId)?.id ?? fallbackProjects[0]?.id ?? null;
  const sidebarProjectId = projectId ?? fallbackProjectId ?? rememberedProjectId;
  const shouldCheckSeoApiKeyStatus = location.pathname !== BILLING_ROUTE;
  const seoApiKeyStatusQuery = useQuery({
    queryKey: ["seoApiKeyStatus"],
    queryFn: () => getSeoApiKeyStatus(),
    enabled: shouldCheckSeoApiKeyStatus
  });
  const isSeoApiKeyConfigured = shouldCheckSeoApiKeyStatus ? seoApiKeyStatusQuery.data?.configured ?? null : null;
  const seoApiKeyStatusError = shouldCheckSeoApiKeyStatus && seoApiKeyStatusQuery.isError;
  React.useEffect(() => {
    if (!shouldCheckSeoApiKeyStatus) {
      setShowMissingSeoApiKeyModal(false);
      return;
    }
    if (seoApiKeyStatusQuery.isError) {
      setShowMissingSeoApiKeyModal(false);
      return;
    }
    if (!seoApiKeyStatusQuery.isSuccess) return;
    setShowMissingSeoApiKeyModal(!seoApiKeyStatusQuery.data.configured);
  }, [
    location.pathname,
    seoApiKeyStatusQuery.data,
    seoApiKeyStatusQuery.isError,
    seoApiKeyStatusQuery.isSuccess,
    shouldCheckSeoApiKeyStatus
  ]);
  const shouldShowMissingSeoApiKeyModal = showMissingSeoApiKeyModal && location.pathname !== DATAFORSEO_HELP_PATH;
  const shouldShowSeoApiWarning = !seoApiKeyStatusError && isSeoApiKeyConfigured === false && !shouldShowMissingSeoApiKeyModal;
  React.useEffect(() => {
    if (!shouldShowMissingSeoApiKeyModal) return;
    setupModalRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowMissingSeoApiKeyModal(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [shouldShowMissingSeoApiKeyModal]);
  return /* @__PURE__ */ jsxs("div", { className: "flex h-[100dvh] bg-base-200", children: [
    /* @__PURE__ */ jsx("div", { className: "hidden shrink-0 md:block", children: /* @__PURE__ */ jsx(Sidebar, { projectId: sidebarProjectId }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [
      /* @__PURE__ */ jsx(
        MobileTopBar,
        {
          drawerOpen,
          onOpenDrawer: () => setDrawerOpen(true)
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "flex min-h-0 flex-1 flex-col md:pt-2", children: /* @__PURE__ */ jsxs("div", { className: "flex min-h-0 flex-1 flex-col overflow-hidden bg-base-100 md:rounded-tl-lg md:border-l md:border-t md:border-base-300", children: [
        /* @__PURE__ */ jsx(
          SeoApiStatusBanners,
          {
            shouldShowSeoApiWarning,
            seoApiKeyStatusError
          }
        ),
        banner,
        /* @__PURE__ */ jsx("div", { className: "min-h-0 flex-1 overflow-auto", children })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(
      MobileSidebarDrawer,
      {
        open: drawerOpen,
        projectId: sidebarProjectId,
        onClose: () => setDrawerOpen(false)
      }
    ),
    /* @__PURE__ */ jsx(
      MissingSeoSetupModal,
      {
        ref: setupModalRef,
        isOpen: shouldShowMissingSeoApiKeyModal,
        onClose: () => setShowMissingSeoApiKeyModal(false)
      }
    ),
    /* @__PURE__ */ jsx(
      GscReEngagementModal,
      {
        projectId: sidebarProjectId,
        suppressed: shouldShowMissingSeoApiKeyModal
      }
    )
  ] });
}
function MobileTopBar({
  drawerOpen,
  onOpenDrawer
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 items-center gap-1 border-b border-base-300 bg-base-100 px-2 py-1.5 md:hidden", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: "btn btn-square btn-ghost btn-sm",
        "aria-label": "Toggle sidebar",
        "aria-expanded": drawerOpen,
        onClick: onOpenDrawer,
        children: /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
      }
    ),
    /* @__PURE__ */ jsx(Link, { to: "/", className: "ml-1 font-semibold text-base-content", children: "OpenSEO" })
  ] });
}
function useOnboardingRedirect() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const isHostedMode = isHostedClientAuthMode();
  const isEmailVerified = session?.user?.emailVerified === true || isEmailVerificationBypassed();
  const onboardingQuery = useQuery({
    ...onboardingAnswersQueryOptions(),
    enabled: isHostedMode && Boolean(session?.user?.id) && isEmailVerified
  });
  useEffect(() => {
    if (!isHostedMode || !session?.user?.id || !isEmailVerified || onboardingQuery.isLoading || onboardingQuery.isError || onboardingQuery.data?.completedAt || window.location.pathname === "/onboarding") {
      return;
    }
    void navigate({ to: "/onboarding", search: { step: 0 }, replace: true });
  }, [
    isHostedMode,
    navigate,
    onboardingQuery.data?.completedAt,
    onboardingQuery.isError,
    onboardingQuery.isLoading,
    isEmailVerified,
    session?.user?.id
  ]);
}
export {
  AuthenticatedAppLayout as A,
  useOnboardingRedirect as u
};
