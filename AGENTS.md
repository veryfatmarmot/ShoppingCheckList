# AGENTS.md

Spec-driven MVP for a cross-platform shopping list app.

Primary targets:
- Android
- Web

Secondary target:
- iOS via Expo

Use this file as the repo bootstrap.
Detailed source-of-truth specs live in `/specs`.

## Repository Structure
```text
repo/
  AGENTS.md          # repo bootstrap for Codex
  package.json       # root workspace config
  specs/             # source-of-truth project specs
  apps/              # runnable applications
    mobile/            # Expo app (Android/Web first, iOS supported)
  packages/          # shared code libraries
    domain/            # pure business logic, validation, normalization
    data/              # Firebase setup, repositories, mappers
    ui/                # optional shared presentational UI components
```

## Source of truth
- `specs/prd.md` — scope, MVP boundaries
- `specs/domain-model.md` — entities, invariants
- `specs/firestore-schema.md` — Firestore structure
- `specs/sync-rules.md` — offline/LWW/conflicts
- `specs/ux-flows.md` — screens, modals, actions
- `specs/tickets.md` — execution order
- `specs/tech-stack.md` — stack, package layout
- `specs/engineering-rules.md` — coding discipline
- `specs/spec-index.md` — which specs to attach per task

If implementation changes behavior, update the owning spec.

## Workflow
- implement one ticket at a time
- do not implement the whole MVP at once
- do not expand scope
- verify before moving to the next ticket
- keep changes scoped to the active ticket

Default order:
1. read `specs/tickets.md`
2. identify current ticket
3. read only relevant specs
4. implement the smallest correct solution
5. verify
6. stop

## Hard constraints
- TypeScript
- Expo + Expo Web + Expo Router
- Firebase Auth + Cloud Firestore
- npm workspaces
- React Native StyleSheet
- no direct Firebase calls from screens
- no business rules in JSX/UI components
- no React imports in `packages/domain`
- normalization and validation live in domain only
- full-document overwrite model only
- respect LWW via `updatedAt`
- keep client GUIDs and client timestamps

## Dependencies
Do not introduce not mentioned in specs dependencies unless explicitly needed. If introducing, get an approval from the developer

## Done means
A ticket is done only if:
- implementation matches relevant specs
- code stays in the correct layer
- touched path still runs/builds
- no obvious unrelated breakage is introduced

When done, stop. Do not continue into the next ticket automatically.
