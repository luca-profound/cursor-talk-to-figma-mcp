# ExecPlan: Figma Capability Coverage & Cheat Sheet
Created: 2025-10-24
Status: In Progress
Last Updated: 2025-10-24

## Why It Matters
Documented, proven coverage of core Figma workflows lets future agents move quickly without re-discovering API quirks. A comprehensive cheat sheet with working payloads reduces trial-and-error and ensures parity with human designers.

## Current Context
- Property assignment metadata now works via the single `figma` tool plus `__assignProperties__`.
- Advanced styling (gradients, shadows, strokes) already validated.
- No centralized reference for other complex actions (variables, libraries, layout, component overrides, etc.).
- Need to map high-value designer tasks to concrete MCP invocations.

## Success Criteria
- [ ] Catalog of prioritized Figma actions with at least one validated MCP invocation each.
- [ ] Cheat sheet in `docs/figma-cheatsheet.md` (or similar) summarizing inputs, payload snippets, and caveats.
- [ ] Updated `figma-skill.md` referencing the cheat sheet and highlighting metadata usage.
- [x] All demos exported at correct scales (1× and 2×) and saved to a durable workspace path for verification.

## Work Overview
Research coverage gaps, execute representative actions via MCP, capture payloads/screenshots, and curate into an actionable cheat sheet. Iterate in batches (layout, styling, components, libraries, variables, collaboration) while logging blockers.

## Milestone 1: Inventory Priority Actions
**Scope:** Build a definitive list of Figma capabilities to exercise.
**Steps:**
1. Start from this draft list (see below) and refine with any new requirements.
2. Confirm feasibility per API/manifest (spot-check docs).
3. Classify actions into categories for incremental execution.
**Validation:** Finalized checklist stored inside this plan.
**Rollback/Fallback:** N/A—update list as understanding evolves.
**Status:** Complete

### Proposed Action Coverage
- **Canvas & Geometry**
  - Create frames/artboards (desktop, mobile; e.g., iPhone 15 Pro Max preset).
  - Resize, position, rotate, flip nodes.
  - Arrange/align: align left/center/right, distribute spacing, tidy up.
  - Group/ungroup, set constraints, auto-layout enabling/disabling.
  - Set layout grids (column/row grid).
  - Boolean operations (union, subtract, intersect, exclude).
- **Styling & Effects**
  - Solid/gradient/ image fills; pattern paints.
  - Stroke settings (multi-stroke, dash patterns, join types).
  - Effects: drop shadow, inner shadow, layer blur, background blur.
  - Corner radii (individual corners), corner smoothing.
  - Blend modes, opacity, masks.
  - Color styles & effect styles (create/apply).
- **Typography**
  - Create text nodes, set fonts (loading fonts if needed), typography properties (line height, letter spacing, paragraph spacing).
  - Apply text styles, variable fonts (axes adjustments).
  - Rich text segments (different styles per range).
- **Components & Assets**
  - Create components and component sets (variants).
  - Insert instances, swap components, set variant properties.
  - Smart layout properties (hug, fixed).
  - Apply library components (remote publish + `figma.importComponentByKeyAsync`).
  - Publish library updates (if permitted) / team library toggles.
- **Variables & Tokens**
  - Create variable collections, define modes, create variables.
  - Assign variables to fills/strokes/effects/text.
  - Read variable references from nodes.
  - Use token-like naming conventions.
- **Auto Layout**
  - Enable auto layout on frames.
  - Configure direction, spacing, padding, alignment, distribution.
  - Set item sizing options (fill container, hug contents).
  - Nested auto layout adjustments.
- **Interaction & Prototyping**
  - Set interactions (on click navigate to, open overlay).
  - Configure device presets and flows.
  - Link prototype start points, connections between frames.
- **Libraries & Resources**
  - Import styles/components by key.
  - Acquire style metadata, apply to nodes.
  - Publish local styles/components.
- **Collaboration & Metadata**
  - Set relaunch data, plugin data, shared plugin data.
  - Comments/annotations (if accessible).
  - Selection manipulation, multi-node operations.
- **Images & Media**
  - Place image fills (sourcing from bytes).
  - Export multiple nodes (PDF, SVG, JPG) with custom settings.
- **Constraints & Responsive**
  - Set constraints on child nodes within frames.
  - Test resizing frames with constraints honored.
- **Advanced Geometry**
  - Manipulate vector networks, edit paths, set corner radii on vector points.
  - Create polygons/stars with variable parameters.
- **Collaboration API**
  - Access team/project metadata (if available).
  - Manage branches/files (if accessible).

## Milestone 2: Validate Canvas & Styling Actions
**Scope:** Cover geometry, frames, auto layout, and advanced styling items with working commands and screenshots.
**Status:** Complete

## Milestone 3: Validate Components, Variables, Libraries
**Scope:** Execute component/variant workflows, variable creation/application, and library interactions.
**Status:** Not Started

## Milestone 4: Prototype, Metadata, and Exports
**Scope:** Interactions, relaunch/plugin data, multi-format exports.
**Status:** In Progress

## Milestone 5: Author Cheat Sheet & Update Docs
**Scope:** Compile findings into reference docs and update `figma-skill.md`.
**Status:** In Progress

## Progress Log
- 2025-10-24 – Drafted action coverage list and plan skeleton.
- 2025-10-24 – Milestone 1 completed; inventory finalized.
- 2025-10-24 – Began Milestone 2; initially hit a blocker attaching children due to missing node reference encoding. Resolved by using `__nodeId` + materialization in metadata; verified `appendChild`, grouping, and grid construction succeed via MCP.
- 2025-10-24 – Exported reference panel at 1× and 2×, persisted to `playground/exports/` and updated guidance.

## Decision Log
- 2025-10-24 – Use single `figma` tool with propertyAssignments metadata rather than reintroducing helper tools.

## Validation Summary
- [ ] All prioritized actions executed at least once with screenshot evidence.
- [x] 1×/2× exports available in repo under `playground/exports/`.
- [ ] Cheat sheet committed and linked from `figma-skill.md`.

## Risks & Follow-Ups
- Some API areas (e.g., publishing libraries) may require elevated permissions or are unavailable in relay context.
- Manifest may omit certain prototype APIs; document gaps and potential workarounds.
- High volume of screenshots—need naming convention and cleanup plan.

## Handoff Notes
Begin Milestone 2 once access to Figma channel confirmed; record payloads and outcomes immediately after each action. Update this plan as categories complete.

## Upon Completion
- [ ] Call `permanently_terminate_session` when everything validated/documented.
- permanently_terminate_session called: false

## Export Policy (Updated)
- Always export verification images at two scales: `scale: 1` (1×) and `scale: 2` (2×).
- Save images into `playground/exports/` using the pattern `panel-1x.png`, `panel-2x.png` or `figma-export-<timestamp>-1x.png` / `2x.png`.
- Reference images from durable paths (not `/tmp`) in docs and exec plans.
