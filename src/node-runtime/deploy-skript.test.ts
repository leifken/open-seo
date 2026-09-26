/**
 * LEIFKEN · SEO-7: Tests für scripts/deploy.sh mit nachgebildeten Aufrufen.
 *
 * Das Skript läuft echt (bash), aber git, gh, ssh, curl, sleep und die
 * Deploy-Ampel sind Attrappen in einem eigenen PATH. Jede Attrappe schreibt
 * ihre Aufrufe in ein Protokoll und antwortet nach Drehbuch (je Aufruf die
 * nächste Zeile einer Datei, danach immer die letzte). So lassen sich Ablauf,
 * Reihenfolge der Riegel und die Abbrüche prüfen, ohne Server und ohne GitHub.
 * Vorbild: ol-fundstelle/tests/deploy/deploy-skript.test.ts.
 */
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const SKRIPT = path.resolve(__dirname, "../../scripts/deploy.sh");
// Jeder Fall startet das Skript echt; auf langsamen CI-Rechnern großzügig.
const ZEIT = 30_000;
const SOLL = "a".repeat(40);
const ANDERS = "b".repeat(40);
const UUID = "yp79q9een0ycr9vhkfo03zta";
const TOKEN = "TESTTOKEN-nie-ausgeben-4711";
const HEALTHY = `/open-seo-${UUID}-1|ghcr.io/leifken/open-seo:sha-${SOLL}|${SOLL}|healthy`;
const STARTING = `/open-seo-${UUID}-1|ghcr.io/leifken/open-seo:sha-${SOLL}|${SOLL}|starting`;

// Gemeinsamer Kopf aller Attrappen: Protokoll und Drehbuch.
const KOPF = `#!/usr/bin/env bash
S="$STUB_DIR"
printf '%s\\t%s\\n' "$(basename "$0")" "$*" >> "$S/aufrufe.log"
naechste() {
  local f="$S/$1" n
  [ -f "$f" ] || return 0
  n=$(( $(cat "$f.n" 2>/dev/null || echo 0) + 1 ))
  echo "$n" > "$f.n"
  if [ "$n" -le "$(grep -c '' "$f")" ]; then sed -n "\${n}p" "$f"; else tail -n 1 "$f"; fi
}
`;

const ATTRAPPEN: Record<string, string> = {
  git: `case "$*" in
  "rev-parse HEAD") naechste git-head ;;
  "rev-parse origin/node-port") naechste git-origin ;;
  *) exit 0 ;;
esac`,
  gh: `naechste image`,
  sleep: `exit 0`,
  ampel: `exit "$(naechste ampel)"`,
  ssh: `CMD="\${*: -1}"
case "$CMD" in
  *"mkdir '/run/rankmeister-deploy.lock'"*)
    [ -f "$S/ssh-weg" ] && exit 255
    mkdir "$S/sperre" 2>/dev/null ;;
  *"> '/run/rankmeister-deploy.lock/info'"*) exit 0 ;;
  *"cat '/run/rankmeister-deploy.lock/info'"*) echo "anderer Deploy" ;;
  *pg_dump*) [ -f "$S/sicherung-rot" ] && exit 1; echo "/var/backups/postgres/x_vor-deploy.dump" ;;
  *"stat -c"*) echo 3 ;;
  *"rm -rf '/run/rankmeister-deploy.lock'"*) rm -rf "$S/sperre" ;;
  *"docker ps --filter name=open-seo-"*) naechste container ;;
  *) echo "unerwarteter ssh-Befehl: $CMD" >&2; exit 99 ;;
esac`,
  curl: `URL="\${*: -1}"
case " $* " in *" -K - "*) cat > "$S/curl-stdin.$$" ;; esac
case "$URL" in
  */envs) cat "$S/envs.json" ;;
  */applications/${UUID}) echo '{"name":"ol-seo"}' ;;
  *"/deploy?uuid=${UUID}&force=false") echo '{"deployments":[{"deployment_uuid":"dep42"}]}' ;;
  */deployments/dep42) echo "{\\"status\\":\\"$(naechste coolify)\\"}" ;;
  https://seo.example/api/health) naechste health ;;
  *) echo "unerwartete URL: $URL" >&2; exit 22 ;;
esac`,
};

let dir: string;

function drehbuch(datei: string, zeilen: string[]) {
  writeFileSync(path.join(dir, datei), `${zeilen.join("\n")}\n`);
}

function aufrufe(): string[] {
  const f = path.join(dir, "aufrufe.log");
  return existsSync(f) ? readFileSync(f, "utf8").trim().split("\n") : [];
}

function stelle(muster: string): number {
  return aufrufe().findIndex((z) => z.includes(muster));
}

function deploy(...args: string[]) {
  const bin = path.join(dir, "bin");
  const r = spawnSync("bash", [SKRIPT, ...args], {
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH ?? ""}`,
      STUB_DIR: dir,
      DEPLOY_TOKEN_DATEI: path.join(dir, "token"),
      DEPLOY_AMPEL: path.join(bin, "ampel"),
      DEPLOY_COOLIFY_URL: "https://coolify.example",
      DEPLOY_HEALTH_URL: "https://seo.example/api/health",
      DEPLOY_SERVER: "root@server.example",
      DEPLOY_SSH_KEY: "/schluessel",
    },
  });
  return { code: r.status, ausgabe: `${r.stdout}${r.stderr}` };
}

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), "seo7-deploy-"));
  mkdirSync(path.join(dir, "bin"));
  for (const [name, rumpf] of Object.entries(ATTRAPPEN)) {
    const f = path.join(dir, "bin", name);
    writeFileSync(f, `${KOPF}${rumpf}\n`);
    chmodSync(f, 0o755);
  }
  writeFileSync(path.join(dir, "token"), `${TOKEN}\n`);
  writeFileSync(
    path.join(dir, "envs.json"),
    JSON.stringify([
      { key: "AUTH_MODE", value: "hosted", is_preview: false },
      { key: "PORT", value: "3001", is_preview: true },
    ]),
  );
  drehbuch("git-head", [SOLL]);
  drehbuch("git-origin", [SOLL]);
  drehbuch("image", [
    "in_progress - https://lauf/1",
    "completed success https://lauf/1",
  ]);
  drehbuch("ampel", ["0"]);
  drehbuch("coolify", ["in_progress", "finished"]);
  drehbuch("container", [STARTING, HEALTHY]);
  drehbuch("health", ['{"status":"ok"}']);
});

afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe("scripts/deploy.sh · Gutlauf", { timeout: ZEIT }, () => {
  it("wartet auf das Image, nimmt Sperre und Ampel, sichert, deployt und prüft nach", () => {
    const r = deploy();
    expect(r.ausgabe).toContain("Deploy live");
    expect(r.code).toBe(0);

    const reihe = [
      "gh\t",
      "mkdir '/run/rankmeister-deploy.lock'",
      "ampel\t--warten 900 hetzner",
      "pg_dump",
      `deploy?uuid=${UUID}&force=false`,
      "deployments/dep42",
      "docker ps --filter name=open-seo-",
      "https://seo.example/api/health",
      "rm -rf '/run/rankmeister-deploy.lock'",
    ].map(stelle);
    reihe.forEach((i) => expect(i).toBeGreaterThan(-1));
    expect(reihe.toSorted((a, b) => a - b)).toEqual(reihe);
    expect(existsSync(path.join(dir, "sperre"))).toBe(false);
  });

  it("fragt nur Image-Läufe auf node-port ab (Arbeitszweige legen kein Image ab)", () => {
    deploy();
    const gh = aufrufe().find((z) => z.startsWith("gh\t")) ?? "";
    expect(gh).toContain(`head_sha=${SOLL}`);
    expect(gh).toContain("branch=node-port");
    expect(gh).toContain("event=push");
  });

  it("gibt den Token nie aus und reicht ihn curl nur über stdin", () => {
    const r = deploy();
    expect(r.code).toBe(0);
    expect(r.ausgabe).not.toContain(TOKEN);
    expect(readFileSync(path.join(dir, "aufrufe.log"), "utf8")).not.toContain(
      TOKEN,
    );
    const stdin = spawnSync("sh", ["-c", `cat "${dir}"/curl-stdin.*`], {
      encoding: "utf8",
    }).stdout;
    expect(stdin).toContain(`Authorization: Bearer ${TOKEN}`);
  });

  it("hat bis zu 5 Minuten Geduld, bis der Container healthy ist", () => {
    drehbuch("container", [...Array<string>(29).fill(STARTING), HEALTHY]);
    const r = deploy();
    expect(r.code).toBe(0);
    expect(
      aufrufe().filter((z) => z.includes("docker ps --filter")).length,
    ).toBe(30);
  });
});

describe("scripts/deploy.sh · Abbrüche", { timeout: ZEIT }, () => {
  const nichtAngestossen = () => expect(stelle("deploy?uuid=")).toBe(-1);

  it("lokaler Stand ungleich origin/node-port", () => {
    drehbuch("git-head", [ANDERS]);
    const r = deploy();
    expect(r.code).toBe(1);
    expect(r.ausgabe).toContain("≠ origin/node-port");
    nichtAngestossen();
  });

  it("eigene Coolify-Variable SOURCE_COMMIT", () => {
    writeFileSync(
      path.join(dir, "envs.json"),
      JSON.stringify([{ key: "SOURCE_COMMIT", value: "", is_preview: true }]),
    );
    const r = deploy();
    expect(r.code).toBe(1);
    expect(r.ausgabe).toContain("SOURCE_COMMIT (Preview)");
    expect(stelle("gh\t")).toBe(-1);
    nichtAngestossen();
  });

  it("rote Prüfung: kein Image, keine Sperre, kein Deploy", () => {
    drehbuch("image", ["completed failure https://lauf/rot"]);
    const r = deploy();
    expect(r.code).toBe(1);
    expect(r.ausgabe).toContain("https://lauf/rot");
    expect(stelle("mkdir '/run/rankmeister-deploy.lock'")).toBe(-1);
    nichtAngestossen();
  });

  it("Sperre schon belegt: klare Meldung, fremde Sperre bleibt stehen", () => {
    mkdirSync(path.join(dir, "sperre"));
    const r = deploy();
    expect(r.code).toBe(1);
    expect(r.ausgabe).toContain("Es läuft schon ein Deploy: anderer Deploy");
    expect(existsSync(path.join(dir, "sperre"))).toBe(true);
    nichtAngestossen();
  });

  it("Server nicht erreichbar: sagt das, behauptet keinen laufenden Deploy", () => {
    writeFileSync(path.join(dir, "ssh-weg"), "");
    const r = deploy();
    expect(r.code).toBe(1);
    expect(r.ausgabe).toContain("nicht erreichbar");
    expect(r.ausgabe).not.toContain("Es läuft schon ein Deploy");
  });

  it("Ampel nicht grün: kein Deploy, Sperre wieder frei", () => {
    drehbuch("ampel", ["1"]);
    const r = deploy();
    expect(r.code).toBe(1);
    expect(r.ausgabe).toContain("Deploy-Ampel nicht grün");
    expect(existsSync(path.join(dir, "sperre"))).toBe(false);
    nichtAngestossen();
  });

  it("Sicherung gescheitert: kein Deploy, Sperre wieder frei", () => {
    writeFileSync(path.join(dir, "sicherung-rot"), "");
    const r = deploy();
    expect(r.code).toBe(1);
    expect(r.ausgabe).toContain("Sicherung vor dem Deploy gescheitert");
    expect(existsSync(path.join(dir, "sperre"))).toBe(false);
    nichtAngestossen();
  });

  it("node-port hat sich während des Wartens bewegt: nichts wird angestoßen", () => {
    drehbuch("git-origin", [SOLL, ANDERS]);
    const r = deploy();
    expect(r.code).toBe(1);
    expect(r.ausgabe).toContain("hat sich seit dem Start bewegt");
    nichtAngestossen();
  });

  it("Coolify meldet failed", () => {
    drehbuch("coolify", ["in_progress", "failed"]);
    const r = deploy();
    expect(r.code).toBe(1);
    expect(r.ausgabe).toContain("Coolify-Deploy: failed");
    expect(stelle("docker ps --filter")).toBe(-1);
  });

  it("falsches Image im Container: nach 30 Versuchen rot, mit Soll und Ist", () => {
    drehbuch("container", [
      `/open-seo-${UUID}-1|ghcr.io/leifken/open-seo:sha-${ANDERS}|${ANDERS}|healthy`,
    ]);
    const r = deploy();
    expect(r.code).toBe(1);
    expect(r.ausgabe).toContain(
      `erwartet ghcr.io/leifken/open-seo:sha-${SOLL}`,
    );
    expect(
      aufrufe().filter((z) => z.includes("docker ps --filter")).length,
    ).toBe(30);
    expect(stelle("https://seo.example/api/health")).toBe(-1);
    expect(existsSync(path.join(dir, "sperre"))).toBe(false);
  });

  it("Container bleibt unhealthy", () => {
    drehbuch("container", [
      STARTING,
      STARTING.replace("starting", "unhealthy"),
    ]);
    const r = deploy();
    expect(r.code).toBe(1);
    expect(r.ausgabe).toContain("Healthcheck „unhealthy“");
  });

  it("Health von außen nicht ok", () => {
    drehbuch("health", ['{"status":"issues"}']);
    const r = deploy();
    expect(r.code).toBe(1);
    expect(r.ausgabe).toContain("antwortet nicht mit status ok");
  });
});

describe("scripts/deploy.sh · Sperre lösen", { timeout: ZEIT }, () => {
  it("entfernt nur Pfade unter /run/", () => {
    const r = spawnSync("bash", [SKRIPT, "--sperre-loesen"], {
      encoding: "utf8",
      env: { ...process.env, DEPLOY_SPERRE: "/tmp/kein-run-pfad" },
    });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("liegt nicht unter /run/");
  });

  it("löst die Sperre nach Rücksprache", () => {
    mkdirSync(path.join(dir, "sperre"));
    const r = deploy("--sperre-loesen");
    expect(r.code).toBe(0);
    expect(existsSync(path.join(dir, "sperre"))).toBe(false);
  });
});
