// Explicit placeholders for bindings whose Node port lands in a later
// milestone. They fail loudly with the milestone context instead of
// pretending to work.

export class UnportedFeatureError extends Error {
  constructor(binding: string, operation: string) {
    super(
      `${binding}.${operation} is not ported to the Node runtime yet. ` +
        "Site Audit and Rank Tracking runs land with the workflow-engine milestone.",
    );
    this.name = "UnportedFeatureError";
  }
}

export function makeUnportedWorkflowBinding(name: string) {
  return {
    create() {
      throw new UnportedFeatureError(name, "create");
    },
    async get(): Promise<never> {
      // Callers (auditReconciler, rankCheckRunGuards) treat a rejected
      // status lookup as "instance gone" and mark the run failed — the
      // correct outcome while the engine isn't ported.
      throw new UnportedFeatureError(name, "get");
    },
  };
}

export function makeUnportedDurableObjectNamespace(name: string) {
  return {
    idFromName() {
      throw new UnportedFeatureError(name, "idFromName");
    },
    get() {
      throw new UnportedFeatureError(name, "get");
    },
  };
}
