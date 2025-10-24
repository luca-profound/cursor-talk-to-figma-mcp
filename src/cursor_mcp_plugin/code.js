// Cursor MCP Figma plugin - manifest driven execution layer

const state = {
  serverPort: 3055,
};

const subscriptions = new Map();

function sendProgressUpdate(
  commandId,
  commandType,
  status,
  progress,
  totalItems,
  processedItems,
  message,
  payload = null
) {
  const update = {
    type: "command_progress",
    commandId,
    commandType,
    status,
    progress,
    totalItems,
    processedItems,
    message,
    timestamp: Date.now(),
  };

  if (payload) {
    if (
      payload.currentChunk !== undefined &&
      payload.totalChunks !== undefined
    ) {
      update.currentChunk = payload.currentChunk;
      update.totalChunks = payload.totalChunks;
      update.chunkSize = payload.chunkSize;
    }
    update.payload = payload;
  }

  figma.ui.postMessage({
    type: "progress_update",
    data: update,
  });

  return update;
}

function isSubscriptionPlaceholder(value) {
  return (
    value &&
    typeof value === "object" &&
    value.__subscriptionCallback === true &&
    typeof value.subscriptionId === "string"
  );
}

function createSubscriptionCallback(record) {
  const { id, path, method, scope, eventName } = record;

  return function subscriptionCallback(eventPayload) {
    const normalizedPayload = normalizeResult(eventPayload);
    figma.ui.postMessage({
      type: "subscription-event",
      event: {
        subscriptionId: id,
        path,
        method,
        scope,
        eventName,
        payload: normalizedPayload,
        timestamp: Date.now(),
      },
    });
  };
}

figma.showUI(__html__, { width: 350, height: 450 });

figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case "update-settings":
      updateSettings(msg);
      break;
    case "notify":
      figma.notify(msg.message);
      break;
    case "close-plugin":
      figma.closePlugin();
      break;
    case "execute-command":
      await handleExecuteCommand(msg);
      break;
  }
};

figma.on("run", () => {
  figma.ui.postMessage({ type: "auto-connect" });
});

function updateSettings(settings) {
  if (settings.serverPort) {
    state.serverPort = settings.serverPort;
  }

  figma.clientStorage.setAsync("settings", {
    serverPort: state.serverPort,
  });
}

async function handleExecuteCommand(msg) {
  const { id, command, params } = msg;

  try {
    switch (command) {
      case "invoke_manifest": {
        const invocationPayload =
          params && Object.prototype.hasOwnProperty.call(params, "invocation")
            ? params.invocation
            : undefined;
        const result = await executeManifestInvocation(invocationPayload);
        figma.ui.postMessage({
          type: "command-result",
          id,
          result,
        });
        break;
      }
      default: {
        throw new Error(`Unsupported command: ${command}`);
      }
    }
  } catch (error) {
    const normalized = normalizeError(error);
    figma.ui.postMessage({
      type: "command-error",
      id,
      error: normalized.message,
      stack: normalized.stack,
    });
  }
}

async function executeManifestInvocation(invocation) {
  if (!invocation) {
    throw new Error("Missing invocation payload");
  }

  const {
    path,
    method,
    scope,
    args = [],
    context = {},
    overloadIndex,
    metadata,
    subscription,
  } = invocation;

  const manifestEntry =
    metadata && typeof metadata === "object" && metadata.manifestEntry
      ? metadata.manifestEntry
      : null;
  const subscriptionId =
    subscription && typeof subscription === "object"
      ? subscription.subscriptionId || subscription.id
      : undefined;
  const subscriptionAction =
    subscription && typeof subscription === "object" ? subscription.action : undefined;

  const resolvedScope = scope || inferScope(path);
  const target = await resolveTarget(path, resolvedScope, context);

  if (!target) {
    throw new Error(`Unable to resolve target for path ${path}`);
  }

  const fn = target[method];
  if (typeof fn !== "function") {
    throw new Error(`Method ${method} is not callable on ${path}`);
  }

  const appliedArgs = Array.isArray(args) ? [...args] : [];

  const isSubscribe = subscriptionAction === "subscribe";
  const isUnsubscribe = subscriptionAction === "unsubscribe";

  if (isSubscribe && isUnsubscribe) {
    throw new Error("Invalid subscription request");
  }

  const callbackIndex = appliedArgs.findIndex((arg) => isSubscriptionPlaceholder(arg));

  if ((isSubscribe || isUnsubscribe) && callbackIndex === -1) {
    throw new Error("Subscription requests require a callback parameter");
  }

  if ((isSubscribe || isUnsubscribe) && !subscriptionId) {
    throw new Error("Subscription requests must include a subscription identifier");
  }

  let subscriptionRecord = null;
  let removedSubscription = null;

  if (isSubscribe) {
    const eventName = typeof appliedArgs[0] === "string" ? appliedArgs[0] : undefined;
    subscriptionRecord = {
      id: subscriptionId,
      path,
      method,
      scope: resolvedScope,
      eventName,
      createdAt: Date.now(),
    };

    const callback = createSubscriptionCallback(subscriptionRecord);
    subscriptionRecord.callback = callback;
    appliedArgs[callbackIndex] = callback;
  } else if (isUnsubscribe) {
    const existing = subscriptions.get(subscriptionId);
    if (!existing) {
      throw new Error(`Unknown subscription: ${subscriptionId}`);
    }
    removedSubscription = existing;
    if ((typeof appliedArgs[0] === "undefined" || appliedArgs[0] === null) && existing.eventName) {
      appliedArgs[0] = existing.eventName;
    }
    appliedArgs[callbackIndex] = existing.callback;
  }

  let result;
  let error = null;

  try {
    result = fn.apply(target, appliedArgs);
    if (result instanceof Promise) {
      result = await result;
    }
  } catch (err) {
    error = err;
  }

  if (error) {
    throw error;
  }

  if (isSubscribe && subscriptionRecord) {
    subscriptions.set(subscriptionRecord.id, subscriptionRecord);
  }

  if (isUnsubscribe && subscriptionId) {
    subscriptions.delete(subscriptionId);
  }

  const normalizedResult = normalizeResult(result);

  const argsForResponse = appliedArgs.map((value) => {
    if (typeof value === "function") {
      return "[Function]";
    }
    if (isSubscriptionPlaceholder(value)) {
      return {
        __subscriptionCallback: true,
        subscriptionId,
      };
    }
    return normalizeResult(value);
  });

  const response = {
    ok: true,
    scope: resolvedScope,
    path,
    method,
    overloadIndex,
    args: argsForResponse,
    result: normalizedResult,
    returnType: manifestEntry ? manifestEntry.returns : null,
    interface: manifestEntry ? manifestEntry.interface : null,
    async: manifestEntry && typeof manifestEntry.async === "boolean" ? manifestEntry.async : false,
  };

  if (subscriptionId) {
    response.subscriptionId = subscriptionId;
    response.subscriptionAction = subscriptionAction;
    response.subscriptionEventName =
      (subscriptionRecord && subscriptionRecord.eventName) ||
      (removedSubscription && removedSubscription.eventName) ||
      (typeof appliedArgs[0] === "string" ? appliedArgs[0] : undefined);
    response.subscriptionActive = subscriptions.has(subscriptionId);
  }

  return response;
}

function inferScope(path) {
  if (!path) {
    return "figma";
  }
  if (path === "node") {
    return "node";
  }
  if (path.startsWith("figma")) {
    return "figma";
  }
  return "figma";
}

async function resolveTarget(path, scope, context) {
  if (!path || path === "figma") {
    return figma;
  }

  function isDynamicAccessError(error) {
    if (!error || typeof error !== "object") {
      return false;
    }
    var message = error.message;
    if (typeof message !== "string") {
      return false;
    }
    return (
      message.indexOf("documentAccess") !== -1 ||
      message.indexOf("dynamic-page") !== -1 ||
      message.indexOf("getNodeByIdAsync") !== -1
    );
  }

  async function getNodeWithFallback(nodeId) {
    if (!nodeId) {
      return null;
    }
    var node = null;
    try {
      node = figma.getNodeById(nodeId);
    } catch (error) {
      if (!isDynamicAccessError(error)) {
        throw error;
      }
    }
    if (node) {
      return node;
    }
    return await figma.getNodeByIdAsync(nodeId);
  }

  if (path === "node" || scope === "node") {
    if (context.useSelection) {
      const selection = figma.currentPage.selection || [];
      if (selection.length === 0) {
        throw new Error("Selection is empty; cannot resolve node from selection");
      }
      const index = context.selectionIndex || 0;
      return selection[index] || selection[0];
    }

    if (context.nodeId) {
      const node = await getNodeWithFallback(context.nodeId);
      if (node) {
        return node;
      }
      throw new Error(`Node not found: ${context.nodeId}`);
    }

    throw new Error("Node context requires context.nodeId or context.useSelection");
  }

  if (path === "nodes") {
    const nodeIds = Array.isArray(context.nodeIds) ? context.nodeIds : [];
    if (!nodeIds.length) {
      throw new Error("nodes path requires context.nodeIds");
    }
    const nodes = [];
    for (let i = 0; i < nodeIds.length; i += 1) {
      const resolved = await getNodeWithFallback(nodeIds[i]);
      if (resolved) {
        nodes.push(resolved);
      }
    }
    if (!nodes.length) {
      throw new Error("Unable to resolve any nodes for provided nodeIds");
    }
    return nodes;
  }

  const segments = path.split(".");
  let current = null;

  for (let i = 0; i < segments.length; i += 1) {
    const segment = segments[i];
    if (i === 0 && segment === "figma") {
      current = figma;
      continue;
    }

    if (current == null) {
      throw new Error(`Unable to resolve segment ${segment} on null target`);
    }

    const next = current[segment];

    if (typeof next === "undefined") {
      throw new Error(`Property ${segment} does not exist on target ${segments.slice(0, i).join(".")}`);
    }

    current = next;
  }

  if (context.propertyPath && Array.isArray(context.propertyPath)) {
    for (const property of context.propertyPath) {
      if (current == null) {
        throw new Error(`Unable to resolve property ${property} on null target`);
      }
      current = current[property];
    }
  }

  return current;
}

function normalizeResult(value, seen = new WeakSet()) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number" || typeof value === "string" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeResult(item, seen));
  }

  if (value instanceof Uint8Array) {
    return {
      __type: "Uint8Array",
      data: Array.from(value),
    };
  }

  if (value instanceof ArrayBuffer) {
    return {
      __type: "ArrayBuffer",
      data: Array.from(new Uint8Array(value)),
    };
  }

  if (value instanceof Map) {
    return {
      __type: "Map",
      entries: Array.from(value.entries()).map(([k, v]) => [normalizeResult(k, seen), normalizeResult(v, seen)]),
    };
  }

  if (value instanceof Set) {
    return {
      __type: "Set",
      values: Array.from(value.values()).map((v) => normalizeResult(v, seen)),
    };
  }

  if (typeof value === "object") {
    if (seen.has(value)) {
      return "[Circular]";
    }
    seen.add(value);

    if (value.id && value.type && typeof value.id === "string") {
      const nodeSummary = {
        id: value.id,
        type: value.type,
        name: value.name == null ? null : value.name,
      };
      if ("visible" in value) {
        nodeSummary.visible = value.visible;
      }
      if ("children" in value && Array.isArray(value.children)) {
        nodeSummary.children = value.children.map((child) =>
          child && child.id
            ? {
                id: child.id,
                type: child.type,
                name: child.name == null ? null : child.name,
              }
            : normalizeResult(child, seen)
        );
      }
      seen.delete(value);
      return nodeSummary;
    }

    const output = {};
    for (const key of Object.keys(value)) {
      const property = value[key];
      if (typeof property === "function") {
        continue;
      }
      try {
        output[key] = normalizeResult(property, seen);
      } catch (error) {
        output[key] = `[Error serializing ${key}]`;
      }
    }
    seen.delete(value);
    return output;
  }

  return String(value);
}

function normalizeError(error) {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof error === "string") {
    return { message: error };
  }

  try {
    return { message: JSON.stringify(error) };
  } catch (serializationError) {
    return { message: "Unknown error" };
  }
}
