#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import WebSocket from "ws";
import { writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

import {
  figmaManifest,
  findManifestEntry,
  ManifestEntry,
} from "../generated/figma-manifest.js";

interface FigmaResponseEnvelope {
  type?: string;
  id?: string;
  message?: {
    id?: string;
    result?: unknown;
    error?: string;
    data?: unknown;
    command?: string;
    params?: unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface CommandProgressUpdate {
  type: "command_progress";
  commandId: string;
  commandType: string;
  status: "started" | "in_progress" | "completed" | "error";
  progress: number;
  totalItems: number;
  processedItems: number;
  currentChunk?: number;
  totalChunks?: number;
  chunkSize?: number;
  message: string;
  payload?: unknown;
  timestamp: number;
}

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  timeout: ReturnType<typeof setTimeout>;
  lastActivity: number;
}

type InvocationArgs = unknown[];

type InvocationContext = {
  nodeId?: string;
  nodeIds?: string[];
  useSelection?: boolean;
  selectionIndex?: number;
  propertyPath?: string[];
  [key: string]: unknown;
};

type PropertyAssignments = Record<string, unknown>;

interface InvocationMetadata {
  manifestEntry: ManifestEntry;
  propertyAssignments?: PropertyAssignments;
}

interface InvocationPayload {
  path: string;
  method: string;
  scope: ManifestEntry["scope"];
  args: InvocationArgs;
  context?: InvocationContext;
  overloadIndex: number;
  metadata: InvocationMetadata;
  subscription?: InvocationSubscription;
}

interface InvocationSubscription {
  id: string;
  action: "subscribe" | "unsubscribe";
}

interface SubscriptionRecord {
  id: string;
  path: string;
  method: string;
  scope: ManifestEntry["scope"];
  eventName?: string;
  createdAt: number;
  callback?: (...args: unknown[]) => unknown;
}

interface SubscriptionEventPayload {
  subscriptionId: string;
  path: string;
  method: string;
  scope: ManifestEntry["scope"];
  eventName?: string;
  payload: unknown;
  timestamp: number;
}

const logger = {
  info: (message: string) => process.stderr.write(`[INFO] ${message}\n`),
  debug: (message: string) => process.stderr.write(`[DEBUG] ${message}\n`),
  warn: (message: string) => process.stderr.write(`[WARN] ${message}\n`),
  error: (message: string) => process.stderr.write(`[ERROR] ${message}\n`),
};

let ws: WebSocket | null = null;
const pendingRequests = new Map<string, PendingRequest>();
let currentChannel: string | null = null;
const activeSubscriptions = new Map<string, SubscriptionRecord>();
const subscriptionEventQueues = new Map<string, SubscriptionEventPayload[]>();

const server = new McpServer({
  name: "TalkToFigmaMCP",
  version: "2.0.0",
});

const args = process.argv.slice(2);
const serverArg = args.find((arg) => arg.startsWith("--server="));

function formatWebSocketError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  if (typeof error === "object" && error) {
    const event = error as Record<string, unknown>;
    const message = typeof event.message === "string" ? event.message : undefined;
    const type = typeof event.type === "string" ? event.type : undefined;
    const data = typeof event.error === "string" ? event.error : undefined;
    return JSON.stringify({ type, message, data, raw: event });
  }

  return String(error);
}

function parseServerConfig(rawValue?: string) {
  const defaultPort = 3055;

  if (!rawValue || rawValue.trim().length === 0) {
    return {
      baseUrl: `ws://localhost`,
      defaultPort,
      appendPort: true,
    } as const;
  }

  const value = rawValue.trim();
  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value);

  if (hasScheme) {
    try {
      const parsed = new URL(value);
      const protocol = parsed.protocol;
      const isSecure = protocol === "https:" || protocol === "wss:";
      const wsProtocol = isSecure ? "wss" : "ws";
      const host = parsed.host;
      const port = parsed.port ? Number(parsed.port) : undefined;

      return {
        baseUrl: `${wsProtocol}://${host}`,
        defaultPort: port ?? (isSecure ? 443 : defaultPort),
        appendPort: false,
      } as const;
    } catch (error) {
      logger.warn(`Invalid server URL provided: ${value}. Falling back to localhost.`);
      return {
        baseUrl: `ws://localhost`,
        defaultPort,
        appendPort: true,
      } as const;
    }
  }

  const [hostPart, portPart] = value.split(":", 2);
  const hasExplicitPort = Boolean(portPart);
  const port = hasExplicitPort ? Number(portPart) : defaultPort;
  const isLocalHost = hostPart === "localhost" || hostPart === "127.0.0.1";
  const isSecure = !isLocalHost;
  const wsProtocol = isSecure ? "wss" : "ws";

  return {
    baseUrl: hasExplicitPort ? `${wsProtocol}://${hostPart}:${port}` : `${wsProtocol}://${hostPart}`,
    defaultPort: hasExplicitPort ? port : isSecure ? 443 : defaultPort,
    appendPort: !hasExplicitPort && !isSecure,
  } as const;
}

const serverConfig = parseServerConfig(serverArg ? serverArg.split("=")[1] : undefined);
const WS_URL = serverConfig.baseUrl;
const DEFAULT_PORT = serverConfig.defaultPort;

function connectToFigma(port: number = DEFAULT_PORT) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    logger.info("Already connected to Figma");
    return;
  }

  const wsUrl = serverConfig.appendPort ? `${WS_URL}:${port}` : WS_URL;
  logger.info(`Connecting to Figma socket server at ${wsUrl}...`);
  ws = new WebSocket(wsUrl);

  ws.on("open", () => {
    logger.info("Connected to Figma socket server");
    currentChannel = null;
  });

  ws.on("message", (data: WebSocket.RawData) => {
    try {
      const json = JSON.parse(data.toString()) as FigmaResponseEnvelope;

      if (json.type === "progress_update" && json.message?.data) {
        const progressData = json.message.data as CommandProgressUpdate;
        const requestId = json.id || json.message.id;

        if (requestId && pendingRequests.has(requestId)) {
          const request = pendingRequests.get(requestId)!;
          request.lastActivity = Date.now();
          clearTimeout(request.timeout);
          request.timeout = setTimeout(() => {
            if (pendingRequests.has(requestId)) {
              logger.error(
                `Request ${requestId} timed out after extended period of inactivity`
              );
              pendingRequests.delete(requestId);
              request.reject(new Error("Request to Figma timed out"));
            }
          }, 60000);

          logger.info(
            `Progress update for ${progressData.commandType}: ${progressData.progress}% - ${progressData.message}`
          );
        }
        return;
      }

      const message = json.message ?? json;

      if (
        json.type === "subscription_event" ||
        (message && typeof message === "object" && (message as Record<string, unknown>).type === "subscription_event")
      ) {
        const eventPayload = (message as Record<string, unknown>).event ?? message;
        if (eventPayload && typeof eventPayload === "object") {
          handleIncomingSubscriptionEvent(eventPayload as Record<string, unknown>);
        } else {
          logger.warn("Received subscription event without payload");
        }
        return;
      }

      const messageId = message?.id;

      if (messageId && pendingRequests.has(messageId)) {
        const request = pendingRequests.get(messageId)!;
        pendingRequests.delete(messageId);
        clearTimeout(request.timeout);

        if (message.error) {
          const errorText =
            typeof message.error === "string"
              ? message.error
              : JSON.stringify(message.error);
          logger.error(`Error from Figma: ${errorText}`);
          request.reject(new Error(errorText));
          return;
        }

        if ("result" in message) {
          request.resolve((message as { result: unknown }).result);
        } else {
          logger.debug(
            `Ignoring intermediate message without result for request ${messageId}`
          );
          pendingRequests.set(messageId, request);
          return;
        }
      } else {
        logger.debug(`Received broadcast message: ${JSON.stringify(json)}`);
      }
    } catch (error) {
      logger.error(
        `Error parsing message: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

  ws.on("error", (error) => {
    logger.error(`Socket error: ${formatWebSocketError(error)}`);
  });

  ws.on("close", () => {
    logger.info("Disconnected from Figma socket server");
    ws = null;

    for (const [id, request] of pendingRequests.entries()) {
      clearTimeout(request.timeout);
      request.reject(new Error("Connection closed"));
      pendingRequests.delete(id);
    }

    logger.info("Attempting to reconnect in 2 seconds...");
    setTimeout(() => connectToFigma(port), 2000);
  });
}

async function joinChannel(channelName: string): Promise<void> {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    throw new Error("Not connected to Figma");
  }

  const result = await sendCommandToFigma("join", { channel: channelName }, 15000, {
    requiresChannel: false,
  });

  logger.info(`Joined channel with result: ${JSON.stringify(result)}`);
  currentChannel = channelName;
}

function sendCommandToFigma(
  command: string,
  params: unknown = {},
  timeoutMs: number = 30000,
  options: { requiresChannel?: boolean } = { requiresChannel: true }
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      connectToFigma();
      reject(new Error("Not connected to Figma. Attempting to connect..."));
      return;
    }

    if (options.requiresChannel !== false && !currentChannel) {
      reject(new Error("Must join a channel before sending commands"));
      return;
    }

    const id = uuidv4();
    const envelope =
      command === "join"
        ? {
            id,
            type: "join",
            channel: (params as { channel: string }).channel,
            message: {
              id,
              command,
              params,
            },
          }
        : {
            id,
            type: "message",
            channel: currentChannel,
            message: {
              id,
              command,
              params,
            },
          };

    const timeout = setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error("Request to Figma timed out"));
      }
    }, timeoutMs);

    pendingRequests.set(id, {
      resolve,
      reject,
      timeout,
      lastActivity: Date.now(),
    });

    logger.debug(`Sending command to Figma: ${command}`);
    ws.send(JSON.stringify(envelope));
  });
}

const invocationContextShape = {
  nodeId: z.string().optional(),
  nodeIds: z.array(z.string()).optional(),
  useSelection: z.boolean().optional(),
  selectionIndex: z.number().int().nonnegative().optional(),
  propertyPath: z.array(z.string()).optional(),
};

const invocationOptionsShape = {
  subscribe: z.boolean().optional(),
  unsubscribe: z.boolean().optional(),
  subscriptionId: z.string().optional(),
};

const invocationMetadataShape = {
  propertyAssignments: z.record(z.string(), z.unknown()).optional(),
};

const figmaInvocationShape = {
  method: z.string().describe("Name of the Figma API method to call"),
  path: z
    .string()
    .optional()
    .describe("Target path for the method (e.g. figma.ui, figma.viewport, node)"),
  scope: z.enum(["figma", "node"]).optional(),
  args: z
    .union([z.array(z.unknown()), z.record(z.string(), z.unknown())])
    .optional()
    .describe("Arguments to pass to the method. May be ordered array or named object."),
  overload: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe("Select a specific overload when multiple signatures exist"),
  context: z.object(invocationContextShape).optional(),
  options: z.object(invocationOptionsShape).optional(),
  metadata: z.object(invocationMetadataShape).optional(),
};

const figmaInvocationSchema = z.object(figmaInvocationShape);

function inferManifestEntries(
  requestedMethod: string,
  path: string | undefined,
  scope: ManifestEntry["scope"] | undefined
): ManifestEntry[] {
  if (requestedMethod === "__assignProperties__") {
    const targetPath = path ?? (scope === "node" ? "node" : "figma");
    if (!targetPath) {
      throw new Error("Property assignments require a target path (e.g. node)");
    }
    const derivedScope =
      scope ?? (targetPath === "figma" || targetPath.startsWith("figma.") ? "figma" : "node");
    return [
      {
        id: `${targetPath}.__assignProperties__`,
        scope: derivedScope,
        path: targetPath,
        interface: derivedScope === "figma" ? "PluginAPI" : "PropertyAssignment",
        member: "__assignProperties__",
        kind: "method",
        overloadIndex: 0,
        parameters: [],
        returns: "void",
        async: false,
        deprecated: false,
        docs: "Synthetic entry used to assign writable properties on the resolved target.",
      },
    ];
  }

  if (path) {
    const entries = findManifestEntry(path, requestedMethod) ?? [];
    if (entries.length === 0) {
      throw new Error(`No manifest entry found for ${path}.${requestedMethod}`);
    }
    return entries;
  }

  const candidates = figmaManifest.filter((entry) => entry.member === requestedMethod);
  if (scope) {
    const scoped = candidates.filter((entry) => entry.scope === scope);
    if (scoped.length > 0) {
      return scoped;
    }
  }

  const uniquePaths = new Set(candidates.map((entry) => entry.path));
  if (uniquePaths.size > 1) {
    throw new Error(
      `Method ${requestedMethod} exists on multiple paths (${Array.from(uniquePaths).join(
        ", "
      )}). Specify a target path.`
    );
  }

  if (candidates.length === 0) {
    throw new Error(`Method ${requestedMethod} not found in manifest`);
  }

  return candidates;
}

function buildArgumentList(
  entry: ManifestEntry,
  rawArgs: unknown | undefined,
  options?: { allowMissingParameterNames?: Set<string> }
): InvocationArgs {
  if (Array.isArray(rawArgs)) {
    return [...rawArgs];
  }

  if (rawArgs === null || rawArgs === undefined) {
    return [];
  }

  if (typeof rawArgs !== "object") {
    return [rawArgs];
  }

  const argsRecord = rawArgs as Record<string, unknown>;
  const positional: unknown[] = [];

  entry.parameters.forEach((param, index) => {
    if (param.rest) {
      const restValue = argsRecord[param.name];
      if (Array.isArray(restValue)) {
        positional.push(...restValue);
      } else if (restValue !== undefined) {
        positional.push(restValue);
      }
      return;
    }

    if (Object.prototype.hasOwnProperty.call(argsRecord, param.name)) {
      positional.push(argsRecord[param.name]);
      return;
    }

    if (entry.parameters.length === 1) {
      const fallbackKeys = [param.name, "value", "values", "payload", "data"];
      for (const key of fallbackKeys) {
        if (Object.prototype.hasOwnProperty.call(argsRecord, key)) {
          positional.push(argsRecord[key]);
          return;
        }
      }

      const objectKeys = Object.keys(argsRecord);
      if (objectKeys.length === 1) {
        positional.push(argsRecord[objectKeys[0]]);
        return;
      }
    }

    const allowMissing = options?.allowMissingParameterNames?.has(param.name) ?? false;

    if (param.optional || allowMissing) {
      positional.push(undefined);
      return;
    }

    throw new Error(`Missing required argument: ${param.name}`);
  });

  while (positional.length && positional[positional.length - 1] === undefined) {
    positional.pop();
  }

  return positional;
}

function isCallbackType(type: string | undefined): boolean {
  if (!type) {
    return false;
  }

  const trimmed = type.trim();
  if (trimmed.includes("=>")) {
    return true;
  }

  const lowered = trimmed.toLowerCase();
  const indicators = ["handler", "callback", "listener"];
  if (indicators.some((indicator) => lowered.endsWith(indicator) || lowered.includes(indicator))) {
    return true;
  }

  if (lowered.startsWith("(event") && lowered.includes("=>")) {
    return true;
  }

  return false;
}

function findCallbackParameterIndex(entry: ManifestEntry): number {
  return entry.parameters.findIndex((param) => isCallbackType(param.type));
}

function handleIncomingSubscriptionEvent(event: Record<string, unknown>) {
  const subscriptionId = typeof event.subscriptionId === "string" ? event.subscriptionId : undefined;
  if (!subscriptionId) {
    logger.warn("Received subscription event without subscriptionId");
    return;
  }

  const record = activeSubscriptions.get(subscriptionId);
  if (!record) {
    logger.warn(`Received event for unknown subscription ${subscriptionId}`);
    return;
  }

  const normalizedEvent: SubscriptionEventPayload = {
    subscriptionId,
    path: record.path,
    method: record.method,
    scope: record.scope,
    eventName:
      typeof event.eventName === "string" && event.eventName.length > 0
        ? event.eventName
        : record.eventName,
    payload: event.payload ?? null,
    timestamp:
      typeof event.timestamp === "number" && Number.isFinite(event.timestamp)
        ? event.timestamp
        : Date.now(),
  };

  if (!subscriptionEventQueues.has(subscriptionId)) {
    subscriptionEventQueues.set(subscriptionId, []);
  }

  subscriptionEventQueues.get(subscriptionId)!.push(normalizedEvent);

  const logPayload = {
    type: "figma_subscription_event",
    ...normalizedEvent,
  };

  if (typeof server.server?.sendLoggingMessage === "function") {
    void server.server
      .sendLoggingMessage({
        level: "info",
        message: JSON.stringify(logPayload),
      })
      .catch((error) => {
        logger.warn(`Failed to forward subscription event via logging message: ${String(error)}`);
      });
  }

  logger.info(
    `Queued subscription event for ${subscriptionId} (${normalizedEvent.eventName ?? "unknown"})`
  );
}

server.tool(
  "figma",
  "Invoke any Figma Plugin API method using manifest-driven validation",
  figmaInvocationShape,
  async (rawInput) => {
    const input = figmaInvocationSchema.parse(rawInput);
    const scope = input.scope ?? "figma";
    const propertyAssignments =
      input.metadata && typeof input.metadata === "object"
        ? input.metadata.propertyAssignments
        : undefined;

    if (propertyAssignments && (!input.path || input.path.length === 0)) {
      throw new Error("Property assignments require an explicit target path (e.g. node)");
    }

    const entries = inferManifestEntries(input.method, input.path, scope);

    const entry =
      typeof input.overload === "number"
        ? entries.find((candidate) => candidate.overloadIndex === input.overload)
        : entries[0];

    if (!entry) {
      throw new Error("Unable to resolve manifest entry for requested method");
    }

    const invocationOptions = input.options ?? {};
    const isSubscribe = invocationOptions.subscribe === true;
    const isUnsubscribe = invocationOptions.unsubscribe === true;

    if (isSubscribe && isUnsubscribe) {
      throw new Error("Cannot subscribe and unsubscribe in the same request");
    }

    let subscriptionId = invocationOptions.subscriptionId;
    let pendingSubscriptionRecord: SubscriptionRecord | null = null;
    let subscriptionAction: InvocationSubscription["action"] | undefined;

    const callbackIndex = findCallbackParameterIndex(entry);

    const allowMissingParameters =
      (isSubscribe || isUnsubscribe) && callbackIndex >= 0
        ? new Set<string>([entry.parameters[callbackIndex].name])
        : undefined;

    const args = buildArgumentList(entry, input.args, {
      allowMissingParameterNames: allowMissingParameters,
    });

    if (isSubscribe || isUnsubscribe) {
      subscriptionAction = isSubscribe ? "subscribe" : "unsubscribe";
      if (!subscriptionId) {
        subscriptionId = uuidv4();
      }

      if (callbackIndex === -1) {
        throw new Error(
          `Method ${entry.member} does not expose a callback parameter and cannot be used for subscriptions`
        );
      }

      while (args.length <= callbackIndex) {
        args.push(undefined);
      }

      args[callbackIndex] = {
        __subscriptionCallback: true,
        subscriptionId,
      } as const;

      if (isSubscribe) {
        pendingSubscriptionRecord = {
          id: subscriptionId,
          path: entry.path,
          method: entry.member,
          scope: entry.scope,
          eventName: typeof args[0] === "string" ? (args[0] as string) : undefined,
          createdAt: Date.now(),
        };
      } else if (isUnsubscribe && !activeSubscriptions.has(subscriptionId)) {
        throw new Error(`Subscription ${subscriptionId} is not active`);
      }
    }

    const requiresNodeContext = entry.path === "node" || entry.path.startsWith("node.") || entry.path === "nodes" || entry.path.startsWith("nodes.");

    if (entry.scope === "node" && requiresNodeContext) {
      const ctx = input.context ?? {};
      if (!ctx.nodeId && !ctx.useSelection) {
        throw new Error(
          "Node-context invocation requires either context.nodeId or context.useSelection"
        );
      }
    }

    const invocationPayload: InvocationPayload = {
      path: entry.path,
      method: entry.member,
      scope: entry.scope,
      args,
      context: input.context,
      overloadIndex: entry.overloadIndex,
      metadata: {
        manifestEntry: entry,
        ...(propertyAssignments ? { propertyAssignments } : {}),
      },
      subscription:
        subscriptionAction && subscriptionId
          ? {
              id: subscriptionId,
              action: subscriptionAction,
            }
          : undefined,
    };

    const result = await sendCommandToFigma(
      "invoke_manifest",
      {
        invocation: invocationPayload,
      },
      entry.async ? 60000 : 30000
    );

    if (pendingSubscriptionRecord && invocationPayload.subscription?.action === "subscribe") {
      const resultObject = (result && typeof result === "object") ? (result as Record<string, unknown>) : undefined;
      if (resultObject) {
        if (typeof resultObject.subscriptionId === "string") {
          pendingSubscriptionRecord.id = resultObject.subscriptionId;
        }
        if (typeof resultObject.subscriptionEventName === "string") {
          pendingSubscriptionRecord.eventName = resultObject.subscriptionEventName;
        }
      }
      activeSubscriptions.set(pendingSubscriptionRecord.id, pendingSubscriptionRecord);
      if (!subscriptionEventQueues.has(pendingSubscriptionRecord.id)) {
        subscriptionEventQueues.set(pendingSubscriptionRecord.id, []);
      }
    }

    if (
      invocationPayload.subscription?.action === "unsubscribe" &&
      invocationPayload.subscription?.id
    ) {
      activeSubscriptions.delete(invocationPayload.subscription.id);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            invocation: {
              path: entry.path,
              method: entry.member,
              interface: entry.interface,
              overload: entry.overloadIndex,
              returns: entry.returns,
            },
            result,
          }, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "get_manifest",
  "Return the generated manifest describing the entire Figma Plugin API surface",
  {
    filter: z.string().optional().describe("Optional substring to filter method names"),
  },
  async ({ filter }) => {
    const entries = filter
      ? figmaManifest.filter((entry) =>
          entry.id.toLowerCase().includes(filter.toLowerCase())
        )
      : figmaManifest;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(entries, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "get_subscription_events",
  "Fetch queued events emitted by active Figma subscriptions",
  {
    subscriptionId: z.string().optional().describe("Specific subscription ID to inspect"),
    subscriptionIds: z
      .array(z.string())
      .optional()
      .describe("Multiple subscription IDs to inspect"),
    drain: z
      .boolean()
      .optional()
      .describe("Whether to remove events from the internal queue (default true)"),
  },
  async ({ subscriptionId, subscriptionIds, drain }) => {
    const drainQueue = drain ?? true;

    const targetIds = subscriptionId
      ? [subscriptionId]
      : subscriptionIds && subscriptionIds.length > 0
      ? subscriptionIds
      : Array.from(subscriptionEventQueues.keys());

    const events: Record<string, SubscriptionEventPayload[]> = {};

    targetIds.forEach((id) => {
      const queue = subscriptionEventQueues.get(id) ?? [];
      events[id] = queue.slice();
      if (drainQueue) {
        subscriptionEventQueues.set(id, []);
      }
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              drain: drainQueue,
              subscriptions: events,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// Convenience tool: export a node as an image and save to /tmp
server.tool(
  "export_node_as_image",
  "Export a node as an image from Figma and save it to /tmp",
  {
    nodeId: z.string().describe("The ID of the node to export"),
    format: z
      .enum(["PNG", "JPG", "SVG", "PDF"]) // align with Figma export formats
      .optional()
      .describe("Export format (default: PNG)"),
    scale: z
      .number()
      .positive()
      .optional()
      .describe("Export scale (default: 1)")
  },
  async ({ nodeId, format, scale }) => {
    const exportFormat = (format || "PNG").toUpperCase();
    const exportScale = scale ?? 1;

    // Build a manifest invocation for node.exportAsync
    const invocation = {
      path: "node",
      method: "exportAsync",
      scope: "node" as const,
      args: [
        {
          format: exportFormat,
          constraint: { type: "SCALE", value: exportScale },
        },
      ],
      context: { nodeId },
    };

    // Call the plugin via the socket bridge using the generic executor
    const response = (await sendCommandToFigma("invoke_manifest", {
      invocation,
    })) as unknown;

    // The plugin returns a response object with a `result` field containing the normalized payload
    if (!response || typeof response !== "object" || !("result" in response)) {
      throw new Error("Unexpected response from Figma when exporting image");
    }

    const normalized = (response as { result: unknown }).result as unknown;

    // Reconstruct bytes or text depending on format
    let buffer: Buffer;
    let extension = exportFormat.toLowerCase();

    if (
      normalized &&
      typeof normalized === "object" &&
      (normalized as any).__type === "Uint8Array" &&
      Array.isArray((normalized as any).data)
    ) {
      const data: number[] = (normalized as any).data as number[];
      buffer = Buffer.from(Uint8Array.from(data));
    } else if (typeof normalized === "string") {
      // SVG content returns as string
      buffer = Buffer.from(normalized, "utf8");
      if (exportFormat === "SVG") {
        extension = "svg";
      }
    } else if (
      normalized &&
      typeof normalized === "object" &&
      (normalized as any).__type === "ArrayBuffer" &&
      Array.isArray((normalized as any).data)
    ) {
      const data: number[] = (normalized as any).data as number[];
      buffer = Buffer.from(Uint8Array.from(data));
    } else {
      throw new Error("Unsupported export payload format from plugin");
    }

    // Normalize extension
    if (extension === "jpg") extension = "jpg"; // keep
    if (extension === "png") extension = "png";
    if (extension === "pdf") extension = "pdf";

    const fileName = `figma-export-${Date.now()}-${uuidv4().slice(0, 8)}.${extension}`;
    const outputPath = `/tmp/${fileName}`;

    await writeFile(outputPath, buffer);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              path: outputPath,
              bytes: buffer.byteLength,
              nodeId,
              format: exportFormat,
              scale: exportScale,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "join_channel",
  "Join a specific channel to communicate with the Figma plugin bridge",
  {
    channel: z.string().describe("The channel name chosen in the Figma plugin UI"),
  },
  async ({ channel }) => {
    await joinChannel(channel);
    return {
      content: [
        {
          type: "text",
          text: `Joined channel ${channel}`,
        },
      ],
    };
  }
);

async function main() {
  try {
    connectToFigma();
  } catch (error) {
    logger.warn(
      `Could not connect to Figma initially: ${error instanceof Error ? error.message : String(error)}`
    );
    logger.warn("Will try to connect when the first command is sent");
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("Figma MCP server running on stdio");
}

main().catch((error) => {
  logger.error(`Error starting Figma MCP server: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
