# Figma MCP Single-Tool Expansion Plan

## Goals
- Surface 100% of Figma plugin API and supporting platform primitives through a single MCP tool (`figma`).
- Automatically stay current with Figma’s `@figma/plugin-typings` definitions and public documentation.
- Preserve current plugin functionality while enabling future-proofed, manifest-driven execution.

## Phase 0 – Inputs & References
- Local documentation mirror: `figma-plugin-api-docs/developers.figma.com/docs/plugins/api/.../index.html`.
- Typings package: `figma-plugin-api-docs/plugin-typings/package/plugin-api.d.ts` (canonical API surface).
- ESLint guide for environment constraints: `figma-plugin-api-docs/eslint-plugin-figma-plugins-README.md`.

## Phase 1 – Manifest Extraction
1. Implement `scripts/generate-figma-manifest.ts`:
   - Parse `plugin-api.d.ts` via TypeScript Compiler API to enumerate:
     - Global `PluginAPI` methods/properties.
     - Node mixin methods (e.g., `BaseNodeMixin`, `FrameNode`), events, and enums.
     - Result/parameter type metadata (names, optionality, literal unions).
   - Store artifacts as `generated/figma-manifest.json` and `generated/figma-types.ts`.
2. Enrich entries with human-readable docs by scraping downloaded HTML files (linking by anchor IDs when possible).
3. Capture metadata (`supportsAsync`, `returnsPromise`, `deprecated`, etc.).
4. Watch for changes in typings (hash) to regenerate manifest when package updates.

## Phase 2 – Shared Schema & Types
1. Create `src/generated/figma-manifest.ts` exporting strongly typed manifest and helper lookups.
2. Auto-generate Zod schemas for arguments/returns per entry (server-side validation).
3. Emit TypeScript types for request/response payloads (`FigmaInvocation`, `FigmaInvocationResult`).

## Phase 3 – Server Refactor (MCP)
1. Remove explicit tool registrations for individual commands.
2. Register single MCP tool `figma`:
   - Input schema: `{ target: string; method: string; args?: unknown; options?: InvocationOptions }` validated via manifest.
   - Response: success payload, errors, progress events.
3. Integrate manifest-driven validation pipeline:
   - Lookup manifest entry.
   - Zod-validate args.
   - Forward command to plugin with `commandId`, manifest metadata.
4. Handle event subscriptions by allowing `options.subscribe` and streaming progress updates back via MCP events.
5. Provide helper command `get_manifest` (optional) to expose manifest for clients.

## Phase 4 – Plugin Refactor
1. Replace `handleCommand` switch with manifest-driven dispatcher:
   - Resolve execution target (`figma`, `figma.currentPage`, node by ID, etc.).
   - Invoke method using `Reflect.apply`/direct lookup respecting async semantics.
   - Coerce/serialize non-JSON values (TypedArrays, handles, etc.).
2. Ensure errors bubble with stack/metadata so MCP can surface them.
3. Support subscription APIs (`figma.on`/`off`):
   - Track listener IDs.
   - Relay events back to MCP as `command_progress` payloads.
4. Maintain existing helper utilities (progress updates, connection, command queue).

## Phase 5 – Tooling & CI
1. Add `npm scripts`:
   - `generate:manifest`: run manifest generator.
   - `build`: depend on manifest output (fail if missing/outdated).
2. Add smoke tests verifying:
   - Manifest coverage matches `PluginAPI` keys.
   - Sample invocations for sync/async methods.
3. Optionally lint generated files to ensure consistent formatting.

## Phase 6 – Migration & Backwards Compatibility
1. Keep legacy MCP tools behind feature flag for transition period (optional).
2. Document migration steps for clients in `README.md` (include manifest usage example).
3. Provide sample invocation JSON demonstrating typical operations (create node, set properties, subscribe to events).

## Risks & Mitigations
- **API surface drift**: automate manifest regeneration and track package version in outputs.
- **Complex type shapes**: fallback to permissive schemas with warnings when inference insufficient.
- **Event semantics**: thoroughly test subscription lifecycles to avoid leaks or duplicate listeners.

## Deliverables (End of Implementation)
- `PLAN.md` (this document).
- `scripts/generate-figma-manifest.ts` and resulting `generated/` assets.
- Refactored MCP server and plugin code with single `figma` tool.
- Updated documentation and scripts (`README`, `package.json`).
- Passing build/tests demonstrating end-to-end invocation.
