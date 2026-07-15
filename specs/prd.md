# PRD — Shopping List App (MVP)

---

# Product Overview

A cross-platform shopping list app (Android, iOS, Web via Expo) for a single shared Google account across devices.

The app enables multiple devices to collaboratively manage a single shopping list with offline support and near real-time synchronization.

---

# Goal

Enable fast, frictionless shared shopping with:

- One active list
- Reusable catalog
- Grouping by store sections
- Offline-first behavior
- Near real-time sync across devices

---

# Target User

- Household using one shared Google account
- Typically 2+ people shopping simultaneously

---

# Core Value Proposition

- Minimal friction when adding items
- Reliable sync between devices
- Works without internet †
- Structured shopping (groups)
- Reusable catalog for speed

† **Not currently delivered on Android/iOS.** Opening the app without a network
connection shows no data at all (no list, no catalog, no groups). See "Mobile
offline persistence (MVP)" below — this is the MVP's most serious gap, and it
defeats the value proposition in exactly the situation it exists for.

---

# MVP Scope

## Included

### Authentication
- Google sign-in via Firebase Auth
- Expo Auth Session + Firebase credential exchange

### Core Data
- One active shopping list
- Catalog of reusable items
- One-time items (no catalog reference)
- Groups with manual ordering

### Shopping List
- Add item from catalog with quantity
- Add one-time item with full data
- Edit list item (modal)
- Mark item as bought → removes from list
- Local undo for recent removals

### Catalog
- Add / edit catalog item (modal)
- Soft delete catalog item
- Duplicate prevention (best-effort)

### Groups
- Create / edit / delete groups
- Manual ordering of groups
- Group deletion clears `groupId` on all referencing catalog and list items

### UI Behavior
- Catalog grouped by groups
- Shopping list grouped by groups
- Alphabetical sorting inside groups
- Empty state: "Shopping Complete"

### Sync
- Offline-first
- Firestore sync
- Last-write-wins
- Full document overwrite

---

## Excluded (MVP)

- Multiple shopping lists
- Multi-account sharing
- Images
- Cross-device undo
- Strong duplicate guarantees

---

# Functional Requirements

## Authentication

- User signs in via Google
- Firebase Auth provides `userId`
- All data is scoped under:
  users/{userId}/...

---

## Shopping List

- Only one active list exists per user

### Add from catalog
- Select catalog item
- Specify quantity
- Create ListItem with snapshot data

### Add one-time item
- User provides:
  - name
  - quantity
  - group
  - note

### Edit list item
- Full overwrite of ListItem

### Mark as bought
- ListItem is deleted

### Undo
- Local-only
- Recreates ListItem with a new ID

### Empty state
- Show: "Shopping Complete"

---

## Catalog

- Stores reusable items

### Fields
- name
- normalizedName
- groupId
- note

### Behavior
- Edit allowed anytime
- Soft delete via `deleted = true`

### Duplicate handling
- Prevent duplicates (best-effort)
- Based on normalizedName
- Only among non-deleted items
- Duplicates may still occur (offline)

---

## Groups

- User-managed collection

### Fields
- name
- normalizedName
- order

### Behavior
- Manual ordering
- Deletion allowed

### Rendering rule
- Missing group → Ungrouped

---

## Offline & Sync

### Offline
- Full functionality offline
- Writes stored locally

### Sync
- Firestore sync on reconnect

### Conflict resolution
- Last-write-wins using updatedAt

### Write model
- Full document overwrite

### Deletion
- Catalog: soft delete
- ListItem: hard delete
- Group: clear references to `groupId = null`, then hard delete

### Resurrection
- CatalogItem can be restored by newer write

---

# Non-Functional Requirements

## Performance
- Fast startup
- Load full dataset (MVP assumption: small data)

## Reliability
- Deterministic conflict resolution
- No UI breakage from missing references

## Maintainability
- Simple data model
- Clear separation:
  - UX
  - Domain
  - Storage

## AI-Friendliness
- Explicit contracts
- No hidden behavior
- Deterministic flows

---

# Constraints & Known Tradeoffs

## Client timestamps
- May cause ordering inconsistencies
- Accepted for MVP

## Duplicate items
- Not fully preventable offline
- If present, all copies are displayed on UI and the user can resolve

## Full overwrite model
- Simpler implementation
- Less efficient than partial updates

## Mobile offline persistence (MVP)
- MVP uses a single Firestore JS SDK across web and mobile; on Android/iOS this has no disk-backed offline cache (see `sync-rules.md` → "Known MVP Limitation — Mobile Offline Persistence")
- **Writes:** an offline edit that hasn't synced before the app is backgrounded can be silently lost — not just in rare "killed while offline" scenarios, but on ordinary backgrounding
- **Reads (verified on device, M6-T4):** the app can only show data it loaded while online in the current session. Cold-start with no network shows an **empty app** — no list, no catalog, no groups. This is the freezer-aisle case: the OS kills the app in your pocket, you reopen it in a low-signal store, and your shopping list is gone.
- The read blackout is the more serious of the two: it does not merely risk losing an edit, it makes the app **useless in its primary use case**
- Explicitly accepted when the tradeoff was taken (it was framed then only as lost writes, which understated it). Resolved by the native Firestore SDK on mobile — **P1-T1 should land before the app is relied on for real shopping**, not merely "before production"

---

# Success Criteria (MVP)

- Users can:
  - add items quickly
  - shop simultaneously on multiple devices
  - see near real-time updates
  - use app offline without data loss*

- No data corruption under concurrent usage

- UX remains simple and predictable

\* MVP exception (Android/iOS), verified on device in M6-T4:
- an offline edit not yet synced can be lost if the app is backgrounded long enough for the OS to freeze/kill it; and
- **the app shows no data at all when opened without a network connection** — so "use app offline" is not met for reads either.

See "Mobile offline persistence (MVP)" above. Must be resolved (P1-T1) before the app is relied on for real shopping.
