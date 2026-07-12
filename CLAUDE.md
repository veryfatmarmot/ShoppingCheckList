# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A spec-driven MVP for a cross-platform shopping list app with catalog-based recurring purchases. Primary targets: Android and Web (via Expo). Secondary target: iOS.

The specs in `specs/` are the source of truth for product behavior, domain rules, and data contracts — not this file. This file is about how to operate in the repo day-to-day.

## Commands

```powershell
# Install (from repo root)
npm.cmd install

# Typecheck each package (no root-level "typecheck" script exists)
cmd /c .\node_modules\.bin\tsc.cmd --noEmit -p packages\domain\tsconfig.json
cmd /c .\node_modules\.bin\tsc.cmd --noEmit -p packages\data\tsconfig.json
cmd /c .\node_modules\.bin\tsc.cmd --noEmit -p apps\mobile\tsconfig.json

# Run all tests (Vitest, root-level, picks up *.test.ts across workspaces)
npm.cmd test

# Run a single test file
npx vitest run packages/domain/src/validation.test.ts

# Lint (ESLint flat config at repo root: typescript-eslint + react-hooks)
npm.cmd run lint

# Format / check formatting (Prettier; line endings are LF via .gitattributes)
npm.cmd run format
npm.cmd run format:check

# Run the app
npm.cmd run mobile:web       # Expo web
npm.cmd run mobile:android   # Expo Android (Expo Go)

# Firebase (rarely needed; requires firebase-tools login + project link)
npm.cmd run firebase:firestore   # deploy rules + indexes
npm.cmd run firebase:rules
npm.cmd run firebase:indexes
```

On PowerShell, if `npm` is blocked by execution policy, use `npm.cmd` (see `setup.md`). First-time machine setup (`.env` values, Firebase project link, Expo Go on a device) is documented in `setup.md` — consult it before assuming a local env problem is a code problem.

The `expo` package is pinned to SDK 54 because the app runs in Expo Go, and the Play Store Expo Go build supports exactly one SDK version (54). Do not bump it until Expo Go ships a newer SDK or the project moves to a dev-client build (post-MVP ticket P1-T1).

There is no root `vitest.config`; Vitest runs against the workspace using its default test discovery (`*.test.ts` next to source).

## Repository structure

```
apps/mobile/     Expo app (Android/Web first-class, iOS via Expo). Screens, navigation, hooks, UI composition.
packages/domain/ Pure business logic: entities, normalization, validation. No React, no Firebase.
packages/data/   Firebase init, auth adapter, Firestore repositories, mappers. No UI.
packages/ui/     Shared presentational components only (currently just scaffolded — no components yet). No business logic.
specs/           Source-of-truth specs for product/domain/data/sync behavior.
.agents/skills/  Firebase Firestore reference skill (provisioning, security rules, SDK usage, indexes).
```

This is an npm-workspaces monorepo (`apps/*`, `packages/*`). `packages/domain` and `packages/data` have no build step — they're consumed directly as TypeScript source via `"main": "src/index.ts"`.

## Architecture

**Layering is the load-bearing rule of this codebase.** Each package has a hard boundary enforced by convention (not tooling yet), and violating it is the most common way to get a change rejected:

- `packages/domain` — entities (`ItemData`, `CatalogItem`, `ListItem`, `Group`), `normalizeName`, and `validate*` functions. No React imports, no Firebase imports. This is where normalization and validation live — nowhere else.
- `packages/data` — Firebase app/auth init and Firestore repositories (`CatalogRepository`, `ListRepository`, `GroupRepository` — interfaces in `repositories/types.ts` + per-entity files). No UI code, no direct screen imports.
- `apps/mobile` — screens, Expo Router navigation, hooks. Never calls Firestore/Firebase directly from a screen or puts business rules in JSX — always goes through `packages/data` repositories and `packages/domain` validation/normalization.
- `packages/ui` — presentational components only, no business logic.

**Domain model** (full detail in `specs/domain-model.md`):
- `ItemData` (name, normalizedName, groupId, note) is embedded in both `CatalogItem` and `ListItem`.
- `normalizedName` is derived from `name` (trim, lowercase, collapse spaces) and must be recomputed on every name change — this invariant must never drift.
- `CatalogItem` is soft-deleted (`deleted: boolean` tombstone, can "resurrect" if a newer write flips it back to active).
- `ListItem` is a full **snapshot** of `itemData` at creation time — it does NOT track catalog item changes afterward, and is hard-deleted when "bought."
- `Group` has an `order` field for manual sort; missing/null `groupId` always resolves to "Ungrouped" rather than erroring.

**Firestore layout** (full detail in `specs/firestore-schema.md`): strictly per-user, `users/{userId}/{catalogItems|listItems|groups}/{id}`. All IDs are client-generated GUIDs and must equal the document ID. Writes are **full-document overwrites only** — no partial/field updates, ever.

**Sync model** (full detail in `specs/sync-rules.md`): offline-first, Last-Write-Wins via `updatedAt` (client epoch ms), whole document replaced on conflict. Duplicates from offline conflicts are tolerated by design, not prevented server-side. Undo (post-delete) is local-only, not synced, and recreates the item under a new ID.

## Working within this repo (from AGENTS.md / engineering-rules.md)

- **Ticket-driven workflow**: `specs/tickets.md` defines the execution order (M0 Foundation → M1 Auth → M2 Groups → M3 Catalog → M4 Shopping List → M5 Sync/Offline → M6 Stabilization). Implement **one ticket at a time**, verify it runs/builds, then stop — do not chain into the next ticket automatically or implement multiple milestones in one pass.
- **Spec discipline**: if an implementation decision changes behavior from what a spec says, update that spec in the same change. Use `specs/spec-index.md` to determine which specs are relevant to a given task (don't pull all specs into context for every change).
- **Code style**: explicit, boring, small files/functions. No speculative abstractions, no placeholder-heavy scaffolding. Refactor only for real duplication or clarity — not as a drive-by.
- **TypeScript**: strict typing, avoid `any`, explicit nullability, typed Firestore mappers.
- **Forbidden without explicit approval**: GraphQL, Tailwind/NativeWind, styled-components, a custom sync engine, Redux/MobX/Zustand/XState/event-bus (state is local React hooks, or minimal Context if truly needed), Formik/react-hook-form (forms are controlled components; domain layer is the validation source of truth). Adding any new dependency not already implied by the specs needs explicit developer approval first.
- **Tests**: Vitest, prioritized on domain logic — normalization, validation, duplicate detection, group fallback, sorting.
