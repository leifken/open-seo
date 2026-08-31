import { cb as isInternalJsStubProp, cc as camelCaseToKebabCase, cd as nanoid } from "../entry.js";
import { useMemo, useState, useRef, useEffect, use, useCallback, useLayoutEffect } from "react";
import { isToolUIPart, getToolName } from "ai";
import { useChat } from "@ai-sdk/react";
import { jsxs, jsx } from "react/jsx-runtime";
import { Pencil, Undo2, Loader2, ChevronRight, AlertTriangle, Check, Copy, Globe, Sparkles, ArrowUp } from "lucide-react";
import { a as Markdown } from "./Markdown-Bj-WSGPs.js";
function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function normalizeToolInput(raw) {
  if (isPlainObject(raw)) return {
    input: raw,
    changed: false
  };
  if (typeof raw === "string" && raw.trim().startsWith("{")) try {
    const parsed = JSON.parse(raw);
    if (isPlainObject(parsed)) return {
      input: parsed,
      changed: true
    };
  } catch {
  }
  return {
    input: {},
    changed: true
  };
}
function applyChunkToParts(parts, chunk) {
  switch (chunk.type) {
    case "text-start":
      parts.push({
        type: "text",
        text: "",
        state: "streaming"
      });
      return true;
    case "text-delta": {
      const lastTextPart = findLastPartByType(parts, "text");
      if (lastTextPart && lastTextPart.type === "text") lastTextPart.text += chunk.delta ?? "";
      else parts.push({
        type: "text",
        text: chunk.delta ?? "",
        state: "streaming"
      });
      return true;
    }
    case "text-end": {
      const lastTextPart = findLastPartByType(parts, "text");
      if (lastTextPart && "state" in lastTextPart) lastTextPart.state = "done";
      return true;
    }
    case "reasoning-start":
      parts.push({
        type: "reasoning",
        text: "",
        state: "streaming"
      });
      return true;
    case "reasoning-delta": {
      const lastReasoningPart = findLastPartByType(parts, "reasoning");
      if (lastReasoningPart && lastReasoningPart.type === "reasoning") {
        lastReasoningPart.text += chunk.delta ?? "";
        mergeProviderMetadata(lastReasoningPart, chunk.providerMetadata);
      } else parts.push({
        type: "reasoning",
        text: chunk.delta ?? "",
        state: "streaming",
        ...chunk.providerMetadata != null ? { providerMetadata: chunk.providerMetadata } : {}
      });
      return true;
    }
    case "reasoning-end": {
      const lastReasoningPart = findLastPartByType(parts, "reasoning");
      if (lastReasoningPart && "state" in lastReasoningPart) {
        lastReasoningPart.state = "done";
        mergeProviderMetadata(lastReasoningPart, chunk.providerMetadata);
      }
      return true;
    }
    case "file":
      parts.push({
        type: "file",
        mediaType: chunk.mediaType,
        url: chunk.url
      });
      return true;
    case "source-url":
      parts.push({
        type: "source-url",
        sourceId: chunk.sourceId,
        url: chunk.url,
        title: chunk.title,
        providerMetadata: chunk.providerMetadata
      });
      return true;
    case "source-document":
      parts.push({
        type: "source-document",
        sourceId: chunk.sourceId,
        mediaType: chunk.mediaType,
        title: chunk.title,
        filename: chunk.filename,
        providerMetadata: chunk.providerMetadata
      });
      return true;
    case "tool-input-start":
      if (findToolPartByCallId(parts, chunk.toolCallId)) return true;
      parts.push({
        type: `tool-${chunk.toolName}`,
        toolCallId: chunk.toolCallId,
        toolName: chunk.toolName,
        state: "input-streaming",
        input: void 0,
        ...chunk.providerExecuted != null ? { providerExecuted: chunk.providerExecuted } : {},
        ...chunk.providerMetadata != null ? { callProviderMetadata: chunk.providerMetadata } : {},
        ...chunk.title != null ? { title: chunk.title } : {}
      });
      return true;
    case "tool-input-delta": {
      const toolPart = findToolPartByCallId(parts, chunk.toolCallId);
      if (toolPart && toolPart.state === "input-streaming") toolPart.input = chunk.input;
      return true;
    }
    case "tool-input-available": {
      const existing = findToolPartByCallId(parts, chunk.toolCallId);
      if (existing) {
        const p = existing;
        if (p.state === "input-streaming") {
          p.state = "input-available";
          p.input = normalizeToolInput(chunk.input).input;
          if (chunk.providerExecuted != null) p.providerExecuted = chunk.providerExecuted;
          if (chunk.providerMetadata != null) p.callProviderMetadata = chunk.providerMetadata;
          if (chunk.title != null) p.title = chunk.title;
        }
        return true;
      }
      parts.push({
        type: `tool-${chunk.toolName}`,
        toolCallId: chunk.toolCallId,
        toolName: chunk.toolName,
        state: "input-available",
        input: normalizeToolInput(chunk.input).input,
        ...chunk.providerExecuted != null ? { providerExecuted: chunk.providerExecuted } : {},
        ...chunk.providerMetadata != null ? { callProviderMetadata: chunk.providerMetadata } : {},
        ...chunk.title != null ? { title: chunk.title } : {}
      });
      return true;
    }
    case "tool-input-error": {
      const existing = findToolPartByCallId(parts, chunk.toolCallId);
      if (existing) {
        const p = existing;
        if (p.state === "output-available" || p.state === "output-error" || p.state === "output-denied") return true;
        p.state = "output-error";
        p.errorText = chunk.errorText;
        p.input = normalizeToolInput(chunk.input).input;
        if (chunk.providerExecuted != null) p.providerExecuted = chunk.providerExecuted;
        if (chunk.providerMetadata != null) p.callProviderMetadata = chunk.providerMetadata;
      } else parts.push({
        type: `tool-${chunk.toolName}`,
        toolCallId: chunk.toolCallId,
        toolName: chunk.toolName,
        state: "output-error",
        input: normalizeToolInput(chunk.input).input,
        errorText: chunk.errorText,
        ...chunk.providerExecuted != null ? { providerExecuted: chunk.providerExecuted } : {},
        ...chunk.providerMetadata != null ? { callProviderMetadata: chunk.providerMetadata } : {}
      });
      return true;
    }
    case "tool-approval-request": {
      const toolPart = findToolPartByCallId(parts, chunk.toolCallId);
      if (toolPart) {
        const p = toolPart;
        if (p.state === "approval-responded" || p.state === "output-available" || p.state === "output-error" || p.state === "output-denied") return true;
        p.state = "approval-requested";
        p.approval = {
          id: chunk.approvalId,
          ...chunk.approvalDescriptor !== void 0 && { descriptor: chunk.approvalDescriptor }
        };
      }
      return true;
    }
    case "tool-output-denied": {
      const toolPart = findToolPartByCallId(parts, chunk.toolCallId);
      if (toolPart) {
        const p = toolPart;
        if (p.state === "output-available" || p.state === "output-error" || p.state === "output-denied" || p.state === "approval-responded") return true;
        p.state = "output-denied";
      }
      return true;
    }
    case "tool-output-available": {
      const toolPart = findToolPartByCallId(parts, chunk.toolCallId);
      if (toolPart) {
        const p = toolPart;
        p.state = "output-available";
        p.output = chunk.output;
        if (chunk.preliminary !== void 0) p.preliminary = chunk.preliminary;
      }
      return true;
    }
    case "tool-output-error": {
      const toolPart = findToolPartByCallId(parts, chunk.toolCallId);
      if (toolPart) {
        const p = toolPart;
        p.state = "output-error";
        p.errorText = chunk.errorText;
      }
      return true;
    }
    case "step-start":
    case "start-step":
      parts.push({ type: "step-start" });
      return true;
    default:
      if (chunk.type.startsWith("data-")) {
        if (chunk.transient) return true;
        if (chunk.id != null) {
          const existing = findDataPartByTypeAndId(parts, chunk.type, chunk.id);
          if (existing) {
            existing.data = chunk.data;
            return true;
          }
        }
        parts.push({
          type: chunk.type,
          ...chunk.id != null && { id: chunk.id },
          data: chunk.data
        });
        return true;
      }
      return false;
  }
}
function findLastPartByType(parts, type) {
  for (let i = parts.length - 1; i >= 0; i--) if (parts[i].type === type) return parts[i];
}
function findToolPartByCallId(parts, toolCallId) {
  if (!toolCallId) return void 0;
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    if ("toolCallId" in p && p.toolCallId === toolCallId) return p;
  }
}
function mergeProviderMetadata(part, metadata) {
  if (metadata == null) return;
  const p = part;
  p.providerMetadata = {
    ...p.providerMetadata,
    ...metadata
  };
}
function findDataPartByTypeAndId(parts, type, id) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    if (p.type === type && "id" in p && p.id === id) return p;
  }
}
function asMetadata(value) {
  if (value != null && typeof value === "object" && !Array.isArray(value)) return value;
}
var StreamAccumulator = class {
  constructor(options) {
    this.messageId = options.messageId;
    this._isContinuation = options.continuation ?? false;
    this.parts = options.existingParts ? [...options.existingParts] : [];
    this.metadata = options.existingMetadata ? { ...options.existingMetadata } : void 0;
  }
  applyChunk(chunk) {
    const handled = applyChunkToParts(this.parts, chunk);
    if (chunk.type === "tool-approval-request" && chunk.toolCallId) return {
      handled,
      action: {
        type: "tool-approval-request",
        toolCallId: chunk.toolCallId
      }
    };
    if ((chunk.type === "tool-output-available" || chunk.type === "tool-output-error") && chunk.toolCallId) {
      if (!this.parts.some((p) => "toolCallId" in p && p.toolCallId === chunk.toolCallId)) return {
        handled,
        action: {
          type: "cross-message-tool-update",
          updateType: chunk.type === "tool-output-available" ? "output-available" : "output-error",
          toolCallId: chunk.toolCallId,
          output: chunk.output,
          errorText: chunk.errorText,
          preliminary: chunk.preliminary
        }
      };
    }
    if (!handled) switch (chunk.type) {
      case "start": {
        if (chunk.messageId != null && !this._isContinuation) this.messageId = chunk.messageId;
        const startMeta = asMetadata(chunk.messageMetadata);
        if (startMeta) this.metadata = this.metadata ? {
          ...this.metadata,
          ...startMeta
        } : { ...startMeta };
        return {
          handled: true,
          action: {
            type: "start",
            messageId: chunk.messageId,
            metadata: startMeta
          }
        };
      }
      case "finish": {
        const finishMeta = asMetadata(chunk.messageMetadata);
        if (finishMeta) this.metadata = this.metadata ? {
          ...this.metadata,
          ...finishMeta
        } : { ...finishMeta };
        return {
          handled: true,
          action: {
            type: "finish",
            finishReason: "finishReason" in chunk ? chunk.finishReason : void 0,
            metadata: finishMeta
          }
        };
      }
      case "message-metadata": {
        const msgMeta = asMetadata(chunk.messageMetadata);
        if (msgMeta) this.metadata = this.metadata ? {
          ...this.metadata,
          ...msgMeta
        } : { ...msgMeta };
        return {
          handled: true,
          action: {
            type: "message-metadata",
            metadata: msgMeta ?? {}
          }
        };
      }
      case "finish-step":
        return { handled: true };
      case "error":
        return {
          handled: true,
          action: {
            type: "error",
            error: chunk.errorText ?? JSON.stringify(chunk)
          }
        };
    }
    return { handled };
  }
  /** Snapshot the current state as a UIMessage. */
  toMessage() {
    return {
      id: this.messageId,
      role: "assistant",
      parts: [...this.parts],
      ...this.metadata != null && { metadata: this.metadata }
    };
  }
  /**
  * Merge this accumulator's message into an existing message array.
  * Handles continuation (walk backward for last assistant), replacement
  * (update existing by messageId), or append (new message).
  */
  mergeInto(messages) {
    let existingIdx = messages.findIndex((m) => m.id === this.messageId);
    if (existingIdx < 0 && this._isContinuation) {
      for (let i = messages.length - 1; i >= 0; i--) if (messages[i].role === "assistant") {
        existingIdx = i;
        break;
      }
    }
    const partialMessage = {
      id: existingIdx >= 0 ? messages[existingIdx].id : this.messageId,
      role: "assistant",
      parts: [...this.parts],
      ...this.metadata != null && { metadata: this.metadata }
    };
    if (existingIdx >= 0) {
      const updated = [...messages];
      updated[existingIdx] = partialMessage;
      return updated;
    }
    return [...messages, partialMessage];
  }
};
function transition(state, event) {
  switch (event.type) {
    case "clear":
      return {
        state: { status: "idle" },
        isStreaming: false
      };
    case "resume-fallback": {
      const accumulator = new StreamAccumulator({ messageId: event.messageId });
      return {
        state: {
          status: "observing",
          streamId: event.streamId,
          accumulator
        },
        isStreaming: true
      };
    }
    case "response": {
      let accumulator;
      const isReplayedStart = event.replay === true && event.chunkData?.type === "start";
      if (state.status === "idle" || state.streamId !== event.streamId || isReplayedStart) {
        let messageId = event.messageId;
        let existingParts;
        let existingMetadata;
        if (event.continuation && event.currentMessages) {
          for (let i = event.currentMessages.length - 1; i >= 0; i--) if (event.currentMessages[i].role === "assistant") {
            messageId = event.currentMessages[i].id;
            existingParts = [...event.currentMessages[i].parts];
            if (event.currentMessages[i].metadata != null) existingMetadata = { ...event.currentMessages[i].metadata };
            break;
          }
        }
        accumulator = new StreamAccumulator({
          messageId,
          continuation: event.continuation,
          existingParts,
          existingMetadata
        });
      } else accumulator = state.accumulator;
      if (event.chunkData) accumulator.applyChunk(event.chunkData);
      let messagesUpdate;
      if (event.done) {
        messagesUpdate = (prev) => accumulator.mergeInto(prev);
        return {
          state: { status: "idle" },
          messagesUpdate,
          isStreaming: false
        };
      }
      if (event.chunkData && !event.replay) messagesUpdate = (prev) => accumulator.mergeInto(prev);
      else if (event.replayComplete) messagesUpdate = (prev) => accumulator.mergeInto(prev);
      return {
        state: {
          status: "observing",
          streamId: event.streamId,
          accumulator
        },
        messagesUpdate,
        isStreaming: true
      };
    }
  }
}
const STREAM_RESUME_NONE_REASONS = {
  /** No active, pending, or terminal stream exists for this agent. */
  IDLE: "idle"
};
const FREE_ONBOARDING_QUESTION_LIMIT = 7;
if (!globalThis.EventTarget || !globalThis.Event)
  console.error(`
  PartySocket requires a global 'EventTarget' class to be available!
  You can polyfill this global by adding this to your code before any partysocket imports: 
  
  \`\`\`
  import 'partysocket/event-target-polyfill';
  \`\`\`
  Please file an issue at https://github.com/partykit/partykit if you're still having trouble.
`);
var ErrorEvent = class extends Event {
  message;
  error;
  constructor(error, target) {
    super("error", target);
    this.message = error.message;
    this.error = error;
  }
};
var CloseEvent = class extends Event {
  code;
  reason;
  wasClean = true;
  constructor(code = 1e3, reason = "", target) {
    super("close", target);
    this.code = code;
    this.reason = reason;
  }
};
const Events = {
  Event,
  ErrorEvent,
  CloseEvent
};
function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}
function cloneEventBrowser(e) {
  return new e.constructor(e.type, e);
}
function cloneEventNode(e) {
  if ("data" in e) return new MessageEvent(e.type, e);
  if ("code" in e || "reason" in e)
    return new CloseEvent(e.code || 1999, e.reason || "unknown reason", e);
  if ("error" in e) return new ErrorEvent(e.error, e);
  return new Event(e.type, e);
}
const isNode = typeof process !== "undefined" && typeof process.versions?.node !== "undefined";
const isReactNative = typeof navigator !== "undefined" && navigator.product === "ReactNative";
const cloneEvent = isNode || isReactNative ? cloneEventNode : cloneEventBrowser;
const DEFAULT = {
  maxReconnectionDelay: 1e4,
  minReconnectionDelay: 3e3,
  minUptime: 5e3,
  reconnectionDelayGrowFactor: 1.3,
  connectionTimeout: 4e3,
  maxRetries: Number.POSITIVE_INFINITY,
  maxEnqueuedMessages: Number.POSITIVE_INFINITY
};
let didWarnAboutMissingWebSocket = false;
function absorbError() {
}
var ReconnectingWebSocket = class ReconnectingWebSocket2 extends EventTarget {
  _ws;
  _retryCount = -1;
  _uptimeTimeout;
  _connectTimeout;
  _shouldReconnect = true;
  _connectLock = false;
  _binaryType = "blob";
  _closeCalled = false;
  _didWarnAboutClosedSend = false;
  _messageQueue = [];
  _debugLogger = console.log.bind(console);
  _url;
  _protocols;
  _options;
  constructor(url, protocols, options = {}) {
    super();
    this._url = url;
    this._protocols = protocols;
    this._options = options;
    if (this._options.startClosed) this._shouldReconnect = false;
    if (this._options.debugLogger)
      this._debugLogger = this._options.debugLogger;
    this._connect();
  }
  static get CONNECTING() {
    return 0;
  }
  static get OPEN() {
    return 1;
  }
  static get CLOSING() {
    return 2;
  }
  static get CLOSED() {
    return 3;
  }
  get CONNECTING() {
    return ReconnectingWebSocket2.CONNECTING;
  }
  get OPEN() {
    return ReconnectingWebSocket2.OPEN;
  }
  get CLOSING() {
    return ReconnectingWebSocket2.CLOSING;
  }
  get CLOSED() {
    return ReconnectingWebSocket2.CLOSED;
  }
  get binaryType() {
    return this._ws ? this._ws.binaryType : this._binaryType;
  }
  set binaryType(value) {
    this._binaryType = value;
    if (this._ws) this._ws.binaryType = value;
  }
  /**
   * Returns the number or connection retries
   */
  get retryCount() {
    return Math.max(this._retryCount, 0);
  }
  /**
   * The number of bytes of data that have been queued using calls to send() but not yet
   * transmitted to the network. This value resets to zero once all queued data has been sent.
   * This value does not reset to zero when the connection is closed; if you keep calling send(),
   * this will continue to climb. Read only
   */
  get bufferedAmount() {
    return this._messageQueue.reduce((acc, message) => {
      if (typeof message === "string") acc += message.length;
      else if (message instanceof Blob) acc += message.size;
      else acc += message.byteLength;
      return acc;
    }, 0) + (this._ws ? this._ws.bufferedAmount : 0);
  }
  /**
   * The extensions selected by the server. This is currently only the empty string or a list of
   * extensions as negotiated by the connection
   */
  get extensions() {
    return this._ws ? this._ws.extensions : "";
  }
  /**
   * A string indicating the name of the sub-protocol the server selected;
   * this will be one of the strings specified in the protocols parameter when creating the
   * WebSocket object
   */
  get protocol() {
    return this._ws ? this._ws.protocol : "";
  }
  /**
   * The current state of the connection; this is one of the Ready state constants
   */
  get readyState() {
    if (this._closeCalled) return ReconnectingWebSocket2.CLOSED;
    if (this._ws) return this._ws.readyState;
    return this._options.startClosed ? ReconnectingWebSocket2.CLOSED : ReconnectingWebSocket2.CONNECTING;
  }
  /**
   * The URL as resolved by the constructor
   */
  get url() {
    return this._ws ? this._ws.url : "";
  }
  /**
   * Whether the websocket object is now in reconnectable state
   */
  get shouldReconnect() {
    return this._shouldReconnect;
  }
  /**
   * An event listener to be called when the WebSocket connection's readyState changes to CLOSED
   */
  onclose = null;
  /**
   * An event listener to be called when an error occurs
   */
  onerror = null;
  /**
   * An event listener to be called when a message is received from the server
   */
  onmessage = null;
  /**
   * An event listener to be called when the WebSocket connection's readyState changes to OPEN;
   * this indicates that the connection is ready to send and receive data
   */
  onopen = null;
  /**
   * Closes the WebSocket connection or connection attempt, if any. If the connection is already
   * CLOSED or CLOSING, this method does nothing.
   *
   * The `close` event is dispatched synchronously (mirroring how
   * `reconnect()` dispatches its synthetic close). This guarantees
   * consumers observe a terminal event for every explicit close, even
   * if their listeners are detached right after this call — previously
   * the real (asynchronous) browser close event could fire after
   * listeners were removed and go unobserved entirely.
   */
  close(code = 1e3, reason) {
    this._closeCalled = true;
    this._shouldReconnect = false;
    this._clearTimeouts();
    if (!this._ws) {
      this._debug("close enqueued: no ws instance");
      return;
    }
    if (this._ws.readyState === this.CLOSED || this._ws.readyState === this.CLOSING) {
      this._debug("close: already closing or closed");
      return;
    }
    this._disconnect(code, reason);
  }
  /**
   * Closes the WebSocket connection or connection attempt and connects again.
   * Resets retry counter;
   */
  reconnect(code, reason) {
    this._shouldReconnect = true;
    this._closeCalled = false;
    this._didWarnAboutClosedSend = false;
    this._retryCount = -1;
    if (!this._ws || this._ws.readyState === this.CLOSED || this._ws.readyState === this.CLOSING)
      this._connect();
    else {
      this._disconnect(code, reason);
      this._connect();
    }
  }
  /**
   * Enqueue specified data to be transmitted to the server over the WebSocket connection.
   *
   * @returns `true` if the message was transmitted immediately over an open
   * connection; `false` if it was buffered (sent when the connection next
   * opens — the buffer is always flushed before the `open` event is
   * dispatched) or dropped because `maxEnqueuedMessages` was reached.
   */
  send(data) {
    if (this._ws && this._ws.readyState === this.OPEN) {
      this._debug("send", data);
      this._ws.send(data);
      return true;
    }
    if (this._closeCalled && !this._didWarnAboutClosedSend) {
      this._didWarnAboutClosedSend = true;
      console.warn(
        "ReconnectingWebSocket: send() was called after close(). The message has been buffered, but it will only be delivered if reconnect() is called on this socket. If this socket has been discarded, the message is lost — this usually means a stale socket reference is being used."
      );
    }
    const { maxEnqueuedMessages = DEFAULT.maxEnqueuedMessages } = this._options;
    if (this._messageQueue.length < maxEnqueuedMessages) {
      this._debug("enqueue", data);
      this._messageQueue.push(data);
    }
    return false;
  }
  /**
   * Removes and returns all messages that were passed to send() but never
   * transmitted (they were buffered while the connection wasn't open).
   *
   * Useful when a socket is being discarded and replaced (e.g. the React
   * hooks recreate the socket when connection options change): the
   * replacement socket can re-send these messages, instead of them being
   * silently lost with the old instance.
   */
  drainQueuedMessages() {
    const queue = this._messageQueue;
    this._messageQueue = [];
    return queue;
  }
  _debug(...args) {
    if (this._options.debug) this._debugLogger("RWS>", ...args);
  }
  _getNextDelay() {
    const {
      reconnectionDelayGrowFactor = DEFAULT.reconnectionDelayGrowFactor,
      minReconnectionDelay = DEFAULT.minReconnectionDelay,
      maxReconnectionDelay = DEFAULT.maxReconnectionDelay
    } = this._options;
    let delay = 0;
    if (this._retryCount > 0) {
      delay = minReconnectionDelay * reconnectionDelayGrowFactor ** (this._retryCount - 1);
      if (delay > maxReconnectionDelay) delay = maxReconnectionDelay;
    }
    this._debug("next delay", delay);
    return delay;
  }
  _wait() {
    return new Promise((resolve) => {
      setTimeout(resolve, this._getNextDelay());
    });
  }
  _getNextProtocols(protocolsProvider) {
    if (!protocolsProvider) return Promise.resolve(null);
    if (typeof protocolsProvider === "string" || Array.isArray(protocolsProvider))
      return Promise.resolve(protocolsProvider);
    if (typeof protocolsProvider === "function") {
      const protocols = protocolsProvider();
      if (!protocols) return Promise.resolve(null);
      if (typeof protocols === "string" || Array.isArray(protocols))
        return Promise.resolve(protocols);
      if (protocols.then) return protocols;
    }
    throw Error("Invalid protocols");
  }
  _getNextUrl(urlProvider) {
    if (typeof urlProvider === "string") return Promise.resolve(urlProvider);
    if (typeof urlProvider === "function") {
      const url = urlProvider();
      if (typeof url === "string") return Promise.resolve(url);
      if (url.then) return url;
    }
    throw Error("Invalid URL");
  }
  _connect() {
    if (this._connectLock || !this._shouldReconnect) return;
    this._connectLock = true;
    const {
      maxRetries = DEFAULT.maxRetries,
      connectionTimeout = DEFAULT.connectionTimeout
    } = this._options;
    if (this._retryCount >= maxRetries) {
      this._debug("max retries reached", this._retryCount, ">=", maxRetries);
      this._connectLock = false;
      return;
    }
    this._retryCount++;
    this._debug("connect", this._retryCount);
    this._removeListeners();
    this._wait().then(
      () => Promise.all([
        this._getNextUrl(this._url),
        this._getNextProtocols(this._protocols || null)
      ])
    ).then(([url, protocols]) => {
      if (this._closeCalled) {
        this._connectLock = false;
        return;
      }
      if (!this._options.WebSocket && typeof WebSocket === "undefined" && !didWarnAboutMissingWebSocket) {
        console.error(`‼️ No WebSocket implementation available. You should define options.WebSocket. 

For example, if you're using node.js, run \`npm install ws\`, and then in your code:

import PartySocket from 'partysocket';
import WS from 'ws';

const partysocket = new PartySocket({
  host: "127.0.0.1:1999",
  room: "test-room",
  WebSocket: WS
});

`);
        didWarnAboutMissingWebSocket = true;
      }
      const WS = this._options.WebSocket || WebSocket;
      this._debug("connect", {
        url,
        protocols
      });
      this._ws = protocols ? new WS(url, protocols) : new WS(url);
      this._ws.binaryType = this._binaryType;
      this._connectLock = false;
      this._addListeners();
      this._connectTimeout = setTimeout(
        () => this._handleTimeout(),
        connectionTimeout
      );
    }).catch((err) => {
      this._connectLock = false;
      this._handleError(new Events.ErrorEvent(Error(err.message), this));
    });
  }
  _handleTimeout() {
    this._debug("timeout event");
    this._handleError(new Events.ErrorEvent(Error("TIMEOUT"), this));
  }
  _disconnect(code = 1e3, reason) {
    this._clearTimeouts();
    if (!this._ws) return;
    this._removeListeners();
    try {
      if (this._ws.readyState === this.OPEN || this._ws.readyState === this.CONNECTING)
        this._ws.close(code, reason);
      this._handleClose(new Events.CloseEvent(code, reason, this));
    } catch (_error) {
    }
  }
  _acceptOpen() {
    this._debug("accept open");
    this._retryCount = 0;
  }
  _handleOpen = (event) => {
    this._debug("open event");
    const { minUptime = DEFAULT.minUptime } = this._options;
    clearTimeout(this._connectTimeout);
    this._uptimeTimeout = setTimeout(() => this._acceptOpen(), minUptime);
    assert(this._ws, "WebSocket is not defined");
    this._ws.binaryType = this._binaryType;
    this._messageQueue.forEach((message) => {
      this._ws?.send(message);
    });
    this._messageQueue = [];
    if (this.onopen) this.onopen(event);
    this.dispatchEvent(cloneEvent(event));
  };
  _handleMessage = (event) => {
    this._debug("message event");
    if (this.onmessage) this.onmessage(event);
    this.dispatchEvent(cloneEvent(event));
  };
  _handleError = (event) => {
    this._debug("error event", event.message);
    this._disconnect(void 0, event.message === "TIMEOUT" ? "timeout" : void 0);
    if (this.onerror) this.onerror(event);
    this._debug("exec error listeners");
    this.dispatchEvent(cloneEvent(event));
    this._connect();
  };
  _handleClose = (event) => {
    this._debug("close event");
    this._clearTimeouts();
    if (this._options.shouldReconnectOnClose && !this._options.shouldReconnectOnClose(event))
      this._shouldReconnect = false;
    if (this._shouldReconnect) this._connect();
    if (this.onclose) this.onclose(event);
    this.dispatchEvent(cloneEvent(event));
  };
  _removeListeners() {
    if (!this._ws) return;
    this._debug("removeListeners");
    this._ws.removeEventListener("open", this._handleOpen);
    this._ws.removeEventListener("close", this._handleClose);
    this._ws.removeEventListener("message", this._handleMessage);
    this._ws.removeEventListener("error", this._handleError);
    this._ws.addEventListener("error", absorbError);
  }
  _addListeners() {
    if (!this._ws) return;
    this._debug("addListeners");
    this._ws.addEventListener("open", this._handleOpen);
    this._ws.addEventListener("close", this._handleClose);
    this._ws.addEventListener("message", this._handleMessage);
    this._ws.addEventListener("error", this._handleError);
  }
  _clearTimeouts() {
    clearTimeout(this._connectTimeout);
    clearTimeout(this._uptimeTimeout);
  }
};
const valueIsNotNil = (keyValuePair) => keyValuePair[1] !== null && keyValuePair[1] !== void 0;
function generateUUID() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  let d = Date.now();
  let d2 = performance?.now && performance.now() * 1e3 || 0;
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : r & 3 | 8).toString(16);
  });
}
function getPartyInfo(partySocketOptions, defaultProtocol, defaultParams = {}) {
  const {
    host: rawHost,
    path: rawPath,
    protocol: rawProtocol,
    room,
    party,
    basePath,
    prefix,
    query
  } = partySocketOptions;
  let host = rawHost.replace(/^(http|https|ws|wss):\/\//, "");
  if (host.endsWith("/")) host = host.slice(0, -1);
  if (rawPath?.startsWith("/"))
    throw new Error("path must not start with a slash");
  const name = party ?? "main";
  const path = rawPath ? `/${rawPath}` : "";
  const protocol = rawProtocol || (host.startsWith("localhost:") || host.startsWith("127.0.0.1:") || host.startsWith("192.168.") || host.startsWith("10.") || host.startsWith("172.") && host.split(".")[1] >= "16" && host.split(".")[1] <= "31" || host.startsWith("[::ffff:7f00:1]:") ? defaultProtocol : `${defaultProtocol}s`);
  const baseUrl = `${protocol}://${host}/${basePath || `${prefix || "parties"}/${name}/${room}`}${path}`;
  const makeUrl = (query2 = {}) => `${baseUrl}?${new URLSearchParams([...Object.entries(defaultParams), ...Object.entries(query2).filter(valueIsNotNil)])}`;
  const urlProvider = typeof query === "function" ? async () => makeUrl(await query()) : makeUrl(query);
  return {
    host,
    path,
    room,
    name,
    protocol,
    partyUrl: baseUrl,
    urlProvider
  };
}
var PartySocket = class extends ReconnectingWebSocket {
  _pk;
  _pkurl;
  name;
  room;
  host;
  path;
  basePath;
  constructor(partySocketOptions) {
    const wsOptions = getWSOptions(partySocketOptions);
    super(wsOptions.urlProvider, wsOptions.protocols, wsOptions.socketOptions);
    this.partySocketOptions = partySocketOptions;
    this.setWSProperties(wsOptions);
    if (!partySocketOptions.startClosed && !this.room && !this.basePath) {
      this.close();
      throw new Error(
        "Either room or basePath must be provided to connect. Use startClosed: true to create a socket and set them via updateProperties before calling reconnect()."
      );
    }
    if (!partySocketOptions.disableNameValidation) {
      if (partySocketOptions.party?.includes("/"))
        console.warn(
          `PartySocket: party name "${partySocketOptions.party}" contains forward slash which may cause routing issues. Consider using a name without forward slashes or set disableNameValidation: true to bypass this warning.`
        );
      if (partySocketOptions.room?.includes("/"))
        console.warn(
          `PartySocket: room name "${partySocketOptions.room}" contains forward slash which may cause routing issues. Consider using a name without forward slashes or set disableNameValidation: true to bypass this warning.`
        );
    }
  }
  updateProperties(partySocketOptions) {
    const wsOptions = getWSOptions({
      ...this.partySocketOptions,
      ...partySocketOptions,
      host: partySocketOptions.host ?? this.host,
      room: partySocketOptions.room ?? this.room,
      path: partySocketOptions.path ?? this.path,
      basePath: partySocketOptions.basePath ?? this.basePath
    });
    this._url = wsOptions.urlProvider;
    this._protocols = wsOptions.protocols;
    this._options = wsOptions.socketOptions;
    this.setWSProperties(wsOptions);
  }
  setWSProperties(wsOptions) {
    const { _pk, _pkurl, name, room, host, path, basePath } = wsOptions;
    this._pk = _pk;
    this._pkurl = _pkurl;
    this.name = name;
    this.room = room;
    this.host = host;
    this.path = path;
    this.basePath = basePath;
  }
  reconnect(code, reason) {
    if (!this.host)
      throw new Error(
        "The host must be set before connecting, use `updateProperties` method to set it or pass it to the constructor."
      );
    if (!this.room && !this.basePath)
      throw new Error(
        "The room (or basePath) must be set before connecting, use `updateProperties` method to set it or pass it to the constructor."
      );
    super.reconnect(code, reason);
  }
  get id() {
    return this._pk;
  }
  /**
   * Exposes the static PartyKit room URL without applying query parameters.
   * To access the currently connected WebSocket url, use PartySocket#url.
   */
  get roomUrl() {
    return this._pkurl;
  }
  static async fetch(options, init) {
    const party = getPartyInfo(options, "http");
    const url = typeof party.urlProvider === "string" ? party.urlProvider : await party.urlProvider();
    return (options.fetch ?? fetch)(url, init);
  }
};
function getWSOptions(partySocketOptions) {
  const {
    id,
    host: _host,
    path: _path,
    party: _party,
    room: _room,
    protocol: _protocol,
    query: _query,
    protocols,
    ...socketOptions
  } = partySocketOptions;
  const _pk = id || generateUUID();
  const party = getPartyInfo(partySocketOptions, "ws", { _pk });
  return {
    _pk,
    _pkurl: party.partyUrl,
    name: party.name,
    room: party.room,
    host: party.host,
    path: party.path,
    basePath: partySocketOptions.basePath,
    protocols,
    socketOptions,
    urlProvider: party.urlProvider
  };
}
var AgentConnectionError = class extends Error {
  constructor(event) {
    const reason = event.reason || `WebSocket closed with code ${event.code}`;
    super(`Agent connection closed: ${reason}`);
    this.name = "AgentConnectionError";
    this.code = event.code;
    this.reason = event.reason;
    this.wasClean = event.wasClean;
  }
};
function isTerminalCloseEvent(event) {
  return event.code === 1008 || event.code >= 4e3 && event.code <= 4999;
}
function createStubProxy(call) {
  return new Proxy({}, { get: (_target, method) => {
    if (isInternalJsStubProp(method)) return;
    return (...args) => call(method, args);
  } });
}
const useAttachWebSocketEventHandlers = (socket, options) => {
  const handlersRef = useRef(options);
  handlersRef.current = options;
  useEffect(() => {
    const onOpen = (event) => handlersRef.current?.onOpen?.(event);
    const onMessage = (event) => handlersRef.current?.onMessage?.(event);
    const onClose = (event) => handlersRef.current?.onClose?.(event);
    const onError = (event) => handlersRef.current?.onError?.(event);
    socket.addEventListener("open", onOpen);
    socket.addEventListener("close", onClose);
    socket.addEventListener("error", onError);
    socket.addEventListener("message", onMessage);
    return () => {
      socket.removeEventListener("open", onOpen);
      socket.removeEventListener("close", onClose);
      socket.removeEventListener("error", onError);
      socket.removeEventListener("message", onMessage);
    };
  }, [socket]);
};
const getOptionsThatShouldCauseRestartWhenChanged = (options) => [
  options.startClosed,
  options.minUptime,
  options.maxRetries,
  options.connectionTimeout,
  options.maxEnqueuedMessages,
  options.maxReconnectionDelay,
  options.minReconnectionDelay,
  options.reconnectionDelayGrowFactor,
  options.debug
];
function useStableSocket({
  options,
  createSocket,
  createSocketMemoKey: createOptionsMemoKey,
  createSocketDestinationKey
}) {
  const { enabled = true } = options;
  const socketOptions = useMemo(() => {
    return options;
  }, [createOptionsMemoKey(options)]);
  const [socket, setSocket] = useState(
    () => createSocket({
      ...socketOptions,
      startClosed: true
    })
  );
  const socketInitializedRef = useRef(null);
  const createSocketRef = useRef(createSocket);
  createSocketRef.current = createSocket;
  const prevEnabledRef = useRef(enabled);
  const prevSocketOptionsRef = useRef(socketOptions);
  const optionsChangedWhileDisabledRef = useRef(false);
  const socketCreatedWithOptionsRef = useRef(socketOptions);
  const createReplacementSocket = (oldSocket) => {
    const newSocket = createSocketRef.current({
      ...socketOptions,
      startClosed: true
    });
    const queued = oldSocket.drainQueuedMessages();
    if (queued.length > 0) {
      const sameDestination = createSocketDestinationKey ? createSocketDestinationKey(socketCreatedWithOptionsRef.current) === createSocketDestinationKey(socketOptions) : false;
      if (socketOptions.transferEnqueuedMessages ?? sameDestination)
        for (const message of queued) newSocket.send(message);
      else
        console.warn(
          `PartySocket: discarded ${queued.length} buffered message(s) while replacing the socket, because the connection destination changed. Pass transferEnqueuedMessages: true to deliver buffered messages to the new destination instead.`
        );
    }
    socketCreatedWithOptionsRef.current = socketOptions;
    return newSocket;
  };
  const createReplacementSocketRef = useRef(createReplacementSocket);
  createReplacementSocketRef.current = createReplacementSocket;
  useEffect(() => {
    const optionsChanged = prevSocketOptionsRef.current !== socketOptions;
    prevSocketOptionsRef.current = socketOptions;
    if (!enabled) {
      socket.close();
      prevEnabledRef.current = enabled;
      if (optionsChanged) optionsChangedWhileDisabledRef.current = true;
      return () => {
        socket.close();
      };
    }
    if (!prevEnabledRef.current && enabled) {
      prevEnabledRef.current = enabled;
      const needsNewSocket = optionsChanged || optionsChangedWhileDisabledRef.current;
      optionsChangedWhileDisabledRef.current = false;
      if (!needsNewSocket) {
        socket.reconnect();
        return () => {
          socket.close();
        };
      }
      const newSocket = createReplacementSocketRef.current(socket);
      setSocket(newSocket);
      return () => {
        newSocket.close();
      };
    }
    prevEnabledRef.current = enabled;
    if (socketInitializedRef.current === socket)
      if (optionsChanged) {
        const newSocket = createReplacementSocketRef.current(socket);
        setSocket(newSocket);
        return () => {
          newSocket.close();
        };
      } else {
        if (socketOptions.startClosed !== true) socket.reconnect();
        return () => {
          socket.close();
        };
      }
    else {
      if (!socketInitializedRef.current) {
        if (socketOptions.startClosed !== true) socket.reconnect();
      } else if (socketInitializedRef.current !== socket) socket.reconnect();
      socketInitializedRef.current = socket;
      return () => {
        socket.close();
      };
    }
  }, [socket, socketOptions, enabled]);
  return socket;
}
function usePartySocket(options) {
  const { host, ...otherOptions } = options;
  const socket = useStableSocket({
    options: {
      host: host || (typeof window !== "undefined" ? window.location.host : "dummy-domain.com"),
      ...otherOptions
    },
    createSocket: (options2) => new PartySocket(options2),
    createSocketMemoKey: (options2) => JSON.stringify([
      options2.query,
      options2.id,
      options2.host,
      options2.room,
      options2.party,
      options2.path,
      options2.protocol,
      options2.protocols,
      options2.basePath,
      options2.prefix,
      ...getOptionsThatShouldCauseRestartWhenChanged(options2)
    ]),
    createSocketDestinationKey: (options2) => JSON.stringify([
      options2.host,
      options2.room,
      options2.party,
      options2.path,
      options2.protocol,
      options2.protocols,
      options2.basePath,
      options2.prefix
    ])
  });
  useAttachWebSocketEventHandlers(socket, options);
  return socket;
}
const queryCache = /* @__PURE__ */ new Map();
function createCacheKey(agentNamespace, name, subChainOrDeps, deps) {
  if (deps === void 0) return JSON.stringify([
    agentNamespace,
    name || "default",
    ...subChainOrDeps
  ]);
  const subChain = subChainOrDeps;
  if (subChain.length === 0) return JSON.stringify([
    agentNamespace,
    name || "default",
    ...deps
  ]);
  return JSON.stringify([
    agentNamespace,
    name || "default",
    subChain.map((s) => [s.agent, s.name]),
    ...deps
  ]);
}
function buildSubPath(subChain, extraPath) {
  if (subChain.length === 0) return extraPath ?? "";
  const combined = subChain.flatMap((step) => [
    "sub",
    camelCaseToKebabCase(step.agent),
    encodeURIComponent(step.name)
  ]).join("/");
  if (extraPath) return `${combined}/${extraPath.startsWith("/") ? extraPath.slice(1) : extraPath}`;
  return combined;
}
function getCacheEntry(key) {
  const entry = queryCache.get(key);
  if (!entry) return void 0;
  if (Date.now() >= entry.expiresAt) {
    queryCache.delete(key);
    return;
  }
  return entry;
}
function setCacheEntry(key, promise, cacheTtl) {
  const entry = {
    promise,
    expiresAt: Date.now() + cacheTtl
  };
  queryCache.set(key, entry);
  return entry;
}
function deleteCacheEntry(key) {
  queryCache.delete(key);
}
function useAgent(options) {
  const agentNamespace = camelCaseToKebabCase(options.agent);
  const { query, queryDeps, cacheTtl, sub: subOption, path: userPath, defaultCallTimeout, onConnectionError, shouldReconnectOnClose, ...restOptions } = options;
  const subChain = useMemo(() => (subOption ?? []).map((s) => ({
    agent: s.agent,
    name: s.name
  })), [JSON.stringify(subOption ?? [])]);
  const leafAgent = subChain.length > 0 ? subChain[subChain.length - 1].agent : options.agent;
  const leafName = subChain.length > 0 ? subChain[subChain.length - 1].name : options.name || "default";
  const fullPath = useMemo(() => [{
    agent: options.agent,
    name: options.name || "default"
  }, ...subChain], [
    options.agent,
    options.name,
    subChain
  ]);
  const pendingCallsRef = useRef(/* @__PURE__ */ new Map());
  const socketRef = useRef(null);
  const defaultCallTimeoutRef = useRef(defaultCallTimeout ?? 3e4);
  defaultCallTimeoutRef.current = defaultCallTimeout ?? 3e4;
  const rejectCallsSentOn = (socket, reason) => {
    const error = new Error(reason);
    for (const [id, pending] of pendingCallsRef.current) if (pending.sentOn === socket) {
      if (pending.timeoutId) clearTimeout(pending.timeoutId);
      pendingCallsRef.current.delete(id);
      pending.reject(error);
      pending.stream?.onError?.(reason);
    }
  };
  const flushQueuedCalls = () => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== socket.OPEN) return;
    for (const pending of pendingCallsRef.current.values()) if (pending.sentOn === null) {
      socket.send(pending.request);
      pending.sentOn = socket;
    }
  };
  const rejectQueuedCalls = (reason) => {
    const error = new Error(reason);
    for (const [id, pending] of pendingCallsRef.current) if (pending.sentOn === null) {
      if (pending.timeoutId) clearTimeout(pending.timeoutId);
      pendingCallsRef.current.delete(id);
      pending.reject(error);
      pending.stream?.onError?.(reason);
    }
  };
  const cacheKey = useMemo(() => createCacheKey(agentNamespace, options.name, subChain, queryDeps || []), [
    agentNamespace,
    options.name,
    subChain,
    queryDeps
  ]);
  const cacheKeyRef = useRef(cacheKey);
  cacheKeyRef.current = cacheKey;
  const ttl = cacheTtl ?? 300 * 1e3;
  const [cacheInvalidatedAt, setCacheInvalidatedAt] = useState(0);
  const isAsyncQuery = query && typeof query === "function";
  const [awaitingQueryRefresh, setAwaitingQueryRefresh] = useState(false);
  const queryPromise = useMemo(() => {
    if (!query || typeof query !== "function") return null;
    const cached = getCacheEntry(cacheKey);
    if (cached) return cached.promise;
    const promise = query().catch((error) => {
      console.error(`[useAgent] Query failed for agent "${options.agent}":`, error);
      deleteCacheEntry(cacheKey);
      throw error;
    });
    setCacheEntry(cacheKey, promise, ttl);
    return promise;
  }, [
    cacheKey,
    query,
    options.agent,
    ttl,
    cacheInvalidatedAt
  ]);
  useEffect(() => {
    if (!queryPromise || ttl <= 0) return;
    const entry = getCacheEntry(cacheKey);
    if (!entry) return;
    const timeUntilExpiry = entry.expiresAt - Date.now();
    const timer = setTimeout(() => {
      deleteCacheEntry(cacheKey);
      setCacheInvalidatedAt(Date.now());
    }, Math.max(0, timeUntilExpiry));
    return () => clearTimeout(timer);
  }, [
    cacheKey,
    queryPromise,
    ttl
  ]);
  let resolvedQuery;
  if (query) if (typeof query === "function") {
    const queryResult = use(queryPromise);
    if (queryResult) {
      for (const [key, value] of Object.entries(queryResult)) if (value !== null && value !== void 0 && typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") console.warn(`[useAgent] Query parameter "${key}" is an object and will be converted to "[object Object]". Query parameters should be string, number, boolean, or null.`);
      resolvedQuery = queryResult;
    }
  } else resolvedQuery = query;
  useEffect(() => {
    if (awaitingQueryRefresh && resolvedQuery !== void 0) setAwaitingQueryRefresh(false);
  }, [awaitingQueryRefresh, resolvedQuery]);
  const [agentState, setAgentState] = useState(void 0);
  const [connectionError, setConnectionError] = useState(null);
  const connectionErrorRef = useRef(null);
  const connectionErrorAddressKeyRef = useRef(null);
  const shouldReconnectOnCloseRef = useRef(shouldReconnectOnClose);
  shouldReconnectOnCloseRef.current = shouldReconnectOnClose;
  const classifyReconnect = useCallback((event) => (shouldReconnectOnCloseRef.current?.(event) ?? true) && !isTerminalCloseEvent(event), []);
  const [identity, setIdentity] = useState({
    name: leafName,
    agent: camelCaseToKebabCase(leafAgent),
    identified: false
  });
  const previousIdentityRef = useRef({
    name: null,
    agent: null
  });
  const readyRef = useRef(void 0);
  const resetReady = () => {
    let resolve;
    readyRef.current = {
      promise: new Promise((r) => {
        resolve = r;
      }),
      resolve
    };
  };
  if (!readyRef.current) resetReady();
  const mutableAgentRef = useRef(null);
  const combinedPath = useMemo(() => buildSubPath(subChain, userPath), [subChain, userPath]);
  const socketOptions = options.basePath ? {
    basePath: options.basePath,
    path: combinedPath || void 0,
    query: resolvedQuery,
    ...restOptions,
    shouldReconnectOnClose: classifyReconnect
  } : {
    party: agentNamespace,
    prefix: "agents",
    room: options.name || "default",
    path: combinedPath || void 0,
    query: resolvedQuery,
    ...restOptions,
    shouldReconnectOnClose: classifyReconnect
  };
  const socketEnabled = !awaitingQueryRefresh && (restOptions.enabled ?? true);
  const addressKey = JSON.stringify([
    options.host ?? null,
    options.basePath ?? null,
    agentNamespace,
    options.name || "default",
    combinedPath || null
  ]);
  const visibleConnectionError = connectionErrorAddressKeyRef.current === addressKey ? connectionError : null;
  connectionErrorRef.current = visibleConnectionError;
  const agent = usePartySocket({
    ...socketOptions,
    enabled: socketEnabled,
    onOpen: (event) => {
      connectionErrorAddressKeyRef.current = null;
      setConnectionError(null);
      flushQueuedCalls();
      options.onOpen?.(event);
    },
    onMessage: (message) => {
      if (typeof message.data === "string") {
        let parsedMessage;
        try {
          parsedMessage = JSON.parse(message.data);
        } catch (_error) {
          return options.onMessage?.(message);
        }
        if (parsedMessage.type === "cf_agent_identity") {
          const oldName = previousIdentityRef.current.name;
          const oldAgent = previousIdentityRef.current.agent;
          const newName = parsedMessage.name;
          const newAgent = parsedMessage.agent;
          const currentAgent = mutableAgentRef.current;
          if (currentAgent) {
            currentAgent.name = newName;
            currentAgent.agent = newAgent;
            currentAgent.identified = true;
          }
          setIdentity({
            name: newName,
            agent: newAgent,
            identified: true
          });
          readyRef.current?.resolve();
          if (oldName !== null && oldAgent !== null && (oldName !== newName || oldAgent !== newAgent)) if (options.onIdentityChange) options.onIdentityChange(oldName, newName, oldAgent, newAgent);
          else {
            const agentChanged = oldAgent !== newAgent;
            const nameChanged = oldName !== newName;
            let changeDescription = "";
            if (agentChanged && nameChanged) changeDescription = `agent "${oldAgent}" → "${newAgent}", instance "${oldName}" → "${newName}"`;
            else if (agentChanged) changeDescription = `agent "${oldAgent}" → "${newAgent}"`;
            else changeDescription = `instance "${oldName}" → "${newName}"`;
            console.warn(`[agents] Identity changed on reconnect: ${changeDescription}. This can happen with server-side routing (e.g., basePath with getAgentByName) where the instance is determined by auth/session. Provide onIdentityChange callback to handle this explicitly, or ignore if this is expected for your routing pattern.`);
          }
          previousIdentityRef.current = {
            name: newName,
            agent: newAgent
          };
          options.onIdentity?.(newName, newAgent);
          return;
        }
        if (parsedMessage.type === "cf_agent_state") {
          setAgentState(parsedMessage.state);
          options.onStateUpdate?.(parsedMessage.state, "server");
          return;
        }
        if (parsedMessage.type === "cf_agent_state_error") {
          options.onStateUpdateError?.(parsedMessage.error);
          return;
        }
        if (parsedMessage.type === "cf_agent_mcp_servers") {
          options.onMcpUpdate?.(parsedMessage.mcp);
          return;
        }
        if (parsedMessage.type === "rpc") {
          const response = parsedMessage;
          const pending = pendingCallsRef.current.get(response.id);
          if (!pending) {
            console.warn(`[useAgent] Discarded an RPC response with no matching pending call (id "${response.id}"). The call likely timed out or was rejected when its connection closed before the response arrived.`);
            return;
          }
          if (!response.success) {
            if (pending.timeoutId) clearTimeout(pending.timeoutId);
            pending.reject(new Error(response.error));
            pendingCallsRef.current.delete(response.id);
            pending.stream?.onError?.(response.error);
            return;
          }
          if ("done" in response) if (response.done) {
            if (pending.timeoutId) clearTimeout(pending.timeoutId);
            pending.resolve(response.result);
            pendingCallsRef.current.delete(response.id);
            pending.stream?.onDone?.(response.result);
          } else pending.stream?.onChunk?.(response.result);
          else {
            if (pending.timeoutId) clearTimeout(pending.timeoutId);
            pending.resolve(response.result);
            pendingCallsRef.current.delete(response.id);
          }
          return;
        }
      }
      options.onMessage?.(message);
    },
    onClose: (event) => {
      const closedSocket = event.target ?? socketRef.current;
      const isCurrentSocket = closedSocket === socketRef.current;
      const terminalClose = isTerminalCloseEvent(event);
      if (closedSocket) {
        rejectCallsSentOn(closedSocket, "Connection closed");
        if (isCurrentSocket && !closedSocket.shouldReconnect) rejectQueuedCalls("Connection closed");
      }
      if (isCurrentSocket) {
        resetReady();
        if (mutableAgentRef.current) mutableAgentRef.current.identified = false;
        setIdentity((prev) => ({
          ...prev,
          identified: false
        }));
        if (closedSocket?.shouldReconnect) {
          if (isAsyncQuery) setAwaitingQueryRefresh(true);
          deleteCacheEntry(cacheKeyRef.current);
          setCacheInvalidatedAt(Date.now());
        }
        if (!closedSocket?.shouldReconnect && terminalClose) {
          const error = new AgentConnectionError(event);
          connectionErrorAddressKeyRef.current = addressKey;
          setConnectionError(error);
          onConnectionError?.(error);
        }
      }
      options.onClose?.(event);
    }
  });
  socketRef.current = agent;
  const prevSocketRef = useRef(null);
  const prevAddressKeyRef = useRef(addressKey);
  useEffect(() => {
    const prev = prevSocketRef.current;
    prevSocketRef.current = agent;
    const prevAddress = prevAddressKeyRef.current;
    prevAddressKeyRef.current = addressKey;
    if (prevAddress !== addressKey) {
      connectionErrorAddressKeyRef.current = null;
      setConnectionError(null);
      rejectQueuedCalls("Call discarded: the agent address changed before the request could be sent");
    }
    if (prev && prev !== agent) {
      rejectCallsSentOn(prev, "Connection closed");
      resetReady();
      if (mutableAgentRef.current) mutableAgentRef.current.identified = false;
      setIdentity((current) => current.identified ? {
        ...current,
        identified: false
      } : current);
    }
  }, [agent, addressKey]);
  const call = useCallback((method, args = [], options2) => {
    return new Promise((resolve, reject) => {
      const socket = socketRef.current;
      if (socket && connectionErrorRef.current && socket.readyState === socket.CLOSED) {
        reject(/* @__PURE__ */ new Error("Connection closed"));
        return;
      }
      const id = crypto.randomUUID();
      let timeoutId;
      const isLegacyFormat = options2 && ("onChunk" in options2 || "onDone" in options2 || "onError" in options2);
      const streamOptions = isLegacyFormat ? options2 : options2?.stream;
      const timeout = isLegacyFormat ? void 0 : options2?.timeout;
      const effectiveTimeout = timeout !== void 0 ? timeout : streamOptions ? void 0 : defaultCallTimeoutRef.current;
      if (effectiveTimeout) timeoutId = setTimeout(() => {
        const pending = pendingCallsRef.current.get(id);
        pendingCallsRef.current.delete(id);
        const errorMessage = `RPC call to ${method} timed out after ${effectiveTimeout}ms`;
        pending?.stream?.onError?.(errorMessage);
        reject(new Error(errorMessage));
      }, effectiveTimeout);
      const request = JSON.stringify({
        args,
        id,
        method,
        type: "rpc"
      });
      pendingCallsRef.current.set(id, {
        reject,
        resolve,
        stream: streamOptions,
        timeoutId,
        request,
        sentOn: null
      });
      if (socket && socket.readyState === socket.OPEN) {
        socket.send(request);
        const pending = pendingCallsRef.current.get(id);
        if (pending) pending.sentOn = socket;
      }
    });
  }, []);
  agent.setState = (newState) => {
    (socketRef.current ?? agent).send(JSON.stringify({
      state: newState,
      type: "cf_agent_state"
    }));
    setAgentState(newState);
    options.onStateUpdate?.(newState, "client");
  };
  agent.call = call;
  agent.agent = identity.agent;
  agent.name = identity.name;
  agent.path = fullPath;
  agent.identified = identity.identified;
  agent.ready = readyRef.current.promise;
  agent.state = agentState;
  agent.connectionError = visibleConnectionError;
  mutableAgentRef.current = agent;
  agent.stub = useMemo(() => createStubProxy(call), [call]);
  agent.getHttpUrl = () => {
    return (agent._url || agent._pkurl || "").replace("ws://", "http://").replace("wss://", "https://");
  };
  if (identity.agent !== identity.agent.toLowerCase()) console.warn("Agent name: " + identity.agent + " should probably be in lowercase. Received: " + identity.agent);
  return agent;
}
const RESUME_PROBE_TIMEOUT_MS = 5e3;
const RESUME_PENDING_TIMEOUT_MS = 6e4;
var WebSocketChatTransport = class {
  constructor(options) {
    this._resumeResolver = null;
    this._resumeNoneResolver = null;
    this._onStreamPending = null;
    this._retryResumeProbe = null;
    this._expectToolContinuation = false;
    this._abortToolContinuation = null;
    this._activeServerTurnId = null;
    this._cancelAttachedStream = null;
    this._detachResumeStream = null;
    this.agent = options.agent;
    this.prepareBody = options.prepareBody;
    this.activeRequestIds = options.activeRequestIds;
    this.cancelOnClientAbort = options.cancelOnClientAbort ?? false;
  }
  /**
  * Point the singleton transport at a new Agent connection. A pending resolver
  * belongs to the old Chat/socket generation and must settle before messages
  * from the replacement connection can be consumed (#1914 review).
  */
  setAgent(agent) {
    if (this.agent === agent) return;
    this.resetResumeState();
    this.agent = agent;
  }
  setCancelOnClientAbort(cancelOnClientAbort) {
    this.cancelOnClientAbort = cancelOnClientAbort;
  }
  /**
  * Explicitly cancel the active server turn, if any.
  * This is separate from generic client-side abort/cancel lifecycle so
  * clients can detach locally without stopping server work.
  */
  cancelActiveServerTurn() {
    const requestId = this._activeServerTurnId;
    let cancelledRequest = false;
    if (requestId) {
      this.sendCancelFrame(requestId);
      this._cancelAttachedStream?.();
      this.clearActiveServerTurn(requestId);
      cancelledRequest = true;
    }
    const cancelledToolContinuation = this.abortActiveToolContinuation();
    return cancelledRequest || cancelledToolContinuation;
  }
  sendCancelFrame(requestId) {
    try {
      this.agent.send(JSON.stringify({
        id: requestId,
        type: "cf_agent_chat_request_cancel"
      }));
    } catch {
    }
  }
  setActiveServerTurn(requestId, cancelAttachedStream) {
    this._activeServerTurnId = requestId;
    this._cancelAttachedStream = cancelAttachedStream;
  }
  clearActiveServerTurn(requestId) {
    if (this._activeServerTurnId === requestId) {
      this._activeServerTurnId = null;
      this._cancelAttachedStream = null;
    }
  }
  /**
  * Mark that the next reconnectToStream() call should attach to a
  * server-initiated tool continuation rather than a page-load resume.
  */
  expectToolContinuation() {
    this._expectToolContinuation = true;
  }
  /**
  * Abort the active client-side tool continuation stream, if one is attached
  * to a server request id.
  */
  abortActiveToolContinuation() {
    return this._abortToolContinuation?.() ?? false;
  }
  /**
  * True when the transport is waiting for a resume handshake.
  */
  isAwaitingResume() {
    return this._resumeResolver !== null || this._resumeNoneResolver !== null;
  }
  /**
  * Settle and detach the current handshake without interpreting it as a
  * server-idle response. Used when the owning hook/agent generation changes.
  */
  cancelPendingResume() {
    const resolveNone = this._resumeNoneResolver;
    if (!resolveNone) return false;
    return resolveNone({});
  }
  /**
  * Invalidate all client-side resume state for an obsolete hook/agent
  * generation without cancelling its durable server turn.
  */
  resetResumeState() {
    this._expectToolContinuation = false;
    this.cancelPendingResume();
    this._detachResumeStream?.();
  }
  /**
  * Re-send the active handshake request on the latest socket generation. This
  * preserves one AI SDK resume operation while recovering a request/reply lost
  * with the previous WebSocket.
  */
  retryPendingResume() {
    const retry = this._retryResumeProbe;
    if (!retry) return false;
    retry();
    return true;
  }
  /**
  * Called by onAgentMessage when it receives CF_AGENT_STREAM_RESUMING.
  * If reconnectToStream is waiting, this handles the resume handshake
  * (ACK + stream creation) and returns true. Otherwise returns false
  * so the caller can use its own fallback path.
  */
  handleStreamResuming(data) {
    if (!this._resumeResolver) return false;
    this._resumeResolver(data);
    return true;
  }
  /**
  * Called by onAgentMessage when it receives CF_AGENT_STREAM_RESUME_NONE.
  * If reconnectToStream is waiting, resolves the promise with null
  * immediately (no 5-second timeout). Returns true if handled.
  */
  handleStreamResumeNone(data = {}) {
    if (!this._resumeNoneResolver) return false;
    return this._resumeNoneResolver(data);
  }
  /**
  * Called by onAgentMessage when it receives CF_AGENT_STREAM_PENDING (#1784):
  * the server accepted a turn but its stream has not started yet. If a resume
  * path is awaiting, extend its probe timeout (so it keeps waiting for the
  * eventual STREAM_RESUMING / STREAM_RESUME_NONE instead of resolving null
  * after the short window). Returns true if a waiting path consumed it.
  */
  handleStreamPending() {
    if (!this._onStreamPending) return false;
    this._onStreamPending();
    return true;
  }
  /**
  * Called by the hook's shared message handler when a server turn finishes
  * outside the currently attached transport stream, such as after local-only
  * client cleanup.
  */
  handleServerTurnCompleted(requestId) {
    this.clearActiveServerTurn(requestId);
  }
  /**
  * Register a server turn that is being rendered outside a transport-owned
  * stream, such as the hook's fallback cross-tab/resume observer path.
  */
  observeServerTurn(requestId) {
    this.setActiveServerTurn(requestId, null);
  }
  async sendMessages(options) {
    const requestId = nanoid(8);
    const abortController = new AbortController();
    let completed = false;
    let requestSent = false;
    let extraBody = {};
    if (this.prepareBody) extraBody = await this.prepareBody({
      messages: options.messages,
      trigger: options.trigger,
      messageId: options.messageId
    });
    if (options.body) extraBody = {
      ...extraBody,
      ...options.body
    };
    const bodyPayload = JSON.stringify({
      messages: options.messages,
      trigger: options.trigger,
      ...extraBody
    });
    this.activeRequestIds?.add(requestId);
    const agent = this.agent;
    const activeIds = this.activeRequestIds;
    const finish = (action, keepId = false, clearServerTurn = true) => {
      if (completed) return;
      completed = true;
      if (clearServerTurn) this.clearActiveServerTurn(requestId);
      try {
        action();
      } catch {
      }
      if (!keepId) activeIds?.delete(requestId);
      abortController.abort();
    };
    const abortError = /* @__PURE__ */ new Error("Aborted");
    abortError.name = "AbortError";
    const cancelActiveRequest = () => {
      if (completed) return false;
      finish(() => streamController.error(abortError), true);
      return true;
    };
    this.setActiveServerTurn(requestId, cancelActiveRequest);
    const onAbort = () => {
      if (completed) return;
      if (this.cancelOnClientAbort) {
        if (requestSent) this.sendCancelFrame(requestId);
        finish(() => streamController.error(abortError), requestSent);
      } else finish(() => streamController.error(abortError), false, !requestSent);
    };
    let streamController;
    const stream = new ReadableStream({
      start(controller) {
        streamController = controller;
        const onMessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type !== "cf_agent_use_chat_response") return;
            if (data.id !== requestId) return;
            if (data.error) {
              finish(() => controller.error(new Error(data.body || "Stream error")));
              return;
            }
            if (data.body?.trim()) try {
              const chunk = JSON.parse(data.body);
              controller.enqueue(chunk);
            } catch {
            }
            if (data.done) finish(() => controller.close());
          } catch {
          }
        };
        const onClose = () => {
          finish(() => controller.close(), false, false);
        };
        agent.addEventListener("message", onMessage, { signal: abortController.signal });
        agent.addEventListener("close", onClose, { signal: abortController.signal });
      },
      cancel() {
        onAbort();
      }
    });
    if (options.abortSignal) {
      options.abortSignal.addEventListener("abort", onAbort, { once: true });
      if (options.abortSignal.aborted) onAbort();
    }
    if (completed) return stream;
    requestSent = true;
    agent.send(JSON.stringify({
      id: requestId,
      init: {
        method: "POST",
        body: bodyPayload
      },
      type: "cf_agent_use_chat_request"
    }));
    return stream;
  }
  async reconnectToStream(_options) {
    if (this.isAwaitingResume()) return null;
    if (this._expectToolContinuation) {
      this._expectToolContinuation = false;
      return this._createToolContinuationStream();
    }
    const activeIds = this.activeRequestIds;
    const probeId = nanoid(8);
    return new Promise((resolve) => {
      let resolved = false;
      let timeout;
      let resumeResolver = null;
      let resumeNoneResolver = null;
      let onStreamPending = null;
      let retryResumeProbe = null;
      const clearOwnedCallbacks = () => {
        if (resumeResolver && this._resumeResolver === resumeResolver) this._resumeResolver = null;
        if (resumeNoneResolver && this._resumeNoneResolver === resumeNoneResolver) this._resumeNoneResolver = null;
        if (onStreamPending && this._onStreamPending === onStreamPending) this._onStreamPending = null;
        if (retryResumeProbe && this._retryResumeProbe === retryResumeProbe) this._retryResumeProbe = null;
      };
      const done = (value) => {
        if (resolved) return;
        resolved = true;
        clearOwnedCallbacks();
        if (timeout) clearTimeout(timeout);
        resolve(value);
      };
      const armTimeout = (delay) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => done(null), delay);
      };
      onStreamPending = () => {
        if (resolved) return;
        armTimeout(RESUME_PENDING_TIMEOUT_MS);
      };
      resumeNoneResolver = (data) => {
        if (data.probeId && data.probeId !== probeId) return false;
        done(null);
        return true;
      };
      resumeResolver = (data) => {
        const requestId = data.id;
        activeIds?.add(requestId);
        const stream = this._createResumeStream(requestId);
        this.agent.send(JSON.stringify({
          type: "cf_agent_stream_resume_ack",
          id: requestId
        }));
        done(stream);
      };
      retryResumeProbe = () => {
        if (resolved) return;
        armTimeout(RESUME_PROBE_TIMEOUT_MS);
        try {
          this.agent.send(JSON.stringify({
            type: "cf_agent_stream_resume_request",
            probeId
          }));
        } catch {
        }
      };
      this._onStreamPending = onStreamPending;
      this._resumeNoneResolver = resumeNoneResolver;
      this._resumeResolver = resumeResolver;
      this._retryResumeProbe = retryResumeProbe;
      retryResumeProbe();
    });
  }
  /**
  * Creates a deferred ReadableStream for client-side tool continuations.
  * The stream is returned immediately so AI SDK status becomes "submitted"
  * right after addToolOutput()/addToolApprovalResponse(), then it waits for
  * the server to announce the continuation via STREAM_RESUMING.
  */
  _createToolContinuationStream() {
    const agent = this.agent;
    const activeIds = this.activeRequestIds;
    const streamController = new AbortController();
    const abortError = /* @__PURE__ */ new Error("Aborted");
    abortError.name = "AbortError";
    let completed = false;
    let requestId = null;
    let readerController = null;
    const probeId = nanoid(8);
    let onResumeRef = null;
    let onResumeNoneRef = null;
    let onStreamPendingRef = null;
    let retryResumeProbeRef = null;
    let abortToolContinuationRef = null;
    let detachResumeStreamRef = null;
    const clearOwnedHandshake = () => {
      if (onResumeRef && this._resumeResolver === onResumeRef) this._resumeResolver = null;
      if (onResumeNoneRef && this._resumeNoneResolver === onResumeNoneRef) this._resumeNoneResolver = null;
      if (onStreamPendingRef && this._onStreamPending === onStreamPendingRef) this._onStreamPending = null;
      if (retryResumeProbeRef && this._retryResumeProbe === retryResumeProbeRef) this._retryResumeProbe = null;
    };
    const finish = (action, keepRequestId = false) => {
      if (completed) return;
      completed = true;
      if (this._abortToolContinuation === abortToolContinuationRef) this._abortToolContinuation = null;
      if (this._detachResumeStream === detachResumeStreamRef) this._detachResumeStream = null;
      clearOwnedHandshake();
      try {
        action();
      } catch {
      }
      if (requestId && !keepRequestId) activeIds?.delete(requestId);
      streamController.abort();
    };
    const transport = this;
    abortToolContinuationRef = () => {
      if (completed) return false;
      if (requestId === null) {
        finish(() => readerController?.error(abortError));
        return true;
      }
      try {
        agent.send(JSON.stringify({
          type: "cf_agent_chat_request_cancel",
          id: requestId
        }));
      } catch {
      }
      finish(() => readerController?.error(abortError), true);
      return true;
    };
    this._abortToolContinuation = abortToolContinuationRef;
    detachResumeStreamRef = () => {
      if (completed) return false;
      finish(() => readerController?.close());
      return true;
    };
    this._detachResumeStream = detachResumeStreamRef;
    return new ReadableStream({
      start(controller) {
        readerController = controller;
        let timeout;
        const armTimeout = (delay) => {
          if (timeout) clearTimeout(timeout);
          timeout = setTimeout(() => finish(() => controller.close()), delay);
        };
        const onResumeNone = (data) => {
          if (data.probeId && data.probeId !== probeId) return false;
          finish(() => controller.close());
          return true;
        };
        const onResume = (data) => {
          if (requestId) return;
          requestId = data.id;
          activeIds?.add(requestId);
          clearOwnedHandshake();
          if (timeout) clearTimeout(timeout);
          agent.send(JSON.stringify({
            type: "cf_agent_stream_resume_ack",
            id: requestId
          }));
        };
        const onStreamPending = () => {
          if (completed) return;
          armTimeout(RESUME_PENDING_TIMEOUT_MS);
        };
        const retryResumeProbe = () => {
          if (completed || requestId !== null) return;
          armTimeout(RESUME_PROBE_TIMEOUT_MS);
          try {
            transport.agent.send(JSON.stringify({
              type: "cf_agent_stream_resume_request",
              probeId
            }));
          } catch {
          }
        };
        onResumeRef = onResume;
        onResumeNoneRef = onResumeNone;
        onStreamPendingRef = onStreamPending;
        retryResumeProbeRef = retryResumeProbe;
        transport._resumeResolver = onResume;
        transport._resumeNoneResolver = onResumeNone;
        transport._onStreamPending = onStreamPending;
        transport._retryResumeProbe = retryResumeProbe;
        const onMessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type !== "cf_agent_use_chat_response" || requestId == null || data.id !== requestId) return;
            if (data.error) {
              finish(() => controller.error(new Error(data.body || "Stream error")));
              return;
            }
            if (data.body?.trim()) try {
              const chunk = JSON.parse(data.body);
              controller.enqueue(chunk);
            } catch {
            }
            if (data.done) finish(() => controller.close());
          } catch {
          }
        };
        const onClose = () => finish(() => controller.close());
        agent.addEventListener("message", onMessage, { signal: streamController.signal });
        agent.addEventListener("close", onClose, { signal: streamController.signal });
        retryResumeProbe();
      },
      cancel() {
        if (requestId && transport.cancelOnClientAbort) {
          transport.sendCancelFrame(requestId);
          finish(() => {
          }, true);
        } else finish(() => {
        });
      }
    });
  }
  /**
  * Creates a ReadableStream that receives resumed stream chunks
  * and forwards them to useChat as UIMessageChunk objects.
  */
  _createResumeStream(requestId) {
    const agent = this.agent;
    const activeIds = this.activeRequestIds;
    const chunkController = new AbortController();
    const abortError = /* @__PURE__ */ new Error("Aborted");
    abortError.name = "AbortError";
    let completed = false;
    let detachResumeStream = null;
    const finish = (action, keepId = false, clearServerTurn = true) => {
      if (completed) return;
      completed = true;
      if (clearServerTurn) this.clearActiveServerTurn(requestId);
      if (this._detachResumeStream === detachResumeStream) this._detachResumeStream = null;
      try {
        action();
      } catch {
      }
      if (!keepId) activeIds?.delete(requestId);
      chunkController.abort();
    };
    let streamController = null;
    const cancelActiveRequest = () => {
      if (completed) return false;
      finish(() => streamController?.error(abortError), true);
      return true;
    };
    this.setActiveServerTurn(requestId, cancelActiveRequest);
    const transport = this;
    detachResumeStream = () => {
      if (completed) return false;
      finish(() => streamController?.close());
      return true;
    };
    this._detachResumeStream = detachResumeStream;
    return new ReadableStream({
      start(controller) {
        streamController = controller;
        const onMessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type !== "cf_agent_use_chat_response") return;
            if (data.id !== requestId) return;
            if (data.error) {
              finish(() => controller.error(new Error(data.body || "Stream error")));
              return;
            }
            if (data.body?.trim()) try {
              const chunk = JSON.parse(data.body);
              controller.enqueue(chunk);
            } catch {
            }
            if (data.done) finish(() => controller.close());
          } catch {
          }
        };
        const onClose = () => {
          finish(() => controller.close(), false, false);
        };
        agent.addEventListener("message", onMessage, { signal: chunkController.signal });
        agent.addEventListener("close", onClose, { signal: chunkController.signal });
      },
      cancel() {
        if (transport.cancelOnClientAbort) {
          transport.sendCancelFrame(requestId);
          finish(() => {
          }, true);
        } else finish(() => {
        }, false, false);
      }
    });
  }
};
const _deprecationWarnings = /* @__PURE__ */ new Set();
function warnDeprecated(id, message) {
  if (!_deprecationWarnings.has(id)) {
    _deprecationWarnings.add(id);
    console.warn(`[agents/chat] Deprecated: ${message}`);
  }
}
function extractClientToolSchemas(tools) {
  if (!tools) return void 0;
  const schemas = Object.entries(tools).filter(([_, tool]) => tool.execute).map(([name, tool]) => {
    if (tool.inputSchema && !tool.parameters) console.warn(`[useAgentChat] Tool "${name}" uses deprecated 'inputSchema'. Please migrate to 'parameters'.`);
    return {
      name,
      description: tool.description,
      parameters: tool.parameters ?? tool.inputSchema
    };
  });
  return schemas.length > 0 ? schemas : void 0;
}
const requestCache = /* @__PURE__ */ new Map();
function findLastAssistantMessage(messages) {
  for (let index = messages.length - 1; index >= 0; index--) {
    const message = messages[index];
    if (message.role === "assistant") return {
      index,
      message
    };
  }
  return null;
}
function moveMessageToEnd(messages, messageId) {
  const idx = messages.findIndex((m) => m.id === messageId);
  if (idx < 0 || idx === messages.length - 1) return messages;
  const result = [...messages];
  const [msg] = result.splice(idx, 1);
  if (!msg) return messages;
  result.push(msg);
  return result;
}
function prependMissingHydratedMessages(hydratedMessages, currentMessages) {
  if (currentMessages.length === 0) return hydratedMessages;
  const currentMessageIds = new Set(currentMessages.map((message) => message.id));
  const missingHydratedMessages = hydratedMessages.filter((message) => !currentMessageIds.has(message.id));
  if (missingHydratedMessages.length === 0) return currentMessages;
  return [...missingHydratedMessages, ...currentMessages];
}
function useAgentChat(options) {
  const { agent, getInitialMessages, messages: optionsInitialMessages, onToolCall, onData, experimental_automaticToolResolution, tools, toolsRequiringConfirmation: manualToolsRequiringConfirmation, autoContinueAfterToolResult = true, autoSendAfterAllConfirmationsResolved = true, resume = true, cancelOnClientAbort = false, syncMessagesToServer = true, body: bodyOption, prepareSendMessagesRequest, ...rest } = options;
  if (manualToolsRequiringConfirmation) warnDeprecated("useAgentChat.toolsRequiringConfirmation", "The 'toolsRequiringConfirmation' option is deprecated. Use needsApproval on server-side tools instead. Will be removed in the next major version.");
  if (experimental_automaticToolResolution) warnDeprecated("useAgentChat.experimental_automaticToolResolution", "The 'experimental_automaticToolResolution' option is deprecated. Use the onToolCall callback instead. Will be removed in the next major version.");
  if (options.autoSendAfterAllConfirmationsResolved !== void 0) warnDeprecated("useAgentChat.autoSendAfterAllConfirmationsResolved", "The 'autoSendAfterAllConfirmationsResolved' option is deprecated. Use sendAutomaticallyWhen from AI SDK instead. Will be removed in the next major version.");
  const toolsRequiringConfirmation = useMemo(() => {
    if (manualToolsRequiringConfirmation) return manualToolsRequiringConfirmation;
    if (!tools) return [];
    return Object.entries(tools).filter(([_name, tool]) => !tool.execute).map(([name]) => name);
  }, [manualToolsRequiringConfirmation, tools]);
  const onToolCallRef = useRef(onToolCall);
  onToolCallRef.current = onToolCall;
  const onDataRef = useRef(onData);
  onDataRef.current = onData;
  const rawHttpUrl = agent.getHttpUrl();
  const agentUrl = rawHttpUrl ? new URL(rawHttpUrl) : null;
  if (agentUrl) agentUrl.searchParams.delete("_pk");
  const agentUrlString = agentUrl?.toString() ?? null;
  const agentAddressKey = Array.isArray(agent.path) ? JSON.stringify(agent.path.map((step) => [step.agent, step.name])) : JSON.stringify([[agent.agent ?? "", agent.name ?? ""]]);
  const resolvedInitialMessagesCacheKey = agentUrl ? `${agentUrl.origin}${agentUrl.pathname}|${agentAddressKey}` : null;
  const initialMessagesCacheKey = agentAddressKey;
  const stableChatIdRef = useRef(null);
  const previousAgentRef = useRef(null);
  const previousAgentAddressKeyRef = useRef(null);
  const fallbackChatId = agentAddressKey;
  const agentPathChanged = Array.isArray(agent.path) && previousAgentAddressKeyRef.current !== null && previousAgentAddressKeyRef.current !== agentAddressKey;
  if (stableChatIdRef.current === null) stableChatIdRef.current = resolvedInitialMessagesCacheKey ?? fallbackChatId;
  else if (previousAgentRef.current !== agent || agentPathChanged) stableChatIdRef.current = resolvedInitialMessagesCacheKey ?? fallbackChatId;
  previousAgentRef.current = agent;
  previousAgentAddressKeyRef.current = agentAddressKey;
  const agentRef = useRef(agent);
  agentRef.current = agent;
  async function defaultGetInitialMessagesFetch({ url }) {
    if (!url) return [];
    const getMessagesUrl = new URL(url);
    getMessagesUrl.pathname += "/get-messages";
    const response = await fetch(getMessagesUrl.toString(), {
      credentials: options.credentials,
      headers: options.headers
    });
    if (!response.ok) {
      console.warn(`Failed to fetch initial messages: ${response.status} ${response.statusText}`);
      return [];
    }
    const text = await response.text();
    if (!text.trim()) return [];
    try {
      return JSON.parse(text);
    } catch (error) {
      console.warn("Failed to parse initial messages JSON:", error);
      return [];
    }
  }
  const getInitialMessagesFetch = getInitialMessages || defaultGetInitialMessagesFetch;
  function doGetInitialMessages(getInitialMessagesOptions, cacheKey) {
    if (requestCache.has(cacheKey)) return requestCache.get(cacheKey);
    const promise = getInitialMessagesFetch(getInitialMessagesOptions);
    requestCache.set(cacheKey, promise);
    return promise;
  }
  const initialMessagesPromise = !(getInitialMessages === null ? false : getInitialMessages ? true : !!agentUrlString) ? null : doGetInitialMessages({
    agent: agent.agent,
    name: agent.name,
    url: agentUrlString ?? void 0
  }, initialMessagesCacheKey);
  const initialMessages = initialMessagesPromise ? use(initialMessagesPromise) : optionsInitialMessages ?? [];
  useEffect(() => {
    if (!initialMessagesPromise) return;
    requestCache.set(initialMessagesCacheKey, initialMessagesPromise);
    return () => {
      if (requestCache.get(initialMessagesCacheKey) === initialMessagesPromise) requestCache.delete(initialMessagesCacheKey);
    };
  }, [initialMessagesCacheKey, initialMessagesPromise]);
  const toolsRef = useRef(tools);
  toolsRef.current = tools;
  const prepareSendMessagesRequestRef = useRef(prepareSendMessagesRequest);
  prepareSendMessagesRequestRef.current = prepareSendMessagesRequest;
  const bodyOptionRef = useRef(bodyOption);
  bodyOptionRef.current = bodyOption;
  const localRequestIdsRef = useRef(/* @__PURE__ */ new Set());
  const pendingReplayResumeRequestIdsRef = useRef(/* @__PURE__ */ new Set());
  const replayHydratedAssistantMessageIdsRef = useRef(/* @__PURE__ */ new Set());
  const fallbackAckedResumeRequestIdsRef = useRef(/* @__PURE__ */ new Set());
  const customTransportRef = useRef(null);
  if (customTransportRef.current === null) customTransportRef.current = new WebSocketChatTransport({
    agent: agentRef.current,
    activeRequestIds: localRequestIdsRef.current,
    cancelOnClientAbort,
    prepareBody: async ({ messages: msgs, trigger, messageId }) => {
      let extraBody = {};
      const currentBody = bodyOptionRef.current;
      if (currentBody) extraBody = { ...typeof currentBody === "function" ? await currentBody() : currentBody };
      if (toolsRef.current) {
        const clientToolSchemas = extractClientToolSchemas(toolsRef.current);
        if (clientToolSchemas) extraBody.clientTools = clientToolSchemas;
      }
      if (prepareSendMessagesRequestRef.current) {
        const userResult = await prepareSendMessagesRequestRef.current({
          id: agentRef.current._pk,
          messages: msgs,
          trigger,
          messageId
        });
        if (userResult.body) Object.assign(extraBody, userResult.body);
      }
      return extraBody;
    }
  });
  customTransportRef.current.setAgent(agentRef.current);
  customTransportRef.current.setCancelOnClientAbort(cancelOnClientAbort);
  const customTransport = customTransportRef.current;
  const useChatHelpers = useChat({
    ...rest,
    onData,
    messages: initialMessages,
    transport: customTransport,
    id: stableChatIdRef.current,
    resume: false
  });
  const { messages: chatMessages, setMessages, addToolResult, addToolApprovalResponse, sendMessage, resumeStream: rawResumeStream, status, stop } = useChatHelpers;
  const statusRef = useRef(status);
  statusRef.current = status;
  const resumeGenerationRef = useRef(0);
  const resumeOperationRef = useRef(null);
  const reconnectProbePendingRef = useRef(false);
  const reconnectProbeRunnerRef = useRef(null);
  const invalidateResumeGeneration = useCallback(() => {
    resumeGenerationRef.current++;
    resumeOperationRef.current = null;
  }, []);
  const resumeStream = useCallback((...args) => {
    const active = resumeOperationRef.current;
    if (active) return active.promise;
    const operation = {
      generation: resumeGenerationRef.current,
      promise: Promise.resolve()
    };
    resumeOperationRef.current = operation;
    operation.promise = rawResumeStream(...args).finally(() => {
      if (resumeOperationRef.current !== operation || resumeGenerationRef.current !== operation.generation) return;
      resumeOperationRef.current = null;
      reconnectProbeRunnerRef.current?.();
    });
    return operation.promise;
  }, [rawResumeStream]);
  const resumeStreamRef = useRef(resumeStream);
  resumeStreamRef.current = resumeStream;
  const resumingToolContinuationRef = useRef(false);
  const pendingToolContinuationRef = useRef(false);
  const observedToolContinuationRequestIdRef = useRef(null);
  const continuationLaunchTimerRef = useRef(null);
  const continuationGenerationRef = useRef(0);
  const [isToolContinuation, setIsToolContinuation] = useState(false);
  const resetToolContinuation = useCallback(() => {
    continuationGenerationRef.current++;
    pendingToolContinuationRef.current = false;
    resumingToolContinuationRef.current = false;
    observedToolContinuationRequestIdRef.current = null;
    if (continuationLaunchTimerRef.current) {
      clearTimeout(continuationLaunchTimerRef.current);
      continuationLaunchTimerRef.current = null;
    }
    setIsToolContinuation(false);
  }, []);
  const scheduleToolContinuationLaunch = useCallback(() => {
    if (!pendingToolContinuationRef.current || statusRef.current !== "ready" || continuationLaunchTimerRef.current) return;
    const timer = setTimeout(() => {
      (async () => {
        while (resumeOperationRef.current) await resumeOperationRef.current.promise.catch(() => {
        });
        if (continuationLaunchTimerRef.current === timer) continuationLaunchTimerRef.current = null;
        if (!pendingToolContinuationRef.current || statusRef.current !== "ready") return;
        pendingToolContinuationRef.current = false;
        const myGeneration = continuationGenerationRef.current;
        customTransport.expectToolContinuation();
        await resumeStream().catch((error) => {
          console.error("[useAgentChat] Tool continuation resume failed:", error);
        }).finally(() => {
          if (continuationGenerationRef.current !== myGeneration) return;
          resumingToolContinuationRef.current = false;
          setIsToolContinuation(false);
        });
      })();
    }, 0);
    continuationLaunchTimerRef.current = timer;
  }, [customTransport, resumeStream]);
  const startToolContinuation = useCallback(() => {
    if (!autoContinueAfterToolResult || resumingToolContinuationRef.current) return;
    ++continuationGenerationRef.current;
    resumingToolContinuationRef.current = true;
    pendingToolContinuationRef.current = true;
    setIsToolContinuation(true);
    scheduleToolContinuationLaunch();
  }, [autoContinueAfterToolResult, scheduleToolContinuationLaunch]);
  useEffect(() => {
    if (status === "error" && pendingToolContinuationRef.current) {
      resetToolContinuation();
      return;
    }
    scheduleToolContinuationLaunch();
  }, [
    resetToolContinuation,
    scheduleToolContinuationLaunch,
    status
  ]);
  const stopWithToolContinuationAbort = useCallback(async () => {
    try {
      customTransport.cancelActiveServerTurn();
      await stop();
    } finally {
      customTransport.abortActiveToolContinuation();
    }
  }, [stop, customTransport]);
  const processedToolCalls = useRef(/* @__PURE__ */ new Set());
  const isResolvingToolsRef = useRef(false);
  const [toolResolutionTrigger, setToolResolutionTrigger] = useState(0);
  const [clientToolResults, setClientToolResults] = useState(/* @__PURE__ */ new Map());
  const messagesRef = useRef(chatMessages);
  messagesRef.current = chatMessages;
  const initialMessagesRef = useRef(initialMessages);
  initialMessagesRef.current = initialMessages;
  const seededInitialMessagesKeyRef = useRef(null);
  const markInitialMessagesSeeded = useCallback(() => {
    seededInitialMessagesKeyRef.current = initialMessagesCacheKey;
  }, [initialMessagesCacheKey]);
  useEffect(() => {
    if (!initialMessagesPromise) return;
    if (seededInitialMessagesKeyRef.current === initialMessagesCacheKey) return;
    markInitialMessagesSeeded();
    setMessages((prevMessages) => prependMissingHydratedMessages(initialMessagesRef.current, prevMessages));
  }, [
    initialMessagesCacheKey,
    initialMessagesPromise,
    markInitialMessagesSeeded,
    setMessages
  ]);
  const localResponseMessageIdsRef = useRef(/* @__PURE__ */ new Map());
  const protectedStreamingAssistantRef = useRef(null);
  const preserveProtectedStreamingAssistant = useCallback((messages) => {
    const protection = protectedStreamingAssistantRef.current;
    if (!protection) return [...messages];
    const protectedIndex = messages.findIndex((message) => message.id === protection.assistantId);
    if (protectedIndex >= 0 && messages.slice(protectedIndex + 1).some((message) => message.role === "assistant")) {
      protectedStreamingAssistantRef.current = null;
      return [...messages];
    }
    const protectedAssistant = messagesRef.current.find((message) => message.id === protection.assistantId) ?? messages.find((message) => message.id === protection.assistantId);
    if (!protectedAssistant) return [...messages];
    return [...messages.filter((message) => message.id !== protection.assistantId), protectedAssistant];
  }, []);
  const protectStreamingAssistantTail = useCallback(() => {
    if (statusRef.current !== "streaming") return;
    const assistantInfo = findLastAssistantMessage(messagesRef.current);
    if (!assistantInfo) return;
    if (protectedStreamingAssistantRef.current?.assistantId !== assistantInfo.message.id) protectedStreamingAssistantRef.current = {
      assistantId: assistantInfo.message.id,
      anchorMessageId: messagesRef.current[assistantInfo.index - 1]?.id ?? null
    };
    setMessages((prevMessages) => {
      const protection = protectedStreamingAssistantRef.current;
      if (!protection) return prevMessages;
      return moveMessageToEnd(prevMessages, protection.assistantId);
    });
  }, [setMessages]);
  const restoreProtectedStreamingAssistant = useCallback((assistantId) => {
    const protection = protectedStreamingAssistantRef.current;
    if (!protection || assistantId !== void 0 && protection.assistantId !== assistantId) return;
    protectedStreamingAssistantRef.current = null;
    setMessages((prevMessages) => {
      const sourceIdx = prevMessages.findIndex((m) => m.id === protection.assistantId);
      if (sourceIdx < 0) return prevMessages;
      const result = [...prevMessages];
      const [msg] = result.splice(sourceIdx, 1);
      if (!msg) return prevMessages;
      if (protection.anchorMessageId === null) result.unshift(msg);
      else {
        const anchorIdx = result.findIndex((m) => m.id === protection.anchorMessageId);
        result.splice(anchorIdx >= 0 ? anchorIdx + 1 : sourceIdx, 0, msg);
      }
      return result;
    });
  }, [setMessages]);
  const resetMatchingHydratedAssistantForReplay = useCallback((messageId) => {
    setMessages((prevMessages) => {
      const lastMessage2 = prevMessages[prevMessages.length - 1];
      if (!lastMessage2 || lastMessage2.role !== "assistant" || lastMessage2.id !== messageId) return prevMessages;
      replayHydratedAssistantMessageIdsRef.current.add(messageId);
      const next = [...prevMessages];
      next[next.length - 1] = {
        ...lastMessage2,
        parts: []
      };
      return next;
    });
  }, [setMessages]);
  const collapseHydratedReplayTextParts = useCallback((message) => {
    const parts = message.parts;
    const nextParts = parts.filter((part, index) => {
      if (part.type !== "text" || !("text" in part) || !part.text) return true;
      return !parts.some((candidate, candidateIndex) => {
        if (candidateIndex <= index) return false;
        if (candidate.type !== "text" || !("text" in candidate) || !candidate.text) return false;
        return candidate.text.startsWith(part.text);
      });
    });
    return nextParts.length === parts.length ? message : {
      ...message,
      parts: nextParts
    };
  }, []);
  useEffect(() => {
    if (replayHydratedAssistantMessageIdsRef.current.size === 0) return;
    const idsToCollapse = new Set(chatMessages.filter((message) => replayHydratedAssistantMessageIdsRef.current.has(message.id) && message.role === "assistant" && collapseHydratedReplayTextParts(message) !== message).map((message) => message.id));
    if (idsToCollapse.size === 0) return;
    setMessages((prevMessages) => {
      let changed = false;
      const nextMessages = prevMessages.map((message) => {
        if (!idsToCollapse.has(message.id)) return message;
        const nextMessage = collapseHydratedReplayTextParts(message);
        if (nextMessage !== message) changed = true;
        return nextMessage;
      });
      return changed ? nextMessages : prevMessages;
    });
  }, [
    chatMessages,
    collapseHydratedReplayTextParts,
    setMessages
  ]);
  const resetLocalChatState = useCallback(() => {
    markInitialMessagesSeeded();
    setMessages([]);
    setClientToolResults(/* @__PURE__ */ new Map());
    setPendingOnToolCallIds(/* @__PURE__ */ new Set());
    resetToolContinuation();
    processedToolCalls.current.clear();
    localResponseMessageIdsRef.current.clear();
    pendingReplayResumeRequestIdsRef.current.clear();
    fallbackAckedResumeRequestIdsRef.current.clear();
    replayHydratedAssistantMessageIdsRef.current.clear();
    protectedStreamingAssistantRef.current = null;
  }, [
    markInitialMessagesSeeded,
    setMessages,
    resetToolContinuation
  ]);
  const sendMessageWithStreamingProtection = useCallback(async (message, options2) => {
    const request = sendMessage(message, options2);
    if (message !== void 0 && !(typeof message === "object" && message !== null && "messageId" in message && message.messageId != null)) protectStreamingAssistantTail();
    return request;
  }, [sendMessage, protectStreamingAssistantTail]);
  const lastMessage = chatMessages[chatMessages.length - 1];
  const pendingConfirmations = (() => {
    if (!lastMessage || lastMessage.role !== "assistant") return {
      messageId: void 0,
      toolCallIds: /* @__PURE__ */ new Set()
    };
    const pendingIds = /* @__PURE__ */ new Set();
    for (const part of lastMessage.parts ?? []) if (isToolUIPart(part) && part.state === "input-available" && toolsRequiringConfirmation.includes(getToolName(part))) pendingIds.add(part.toolCallId);
    return {
      messageId: lastMessage.id,
      toolCallIds: pendingIds
    };
  })();
  const pendingConfirmationsRef = useRef(pendingConfirmations);
  pendingConfirmationsRef.current = pendingConfirmations;
  const [pendingOnToolCallIds, setPendingOnToolCallIds] = useState(() => /* @__PURE__ */ new Set());
  const finishOnToolCall = useCallback((toolCallId) => {
    setPendingOnToolCallIds((prev) => {
      if (!prev.has(toolCallId)) return prev;
      const next = new Set(prev);
      next.delete(toolCallId);
      return next;
    });
  }, []);
  useEffect(() => {
    if (!experimental_automaticToolResolution) return;
    if (isResolvingToolsRef.current) return;
    const lastMsg = chatMessages[chatMessages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant") return;
    const toolCalls = lastMsg.parts.filter((part) => isToolUIPart(part) && part.state === "input-available" && !processedToolCalls.current.has(part.toolCallId));
    if (toolCalls.length > 0) {
      const currentTools = toolsRef.current;
      const toolCallsToResolve = toolCalls.filter((part) => isToolUIPart(part) && !toolsRequiringConfirmation.includes(getToolName(part)) && currentTools?.[getToolName(part)]?.execute);
      if (toolCallsToResolve.length > 0) {
        isResolvingToolsRef.current = true;
        (async () => {
          try {
            const toolResults = [];
            for (const part of toolCallsToResolve) if (isToolUIPart(part)) {
              let toolOutput = null;
              const toolName = getToolName(part);
              const tool = currentTools?.[toolName];
              if (tool?.execute && part.input !== void 0) try {
                toolOutput = await tool.execute(part.input);
              } catch (error) {
                toolOutput = `Error executing tool: ${error instanceof Error ? error.message : String(error)}`;
              }
              processedToolCalls.current.add(part.toolCallId);
              toolResults.push({
                toolCallId: part.toolCallId,
                toolName,
                output: toolOutput
              });
            }
            if (toolResults.length > 0) {
              const clientToolSchemas = extractClientToolSchemas(currentTools);
              for (const result of toolResults) agentRef.current.send(JSON.stringify({
                type: "cf_agent_tool_result",
                toolCallId: result.toolCallId,
                toolName: result.toolName,
                output: result.output,
                autoContinue: autoContinueAfterToolResult,
                clientTools: clientToolSchemas
              }));
              await Promise.all(toolResults.map((result) => addToolResult({
                tool: result.toolName,
                toolCallId: result.toolCallId,
                output: result.output
              })));
              setClientToolResults((prev) => {
                const newMap = new Map(prev);
                for (const result of toolResults) newMap.set(result.toolCallId, result.output);
                return newMap;
              });
              startToolContinuation();
            }
          } finally {
            isResolvingToolsRef.current = false;
            setToolResolutionTrigger((c) => c + 1);
          }
        })();
      }
    }
  }, [
    chatMessages,
    experimental_automaticToolResolution,
    addToolResult,
    toolsRequiringConfirmation,
    autoContinueAfterToolResult,
    startToolContinuation,
    toolResolutionTrigger
  ]);
  const sendToolOutputToServer = useCallback((toolCallId, toolName, output, state, errorText) => {
    const shouldAutoContinue = state === "output-error" ? false : autoContinueAfterToolResult;
    agentRef.current.send(JSON.stringify({
      type: "cf_agent_tool_result",
      toolCallId,
      toolName,
      output,
      ...state ? { state } : {},
      ...errorText !== void 0 ? { errorText } : {},
      autoContinue: shouldAutoContinue,
      clientTools: toolsRef.current ? extractClientToolSchemas(toolsRef.current) : void 0
    }));
    if (state !== "output-error") setClientToolResults((prev) => new Map(prev).set(toolCallId, output));
    if (shouldAutoContinue) startToolContinuation();
  }, [autoContinueAfterToolResult, startToolContinuation]);
  const sendToolApprovalToServer = useCallback((toolCallId, approved) => {
    agentRef.current.send(JSON.stringify({
      type: "cf_agent_tool_approval",
      toolCallId,
      approved,
      autoContinue: autoContinueAfterToolResult
    }));
    if (autoContinueAfterToolResult) startToolContinuation();
  }, [autoContinueAfterToolResult, startToolContinuation]);
  useEffect(() => {
    const currentOnToolCall = onToolCallRef.current;
    if (!currentOnToolCall) return;
    const lastMsg = chatMessages[chatMessages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant") return;
    const pendingToolCalls = lastMsg.parts.filter((part) => isToolUIPart(part) && part.state === "input-available" && !processedToolCalls.current.has(part.toolCallId));
    for (const part of pendingToolCalls) if (isToolUIPart(part)) {
      const toolCallId = part.toolCallId;
      const toolName = getToolName(part);
      processedToolCalls.current.add(toolCallId);
      setPendingOnToolCallIds((prev) => {
        if (prev.has(toolCallId)) return prev;
        const next = new Set(prev);
        next.add(toolCallId);
        return next;
      });
      const addToolOutput2 = (opts) => {
        sendToolOutputToServer(opts.toolCallId, toolName, opts.output, opts.state, opts.errorText);
        addToolResult({
          tool: toolName,
          toolCallId: opts.toolCallId,
          output: opts.state === "output-error" ? opts.errorText ?? "Tool execution denied by user" : opts.output
        });
      };
      let result;
      try {
        result = currentOnToolCall({
          toolCall: {
            toolCallId,
            toolName,
            input: part.input
          },
          addToolOutput: addToolOutput2
        });
      } catch (error) {
        finishOnToolCall(toolCallId);
        throw error;
      }
      Promise.resolve(result).finally(() => {
        finishOnToolCall(toolCallId);
      });
    }
  }, [
    chatMessages,
    sendToolOutputToServer,
    addToolResult,
    finishOnToolCall
  ]);
  const streamStateRef = useRef({ status: "idle" });
  const [isServerStreaming, setIsServerStreaming] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  useEffect(() => {
    const localResponseIds = localResponseMessageIdsRef.current;
    function onAgentMessage(event) {
      if (typeof event.data !== "string") return;
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (_error) {
        return;
      }
      switch (data.type) {
        case "cf_agent_chat_clear":
          streamStateRef.current = transition(streamStateRef.current, { type: "clear" }).state;
          setIsServerStreaming(false);
          setIsRecovering(false);
          resetLocalChatState();
          break;
        case "cf_agent_chat_recovering":
          setIsRecovering(Boolean(data.recovering));
          break;
        case "cf_agent_chat_messages": {
          let next = preserveProtectedStreamingAssistant(data.messages);
          const observed = streamStateRef.current;
          if (observed.status === "observing" && observed.accumulator.parts.length > 0) {
            const snapshotIdx = next.findIndex((m) => m.id === observed.accumulator.messageId);
            const snapshotParts = snapshotIdx >= 0 ? next[snapshotIdx].parts.length : 0;
            if (observed.accumulator.parts.length >= snapshotParts) next = observed.accumulator.mergeInto(next);
          }
          setMessages(next);
          break;
        }
        case "cf_agent_message_updated":
          setMessages((prevMessages) => {
            const updatedMessage = data.message;
            let idx = prevMessages.findIndex((m) => m.id === updatedMessage.id);
            if (idx < 0) {
              const updatedToolCallIds = new Set(updatedMessage.parts.filter((p) => "toolCallId" in p && p.toolCallId).map((p) => p.toolCallId));
              if (updatedToolCallIds.size > 0) idx = prevMessages.findIndex((m) => m.parts.some((p) => "toolCallId" in p && updatedToolCallIds.has(p.toolCallId)));
            }
            if (idx >= 0) {
              const updated = [...prevMessages];
              updated[idx] = {
                ...updatedMessage,
                id: prevMessages[idx].id
              };
              return updated;
            }
            return prevMessages;
          });
          break;
        case "cf_agent_stream_resume_none":
          if (customTransport.handleStreamResumeNone(data) && data.reason === STREAM_RESUME_NONE_REASONS.IDLE && typeof data.probeId === "string") {
            const result = transition(streamStateRef.current, { type: "clear" });
            streamStateRef.current = result.state;
            setIsServerStreaming(result.isStreaming);
            if (observedToolContinuationRequestIdRef.current !== null) resetToolContinuation();
          }
          break;
        case "cf_agent_stream_pending":
          customTransport.handleStreamPending();
          break;
        case "cf_agent_stream_resuming": {
          const isEarlyToolContinuation = resumingToolContinuationRef.current && !customTransport.isAwaitingResume();
          if (!resume && !customTransport.isAwaitingResume()) {
            if (!isEarlyToolContinuation) return;
          }
          if (!resumingToolContinuationRef.current) pendingReplayResumeRequestIdsRef.current.add(data.id);
          if (customTransport.handleStreamResuming(data)) return;
          if (localRequestIdsRef.current.has(data.id)) return;
          if (fallbackAckedResumeRequestIdsRef.current.has(data.id)) return;
          if (isEarlyToolContinuation) {
            pendingToolContinuationRef.current = false;
            observedToolContinuationRequestIdRef.current = data.id;
            if (continuationLaunchTimerRef.current) {
              clearTimeout(continuationLaunchTimerRef.current);
              continuationLaunchTimerRef.current = null;
            }
          }
          streamStateRef.current = transition(streamStateRef.current, {
            type: "resume-fallback",
            streamId: data.id,
            messageId: nanoid()
          }).state;
          customTransport.observeServerTurn(data.id);
          setIsServerStreaming(true);
          setIsRecovering(false);
          fallbackAckedResumeRequestIdsRef.current.add(data.id);
          agentRef.current.send(JSON.stringify({
            type: "cf_agent_stream_resume_ack",
            id: data.id
          }));
          break;
        }
        case "cf_agent_use_chat_response": {
          if (localRequestIdsRef.current.has(data.id)) {
            if (data.body?.trim()) try {
              const chunkData2 = JSON.parse(data.body);
              if (chunkData2.type === "start" && typeof chunkData2.messageId === "string") {
                localResponseIds.set(data.id, chunkData2.messageId);
                if (!data.continuation) {
                  if (protectedStreamingAssistantRef.current?.assistantId !== chunkData2.messageId) {
                    const msgs = messagesRef.current;
                    const idx = msgs.findIndex((m) => m.id === chunkData2.messageId);
                    const anchorMessageId = idx >= 0 ? msgs[idx - 1]?.id ?? null : msgs[msgs.length - 1]?.id ?? null;
                    protectedStreamingAssistantRef.current = {
                      assistantId: chunkData2.messageId,
                      anchorMessageId
                    };
                  }
                }
                if (data.replay && !data.continuation && !resumingToolContinuationRef.current && observedToolContinuationRequestIdRef.current !== data.id) {
                  pendingReplayResumeRequestIdsRef.current.delete(data.id);
                  resetMatchingHydratedAssistantForReplay(chunkData2.messageId);
                }
              }
            } catch {
            }
            if (data.done || data.replayComplete) pendingReplayResumeRequestIdsRef.current.delete(data.id);
            if (data.done) {
              if (streamStateRef.current.status === "observing" && streamStateRef.current.streamId === data.id) {
                streamStateRef.current = { status: "idle" };
                setIsServerStreaming(false);
              }
              customTransport.handleServerTurnCompleted(data.id);
              restoreProtectedStreamingAssistant(localResponseIds.get(data.id));
              localResponseIds.delete(data.id);
              localRequestIdsRef.current.delete(data.id);
              fallbackAckedResumeRequestIdsRef.current.delete(data.id);
              if (observedToolContinuationRequestIdRef.current === data.id) resetToolContinuation();
            }
            return;
          }
          let chunkData;
          if (data.replay && streamStateRef.current.status !== "observing" && !pendingReplayResumeRequestIdsRef.current.has(data.id)) return;
          if (data.body?.trim()) try {
            chunkData = JSON.parse(data.body);
            if (data.replay && !data.continuation && !resumingToolContinuationRef.current && observedToolContinuationRequestIdRef.current !== data.id && typeof chunkData.messageId === "string" && chunkData.type === "start") {
              pendingReplayResumeRequestIdsRef.current.delete(data.id);
              resetMatchingHydratedAssistantForReplay(chunkData.messageId);
            }
            if (typeof chunkData.type === "string" && chunkData.type.startsWith("data-") && onDataRef.current) onDataRef.current(chunkData);
          } catch (parseError) {
            console.warn("[useAgentChat] Failed to parse stream chunk:", parseError instanceof Error ? parseError.message : parseError, "body:", data.body?.slice(0, 100));
          }
          if (data.done || data.replayComplete) pendingReplayResumeRequestIdsRef.current.delete(data.id);
          if (data.done) {
            customTransport.handleServerTurnCompleted(data.id);
            fallbackAckedResumeRequestIdsRef.current.delete(data.id);
            setIsRecovering(false);
          }
          const completedObservedToolContinuation = data.done && observedToolContinuationRequestIdRef.current === data.id;
          const result = transition(streamStateRef.current, {
            type: "response",
            streamId: data.id,
            messageId: nanoid(),
            chunkData,
            done: data.done,
            error: data.error,
            replay: data.replay,
            replayComplete: data.replayComplete,
            continuation: data.continuation,
            currentMessages: data.continuation ? messagesRef.current : void 0
          });
          streamStateRef.current = result.state;
          if (result.messagesUpdate) setMessages(result.messagesUpdate);
          setIsServerStreaming(result.isStreaming);
          if (completedObservedToolContinuation) resetToolContinuation();
          break;
        }
      }
    }
    const fallbackAckedResumeRequestIds = fallbackAckedResumeRequestIdsRef.current;
    let socketIsOpen = false;
    let sawClose = false;
    let disposed = false;
    const clearFallbackObserver = () => {
      const result = transition(streamStateRef.current, { type: "clear" });
      streamStateRef.current = result.state;
      setIsServerStreaming(result.isStreaming);
      if (observedToolContinuationRequestIdRef.current !== null) resetToolContinuation();
    };
    const tryPendingReconnectProbe = () => {
      if (disposed || !socketIsOpen || !reconnectProbePendingRef.current) return;
      if (!resume) {
        reconnectProbePendingRef.current = false;
        return;
      }
      if (customTransport.retryPendingResume()) {
        reconnectProbePendingRef.current = false;
        return;
      }
      const canReconcileObservedContinuation = observedToolContinuationRequestIdRef.current !== null;
      if (statusRef.current !== "ready" && statusRef.current !== "error" || resumingToolContinuationRef.current && !canReconcileObservedContinuation || resumeOperationRef.current !== null) return;
      reconnectProbePendingRef.current = false;
      resumeStreamRef.current().catch(() => {
      });
    };
    reconnectProbeRunnerRef.current = tryPendingReconnectProbe;
    function onAgentClose() {
      socketIsOpen = false;
      sawClose = true;
      fallbackAckedResumeRequestIds.clear();
      if (!resume) clearFallbackObserver();
    }
    function onAgentOpen() {
      socketIsOpen = true;
      if (!sawClose) return;
      sawClose = false;
      reconnectProbePendingRef.current = true;
      tryPendingReconnectProbe();
    }
    agent.addEventListener("message", onAgentMessage);
    agent.addEventListener("close", onAgentClose);
    agent.addEventListener("open", onAgentOpen);
    return () => {
      disposed = true;
      if (reconnectProbeRunnerRef.current === tryPendingReconnectProbe) reconnectProbeRunnerRef.current = null;
      reconnectProbePendingRef.current = false;
      agent.removeEventListener("message", onAgentMessage);
      agent.removeEventListener("close", onAgentClose);
      agent.removeEventListener("open", onAgentOpen);
      fallbackAckedResumeRequestIds.clear();
      streamStateRef.current = { status: "idle" };
      setIsServerStreaming(false);
      setIsRecovering(false);
      protectedStreamingAssistantRef.current = null;
      localResponseIds.clear();
      customTransport.resetResumeState();
      invalidateResumeGeneration();
    };
  }, [
    agent,
    setMessages,
    resume,
    customTransport,
    preserveProtectedStreamingAssistant,
    resetToolContinuation,
    resetMatchingHydratedAssistantForReplay,
    restoreProtectedStreamingAssistant,
    resetLocalChatState,
    invalidateResumeGeneration
  ]);
  useEffect(() => {
    if (!resume) return;
    resumeStream().catch(() => {
    });
  }, [resume, resumeStream]);
  useEffect(() => {
    reconnectProbeRunnerRef.current?.();
  }, [isToolContinuation, status]);
  const addToolResultAndSendMessage = async (args) => {
    const { toolCallId } = args;
    const toolName = "tool" in args ? args.tool : "";
    const output = "output" in args ? args.output : void 0;
    agentRef.current.send(JSON.stringify({
      type: "cf_agent_tool_result",
      toolCallId,
      toolName,
      output,
      autoContinue: autoContinueAfterToolResult,
      clientTools: toolsRef.current ? extractClientToolSchemas(toolsRef.current) : void 0
    }));
    setClientToolResults((prev) => new Map(prev).set(toolCallId, output));
    addToolResult(args);
    if (autoContinueAfterToolResult) startToolContinuation();
    if (!autoContinueAfterToolResult) {
      if (!autoSendAfterAllConfirmationsResolved) {
        sendMessage();
        return;
      }
      const pending = pendingConfirmationsRef.current?.toolCallIds;
      if (!pending) {
        sendMessage();
        return;
      }
      const wasLast = pending.size === 1 && pending.has(toolCallId);
      if (pending.has(toolCallId)) pending.delete(toolCallId);
      if (wasLast || pending.size === 0) sendMessage();
    }
  };
  const addToolApprovalResponseAndNotifyServer = (args) => {
    const { id: approvalId, approved } = args;
    let toolCallId;
    for (const msg of messagesRef.current) {
      for (const part of msg.parts) if ("toolCallId" in part && "approval" in part && part.approval?.id === approvalId) {
        toolCallId = part.toolCallId;
        break;
      }
      if (toolCallId) break;
    }
    if (toolCallId) sendToolApprovalToServer(toolCallId, approved);
    else console.warn(`[useAgentChat] addToolApprovalResponse: Could not find toolCallId for approval ID "${approvalId}". Server will not be notified, which may cause duplicate messages.`);
    addToolApprovalResponse(args);
  };
  const messagesWithToolResults = useMemo(() => {
    if (clientToolResults.size === 0) return chatMessages;
    return chatMessages.map((msg) => ({
      ...msg,
      parts: msg.parts.map((p) => {
        if (!("toolCallId" in p) || !("state" in p) || p.state !== "input-available" || !clientToolResults.has(p.toolCallId)) return p;
        return {
          ...p,
          state: "output-available",
          output: clientToolResults.get(p.toolCallId)
        };
      })
    }));
  }, [chatMessages, clientToolResults]);
  useEffect(() => {
    const currentToolCallIds = /* @__PURE__ */ new Set();
    for (const msg of chatMessages) for (const part of msg.parts) if ("toolCallId" in part && part.toolCallId) currentToolCallIds.add(part.toolCallId);
    setClientToolResults((prev) => {
      if (prev.size === 0) return prev;
      let hasStaleEntries = false;
      for (const toolCallId of prev.keys()) if (!currentToolCallIds.has(toolCallId)) {
        hasStaleEntries = true;
        break;
      }
      if (!hasStaleEntries) return prev;
      const newMap = /* @__PURE__ */ new Map();
      for (const [id, output] of prev) if (currentToolCallIds.has(id)) newMap.set(id, output);
      return newMap;
    });
    for (const toolCallId of processedToolCalls.current) if (!currentToolCallIds.has(toolCallId)) processedToolCalls.current.delete(toolCallId);
  }, [chatMessages]);
  const addToolOutput = useCallback((opts) => {
    const toolName = opts.toolName ?? "";
    sendToolOutputToServer(opts.toolCallId, toolName, opts.output, opts.state, opts.errorText);
    addToolResult({
      tool: toolName,
      toolCallId: opts.toolCallId,
      output: opts.state === "output-error" ? opts.errorText ?? "Tool execution denied by user" : opts.output
    });
  }, [sendToolOutputToServer, addToolResult]);
  const lastAssistantMessage = messagesWithToolResults[messagesWithToolResults.length - 1];
  const hasPendingClientToolCalls = (() => {
    if (pendingOnToolCallIds.size === 0 && !tools) return false;
    if (!lastAssistantMessage || lastAssistantMessage.role !== "assistant") return false;
    for (const part of lastAssistantMessage.parts) {
      if (!isToolUIPart(part)) continue;
      if (part.state !== "input-available") continue;
      const toolName = getToolName(part);
      if (toolsRequiringConfirmation.includes(toolName)) continue;
      if (pendingOnToolCallIds.has(part.toolCallId)) return true;
      if (tools?.[toolName]?.execute) return true;
    }
    return false;
  })();
  const effectiveIsServerStreaming = isServerStreaming || hasPendingClientToolCalls;
  const isStreaming = status === "streaming" || effectiveIsServerStreaming;
  return {
    ...useChatHelpers,
    resumeStream,
    messages: messagesWithToolResults,
    isServerStreaming: effectiveIsServerStreaming,
    isStreaming,
    /**
    * True while a durable chat turn is being recovered (interrupted by a
    * deploy/eviction or a stream-stall watchdog abort and now resuming, #1620).
    * Distinct from `isStreaming` — a recovering turn isn't producing tokens
    * yet. Render a "recovering…" hint; most UIs treat `isStreaming ||
    * isRecovering` as "busy". Cleared automatically on the next stream/terminal.
    */
    isRecovering,
    isToolContinuation,
    connectionError: agent.connectionError ?? null,
    sendMessage: sendMessageWithStreamingProtection,
    stop: stopWithToolContinuationAbort,
    /**
    * Provide output for a tool call. Use this for tools that require user interaction
    * or client-side execution.
    */
    addToolOutput,
    /**
    * @deprecated Use `addToolOutput` instead.
    */
    addToolResult: addToolResultAndSendMessage,
    /**
    * Respond to a tool approval request. Use this for tools with `needsApproval`.
    * This wrapper notifies the server before updating local state, preventing
    * duplicate messages when sendMessage() is called afterward.
    */
    addToolApprovalResponse: addToolApprovalResponseAndNotifyServer,
    clearHistory: () => {
      resetLocalChatState();
      agent.send(JSON.stringify({ type: "cf_agent_chat_clear" }));
    },
    setMessages: (messagesOrUpdater) => {
      let resolvedMessages;
      if (typeof messagesOrUpdater === "function") resolvedMessages = messagesOrUpdater(messagesRef.current);
      else resolvedMessages = messagesOrUpdater;
      if (resolvedMessages.length === 0) markInitialMessagesSeeded();
      setMessages(resolvedMessages);
      if (syncMessagesToServer) agent.send(JSON.stringify({
        messages: resolvedMessages,
        type: "cf_agent_chat_messages"
      }));
    }
  };
}
function humanizeToolLabel(partType) {
  const name = partType.replace(/^tool-/, "").replace(/_/g, " ");
  const label = name.charAt(0).toUpperCase() + name.slice(1);
  return { running: label, done: label };
}
function skillNameFromPart(part) {
  if (part.type !== "tool-activate_skill" || !("input" in part)) return null;
  const input = part.input;
  return typeof input === "object" && input !== null && "name" in input && typeof input.name === "string" ? input.name : null;
}
function messageHasVisibleContent(message) {
  return message.parts.some(
    (part) => part.type === "text" && part.text.trim().length > 0 || part.type === "reasoning" && part.text.trim().length > 0 || part.type.startsWith("tool-")
  );
}
function messageText(message) {
  return message.parts.filter(
    (part) => part.type === "text"
  ).map((part) => part.text).join("\n").trim();
}
function CopyButton({ message }) {
  const [copied, setCopied] = useState(false);
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      "aria-label": "Copy message",
      title: "Copy",
      className: "btn btn-ghost btn-xs btn-square text-base-content/40 hover:text-base-content",
      onClick: () => {
        void navigator.clipboard.writeText(messageText(message));
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      children: copied ? /* @__PURE__ */ jsx(Check, { className: "size-3.5" }) : /* @__PURE__ */ jsx(Copy, { className: "size-3.5" })
    }
  );
}
function MessageActions({
  message,
  onUndo,
  onStartEdit
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 ${message.role === "user" ? "justify-end" : ""}`,
      children: [
        /* @__PURE__ */ jsx(CopyButton, { message }),
        onStartEdit ? /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            "aria-label": "Edit message",
            title: "Edit and resend",
            className: "btn btn-ghost btn-xs btn-square text-base-content/40 hover:text-base-content",
            onClick: onStartEdit,
            children: /* @__PURE__ */ jsx(Pencil, { className: "size-3.5" })
          }
        ) : null,
        onUndo ? /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            "aria-label": "Undo from this message",
            title: "Undo — remove this message and everything after it",
            className: "btn btn-ghost btn-xs btn-square text-base-content/40 hover:text-base-content",
            onClick: onUndo,
            children: /* @__PURE__ */ jsx(Undo2, { className: "size-3.5" })
          }
        ) : null
      ]
    }
  );
}
function ReasoningBlock({
  part,
  live
}) {
  const [expanded, setExpanded] = useState(false);
  const isStreaming = live && part.state === "streaming";
  return /* @__PURE__ */ jsxs("div", { className: "text-base-content/60", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => setExpanded((open) => !open),
        className: "inline-flex items-center gap-1.5 text-xs hover:text-base-content/80",
        children: [
          isStreaming ? /* @__PURE__ */ jsx(Loader2, { className: "size-3 animate-spin" }) : /* @__PURE__ */ jsx(
            ChevronRight,
            {
              className: `size-3 transition-transform ${expanded ? "rotate-90" : ""}`
            }
          ),
          /* @__PURE__ */ jsx("span", { children: isStreaming ? "Thinking…" : "Thought process" })
        ]
      }
    ),
    expanded ? /* @__PURE__ */ jsx("div", { className: "mt-1.5 whitespace-pre-wrap border-l-2 border-base-300 pl-3 text-xs text-base-content/50", children: part.text }) : null
  ] });
}
function ToolBadge({
  part,
  live,
  resolveToolLabel
}) {
  const labels = resolveToolLabel(part.type);
  if (!labels) return null;
  const skillName = skillNameFromPart(part);
  const runningText = skillName ? `Activating ${skillName}` : labels.running;
  const doneText = skillName ? `Skill: ${skillName}` : labels.done;
  const state = "state" in part ? part.state : void 0;
  const isDone = state === "output-available";
  const isError = state === "output-error" || !isDone && !live;
  const isRunning = !isError && !isDone;
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${isError ? "bg-error/10 text-error" : "bg-base-200 text-base-content/70"}`,
      children: [
        isRunning ? /* @__PURE__ */ jsx(Loader2, { className: "size-3 animate-spin" }) : isError ? /* @__PURE__ */ jsx(AlertTriangle, { className: "size-3" }) : /* @__PURE__ */ jsx(Check, { className: "size-3" }),
        /* @__PURE__ */ jsx("span", { children: isRunning ? `${runningText}…` : doneText })
      ]
    }
  );
}
function ChatMessage({
  message,
  resolveToolLabel,
  streaming,
  onUndo,
  onEdit
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  if (message.role === "user") {
    if (editing && onEdit) {
      const submit = () => {
        const text = draft.trim();
        setEditing(false);
        if (text && text !== messageText(message)) onEdit(text);
      };
      return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-1.5 pl-8 sm:pl-16", children: [
        /* @__PURE__ */ jsx(
          "textarea",
          {
            className: "textarea textarea-bordered w-full max-w-xl text-sm",
            rows: Math.min(6, Math.max(2, draft.split("\n").length)),
            value: draft,
            autoFocus: true,
            onChange: (event) => setDraft(event.target.value),
            onKeyDown: (event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
              if (event.key === "Escape") setEditing(false);
            }
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-ghost btn-xs",
              onClick: () => setEditing(false),
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-primary btn-xs",
              onClick: submit,
              children: "Save & resend"
            }
          )
        ] })
      ] });
    }
    return /* @__PURE__ */ jsxs("div", { className: "group flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx("div", { className: "flex justify-end pl-8 sm:pl-16", children: /* @__PURE__ */ jsx("div", { className: "rounded-box rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-content", children: message.parts.map(
        (part, index) => part.type === "text" ? /* @__PURE__ */ jsx("span", { className: "whitespace-pre-wrap", children: part.text }, index) : null
      ) }) }),
      /* @__PURE__ */ jsx(
        MessageActions,
        {
          message,
          onUndo,
          onStartEdit: onEdit ? () => {
            setDraft(messageText(message));
            setEditing(true);
          } : void 0
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "group flex flex-col gap-1", children: [
    /* @__PURE__ */ jsx("div", { className: "min-w-0 space-y-2 text-sm", children: message.parts.map((part, index) => {
      if (part.type === "reasoning") {
        return part.text.trim() ? /* @__PURE__ */ jsx(
          ReasoningBlock,
          {
            part,
            live: Boolean(streaming)
          },
          index
        ) : null;
      }
      if (part.type === "text") {
        return part.text.trim() ? /* @__PURE__ */ jsx(Markdown, { children: part.text }, index) : null;
      }
      if (part.type.startsWith("tool-")) {
        return /* @__PURE__ */ jsx(
          ToolBadge,
          {
            part,
            live: Boolean(streaming),
            resolveToolLabel
          },
          index
        );
      }
      return null;
    }) }),
    streaming ? null : /* @__PURE__ */ jsx(MessageActions, { message })
  ] });
}
const BOTTOM_THRESHOLD_PX = 64;
function useStickToBottom(messages, status) {
  const scrollRef = useRef(null);
  const pinnedRef = useRef(true);
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el && pinnedRef.current) el.scrollTop = el.scrollHeight;
  }, [messages, status]);
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    pinnedRef.current = el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_THRESHOLD_PX;
  };
  const pinToBottom = () => {
    pinnedRef.current = true;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };
  return { scrollRef, onScroll, pinToBottom };
}
const DISCORD_URL = "https://discord.gg/c9uGs3cFXr";
function SuggestedQuestions({
  questions,
  primaryQuestions = [],
  onSelect
}) {
  return /* @__PURE__ */ jsx("div", { className: "ml-10 flex flex-wrap gap-2", children: questions.map(
    (question) => primaryQuestions.includes(question) ? /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/15",
        onClick: () => onSelect(question),
        children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "size-3.5" }),
          question
        ]
      },
      question
    ) : /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: "rounded-full border border-base-300 bg-base-100 px-3 py-1.5 text-xs font-medium text-base-content/70 transition-colors hover:border-primary/50 hover:text-base-content",
        onClick: () => onSelect(question),
        children: question
      },
      question
    )
  ) });
}
function WelcomeMessage({
  domain,
  checkoutError,
  isStartingCheckout,
  onUpgrade
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
    /* @__PURE__ */ jsx("div", { className: "flex size-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(Sparkles, { className: "size-4" }) }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 space-y-3 pt-0.5 text-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-base-content/80", children: [
        /* @__PURE__ */ jsx("p", { children: "Hey, I’m Sam — welcome to OpenSEO." }),
        /* @__PURE__ */ jsx("p", { children: "To get full access to OpenSEO, you need to upgrade to the paid plan. But, I’m here if you have any questions." }),
        /* @__PURE__ */ jsxs("p", { children: [
          "You can also",
          " ",
          /* @__PURE__ */ jsx(
            "a",
            {
              href: DISCORD_URL,
              target: "_blank",
              rel: "noreferrer",
              className: "link link-primary",
              children: "join the Discord"
            }
          ),
          " ",
          "or email",
          " ",
          /* @__PURE__ */ jsx("a", { href: "mailto:ben@openseo.so", className: "link link-primary", children: "ben@openseo.so" }),
          " ",
          "if you have any questions I can’t help you with."
        ] }),
        /* @__PURE__ */ jsxs("p", { children: [
          "Want me to analyze",
          " ",
          /* @__PURE__ */ jsx("span", { className: "font-medium text-base-content", children: domain }),
          " and draft a strategy, or do you have questions first? Pick one below to get started."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-box border border-base-300 bg-base-200/50 p-3 text-xs lg:hidden", children: [
        /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Want Sam to keep going?" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-0.5 text-base-content/70", children: [
          "Upgrade to run keyword research, rank tracking, and site audits on",
          " ",
          domain,
          "."
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "btn btn-primary btn-xs mt-2",
            disabled: isStartingCheckout,
            onClick: onUpgrade,
            children: isStartingCheckout ? "Redirecting..." : "Upgrade"
          }
        ),
        checkoutError ? /* @__PURE__ */ jsx("p", { className: "mt-2 text-error", children: checkoutError }) : null
      ] })
    ] })
  ] });
}
function UpgradeSidebar({
  domain,
  questionsUsed,
  isStartingCheckout,
  onUpgrade
}) {
  const features = [
    "Keyword research, backlinks, rank tracking & site audits",
    "Google Search Console — read-only, no credits, no Google Cloud setup",
    "Connect Claude, Cursor, Codex & other MCP clients",
    "Top-up credits roll over and never expire"
  ];
  const used = Math.min(questionsUsed, FREE_ONBOARDING_QUESTION_LIMIT);
  const progress = used / FREE_ONBOARDING_QUESTION_LIMIT * 100;
  return /* @__PURE__ */ jsxs("aside", { className: "hidden w-96 flex-shrink-0 flex-col border-r border-base-300 bg-base-200/20 lg:flex", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 border-b border-base-300 px-6 py-4 text-xs text-base-content/55", children: [
      /* @__PURE__ */ jsx("span", { className: "inline-flex size-8 items-center justify-center rounded-full border border-base-300 bg-base-100 text-primary", children: /* @__PURE__ */ jsx(Globe, { className: "size-4" }) }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "font-medium text-base-content/80", children: "Previewing OpenSEO" }),
        /* @__PURE__ */ jsx("p", { className: "truncate", title: domain, children: domain })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col gap-5 px-6 py-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-3xl font-semibold tracking-tight", children: "$10" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-base-content/55", children: "/month" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-xs leading-relaxed text-base-content/55", children: "Includes $10 of usage credits every month, plus a 30-day money-back guarantee." })
      ] }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-3 border-t border-base-300 pt-5", children: features.map((label) => /* @__PURE__ */ jsxs(
        "li",
        {
          className: "flex gap-2.5 text-sm leading-snug text-base-content/75",
          children: [
            /* @__PURE__ */ jsx(Check, { className: "mt-0.5 size-4 flex-shrink-0 text-primary" }),
            /* @__PURE__ */ jsx("span", { children: label })
          ]
        },
        label
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-auto space-y-3 pt-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "btn btn-primary w-full",
            disabled: isStartingCheckout,
            onClick: onUpgrade,
            children: isStartingCheckout ? "Redirecting..." : "Upgrade to continue"
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-center text-xs leading-relaxed text-base-content/55", children: [
          "Want advice from other OpenSEO users?",
          " ",
          /* @__PURE__ */ jsx(
            "a",
            {
              href: DISCORD_URL,
              target: "_blank",
              rel: "noreferrer",
              className: "link link-primary",
              children: "Join the Discord"
            }
          ),
          "."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 border-t border-base-300 px-6 py-4", children: [
      /* @__PURE__ */ jsx("div", { className: "h-1 w-full overflow-hidden rounded-full bg-base-300", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "h-full rounded-full bg-primary transition-all",
          style: { width: `${progress}%` }
        }
      ) }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-base-content/55", children: [
        used,
        " of ",
        FREE_ONBOARDING_QUESTION_LIMIT,
        " free questions used"
      ] })
    ] })
  ] });
}
function ChatGate({
  isStartingCheckout,
  onUpgrade
}) {
  return /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 border-t border-base-300 px-5 py-4", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-2xl rounded-box border border-primary/30 bg-primary/5 p-4 text-center", children: [
    /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium", children: [
      "That’s all ",
      FREE_ONBOARDING_QUESTION_LIMIT,
      " free questions"
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mx-auto mt-1 max-w-md text-xs text-base-content/70", children: "Upgrade to keep working with Sam and unlock the full OpenSEO app." }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: "btn btn-primary btn-sm mt-3",
        disabled: isStartingCheckout,
        onClick: onUpgrade,
        children: isStartingCheckout ? "Redirecting..." : "Upgrade to continue"
      }
    ),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-base-content/45", children: "30-day money-back guarantee" })
  ] }) });
}
function ChatComposer({
  busy,
  onSend,
  placeholder = "Ask Sam about your strategy or OpenSEO…"
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);
  useLayoutEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [value]);
  function submit() {
    const text = value.trim();
    if (!text || busy) return;
    onSend(text);
    setValue("");
  }
  function handleSubmit(event) {
    event.preventDefault();
    submit();
  }
  function handleKey(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }
  return /* @__PURE__ */ jsxs(
    "form",
    {
      onSubmit: handleSubmit,
      className: "flex items-end gap-2 rounded-box border border-base-300 bg-base-100 px-3 py-2 focus-within:border-primary",
      children: [
        /* @__PURE__ */ jsx(
          "textarea",
          {
            ref: textareaRef,
            value,
            onChange: (event) => setValue(event.target.value),
            onKeyDown: handleKey,
            rows: 1,
            placeholder,
            className: "max-h-40 flex-1 resize-none border-0 bg-transparent px-1 py-1 text-sm leading-relaxed outline-none placeholder:text-base-content/50 focus:outline-none"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            "aria-label": "Send message",
            disabled: busy || !value.trim(),
            className: "btn btn-primary btn-circle btn-sm",
            children: busy ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsx(ArrowUp, { className: "size-4" })
          }
        )
      ]
    }
  );
}
export {
  ChatMessage as C,
  FREE_ONBOARDING_QUESTION_LIMIT as F,
  SuggestedQuestions as S,
  UpgradeSidebar as U,
  WelcomeMessage as W,
  useAgentChat as a,
  useStickToBottom as b,
  ChatGate as c,
  ChatComposer as d,
  humanizeToolLabel as h,
  messageHasVisibleContent as m,
  useAgent as u
};
