# ExecPlan: Ambulatory EHR Homepage (Dark Mode)
Created: 2025-10-23
Status: In Progress
Last Updated: 2025-10-23

## Why It Matters
Ambulatory medical groups buy on speed, clinician usability, and assurance of compliance/security. A tech-forward, dark-mode homepage will position us as modern and credible, convert demo requests, and clearly differentiate on charting speed, interoperability, and revenue outcomes.

## Current Context
- Target buyer: Administrators, CMIOs, and practice managers at 10–200 clinician ambulatory groups.
- Brand: Tech-forward, calm confidence; dark mode only for launch.
- Design surface: Figma via TalkToFigma MCP channel `zsyg3kke`.
- Deliverables: Production-ready homepage design (desktop first), responsive guidance, exportable assets, dev handoff notes, and reviewer sign-off.
- Constraints: No external brand kit; we will define minimal tokens. No existing product screenshots—use tasteful abstract UI mock and layout scaffolds.

## Success Criteria
- [ ] Desktop 1440px-wide full-page design completed in Figma, visually coherent and aligned.
- [ ] Clear market positioning copy tailored to ambulatory groups; no lorem ipsum.
- [ ] Dark theme tokens defined and applied consistently (backgrounds, surfaces, text, accents, states).
- [ ] Primary CTA “Book a demo” prominent and repeated; secondary “See it in action”.
- [ ] Sections: Nav, Hero, Social proof, Value props, 3–4 feature blocks, Workflow diagram, Integrations, Security/Compliance, Testimonials, Pricing/CTA, Footer.
- [ ] Exported preview image(s) in `/tmp` for review agent; feedback addressed.
- [ ] Dev handoff: spacing scale, type scale, color tokens, component notes, responsive guidance.
- [ ] Accessibility: color contrast passes WCAG AA for dark mode.

## Work Overview
We will design a cohesive dark-only homepage in Figma with defined tokens, structured sections, and strong copy targeted at ambulatory groups. We will iteratively export previews, run an independent sub-agent design review, and incorporate feedback until approved. Deliver a developer handoff section to accelerate implementation.

## Milestone 1: Join Figma and Scaffold Canvas
**Scope**: Connect to channel `zsyg3kke`, create a 1440×3200 desktop frame titled “EHR Home — Dark”, and set a dark background. Add a top-level page cover and grid guides.
**Steps**:
1. Join channel `zsyg3kke`.
2. Create frame (x:0, y:0, w:1440, h:3200), name: `EHR Home — Dark`.
3. Set base fill to `#0B0F11` (r:0.043, g:0.059, b:0.067).
4. Add an inner content container (auto-layout vertical, 1200px max width, centered) with padding.
5. Export a preview to `/tmp` and capture the image path.
**Validation**: Frame visible, correct size, background color applied, content container exists.
**Rollback/Fallback**: Delete created nodes and recreate.
**Status**: Not Started

## Milestone 2: Define Dark Tokens and Type Scale
**Scope**: Establish color tokens and typography for dark theme and set usage guidance.
**Steps**:
1. Colors: bg `#0B0F11`, surface `#12171A`, elevated `#151B1F`, stroke `#263036`, text-primary `#E6EDF3`, text-secondary `#9FB2BF`, accent `#00D4FF`, accent-2 `#7CFFB6`, warning `#FEC84B`, danger `#FF6B6B`.
2. Gradients: accent radial/candy stripe for hero.
3. Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64.
4. Type: Display 56/64 bold, H1 44/52, H2 32/40, H3 24/32, Body 16/24, Small 14/22.
5. Apply tokens to sample chips and annotate usage.
**Validation**: Token chips present and legible; contrast checks pass.
**Rollback/Fallback**: Adjust color values upward for contrast.
**Status**: Not Started

## Milestone 3: Navigation and Hero
**Scope**: Build sticky nav with logo, primary links, and CTA. Create hero with bold statement, subcopy, CTAs, and abstract product mock.
**Steps**:
1. Nav: Brand wordmark, links (Product, Solutions, Pricing, Security, Resources), CTA `Book a demo`.
2. Hero headline: “The EHR clinicians don’t dread.”
3. Subcopy tailored to ambulatory groups; ≤ 2 lines.
4. Primary CTA `Book a demo`, Secondary `See it in action`.
5. Abstract product mock: rounded card with layered panels and soft glow.
**Validation**: Visual hierarchy strong; CTAs obvious; clean spacing.
**Rollback/Fallback**: Reduce effects; simplify copy.
**Status**: Not Started

## Milestone 4: Value Props and Feature Sections
**Scope**: Three value props row; three to four deep feature blocks with bullets and visuals.
**Steps**:
1. Value props: “Chart 40% faster”, “Fewer clicks, fewer denials”, “Plug into your stack”.
2. Feature blocks: Charting & Orders; Scheduling & Intake; Revenue & Denials; Interoperability (FHIR/HL7).
3. Each block includes title, 2–3 bullets, and visual tile.
**Validation**: Consistent layout and rhythm; concise bullets.
**Rollback/Fallback**: Drop to three feature blocks if crowded.
**Status**: Not Started

## Milestone 5: Workflow, Integrations, Security
**Scope**: Patient journey mini-diagram, integration logos list, and security/compliance section.
**Steps**:
1. Workflow: Intake → Visit → Orders → Billing → Follow-up, connected.
2. Integrations: Heads-up list (Epic CareEverywhere, Redox, Change Healthcare, Labcorp, Quest, Zoom, Twilio).
3. Security: HIPAA, SOC 2 Type II, SSO (Okta/Azure AD), encryption, audit logs, BAA.
**Validation**: Clear, scannable; no clutter.
**Rollback/Fallback**: Condense to simple bullet list.
**Status**: Not Started

## Milestone 6: Social Proof, Pricing CTA, Footer
**Scope**: Testimonials carousel or quotes, final CTA, and structured footer.
**Steps**:
1. Testimonial: Quote from CMIO with name/role.
2. Pricing CTA: “Book a demo” with supporting copy.
3. Footer: Product, Solutions, Company, Security, Legal, Contact; copyright.
**Validation**: Balanced spacing; CTA visible above the fold region of each scroll.
**Rollback/Fallback**: Reduce to single quote.
**Status**: Not Started

## Milestone 7: Export, Review, Iterate
**Scope**: Export PNG of the frame to `/tmp`, run sub-agent review, apply feedback, and repeat until green.
**Steps**:
1. Export the main frame.
2. Invoke sub-agent with prompt to review only the exported image(s) vs requirements.
3. Capture feedback; enumerate changes; apply and re-export.
**Validation**: Reviewer indicates coherence and no major issues.
**Rollback/Fallback**: If blocking feedback persists, escalate for human guidance.
**Status**: Not Started

## Milestone 8: Dev Handoff Notes
**Scope**: Document tokens, spacing, type scale, components, and responsive guidance.
**Steps**:
1. Add annotation section in Figma and mirror in this plan.
2. Provide CSS variables mapping and component redlines.
3. List motion and hover states for CTAs.
**Validation**: A front-end engineer can implement without further design work.
**Rollback/Fallback**: Add supplementary callouts or exports.
**Status**: Not Started

## Progress Log
- 2025-10-23 – Drafted execution plan and prepared milestones.

## Decision Log
- 2025-10-23 – Dark-only launch: simplifies polish and branding; ensures cohesive first impression.
- 2025-10-23 – Abstract product visuals instead of real screenshots to avoid misrepresenting current UI while conveying capability.

## Validation Summary
- [ ] Exported frame image in `/tmp` for review.
- [ ] Sub-agent review passes with no major issues.
- [ ] Contrast checks meet WCAG AA for text.

## Risks & Follow-Ups
- Real product screenshots may be required later for authenticity.
- Brand identity might evolve; token names help minimize refactor.

## Handoff Notes
Next implementer: follow milestones in order; after each section, export and run the reviewer. Keep this plan updated (Last Updated, statuses, logs). When all criteria pass, mark Status: Complete and notify engineering.

## Upon Completion
- Once all milestones and tasks have been completed, call `permanently_terminate_session`.
- permanently_terminate_session called: false

