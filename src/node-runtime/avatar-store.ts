// Profile pictures from Authentik arrive as data: URIs (~26 KB). Storing one
// in `user.image` would blow past better-auth's signed session cookie, so the
// bytes live on disk under DATA_DIR/avatars/ and `user.image` only carries the
// short URL the Node server serves them from (/api/leifken/avatar/<key>).
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { dataDir } from "./r2-fs";

export const AVATAR_ROUTE_PREFIX = "/api/leifken/avatar/";

function avatarDir(): string {
  return path.join(dataDir(), "avatars");
}

function keyFor(identity: string): string {
  return createHash("sha256").update(identity).digest("hex").slice(0, 32);
}

/**
 * Persist a `data:` image and return the URL to serve it from. Returns null
 * for anything that isn't a data URI, so callers can fall through to storing
 * a regular remote URL unchanged.
 */
export function storeDataUriAvatar(
  identity: string,
  dataUri: string,
): string | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(dataUri);
  if (!match) return null;
  const [, mime, base64] = match;
  const key = keyFor(identity);
  fs.mkdirSync(avatarDir(), { recursive: true });
  fs.writeFileSync(path.join(avatarDir(), key), Buffer.from(base64, "base64"));
  fs.writeFileSync(path.join(avatarDir(), `${key}.type`), mime);
  return `${AVATAR_ROUTE_PREFIX}${key}`;
}

/** Read a stored avatar back for the HTTP route. */
export function readAvatar(
  key: string,
): { body: Buffer; contentType: string } | null {
  if (!/^[0-9a-f]{32}$/.test(key)) return null;
  const file = path.join(avatarDir(), key);
  try {
    const body = fs.readFileSync(file);
    let contentType = "image/jpeg";
    try {
      contentType = fs.readFileSync(`${file}.type`, "utf8").trim();
    } catch {
      // default stays
    }
    return { body, contentType };
  } catch {
    return null;
  }
}
