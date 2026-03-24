# Tech Stack

This document defines the mandatory technology choices and architectural boundaries for the MVP.

It is a TECHNICAL CONTRACT for implementation.
All AI-generated code must follow this file unless a later spec explicitly changes it.

---

# Goals of This Stack

- Keep the stack simple
- Keep the project AI-friendly
- Reduce architectural ambiguity
- Support Android + Web first
- Keep iOS possible without custom platform work
- Use Firebase directly, without a custom backend server
- Preserve clean separation between UI, domain logic, and persistence

---

# Core Product Context

The product is:

- a cross-platform shopping list app
- Android + Web are the main targets
- iOS should remain supported through Expo
- one shared Google account is used across devices
- offline-first
- Firestore-backed
- real-time enough for collaborative shopping
- built with AI assistance ticket by ticket

---

# Mandatory Core Stack

## Language
- TypeScript only

## Client Framework
- React Native
- Expo
- Expo Web

## Authentication
- Firebase Authentication
- Google Sign-In

## Database
- Cloud Firestore

## Package Manager / Monorepo
- npm
- npm workspaces

---

# Navigation

## Choice
- Use Expo Router

## Rules
- Use Expo Router consistently across the app
- Do not mix navigation systems
- Do not introduce React Navigation separately unless Expo Router requires it internally

## Why
- Better fit for Expo
- Simpler setup
- Better AI implementation consistency

---

# Styling

## Choice
- React Native StyleSheet
- Basic shared theme/constants are allowed

## Rules
- Prefer simple local styles
- Keep styling close to components
- Shared tokens may live in `/packages/ui` or app theme files
- Do not introduce Tailwind / NativeWind / styled-components for MVP

## Why
- Lowest complexity
- Most predictable for AI
- Easy to maintain

---

# State Management

## Choice
- React hooks for local state
- React Context only when truly needed for app-wide state

## Rules
- No Redux
- No MobX
- No Zustand
- No XState
- No custom event bus

## What is allowed
- `useState`
- `useMemo`
- `useEffect`
- `useReducer`
- Context for a small number of global concerns only

## Example allowed global concerns
- auth session
- sync status
- maybe lightweight cached lookup state if justified

## Why
- MVP scope is small
- Avoid overengineering
- Keep the mental model simple

---

# Forms

## Choice
- Controlled components
- Domain validation as source of truth

## Rules
- Keep forms simple
- UI may do immediate validation
- Real validation rules must live in domain logic
- Do not introduce react-hook-form or formik for MVP unless explicitly approved later

## Why
- Few forms
- Small field count
- Lower abstraction overhead

---

# Data Layer

## Choice
- Repository pattern
- Firebase access isolated in a dedicated package

## Mandatory rule
- No direct Firebase / Firestore usage inside screens or UI components

## Package responsibilities
- `/packages/domain`
  - domain types
  - normalization
  - validation
  - grouping/sorting helpers
  - pure business rules

- `/packages/data`
  - Firebase initialization
  - auth adapter
  - Firestore repositories
  - mappers between Firestore documents and domain models

- `/apps/mobile`
  - screens
  - navigation
  - UI composition
  - hooks that call repositories
  - user interaction logic

- `/packages/ui`
  - optional shared UI primitives
  - no business logic

## Why
- Prevent logic duplication
- Keep persistence concerns isolated
- Make AI work on bounded layers

---

# Firebase Usage Boundaries

## Use
- Firebase Auth
- Cloud Firestore

## Do not use in MVP
- Cloud Functions unless absolutely required later
- Realtime Database
- Remote Config
- Analytics
- Storage
- App Check
- Cloud Messaging

## Why
- Keep MVP narrow
- Avoid unnecessary infrastructure

---

# Firestore Usage Model

## Rules
- Strict per-user collections
- Load full user dataset for MVP
- Client-side grouping and sorting
- Last-write-wins using client `updatedAt`
- Full-document overwrite model
- Firestore offline persistence enabled

## Current shape
- `users/{userId}/catalogItems/{id}`
- `users/{userId}/listItems/{id}`
- `users/{userId}/groups/{id}`

## Notes
- No custom backend server
- No server-side uniqueness guarantees in MVP
- Duplicate prevention is best-effort in client

---

# IDs and Time

## IDs
- Client-generated GUIDs

## Timestamps
- Client-generated UNIX epoch milliseconds

## Notes
- This is accepted MVP tradeoff
- Server timestamps are future backlog, not current implementation

---

# Testing

## Mandatory testing scope
- Unit tests for domain helpers:
  - normalization
  - validation
  - grouping fallback
  - sorting helpers

## Optional for MVP
- UI tests
- end-to-end tests

## Rules
- Prioritize testing pure logic over UI wiring

---

# Tooling

## Required
- TypeScript
- ESLint
- Prettier

## Nice to have later
- Husky / lint-staged
- stricter CI checks

## Do not overbuild at start
- keep tooling minimal but clean

---

# Repository Structure

Use this structure:

```text
repo/
  specs/
    prd.md
    domain-model.md
    firestore-schema.md
    sync-rules.md
    ux-flows.md
    milestones.md
    tickets.md
    tech-stack.md
    engineering-rules.md

  apps/
    mobile/

  packages/
    domain/
    data/
    ui/
```

---

# Forbidden for MVP

Do not introduce any of the following unless explicitly approved:

- Custom backend server
- GraphQL
- Redux
- MobX
- Zustand
- XState
- Tailwind / NativeWind
- styled-components
- formik
- react-hook-form
- custom sync engine
- CRDT implementation
- field-level merge logic
- pagination
- multi-account sharing
- multiple list support
- feature flags
- plugin architecture

---

# Dependency Philosophy

## Default rule
- Prefer fewer dependencies
- Prefer platform-standard / framework-standard solutions

## AI instruction
Before adding a new dependency, ask:
1. Is it necessary for MVP?
2. Does Expo / React Native already solve this?
3. Does it add a second abstraction layer we do not need?

If the answer is uncertain, do not add it.

---

# Current Architectural Decision Summary

This project is intentionally:

- simple over clever
- explicit over abstract
- layered over tangled
- repository-based over direct database calls
- domain-driven over UI-driven
- ticket-by-ticket over big-bang implementation

All implementation must preserve that direction.
