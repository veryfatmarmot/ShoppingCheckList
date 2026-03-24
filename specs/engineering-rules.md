# Engineering Rules

This document defines how code must be written in this project.

It is an ENGINEERING CONTRACT for AI-generated and human-written code.
If there is tension between speed and code quality, choose the simplest correct implementation.

---

# Primary Principles

## 1. Keep code explicit
- Prefer obvious code over clever code
- Prefer readable code over compressed code
- Avoid hidden behavior

## 2. Keep code small
- Small files
- Small functions
- Small tickets
- Small commits

## 3. Keep layers separate
- UI renders and handles user interaction
- Domain enforces business rules
- Data layer talks to Firebase
- Do not blur these boundaries

## 4. Build only what is currently needed
- No speculative abstractions
- No “future-proof” frameworks
- No generic infrastructure without immediate use

---

# AI Implementation Workflow

## Mandatory workflow
- Work one ticket at a time
- Complete one bounded task
- Run / verify
- Fix problems
- Only then continue

## Do not do this
- Do not implement the whole MVP at once
- Do not silently expand scope
- Do not add features not present in specs

## Required prompt context
When implementing a ticket, use only the relevant specs plus the current ticket.
Avoid giving AI the entire project scope if not necessary.

---

# Architecture Boundaries

## UI layer
Allowed:
- rendering
- local screen state
- calling domain helpers
- calling repositories/hooks

Not allowed:
- direct Firestore access
- raw normalization logic duplicated in screen files
- business rules embedded in JSX

## Domain layer
Allowed:
- types
- invariants
- normalization
- validation
- pure business helpers
- sorting/grouping rules

Not allowed:
- Firebase imports
- React imports
- UI code

## Data layer
Allowed:
- Firebase setup
- auth adapters
- Firestore repositories
- document mapping

Not allowed:
- UI code
- React components
- unrelated business logic

---

# Function and File Rules

## Functions
- Keep functions focused
- A function should do one thing
- Prefer pure functions where possible

## File size
- Prefer smaller files
- If a file becomes hard to scan quickly, split it

## Naming
- Use clear, literal names
- Avoid vague names like:
  - `handleStuff`
  - `processData`
  - `utils`
  - `manager`

Prefer names like:
- `normalizeName`
- `validateItemName`
- `groupItemsByEffectiveGroup`

---

# TypeScript Rules

## General
- Use strict TypeScript
- Prefer explicit types for public APIs
- Avoid `any`
- Use `unknown` when necessary, then narrow

## Models
- Domain entities must have explicit types
- Mapping between Firestore documents and domain models must be typed

## Nullability
- Be explicit about nullable fields
- Do not rely on vague undefined/null behavior

---

# Validation and Normalization Rules

## Single source of truth
- Validation rules live in domain layer
- Normalization rules live in domain layer

## Important invariant
- Whenever `name` changes, `normalizedName` must be recomputed in the same write path

## Do not duplicate rules
- Do not reimplement normalization ad hoc in screens
- Do not reimplement duplicate detection differently in multiple places

---

# Write Model Rules

## Document writes
- Full-document overwrite only for MVP
- No partial update helpers
- No field-level merge abstraction

## Conflict model
- Respect last-write-wins via `updatedAt`
- Do not invent extra sync semantics

## IDs
- IDs are client-generated GUIDs
- Do not replace with server IDs

---

# UI Rules

## UX fidelity
- Follow `ux-flows.md`
- Do not invent interactions
- Do not remove states
- Do not “simplify” away edge cases from the spec

## Components
- Prefer small reusable presentational components
- Keep business logic out of shared UI components

## Modals
- Modal names and responsibilities must match spec exactly

---

# Dependency Rules

## Add dependencies carefully
- Every dependency must have a clear MVP justification
- Prefer native/framework features first

## Before adding a dependency, check:
1. Is this required now?
2. Does existing stack already solve it?
3. Will this increase architectural inconsistency?

If uncertain, do not add it.

---

# Error Handling Rules

## General
- Fail clearly
- Avoid silent failure
- Handle expected invalid input gracefully

## For MVP
- User-facing errors may be simple
- Internal errors should be loggable/debuggable
- Do not build a complex error framework

---

# Logging Rules

## Allowed
- Simple debug logging around abnormal cases:
  - ID collision
  - invalid document shape
  - failed sync edge case

## Not allowed
- noisy logging everywhere
- logging that leaks user-sensitive data

---

# Testing Rules

## Mandatory priority
Test domain logic first:
- normalization
- validation
- duplicate detection helpers
- grouping fallback
- sorting

## Testing philosophy
- Test the most deterministic logic first
- Do not chase broad UI test coverage in MVP

---

# Refactoring Rules

## Allowed
- Remove duplication when real duplication exists
- Extract helpers when repetition is meaningful
- Simplify code after a milestone stabilizes

## Not allowed
- Abstract preemptively
- Introduce patterns without a concrete second use case
- Rewrite working simple code into “enterprise architecture”

---

# Commit / Change Discipline

## Per ticket
- Keep changes scoped to the ticket
- Avoid touching unrelated code
- Avoid drive-by refactors

## If a needed refactor appears
- either keep it tiny and directly related
- or note it for a separate ticket

---

# Documentation Rules

## Keep docs aligned
If implementation changes a behavior or assumption, update the relevant spec.

## Do not let code drift from specs
Specs are part of the source of truth.

---

# Forbidden Behaviors for AI

Do NOT:
- add unrequested features
- rename core concepts casually
- swap libraries without instruction
- introduce global state libraries
- bypass repository pattern
- call Firebase directly from screens
- create placeholder TODO-heavy code instead of real implementation
- generate dead code “for future use”
- create broad generic utility modules with unrelated helpers

---

# Preferred Style Summary

Prefer:
- direct
- small
- typed
- testable
- layered
- boring code

Avoid:
- magical
- generic
- framework-heavy
- speculative
- overabstracted code

This project should feel like a careful MVP built by a disciplined engineer, not a demo stuffed with patterns.
