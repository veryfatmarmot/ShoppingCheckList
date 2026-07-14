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
- Expo Auth Session obtains the Google ID token; `packages/data` exchanges it for a Firebase credential
- Includes moving the Android app from Expo Go to a local dev-client build (`expo-dev-client` + `expo run:android`) — Google OAuth cannot complete inside Expo Go (no auth proxy, `exp://` redirect rejected)

## M1-T2 Auth State
- Detect signed-in user
- Store userId
- Persist auth across app restarts: on Android/iOS initialize Firebase Auth with AsyncStorage persistence (`initializeAuth` + `@react-native-async-storage/async-storage` — approved MVP dependency); the JS SDK is memory-only on React Native by default. Web persists automatically (IndexedDB).

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

## M1-T6 Sign Out
- Sign-out action in the shared header of the main app (visible from all tabs)
- Confirmation dialog, then Firebase sign-out and return to the Login screen

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
- Remove group document (with Delete Confirmation modal)
- Note: the reference-clearing cascade (`itemData.groupId = null` on referencing catalog/list items) is deferred to M4-T9 — the catalog and list repositories do not exist yet at M2

## M2-T6 Group Sectioning Helper (domain, no UI)
- Pure domain helper in `packages/domain` that buckets items into ordered display sections. Shared by the Catalog grouped view (M3-T3) and the Shopping grouped view (M4-T2). No UI in this ticket — the payoff is a tested helper those screens consume.
- Input: items carrying `itemData` (generic over CatalogItem / ListItem) plus the list of groups.
- Output: ordered sections. Named groups first, ordered by `group.order` ascending; each section's items sorted by `itemData.normalizedName`. Items whose `groupId` is null OR does not match an existing group collapse into a single "Ungrouped" section, placed last.
- Only include sections that contain at least one item (no empty group headers).
- Tests (prioritized domain area — group fallback + sorting): null `groupId` → Ungrouped; unknown/stale `groupId` → Ungrouped; sections ordered by `group.order`; items ordered by `normalizedName`; empty input → no sections.

---

# M3 — Catalog

## M3-T1 Catalog Repository
- CRUD operations
- soft delete

## M3-T2 Subscription / Load
- Load all catalog items

## M3-T3 Catalog Screen
- Grouped view (uses the M2-T6 sectioning helper)
- Sorted items

## M3-T4 Add/Edit Catalog Modal
- Create/edit item

## M3-T5 Duplicate Prevention
- Check normalizedName
- block in UI

## M3-T6 Soft Delete
- set deleted = true

## M3-T7 Disable Add If Active
- Deferred to M4-T10. This guards the catalog row's "add to list" button (built in M4-T3) against a ListItem that already references the same `catalogItemId` — neither the button nor ListItems exist until M4, so it cannot be implemented at M3.

---

# M4 — Shopping List

## M4-T1 List Repository
- CRUD operations

## M4-T2 Shopping Screen
- Grouped list view (uses the M2-T6 sectioning helper)

## M4-T3 Add From Catalog
- Open quantity modal
- Create ListItem snapshot

## M4-T4 Quantity Modal
- Input quantity
- Validate
- Delivered together with M4-T3: the `QuantityModal` component (validated quantity input, `validateQuantity`) is the modal M4-T3 opens — it cannot be opened before it exists, so the two were implemented in one pass.

## M4-T5 Add One-Time Item
- Create ListItem without catalog reference

## M4-T6 Edit List Item
- Full overwrite edit

## M4-T7 Mark Bought
- Delete ListItem

## M4-T8 Empty State
- Show "Shopping Complete"
- Delivered with M4-T2: the Shopping screen renders the "Shopping Complete" empty state whenever the list has no items.

## M4-T9 Group Delete Cascade
- Before deleting a group, overwrite every referencing CatalogItem and ListItem with `itemData.groupId = null` and a newer `updatedAt`, then hard-delete the group
- Completes the deferral noted in M2-T5; required by `domain-model.md` → Group → Delete

## M4-T10 Disable Add If Active (deferred from M3-T7)
- On the Catalog screen, disable a row's "add to list" button when a ListItem already exists with that item's `catalogItemId` (ux-flows: `already in list`)
- Depends on M4-T3 (the add-to-list button) and the list subscription; that's why it moved out of M3

---

# M5 — Sync & Offline

## M5-T1 Offline Persistence
- Enable Firestore offline

## M5-T2 Sync Status
- Show online/offline indicator

## M5-T3 Undo Buffer
- Store last 10 deletions locally (N = 10)

## M5-T4 Undo Action
- Recreate ListItem (new ID)
- Triggered from the "Bought — Undo" snackbar shown after marking an item bought (see `ux-flows.md` → Undo)
- Delivered together with M5-T3: the buffer and its undo action are one feature (a buffer with no way to trigger undo isn't a testable unit), implemented in the `useShoppingUndo` hook + Snackbar.

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

# R1 — Use It For Real

Ships the finished MVP onto the household's devices. Runs after M6. Independent of (and typically before) the Post-MVP hardening below.

## R1-T1 Release Android Build
- Signed release APK with the JS bundle embedded — the app must run without a Metro dev server
- Create a release keystore, store it safely (it is not the shared debug keystore), and register its SHA-1 with the Google Android OAuth client
- Install on all household devices

## R1-T2 Web Hosting
- Expo web export deployed to Firebase Hosting
- Add the hosting origin to the Web OAuth client's authorized JavaScript origins and redirect URIs

## R1-T3 Branding
- Home-screen display name "Refillio" (public product name), proper icon and splash

---

# Post-MVP — Hardening

Not part of MVP scope. Do not start until M0–M6 are complete and the MVP is otherwise feature-complete.

## P1-T1 Native Firestore/Auth SDK Migration (Mobile)
- Replace `packages/data`'s mobile implementation with `@react-native-firebase/firestore` + `@react-native-firebase/auth`
- Replace Google Sign-In on mobile with `@react-native-google-signin/google-signin` (native account picker), replacing the Expo Auth Session browser-redirect flow used for MVP
- Keep Expo Web on the current `firebase` JS SDK + Expo Auth Session (both continue to work fine on web)
- The project already runs as a custom dev-client build (moved off Expo Go at M1-T1), so this is a dependency/implementation swap with no new build infrastructure
- Resolves the known offline-persistence gap documented in `sync-rules.md` ("Known MVP Limitation — Mobile Offline Persistence")
- Project is not considered production-ready until this ticket is complete

---

# Important Rules

- Never skip tickets
- Never merge tickets
- Always test after each ticket
- If something breaks → fix immediately before continuing
