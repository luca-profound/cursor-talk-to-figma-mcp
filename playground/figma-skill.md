# Cursor Talk to Figma MCP — Agent Calling Guide

This repo exposes a single, manifest‑driven MCP tool named `figma` that lets an agent call any Figma Plugin API method. It also provides helpers to join the WebSocket relay channel and to receive subscription events.

Key tools:
- `figma` — Invoke any Figma Plugin API method
- `join_channel` — Join the plugin’s active WebSocket channel
- `get_subscription_events` — Retrieve queued events for active subscriptions
- `get_manifest` — Return the generated API manifest (searchable)

## Local References
- Full docs mirror: `figma-plugin-api-docs/developers.figma.com`
- TypeScript typings: `figma-plugin-api-docs/plugin-typings/package/plugin-api.d.ts`
- Generated manifest (programatic index): `generated/figma-manifest.json`

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

## Troubleshooting
- “Must join a channel before sending commands” → Run `join_channel` with the channel shown in the plugin UI.
- No events received → Ensure the plugin UI remains open and connected; verify you used the same `subscriptionId` when polling `get_subscription_events`.
- Requests timing out → Keep the plugin UI open; progress pings extend timeouts. If using a non‑default socket port, set it in the plugin UI and pass `--server=` to the MCP process if needed.


____

## Rules to Stay on Track
1. Every time you make a change to the figma canvas, request an image to be supplied immediately afterward, then read it from /tmp. This is essential to make sure you can continue to "see" your changes as you apply them.
2. Whenever you reach a major milestone, you should invoke a sub-agent and get it to independently review your work. Don't bias the agent. Just say something like "Please view the image here: /tmp/whatever.png. A designer made this for the purpose of X. It is a Y. Please review whether it looks coherent, if there are any things amiss (such as misalignment, poor structure, etc), and if there is any room for improvement. Be specific about your feedback." Always make sure to incorporate the feedback from the agent until you get a very good review from the agent without additional changes. If you received other instructions from the human in your original prompt such as reference images, inspiration images, or other requirements, you need to supply those to the sub-agent so that it knows how to grade you.
3. As you get an assignment, make sure to write an execution plan first. It is a living document that you put as a markdown file in exec-plans. You should update it as you accomplish different milestones so you stay on track. Make sure to read exec-plans/EXEC_PLANS.md for further guidance on it.
4. When using a sub-agent judge, always instruct it to not look at any other files, only to open the two reference images. This will prevent it from biasing itself by trying to locate your exec plan or other resources.
5. If you have trouble calling the subagent via codex MCP tool (for instance if the tool returns an error), then you can fallback to `/home/luca/code/codex/codex-rs/target/release/codex exec "your prompt" --output-last-message /tmp/someuniquefilename.txt > /dev/null 2>&1`. This will work directly from the binary and then you can read the response from /tmp. Use 20 minutes for timeout_ms to make sure it doesn't time out early on you.
6. You can likely ignore subscription type events, we really just want to do two things: writing to canvas and exporting screenshots
7. If you are asked to make a figma implementation of a reference image, then you should start by doing intensive planning as to how the reference image would be constructed using vector objects. Pay attention to the fact that there could be different layers, polygons, etc. Try not to oversimplify it or it will be hard to crawl out of a bad initial design. Put all of your planning in a .md file in your exec-plan folder.
8. Do not "read" image files or use them in base64. This will poison your entire context window. Instead, use "view image" and you will receive it as an image native to your architecture.