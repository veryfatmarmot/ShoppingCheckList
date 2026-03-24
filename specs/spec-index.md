# Spec Index

This document defines the role of each spec file and how to use the spec set efficiently in AI prompts.

The goal is:
- avoid attaching all specs to every prompt
- reduce token waste
- keep source-of-truth ownership clear
- make AI prompts precise and stable

---

# Source of Truth by Topic

## Product Scope
**Source of truth:** `prd.md`

Use this file for:
- product purpose
- target user
- included / excluded MVP scope
- success criteria
- high-level feature boundaries

Do NOT use it as the main source for:
- Firestore structure
- detailed UX interactions
- coding conventions

---

## Domain Entities and Invariants
**Source of truth:** `domain-model.md`

Use this file for:
- entity definitions
- ItemData / CatalogItem / ListItem / Group
- invariants
- validation rules
- normalization rules
- snapshot behavior

Do NOT use it as the main source for:
- Firestore collection paths
- screen behavior
- ticket order

---

## Firestore Storage Structure
**Source of truth:** `firestore-schema.md`

Use this file for:
- Firestore collections and paths
- document shapes
- field presence
- per-user ownership model
- load/query patterns

Do NOT use it as the main source for:
- domain rationale
- UI interaction behavior
- implementation workflow

---

## Sync and Offline Behavior
**Source of truth:** `sync-rules.md`

Use this file for:
- last-write-wins behavior
- `updatedAt` conflict resolution
- overwrite semantics
- delete / resurrection rules
- duplicate reality under offline mode
- ID collision behavior

Do NOT use it as the main source for:
- screen layouts
- project structure
- dependency choices

---

## UX Structure and Interaction Behavior
**Source of truth:** `ux-flows.md`

Use this file for:
- screens
- modals
- transitions
- interaction rules
- empty states
- disabled actions
- login flow

Do NOT use it as the main source for:
- Firestore documents
- repository design
- coding discipline

---

## Execution Plan
**Source of truth:** `tickets.md`

Use this file for:
- milestone order
- ticket sequencing
- task boundaries
- implementation units

Do NOT use it as the main source for:
- product semantics
- domain rules
- UI detail

---

## Technical Choices and Allowed Stack
**Source of truth:** `tech-stack.md`

Use this file for:
- chosen frameworks and libraries
- project structure
- package layout
- navigation choice
- styling choice
- data-layer boundaries
- forbidden technologies

This is one of the two files that should be attached to almost every coding prompt.

---

## Coding Discipline
**Source of truth:** `engineering-rules.md`

Use this file for:
- code style expectations
- layering discipline
- dependency discipline
- refactoring rules
- implementation constraints
- AI workflow rules

This is one of the two files that should be attached to almost every coding prompt.

---

# Prompt Attachment Strategy

## Default rule

Do NOT attach all spec files to every prompt.

Instead attach:
- `tech-stack.md`
- `engineering-rules.md`
- plus only the 1–3 files directly relevant to the task

---

# Recommended Attachments by Prompt Type

## 1. UI / Screen implementation
Attach:
- `tech-stack.md`
- `engineering-rules.md`
- `ux-flows.md`
- `domain-model.md`

Optional:
- `prd.md` if the feature boundary matters

Examples:
- Shopping List screen
- Catalog screen
- Group screen
- modals
- login screen

---

## 2. Repository / Firebase / storage implementation
Attach:
- `tech-stack.md`
- `engineering-rules.md`
- `domain-model.md`
- `firestore-schema.md`
- `sync-rules.md`

Examples:
- Firestore repositories
- mappers
- auth adapter
- sync-aware write helpers

---

## 3. Domain logic implementation
Attach:
- `tech-stack.md`
- `engineering-rules.md`
- `domain-model.md`

Optional:
- `sync-rules.md` if the helper is sync-related

Examples:
- normalization
- validation
- grouping fallback
- sorting helpers
- duplicate detection helpers

---

## 4. Ticket planning / implementation sequencing
Attach:
- `tickets.md`
- `tech-stack.md`
- `engineering-rules.md`

Optional:
- `prd.md` if feature scope matters

Examples:
- “Implement M3-T4”
- “What is the next smallest safe ticket?”
- “Break this milestone into smaller tasks”

---

## 5. Product or architecture discussion
Attach:
- `prd.md`

Optional depending on topic:
- `domain-model.md`
- `firestore-schema.md`
- `sync-rules.md`
- `tech-stack.md`

Examples:
- scope clarification
- architecture tradeoff
- future design changes

---

## 6. UX review / redesign
Attach:
- `ux-flows.md`
- `prd.md`

Optional:
- `domain-model.md` if data behavior affects UX

Examples:
- reviewing modals
- redesigning add flow
- clarifying login flow
- checking edge cases

---

# Minimal Prompt Sets

## Smallest useful set for most coding tickets
- `tech-stack.md`
- `engineering-rules.md`
- one task-specific spec
- the ticket text itself

## Typical practical set
- `tech-stack.md`
- `engineering-rules.md`
- 2 task-specific specs
- current ticket

This is usually the best balance.

---

# Source-of-Truth Rules

If two files seem to overlap, resolve conflicts like this:

1. `prd.md` defines product intent and scope
2. `domain-model.md` defines domain truth
3. `firestore-schema.md` defines storage truth
4. `sync-rules.md` defines behavioral sync truth
5. `ux-flows.md` defines interaction truth
6. `tech-stack.md` defines technical stack truth
7. `engineering-rules.md` defines coding discipline
8. `tickets.md` defines execution order

If an implementation changes behavior, the owning spec must be updated.

---

# Practical Prompting Rules

## Always do
- mention the current ticket explicitly
- attach the smallest relevant spec set
- ask for bounded implementation
- verify before moving to the next ticket

## Never do
- ask AI to implement the whole MVP at once
- attach all specs for every task
- leave file ownership ambiguous
- let implementation drift from specs without updating them

---

# Suggested Workflow

1. Identify the current ticket
2. Choose the minimal relevant spec set
3. Prompt AI with bounded scope
4. Run and verify
5. Fix issues
6. Commit
7. Move to next ticket

---

# Example Attachment Sets

## Example: Implement Google login screen
Attach:
- `tech-stack.md`
- `engineering-rules.md`
- `ux-flows.md`
- `prd.md`

## Example: Implement Group repository
Attach:
- `tech-stack.md`
- `engineering-rules.md`
- `domain-model.md`
- `firestore-schema.md`
- `sync-rules.md`

## Example: Implement normalization helper
Attach:
- `tech-stack.md`
- `engineering-rules.md`
- `domain-model.md`

## Example: Implement Shopping List screen
Attach:
- `tech-stack.md`
- `engineering-rules.md`
- `ux-flows.md`
- `domain-model.md`

## Example: Implement add-from-catalog flow
Attach:
- `tech-stack.md`
- `engineering-rules.md`
- `ux-flows.md`
- `domain-model.md`
- `sync-rules.md`

---

# Final Rule

Use the spec set like a toolbox, not like a single giant prompt attachment.

Attach:
- the permanent rules
- the task-relevant source-of-truth files
- nothing extra
