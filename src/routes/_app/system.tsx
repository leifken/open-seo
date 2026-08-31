// LEIFKEN self-host addition (not upstream): system status + guided updates.
// Talks to the Node-runtime endpoints in scripts/serve-node.mjs
// (/api/leifken/update-status, /api/leifken/update-deploy).
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/system")({
  component: SystemPage,
});

type UpdateStatus = {
  runningCommit: string;
  branchAheadBy: number;
  branchLatest: { sha: string; message: string; date: string }[];
  upstreamBehindBy: number;
  upstreamLatest: { sha: string; message: string; date: string }[];
  deployConfigured: boolean;
  error?: string;
};

function SystemPage() {
  const [deploying, setDeploying] = useState(false);
  const statusQuery = useQuery({
    queryKey: ["leifken-update-status"],
    queryFn: async (): Promise<UpdateStatus> => {
      const res = await fetch("/api/leifken/update-status");
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return res.json();
    },
    refetchOnWindowFocus: false,
  });

  async function startDeploy() {
    setDeploying(true);
    try {
      const res = await fetch("/api/leifken/update-deploy", { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(body.error ?? `Installation fehlgeschlagen (${res.status})`);
        return;
      }
      toast.success(
        "Update-Installation gestartet. Die Anwendung baut sich neu und ist in wenigen Minuten wieder erreichbar.",
      );
    } catch {
      toast.error("Installation konnte nicht gestartet werden.");
    } finally {
      setDeploying(false);
    }
  }

  const s = statusQuery.data;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System</h1>
        <p className="text-sm text-base-content/60">
          Versionsstand, Updates aus der Community und Installation.
        </p>
      </div>

      <div className="card border border-base-300 bg-base-100">
        <div className="card-body space-y-4">
          <h2 className="card-title text-base">Update-Prüfung</h2>

          {statusQuery.isLoading ? (
            <p className="text-sm text-base-content/60">Prüfe auf Updates...</p>
          ) : statusQuery.isError || !s ? (
            <p className="text-sm text-error">
              Update-Status konnte nicht geladen werden.
            </p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <StatusTile
                  label="Installierter Stand"
                  value={s.runningCommit ? s.runningCommit.slice(0, 7) : "unbekannt"}
                  tone="neutral"
                />
                <StatusTile
                  label="Bereit zur Installation"
                  value={s.branchAheadBy > 0 ? `${s.branchAheadBy} Update(s)` : "Aktuell"}
                  tone={s.branchAheadBy > 0 ? "warning" : "success"}
                />
                <StatusTile
                  label="Neu bei der Community"
                  value={
                    s.upstreamBehindBy > 0
                      ? `${s.upstreamBehindBy} Änderung(en)`
                      : "Nichts Neues"
                  }
                  tone={s.upstreamBehindBy > 0 ? "info" : "success"}
                />
              </div>

              {s.branchAheadBy > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-base-content/70">
                    Geprüfte Updates liegen bereit. Die Installation baut die
                    Anwendung neu, die Daten bleiben unverändert. Dauer: wenige
                    Minuten.
                  </p>
                  <ul className="list-inside list-disc text-sm text-base-content/60">
                    {s.branchLatest.slice(0, 5).map((c) => (
                      <li key={c.sha}>{c.message.split("\n")[0]}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={deploying || !s.deployConfigured}
                    onClick={() => void startDeploy()}
                  >
                    {deploying ? "Wird gestartet..." : "Update jetzt installieren"}
                  </button>
                  {!s.deployConfigured ? (
                    <p className="text-xs text-warning">
                      Installations-Schlüssel ist nicht hinterlegt
                      (COOLIFY_DEPLOY_TOKEN).
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-base-content/70">
                  Deine Installation ist auf dem geprüften, aktuellen Stand.
                </p>
              )}

              {s.upstreamBehindBy > 0 ? (
                <div className="rounded-lg bg-base-200 p-3">
                  <p className="text-sm font-medium">
                    Neues aus der OpenSEO-Community
                  </p>
                  <p className="text-xs text-base-content/60">
                    Diese Änderungen werden zuerst geprüft und an die
                    LEIFKEN-Umgebung angepasst, bevor sie hier zur Installation
                    erscheinen. So bleibt jede Aktualisierung risikofrei.
                  </p>
                  <ul className="mt-2 list-inside list-disc text-xs text-base-content/60">
                    {s.upstreamLatest.slice(0, 5).map((c) => (
                      <li key={c.sha}>{c.message.split("\n")[0]}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          )}

          <button
            type="button"
            className="btn btn-ghost btn-sm w-fit"
            onClick={() => void statusQuery.refetch()}
          >
            Erneut prüfen
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "warning" | "info" | "neutral";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "info"
          ? "text-secondary"
          : "text-base-content";
  return (
    <div className="rounded-lg border border-base-300 bg-base-100 p-3">
      <div className="text-xs uppercase tracking-wide text-base-content/50">
        {label}
      </div>
      <div className={`text-lg font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}
