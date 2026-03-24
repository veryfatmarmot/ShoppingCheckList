# Tickets

This document defines IMPLEMENTATION UNITS for AI-driven development.

Each ticket must be:
- small
- testable
- independently implementable

---

# Execution Strategy

- Execute tickets SEQUENTIALLY
- One ticket per AI prompt
- Never batch large milestones
- After each ticket:
  - run app
  - verify behavior
  - fix before proceeding

---

# M0 — Foundation

## M0-T1 Monorepo Setup
- Create project structure:
  - /apps/mobile (Expo)
  - /packages/domain
  - /packages/data
  - /packages/ui (optional later)

## M0-T2 Expo App
- Initialize Expo app
- Enable web support
- Verify runs on web + Android

## M0-T3 Firebase Setup
- Install Firebase SDK
- Configure project
- Initialize Firestore + Auth

## M0-T4 Domain Models
- Implement:
  - ItemData
  - CatalogItem
  - ListItem
  - Group

## M0-T5 Normalization
- Implement:
  - normalizeName(name)
- Rules:
  - trim
  - lowercase
  - collapse spaces

## M0-T6 Validation
- Validate:
  - name non-empty
  - quantity > 0

## M0-T7 Repository Interfaces
- Define interfaces:
  - CatalogRepository
  - ListRepository
  - GroupRepository

## M0-T8 Import Specs
- Add all .md specs to repo
- Make them accessible for AI prompts

---

# M1 — Auth & App Shell

## M1-T1 Google Sign-In
- Implement Firebase Google auth

## M1-T2 Auth State
- Detect signed-in user
- Store userId

## M1-T3 App Shell
- Add tab navigation:
  - Shopping
  - Catalog
  - Groups

## M1-T4 Auth Guard
- If not authenticated → show login screen
- If authenticated → show app

## M1-T5 Loading State
- Add loading screen during auth/bootstrap

---

# M2 — Groups

## M2-T1 Group Repository
- CRUD operations

## M2-T2 Groups Screen
- List groups sorted by order

## M2-T3 Add/Edit Group Modal
- Create + edit flow

## M2-T4 Reorder Groups
- Drag & drop
- Update order

## M2-T5 Delete Group
- Remove group document

## M2-T6 Ungrouped Resolver
- If group missing → treat as Ungrouped

---

# M3 — Catalog

## M3-T1 Catalog Repository
- CRUD operations
- soft delete

## M3-T2 Subscription / Load
- Load all catalog items

## M3-T3 Catalog Screen
- Grouped view
- Sorted items

## M3-T4 Add/Edit Catalog Modal
- Create/edit item

## M3-T5 Duplicate Prevention
- Check normalizedName
- block in UI

## M3-T6 Soft Delete
- set deleted = true

## M3-T7 Disable Add If Active
- prevent adding item already in list

---

# M4 — Shopping List

## M4-T1 List Repository
- CRUD operations

## M4-T2 Shopping Screen
- Grouped list view

## M4-T3 Add From Catalog
- Open quantity modal
- Create ListItem snapshot

## M4-T4 Quantity Modal
- Input quantity
- Validate

## M4-T5 Add One-Time Item
- Create ListItem without catalog reference

## M4-T6 Edit List Item
- Full overwrite edit

## M4-T7 Mark Bought
- Delete ListItem

## M4-T8 Empty State
- Show "Shopping Complete"

---

# M5 — Sync & Offline

## M5-T1 Offline Persistence
- Enable Firestore offline

## M5-T2 Sync Status
- Show online/offline indicator

## M5-T3 Undo Buffer
- Store last N deletions locally

## M5-T4 Undo Action
- Recreate ListItem

## M5-T5 Conflict Handling
- Apply last-write-wins

## M5-T6 ID Collision Handling
- Detect duplicate IDs
- Log issue

---

# M6 — Stabilization

## M6-T1 Duplicate Tests
- Validate duplicate scenarios

## M6-T2 Resurrection Tests
- Test delete vs edit conflicts

## M6-T3 Missing Group Tests
- Ensure fallback works

## M6-T4 Offline Tests
- Create/edit/delete offline

## M6-T5 UX Polish
- Improve responsiveness
- Fix edge cases

## M6-T6 Backlog Prep
- Prepare next phase features

---

# Important Rules

- Never skip tickets
- Never merge tickets
- Always test after each ticket
- If something breaks → fix immediately before continuing
