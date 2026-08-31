import { chromium } from "@playwright/test";
const base = "http://localhost:3005";
const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
// Originaltexte erfassen: den Uebersetzungslayer im Browser blockieren.
await page.route("**/leifken-i18n.js", (r) => r.abort());
await page.goto(base + "/sign-in");
await page.waitForTimeout(2500);
// Fallback-Passwortlogin (Button-Text je nach i18n-Timing DE oder EN)
for (const t of ["Stattdessen mit Passwort anmelden", "Sign in with password instead"]) {
  const btn = page.locator(`text=${t}`);
  if (await btn.count()) { await btn.first().click(); break; }
}
await page.screenshot({ path: "/tmp/extract-debug.png" }).catch(() => {});
console.error("URL nach Klickversuch:", page.url());
await page.waitForSelector('input[type="email"]', { timeout: 15000 });
await page.fill('input[type="email"]', "info@digitalglanz.de");
await page.fill('input[type="password"]', "test-admin-passwort-1");
await page.click('button[type="submit"], form button.btn-primary');
await page.waitForTimeout(4000);

const projectId = "48d540b2-acf2-4848-b909-6d0707813152";
const routes = [
  "/", `/p/${projectId}`, `/p/${projectId}/keywords`, `/p/${projectId}/saved`,
  `/p/${projectId}/rank-tracking`, `/p/${projectId}/domain`, `/p/${projectId}/backlinks`,
  `/p/${projectId}/audit`, `/p/${projectId}/brand-lookup`, `/p/${projectId}/prompt-explorer`,
  `/p/${projectId}/search-performance`, `/p/${projectId}/context`, "/ai", "/settings", "/onboarding",
];
const texts = new Set();
for (const r of routes) {
  try {
    await page.goto(base + r, { waitUntil: "networkidle", timeout: 30000 });
  } catch { /* weiter */ }
  await page.waitForTimeout(2500);
  const found = await page.evaluate(() => {
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const t = n.nodeValue.trim();
      if (t) out.push(t);
    }
    for (const el of document.querySelectorAll("[placeholder],[aria-label],[title],[alt]")) {
      for (const a of ["placeholder", "aria-label", "title", "alt"]) {
        const v = el.getAttribute(a);
        if (v && v.trim()) out.push(v.trim());
      }
    }
    return out;
  });
  found.forEach((t) => texts.add(t));
}
await browser.close();
const all = [...texts].filter((t) =>
  /[A-Za-z]{2}/.test(t) && t.length > 1 && t.length < 400 &&
  !/^[\d\s.,%:+/-]+$/.test(t) && !/^https?:/.test(t) && !/^[a-z0-9._-]+@/.test(t)
);
console.log(JSON.stringify(all, null, 0));
