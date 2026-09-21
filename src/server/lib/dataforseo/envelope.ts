import { z } from "zod";
import { AppError } from "@/server/lib/errors";
import type { DataforseoErrorClassifier } from "@/server/lib/dataforseo/core";

// ---------------------------------------------------------------------------
// Billing envelope — the load-bearing seam that carries each call's USD cost
// out to the single metering point in client.ts. Every section fetcher returns
// DataforseoApiResponse<T>; nothing else constructs a billing object.
// ---------------------------------------------------------------------------

export type DataforseoApiCallCost = {
  path: string[];
  costUsd: number;
};

export type DataforseoApiResponse<T> = {
  data: T;
  billing: DataforseoApiCallCost;
};

/**
 * Thrown when a DataForSEO task fails *after* it was billed (cost + path are
 * present). meterDataforseoCall catches this to charge the customer for the
 * failed-but-charged call before rethrowing. Do not throw this for access /
 * balance failures; classify those first even when DataForSEO includes billing
 * metadata on the failed task.
 */
export class DataforseoChargedTaskError extends AppError {
  constructor(
    message: string,
    public readonly billing: DataforseoApiCallCost,
    /**
     * True when the task failed because OUR request was malformed (DataForSEO
     * "Invalid Field: ..."). The customer got no value, so — when the task
     * wasn't billed — meterDataforseoCall skips the charge and rethrows this as
     * a non-reportable VALIDATION_ERROR.
     */
    public readonly isInvalidField = false,
  ) {
    super("INTERNAL_ERROR", message);
    this.name = "DataforseoChargedTaskError";
  }
}

// The SDK types cost / path / result_count as optional with no runtime
// validation, so this is the one guard that guarantees we can bill a call.
const billingMetadataSchema = z.object({
  path: z.array(z.string()),
  cost: z.number(),
  result_count: z.number().nullable().optional(),
});

export interface DataforseoTaskLike {
  status_code?: number;
  status_message?: string;
  path?: string[];
  cost?: number;
  result_count?: number;
  result?: unknown[];
  [key: string]: unknown;
}

export interface DataforseoResponseLike<T extends DataforseoTaskLike> {
  status_code?: number;
  status_message?: string;
  tasks?: T[];
  [key: string]: unknown;
}

function tryBuildTaskBilling(task: unknown): DataforseoApiCallCost | null {
  const parsed = billingMetadataSchema.safeParse(task);
  if (!parsed.success) return null;
  return {
    path: parsed.data.path,
    costUsd: parsed.data.cost,
  };
}

export function buildTaskBilling(
  task: DataforseoTaskLike,
): DataforseoApiCallCost {
  const billing = tryBuildTaskBilling(task);
  if (!billing) {
    throw new AppError(
      "INTERNAL_ERROR",
      "DataForSEO task is missing billing metadata (path/cost)",
    );
  }
  return billing;
}

const INVALID_FIELD_MESSAGE_RE = /Invalid Field:\s*'([^']+)'/i;

/**
 * DataForSEO echoes the posted request params back on `task.data`. Its
 * validation rejections are opaque ("Invalid Field: 'target'.") and name the
 * field but not the value we sent — and these tasks are charged, so we want to
 * know exactly what tripped them. Append the offending value so the charged
 * failure is diagnosable from the captured message alone.
 */
function describeInvalidField(
  message: string,
  task: DataforseoTaskLike,
): string {
  const match = message.match(INVALID_FIELD_MESSAGE_RE);
  if (!match) return message;
  const field = match[1];
  if (!isRecord(task.data)) return message;
  const value = task.data[field];
  if (value === undefined) return message;
  return `${message} (sent ${field}=${JSON.stringify(value)})`;
}

/**
 * DataForSEO's "No Search Results" (40501) — a successful empty result, not a
 * failure. Match on the status message, not the code alone: 40501 also covers
 * validation rejections like "Invalid Field: 'target'.", which are real charged
 * failures we must surface rather than mask as empty results.
 */
export function isNoResultsTask(task: DataforseoTaskLike): boolean {
  return (
    task.status_message?.toLowerCase().includes("no search results") ?? false
  );
}

/**
 * "Task completed with partial results. Some pages could not be retrieved
 * after several retry attempts. You have not been charged for the pages that
 * were not returned." DataForSEO still bills (and returns) whatever pages it
 * did retrieve — e.g. page 1 of a depth-100 SERP crawl — so this must not be
 * treated as a plain failure that discards those items.
 */
export function isPartialResultsTask(task: DataforseoTaskLike): boolean {
  return (
    task.status_message?.toLowerCase().includes("partial results") ?? false
  );
}

/** Task lifecycle codes meaning "not done yet": Task Created / Task Handed /
 *  Task In Queue. A task_get returning one of these is pending, not failed. */
const TASK_IN_PROGRESS_STATUS_CODES = new Set([20100, 40601, 40602]);

export function isTaskInProgress(task: DataforseoTaskLike): boolean {
  return (
    task.status_code !== undefined &&
    TASK_IN_PROGRESS_STATUS_CODES.has(task.status_code)
  );
}

type AssertOkOptions = {
  /** Maps a recognised access / billing failure to a product error. */
  classify?: DataforseoErrorClassifier;
  /** Request path string handed to the classifier (e.g. "/v3/backlinks/summary/live"). */
  classifyPath?: string;
  /** Treat DataForSEO's "no search results" (40501) as an empty success. */
  treatNoResultsAsEmpty?: boolean;
  /** Treat DataForSEO's "Task completed with partial results" as a success
   *  carrying whatever items it did retrieve, instead of throwing. */
  treatPartialResultsAsPartial?: boolean;
  /** Task status that counts as success. Live endpoints return 20000; task_post
   *  entries return 20100 "Task Created". */
  okTaskStatusCode?: number;
};

/**
 * Validates that the top-level response and its first task both succeeded, and
 * returns that (SDK-typed) task. The single status / billing ladder shared by
 * every endpoint:
 *  - access / balance failure -> classified AppError
 *  - charged-but-failed task (cost present) -> DataforseoChargedTaskError
 */
export function assertOk<T extends DataforseoTaskLike>(
  response: DataforseoResponseLike<T> | null,
  options: AssertOkOptions = {},
): T {
  if (!response) {
    throw new AppError(
      "INTERNAL_ERROR",
      "DataForSEO returned an empty response",
    );
  }
  const {
    classify,
    classifyPath,
    treatNoResultsAsEmpty,
    treatPartialResultsAsPartial,
    okTaskStatusCode,
  } = options;

  if (response.status_code !== 20000) {
    const message = response.status_message || "DataForSEO request failed";
    throw (
      classify?.(response.status_code, message, classifyPath ?? "") ??
      new AppError("INTERNAL_ERROR", message)
    );
  }

  const task = response.tasks?.[0];
  if (!task) {
    throw new AppError("INTERNAL_ERROR", "DataForSEO response missing task");
  }

  if (task.status_code !== (okTaskStatusCode ?? 20000)) {
    if (treatNoResultsAsEmpty && isNoResultsTask(task)) return task;
    if (treatPartialResultsAsPartial && isPartialResultsTask(task)) return task;

    const message = task.status_message || "DataForSEO task failed";
    const path = classifyPath ?? (task.path ? `/${task.path.join("/")}` : "");
    const classified = classify?.(task.status_code, message, path);
    if (classified) throw classified;

    const detailedMessage = describeInvalidField(message, task);
    const billing = tryBuildTaskBilling(task);
    if (billing)
      throw new DataforseoChargedTaskError(
        detailedMessage,
        billing,
        INVALID_FIELD_MESSAGE_RE.test(message),
      );

    throw new AppError("INTERNAL_ERROR", detailedMessage);
  }

  return task;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Both the live and task_get my_business_info responses shape their result
 * entry the same way: `items[0]` is the profile, `check_url` (the Google Maps
 * link DataForSEO verified against) lives on the entry itself rather than the
 * item. Shared (via this SDK-free leaf module, so it stays reachable without
 * the lazy dataforseo import boundary) by business.ts's live fetchMyBusinessInfo
 * and the task-queue path in local-seo-tools.ts's get_business_profile, so
 * both return one complete record instead of duplicating the merge.
 */
export function extractMyBusinessInfoProfile(
  entry: Record<string, unknown> | null,
): Record<string, unknown> | null {
  const items = entry?.items;
  // Array.isArray narrows to `any[]`, so `first` is typed explicitly to keep
  // that any from leaking into the isRecord narrowing below.
  const first: unknown = Array.isArray(items) ? items[0] : undefined;
  if (!isRecord(first)) return null;
  if (first.check_url == null) first.check_url = entry?.check_url;
  return first;
}

/** Reads `task.result[0].total_count` for paginated list endpoints. */
export function parseTaskTotalCount(task: DataforseoTaskLike): number | null {
  const first = task.result?.[0];
  if (!isRecord(first)) return null;
  return typeof first.total_count === "number" ? first.total_count : null;
}

/** Reads `task.result[0].items`, validating against a Zod schema for loosely-typed endpoints. */
export function parseTaskItems<T extends z.ZodTypeAny>(
  endpoint: string,
  task: DataforseoTaskLike,
  itemSchema: T,
): Array<z.infer<T>> {
  const first = task.result?.[0];
  const items = isRecord(first) ? first.items : [];
  const parsed = z.array(itemSchema).safeParse(items ?? []);
  if (!parsed.success) {
    console.error(
      `dataforseo.${endpoint}.invalid-payload`,
      parsed.error.issues.slice(0, 5),
    );
    throw new AppError(
      "INTERNAL_ERROR",
      `DataForSEO ${endpoint} returned an invalid response shape`,
    );
  }
  return parsed.data;
}
