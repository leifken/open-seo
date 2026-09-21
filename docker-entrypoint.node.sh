#!/bin/sh
# Container entrypoint for the Node self-host (Dockerfile.node).
# Order: wait for Postgres → apply drizzle-pg migrations → fingerprint-gated
# vite build (client env values are inlined at build time) → serve.
set -e

: "${POSTGRES_DATABASE_URL:?POSTGRES_DATABASE_URL is required}"
: "${REDIS_URL:?REDIS_URL is required}"

echo "[entrypoint] waiting for Postgres..."
node -e '
const url = process.env.POSTGRES_DATABASE_URL;
const postgres = require("postgres");
(async () => {
  for (let i = 0; i < 60; i++) {
    try {
      const sql = postgres(url, { max: 1, connect_timeout: 3 });
      await sql`select 1`;
      await sql.end();
      process.exit(0);
    } catch {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  console.error("Postgres not reachable after 120s");
  process.exit(1);
})();
'

echo "[entrypoint] applying Postgres migrations..."
pnpm run db:migrate:pg

# Everything that changes the client build output (keep in sync with the
# envPrefix list in vite.config.node.ts).
OUT_DIR=dist-node
FP_FILE="$OUT_DIR/.openseo-node-build-env"
# The build output lives in a volume that SURVIVES image updates (unlike the
# upstream selfhost, where a new image starts with no output) — so the
# fingerprint must include the code revision, not just the build env.
# Coolify injects SOURCE_COMMIT on every deploy.
FINGERPRINT="$(sh scripts/node-build-fingerprint.sh)"
test -n "$FINGERPRINT"

# Build baked into the image by GitHub Actions (Dockerfile.node, PREBUILD_COMMIT).
# Used when it was made for exactly this commit and build env; otherwise the
# runtime build below runs as before. Keeps heavy builds off the server.
PREBUILT=/app/dist-node-image
if [ -f "$FP_FILE" ] && [ "$(cat "$FP_FILE")" = "$FINGERPRINT" ]; then
  echo "[entrypoint] reusing existing build (build-relevant env unchanged)."
elif [ -f "$PREBUILT/.openseo-node-build-env" ] && [ "$(cat "$PREBUILT/.openseo-node-build-env")" = "$FINGERPRINT" ]; then
  echo "[entrypoint] using the build baked into the image (no build on this server)."
  mkdir -p "$OUT_DIR"
  find "$OUT_DIR" -mindepth 1 -delete
  cp -a "$PREBUILT"/. "$OUT_DIR"/
else
  echo "[entrypoint] building client + server (first start, changed build env, or new image)..."
  rm -f "$FP_FILE"
  pnpm exec vite build --config vite.config.node.ts
  printf '%s' "$FINGERPRINT" > "$FP_FILE"
fi

exec node scripts/serve-node.mjs
