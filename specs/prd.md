# PRD — Shopping List App (MVP)

## Product
A cross-platform shopping list app (Android, iOS, Web via Expo) for a single shared Google account across devices.

## Goal
Collaboratively manage one active shopping list with offline support, near real-time sync, and a reusable catalog.

## Target User
A household using one shared Google account.

## Core Value
Fast shared shopping with:
- One active list
- Reusable catalog
- Grouping by store sections
- Offline-first
- Near-real-time sync

## MVP Scope

### Included
- Google sign-in
- one active shopping list
- catalog of reusable items
- one-time items
- groups with manual ordering
- add item from catalog to active list
- add one-time item directly to active list
- edit catalog item in modal
- edit one-time list item in modal
- mark item as bought, removing it from active list
- catalog grouped by groups, sorted alphabetically within groups
- shopping list grouped by groups, sorted alphabetically within groups
- offline-first local work
- Firebase sync
- local-only undo for recent deletions/buys

### Excluded
- multiple lists
- account sharing between multiple Google accounts
- images
- barcode scanning
- voice input
- recurring items
- history UI
- cross-device undo
- guaranteed duplicate prevention in offline conflicts

## Functional Requirements

### Authentication
- User signs in with Google.
- Data is scoped under that user’s Firebase Auth UID.

### Shopping list
- Only one active list exists.
- User can add a catalog item with quantity.
- User can add a one-time item with quantity and item fields.
- Active list item is unique by its own ListItem ID.
- Marking item as bought deletes the ListItem.
- Empty shopping list shows “Shopping Complete”.

### Catalog
- Catalog stores reusable items.
- Catalog item name and other fields are editable.
- Duplicate names should be blocked best-effort using normalized name among non-deleted catalog items.
- Duplicates may still exist due to offline conflicts.

### Groups
- Groups are user-managed.
- Groups have name, normalizedName, and manual order.
- Missing or null group means Ungrouped in UI.
- If referenced group does not exist, item is treated as Ungrouped.

### Offline and sync
- App must work offline.
- Sync uses last-write-wins with client timestamps.
- Whole-record overwrite semantics per write.
- Catalog deletion is soft via deleted: true.
- Deleted catalog item may be recreated later by a newer write using the same ID.

## Non-functional requirements
- Fast startup for small/medium data sets
- Load all user data for MVP
- Simple, maintainable domain model
- AI-friendly codebase structure
- Deterministic normalization and validation rules