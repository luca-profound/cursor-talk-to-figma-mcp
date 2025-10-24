# ExecPlan: School Bus QA Review
Created: 2025-10-23
Status: In Progress
Last Updated: 2025-10-23

## Why It Matters
Ensure the school-bus illustration matches the reference so downstream tasks (vector cleanup, animation, export) start from a faithful base.

## Current Context
- Export under review: `assets/school-bus-v1.png`
- Reference image: `assets/ideal-school-bus.webp`
- Scope: Visual QA only (silhouette, proportions, windows/doors, stripes, wheels, bumpers, lights, colors, alignment, stroke consistency). No Figma edits in this plan; deliver a numbered issue list with actionable fixes.

## Success Criteria
- [ ] Provide a concise, numbered list of concrete issues with fixes doable via rectangles, strokes, and text.
- [ ] Cover silhouette, proportions, windows/doors, stripes, wheels/tyres/hubs, bumpers, lights, colors, alignment, and stroke consistency.
- [ ] End the QA note with exactly one of: `APPROVED` or `CHANGES NEEDED`.

## Work Overview
Compare the two images side-by-side, note deltas by category, and translate differences into atomic, Figma-friendly adjustments.

## Milestone 1: Load Assets and Compare
**Scope:** Open both images and examine layout and details.
**Steps:**
1. Open `assets/school-bus-v1.png`.
2. Open `assets/ideal-school-bus.webp`.
3. Note category-wise differences.
**Validation:** Both images visible locally and differences captured.
**Rollback/Fallback:** N/A.
**Status:** Complete

## Milestone 2: Draft Actionable Issues
**Scope:** Turn observations into specific, low-level fixes.
**Steps:**
1. Write 12–18 concise issues with “Fix:” guidance.
2. Keep operations limited to rectangles, strokes, and text.
**Validation:** Issues map cleanly to simple Figma operations.
**Rollback/Fallback:** Trim or merge items if redundancy appears.
**Status:** Complete

## Milestone 3: Deliver QA Note
**Scope:** Post the numbered list and final verdict word.
**Steps:**
1. Paste the list into the chat response.
2. End with exactly one of `APPROVED` or `CHANGES NEEDED`.
**Validation:** Message renders cleanly; final word present.
**Rollback/Fallback:** If missing categories, append and re-send.
**Status:** In Progress

## Progress Log
- 2025-10-23 – Opened assets and drafted issues.

## Decision Log
- 2025-10-23 – Skipped sub-agent design review; task is QA text-only with no canvas edits.

## Validation Summary
- Manual visual inspection performed locally.

## Risks & Follow-Ups
- If future steps require Figma edits, create a new plan with exact node operations.

## Handoff Notes
Respond back here to request Figma-side changes; this plan will then be extended with node-level steps.

