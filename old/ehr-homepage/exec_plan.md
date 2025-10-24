# ExecPlan: EHR Homepage — Dark, Tech-Forward
Created: 2025-10-24
Status: In Progress
Last Updated: 2025-10-24

## Why It Matters
We need a production-ready homepage for a modern EHR that conveys trust, speed, and interoperability. A dark, tech-forward aesthetic positions the product as cutting-edge while addressing key buyer concerns: compliance, integrations, reliability, and measurable outcomes.

## Current Context
- Working via TalkToFigma MCP on channel `hadmy0qv` to design the page.
- Repo has `exec-plans/` for plan tracking and `exports/` for artifacts.
- Will iterate with image exports after each canvas change and use a sub-agent reviewer per figma-skill.md.

## Success Criteria
- [ ] Figma canvas contains a full responsive desktop homepage layout (1440px wide), dark theme.
- [ ] Sections: Hero, Trust Logos, Product Highlights, Workflow/Platform, AI/Automation, Integrations, Security & Compliance, Reliability/SLA, Testimonials, CTA, Footer.
- [ ] Exported preview images saved under `exports/` and reviewed by a sub-agent with positive feedback.
- [ ] Implemented responsive website code in `exports/ehr-landing/` with accessible semantics and keyboard/focus-visible support.
- [ ] Dark mode is default and WCAG AA color contrast is respected for text.

## Work Overview
Design in Figma first to finalize layout and visual language, validate with quick reviews, then translate the design into a responsive, accessible static site with minimal JS and strong performance defaults.

## Milestone 1: Figma Canvas Setup
**Scope**
Create the base frame (desktop), define color tokens, typography, spacing, and primitives (buttons, badges, cards) using auto-layout.

**Steps**
1. Join channel `hadmy0qv`.
2. Create `Frame` 1440×4000, fill near-black (#0B0F1A).
3. Add auto-layout: vertical, 80px section spacing, padding 0 (sections handle own padding).
4. Create token swatches: neutrals, accent cyan/blue, success, warning; establish text styles.
5. Export first preview to `exports/ehr-homepage-v1.png` and review.

**Validation**
- Frame exists with correct size, color, auto-layout.
- Tokens and sample components visible.

**Rollback/Fallback**
- If layout feels off, reduce frame height and extend later.
- If plugin errors, retry join and re-run creation.

**Status:** In Progress

## Milestone 2: Hero, Nav, Footer
**Scope**
Add sticky nav with logo and CTAs, craft hero with headline, subhead, primary/secondary CTAs, and a techy product mock. Add footer with links and compliance badges.

**Steps**
1. Nav: left logo, center links, right CTAs (Book a demo, Sign in).
2. Hero: “The Modern EHR for High‑Velocity Care”, subhead, CTAs, visual mock (cards/charts).
3. Footer: navigation, legal, compliance badges (HIPAA, SOC 2, HITRUST).
4. Export to `exports/ehr-homepage-v2.png` and review.

**Validation**
- Clear visual hierarchy and alignment; buttons consistent.

**Rollback/Fallback**
- If hero feels heavy, reduce visual mock size and increase white space.

**Status:** Not Started

## Milestone 3: Feature Sections & Proof
**Scope**
Add features (cards), AI/automation pitch, workflow/Platform architecture, integrations grid, reliability/SLA stats, testimonials and trust logos.

**Steps**
1. Feature grid: Charting, Scheduling, E‑Rx, Interop (FHIR/HL7), Billing, Analytics.
2. AI section: Ambient scribe, smart orders, coding assist, denials prediction.
3. Integrations: logos grid; EHR/FHIR partners, labs, pharmacies, payers, calendars.
4. Security & Compliance: bullet highlights and certifications.
5. Reliability: 99.99% uptime, sub‑100ms key flows, audit logs.
6. Testimonials/case studies with avatars and outcomes.
7. Export to `exports/ehr-homepage-v3.png` and review.

**Validation**
- Balanced spacing, consistent card system, coherent typography.

**Rollback/Fallback**
- Collapse to fewer features if vertical space becomes too long.

**Status:** Not Started

## Milestone 4: Design Review Loop
**Scope**
Use sub-agent(s) to review exported images. Incorporate feedback until a positive review.

**Steps**
1. Copy latest `/tmp/*.png` export to `exports/` for sub-agent visibility.
2. Ask reviewer to evaluate structure, alignment, clarity, and brand fit.
3. Iterate in Figma and re-export until the review is positive.

**Validation**
- Reviewer signals no major issues.

**Rollback/Fallback**
- If reviewer conflicted, provide two variant explorations and decide via checklist.

**Status:** Not Started

## Milestone 5: Implement Responsive Website
**Scope**
Translate the design into a static site under `exports/ehr-landing/` with semantic HTML, CSS variables for tokens, fluid type/spacing, and minimal JS.

**Steps**
1. Scaffold `index.html`, `styles.css`, `app.js`, and `assets/`.
2. Implement tokens, layout primitives, and components.
3. Implement all sections with responsive breakpoints and prefers-reduced-motion support.
4. Add focus-visible, skip link, aria labels, and color-contrast rules.
5. Lighthouse pass (manual) and optimize images.

**Validation**
- Works on 320–1440 widths, keyboard navigable, lighthouse >90.

**Rollback/Fallback**
- If time constrained, ship a single-page with reduced animations and progressive enhancement.

**Status:** In Progress

## Milestone 6: QA & Ship Readiness
**Scope**
Smoke test flows, ensure assets referenced correctly, finalize metadata.

**Steps**
1. Manual QA on major browsers and mobile widths.
2. Check link targets, aria labels, and favicon/OG tags.
3. Final export image and reviewer confirmation.

**Validation**
- Reviewer approval and no broken links.

**Rollback/Fallback**
- Remove non-critical sections if blockers found.

**Status:** Not Started

## Progress Log
- 2025-10-24 – Plan created and aligned with figma-skill.md.
- 2025-10-24 – Joined Figma channel `hadmy0qv` successfully.
- 2025-10-24 – Implemented static site scaffold at `exports/ehr-landing/` with dark theme CSS and minimal JS.
- 2025-10-24 – Attempted Figma frame creation; wrapper methods (e.g., `create_frame`) and raw API calls (e.g., `figma.createFrame`) returned tool errors. Escalating to human for MCP method/manifest guidance.

## Decision Log
- 2025-10-24 – Default dark palette with cyan/blue accent; aligns with tech-forward brief while preserving AA contrast.

## Validation Summary
- [ ] Figma export `exports/ehr-homepage-*.png` present and reviewed.
- [ ] Static site loads with all assets; responsive and accessible basics validated.

## Risks & Follow-Ups
- Brand assets (logos, exact font choices) may change later; using system-safe or Google fonts as placeholders.
- Placeholder partner logos may need legal review.

## Handoff Notes
Continue from Milestone 1 if resuming. Latest images reside in `exports/`. Channel `hadmy0qv` is required for Figma operations.

## Upon Completion
- Call `permanently_terminate_session` when all success criteria are met.
- permanently_terminate_session called: false
