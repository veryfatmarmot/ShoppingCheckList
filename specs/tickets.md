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
- Manual checklist: `docs/offline-test-plan.md` (offline behavior lives in the Firestore SDK, not in pure logic, so it cannot be covered by Vitest)
- **First run found a release-blocking defect.** Writes pass, but reads fail: on Android the app can only show data loaded while online in the current session, and a cold start with no network shows an **empty app**. This defeats the product's core promise and promotes **P1-T1** ahead of real-world use (see R1 below).

## M6-T5 Load All Collections at Startup (shared data provider)
- Runs next, before M6-T6/T7.
- One `AppDataProvider` (minimal React Context — permitted by `tech-stack.md` for exactly this "load once, share" case) mounted in the signed-in area, subscribing to all three collections (`groups`, `catalogItems`, `listItems`) once at app start.
- `useGroups` / `useCatalog` / `useList` are rewritten to read from the provider instead of each opening their own listener — this also removes today's duplicate listeners (`useGroups` was subscribed by 3 screens, `useList` by 2).
- Effect: every tab has data from launch (no wait-until-you-open-it), and on offline→online the always-active listeners auto-resync all collections.
- Scope note (does NOT fix cold-start offline): while the mobile cache is memory-only (P1-T1 deferred), this only helps while the app process stays alive. A cold start with no network is still blank — see `sync-rules.md` → Known MVP Limitation, reads. Eager-load is a partial mitigation of the in-session case, not a substitute for P1-T1.

## M6-T6 UX Polish
- Improve responsiveness
- Fix edge cases
- Includes the dark restyle: `apps/mobile/theme.ts` holds every color as a
  semantic token (127 hardcoded literals across 15 files were removed), and the
  palette moved to charcoal + mint with coral reserved for destructive actions.
  See `ux-flows.md` → Global UX Rules → Visual Theme. Styling only — no domain,
  data, or dependency changes.
- Explicitly NOT included (rejected as out of scope for a restyle): per-category
  line icons. Those need an icon library (a new dependency) plus a `Group.icon`
  field, an icon picker, and domain-model changes — a feature, not polish. Park
  it for post-MVP if wanted.

## M6-T7 Backlog Prep
- Prepare next phase features

---

# R1 — Use It For Real

Ships the finished MVP onto the household's devices. Runs after M6.

⚠ **Known limitation shipping in R1 (owner-accepted):** M6-T4 verified on device
that with no network a cold-started Android app shows *no data at all* — no list,
catalog, or groups (see `sync-rules.md` → Known MVP Limitation, reads). M6-T5
(eager-load) mitigates the in-session case but not cold-start. The owner has
explicitly accepted releasing R1 with this gap, to get the app into real family
use for testing; the real fix (P1-T1, native SDK with disk persistence) stays
post-MVP. Expect "it was empty in the store" to be a possible finding of that
real-world test — that is the known trade, not a surprise.

## R1-T1 Release Android Build
- **No Play Store for MVP.** Owner will manually sideload the APK onto the family's phones. The Play Store release is out of scope for the MVP.
- The hard requirement: a **standalone** build — signed release APK with the JS bundle **embedded**, so it runs with no Metro dev server and talks directly to Firebase (the "real server"). Today the app only runs while Metro is up on the dev PC; that must stop being true.
- Create a release keystore, store it safely (it is not the shared debug keystore), and register its SHA-1 with the Google Android OAuth client (Google Sign-In breaks in a release build otherwise).
- Install on all household devices.
- Caveat still applies: "works all the time" means whenever it can reach Firebase. A cold start with no network is still blank (P1-T1 deferred); M6-T5 mitigates the in-session offline case only.

### Implementation notes (how it was actually done)
- **Keystore** lives OUTSIDE the repo at `C:\Users\bonda\keystores\refillio-release.keystore` (alias `refillio`, valid to 2053). Its credentials are in `~/.gradle/gradle.properties` as `REFILLIO_RELEASE_*` — also outside the repo. Neither can be committed. Losing the keystore is recoverable-with-pain: reinstall on each phone; **no data loss** (all per-user in Firestore).
- **`android/` is gitignored and regenerated by `expo prebuild`.** Any hand edit to `android/app/build.gradle` is silently wiped. So the signing fix is a **config plugin** (`apps/mobile/plugins/withReleaseSigning.js`), registered in `app.json`, that re-applies on every prebuild:
  - `withReleaseSigning.js` — injects a `release` signingConfig reading the `REFILLIO_RELEASE_*` gradle properties, and points `buildTypes.release` at it. **Without this, the generated `build.gradle` signs release with the DEBUG key** (`signingConfig signingConfigs.debug`, password `"android"`) — it builds and runs, so the failure is silent.
- **Monorepo release-bundle fix — in `apps/mobile/metro.config.js`, NOT a plugin.** For an offline release bundle (`export:embed`), the React Gradle plugin relativizes `--entry-file` against `apps/mobile` → `../../node_modules/expo-router/entry.js`, but Metro auto-detects its server root to the repo root (hoisted `node_modules`) and resolves that path outside the repo → "Unable to resolve module". `metro.config.js` pins `server.unstable_serverRoot` to `apps/mobile` **only while exporting** (detected via `process.argv` containing `export`), so the two agree. Debug streams from the Metro dev server (which needs the repo-root server root to serve hoisted packages) and is left untouched.
  - **Do NOT "fix" this by setting `react { root }` to the repo root.** That makes the entry resolve, but also moves the bundler's *project root* to the repo root, which silently drops BOTH the `app/` routes (runtime `Error: No routes found`) AND the `.env` Firebase config from the bundle. Verified by bundle inspection: repo-root project root → 949 modules, no routes, no Firebase config; correct project root → 1487 modules, routes + Firebase present.
- **Build command:** `apps/mobile/android/gradlew.bat :app:assembleRelease` → `android/app/build/outputs/apk/release/app-release.apk`.
- **Release SHA-1 to register** with the Android OAuth client (keep the debug SHA-1 too): `AE:05:F3:5B:EE:2E:04:29:FD:4E:C2:4B:61:E9:A9:5D:70:06:D8:3A`.
- **`.env` values are baked into the APK.** Normal for Firebase web config — those are not secrets; Firestore security rules are what protect data. The APK is safe to pass around the family.

## R1-T2 Web Hosting
- Expo web export deployed to Firebase Hosting
- Add the hosting origin to the Web OAuth client's authorized JavaScript origins and redirect URIs

### Implementation notes (done — live at https://shoppingchecklist-62209.web.app)
- **`app.json` `web.output: "single"`** — a single-page app (one `index.html`, client-side routing). Simplest and most reliable for this app's Expo Router auth guards + client-only Firebase; avoids static per-route pre-render, which would try to render authed routes at build time.
- **`firebase.json` `hosting`** block: `public: "apps/mobile/dist"` (relative to repo root, where `firebase.json` lives), with a catch-all rewrite `** -> /index.html` for SPA routing.
- **Build + deploy:** `cd apps/mobile && npx expo export --platform web` (outputs to `dist/`), then `npx firebase-tools@latest deploy --only hosting`. No local firebase-tools; runs via npx. Owner is logged in as dev.marmot@gmail.com; project `shoppingchecklist-62209` from `.firebaserc`.
- **Metro monorepo fix interaction (important):** the R1-T1 `metro.config.js` server-root pin is scoped to `export:embed` (Android native bundling) ONLY. The web exporter (`expo export`) auto-resolves its own entry and needs the DEFAULT repo-root server root to find the hoisted `expo-router/entry`; an earlier broader `export` match broke web export with "Unable to resolve module ./node_modules/expo-router/entry.js". Do not widen that condition back to plain `export`.
- **OAuth (blocking, owner did in Google Cloud Console):** added `https://shoppingchecklist-62209.web.app` to the Web OAuth client's **Authorized JavaScript origins**, and both `…web.app` and `…web.app/` to **Authorized redirect URIs**. Without this, web sign-in fails with `Error 400: redirect_uri_mismatch`. The alternate Firebase domain `https://shoppingchecklist-62209.firebaseapp.com` serves the same site; add it too if ever used. Firebase Hosting auto-authorizes these domains for Firebase Auth, so no separate Auth "authorized domains" step was needed.
- **"For us" vs "for everybody":** hosting is public either way. Who can sign in is governed by the OAuth consent screen: Testing mode = only added test users (family) can sign in; Production = anyone. Same deployment for both — flip the consent screen to go public. Per-user Firestore rules keep data isolated regardless.
- **Redeploy after any web change:** re-run the export + `firebase deploy --only hosting`.

## R1-T3 Branding
- Home-screen display name "Refillio" (public product name), proper icon and splash

### Implementation notes (done)
- **Name "Refillio"** in `app.json` `name` (drives Android launcher label, web page
  title, PWA manifest name) and in the login + loading screens (`app/index.tsx`,
  `components/LoadingScreen.tsx`).
- **Icon** — owner-supplied green house/checklist/`+` artwork at repo-root
  `assets/icon.png` (full-bleed) and `assets/icon_circle.png` (circle
  composition). Processed with `jimp-compact` into `apps/mobile/assets/icon.png`
  and wired to `icon`, `adaptiveIcon.foregroundImage` (bg `#30b348`), splash, and
  web favicon. Sized so a launcher circle mask shows the full logo with margin
  (matched to `icon_circle.png` via a mask simulation before building). No image
  library is added — `jimp-compact` ships transitively via `@expo/image-utils`.
- **OAuth consent screen** (Google Cloud Console → Google Auth Platform →
  Branding): app name "Refillio", logo, support email — so Google sign-in shows
  "Refillio wants to access…" rather than the project ID. Logo prepared at
  `C:\Users\bonda\refillio-logo.png` (512×512).
- **Test users** (consent screen → Audience): family Google accounts added so
  they can sign in on both the APK and the web app while the app stays in
  Testing mode (no Google verification needed for basic email/profile scopes).
  Publishing to Production (anyone can sign in) is a later, optional step.

## R1-T4 Swipe between tabs (mobile) — done
- Swipe horizontally between Shopping / Catalog / Groups on phones; **web stays tap-only** (no swipe), by design.

### Implementation notes (done)
- **`apps/mobile/app/(tabs)/_layout.tsx`** — native uses `@react-navigation/material-top-tabs` (a `react-native-pager-view` pager) via `withLayoutContext`, positioned at the bottom (`tabBarPosition="bottom"`) so it keeps the bottom-bar UX. Material Top Tabs has no header, so a small custom **"Refillio"** header is rendered above it (Sign-out on the right; drops its safe-area inset when the offline banner is showing). **Web** branches on `Platform.OS === 'web'` to the unchanged tap-only Expo Router `Tabs` (with its built-in header).
- **Active-tab highlight** — a filled accent **pill** (`tabBarIndicatorStyle` sized to a rounded rect + `tabBarIndicatorContainerStyle` inset) that slides under the current tab as you swipe, instead of the thin default edge line.
- **Reorder-gesture coordination** (Groups) — the reorder pan is `Gesture.Pan().activeOffsetY([-12, 12])` (via `ReorderableList`'s `panGesture`), so a horizontal swipe never engages the reorder and flows to the pager, while a vertical drag on the handle reorders. `failOffsetX` was tried and rejected (fails the drag on sideways jitter; corrupts drag-direction tracking).
- **New deps:** `react-native-pager-view`, `@react-navigation/material-top-tabs` (native → needs a rebuild/reinstall of the APK).
- **Known caveat (deferred to P1-T2):** the Groups drag-reorder **autoscroll is disabled** (`autoscrollSpeedScale={0}`) because `react-native-reorderable-list` mis-behaves inside the pager on Reanimated 4. Reordering works within the on-screen area; for a long list, scroll first, then drag.

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

## P1-T2 Restore Groups reorder autoscroll under the swipe pager

**Context:** swipe-between-tabs shipped in **R1-T4**. Its one caveat: the Groups
drag-reorder **autoscroll is disabled** as a stopgap (`autoscrollSpeedScale={0}`
in `groups.tsx`), so reordering only works within the on-screen area — for a
long list, scroll first, then drag. This ticket is to restore proper
edge-autoscroll.

### The bug (why autoscroll is disabled)
`react-native-reorderable-list@0.18.1` (latest; peer `react-native-reanimated >=3.12.0`) does **not** work correctly inside the pager on **Reanimated 4.1.7**. Two confirmed issues, from on-device logging:
1. **Height oscillation.** The reorder FlatList's `onLayout` height flips **continuously** between the real viewport (~`758`dp) and a collapsed ~`83`dp and never settles. The library stores the *last* `onLayout` height as `flatListSize` and derives its autoscroll thresholds from it: top `= 0.1 × h`, bottom `= 0.9 × h`. When it lands on `83`, the bottom threshold sits **mid-screen** (`~75px`) → a small downward drag triggers runaway downward autoscroll; the top zone shrinks to `~8px` (matches the observed "up only very near the top, down almost everywhere"). The pager drives this re-measure on the animated list — an explicit-height wrapper, only-grow measurement, and container measurement all failed to stop the FlatList itself from re-measuring to `83`.
2. **Reanimated 4 frozen-worklet mutation.** Warning `[Worklets] Tried to modify key N of an object which has been already passed to a worklet` — the library mutates shared-value arrays (`itemOffset`/`itemSize`) that Reanimated 4 freezes, so per-item position tracking is also suspect. Surfaces with many groups (index ≥ ~6).

### Options to fix (pick one when picked up)
- **(a)** Replace `react-native-reorderable-list` with a Reanimated-4-native drag-reorder library and re-verify it inside the pager.
- **(b)** `patch-package` the library: fix the frozen-array mutations for Reanimated 4, and stop the `flatListSize` oscillation inside the pager (e.g., accept an explicit stable viewport height, or debounce/ignore the collapsed re-measure). Fragile.
- **(c)** Wait for a library release supporting Reanimated 4 + pager, then re-enable autoscroll (remove `autoscrollSpeedScale={0}`).

### Acceptance
Reorder a group in a long list; the screen auto-scrolls **only** when the dragged item is near the top/bottom edge (like every other app), with swipe-between-tabs still working from anywhere on Groups.

---

# Important Rules

- Never skip tickets
- Never merge tickets
- Always test after each ticket
- If something breaks → fix immediately before continuing
