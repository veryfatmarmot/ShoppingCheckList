# Offline Test Plan (M6-T4)

Offline behavior lives in the Firestore SDK and the sync layer, not in pure
logic, so it cannot be covered by the Vitest suite. This is the manual checklist
that stands in for that.

**Re-run this:**

- before the R1 release,
- after any change to `packages/data` (cache config, repositories, write path),
- after **P1-T1** (native Firebase SDK migration) — that ticket changes mobile
  offline behavior fundamentally, and Part B's expected results will change.

**Why it matters:** an untested assumption here has already shipped a
release-blocking bug. `getDoc` on an uncached document *rejects* when offline
rather than reporting absence, which silently broke **every** create. Nothing in
the green test suite noticed. Offline creation is the single most important thing
on this list.

---

## Preconditions

- Signed in, with at least 2 groups, 3 catalog items, and 2 list items already
  synced (so the cache is warm).
- Web: DevTools open (Network tab → throttling dropdown → **Offline**).
- Device: dev-client build installed; use **Airplane mode** to go offline.

---

## Part A — Web (persistent IndexedDB cache)

Web has disk-backed persistence (M5-T1), so queued writes and cached data
survive a reload.

Go offline first (**Network → Offline**), then:

- [ ] **Offline indicator** appears ("Offline — changes sync when you reconnect").
- [ ] **Create catalog item** → appears immediately in its group section.
- [ ] **Create group** → appears in the list.
- [ ] **Create one-time list item** → appears with the one-time row colour.
- [ ] **Add from catalog** (`+` → quantity → Add) → appears on the shopping list.
- [ ] **Edit** a catalog item (rename / change group / add note) → updates in place.
- [ ] **Edit** a list item (change quantity) → updates in place.
- [ ] **Rename a group** → updates; its items stay under it.
- [ ] **Reorder groups** (drag handle) → new order holds.
- [ ] **Soft-delete a catalog item** → disappears from the catalog.
- [ ] **Delete a group** → its items fall back to **Ungrouped**.
- [ ] **Mark bought** → row disappears; snackbar appears.
- [ ] **Undo** (tap Undo) → item returns.
- [ ] **Reload the page while still offline** → all data is still there, *including*
      every change made above. (This is the IndexedDB persistence; it is the
      main thing that distinguishes web from device.)
- [ ] **Go back online** (Network → No throttling) → indicator disappears and all
      queued writes sync. Confirm from a second tab or the phone.

---

## Part B — Device (in-memory cache only)

The mobile JS SDK has **no disk-backed cache** — this is the documented MVP
limitation (`sync-rules.md` → "Known MVP Limitation — Mobile Offline
Persistence"). Part of this section is verifying the limitation is *real*, so an
expected failure below is a **pass** of documented behavior, not a bug.

Turn on **Airplane mode**, then:

- [ ] **Offline banner** appears at the top.
- [ ] **Create catalog item / group / one-time item / add-from-catalog** → all work.
- [ ] **Edit** a catalog item and a list item → both update.
- [ ] **Delete**: soft-delete a catalog item, delete a group, mark bought → all work.
- [ ] **Undo** a mark-bought → item returns.
- [ ] **Turn Airplane mode off with the app still in the foreground** → banner clears
      and everything syncs. Verify on web.

### Known limitation — expected to FAIL (this is correct)

- [ ] Offline, make an edit. **Background the app** (or kill it) *before*
      reconnecting. Reopen once online.
      → **Expected: the edit is LOST.** No error, no retry.

  This is the accepted MVP gap: the write queue is memory-only, and the OS
  freezes/reclaims the JS process. If this edit *survives*, the limitation has
  been fixed and `sync-rules.md` + `prd.md` must be updated. **P1-T1 (native
  Firebase SDK) is the ticket that resolves this.**

---

## Part C — Conflict resolution (needs two clients)

Uses web + phone against the same account.

- [ ] Put the **phone offline**. Edit item *X* there (e.g. rename to "Phone").
- [ ] On **web (online)**, edit the same item *X* (e.g. rename to "Web").
- [ ] Bring the phone **back online**.
      → **Expected:** the write with the **higher `updatedAt` wins** (the later
      real-time edit). The losing write is rejected by the security rule and
      **absorbed silently** — no crash, no error dialog (M5-T5).
      Both clients converge on the same value.
- [ ] Check the console: a lost write logs
      `write rejected by last-write-wins rule` — a warning, not an error.

---

---

## Results — first run (M6-T4, Android device + web)

**Writes: pass.** Created a catalog item while offline; it appeared immediately,
survived, and synced to Firestore on reconnect (confirmed on the web client).
Offline creation works.

**Reads: fail — worse than the spec described.** Two failures, both verified:

1. *In-session:* opened the app online (landing on Shopping, which subscribes to
   `listItems` + `groups`), went offline, then opened Catalog for the first time
   → **empty**. `catalogItems` had never been fetched, so there was nothing in
   the memory cache. The only item shown was the one created offline.
2. *Cold start:* killed the app, went offline, reopened → **the entire app was
   empty** (no list, catalog, or groups), with Firestore logging that it could
   not reach the backend.

Failure 2 is the freezer-aisle scenario and defeats the product's core promise.
`sync-rules.md` and `prd.md` were corrected — they had documented only the write
loss and still claimed "all operations must work offline" / "Works without
internet".

**Action:** P1-T1 (native Firebase SDK, real disk persistence) is the fix, and
should land **before the app is relied on for real shopping**.

---

## Recording results

Note the date, the platform versions, and anything that deviated. Any deviation
in **Part A creates** or **Part B creates** is release-blocking — those are the
core "works offline" promise (`sync-rules.md`: "All operations must work
offline").
