# ExecPlan: School Bus Vector (Figma)
Created: 2025-10-23
Status: Draft
Last Updated: 2025-10-23

## Why It Matters
Produce a clean, scalable vector of a classic school bus for reuse across sizes and contexts (marketing assets, UI illustrations) without raster artifacts.

## Current Context
- Reference: `reference-school-bus.webp` (cartoon, bold outlines, flat shading).
- Tools: TalkToFigma MCP connected to channel `0vp3ksl3`.
- Constraints: Primitive creation APIs (rectangles + corner radii) — circles made via square rectangles with radius = width/2; arcs approximated by overlays. No boolean ops exposed.
- Verification: Export frame after each major edit; copy to workspace for reviewer.

## Success Criteria
- [ ] Vector matches reference proportions and style at a glance.
- [ ] All elements grouped and named logically (frame: School Bus Vector).
- [ ] Text "SCHOOL BUS" legible with proper contrast.
- [ ] Wheels appear circular with hub detail; wheel wells read correctly.
- [ ] Reviewer sub-agent returns "all done" with no requested changes.

## Work Overview
Iteratively analyze the reference, refine a build plan, then construct the bus with layered rectangles and controlled corner radii. Use exports + sub-agent reviews at milestones to correct proportions, alignment, and visual balance.

## Analysis Iteration 1 – Shape Decomposition
- Body: Long rounded rectangle (yellow) with thin black outline.
- Nose/Cab: Front rounded block merging into body with strong top-right/bottom-right curvature.
- Windows: Row of 5 light-blue rounded rectangles with white highlight bars.
- Stripe: Thick black band across mid-body with reversed white text "SCHOOL BUS".
- Door: Yellow frame at front with two stacked window panes; central black divider.
- Wheels: Two wheels (similar size) — black outer tire, medium gray rim, dark inner hub; subtle concentric rings.
- Wheel Wells: Yellow arch cutouts above wheels.
- Bumpers/Lights: Black rear bumper; front black bumper and small red light elements.
- Ground Shadow Lines: Thin black stripe low on body; detail line above lower edge.

## Analysis Iteration 2 – Proportions & Grid
- Canvas: 1200×500 frame.
- Body height ≈ 60% of canvas; windows band ≈ upper 40% of body height; stripe ≈ 20–25% body height.
- Nose length ≈ 18–20% of body length; door sits immediately behind nose.
- Wheel centers: ~20% from bottom of body; diameters ≈ 35% of body height; rear wheel centered ~25% from back; front wheel ~25% behind door edge.

## Analysis Iteration 3 – Color & Strokes
- Yellow: #FFC107 (r:1, g:0.755, b:0.027) approximation.
- Black: #111 for fills/stripes; #000 for outlines.
- Window Blue: #DFF3FF base (#E6F7FF ok); white highlights.
- Tire: #111; Rim: #BDBDBD; Hub: #777.
- Strokes: Keep outlines minimal (1–2 px) to preserve cartoon style; rely on stacked shapes otherwise.

## Milestone 1: Plan Finalization
**Scope:** Lock proportions, palette, and build sequence.
**Steps:**
1. Create this ExecPlan with multi-iteration analysis.
2. Confirm channel and tools.
**Validation:** Plan present and readable; channel joined.
**Rollback/Fallback:** N/A.
**Status:** In Progress

## Milestone 2: Frame + Base Body
**Scope:** Create frame; draw bus body and nose blocks.
**Steps:**
1. Create 1200×500 frame named "School Bus Vector".
2. Add main body rectangle (approx 1050×280) centered vertically; radius 24.
3. Add nose rectangle at front with generous right-side radii to form cab.
**Validation:** Export frame; proportions roughly match reference silhouette.
**Rollback/Fallback:** Delete nodes if mis-sized and recreate.
**Status:** Not Started

## Milestone 3: Windows + Stripe + Text
**Scope:** Top windows row, mid-body black stripe, white "SCHOOL BUS" text.
**Steps:**
1. Create five window rectangles with consistent spacing and small corner radius.
2. Draw the black stripe across; center text within stripe.
3. Add white highlight bars to windows.
**Validation:** Export and check spacing and alignment.
**Rollback/Fallback:** Adjust sizes/positions; clone to replicate spacing.
**Status:** Not Started

## Milestone 4: Door + Bumpers + Lights
**Scope:** Front door with two panes and divider; front/rear bumpers; red lights.
**Steps:**
1. Build door frame and windows; add black vertical divider.
2. Add rear bumper, front bumper, and small red lights.
**Validation:** Visual check via export.
**Rollback/Fallback:** Tweak rectangles; delete as needed.
**Status:** Not Started

## Milestone 5: Wheels + Wells + Ground Lines
**Scope:** Concentric wheel construction and wheel well arches via overlays; bottom detail lines.
**Steps:**
1. Build tire/rim/hub as nested rounded rectangles (circles).
2. Place rear and front wheels; overlay yellow arch shapes to simulate wells.
3. Add thin black lower stripe and mid-lower detail line.
**Validation:** Export; ensure wheels read circular and wells look correct.
**Rollback/Fallback:** Resize circles; adjust overlays.
**Status:** Not Started

## Milestone 6: Polish + Review Loop
**Scope:** Colors, alignment, consistent radii; export and call sub-agent reviewer.
**Steps:**
1. Export frame; copy PNG to `exports/` for reviewer.
2. Sub-agent reviews against reference; apply requested tweaks.
3. Repeat until reviewer says "all done".
**Validation:** Sub-agent final approval.
**Rollback/Fallback:** Revert last tweaks; keep previous export for comparison.
**Status:** Not Started

## Progress Log
- 2025-10-23 – Drafted plan and analysis; ready to build.

## Decision Log
- 2025-10-23 – Use rectangles + corner radii to simulate circles/arcs due to API limits.

## Validation Summary
- [ ] Visual exports at each milestone present and accurate.
- [ ] Reviewer returns "all done".

## Risks & Follow-Ups
- Lack of path booleans may limit perfect curves; mitigated via overlays.

## Handoff Notes
Continue with Milestone 2; exports will appear in `/tmp` then be copied to `exports/`.

