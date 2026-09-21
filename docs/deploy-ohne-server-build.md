# Deploy ohne Server-Build

Seit dem 21.09.2026 (Zentrale, ENTSCHEIDUNGEN.md, „Speichermangel auf dem Hauptserver“)
baut nicht mehr der Hetzner-Server das Image, sondern GitHub Actions.

## Ablauf

1. Push auf `node-port` startet `.github/workflows/image.yml`: Buildx mit GHA-Cache,
   Push nach `ghcr.io/leifken/open-seo` mit den Tags `sha-<kurz>`, `sha-<voll>` und `latest`.
   Nur `GITHUB_TOKEN` mit `packages: write`, kein persönlicher Token im Repo.
2. `bash scripts/deploy.sh` wartet, bis der Workflow für genau diesen Commit grün ist,
   prüft die Deploy-Ampel und stößt dann Coolify an.
3. Coolify klont den Commit, schreibt `SOURCE_COMMIT=<voller Hash>` in die `.env` und
   startet `den Dienst `open-seo` (Postgres, Redis unverändert)` mit `image: ghcr.io/leifken/open-seo:sha-${SOURCE_COMMIT}`.
   Es wird nur gezogen, nicht gebaut.
4. `bash scripts/deploy-status.sh` belegt wie bisher über den Commit des Coolify-Deploys
   und die Live-Health, zusätzlich den Image-Lauf für HEAD.

## Voraussetzung auf dem Server

`root` auf `hetzner` ist bei `ghcr.io` angemeldet (`/root/.docker/config.json`).
Coolify reicht diese Datei in seinen Helfer-Container durch. Fehlt sie, scheitert der
Pull, die laufenden Container bleiben stehen.

## Rückfall (ein Commit)

In `compose.node.yaml` die Zeile
`image: ghcr.io/leifken/open-seo:sha-${SOURCE_COMMIT}` wieder durch

```yaml
build:
  context: .
  dockerfile: Dockerfile.node
```

ersetzen, committen, pushen, `bash scripts/deploy.sh`. Der Warte-Schritt auf das Image
schadet dabei nicht (der Workflow läuft weiter mit). Alternativ `git revert <Commit der Umstellung>`.

## Besonderheiten OL SEO

- Der Vite-Build lief bisher beim Containerstart auf dem Server (2–3 Min., hoher RAM).
  Das Image enthält ihn jetzt fertig unter `/app/dist-node-image`, samt Fingerprint
  (`scripts/node-build-fingerprint.sh`: Vite-Schalter plus Commit). Der Entrypoint kopiert
  ihn ins Volume, wenn der Fingerprint zur Laufzeit gleich ist, sonst baut er wie früher.
- Die Schalter kommen im Workflow als Build-Argumente (GitHub-Variablen `AUTH_MODE`,
  `BYPASS_EMAIL_VERIFICATION`, `SIGNUP_DISABLED`, `GOOGLE_AUTH_DISABLED`,
  `AUTHENTIK_AUTH_ENABLED`, sonst die Standardwerte im Workflow). Wer einen davon in
  Coolify ändert, ändert ihn auch als GitHub-Variable, sonst baut der Server wieder.
- Es gibt kein `scripts/deploy.sh`. Der Update-Knopf unter `/system` prüft jetzt vor dem
  Coolify-Aufruf, ob der Image-Lauf für den Branch-Kopf grün ist (öffentliche GitHub-API).
  Per Hand: Deploy-Ampel, dann `deploy?uuid=yp79q9een0ycr9vhkfo03zta`.
