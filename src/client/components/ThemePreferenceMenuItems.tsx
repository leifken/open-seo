// LEIFKEN landscape rule (Oliver, 31.08.2026): the app is light-only — no
// theme switcher anywhere. Kept as a null component so the three upstream
// call sites (Sidebar footer, onboarding account menu, subscribe page) stay
// untouched and upstream merges stay clean.
export function ThemePreferenceMenuItems() {
  return null;
}
