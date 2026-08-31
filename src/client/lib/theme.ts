import * as React from "react";

export type ThemePreference = "system" | "light" | "dark";

const LIGHT_THEME_NAME = "openseo";

const THEME_STORAGE_KEY = "theme-preference";
const THEME_CHANGE_EVENT = "theme-preference-change";

function readThemePreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
    return "system";
  } catch {
    return "system";
  }
}

function writeThemePreference(themePreference: ThemePreference) {
  try {
    if (themePreference === "system") {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      window.localStorage.setItem(THEME_STORAGE_KEY, themePreference);
    }
  } catch {
    // localStorage can be unavailable in private browsing or strict browser modes.
  }
}

function resolveThemeName(_themePreference: ThemePreference): string {
  // LEIFKEN landscape rule (Oliver, 31.08.2026): light only — no dark mode,
  // no OS-scheme resolution, no user toggle.
  return LIGHT_THEME_NAME;
}

function applyThemePreference(themePreference: ThemePreference) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.setAttribute(
    "data-theme",
    resolveThemeName(themePreference),
  );
}

function subscribeToThemePreference(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleThemeChange = () => {
    onStoreChange();
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== THEME_STORAGE_KEY) {
      return;
    }

    onStoreChange();
  };

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleMediaChange = () => {
    // Re-apply when OS preference changes so "system" mode stays in sync
    applyThemePreference(readThemePreference());
    onStoreChange();
  };

  window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  window.addEventListener("storage", handleStorage);
  mediaQuery.addEventListener("change", handleMediaChange);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    window.removeEventListener("storage", handleStorage);
    mediaQuery.removeEventListener("change", handleMediaChange);
  };
}

export function useThemePreference() {
  const themePreference = React.useSyncExternalStore<ThemePreference>(
    subscribeToThemePreference,
    readThemePreference,
    () => "system",
  );

  React.useEffect(() => {
    applyThemePreference(themePreference);
  }, [themePreference]);

  const setThemePreference = React.useCallback(
    (nextThemePreference: ThemePreference) => {
      writeThemePreference(nextThemePreference);
      applyThemePreference(nextThemePreference);
      window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    },
    [],
  );

  return { themePreference, setThemePreference };
}

export const themePreferenceInitScript = `(() => {
  try {
    // Light only (LEIFKEN landscape rule) — no stored preference, no OS scheme.
    document.documentElement.setAttribute("data-theme", ${JSON.stringify(LIGHT_THEME_NAME)});
  } catch {
    document.documentElement.setAttribute("data-theme", ${JSON.stringify(LIGHT_THEME_NAME)});
  }
})();`;
