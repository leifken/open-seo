import { jsxs, jsx } from "react/jsx-runtime";
import { p as getStandardErrorMessage, c as captureClientEvent, O as ONBOARDING_LAST_STEP, N as INTEREST_OPTIONS, Q as CLIENT_WEBSITE_COUNT_OPTIONS, T as CLIENT_WORK_FOR, W as WORK_FOR_OPTIONS, V as SOURCE_OPTIONS_HIDDEN_ON_MOBILE, X as SOURCE_OPTIONS, u as useSession, Y as onboardingAnswersQueryOptions, Z as restoreOnboardingAnswers, _ as Route, $ as saveOnboardingAnswers, a0 as buildOnboardingPayload, H as queryClient, a1 as clampStep } from "./router-DHiBnyXs.js";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { Fragment, useState } from "react";
import { O as OnboardingAccountMenu } from "./OnboardingAccountMenu-BDqqycjI.js";
import { Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { b as getGscConnection, c as listGscSites, e as setGscSite, G as GoogleGlyph, s as startGoogleLink } from "./startGoogleLink-B3EIh1_V.js";
import { S as SelfHostedSetupWarning, a as SitePicker } from "./SitePicker-CGqABpQz.js";
import { P as ProjectMarketFields } from "./ProjectMarketFields-DxgrLT1Z.js";
import { g as getProjects, s as setProjectMarket } from "./projects-B08wh0PW.js";
import "../entry.js";
import "node:async_hooks";
import "node:crypto";
import "ioredis";
import "node:fs/promises";
import "node:path";
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
import "postgres";
import "drizzle-orm/pg-core";
import "jose/errors";
import "node:fs";
import "node:os";
import "@better-auth/api-key";
import "posthog-node";
import "@modelcontextprotocol/server";
import "remeda";
import "tldts";
import "srvx";
import "@tanstack/react-router/ssr/server";
import "./middleware-Doy-pxkJ.js";
import "@tanstack/query-core";
import "./selfHostedOAuth-C3UAQwsK.js";
import "./ai-search-BV1mIqc0.js";
import "./audit-SZdMhI6q.js";
import "autumn-js/react";
import "react-dom";
import "@tanstack/react-form";
import "@better-auth/api-key/client";
import "papaparse";
import "@tanstack/react-table";
import "recharts";
import "./lighthouse-CiThJE4g.js";
import "./lighthouse-CxIZIYPF.js";
import "./ThemePreferenceMenuItems-UwJnQstm.js";
import "./SafeExternalLink-D1balRwF.js";
import "./url-D1aM6mYO.js";
import "./LocationSelect-D9KloY89.js";
const GRANT_STATUS_KEY = ["gscGrantStatus"];
function SearchConsoleOnboardingStep() {
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects()
  });
  const project = projectsQuery.data?.[0];
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Connect with Google Search Console now?" }),
      project ? /* @__PURE__ */ jsx(GscConnect, { projectId: project.id }) : /* @__PURE__ */ jsx(Checking, {}),
      /* @__PURE__ */ jsx("p", { className: "hidden sm:block text-xs leading-relaxed text-base-content/55", children: "For now, Search Console data flows through the OpenSEO MCP. We're building it into the OpenSEO app soon too." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Choose country & language" }),
      project ? /* @__PURE__ */ jsx(DefaultMarketPicker, { project }) : /* @__PURE__ */ jsx(Checking, {})
    ] })
  ] });
}
function DefaultMarketPicker({
  project
}) {
  const queryClient2 = useQueryClient();
  const [market, setMarket] = React.useState({
    locationCode: project.locationCode,
    languageCode: project.languageCode
  });
  const saveMutation = useMutation({
    mutationFn: (next) => setProjectMarket({ data: { projectId: project.id, ...next } }),
    onSuccess: () => queryClient2.invalidateQueries({ queryKey: ["projects"] }),
    onError: (error) => toast.error(getStandardErrorMessage(error))
  });
  const handleChange = (next) => {
    setMarket(next);
    saveMutation.mutate(next);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsx(
      ProjectMarketFields,
      {
        value: market,
        onChange: handleChange,
        hideLanguageOnMobile: true
      }
    ),
    /* @__PURE__ */ jsx("p", { className: "hidden sm:block text-xs leading-relaxed text-base-content/55", children: "We'll use this country and language for keyword, SERP, and domain data unless you pick a different one. You can change it in project settings." })
  ] });
}
function GscConnect({ projectId }) {
  const queryClient2 = useQueryClient();
  const [selection, setSelection] = React.useState(
    null
  );
  const connectionKey = ["gscConnection", projectId];
  const connectionQuery = useQuery({
    queryKey: connectionKey,
    queryFn: () => getGscConnection({ data: { projectId } })
  });
  const connection = connectionQuery.data;
  const connected = Boolean(connection?.connected);
  const hasGrant = Boolean(connection?.currentUserHasGrant);
  const needsSetup = connectionQuery.isSuccess && !connection?.googleOAuthConfigured;
  const sitesQuery = useQuery({
    queryKey: ["gscSites", projectId],
    queryFn: () => listGscSites({ data: { projectId } }),
    enabled: hasGrant && !connected && !needsSetup
  });
  const accounts = React.useMemo(
    () => sitesQuery.data?.accounts ?? [],
    [sitesQuery.data?.accounts]
  );
  const requiresReconnect = accounts.some(
    (account) => account.requiresReconnect
  );
  React.useEffect(() => {
    if (!requiresReconnect) return;
    void queryClient2.invalidateQueries({
      queryKey: ["gscConnection", projectId]
    });
    void queryClient2.invalidateQueries({ queryKey: GRANT_STATUS_KEY });
  }, [requiresReconnect, queryClient2, projectId]);
  const setSiteMutation = useMutation({
    mutationFn: (selected) => setGscSite({ data: { projectId, ...selected } }),
    onSuccess: () => {
      captureClientEvent("gsc:property_select");
      void queryClient2.invalidateQueries({ queryKey: connectionKey });
    },
    onError: (error) => toast.error(getStandardErrorMessage(error))
  });
  const handleConnect = () => {
    captureClientEvent("onboarding:gsc_connect_clicked");
    void startGoogleLink("gsc", window.location.href);
  };
  if (connectionQuery.isLoading) return /* @__PURE__ */ jsx(Checking, {});
  if (needsSetup) {
    return /* @__PURE__ */ jsx(SelfHostedSetupWarning, {});
  }
  if (connected) {
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-lg border border-success/30 bg-success/10 p-3.5 text-sm", children: [
      /* @__PURE__ */ jsx("span", { className: "flex size-6 shrink-0 items-center justify-center rounded-full bg-success/20 text-success", children: /* @__PURE__ */ jsx(Check, { className: "size-3.5" }) }),
      /* @__PURE__ */ jsxs("span", { className: "text-base-content/80", children: [
        "Connected to ",
        /* @__PURE__ */ jsx("span", { className: "font-mono", children: connection?.siteUrl }),
        "."
      ] })
    ] });
  }
  if (hasGrant) {
    return /* @__PURE__ */ jsx(
      SitePicker,
      {
        loading: sitesQuery.isLoading,
        error: sitesQuery.isError,
        accounts,
        selection,
        onSelect: setSelection,
        onSave: () => selection && setSiteMutation.mutate(selection),
        saving: setSiteMutation.isPending,
        onRetry: () => void sitesQuery.refetch(),
        onReconnect: handleConnect
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick: handleConnect,
      className: "inline-flex items-center gap-2.5 rounded-lg border border-base-300 bg-base-100 px-4 py-2.5 text-sm font-semibold text-base-content shadow-sm transition hover:bg-base-200 hover:shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
      children: [
        /* @__PURE__ */ jsx(GoogleGlyph, { className: "size-[18px]" }),
        "Connect with Google"
      ]
    }
  );
}
function Checking() {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-base-content/50", children: [
    /* @__PURE__ */ jsx("span", { className: "loading loading-spinner loading-sm" }),
    "Checking…"
  ] });
}
function PostSignupOnboarding({
  firstName,
  title,
  helperText,
  step,
  answers,
  onAnswersChange,
  onNext,
  onBack,
  onSkip,
  onFinish,
  isSaving,
  accountMenu
}) {
  const canContinue = step === 0 ? answers.selectedInterests.length > 0 : step === 1 ? Boolean(answers.workFor) : step === 2 ? Boolean(answers.source) : true;
  const updateAnswers = (patch) => onAnswersChange({ ...answers, ...patch });
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md space-y-6", children: [
    accountMenu,
    /* @__PURE__ */ jsxs("div", { className: "text-center space-y-3", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: "/transparent-logo.png",
          alt: "OpenSEO",
          className: "mx-auto size-10 rounded-lg"
        }
      ),
      /* @__PURE__ */ jsxs("p", { className: "text-xs font-medium uppercase tracking-wide text-base-content/50", children: [
        "Step ",
        step + 1,
        " of ",
        ONBOARDING_LAST_STEP + 1
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold", children: title ?? (firstName ? `Welcome to OpenSEO, ${firstName}!` : "Welcome to OpenSEO!") }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/60", children: helperText ?? "A few quick answers to set things up." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm", children: [
      step === 0 ? /* @__PURE__ */ jsx(
        OnboardingChoiceGroup,
        {
          title: "What tasks matter to you most?",
          description: "Pick up to 3.",
          maxSelections: 3,
          options: [...INTEREST_OPTIONS],
          selectedValues: answers.selectedInterests,
          onToggle: (value) => {
            updateAnswers({
              selectedInterests: answers.selectedInterests.includes(value) ? answers.selectedInterests.filter((item) => item !== value) : [...answers.selectedInterests, value]
            });
          },
          otherValue: answers.interestOther,
          onOtherChange: (interestOther) => updateAnswers({ interestOther }),
          multiple: true
        }
      ) : step === 1 ? /* @__PURE__ */ jsx(
        OnboardingChoiceGroup,
        {
          title: "Who are you doing SEO for?",
          options: [...WORK_FOR_OPTIONS],
          selectedValues: answers.workFor ? [answers.workFor] : [],
          onToggle: (workFor) => updateAnswers({ workFor }),
          otherValue: answers.workForOther,
          onOtherChange: (workForOther) => updateAnswers({ workForOther }),
          followUp: {
            showForValue: CLIENT_WORK_FOR,
            label: "About how many client sites do you work on?",
            options: [...CLIENT_WEBSITE_COUNT_OPTIONS],
            value: answers.clientWebsiteCount,
            onChange: (clientWebsiteCount) => updateAnswers({ clientWebsiteCount })
          }
        }
      ) : step === 2 ? /* @__PURE__ */ jsx(
        OnboardingChoiceGroup,
        {
          title: "How did you find OpenSEO?",
          options: [...SOURCE_OPTIONS],
          selectedValues: answers.source ? [answers.source] : [],
          onToggle: (source) => updateAnswers({ source }),
          otherValue: answers.sourceOther,
          onOtherChange: (sourceOther) => updateAnswers({ sourceOther }),
          hiddenOnMobile: [...SOURCE_OPTIONS_HIDDEN_ON_MOBILE]
        }
      ) : /* @__PURE__ */ jsx(SearchConsoleOnboardingStep, {}),
      /* @__PURE__ */ jsxs("div", { className: "mt-5 flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "btn btn-ghost",
            disabled: step === 0 || isSaving,
            onClick: onBack,
            children: "Back"
          }
        ),
        step < ONBOARDING_LAST_STEP ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-ghost btn-sm text-base-content/55",
              disabled: isSaving,
              onClick: onSkip,
              children: "Skip"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              className: "btn btn-primary",
              disabled: !canContinue || isSaving,
              onClick: onNext,
              children: [
                "Continue",
                /* @__PURE__ */ jsx(ArrowRight, { className: "size-4" })
              ]
            }
          )
        ] }) : /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: "btn btn-primary",
            disabled: isSaving,
            onClick: onFinish,
            children: [
              "Finish",
              /* @__PURE__ */ jsx(ArrowRight, { className: "size-4" })
            ]
          }
        )
      ] })
    ] })
  ] });
}
function OnboardingChoiceGroup({
  title,
  description,
  options,
  selectedValues,
  onToggle,
  otherValue,
  onOtherChange,
  multiple = false,
  maxSelections,
  followUp,
  hiddenOnMobile
}) {
  const isOtherSelected = selectedValues.includes("Other");
  const showFollowUp = followUp !== void 0 && selectedValues.includes(followUp.showForValue);
  const atLimit = maxSelections !== void 0 && selectedValues.length >= maxSelections;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: title }),
      description ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-base-content/60", children: description }) : null
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-2", children: options.map((option) => {
      const selected = selectedValues.includes(option);
      const disabled = atLimit && !selected;
      const showFollowUpHere = showFollowUp && followUp?.showForValue === option;
      const mobileHidden = hiddenOnMobile?.includes(option) && !selected;
      return /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: `${mobileHidden ? "hidden sm:flex" : "flex"} min-h-11 items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${selected ? "border-base-content bg-base-200 text-base-content" : disabled ? "border-base-300 text-base-content/35 cursor-not-allowed" : "border-base-300 text-base-content/75 hover:border-base-content/40 hover:bg-base-200/60"}`,
            "aria-pressed": selected,
            disabled,
            onClick: () => onToggle(option),
            children: [
              /* @__PURE__ */ jsx("span", { children: option }),
              selected ? /* @__PURE__ */ jsx(Check, { className: "size-4 shrink-0" }) : null
            ]
          }
        ),
        showFollowUpHere && followUp ? /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-base-300 bg-base-200/40 px-3 py-2.5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: followUp.label }),
          /* @__PURE__ */ jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: followUp.options.map((followUpOption) => {
            const followUpSelected = followUp.value === followUpOption;
            return /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: `rounded-md border px-3 py-1.5 text-sm transition-colors ${followUpSelected ? "border-base-content bg-base-200 text-base-content" : "border-base-300 text-base-content/75 hover:border-base-content/40 hover:bg-base-200/60"}`,
                "aria-pressed": followUpSelected,
                onClick: () => followUp.onChange(
                  followUpSelected ? "" : followUpOption
                ),
                children: followUpOption
              },
              followUpOption
            );
          }) })
        ] }) : null
      ] }, option);
    }) }),
    isOtherSelected ? /* @__PURE__ */ jsx(
      "input",
      {
        type: "text",
        className: "input input-bordered w-full",
        placeholder: multiple ? "Tell us what else..." : "Tell us more...",
        value: otherValue,
        onChange: (event) => onOtherChange(event.target.value)
      }
    ) : null
  ] });
}
const ONBOARDING_EXISTING_USER_CUTOFF = "2026-05-27T00:00:00.000Z";
function OnboardingPage() {
  const {
    data: session
  } = useSession();
  const onboardingQuery = useQuery(onboardingAnswersQueryOptions());
  if (!onboardingQuery.data) {
    return null;
  }
  const userCreatedAt = onboardingQuery.data.userCreatedAt ? Date.parse(onboardingQuery.data.userCreatedAt) : Date.now();
  const isExistingUser = userCreatedAt < Date.parse(ONBOARDING_EXISTING_USER_CUTOFF);
  const firstName = session?.user?.name?.split(" ")[0] || "";
  return /* @__PURE__ */ jsx(OnboardingFlow, { firstName, isExistingUser, initialAnswers: restoreOnboardingAnswers(onboardingQuery.data.answers), email: session?.user?.email });
}
function OnboardingFlow({
  firstName,
  isExistingUser,
  initialAnswers,
  email
}) {
  const navigate = useNavigate();
  const {
    step
  } = Route.useSearch();
  const [answers, setAnswers] = useState(initialAnswers);
  const saveMutation = useMutation({
    mutationFn: (extra) => saveOnboardingAnswers({
      data: buildOnboardingPayload(answers, step, extra)
    }),
    onError: (error) => {
      console.error("Failed to save onboarding answers", error);
    }
  });
  const goToStep = (next) => void navigate({
    to: "/onboarding",
    search: {
      step: clampStep(next)
    }
  });
  const handleNext = () => {
    if (step === 0) {
      captureClientEvent("onboarding:interests_selected", {
        interests: answers.selectedInterests,
        interest_other: answers.interestOther.trim() || void 0
      });
    }
    saveMutation.mutate({});
    goToStep(step + 1);
  };
  const handleSkip = () => {
    saveMutation.mutate({});
    captureClientEvent("onboarding:step_skipped", {
      step
    });
    goToStep(step + 1);
  };
  const handleFinish = async () => {
    try {
      await saveMutation.mutateAsync({
        completed: true
      });
      await queryClient.invalidateQueries({
        queryKey: ["onboardingAnswers"]
      });
    } catch {
    }
    captureClientEvent("onboarding:completed", {
      interests: answers.selectedInterests,
      work_for: answers.workFor,
      source: answers.source
    });
    void navigate({
      to: "/",
      replace: true
    });
  };
  return /* @__PURE__ */ jsx(PostSignupOnboarding, { firstName, title: isExistingUser ? "Tell us about your work" : void 0, helperText: isExistingUser ? "A little context helps us decide where to focus. You can also reach me anytime at ben@openseo.so." : void 0, step, answers, onAnswersChange: setAnswers, onNext: handleNext, onBack: () => goToStep(step - 1), onSkip: handleSkip, onFinish: handleFinish, isSaving: saveMutation.isPending, accountMenu: /* @__PURE__ */ jsx(OnboardingAccountMenu, { email }) });
}
export {
  OnboardingPage as component
};
