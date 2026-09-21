import { SerpGoogleMapsTaskPostRequestInfo } from "dataforseo-client";
import { serpApi, serpTaskApi } from "@/server/lib/dataforseo/core";
import {
  isNoResultsTask,
  isTaskInProgress,
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
  const response = await serpTaskApi().googleMapsTaskPost(
    input.points.map(
      (point) =>
        new SerpGoogleMapsTaskPostRequestInfo({
          keyword: input.keyword,
          location_coordinate: point.locationCoordinate,
          language_code: input.languageCode,
          device: input.device,
          os: input.device === "desktop" ? "windows" : "android",
          depth: input.depth,
          priority: MAPS_TASK_PRIORITY[input.priority],
          search_places: false,
          tag: point.tag,
        }),
    ),
  );

  if (!response || response.status_code !== 20000) {
    throw new AppError(
      "INTERNAL_ERROR",
      response?.status_message || "DataForSEO task_post failed",
    );
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

  return {
    data: posted,
    billing: { path: ["v3", "serp", "google", "maps", "task_post"], costUsd },
  };
}

type MapsTaskOutcome =
  | { status: "pending" }
  | { status: "failed"; message: string }
  | { status: "completed"; items: Record<string, unknown>[] };

/** Collects one queued Maps task. Free; deliberately not metered. */
export async function fetchMapsTaskResult(
  taskId: string,
): Promise<MapsTaskOutcome> {
  const response = await serpApi().googleMapsTaskGetAdvanced(taskId);
  const task = response?.tasks?.[0];
  if (!response || response.status_code !== 20000 || !task) {
    throw new AppError(
      "INTERNAL_ERROR",
      response?.status_message || "DataForSEO task_get failed",
    );
  }
  if (isTaskInProgress(task)) return { status: "pending" };
  if (task.status_code !== 20000) {
    if (isNoResultsTask(task)) return { status: "completed", items: [] };
    return {
      status: "failed",
      message:
        task.status_message || `DataForSEO task failed (${task.status_code})`,
    };
  }
  return { status: "completed", items: task.result?.[0]?.items ?? [] };
}
