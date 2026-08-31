// R2Bucket shim backed by the local filesystem (the R2 data here is cache and
// audit blobs only — losing it costs cache warmth, nothing else). Implements
// the surface the app uses: get → {text(), customMetadata} | null, put with
// custom/httpMetadata, delete(key | keys[]), list({prefix, cursor, include}).
//
// Layout: each object key maps to `<DATA_DIR>/r2/<encoded key>` with a
// `<file>.meta.json` sidecar carrying the metadata. Key segments are
// URI-encoded so keys with `:` or odd characters stay valid, safe paths.
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export function dataDir(): string {
  return path.resolve(process.env.DATA_DIR ?? "./data");
}

const META_SUFFIX = ".meta.json";
const LIST_PAGE_SIZE = 1000;

type R2PutOptions = {
  httpMetadata?: Record<string, string>;
  customMetadata?: Record<string, string>;
};

type R2ObjectHandle = {
  key: string;
  customMetadata?: Record<string, string>;
  text(): Promise<string>;
  json(): Promise<unknown>;
};

function bucketRoot(): string {
  return path.join(dataDir(), "r2");
}

// Encode each `/`-separated segment so the on-disk layout mirrors the key
// hierarchy (needed for prefix listing) while staying traversal-safe.
function keyToRelPath(key: string): string {
  return key.split("/").map(encodeURIComponent).join(path.sep);
}

function relPathToKey(relPath: string): string {
  return relPath.split(path.sep).map(decodeURIComponent).join("/");
}

async function readMeta(
  filePath: string,
): Promise<{ customMetadata?: Record<string, string> }> {
  try {
    return JSON.parse(await readFile(filePath + META_SUFFIX, "utf8"));
  } catch {
    return {};
  }
}

async function walkKeys(root: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(root, { recursive: true, withFileTypes: true });
  } catch {
    return [];
  }
  const keys: string[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || entry.name.endsWith(META_SUFFIX)) continue;
    const rel = path.relative(root, path.join(entry.parentPath, entry.name));
    keys.push(relPathToKey(rel));
  }
  return keys.toSorted();
}

export class FsBucket {
  async get(key: string): Promise<R2ObjectHandle | null> {
    const filePath = path.join(bucketRoot(), keyToRelPath(key));
    let body: Buffer;
    try {
      body = await readFile(filePath);
    } catch {
      return null;
    }
    const meta = await readMeta(filePath);
    return {
      key,
      customMetadata: meta.customMetadata,
      text: () => Promise.resolve(body.toString("utf8")),
      json: () => Promise.resolve(JSON.parse(body.toString("utf8"))),
    };
  }

  async put(
    key: string,
    body: string | ArrayBuffer | Uint8Array,
    options?: R2PutOptions,
  ): Promise<void> {
    const filePath = path.join(bucketRoot(), keyToRelPath(key));
    await mkdir(path.dirname(filePath), { recursive: true });
    const data =
      typeof body === "string"
        ? body
        : body instanceof Uint8Array
          ? body
          : new Uint8Array(body);
    await writeFile(filePath, data);
    if (options?.customMetadata || options?.httpMetadata) {
      await writeFile(
        filePath + META_SUFFIX,
        JSON.stringify({
          customMetadata: options.customMetadata,
          httpMetadata: options.httpMetadata,
        }),
      );
    }
  }

  async delete(keys: string | string[]): Promise<void> {
    for (const key of Array.isArray(keys) ? keys : [keys]) {
      const filePath = path.join(bucketRoot(), keyToRelPath(key));
      await rm(filePath, { force: true });
      await rm(filePath + META_SUFFIX, { force: true });
    }
  }

  // Cursor is a plain numeric offset into the sorted key list. The walk runs
  // per page, which is O(n) per call but only the GDPR sweep and cache
  // cleanup ever list — both are rare, small-n paths here.
  async list(options?: {
    prefix?: string;
    cursor?: string;
    include?: string[];
  }): Promise<{
    objects: { key: string; customMetadata?: Record<string, string> }[];
    truncated: boolean;
    cursor?: string;
  }> {
    const all = (await walkKeys(bucketRoot())).filter((key) =>
      options?.prefix ? key.startsWith(options.prefix) : true,
    );
    const offset = options?.cursor ? Number(options.cursor) : 0;
    const page = all.slice(offset, offset + LIST_PAGE_SIZE);
    const wantMeta = options?.include?.includes("customMetadata");
    const objects = [];
    for (const key of page) {
      const filePath = path.join(bucketRoot(), keyToRelPath(key));
      objects.push({
        key,
        customMetadata: wantMeta
          ? (await readMeta(filePath)).customMetadata
          : undefined,
      });
    }
    const truncated = offset + LIST_PAGE_SIZE < all.length;
    return {
      objects,
      truncated,
      cursor: truncated ? String(offset + LIST_PAGE_SIZE) : undefined,
    };
  }
}
