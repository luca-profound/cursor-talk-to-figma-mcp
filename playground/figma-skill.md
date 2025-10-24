# TalkToFigma MCP Tool Reference

Use these tools through the `TalkToFigma` MCP server to inspect and manipulate a live Figma document. Most tools mirror Figma plugin APIs; parameters follow the same units Figma uses (positions and sizes in pixels, colors as 0–1 floats). Unless noted otherwise, arguments are required.

## Document & Selection

### `get_document_info`
- **Purpose:** Return the full document structure and metadata.
- **Parameters:** _None_
- **Notes:** Returns raw JSON from the plugin. Ideal first step to understand page hierarchy.

### `get_selection`
- **Purpose:** Inspect the nodes currently selected in Figma.
- **Parameters:** _None_
- **Notes:** Always verify selection before mutating nodes; returns an array with node IDs and metadata.

### `read_my_design`
- **Purpose:** Dump complete node details (including children) for the current selection.
- **Parameters:** _None_
- **Notes:** For large selections the response can be large; use to audit properties before edits.

### `get_node_info`
- **Purpose:** Fetch detailed data for a single node.
- **Parameters:**
  - `nodeId` (`string`) – Target node ID.
- **Notes:** Filters out vector-only details to reduce noise; returns nested children info.

### `get_nodes_info`
- **Purpose:** Batch `get_node_info` call.
- **Parameters:**
  - `nodeIds` (`string[]`) – List of node IDs to inspect.
- **Notes:** Returns an array of filtered node payloads; useful before batch operations.

### `set_focus`
- **Purpose:** Select one node and scroll viewport to it.
- **Parameters:**
  - `nodeId` (`string`) – Node to focus.
- **Notes:** Call after creating/moving nodes to spotlight results.

### `set_selections`
- **Purpose:** Replace the current selection with specific nodes.
- **Parameters:**
  - `nodeIds` (`string[]`) – IDs to select.
- **Notes:** Response includes the resolved names/IDs to confirm selection count.

## Creation & Destruction

### `create_rectangle`
- **Purpose:** Draw a new rectangle.
- **Parameters:**
  - `x`, `y` (`number`) – In-canvas position.
  - `width`, `height` (`number`) – Dimensions in pixels.
  - `name` (`string`, optional) – Layer name (defaults to `"Rectangle"`).
  - `parentId` (`string`, optional) – Parent frame/page. Without it, placed on the current page.

### `create_frame`
- **Purpose:** Create a frame with optional auto-layout configuration.
- **Parameters:**
  - `x`, `y`, `width`, `height` (`number`) – Frame position and size.
  - `name` (`string`, optional, default `"Frame"`).
  - `parentId` (`string`, optional) – Parent node.
  - `fillColor` (`{r,g,b,a?}`, optional, default white).
  - `strokeColor` (`{r,g,b,a?}`, optional).
  - `strokeWeight` (`number`, optional).
  - `layoutMode` (`"NONE" | "HORIZONTAL" | "VERTICAL"`, optional).
  - `layoutWrap` (`"NO_WRAP" | "WRAP"`, optional).
  - `paddingTop|Right|Bottom|Left` (`number`, optional).
  - `primaryAxisAlignItems` (`"MIN" | "MAX" | "CENTER" | "SPACE_BETWEEN"`, optional).
  - `counterAxisAlignItems` (`"MIN" | "MAX" | "CENTER" | "BASELINE"`, optional).
  - `layoutSizingHorizontal` / `layoutSizingVertical` (`"FIXED" | "HUG" | "FILL"`, optional).
  - `itemSpacing` (`number`, optional) – Ignored when primary alignment is `SPACE_BETWEEN`.
- **Notes:** All colors expect 0–1 floats. Set `parentId` to keep hierarchy tidy.

### `create_text`
- **Purpose:** Insert a text node.
- **Parameters:**
  - `x`, `y` (`number`) – Position.
  - `text` (`string`) – Text content.
  - `fontSize` (`number`, optional, default `14`).
  - `fontWeight` (`number`, optional, default `400`).
  - `fontColor` (`{r,g,b,a?}`, optional, default black).
  - `name` (`string`, optional, default `"Text"`).
  - `parentId` (`string`, optional) – Parent node.

### `clone_node`
- **Purpose:** Duplicate an existing node.
- **Parameters:**
  - `nodeId` (`string`) – Source node.
  - `x`, `y` (`number`, optional) – Override position for the clone.
- **Notes:** Returns the new ID. If `x`/`y` omitted, clone inherits original coordinates.

### `move_node`
- **Purpose:** Reposition a node.
- **Parameters:**
  - `nodeId` (`string`), `x` (`number`), `y` (`number`).
- **Notes:** Works on any movable node; use `get_node_info` afterwards to confirm bounding box.

### `resize_node`
- **Purpose:** Set explicit width/height.
- **Parameters:**
  - `nodeId` (`string`), `width` (`number` > 0), `height` (`number` > 0).
- **Notes:** Auto-layout children may ignore manual resize; adjust layout settings first if needed.

### `delete_node`
- **Purpose:** Remove a node permanently.
- **Parameters:**
  - `nodeId` (`string`).
- **Notes:** No undo from the MCP side—confirm via `set_focus`/`get_selection` before deleting.

### `delete_multiple_nodes`
- **Purpose:** Batch delete.
- **Parameters:**
  - `nodeIds` (`string[]`).
- **Notes:** Returns plugin summary of deletions; useful for cleaning clones.

## Styling & Appearance

### `set_fill_color`
- **Purpose:** Apply a solid fill.
- **Parameters:**
  - `nodeId` (`string`).
  - `r`, `g`, `b` (`number` 0–1).
  - `a` (`number` 0–1, optional, default `1`).
- **Notes:** Overrides existing fills with a single solid color.

### `set_stroke_color`
- **Purpose:** Set stroke color and weight.
- **Parameters:**
  - `nodeId` (`string`), `r`, `g`, `b` (`number` 0–1).
  - `a` (`number` 0–1, optional, default `1`).
  - `weight` (`number`, optional, default `1`).
- **Notes:** Applies a single stroke style; wrap colors in floats, not 0–255 integers.

### `set_corner_radius`
- **Purpose:** Uniform or per-corner rounding.
- **Parameters:**
  - `nodeId` (`string`).
  - `radius` (`number` ≥ 0).
  - `corners` (`boolean[4]`, optional, order `[topLeft, topRight, bottomRight, bottomLeft]`, default all `true`).
- **Notes:** When `corners` omitted, radius applied to all corners.

## Auto-Layout & Spacing

### `set_layout_mode`
- **Purpose:** Enable/disable auto-layout direction.
- **Parameters:**
  - `nodeId` (`string`).
  - `layoutMode` (`"NONE" | "HORIZONTAL" | "VERTICAL"`).
  - `layoutWrap` (`"NO_WRAP" | "WRAP"`, optional, default `"NO_WRAP"`).
- **Notes:** Wrap only takes effect on HORIZONTAL/VERTICAL layouts.

### `set_padding`
- **Purpose:** Adjust frame padding.
- **Parameters:**
  - `nodeId` (`string`).
  - `paddingTop|Right|Bottom|Left` (`number`, each optional).
- **Notes:** Provide only the sides you want to update.

### `set_axis_align`
- **Purpose:** Set primary/counter axis alignment.
- **Parameters:**
  - `nodeId` (`string`).
  - `primaryAxisAlignItems` (`"MIN" | "MAX" | "CENTER" | "SPACE_BETWEEN"`, optional).
  - `counterAxisAlignItems` (`"MIN" | "MAX" | "CENTER" | "BASELINE"`, optional).
- **Notes:** Omitted axes remain unchanged. `SPACE_BETWEEN` ignores `itemSpacing`.

### `set_layout_sizing`
- **Purpose:** Control horizontal/vertical resizing behavior.
- **Parameters:**
  - `nodeId` (`string`).
  - `layoutSizingHorizontal` (`"FIXED" | "HUG" | "FILL"`, optional).
  - `layoutSizingVertical` (`"FIXED" | "HUG" | "FILL"`, optional).
- **Notes:** Use `FILL` only for auto-layout children; frames/text support `HUG`.

### `set_item_spacing`
- **Purpose:** Update spacing between auto-layout children or wrapped rows.
- **Parameters:**
  - `nodeId` (`string`).
  - `itemSpacing` (`number`, optional) – main-axis gap.
  - `counterAxisSpacing` (`number`, optional) – cross-axis spacing, works with wrap.
- **Notes:** Send only the values you need to change; response echoes the applied settings.

## Text Operations

### `set_text_content`
- **Purpose:** Replace text on a single node.
- **Parameters:**
  - `nodeId` (`string`).
  - `text` (`string`) – New content.
- **Notes:** Does not auto-resize frames; consider `set_layout_sizing` when text grows.

### `scan_text_nodes`
- **Purpose:** Collect text nodes under a parent node.
- **Parameters:**
  - `nodeId` (`string`).
- **Notes:** Internally chunked (10 nodes per batch) for large documents; response includes progress summary and the text node list.

### `set_multiple_text_contents`
- **Purpose:** Batch text replacement with chunking.
- **Parameters:**
  - `nodeId` (`string`) – Common ancestor for text nodes.
  - `text` (`{ nodeId: string; text: string }[]`) – Replacement pairs.
- **Notes:** Processes in batches of five and returns applied vs failed counts plus per-node errors.

## Components & Library Data

### `create_component_instance`
- **Purpose:** Drop an instance of a published component.
- **Parameters:**
  - `componentKey` (`string`) – Component key from Figma.
  - `x`, `y` (`number`) – Placement on canvas.
- **Notes:** Component must exist in the document’s library scope.

### `get_instance_overrides`
- **Purpose:** Capture overrides from a source instance.
- **Parameters:**
  - `nodeId` (`string`, optional) – Specific instance to read; defaults to currently selected instance when omitted.
- **Notes:** Response indicates success/failure; used before `set_instance_overrides`.

### `set_instance_overrides`
- **Purpose:** Apply stored overrides to other instances.
- **Parameters:**
  - `sourceInstanceId` (`string`) – Instance that holds the desired overrides.
-  - `targetNodeIds` (`string[]`) – Instances that should receive the overrides (empty array falls back to selection inside plugin).
- **Notes:** Returns counts for successful applications; ensure targets share the same main component as the source.

### `get_styles`
- **Purpose:** List local paint/text/effect styles.
- **Parameters:** _None_
- **Notes:** Returns raw style data to help match design tokens.

### `get_local_components`
- **Purpose:** List components defined in the current file.
- **Parameters:** _None_
- **Notes:** Combine with `create_component_instance` to instantiate by key.

### `scan_nodes_by_types`
- **Purpose:** Find descendant nodes of specific types.
- **Parameters:**
  - `nodeId` (`string`) – Root for the scan.
-  - `types` (`string[]`) – Node type names (e.g. `["INSTANCE", "FRAME"]`).
- **Notes:** Response includes bounding boxes; initial text summarises matches.

## Annotations

### `get_annotations`
- **Purpose:** Retrieve annotations on a node or entire document.
- **Parameters:**
  - `nodeId` (`string`) – Node to inspect (plugin expects a node ID).
-  - `includeCategories` (`boolean`, optional, default `true`) – Whether to include available categories.
- **Notes:** Response includes annotations and categories arrays.

### `set_annotation`
- **Purpose:** Create or update a single annotation.
- **Parameters:**
  - `nodeId` (`string`) – Node receiving the annotation.
-  - `annotationId` (`string`, optional) – Provide to update existing annotation.
-  - `labelMarkdown` (`string`) – Markdown label content.
-  - `categoryId` (`string`, optional) – Category to assign.
-  - `properties` (`{ type: string }[]`, optional) – Extra annotation properties.
- **Notes:** Returns plugin confirmation payload.

### `set_multiple_annotations`
- **Purpose:** Batch annotation creation/update with progress feedback.
- **Parameters:**
  - `nodeId` (`string`) – Common ancestor containing the nodes to annotate.
-  - `annotations` (`{ nodeId: string; labelMarkdown: string; categoryId?; annotationId?; properties?: { type: string }[] }[]`).
- **Notes:** Processes in batches of five; response outlines successes, failures, and per-node diagnostics.

## Prototyping & Connectors

### `get_reactions`
- **Purpose:** Pull prototype reactions for multiple nodes.
- **Parameters:**
  - `nodeIds` (`string[]`) – Nodes to inspect.
- **Notes:** Response includes JSON plus a reminder to run the `reaction_to_connector_strategy` prompt before calling `create_connections`.

### `set_default_connector`
- **Purpose:** Register a connector style for FigJam connections.
- **Parameters:**
  - `connectorId` (`string`, optional) – ID of a connector node to adopt; omit to check whether a default is already set.
- **Notes:** Run before `create_connections`. If no default is present, user must copy a connector shape in FigJam and provide its ID.

### `create_connections`
- **Purpose:** Draw connector lines between nodes.
- **Parameters:**
  - `connections` (`{ startNodeId: string; endNodeId: string; text?: string }[]`).
- **Notes:** Requires a default connector. Combine with `get_reactions` + prompt to build the payload.

## Export

### `export_node_as_image`
- **Purpose:** Export a node and save it to `/tmp` with a unique filename. The tool reports `Image saved to /tmp/<filename>`.
- **Parameters:**
  - `nodeId` (`string`).
-  - `format` (`"PNG" | "JPG" | "SVG" | "PDF"`, optional, default `"PNG"`).
-  - `scale` (`number`, optional, default `1`).
- **Notes:** Visit the saved file path (e.g. `open /tmp/...`) to view the export locally. PNG and JPG files can be previewed with the Codex `view image` tool, but SVG files must be opened as plain source code because they currently break `view image`.

## Channel Management

### `join_channel`
- **Purpose:** Associate the session with a WebSocket channel so Figma and the MCP stay in sync.
- **Parameters:**
  - `channel` (`string`, optional) – Channel name. When omitted, tool requests a follow-up call with a value.
- **Notes:** Must be called (with a valid name) before issuing Figma commands. Rejoining replaces any previous channel.

## Rules to Stay on Track
1. Every time you make a change to the figma canvas, request an image to be supplied immediately afterward, then read it from /tmp. This is essential to make sure you can continue to "see" your changes as you apply them.
2. Whenever you reach a major milestone, you should invoke a sub-agent and get it to independently review your work. Don't bias the agent. Just say something like "Please view the image here: /tmp/whatever.png. A designer made this for the purpose of X. It is a Y. Please review whether it looks coherent, if there are any things amiss (such as misalignment, poor structure, etc), and if there is any room for improvement. Be specific about your feedback." Always make sure to incorporate the feedback from the agent until you get a very good review from the agent without additional changes. If you received other instructions from the human in your original prompt such as reference images, inspiration images, or other requirements, you need to supply those to the sub-agent so that it knows how to grade you.
3. As you get an assignment, make sure to write an execution plan first. It is a living document that you put as a markdown file in exec-plans. You should update it as you accomplish different milestones so you stay on track. Make sure to read exec-plans/EXEC_PLANS.md for further guidance on it.
4. When using a sub-agent judge, always instruct it to not look at any other files, only to open the two reference images. This will prevent it from biasing itself by trying to locate your exec plan or other resources.
5. If you have trouble calling the subagent via codex MCP tool (for instance if the tool returns an error), then you can fallback to `/home/luca/code/codex/codex-rs/target/release/codex exec "your prompt" --output-last-message /tmp/someuniquefilename.txt > /dev/null 2>&1`. This will work directly from the binary and then you can read the response from /tmp. Use 20 minutes for timeout_ms to make sure it doesn't time out early on you.