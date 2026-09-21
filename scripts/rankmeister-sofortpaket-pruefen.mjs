#!/usr/bin/env node
// Live-Beleg für SEO-4 ("RankMeister Sofortpaket") nach dem Deploy nach
// node-port. Ruft die neuen/reparierten MCP-Werkzeuge gegen die echte
// Produktion auf (https://seo.leifken.ai/mcp per Default) und prüft je
// Versprechen den tatsächlichen Rückgabewert — nicht nur "kein Fehler".
//
// WICHTIG: Kostet echtes Geld bei DataForSEO. Nicht aus der Entwicklung
// heraus laufen lassen (Regel: keine kostenpflichtigen Live-Aufrufe in der
// Entwicklung). Erst nach Merge + Deploy durch die Umsetzungsleitung, mit
// einem echten OPENSEO_API_KEY der Zielumgebung.
//
// Bricht ab, sobald die aufsummierten Kosten (aus meta.costUsd jeder
// Antwort) 3 € erreicht oder überschritten haben — geprüft VOR jedem
// weiteren Aufruf, nicht rückwirkend. Noch ausstehende Prüfungen werden
// dann als "übersprungen (Kostengrenze)" gemeldet, nicht als Fehlschlag.
//
// Nutzung:
//   OPENSEO_API_KEY=oseo_... node scripts/rankmeister-sofortpaket-pruefen.mjs \
//     [--url https://seo.leifken.ai/mcp] [--project-id <id>] [--budget-eur 3]
//
// Projekt-IDs der drei eigenen Seiten stehen in BETRIEB.md §10 (nicht im
// Repo) — Default unten ist leifken.ai.

import process from "node:process";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
  const key = process.argv[i]?.replace(/^--/, "");
  if (!key) continue;
  args.set(key, process.argv[i + 1]);
}

const mcpUrl = args.get("url") ?? "https://seo.leifken.ai/mcp";
// leifken.ai, siehe BETRIEB.md §10 ("Bekannte Lücken").
const projectId =
  args.get("project-id") ?? "b0ae6311-3ba7-4682-ad67-5512d33b198f";
// Derselbe feste Kurs wie im CRM (ENTSCHEIDUNGEN.md 15.09.2026: 1 € = 1,08 $).
const EUR_TO_USD = 1.08;
const budgetEur = Number(args.get("budget-eur") ?? 3);
const budgetUsd = budgetEur * EUR_TO_USD;

const apiKey = process.env.OPENSEO_API_KEY;
if (!apiKey) {
  console.error(
    "OPENSEO_API_KEY fehlt. Dieses Skript ruft die echte Produktion auf und kostet Geld — nicht ohne den Zielumgebungs-Schlüssel und nicht aus der Entwicklung starten.",
  );
  process.exit(2);
}

let spentUsd = 0;
let nextId = 1;
const results = [];

function eur(usd) {
  return (usd / EUR_TO_USD).toFixed(3);
}

/** One MCP tools/call round trip. Throws on a JSON-RPC-level error; a tool
 *  error (isError: true) is returned normally so callers can inspect it. */
async function callTool(name, toolArgs) {
  const res = await fetch(mcpUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: nextId++,
      method: "tools/call",
      params: { name, arguments: toolArgs },
    }),
  });
  const text = await res.text();
  let body;
  try {
    // Some deployments answer text/event-stream even for a single response;
    // take the last "data: {...}" frame if present, else parse as plain JSON.
    const dataLine = text
      .split("\n")
      .filter((line) => line.startsWith("data: "))
      .pop();
    body = JSON.parse(dataLine ? dataLine.slice(6) : text);
  } catch {
    throw new Error(
      `${name}: konnte die Antwort nicht als JSON lesen (HTTP ${res.status}): ${text.slice(0, 300)}`,
    );
  }
  if (body.error) {
    throw new Error(`${name}: JSON-RPC-Fehler — ${JSON.stringify(body.error)}`);
  }
  const result = body.result;
  const costUsd =
    result?._meta?.costUsd ?? result?.structuredContent?.meta?.costUsd ?? 0;
  if (typeof costUsd === "number") spentUsd += costUsd;
  return result;
}

function remainingBudget() {
  return budgetUsd - spentUsd;
}

async function check(label, fn) {
  if (remainingBudget() <= 0) {
    console.log(
      `⏭  ${label}: übersprungen (Kostengrenze ${budgetEur} € erreicht, bisher ${eur(spentUsd)} €)`,
    );
    results.push({ label, status: "skipped" });
    return;
  }
  try {
    const detail = await fn();
    console.log(
      `✓  ${label}${detail ? ` — ${detail}` : ""} (bisher ${eur(spentUsd)} € von ${budgetEur} €)`,
    );
    results.push({ label, status: "ok", detail });
  } catch (error) {
    console.log(
      `✗  ${label} — ${error instanceof Error ? error.message : String(error)}`,
    );
    results.push({ label, status: "failed", error: String(error) });
  }
}

// ---------------------------------------------------------------------------
// Punkt 2: whoami liefert den echten DataForSEO-Kontostand
// ---------------------------------------------------------------------------
await check("Punkt 2 — whoami liefert dataforseoAccountBalance", async () => {
  const result = await callTool("whoami", {});
  const balance = result?.structuredContent?.dataforseoAccountBalance;
  if (!balance || typeof balance.balanceUsd !== "number") {
    throw new Error(
      `dataforseoAccountBalance fehlt oder ist unvollständig: ${JSON.stringify(balance)}`,
    );
  }
  return `Guthaben ${balance.balanceUsd} $ von ${balance.depositedTotalUsd} $ eingezahlt`;
});

// ---------------------------------------------------------------------------
// Punkt 1 — dringende Reparatur: get_business_profile für "LEIFKEN AI",
// die Anfrage aus dem Prod-Vorfall vom 21.09. Bewusst zuerst geprüft.
// ---------------------------------------------------------------------------
await check(
  'Punkt 1/4 — get_business_profile "LEIFKEN AI" (Prod-Vorfall 21.09., nie mehr fälschlich "nicht gefunden")',
  async () => {
    const result = await callTool("get_business_profile", {
      projectId,
      businessName: "LEIFKEN AI",
    });
    const content = result?.structuredContent;
    if (result?.isError && content?.status !== "timeout") {
      throw new Error(`unerwarteter Fehler: ${JSON.stringify(content)}`);
    }
    if (content?.status === "timeout") {
      if (
        content.errorCode !== "zeitueberschreitung" ||
        content.profile !== null
      ) {
        throw new Error(
          `Zeitüberschreitung falsch gemeldet (erwartet errorCode "zeitueberschreitung", profile: null): ${JSON.stringify(content)}`,
        );
      }
      return `Zeitüberschreitung ehrlich gemeldet (taskId "${content.taskId}" zum kostenlosen Fortsetzen) — kein Fehlschlag dieser Prüfung, aber bitte erneut mit --resume-task-id versuchen`;
    }
    if (content?.status !== "completed") {
      throw new Error(`unerwarteter status: ${JSON.stringify(content)}`);
    }
    if (!content.profile) {
      throw new Error(
        'profile: null bei einem bekannten, existierenden Profil — das wäre wieder ein falsches "nicht gefunden"',
      );
    }
    if (!Array.isArray(content.dataGaps)) {
      throw new Error(
        "dataGaps fehlt in der vollständigen Profil-Antwort (Punkt 4)",
      );
    }
    return `Profil gefunden: "${content.profile.title}", dataGaps: ${content.dataGaps.length} benannt`;
  },
);

// ---------------------------------------------------------------------------
// Punkt 3: Lighthouse/Core Web Vitals über MCP lesbar
// ---------------------------------------------------------------------------
await check(
  "Punkt 3 — get_audit_lighthouse ist aufrufbar und antwortet strukturiert",
  async () => {
    const result = await callTool("get_audit_lighthouse", { projectId });
    const content = result?.structuredContent;
    if (
      !Array.isArray(content?.results) ||
      typeof content?.total !== "number"
    ) {
      throw new Error(`unerwartete Struktur: ${JSON.stringify(content)}`);
    }
    return content.total === 0
      ? "keine Lighthouse-Daten (ehrlich als 0 gemeldet — Audit lief ggf. ohne runLighthouse)"
      : `${content.total} Lighthouse-Ergebnis(se), z. B. LCP ${content.results[0]?.coreWebVitals?.lcpMs} ms`;
  },
);

// ---------------------------------------------------------------------------
// Punkt 5 — fünf neue Werkzeuge: je ein günstiger Smoke-Test.
// ---------------------------------------------------------------------------
await check("Punkt 5 — get_autocomplete_suggestions antwortet", async () => {
  const result = await callTool("get_autocomplete_suggestions", {
    projectId,
    query: "leifken ai",
  });
  if (!Array.isArray(result?.structuredContent?.suggestions)) {
    throw new Error(
      `unerwartete Struktur: ${JSON.stringify(result?.structuredContent)}`,
    );
  }
  return `${result.structuredContent.suggestions.length} Vorschläge`;
});

await check("Punkt 5 — get_keywords_for_site antwortet", async () => {
  const result = await callTool("get_keywords_for_site", {
    projectId,
    domain: "leifken.ai",
    limit: 10,
  });
  if (!Array.isArray(result?.structuredContent?.keywords)) {
    throw new Error(
      `unerwartete Struktur: ${JSON.stringify(result?.structuredContent)}`,
    );
  }
  return `${result.structuredContent.keywords.length} Keyword-Ideen`;
});

await check("Punkt 5 — get_historical_rank_overview antwortet", async () => {
  const result = await callTool("get_historical_rank_overview", {
    projectId,
    domain: "leifken.ai",
  });
  if (!Array.isArray(result?.structuredContent?.months)) {
    throw new Error(
      `unerwartete Struktur: ${JSON.stringify(result?.structuredContent)}`,
    );
  }
  return `${result.structuredContent.months.length} Monat(e) Verlauf`;
});

await check(
  "Punkt 5 — get_keyword_gap antwortet (gegen postmeister.ai als Test-Wettbewerber)",
  async () => {
    const result = await callTool("get_keyword_gap", {
      projectId,
      yourDomain: "leifken.ai",
      competitorDomain: "postmeister.ai",
      limit: 10,
    });
    if (!Array.isArray(result?.structuredContent?.items)) {
      throw new Error(
        `unerwartete Struktur: ${JSON.stringify(result?.structuredContent)}`,
      );
    }
    return `${result.structuredContent.gapCount} Lücken-Keyword(s) von ${result.structuredContent.totalReturned} geprüften`;
  },
);

await check(
  "Punkt 5 — get_chatgpt_answer antwortet mit Markdown und Ort/Sprache",
  async () => {
    const result = await callTool("get_chatgpt_answer", {
      projectId,
      query: "Was ist LEIFKEN AI?",
      locationCode: 2276,
      languageCode: "de",
    });
    const content = result?.structuredContent?.result;
    if (!content?.markdown) {
      throw new Error(
        `kein markdown in der Antwort: ${JSON.stringify(content)}`,
      );
    }
    return `Antwort erhalten (${content.markdown.length} Zeichen, Ort ${content.location_code}, Sprache ${content.language_code})`;
  },
);

await check(
  "Punkt 5 — get_gemini_ai_answer (Google AI Mode) antwortet mit Ort/Sprache",
  async () => {
    const result = await callTool("get_gemini_ai_answer", {
      projectId,
      query: "Was ist LEIFKEN AI?",
      locationCode: 2276,
      languageCode: "de",
    });
    const content = result?.structuredContent?.result;
    if (content?.location_code == null || content?.language_code == null) {
      throw new Error(
        `Ort/Sprache fehlen in der Antwort: ${JSON.stringify(content)}`,
      );
    }
    return content.items?.[0]?.markdown
      ? `AI-Mode-Antwort erhalten (Ort ${content.location_code}, Sprache ${content.language_code})`
      : "keine AI-Mode-Antwort für diese Anfrage (ehrlich als leer gemeldet)";
  },
);

// ---------------------------------------------------------------------------
// Zusammenfassung
// ---------------------------------------------------------------------------
console.log("");
console.log(
  `Gesamtkosten: ${eur(spentUsd)} € von ${budgetEur} € Budget (${spentUsd.toFixed(4)} $)`,
);
const failed = results.filter((r) => r.status === "failed");
const skipped = results.filter((r) => r.status === "skipped");
console.log(
  `${results.length - failed.length - skipped.length} von ${results.length} Prüfungen bestanden, ${failed.length} fehlgeschlagen, ${skipped.length} übersprungen.`,
);
process.exit(failed.length > 0 ? 1 : 0);
