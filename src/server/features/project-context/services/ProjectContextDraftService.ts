// LEIFKEN addition: draft the project context straight from the project's own
// website, so a new project doesn't start with four empty text boxes. Reads a
// handful of pages with the existing scraper (SSRF-guarded, no credits), has
// the chat model turn them into the same update ops SAM would write, and hands
// those to the regular applyContextUpdates path — no new storage, no new
// validation, no new credit feature.
import { generateObject } from "ai";
import { z } from "zod";
import { readSite } from "@/server/lib/scrape";
import { getChatAgentModel } from "@/server/lib/openrouter";
import { openRouterCostUsd } from "@/server/lib/chatAgent";
import { AppError } from "@/server/lib/errors";
import { isHostedServerAuthMode } from "@/server/lib/runtime-env";
import {
  checkUsageCreditsDepleted,
  trackUsageCreditSpend,
  type BillingCustomerContext,
} from "@/server/billing/subscription";
import {
  KEY_PAGE_ROLES,
  PROSE_MAX_CHARS,
  type ProjectContextUpdate,
} from "@/types/schemas/projectContext";

/** Pages to read before drafting — enough signal without a full crawl. */
const PAGES_TO_READ = 8;
const MAX_COMPETITORS = 8;
const MAX_KEY_PAGES = 10;

const draftSchema = z.object({
  businessOverview: z.string(),
  currentGoal: z.string(),
  positioning: z.string(),
  writingPreferences: z.string(),
  competitors: z
    .array(
      z.object({
        domain: z.string(),
        name: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .max(MAX_COMPETITORS),
  keyPages: z
    .array(
      z.object({
        url: z.string(),
        role: z.enum(KEY_PAGE_ROLES),
        topic: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .max(MAX_KEY_PAGES),
});

const SYSTEM_PROMPT = `Du bist ein SEO-Stratege und erstellst das Projektgedächtnis für eine Website.
Du bekommst den Textinhalt mehrerer Seiten dieser Website.

Schreibe ausschließlich auf Deutsch, sachlich und konkret, in der Du-Form, ohne Marketing-Floskeln.
Leite nur ab, was der Seiteninhalt hergibt. Was du erschließt statt vorfindest, markierst du mit "(vermutet)".
Wenn eine Angabe nicht belegbar ist, lass das Feld leer statt zu raten.

Felder:
- businessOverview: Was wird verkauft, an wen, in welchem Markt.
- currentGoal: Woran die Website gerade erkennbar arbeitet. Fast immer "(vermutet)".
- positioning: Warum jemand hier kauft und nicht bei Alternativen.
- writingPreferences: Tonalität und Sprache der Website, als Vorgabe für künftige Inhalte.
- competitors: Nur namentlich auf der Website genannte Wettbewerber, als blanke Domain (ohne https/www).
- keyPages: Die wichtigsten gelesenen Seiten mit Rolle: money (verkauft direkt), hub (Themenübersicht), spoke (Einzelthema), other.`;

async function draftFromPages(
  domain: string,
  pages: { url: string; title: string | null; text: string }[],
) {
  const model = await getChatAgentModel();
  const corpus = pages
    .map((p) => `## ${p.title ?? p.url}\nURL: ${p.url}\n\n${p.text}`)
    .join("\n\n---\n\n");

  return generateObject({
    model,
    schema: draftSchema,
    system: SYSTEM_PROMPT,
    prompt: `Website: ${domain}\n\nGelesene Seiten:\n\n${corpus}`,
    maxOutputTokens: 4000,
  });
}

/** Trim to the caps applyContextUpdates enforces, so nothing is rejected. */
function prose(value: string): string {
  return value.trim().slice(0, PROSE_MAX_CHARS);
}

async function draftContextFromWebsite(
  project: { id: string; domain: string | null },
  billingCustomer: BillingCustomerContext,
): Promise<ProjectContextUpdate[]> {
  if (!project.domain) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Für dieses Projekt ist keine Domain hinterlegt.",
    );
  }

  const site = await readSite(project.domain, PAGES_TO_READ);
  if (site.blocked || site.pages.length === 0) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Die Website konnte nicht gelesen werden (blockiert oder nicht erreichbar).",
    );
  }

  const hosted = await isHostedServerAuthMode();
  let monthlyRemaining = 0;
  if (hosted) {
    const credits = await checkUsageCreditsDepleted(billingCustomer);
    if (credits.depleted) {
      throw new AppError("INSUFFICIENT_CREDITS");
    }
    monthlyRemaining = credits.monthlyRemaining;
  }

  const result = await draftFromPages(project.domain, site.pages);

  if (hosted) {
    const costUsd = openRouterCostUsd(result.providerMetadata);
    if (costUsd > 0) {
      await trackUsageCreditSpend({
        customer: billingCustomer,
        customerId: billingCustomer.organizationId,
        creditFeature: "agent",
        costUsd,
        monthlyRemaining,
        properties: { source: "context_draft", domain: project.domain },
      });
    }
  }

  const draft = result.object;
  const updates: ProjectContextUpdate[] = [];
  const sections = [
    ["business_overview", draft.businessOverview],
    ["current_goal", draft.currentGoal],
    ["positioning", draft.positioning],
    ["writing_preferences", draft.writingPreferences],
  ] as const;
  for (const [section, content] of sections) {
    // Empty content deletes a section — only send what the model filled in.
    if (content?.trim()) updates.push({ section, content: prose(content) });
  }

  const competitors = draft.competitors
    .map((c) => ({
      domain: c.domain.trim(),
      name: c.name?.trim() || undefined,
      notes: c.notes?.trim() || undefined,
    }))
    .filter((c) => c.domain);
  if (competitors.length > 0) updates.push({ addCompetitors: competitors });

  const keyPages = draft.keyPages
    .map((p) => ({
      url: p.url.trim(),
      role: p.role,
      topic: p.topic?.trim() || undefined,
      notes: p.notes?.trim() || undefined,
    }))
    .filter((p) => p.url);
  if (keyPages.length > 0) updates.push({ addKeyPages: keyPages });

  updates.push({
    appendResearchLog: {
      summary: `Projektgedächtnis aus ${site.pages.length} Seiten von ${project.domain} erstellt.`,
    },
  });

  return updates;
}

export const ProjectContextDraftService = {
  draftContextFromWebsite,
} as const;
