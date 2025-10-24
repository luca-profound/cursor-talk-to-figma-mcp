# Cursor Talk to Figma MCP

This project implements a Model Context Protocol (MCP) integration between Cursor AI and Figma, allowing Cursor to communicate with Figma for reading designs and modifying them programmatically.

https://github.com/user-attachments/assets/129a14d2-ed73-470f-9a4c-2240b2a4885c

## Project Structure

- `src/talk_to_figma_mcp/` - TypeScript MCP server for Figma integration
- `src/cursor_mcp_plugin/` - Figma plugin for communicating with Cursor
- `src/socket.ts` - WebSocket server that facilitates communication between the MCP server and Figma plugin

## Get Started

1. Install Bun if you haven't already:

```bash
curl -fsSL https://bun.sh/install | bash
```

2. Run setup, this will also install MCP in your Cursor's active project

```bash
bun setup
```

3. Start the Websocket server

```bash
bun socket
```

4. **NEW** Install Figma plugin from [Figma community page](https://www.figma.com/community/plugin/1485687494525374295/cursor-talk-to-figma-mcp-plugin) or [install locally](#figma-plugin)

## Quick Video Tutorial

[Video Link](https://www.linkedin.com/posts/sonnylazuardi_just-wanted-to-share-my-latest-experiment-activity-7307821553654657024-yrh8)

## Design Automation Example

**Bulk text content replacement**

Thanks to [@dusskapark](https://github.com/dusskapark) for contributing the bulk text replacement feature. Here is the [demo video](https://www.youtube.com/watch?v=j05gGT3xfCs).

**Instance Override Propagation**
Another contribution from [@dusskapark](https://github.com/dusskapark)
Propagate component instance overrides from a source instance to multiple target instances with a single command. This feature dramatically reduces repetitive design work when working with component instances that need similar customizations. Check out our [demo video](https://youtu.be/uvuT8LByroI).

## Development Setup

To develop, update your mcp config to direct to your local directory.

```json
{
  "mcpServers": {
    "TalkToFigma": {
      "command": "bun",
      "args": ["/path-to-repo/src/talk_to_figma_mcp/server.ts"]
    }
  }
}
```

## Manual Setup and Installation

### MCP Server: Integration with Cursor

Add the server to your Cursor MCP configuration in `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "TalkToFigma": {
      "command": "bunx",
      "args": ["cursor-talk-to-figma-mcp@latest"]
    }
  }
}
```

### WebSocket Server

Start the WebSocket server:

```bash
bun socket
```

### Figma Plugin

1. In Figma, go to Plugins > Development > New Plugin
2. Choose "Link existing plugin"
3. Select the `src/cursor_mcp_plugin/manifest.json` file
4. The plugin should now be available in your Figma development plugins

## Windows + WSL Guide

1. Install bun via powershell

```bash
powershell -c "irm bun.sh/install.ps1|iex"
```

2. Uncomment the hostname `0.0.0.0` in `src/socket.ts`

```typescript
// uncomment this to allow connections in windows wsl
hostname: "0.0.0.0",
```

3. Start the websocket

```bash
bun socket
```

## Usage

1. Start the WebSocket server (`bun socket`).
2. Launch the MCP server (either via `bun run src/talk_to_figma_mcp/server.ts` during development or the published package).
3. Open Figma, run the “Cursor Talk to Figma” plugin, and connect it to the WebSocket channel shown in the plugin UI.
4. Inside Cursor, call the `join_channel` tool once to bind the MCP server to the same channel.
5. Invoke the `figma` tool for every Plugin API interaction.

> Tip: run `bun run generate:manifest` whenever you upgrade `@figma/plugin-typings`. The manifest in `generated/figma-manifest.json` plus `src/generated/figma-manifest.ts` is rebuilt automatically during `bun run build`.

## Single-Tool API Surface

The MCP server now exposes a single high-level tool that dynamically maps to the entire Plugin API.

### `figma`

- **Description:** Invoke any Figma Plugin API method using manifest-driven validation.
- **Input shape:**

  ```jsonc
  {
    "method": "setRelaunchData",
    "path": "figma",
    "args": { "data": { "key": "value" } },
    "context": { "nodeId": "123:456" },
    "options": {
      "subscribe": true,
      "subscriptionId": "optional-fixed-id"
    }
  }
  ```

  - `method` – required string; matches the method name in the manifest.
  - `path` – optional target path (defaults to `figma`). Use `node` plus `context.nodeId`/`context.useSelection` for node methods.
  - `args` – array or object of arguments. When object-shaped, the manifest maps keys to positional params.
  - `overload` – optional index if multiple signatures exist.
  - `context` – selection/node helpers (`nodeId`, `nodeIds`, `useSelection`, `selectionIndex`, `propertyPath`).
  - `options.subscribe` / `options.unsubscribe` – wrap `figma.on`, `Node.on`, and similar APIs. Subscriptions stream events back through the plugin UI and can be retrieved with `get_subscription_events`.

- **Response:** JSON object containing the resolved invocation metadata and the normalized return value. When subscriptions are involved the result includes `subscriptionId`, `subscriptionAction`, and `subscriptionActive` flags.

### `get_manifest`

- **Description:** Returns the generated manifest containing every Plugin API method, overload, parameter list, return type, and doc snippet.
- **Usage:** `{ "filter": "viewport." }` (optional case-insensitive filter).

### `get_subscription_events`

- **Description:** Returns queued events emitted by active subscriptions created via the `figma` tool.
- **Parameters:**
  - `subscriptionId` or `subscriptionIds` – limit to specific subscriptions.
  - `drain` (default `true`) – whether to remove events from the queue after fetching.
- **Response:** Map of subscription IDs to chronological event payloads containing the original data, event name, and timestamps.

### `join_channel`

- **Description:** Join the WebSocket channel announced by the Figma plugin UI.
- **Usage:** `{ "channel": "abc123" }` once per session (subsequent API calls reuse the active channel).

## Working With Subscriptions

1. Call `figma` with `options.subscribe: true` to attach to an event (for example: `{ "method": "on", "path": "figma", "args": { "event": "selectionchange" }, "options": { "subscribe": true } }`).
2. Receive streaming events via `get_subscription_events` or observe them in Cursor’s logging output.
3. Call `figma` again with `options.unsubscribe: true` and the same `subscriptionId` to detach.

Events are buffered per subscription ID so long-running sessions can poll the queue without missing updates.

### MCP Prompts

The MCP server includes several helper prompts to guide you through complex design tasks:

- `design_strategy` - Best practices for working with Figma designs
- `read_design_strategy` - Best practices for reading Figma designs
- `text_replacement_strategy` - Systematic approach for replacing text in Figma designs
- `annotation_conversion_strategy` - Strategy for converting manual annotations to Figma's native annotations
- `swap_overrides_instances` - Strategy for transferring overrides between component instances in Figma
- `reaction_to_connector_strategy` - Strategy for converting Figma prototype reactions to connector lines using the output of 'get_reactions', and guiding the use 'create_connections' in sequence

## Development

### Building the Figma Plugin

1. Navigate to the Figma plugin directory:

   ```
   cd src/cursor_mcp_plugin
   ```

2. Edit code.js and ui.html

## Best Practices

When working with the Figma MCP:

1. Always join a channel before sending commands
2. Get document overview using `get_document_info` first
3. Check current selection with `get_selection` before modifications
4. Use appropriate creation tools based on needs:
   - `create_frame` for containers
   - `create_rectangle` for basic shapes
   - `create_text` for text elements
5. Verify changes using `get_node_info`
6. Use component instances when possible for consistency
7. Handle errors appropriately as all commands can throw exceptions
8. For large designs:
   - Use chunking parameters in `scan_text_nodes`
   - Monitor progress through WebSocket updates
   - Implement appropriate error handling
9. For text operations:
   - Use batch operations when possible
   - Consider structural relationships
   - Verify changes with targeted exports
10. For converting legacy annotations:
    - Scan text nodes to identify numbered markers and descriptions
    - Use `scan_nodes_by_types` to find UI elements that annotations refer to
    - Match markers with their target elements using path, name, or proximity
    - Categorize annotations appropriately with `get_annotations`
    - Create native annotations with `set_multiple_annotations` in batches
    - Verify all annotations are properly linked to their targets
    - Delete legacy annotation nodes after successful conversion
11. Visualize prototype noodles as FigJam connectors:

- Use `get_reactions` to extract prototype flows,
- set a default connector with `set_default_connector`,
- and generate connector lines with `create_connections` for clear visual flow mapping.

## License

MIT
