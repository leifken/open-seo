import { chromium } from "@playwright/test";
const base = "http://localhost:3005";
const projectId = "48d540b2-acf2-4848-b909-6d0707813152";
const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
await page.route("**/leifken-i18n.js", (r) => r.abort());
await page.goto(base + "/sign-in");
await page.waitForTimeout(2500);
for (const t of ["Sign in with password instead", "Stattdessen mit Passwort anmelden"]) {
  const b = page.locator(`text=${t}`);
  if (await b.count()) { await b.first().click(); break; }
}
await page.waitForSelector('input[type="email"]', { timeout: 15000 });
await page.fill('input[type="email"]', "info@digitalglanz.de");
await page.fill('input[type="password"]', "test-admin-passwort-1");
await page.click('button[type="submit"], form button');
await page.waitForTimeout(4000);

const texts = new Set();
const grab = async () => {
  const found = await page.evaluate(() => {
    const out = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) { const t = n.nodeValue.replace(/\s+/g," ").trim(); if (t) out.push(t); }
    for (const el of document.querySelectorAll("[placeholder],[aria-label],[title],[alt]"))
      for (const a of ["placeholder","aria-label","title","alt"]) {
        const v = el.getAttribute(a); if (v && v.trim()) out.push(v.replace(/\s+/g," ").trim());
      }
    return out;
  });
  found.forEach((t) => texts.add(t));
};

// SAM-Chat + Kontext + weitere Routen
for (const r of [`/p/${projectId}/sam`, `/p/${projectId}/context`, `/p/${projectId}/audit`, `/p/${projectId}/rank-tracking`, `/p/${projectId}/saved`, "/settings", "/ai", "/support"]) {
  try { await page.goto(base + r, { waitUntil: "networkidle", timeout: 30000 }); } catch {}
  await page.waitForTimeout(3000);
  await grab();
}
// Projekt-Anlage-Dialog öffnen
try {
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const sw = page.locator('button:has-text("Standard"), button:has-text("Default")').first();
  if (await sw.count()) { await sw.click(); await page.waitForTimeout(1200); await grab();
    const np = page.locator('text=/New project|Neues Projekt|Create project|Projekt anlegen/i').first();
    if (await np.count()) { await np.click(); await page.waitForTimeout(1500); await grab(); }
  }
} catch {}
await browser.close();
console.log(JSON.stringify([...texts]));
