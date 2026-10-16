import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WorkflowStep } from "cloudflare:workers";
import type { RankCheckTaskInput } from "@/server/lib/dataforseo";
import { runLiveCheck } from "./rankCheckPaths";

const mocks = vi.hoisted(() => ({
  getSnapshotsForRun: vi.fn(),
  insertSnapshots: vi.fn(),
  updateRun: vi.fn(),
  fetchRankCheckTaskResult: vi.fn(),
  rankCheckBatch: vi.fn(),
  rankCheckTaskPost: vi.fn(),
}));

vi.mock(
  "@/server/features/rank-tracking/repositories/RankTrackingRepository",
  () => ({ RankTrackingRepository: mocks }),
);
vi.mock("@/server/lib/dataforseo", () => ({
  fetchRankCheckTaskResult: mocks.fetchRankCheckTaskResult,
  MAX_TASKS_PER_POST: 100,
}));
vi.mock("@/server/workflows/pgStep", () => ({
  pgStep: (
    _step: unknown,
    _name: string,
    _config: unknown,
    fn: () => unknown,
  ) => fn(),
}));

const keywords = Array.from({ length: 11 }, (_, index) => ({
  id: `kw_${index}`,
  keyword: `keyword ${index}`,
}));

function runManualCheck() {
  return runLiveCheck(
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- only sleep is reached; pgStep is mocked
    { sleep: vi.fn() } as unknown as WorkflowStep,
    {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the check paths only call these two serp methods
      client: {
        serp: {
          rankCheckBatch: mocks.rankCheckBatch,
          rankCheckTaskPost: mocks.rankCheckTaskPost,
        },
      } as never,
      keywords,
      devices: "desktop",
      serpDepth: 10,
      domain: "openseo.so",
      locationCode: 2840,
      languageCode: "en",
      runId: "run_1",
    },
  );
}

describe("runLiveCheck", () => {
  beforeEach(() => {
    mocks.rankCheckBatch.mockImplementation(
      async (inputs: RankCheckTaskInput[]) =>
        inputs.map((input) => ({
          status: "fulfilled",
          value: { ...input, position: 3, url: null, serpFeatures: [] },
        })),
    );
    mocks.rankCheckTaskPost.mockImplementation(
      async ({ tasks }: { tasks: RankCheckTaskInput[] }) =>
        tasks.map((task) => ({ ...task, taskId: `task_${task.keywordId}` })),
    );
    mocks.fetchRankCheckTaskResult.mockImplementation(
      async (task: RankCheckTaskInput) => ({
        status: "completed",
        result: { ...task, position: 5, url: null, serpFeatures: [] },
      }),
    );
  });

  it("keeps going after a failed live batch and queues only the missing pairs", async () => {
    // The first batch step dies after its calls; the second batch saves kw_10.
    mocks.insertSnapshots.mockRejectedValueOnce(new Error("step timed out"));
    mocks.getSnapshotsForRun.mockResolvedValue([
      { trackingKeywordId: "kw_10", device: "desktop" },
    ]);

    const stats = await runManualCheck();

    expect(mocks.rankCheckBatch).toHaveBeenCalledTimes(2);
    expect(mocks.rankCheckTaskPost).toHaveBeenCalledOnce();
    expect(mocks.rankCheckTaskPost).toHaveBeenCalledWith(
      expect.objectContaining({
        tasks: keywords
          .slice(0, 10)
          .map((kw): unknown => expect.objectContaining({ keywordId: kw.id })),
      }),
    );
    expect(stats).toMatchObject({ queueTasks: 10, queueCollected: 10 });
  });

  it("makes no second live call when a queued retry fails", async () => {
    mocks.getSnapshotsForRun.mockResolvedValue([]);
    mocks.fetchRankCheckTaskResult.mockResolvedValue({
      status: "failed",
      message: "Internal SE Server Error.",
    });

    const stats = await runManualCheck();

    // Two live batches, then no live fallback for the failed queue tasks:
    // that call could exceed the credits the user approved.
    expect(mocks.rankCheckBatch).toHaveBeenCalledTimes(2);
    expect(stats).toMatchObject({ queueTasks: 11, fallbackTasks: 0 });
  });

  it("leaves a pair unchecked when its queued retry doesn't find the domain", async () => {
    mocks.getSnapshotsForRun.mockResolvedValue([]);
    mocks.fetchRankCheckTaskResult.mockImplementation(
      async (task: RankCheckTaskInput) => ({
        status: "completed",
        result: {
          ...task,
          position: task.keywordId === "kw_0" ? null : 5,
          url: null,
          serpFeatures: [],
        },
      }),
    );

    await runManualCheck();

    // The queue round saves every pair except kw_0's not-found.
    expect(mocks.insertSnapshots).toHaveBeenLastCalledWith(
      keywords
        .slice(1)
        .map((kw): unknown =>
          expect.objectContaining({ trackingKeywordId: kw.id, position: 5 }),
        ),
    );
  });

  it("skips the queue when the live endpoint checked every pair", async () => {
    mocks.getSnapshotsForRun.mockResolvedValue(
      keywords.map((kw) => ({ trackingKeywordId: kw.id, device: "desktop" })),
    );

    expect(await runManualCheck()).toBeNull();
    expect(mocks.rankCheckTaskPost).not.toHaveBeenCalled();
  });
});
