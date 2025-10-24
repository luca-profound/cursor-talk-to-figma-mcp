# ExecPlan: Figma Canvas Advanced Styling Support
Created: 2025-10-24
Status: Draft
Last Updated: 2025-10-24

## Why It Matters
Delivering rich styling (gradients, shadows, effects, complex shapes) through the MCP bridge lets agents complete design tasks without manual Figma intervention. Closing this coverage gap unlocks downstream automation and removes reliance on custom helper tools.

## Current Context
- MCP bridge currently supports manifest-driven method calls via `figma` tool only.
- Property assignments like `node.fills`, `node.effects`, `node.strokeWeight` fail because the bridge only handles callable methods.
- Resolver recently updated to fall back to `figma.getNodeByIdAsync`, so dynamic-page access no longer blocks method calls.
- Previous backup server (`src_backup_pre_single_figma`) exposed ad hoc helpers for styling; new single-tool architecture should replace those without regressions.
- Active Figma channel testing against remote relay `https://thermotactic-rachal-deprecatively.ngrok-free.dev`.

## Success Criteria
- [ ] `figma` tool accepts metadata allowing property assignments (fills, strokes, effects, corner radius, etc.) without new server tools.
- [ ] Nodes styled via gradients, inner/outer shadows, opacity, polygon parameters, etc., from MCP and reflected in the canvas.
- [ ] Exported screenshot confirms applied advanced styling.
- [ ] Regression tests/manual checks verify legacy method calls (e.g., `createRectangle`, `export_node_as_image`) still succeed.

## Work Overview
Augment the manifest invocation pipeline so the plugin can interpret property assignment metadata: resolve the node, deep-clone values, apply them, and return normalized results. Update server/client schema to carry metadata, maintain backward compatibility, and validate by creating complex shapes and exporting images as evidence.

## Milestone 1: Extend Invocation Contract
**Scope:** Define metadata schema for property assignments in the TypeScript server and ensure payloads serialize over the socket.
**Steps:**
1. Update `src/talk_to_figma_mcp/server.ts` invocation schema with optional `metadata.propertyAssignments`.
2. Adjust type definitions (Zod schema, TypeScript) so the `figma` tool accepts the metadata field.
3. Ensure serialization to plugin matches new structure; add logging guard rails if helpful.
**Validation:** Bun typecheck/build succeeds; unit (if any) compile ok.
**Rollback/Fallback:** Revert schema change (no commits) and fall back to method-only support if blockers arise.
**Status:** Complete

## Milestone 2: Apply Property Assignments in Plugin
**Scope:** Teach plugin runtime (`src/cursor_mcp_plugin/code.js`) to detect `propertyAssignments` metadata, deep-clone inputs, and set values on resolved targets before returning.
**Steps:**
1. Modify `executeManifestInvocation` to read metadata, apply assignments, and return structured response.
2. Handle arrays/objects safely (clone to avoid mutation leaks); support multiple properties per invocation.
3. Ensure compatibility with subscription and standard method flows; add guards for unsupported paths.
**Validation:** Manual test via MCP calling `figma` with metadata to change node fill; observe success message in MCP logs.
**Rollback/Fallback:** Disable property assignment path via conditional flag if runtime errors occur.
**Status:** Complete

## Milestone 3: Expose Helper for Advanced Stylings
**Scope:** Create higher-level wrappers (within CLI session or documentation) demonstrating gradients, shadows, polygons using existing manifest entries plus property metadata.
**Steps:**
1. Draft sample MCP calls (rect fill gradient, drop shadow effect, polygon node creation with custom stroke).
2. Execute calls against live channel; adjust payload shapes as needed.
3. Capture resulting node IDs for follow-up exports.
**Validation:** Each call returns `ok: true` and visually alters nodes in Figma.
**Rollback/Fallback:** If a property fails due to manifest gaps, document limitation under Risks & Follow-Ups.
**Status:** Blocked

## Milestone 4: Export Evidence & Regression Check
**Scope:** Verify advanced styles persist and no regressions in existing tools.
**Steps:**
1. Use `export_node_as_image` on styled node; store under `/tmp`.
2. Inspect image locally to confirm visual changes.
3. Re-run core flows (`createRectangle`, basic fill) to ensure no breakage.
**Validation:** Successful export, image reviewed, core commands operational.
**Rollback/Fallback:** If export fails, debug resolver/metadata logic; otherwise revert to previous build.
**Status:** Not Started

## Progress Log
- 2025-10-24 – Plan drafted after identifying need for property assignment support.
- 2025-10-24 – Implemented metadata schema + plugin property assignment handling; build succeeded.
- 2025-10-24 – Blocked: MCP client fails to launch talk_to_figma server after prior processes killed; awaiting human guidance.

## Decision Log
- 2025-10-24 – Use metadata-based property assignments to avoid adding bespoke server tools; maintains single `figma` entry point.

## Validation Summary
- [ ] `bun run build` (server + manifest).
- [ ] Manual MCP calls applying fills/effects return success.
- [ ] Exported screenshot reviewed by sub-agent per figma-skill.

## Risks & Follow-Ups
- Potential manifest limitations for certain advanced APIs; may require fallback helpers.
- Need deep cloning to avoid QuickJS mutation issues; improper handling could crash plugin.
- Large payloads (gradient paint arrays) might exceed message size; monitoring required.

## Handoff Notes
Begin with Milestone 1 schema change, then rebuild and test before progressing to styling validations. Keep relay channel open and ensure plugin refreshed after rebuilding.

## Upon Completion
- [ ] Call `permanently_terminate_session` when all work validated.
- permanently_terminate_session called: false
