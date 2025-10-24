# ExecPlan: Figma School Bus Illustration
Created: 2025-10-24
Status: In Progress
Last Updated: 2025-10-24 04:08 UTC

## Why It Matters
Deliver a clean, legible, production-ready school bus illustration in Figma that matches the provided reference, exports crisply at multiple scales, and has tidy layer structure for future edits.

## Current Context
- Figma MCP channel: `ae58iw4g` (join at start of each session).
- Reference image: `playground/reference-school-bus.webp`.
- Local notes: `playground/ideal-school-bus-notes.md`.
- Tools: TalkToFigma MCP per `playground/figma-skill.md`.
- Rule: After each canvas mutation, export a preview and visually review.

## Success Criteria
- [ ] One frame named `School Bus Build` contains the full illustration.
- [ ] Proportions, spacing, and colors read cleanly against the reference.
- [ ] Wheels appear circular with hubs; windows aligned and consistent.
- [ ] Label `SCHOOL BUS` legible at 100% zoom with good contrast.
- [ ] Sub-agent reviewer approves without remaining issues.
- [ ] Exports saved in `playground/exports/` at 1x and 2x.

## Work Overview
Construct the bus using rectangles with corner radii to simulate rounded shapes. Use `set_fill_color`, `set_stroke_color`, and `set_corner_radius`. Keep all nodes parented under the main frame. Export and validate after each substantive change.

## Milestone 1: Scaffold Workspace
**Scope**
Join channel, create the working frame, and focus viewport.

**Steps**
1. `join_channel(channel: "ae58iw4g")`
2. `create_frame(x: 40, y: 40, width: 800, height: 400, name: "School Bus Build")`
3. Export empty frame to confirm export pipeline.

**Validation**
- Export saved to `/tmp/*.png` and copied to `playground/exports/`.

**Rollback/Fallback**
- Rejoin channel if desynced; delete and recreate frame if mis-sized.

**Status:** In Progress (blocked on API bridge; escalation pending)

## Milestone 2: Base Body + Wheels
**Scope**
Main body, stripe, and two wheels with hubs.

**Steps**
1. Body: rounded rectangle ~700×180, corner radius ~20, yellow fill.
2. Stripe: black rectangle across mid-body; later holds text.
3. Wheels: two circles (squares with radius=width/2): outer tire black, inner rim gray, hub darker.
4. Export preview (PNG 2x) and compare to reference.

**Validation**
- Wheels aligned relative to body; no clipping at frame edges.

**Rollback/Fallback**
- Resize/move nodes; adjust colors.

**Status:** Pending

## Milestone 3: Windows, Door, Details
**Scope**
Window band and panes, front door, bumpers, lights, and label.

**Steps**
1. Windows: 4–6 rounded rectangles with light blue fill, even spacing.
2. Door: front vertical rectangle with divider and handle.
3. Bumpers/Lights/Mirror: small rectangles/circles; add as needed for coherence.
4. Label: `SCHOOL BUS` black text on yellow (or reversed in stripe if needed).
5. Export preview (PNG 2x) and compare to reference.

**Validation**
- Readable at 100% zoom; spacing consistent.

**Rollback/Fallback**
- Adjust spacing and sizing; iterate.

**Status:** Pending

## Milestone 4: Polish + Sub-Agent Review
**Scope**
Alignment, spacing, naming. Reviewer feedback loop.

**Steps**
1. Tidy layer names; group logically under frame.
2. Export and store in `playground/exports/`.
3. Run sub-agent review against reference; apply feedback and re-export until pass.

**Validation**
- Sub-agent returns positive sign-off.

**Rollback/Fallback**
- Defer subjective tweaks that fight reference fidelity; document rationale in Decision Log.

**Status:** Pending

## Progress Log
- 2025-10-24 04:00 UTC – Plan created; ready to join channel and scaffold frame.
- 2025-10-24 04:07 UTC – Joined Figma channel `ae58iw4g` successfully.
- 2025-10-24 04:08 UTC – Attempted `figma.createFrame` and helpers via TalkToFigma generic bridge; calls failed. Preparing escalation to enable helper tools or expose working generic invocations.

## Decision Log
- 2025-10-24 – Use rectangles + corner radii for circles to keep within available APIs.

## Validation Summary
- [ ] Empty frame export captured.
- [ ] Body + wheels aligned; stripe centered.
- [ ] Windows + door coherent; label legible.
- [ ] Reviewer approval recorded.

## Risks & Follow-Ups
- The generic `figma` method bridge rejected creation calls (`figma.createFrame`, `figma.createNodeFromSvg`) despite an active channel. Action: request enablement of helper tools (`create_frame`, `create_rectangle`, `export_node_as_image`) or confirm correct invocation contract for the generic bridge (method id vs path/scope/args).
- If fill/stroke setters fail, fallback to creating pre-styled rectangles and circles via SVG once the bridge works; avoid SVG unless necessary.

## Handoff Notes
Continue with Milestone 1. Always export after each change and copy the file into `playground/exports/`.
