# Cursor Talk to Figma MCP — Agent Calling Guide

This repo exposes a single, manifest‑driven MCP tool named `figma` that lets an agent call any Figma Plugin API method. It also provides helpers to join the WebSocket relay channel and to receive subscription events.

Key tools:
- `figma` — Invoke any Figma Plugin API method
- `join_channel` — Join the plugin’s active WebSocket channel
- `get_subscription_events` — Retrieve queued events for active subscriptions
- `get_manifest` — Return the generated API manifest (searchable)
- `export_node_as_image` — Export a node to an image file in `/tmp`

## Local References
- Full docs mirror: `figma-plugin-api-docs/developers.figma.com/docs/plugins/api/`
- TypeScript typings: `figma-plugin-api-docs/plugin-typings/package/plugin-api.d.ts`
- Generated manifest (programmatic index): `generated/figma-manifest.json`

## Input Schema (figma)
- `method` (string, required): API method name (e.g., `on`, `notify`, `createRectangle`).
- `path` (string, optional): Target path (e.g., `figma`, `figma.ui`, `node`). If omitted, resolution uses `scope` and manifest disambiguation.
- `scope` ("figma" | "node", optional): Narrows resolution when `path` is not unique.
- `args` (array | object, optional): Arguments by position or by parameter name. You can omit the callback for subscribe/unsubscribe.
- `overload` (number, optional): Explicit overload index when multiple signatures exist.
- `context` (object, optional):
  - `nodeId` (string): Target a specific node by ID.
  - `nodeIds` (string[]): Target multiple nodes by IDs.
  - `useSelection` (boolean): Target the current selection.
  - `selectionIndex` (number): Select a specific node from the selection.
  - `propertyPath` (string[]): Property navigation for synthetic `node`/`nodes` paths.
- `options` (object, optional):
  - `subscribe` (boolean): Create a subscription (no manual callback needed).
  - `unsubscribe` (boolean): Tear down an existing subscription.
  - `subscriptionId` (string): The ID to associate with a new subscription, or the one to cancel.

Notes:
- For subscriptions, the server injects a callback placeholder for you (do not pass your own callback).
- Only method invocations are supported; direct property reads are not (call a method that returns the data you need).

## Typical Flow
1) Start the socket relay: `bun socket` (listens on port `3055`).
2) Link and run the Figma plugin (see “Load in Figma” below) and click “Connect” in the plugin UI. It shows the joined channel.
3) From your MCP client, call `join_channel` with that channel.
4) Call `figma` to invoke Plugin API methods; optionally create subscriptions, then poll `get_subscription_events`.

## Examples

Join the plugin’s channel (shown in the plugin UI):
```
Tool: join_channel
Input: { "channel": "your-plugin-channel" }
```

Create a rectangle and rename it:
```
Tool: figma
Input: { "path": "figma", "method": "createRectangle" }
— result returns the node; to set name, call on the synthetic selection:
Tool: figma
Input: {
  "path": "node",
  "method": "setRelaunchData",
  "context": { "useSelection": true },
  "args": { "data": { "name": "My Rect" } }
}
```

Show a notification:
```
Tool: figma
Input: { "path": "figma", "method": "notify", "args": { "message": "Hello from MCP!" } }
```

Subscribe to selection change events:
```
Tool: figma
Input: {
  "path": "figma",
  "method": "on",
  "args": { "type": "selectionchange" },
  "options": { "subscribe": true, "subscriptionId": "sel-sub-1" }
}
```

Fetch queued events (and drain by default):
```
Tool: get_subscription_events
Input: { "subscriptionId": "sel-sub-1" }
```

Unsubscribe (no need to resend the event type):
```
Tool: figma
Input: {
  "path": "figma",
  "method": "off",
  "options": { "unsubscribe": true, "subscriptionId": "sel-sub-1" }
}
```

Filter the manifest for discovery:
```
Tool: get_manifest
Input: { "filter": "selection" }
```

Export a node as an image (writes to `/tmp`):
```
Tool: export_node_as_image
Input: {
  "nodeId": "<FIGMA_NODE_ID>",
  "format": "PNG",
  "scale": 2
}
```
Response contains a `path` field with the saved file location.

## Load in Figma
- Manifest to import: `src/cursor_mcp_plugin/manifest.json`
- Figma Desktop → Plugins → Development → Import plugin from manifest (or Link existing plugin) → select `src/cursor_mcp_plugin/manifest.json`.
- Run the plugin from the Plugins menu, click “Connect” (port `3055` by default). The UI displays the active channel; use that value with the `join_channel` tool.

## Troubleshooting
- “Must join a channel before sending commands” → Run `join_channel` with the channel shown in the plugin UI.
- No events received → Ensure the plugin UI remains open and connected; verify you used the same `subscriptionId` when polling `get_subscription_events`.
- Requests timing out → Keep the plugin UI open; progress pings extend timeouts. If using a non‑default socket port, set it in the plugin UI and pass `--server=` to the MCP process if needed.
