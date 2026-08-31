import { ao as normalizeDomain } from "../entry.js";
function detectTarget(rawInput) {
  const trimmed = rawInput.trim();
  const looksLikeDomain = trimmed.length > 0 && !/\s/.test(trimmed) && trimmed.includes(".");
  if (looksLikeDomain) {
    try {
      const hostname = normalizeDomain(trimmed);
      if (hostname.includes(".")) {
        return { type: "domain", value: hostname };
      }
    } catch {
    }
  }
  return { type: "keyword", value: trimmed };
}
export {
  detectTarget as d
};
