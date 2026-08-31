// Global patches the partyserver/agents stack needs under Node. MUST be
// imported before the first partyserver import (entry.ts imports it first).
//
// 1. Cloudflare's WebSocket carries READY_STATE_* statics. partyserver only
//    polyfills them when `!("OPEN" in WebSocket)` — Node's WebSocket has OPEN,
//    so without this patch every `readyState === WebSocket.READY_STATE_OPEN`
//    comparison is against undefined: getConnections() yields nothing and
//    broadcast() silently no-ops.
// 2. workerd WebSockets have serialize/deserializeAttachment; give the global
//    prototype a WeakMap-backed version (the bridge adapter has its own).
// 3. WebSocketPair: hands partyserver a [client, server] pair whose server
//    half is an adapter over the real `ws` socket parked by the upgrade
//    handler in scripts/serve-node.mjs.
// 4. undici's Response refuses status 101; partyserver builds exactly that
//    for the handshake. Wrap the global Response so a 101 init returns a
//    lightweight object carrying {status: 101, webSocket} instead.

const attachments = new WeakMap<object, unknown>();

type WsLike = {
  send(data: unknown): void;
  close(code?: number, reason?: string): void;
  readyState: number;
  on(event: string, cb: (...args: unknown[]) => void): void;
};

export function installCfWebSocketGlobals(): void {
  const g = globalThis as Record<string, unknown>;
  if (g.__cfWsGlobalsInstalled) return;
  g.__cfWsGlobalsInstalled = true;

  const WS = g.WebSocket as { prototype: object } & Record<string, unknown>;
  if (WS) {
    WS.READY_STATE_CONNECTING = 0;
    WS.READY_STATE_OPEN = 1;
    WS.READY_STATE_CLOSING = 2;
    WS.READY_STATE_CLOSED = 3;
    const proto = WS.prototype as Record<string, unknown>;
    if (!proto.serializeAttachment) {
      proto.serializeAttachment = function (value: unknown) {
        attachments.set(this as object, structuredClone(value));
      };
      proto.deserializeAttachment = function () {
        return attachments.get(this as object) ?? null;
      };
    }
  }

  // --- pending-socket slot for the upgrade bridge ---
  let pendingSocket: WsLike | null = null;
  g.__cfSetPendingNodeSocket = (socket: WsLike | null) => {
    pendingSocket = socket;
  };

  class ServerHalfAdapter {
    private real: WsLike;
    constructor(real: WsLike) {
      this.real = real;
    }
    get readyState(): number {
      return this.real.readyState;
    }
    accept(): void {}
    send(data: unknown): void {
      this.real.send(data as never);
    }
    close(code?: number, reason?: string): void {
      try {
        this.real.close(code, reason);
      } catch {
        // already closed
      }
    }
    serializeAttachment(value: unknown): void {
      attachments.set(this, structuredClone(value));
    }
    deserializeAttachment(): unknown {
      return attachments.get(this) ?? null;
    }
    // Direct listener path for the non-hibernating manager (defensive; the
    // agents run hibernated and are driven via ctx.acceptWebSocket instead).
    addEventListener(event: string, cb: (ev: unknown) => void): void {
      if (event === "message") {
        this.real.on("message", (data: unknown, isBinary: unknown) =>
          cb({ data: isBinary ? data : String(data) }),
        );
      } else if (event === "close") {
        this.real.on("close", (code: unknown, reason: unknown) =>
          cb({ code, reason: String(reason ?? "") }),
        );
      } else if (event === "error") {
        this.real.on("error", (error: unknown) => cb({ error }));
      }
    }
    /** Bridge hook: the real ws socket (used by do-chat-agents to wire events). */
    get __realSocket(): WsLike {
      return this.real;
    }
  }

  class ClientHalfStub {
    readonly readyState = 1;
    accept(): void {}
    send(): void {}
    close(): void {}
  }

  g.WebSocketPair = class WebSocketPair {
    0: ClientHalfStub;
    1: ServerHalfAdapter;
    constructor() {
      if (!pendingSocket) {
        throw new Error(
          "WebSocketPair constructed outside an /agents upgrade (no pending socket)",
        );
      }
      this[0] = new ClientHalfStub();
      this[1] = new ServerHalfAdapter(pendingSocket);
      pendingSocket = null;
    }
  };

  // --- Response wrapper for status-101 handshake responses ---
  // undici's Response constructor refuses status 101, but partyserver builds
  // exactly that for the WS handshake. Replace the global with a factory
  // that returns REAL Response instances for everything else (so every
  // `instanceof Response` in the app and its libraries keeps working — the
  // shared prototype covers both directions) and a lightweight stand-in
  // only for 101.
  const OrigResponse = g.Response as typeof Response;
  function PatchedResponse(
    this: unknown,
    body?: BodyInit | null,
    init?: ResponseInit & { webSocket?: unknown },
  ) {
    if (init && init.status === 101) {
      const fake = Object.create(OrigResponse.prototype) as Record<string, unknown>;
      Object.defineProperty(fake, "status", { value: 101 });
      Object.defineProperty(fake, "ok", { value: false });
      Object.defineProperty(fake, "headers", { value: new Headers() });
      Object.defineProperty(fake, "webSocket", { value: init.webSocket ?? null });
      Object.defineProperty(fake, "body", { value: null });
      return fake;
    }
    // Constructor return-override: callers get a genuine Response instance.
    return new OrigResponse(body, init);
  }
  PatchedResponse.prototype = OrigResponse.prototype;
  Object.setPrototypeOf(PatchedResponse, OrigResponse); // statics: json, redirect, error
  g.Response = PatchedResponse;
}
