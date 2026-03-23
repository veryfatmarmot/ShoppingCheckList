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
- One active shopping list
- Catalog of reusable items
- One-time items
- Groups with manual ordering
- Add from catalog with quantity
- Add one-time item with quantity
- Edit item modals
- Mark bought (delete list item)
- Grouped views (Catalog & List)
- Offline-first with Firebase sync
- Local-only undo

### Excluded
- Multiple lists
- Multi-account sharing
- Images, barcode, voice
- Recurring items, history UI
- Cross-device undo

## Functional Requirements

### Authentication
- Google Sign-In
- Data scoped by Firebase Auth UID

### Shopping List
- Single active list
- Add catalog or one-time items
- Unique ListItem IDs
- Buy removes item
- Empty state: “Shopping Complete”

### Catalog
- Reusable items
- Editable name
- Duplicate prevention (best effort via normalized name)
- Duplicates tolerated due to offline

### Groups
- User-managed, ordered
- Missing group => Ungrouped

### Offline & Sync
- Works offline
- Last-write-wins (client timestamps)
- Soft delete for catalog
- Resurrection via newer write

## Non-Functional
- Fast for small/medium data
- Load-all strategy for MVP
- Deterministic normalization
- AI-friendly structure
