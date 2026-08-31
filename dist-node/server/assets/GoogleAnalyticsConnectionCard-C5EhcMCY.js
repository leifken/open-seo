import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { s as startGoogleLink, G as GoogleGlyph, g as getGa4Connection, l as listGa4Properties, a as setGa4Property, d as disconnectGa4 } from "./startGoogleLink-B3EIh1_V.js";
import { G as GoogleOAuthSetupWarning } from "./SitePicker-CGqABpQz.js";
import { I as IntegrationConnectionCard, G as GoogleAnalyticsLogo } from "./SearchConsoleConnectionCard-CrJ5TYgj.js";
import { p as getStandardErrorMessage, c as captureClientEvent } from "./router-DHiBnyXs.js";
import { az as isHostedClientAuthMode, bl as GA4_SELF_HOSTED_SETUP_DOCS_URL } from "../entry.js";
function Ga4PropertyPicker({
  loading,
  error,
  accounts,
  selection,
  onSelect,
  onSave,
  saving,
  onRetry,
  secondaryAction
}) {
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-base-content/50", children: [
      /* @__PURE__ */ jsx("span", { className: "loading loading-spinner loading-sm" }),
      "Loading properties…"
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-error", children: "Couldn’t load your Google Analytics properties." }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-1", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "btn btn-ghost btn-sm",
            onClick: onRetry,
            children: "Try again"
          }
        ),
        secondaryAction ? /* @__PURE__ */ jsx(SecondaryActionButton, { action: secondaryAction }) : null
      ] })
    ] });
  }
  const allAccountsRequireReconnect = accounts.length > 0 && accounts.every((account) => account.requiresReconnect);
  if (allAccountsRequireReconnect) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-error", children: "Connection expired. Reconnect to continue." }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-1", children: [
        /* @__PURE__ */ jsx(
          GoogleConnectButton,
          {
            label: "Reconnect with Google",
            onClick: () => void startGoogleLink("ga4", window.location.href)
          }
        ),
        secondaryAction ? /* @__PURE__ */ jsx(SecondaryActionButton, { action: secondaryAction }) : null
      ] })
    ] });
  }
  const usableAccounts = accounts.filter(
    (account) => !account.requiresReconnect && !account.propertiesUnavailable
  );
  const options = usableAccounts.flatMap(
    (account) => account.properties.map((property) => ({
      accountId: account.accountId,
      propertyId: property.propertyId
    }))
  );
  const selectedIndex = selection ? options.findIndex(
    (option) => option.accountId === selection.accountId && option.propertyId === selection.propertyId
  ) : -1;
  const hasUnavailableAccounts = accounts.some(
    (account) => account.propertiesUnavailable
  );
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    hasUnavailableAccounts ? /* @__PURE__ */ jsx("p", { className: "text-sm text-warning", children: "Some properties couldn’t be loaded. Check that the Analytics Admin API is enabled and that this Google account has property access." }) : null,
    /* @__PURE__ */ jsxs("label", { className: "block", children: [
      /* @__PURE__ */ jsx("span", { className: "mb-1.5 block text-sm font-medium text-base-content/80", children: "Property" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          className: "select select-bordered w-full max-w-md",
          value: selectedIndex >= 0 ? String(selectedIndex) : "",
          onChange: (event) => {
            const option = options[Number(event.target.value)];
            if (option) onSelect(option);
          },
          children: [
            /* @__PURE__ */ jsx("option", { value: "", disabled: true, children: "Select a property…" }),
            usableAccounts.map((account) => /* @__PURE__ */ jsx(
              "optgroup",
              {
                label: account.email ?? "Google account",
                children: account.properties.length === 0 ? /* @__PURE__ */ jsx("option", { disabled: true, children: "No properties" }) : account.properties.map((property) => {
                  const index = options.findIndex(
                    (option) => option.accountId === account.accountId && option.propertyId === property.propertyId
                  );
                  return /* @__PURE__ */ jsxs("option", { value: index, children: [
                    property.accountDisplayName,
                    " · ",
                    property.displayName
                  ] }, property.propertyId);
                })
              },
              account.accountId
            ))
          ]
        }
      )
    ] }),
    options.length === 0 && !hasUnavailableAccounts ? /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/60", children: "No Google Analytics properties are available for this account." }) : null,
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-1", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "btn btn-primary btn-sm",
          onClick: onSave,
          disabled: selectedIndex < 0 || saving,
          children: saving ? "Saving…" : "Save property"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "btn btn-ghost btn-sm",
          onClick: () => void startGoogleLink("ga4", window.location.href),
          children: "Connect another Google account"
        }
      ),
      secondaryAction ? /* @__PURE__ */ jsx(SecondaryActionButton, { action: secondaryAction }) : null
    ] })
  ] });
}
function SecondaryActionButton({ action }) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      className: [
        "btn btn-ghost btn-sm",
        action.destructive ? "text-error hover:bg-error/10" : ""
      ].join(" "),
      onClick: action.onClick,
      disabled: action.disabled,
      children: action.label
    }
  );
}
function GoogleConnectButton({
  label,
  onClick
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: "inline-flex items-center gap-2.5 rounded-lg border border-base-300 bg-base-100 px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-base-200",
      children: [
        /* @__PURE__ */ jsx(GoogleGlyph, { className: "size-[18px]" }),
        label
      ]
    }
  );
}
function GoogleAnalyticsConnectionCard({
  projectId,
  onDismiss,
  dismissing = false,
  heading
}) {
  const hosted = isHostedClientAuthMode();
  const queryClient = useQueryClient();
  const [picking, setPicking] = React.useState(false);
  const [selection, setSelection] = React.useState(
    null
  );
  const connectionKey = ["ga4Connection", projectId];
  const connectionQuery = useQuery({
    queryKey: connectionKey,
    queryFn: () => getGa4Connection({ data: { projectId } })
  });
  const connection = connectionQuery.data;
  const connected = Boolean(connection?.connected);
  const selfHostedNeedsSetup = !hosted && connectionQuery.isSuccess && !connection?.googleOAuthConfigured;
  const showPicker = picking || connection?.currentUserHasGrant && !connected;
  const propertiesQuery = useQuery({
    queryKey: ["ga4Properties", projectId],
    queryFn: () => listGa4Properties({ data: { projectId } }),
    enabled: Boolean(showPicker && !selfHostedNeedsSetup)
  });
  const accounts = React.useMemo(
    () => propertiesQuery.data?.accounts ?? [],
    [propertiesQuery.data?.accounts]
  );
  React.useEffect(() => {
    if (selection) return;
    for (const account of accounts) {
      const selectedProperty = account.properties.find(
        (property) => property.isSelected
      );
      if (selectedProperty) {
        setSelection({
          accountId: account.accountId,
          propertyId: selectedProperty.propertyId
        });
        return;
      }
    }
  }, [accounts, selection]);
  const invalidateConnectionState = () => {
    void queryClient.invalidateQueries({ queryKey: connectionKey });
    void queryClient.invalidateQueries({
      queryKey: ["dashboardActivation", projectId]
    });
    void queryClient.invalidateQueries({
      queryKey: ["dashboardGa4Report", projectId]
    });
  };
  const setPropertyMutation = useMutation({
    mutationFn: (selected) => setGa4Property({ data: { projectId, ...selected } }),
    onSuccess: () => {
      captureClientEvent("ga4:property_select");
      toast.success("Google Analytics connected");
      setPicking(false);
      invalidateConnectionState();
    },
    onError: (error) => toast.error(getStandardErrorMessage(error))
  });
  const disconnectMutation = useMutation({
    mutationFn: () => disconnectGa4({ data: { projectId } }),
    onSuccess: () => {
      toast.success("Google Analytics disconnected");
      setPicking(false);
      setSelection(null);
      invalidateConnectionState();
    },
    onError: (error) => toast.error(getStandardErrorMessage(error))
  });
  const handleConnect = () => void startGoogleLink("ga4", window.location.href);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    heading,
    /* @__PURE__ */ jsx(
      IntegrationConnectionCard,
      {
        title: "Google Analytics",
        icon: /* @__PURE__ */ jsx(GoogleAnalyticsLogo, { className: "size-5" }),
        status: connectionQuery.isLoading ? void 0 : selfHostedNeedsSetup ? "setup_required" : connected ? "connected" : "disconnected",
        children: connectionQuery.isLoading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-base-content/50", children: [
          /* @__PURE__ */ jsx("span", { className: "loading loading-spinner loading-sm" }),
          "Checking…"
        ] }) : selfHostedNeedsSetup ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx(
            GoogleOAuthSetupWarning,
            {
              integrationName: "Google Analytics",
              docsUrl: GA4_SELF_HOSTED_SETUP_DOCS_URL
            }
          ),
          onDismiss ? /* @__PURE__ */ jsx(DismissButton, { onClick: onDismiss, disabled: dismissing }) : null
        ] }) : connected && !picking ? /* @__PURE__ */ jsx(
          ConnectedState,
          {
            displayName: connection?.propertyDisplayName ?? "",
            propertyId: connection?.propertyId ?? "",
            timeZone: connection?.propertyTimeZone ?? "",
            currencyCode: connection?.propertyCurrencyCode ?? "",
            connectedByEmail: connection?.connectedByEmail ?? null,
            onChange: () => {
              setSelection(null);
              setPicking(true);
            },
            onDisconnect: () => disconnectMutation.mutate(),
            disconnecting: disconnectMutation.isPending
          }
        ) : showPicker ? /* @__PURE__ */ jsx(
          Ga4PropertyPicker,
          {
            loading: propertiesQuery.isLoading,
            error: propertiesQuery.isError,
            accounts,
            selection,
            onSelect: setSelection,
            onSave: () => selection && setPropertyMutation.mutate(selection),
            saving: setPropertyMutation.isPending,
            onRetry: () => void propertiesQuery.refetch(),
            secondaryAction: connected ? { label: "Cancel", onClick: () => setPicking(false) } : onDismiss ? {
              label: "Dismiss",
              disabled: dismissing,
              onClick: onDismiss
            } : {
              label: "Disconnect",
              destructive: true,
              disabled: disconnectMutation.isPending,
              onClick: () => disconnectMutation.mutate()
            }
          }
        ) : /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: "Connect GA4 to understand what organic visitors do after they land on your site." }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-1", children: [
            /* @__PURE__ */ jsxs(
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
            ),
            onDismiss ? /* @__PURE__ */ jsx(DismissButton, { onClick: onDismiss, disabled: dismissing }) : null
          ] })
        ] })
      }
    )
  ] });
}
function DismissButton({
  onClick,
  disabled
}) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      className: "btn btn-ghost btn-sm text-base-content/60",
      onClick,
      disabled,
      children: "Dismiss"
    }
  );
}
function ConnectedState({
  displayName,
  propertyId,
  timeZone,
  currencyCode,
  connectedByEmail,
  onChange,
  onDisconnect,
  disconnecting
}) {
  const numericPropertyId = propertyId.replace(/^properties\//, "");
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-base-300 bg-base-200/30 px-4 py-3.5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-x-4 gap-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-base-content/45", children: "Selected property" }),
          /* @__PURE__ */ jsx("p", { className: "mt-0.5 truncate text-sm font-semibold", children: displayName })
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "rounded-md border border-base-300 bg-base-100 px-2 py-1 font-mono text-[11px] text-base-content/60", children: [
          "ID ",
          numericPropertyId
        ] })
      ] }),
      /* @__PURE__ */ jsxs("dl", { className: "mt-3 grid gap-x-6 gap-y-2 border-t border-base-300/70 pt-3 text-xs sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("dt", { className: "text-base-content/45", children: "Time zone" }),
          /* @__PURE__ */ jsx("dd", { className: "mt-0.5 truncate font-medium text-base-content/75", children: timeZone })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("dt", { className: "text-base-content/45", children: "Currency" }),
          /* @__PURE__ */ jsx("dd", { className: "mt-0.5 font-medium text-base-content/75", children: currencyCode })
        ] }),
        connectedByEmail ? /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("dt", { className: "text-base-content/45", children: "Connected account" }),
          /* @__PURE__ */ jsx("dd", { className: "mt-0.5 truncate font-medium text-base-content/75", children: connectedByEmail })
        ] }) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "btn btn-outline btn-sm border-base-300 font-medium",
          onClick: onChange,
          children: "Change property"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "btn btn-ghost btn-sm font-medium text-error hover:bg-error/10",
          onClick: onDisconnect,
          disabled: disconnecting,
          children: disconnecting ? "Disconnecting…" : "Disconnect"
        }
      )
    ] })
  ] });
}
export {
  GoogleAnalyticsConnectionCard as G
};
