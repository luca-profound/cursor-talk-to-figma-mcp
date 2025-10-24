# ExecPlan: School Bus Illustration in Figma
Created: 2025-10-23
Status: Draft
Last Updated: 2025-10-23

## Why It Matters
We need a clean, legible school bus vector in Figma that matches a provided reference image, supports iteration, and can be easily exported. This will serve as a consistent asset for demos and future design tasks.

## Current Context
- Figma MCP channel: `gayfnjw5`.
- Reference image: `playground/ideal school bus.webp`.
- Local notes: `playground/ideal-school-bus-notes.md`.
- Tooling: TalkToFigma MCP tools per `playground/figma-skill.md`.
- Rules: After each canvas mutation, export a preview and review; use a reviewer sub-agent at milestones; maintain this ExecPlan.

## Success Criteria
- [ ] Single frame `School Bus Build` contains the complete bus.
- [ ] Bus uses consistent fills/strokes, aligned shapes, and readable proportions.
- [ ] Text label `SCHOOL BUS` present and legible at 100% zoom.
- [ ] Exported preview image reviewed by a sub-agent; feedback resolved to a positive sign-off.
- [ ] ExecPlan updated with milestones and validation outcomes.

## Work Overview
Construct the bus with rectangles, circles, and text. Keep hierarchy tidy inside a dedicated frame. After each significant step, export the frame for visual validation and request a reviewer pass. Iterate until the reviewer approves fidelity to the reference image.

## Milestone 1: Connect & Inspect
**Scope**
Join channel `gayfnjw5`, fetch document info, and confirm page status.

**Steps**
1. `talk_to_figma.join_channel(channel: "gayfnjw5")`
2. `talk_to_figma.get_document_info()`
3. Confirm or create landing area for work.

**Validation**
- Document tree returns without errors; active page is accessible.

**Rollback/Fallback**
- Rejoin channel if desynchronized. Retry `get_document_info`.

**Status:** Complete

## Milestone 2: Create Working Frame
**Scope**
Add a frame `School Bus Build` ~800×400 at origin. Export baseline image.

**Steps**
1. `create_frame(x: 40, y: 40, width: 800, height: 400, name: "School Bus Build")`
2. `export_node_as_image(nodeId: <frameId>, format: PNG, scale: 1)`

**Validation**
- Image saved to `/tmp/...png`, visually shows empty frame.

**Rollback/Fallback**
- Delete frame and recreate if incorrect size/name.

**Status:** Complete

## Milestone 3: Bus Body & Wheels
**Scope**
Draw primary body, stripe, and wheels in correct proportions and colors.

**Steps**
1. Body: rounded rectangle (approx 700×180), yellow fill (e.g., `r:1, g:0.84, b:0`), corner radius ~20.
2. Lower stripe: dark stripe rectangle full width of body, height ~24–32.
3. Wheels: two circles (diameter ~90), dark gray fills, inner hub lighter gray; position under body.
4. Export frame preview.

**Validation**
- Visual check against `playground/ideal school bus.webp`—body/wheels aligned, stripe positioned.

**Rollback/Fallback**
- Resize/move nodes as needed; adjust colors.

**Status:** Complete

## Milestone 4: Windows, Door, Details
**Scope**
Add window row, driver door, lights, bumpers, stop sign if present in reference, and `SCHOOL BUS` text.

**Steps**
1. Window band: lighter yellow strip; add 4–6 rectangular windows with light blue fill and dark stroke.
2. Door: vertical rectangle near front with midline; add handle.
3. Lights: front/rear small circles; bumpers as dark rectangles.
4. Label: `create_text` with `SCHOOL BUS`, bold, high contrast.
5. Export frame preview.

**Validation**
- Visual match to reference proportions and details.

**Rollback/Fallback**
- Tweak sizes/padding; re-export until layout reads cleanly.

**Status:** In Progress

## Milestone 5: Reviewer Pass & Iteration
**Scope**
Engage reviewer sub-agent with exported image and the reference; incorporate feedback until 100% sign-off.

**Steps**
1. Send prompt to reviewer with: path to export, path to reference image, and intended purpose.
2. Apply suggested corrections: alignment, spacing, color adjustments, typography.
3. Re-export and re-request review until positive sign-off.

**Validation**
- Reviewer states approval with no remaining issues.

**Rollback/Fallback**
- If feedback conflicts, prioritize reference fidelity and clarity; document decisions.

**Status:** In Progress

## Milestone 6: Finalize
**Scope**
Ensure frame is tidy, names are descriptive, and plan is updated.

**Steps**
1. Rename layers descriptively (Body, Stripe, Wheel L/R, Windows, Door, Text).
2. Final export for records.
3. Update ExecPlan metadata and logs.

**Validation**
- Clean hierarchy and final image exists.

**Rollback/Fallback**
- Minor renames or grouping changes as needed.

**Status:** In Progress

## Progress Log
- 2025-10-23 – Drafted plan and created frame (14:34). Export baseline.
- 2025-10-23 – Added body, stripe, wheels, windows, door, trims. Exported v1 to /tmp and copied to playground/exports/school-bus-v1.png for review.
- 2025-10-23 – Reviewer feedback (from /tmp/log.txt) indicated changes: warmer yellow, larger wheels + fenders, thicker strokes, window alignment/count, door width, stripe sizing, add cab windshield/nose.
- 2025-10-23 – Applied: color shift to #F4C21A, wheels + hubs enlarged and repositioned, added fenders, thickened body stroke, minor stripe/window position tweaks. Exported new preview for comparison.

## Decision Log
- 2025-10-23 – Use frame 800×400 for export convenience.

## Validation Summary
- [ ] Figma export shows complete bus.
- [ ] Reviewer sign-off recorded.

## Risks & Follow-Ups
- Reviewer may request stylistic alignment changes; allocate time for iteration.

## Handoff Notes
Continue from Milestone 1 if not yet connected; otherwise follow milestones in order, exporting after each change.

## Upon Completion
- Once all milestones and tasks have been completed, call `permanently_terminate_session`.
- permanently_terminate_session called: false
