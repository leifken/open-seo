const LIGHT_THEME_NAME = "openseo";

export const themePreferenceInitScript = `(() => {
  try {
    // Light only (LEIFKEN landscape rule) — no stored preference, no OS scheme.
    document.documentElement.setAttribute("data-theme", ${JSON.stringify(LIGHT_THEME_NAME)});
  } catch {
    document.documentElement.setAttribute("data-theme", ${JSON.stringify(LIGHT_THEME_NAME)});
  }
})();`;
