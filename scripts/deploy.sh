#!/usr/bin/env bash
# LEIFKEN · Rollt OL SEO (seo.leifken.ai) aus. Einziger Weg für ein Update
# (Auftrag SEO-7, 26.09.2026; Betriebsdoku ol-seo/BETRIEB.md, Zeile „Update“).
# Vorbild: ol-fundstelle/scripts/deploy.sh, bewusst schlanker.
#
# Ablauf:
#   1. Lokaler HEAD = Kopf von node-port auf GitHub (gh api; Coolify zieht genau den).
#   2. Coolify-App lesend prüfen: keine eigene Variable SOURCE_COMMIT, Quelle ist
#      Zweig node-port bei Commit HEAD. Jeder API-Fehler bricht ab.
#   3. Warten, bis „Image bauen“ für genau diesen Commit auf node-port grün ist
#      (image.yml baut erst nach grüner Prüfstrecke, pruefen.yml).
#   4. Deploy-Sperre /run/rankmeister-deploy.lock auf dem Server (wie Motor und Kontor).
#   5. Deploy-Ampel: kein anderer Build auf der Coolify-Instanz.
#   6. Sicherung der Datenbank openseo direkt vor dem Deploy.
#   7. Letzte Prüfung: Kopf von node-port unverändert, Image weiterhin grün.
#   8. Coolify-Deploy anstoßen und auf „finished“ warten.
#   9. Laufender Container trägt ghcr.io/leifken/open-seo:sha-<commit> und ist
#      „healthy“ (bis 5 Minuten, der Container startet mit Migrationen und Vite).
#  10. /api/health von außen.
#
# Aufruf:  bash scripts/deploy.sh
#          bash scripts/deploy.sh --sperre-loesen   (nur nach Rücksprache)
#
# Der Coolify-Token liegt in olcrm/.secrets/coolify-api-token (wie beim Motor).
# Er wird nie ausgegeben und steht auch nicht in der Prozessliste: curl bekommt
# ihn über stdin (-K -).
#
# Schreibweise: vor einem Nicht-ASCII-Zeichen immer ${VAR}, nie $VAR. Die Bash 3.2
# von macOS liest unter UTF-8 sonst die Bytes von „ oder “ als Teil des Namens und
# bricht mit set -u ab (Prüfung 26.09.2026). pruefen.yml und die Tests wachen darüber.
set -euo pipefail
cd "$(dirname "$0")/.."

SERVER="${DEPLOY_SERVER:-root@178.104.233.171}"
SSH_KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/hetzner}"
SPERRE="${DEPLOY_SPERRE:-/run/rankmeister-deploy.lock}"
SPERRE_MAX_MIN="${DEPLOY_SPERRE_MAX_MIN:-120}"
TOKEN_DATEI="${DEPLOY_TOKEN_DATEI:-/Users/olli/Development/olcrm/.secrets/coolify-api-token}"
AMPEL="${DEPLOY_AMPEL:-/Users/olli/Development/_standards/server/deploy-ampel.sh}"
COOLIFY="${DEPLOY_COOLIFY_URL:-https://coolify.leifken.ai}"
HEALTH_URL="${DEPLOY_HEALTH_URL:-https://seo.leifken.ai/api/health}"
APP_UUID="yp79q9een0ycr9vhkfo03zta"
ZWEIG="node-port"
GH_REPO="leifken/open-seo"
IMAGE_REPO="ghcr.io/leifken/open-seo"
# Takt der Wartestrecken in Sekunden. Image: 90 × 20 s = 30 Min., Coolify:
# 90 × 10 s = 15 Min., Container: 30 × 10 s = 5 Min., Health: 12 × 5 s = 1 Min.
IMAGE_VERSUCHE=90
COOLIFY_VERSUCHE=90
CONTAINER_VERSUCHE=30
HEALTH_VERSUCHE=12

fern() { ssh -i "$SSH_KEY" -o BatchMode=yes -o ConnectTimeout=10 "$SERVER" "$@"; }
kurz() { printf '%s' "${1:0:12}"; }

# ── Deploy-Sperre (gleiche Logik wie ol-fundstelle/scripts/deploy.sh) ─────────
sperrePfadPruefen() {
  case "$SPERRE" in
    /run/?*) [[ "$SPERRE" != *".."* ]] && return 0 ;;
  esac
  echo "✗ Sperrpfad „${SPERRE}“ liegt nicht unter /run/. Aus Sicherheit wird nichts entfernt." >&2
  exit 1
}

sperreNehmen() {
  local info rc=0
  info="OL SEO, von $(whoami)@$(hostname -s), Stand $(kurz "$SOLL"), seit $(date -u +%FT%TZ)"
  fern "mkdir '$SPERRE' 2>/dev/null" || rc=$?
  if (( rc == 0 )); then
    SPERRE_GEHALTEN=1
    fern "printf '%s\n' '$info' > '$SPERRE/info'" >/dev/null 2>&1 || echo "! Info-Datei der Sperre nicht geschrieben (die Sperre gilt trotzdem)." >&2
    echo "✓ Deploy-Sperre genommen ($SPERRE)."
    return 0
  fi
  if (( rc == 255 )); then
    echo "✗ Server $SERVER nicht erreichbar (ssh). Es wurde keine Sperre geprüft oder genommen." >&2
    echo "  Netz und Schlüssel prüfen:  ssh -i $SSH_KEY $SERVER true" >&2
    exit 1
  fi
  local alt alter
  alt="$(fern "cat '$SPERRE/info' 2>/dev/null" || echo "ohne Angabe")"
  alter="$(fern "echo \$(( ( \$(date +%s) - \$(stat -c %Y '$SPERRE' 2>/dev/null || date +%s) ) / 60 ))" || echo "?")"
  echo "✗ Es läuft schon ein Deploy: $alt (seit ${alter} Min.)." >&2
  if [[ "$alter" =~ ^[0-9]+$ ]] && (( alter > SPERRE_MAX_MIN )); then
    echo "  Die Sperre ist älter als ${SPERRE_MAX_MIN} Minuten. Wenn sicher niemand deployt:  bash scripts/deploy.sh --sperre-loesen" >&2
  else
    echo "  Warten, bis der andere Deploy fertig ist. Niemals gleichzeitig deployen." >&2
  fi
  exit 1
}

sperreFreigeben() {
  [[ "${SPERRE_GEHALTEN:-}" == "1" ]] || return 0
  sperrePfadPruefen
  fern "rm -rf '$SPERRE'" >/dev/null 2>&1 || echo "! Sperre $SPERRE konnte nicht entfernt werden, bitte von Hand prüfen." >&2
  SPERRE_GEHALTEN=0
}

if [[ "${1:-}" == "--sperre-loesen" ]]; then
  sperrePfadPruefen
  fern "rm -rf '$SPERRE'" && echo "✓ Deploy-Sperre entfernt ($SPERRE)."
  exit 0
fi

# ── Coolify-API: Token über stdin, nie als Argument ──────────────────────────
coolify() {
  printf 'header = "Authorization: Bearer %s"\n' "$TOKEN" \
    | curl -s -f --max-time 20 -K - -H "Accept: application/json" "${COOLIFY}/api/v1/$1"
}

# Kopf von node-port auf GitHub, genau das zieht Coolify. Über die API statt
# git fetch: ein gescheiterter fetch ließe sonst still einen alten Stand gelten.
kopfLesen() {
  gh api "repos/${GH_REPO}/branches/${ZWEIG}" --jq '.commit.sha' 2>/dev/null || true
}

# Ist „Image bauen“ für genau diesen Commit auf node-port grün? 0 = ja, 1 = läuft/fehlt, 2 = rot.
# Nur Läufe auf node-port zählen: Arbeitszweige bauen zur Probe, legen aber kein Image ab.
imageFertig() {
  local sha="$1" lauf
  lauf="$(gh api "repos/${GH_REPO}/actions/workflows/image.yml/runs?head_sha=${sha}&branch=${ZWEIG}&event=push&per_page=1" \
    --jq '.workflow_runs[0] | (.status // "fehlt") + " " + (.conclusion // "-") + " " + (.html_url // "-")' 2>/dev/null || echo "fehlt - -")"
  IMAGE_LAUF="$lauf"
  case "$lauf" in
    "completed success"*) return 0 ;;
    completed*) return 2 ;;
    *) return 1 ;;
  esac
}

# ── 1 · Stand: Coolify zieht den Kopf von node-port auf GitHub ───────────────
command -v gh >/dev/null || { echo "✗ gh (GitHub CLI) fehlt. Ohne sie ist nicht prüfbar, ob das Image fertig ist." >&2; exit 1; }
[[ -r "$TOKEN_DATEI" ]] || { echo "✗ Coolify-Token fehlt ($TOKEN_DATEI). Deploy abgebrochen." >&2; exit 1; }
TOKEN="$(cat "$TOKEN_DATEI")"

SOLL="$(kopfLesen)"
LOKAL="$(git rev-parse HEAD)"
[[ "$SOLL" =~ ^[0-9a-f]{40}$ ]] || { echo "✗ Kopf von ${ZWEIG} auf GitHub nicht lesbar (gh api). Deploy abgebrochen." >&2; exit 1; }
if [[ "$LOKAL" != "$SOLL" ]]; then
  echo "✗ Lokaler HEAD ($(kurz "$LOKAL")) ≠ ${ZWEIG} auf GitHub ($(kurz "$SOLL"))." >&2
  echo "  Coolify deployt den Stand von GitHub. Erst node-port auschecken und angleichen (pushen oder pullen), dann deployen." >&2
  exit 1
fi
echo "→ Deploy von OL SEO, Stand $(kurz "$SOLL") (= origin/$ZWEIG)."

# ── 2 · Coolify-App lesend prüfen ─────────────────────────────────────────────
# compose.node.yaml zieht image: …:sha-${SOURCE_COMMIT}. Eine eigene App-Variable
# SOURCE_COMMIT überschreibt die magische und zieht `sha-` oder still ein altes
# Image (Vorfall Motor 22.09.2026). Werte werden nie ausgegeben, nur Schlüssel.
ENVS="$(coolify "applications/${APP_UUID}/envs")" \
  || { echo "✗ Umgebungsvariablen der Coolify-App nicht lesbar. Ohne diese Prüfung kein Deploy." >&2; exit 1; }
STOPP="$(printf '%s' "$ENVS" | python3 -c '
import sys, json
d = json.load(sys.stdin)
d = d.get("data", d) if isinstance(d, dict) else d
for e in d:
    if str(e.get("key", "")) == "SOURCE_COMMIT":
        print("SOURCE_COMMIT (" + ("Preview" if e.get("is_preview") else "normal") + ")")
')" || { echo "✗ Antwort der Coolify-API nicht auswertbar. Kein Deploy." >&2; exit 1; }
if [[ -n "$STOPP" ]]; then
  echo "✗ Die Coolify-App hat eine eigene Variable $STOPP. Sie überschreibt die magische Variable," >&2
  echo "  das Image würde falsch oder veraltet gezogen. Erst in Coolify löschen, dann erneut deployen." >&2
  exit 1
fi
echo "✓ Keine App-Variable SOURCE_COMMIT in Coolify."

# Coolify muss den Kopf von node-port ziehen: Zweig node-port, Commit HEAD. Ein
# fest eingetragener Commit oder ein anderer Zweig deployt still etwas anderes.
APP="$(coolify "applications/${APP_UUID}")" \
  || { echo "✗ Einstellungen der Coolify-App nicht lesbar. Ohne diese Prüfung kein Deploy." >&2; exit 1; }
QUELLE="$(printf '%s' "$APP" | python3 -c '
import sys, json
d = json.load(sys.stdin)
d = d.get("data", d) if isinstance(d, dict) else {}
print(str(d.get("git_branch")) + " " + str(d.get("git_commit_sha")))
')" || { echo "✗ Antwort der Coolify-API nicht auswertbar. Kein Deploy." >&2; exit 1; }
if [[ "$QUELLE" != "${ZWEIG} HEAD" ]]; then
  echo "✗ Coolify-App zieht „${QUELLE}“ (Zweig, Commit), erwartet „${ZWEIG} HEAD“. Erst in Coolify richten." >&2
  exit 1
fi
echo "✓ Coolify zieht ${ZWEIG} bei HEAD."

# ── 3 · Warten auf das grüne Image ────────────────────────────────────────────
echo "→ Warte auf das Image für $(kurz "$SOLL") (GitHub Actions, bis 30 Min.) …"
IMG_OK=""
for _ in $(seq 1 "$IMAGE_VERSUCHE"); do
  ZUSTAND=0
  imageFertig "$SOLL" || ZUSTAND=$?
  if (( ZUSTAND == 0 )); then IMG_OK=1; echo "  ✓ Image fertig: ${IMAGE_LAUF##* }"; break; fi
  if (( ZUSTAND == 2 )); then echo "✗ Prüfung oder Image-Build rot: ${IMAGE_LAUF##* }. Nicht deployt." >&2; exit 1; fi
  sleep 20
done
[[ -n "$IMG_OK" ]] || { echo "✗ Kein fertiges Image nach 30 Min. (Stand: ${IMAGE_LAUF:-unbekannt}). Nicht deployt." >&2; exit 1; }

# ── 4 · Sperre, auch bei Strg-C in einer Wartestrecke wieder freigeben ───────
# INT und TERM geben die Sperre frei UND beenden das Skript. Ein Trap ohne exit
# ließe es nach dem Signal weiterlaufen und ohne Sperre deployen (Prüfung 26.09.).
trap 'sperreFreigeben; exit 130' INT
trap 'sperreFreigeben; exit 143' TERM
trap sperreFreigeben EXIT
sperreNehmen

# ── 5 · Deploy-Ampel ──────────────────────────────────────────────────────────
if [[ -x "$AMPEL" ]]; then
  "$AMPEL" --warten 900 hetzner || { echo "✗ Deploy-Ampel nicht grün. Später erneut:  bash scripts/deploy.sh" >&2; exit 1; }
else
  echo "✗ Deploy-Ampel nicht gefunden ($AMPEL). Ohne sie kein Deploy (Kollisionsgefahr)." >&2
  exit 1
fi

# ── 6 · Sicherung direkt vor dem Deploy ───────────────────────────────────────
# Der Container spielt beim Start Migrationen ein. Der Dump liegt neben den
# nächtlichen Sicherungen und wird mit ihnen nach 14 Tagen aufgeräumt.
echo "→ Sicherung der Datenbank openseo vor dem Deploy …"
# Wie backup-olseo.sh: pg_dump schreibt im Container (-f), docker cp holt die
# Datei. Bei jedem Fehler werden Teilstücke im Container und auf dem Host entfernt.
if fern "APP_UUID=${APP_UUID} bash -s" <<'SICHERUNG'
set -euo pipefail
C=$(docker ps --format '{{.Names}}' | grep "^postgres-${APP_UUID}-" | head -1)
test -n "$C"
O=/var/backups/postgres/postgres-${APP_UUID}
D=$O/openseo_$(date +%Y%m%d_%H%M%S)_vor-deploy.dump
FERTIG=""
aufraeumen() {
  docker exec "$C" rm -f /tmp/vor-deploy.dump >/dev/null 2>&1 || true
  [ -n "$FERTIG" ] || rm -f "$D"
}
trap aufraeumen EXIT
mkdir -p "$O"
docker exec "$C" pg_dump -U openseo -d openseo -Fc -f /tmp/vor-deploy.dump
docker cp "$C:/tmp/vor-deploy.dump" "$D" >/dev/null
[ "$(stat -c %s "$D")" -ge 1000 ]
FERTIG=1
echo "$D"
SICHERUNG
then
  echo "  ✓ gesichert"
else
  echo "✗ Sicherung vor dem Deploy gescheitert. Kein Deploy." >&2
  exit 1
fi

# ── 7 · Letzte Prüfung direkt vor dem Anstoßen ────────────────────────────────
# Coolify nimmt den neuesten Stand von node-port. Hat er sich seit dem Start
# bewegt, fehlt vielleicht das Image; dann wird nichts angefasst.
anstossenPruefen() {
  local sha="$1" jetzt
  jetzt="$(kopfLesen)"
  if [[ ! "$jetzt" =~ ^[0-9a-f]{40}$ ]]; then
    echo "✗ Kopf von ${ZWEIG} auf GitHub nicht lesbar (gh api). Ohne diese Prüfung kein Deploy." >&2
    return 1
  fi
  if [[ "$jetzt" != "$sha" ]]; then
    echo "✗ origin/$ZWEIG hat sich seit dem Start bewegt: $(kurz "$sha") → $(kurz "${jetzt:-?}"). Kein Deploy." >&2
    echo "  Neu starten, dann deployt es den jetzigen Stand:  bash scripts/deploy.sh" >&2
    return 1
  fi
  if ! imageFertig "$sha"; then
    echo "✗ Für $(kurz "$sha") gibt es kein grünes Image (${IMAGE_LAUF}). Kein Deploy." >&2
    return 1
  fi
}
anstossenPruefen "$SOLL" || exit 1

# ── 8 · Coolify-Deploy anstoßen und auf „finished“ warten ────────────────────
echo "→ Coolify-Deploy wird angestoßen (OL SEO, $(kurz "$SOLL")) …"
ANTWORT="$(coolify "deploy?uuid=${APP_UUID}&force=false" || true)"
DEPLOY_ID="$(printf '%s' "$ANTWORT" | python3 -c "import sys,json;print(json.load(sys.stdin).get('deployments',[{}])[0].get('deployment_uuid',''))" 2>/dev/null || true)"
[[ -n "$DEPLOY_ID" ]] || { echo "✗ Keine deployment_uuid erhalten. Stand in Coolify prüfen." >&2; exit 1; }
echo "  deployment_uuid: $DEPLOY_ID"
echo "→ Warte auf Coolify (bis 15 Min.) …"
STATUS=""
FERTIG=""
for _ in $(seq 1 "$COOLIFY_VERSUCHE"); do
  STATUS="$(coolify "deployments/${DEPLOY_ID}" | python3 -c "import sys,json
d=json.load(sys.stdin); d=d[0] if isinstance(d,list) else d
print(d.get('status') or '')" 2>/dev/null || true)"
  case "$STATUS" in
    finished) FERTIG=1; echo "  ✓ Coolify: finished"; break ;;
    failed|cancelled*|error) echo "✗ Coolify-Deploy: $STATUS. Rückweg: ol-seo/BETRIEB.md, Abschnitt 1a." >&2; exit 1 ;;
    *) sleep 10 ;;
  esac
done
[[ -n "$FERTIG" ]] || { echo "✗ Coolify nach 15 Min. nicht fertig (Stand: ${STATUS:-unbekannt})." >&2; exit 1; }

# ── 9 · Läuft wirklich sha-<commit>, und ist der Container gesund? ───────────
IMAGE_SOLL="${IMAGE_REPO}:sha-${SOLL}"
containerLesen() {
  # Eine Zeile je laufendem App-Container: Name|Image|Revision|Health
  fern "docker ps --filter name=open-seo-${APP_UUID}- --format '{{.Names}}' | while read -r n; do docker inspect --format '{{.Name}}|{{.Config.Image}}|{{index .Config.Labels \"org.opencontainers.image.revision\"}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}ohne{{end}}' \"\$n\"; done"
}
echo "→ Prüfe den laufenden Container gegen $(kurz "$SOLL") (bis 5 Min. auf „healthy“) …"
BEFUND=""
GESUND=""
for _ in $(seq 1 "$CONTAINER_VERSUCHE"); do
  ZEILEN="$(containerLesen || true)"
  ANZAHL="$(printf '%s\n' "$ZEILEN" | grep -c . || true)"
  if [[ "$ANZAHL" != "1" ]]; then
    BEFUND="$ANZAHL laufende App-Container (erwartet 1)"
  else
    IFS='|' read -r NAME IMAGE REV HEALTH <<<"$ZEILEN"
    if [[ "$IMAGE" != "$IMAGE_SOLL" ]]; then
      BEFUND="Image $IMAGE, erwartet $IMAGE_SOLL"
    elif [[ -n "$REV" && "$REV" != "<no value>" && "$REV" != "$SOLL" ]]; then
      BEFUND="Label revision $REV ≠ $SOLL"
    elif [[ "$HEALTH" == "healthy" ]]; then
      GESUND=1; echo "  ✓ ${NAME#/} · sha-$(kurz "$SOLL") · healthy"; break
    else
      BEFUND="Healthcheck „${HEALTH}“"
    fi
  fi
  sleep 10
done
if [[ -z "$GESUND" ]]; then
  echo "✗ Nach 5 Min.: $BEFUND." >&2
  echo "  Der Container entspricht NICHT dem Stand $(kurz "$SOLL") oder ist nicht gesund. Rückweg: ol-seo/BETRIEB.md, Abschnitt 1a." >&2
  exit 1
fi

# ── 10 · /api/health von außen ────────────────────────────────────────────────
HEALTH_OK=""
for _ in $(seq 1 "$HEALTH_VERSUCHE"); do
  ANTWORT="$(curl -s -f --max-time 10 "$HEALTH_URL" || true)"
  if [[ "$ANTWORT" == *'"status":"ok"'* ]]; then HEALTH_OK=1; break; fi
  sleep 5
done
[[ -n "$HEALTH_OK" ]] || { echo "✗ $HEALTH_URL antwortet nicht mit status ok. Container läuft, aber der Weg von außen nicht (Proxy, DNS)." >&2; exit 1; }
echo "  ✓ $HEALTH_URL: ok"
echo "✓ Deploy live: OL SEO läuft mit $(kurz "$SOLL")."
