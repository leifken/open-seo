import { dataforseoPost } from "@/server/lib/dataforseo/core";
import {
  DataforseoChargedTaskError,
  invalidFieldName,
  failedResponseError,
  type DataforseoTaskLike,
  type DataforseoApiResponse,
} from "@/server/lib/dataforseo/envelope";
import { MAX_TASKS_PER_POST } from "@/server/lib/dataforseo/shared";
import { AppError } from "@/server/lib/errors";

// ---------------------------------------------------------------------------
// LEIFKEN (SEO-5): queued Google Maps SERPs for get_local_rank_grid. One
// task_post carries every grid point (at most 49); high priority settled a
// real Maps task in under 5 s on 21.09.2026 at $0.0012 per task, against
// $0.002 per live call. Collection (task_get) is free and stays available at
// DataForSEO for 30 days, which is what makes a grid resumable.
// ---------------------------------------------------------------------------

const MAPS_TASK_PRIORITY = { normal: 1, high: 2 } as const;

type PostedMapsTask = { tag: string; taskId: string };

export async function postMapsTasks(input: {
  keyword: string;
  languageCode: string;
  device: "desktop" | "mobile";
  depth: number;
  priority: "normal" | "high";
  /** One entry per task; `tag` comes back on the posted task and on task_get. */
  points: Array<{ tag: string; locationCoordinate: string }>;
}): Promise<DataforseoApiResponse<PostedMapsTask[]>> {
  if (input.points.length === 0 || input.points.length > MAX_TASKS_PER_POST) {
    throw new AppError(
      "INTERNAL_ERROR",
      `task_post accepts 1-${MAX_TASKS_PER_POST} tasks, got ${input.points.length}`,
    );
  }
  const response = await dataforseoPost<
    DataforseoTaskLike & { id?: string; data?: Record<string, unknown> }
  >(
    "/v3/serp/google/maps/task_post",
    input.points.map((point) => ({
      keyword: input.keyword,
      location_coordinate: point.locationCoordinate,
      language_code: input.languageCode,
      device: input.device,
      os: input.device === "desktop" ? "windows" : "android",
      depth: input.depth,
      priority: MAPS_TASK_PRIORITY[input.priority],
      search_places: false,
      tag: point.tag,
    })),
    { maxServerErrorRetries: 0 },
  );

  if (!response || response.status_code !== 20000) {
    throw failedResponseError(response, "DataForSEO task_post failed");
  }

  // Same accounting as postRankCheckTasks: cost is summed over every entry,
  // accepted or not; rejected entries simply get no task id.
  const posted: PostedMapsTask[] = [];
  let costUsd = 0;
  for (const entry of response.tasks ?? []) {
    costUsd += entry.cost ?? 0;
    const tag: unknown = entry.data?.tag;
    if (entry.status_code !== 20100 || !entry.id || typeof tag !== "string") {
      console.warn(
        `dataforseo.maps_task_post.rejected-entry (${entry.status_code}): ${entry.status_message}`,
      );
      continue;
    }
    posted.push({ tag, taskId: entry.id });
  }

  if (posted.length === 0) {
    const message =
      response.tasks?.[0]?.status_message ?? "DataForSEO created no Maps tasks";
    throw new DataforseoChargedTaskError(
      message,
      { path: ["v3", "serp", "google", "maps", "task_post"], costUsd },
      invalidFieldName(message) !== null,
    );
  }
  return {
    data: posted,
    billing: { path: ["v3", "serp", "google", "maps", "task_post"], costUsd },
  };
}

export { fetchLocalSerpTaskResult as fetchMapsTaskResult } from "./serp";
