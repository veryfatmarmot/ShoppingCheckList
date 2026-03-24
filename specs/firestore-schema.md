# Firestore Schema

This document defines the Firestore data layout, document structure, and access patterns.

This is a STORAGE contract, not business logic.  
Business rules are defined in `domain-model.md`.

---

# Collections and Paths

All data is strictly scoped per user.

## Paths

```
users/{userId}
users/{userId}/catalogItems/{catalogItemId}
users/{userId}/listItems/{listItemId}
users/{userId}/groups/{groupId}
```

---

# Security Model (Critical)

- Each user can only access their own data:
  ```
  users/{userId}/...
  ```
  where:
  ```
  userId == request.auth.uid
  ```

- No cross-user access is allowed

## Minimum Firestore Rules (MVP)

- Require authenticated user
- Enforce path ownership
- Allow read/write only inside user scope

---

# Common Field Rules

## IDs
- All IDs are client-generated GUIDs
- Document ID MUST match `id` field inside the document

## Timestamps
- Stored as UNIX epoch milliseconds (number)
- `createdAt` is immutable
- `updatedAt` must be updated on every write

## Writes
- Entire document is overwritten on update (no partial updates for MVP)

---

# Document Schemas

## catalogItems

### Fields
```json
{
  "id": "string (GUID)",
  "createdAt": "number (ms)",
  "updatedAt": "number (ms)",
  "deleted": "boolean",
  "itemData": {
    "name": "string",
    "normalizedName": "string",
    "groupId": "string | null",
    "note": "string"
  }
}
```

### Constraints
- `id` must equal document ID
- `createdAt` must not change after creation
- `updatedAt` must increase on updates
- `deleted` is required
- `itemData` must always be present

---

## listItems

### Fields
```json
{
  "id": "string (GUID)",
  "catalogItemId": "string | null",
  "quantity": "number (> 0)",
  "createdAt": "number (ms)",
  "updatedAt": "number (ms)",
  "itemData": {
    "name": "string",
    "normalizedName": "string",
    "groupId": "string | null",
    "note": "string"
  }
}
```

### Constraints
- `quantity` must be > 0, can have decimals
- `itemData` must always be present (snapshot)
- `catalogItemId` may be null
- `catalogItemId` may reference a non-existing catalog item

---

## groups

### Fields
```json
{
  "id": "string (GUID)",
  "name": "string",
  "normalizedName": "string",
  "order": "number",
  "createdAt": "number (ms)",
  "updatedAt": "number (ms)"
}
```

### Constraints
- `name` must be non-empty
- `normalizedName` must match name normalization rules
- `order` determines display order (ascending)

---

# Write Semantics (Critical)

## General rule
- Entire document is overwritten on update
- No partial updates (MVP simplification)

---

## Conflict Resolution

- Last-write-wins using `updatedAt`
- New write replaces existing document if:
  ```
  new.updatedAt > existing.updatedAt
  ```

- Firestore does NOT enforce this automatically  
- Client is responsible for maintaining this rule

---

## ID Collisions

If a write uses an existing ID:

- If intended as update → allowed
- If intended as create → considered abnormal
- Client should log collision and resolve appropriately

---

## Deletion Rules

### CatalogItem
- Soft delete:
  ```
  deleted = true
  updatedAt = now
  ```

### ListItem
- Hard delete (document removed)

### Group
- Hard delete (document removed)

---

# Query Patterns (MVP)

## Load all data (primary strategy)

### Catalog
```
users/{userId}/catalogItems
```
- filter `deleted == false` on client

### ListItems
```
users/{userId}/listItems
```

### Groups
```
users/{userId}/groups
```

---

# Client-side Processing

## Grouping

- group by `itemData.groupId`
- if `groupId == null` → Ungrouped
- if group not found → Ungrouped

---

## Sorting

### Groups
- sorted by `order` ascending

### Items inside group
- sorted by `itemData.normalizedName`

---

# Duplicate Detection (Catalog)

- Performed on client
- Based on `itemData.normalizedName`
- Only among non-deleted items

## Limitations
- Offline mode may create duplicates
- System must tolerate duplicates
- UI shows both duplicates and lets users to resolve them

---

# Indexing (MVP)

No custom indexes required because:
- full collection is loaded
- filtering and sorting done client-side

---

# Offline Behavior

- Firestore offline persistence is enabled
- Writes are queued locally and synced later
- Conflicts resolved using `updatedAt` (last-write-wins)

---

# Scaling Notes (Future)

Potential improvements:

- server-side filtering:
  - `deleted == false`
- pagination for large catalogs
- composite indexes for filtering + sorting
- server-side validation rules
- server-side duplicate prevention
- server timestamp usage instead of client time
- CRDT-based conflict resolution (optional)

---

# Design Rationale

## Per-user collections
- simplifies security rules
- avoids multi-tenant complexity
- matches shared-account model

## Load-all strategy
- expected dataset is small (hundreds of items)
- simplifies implementation
- avoids complex queries

## Snapshot ListItem design
- avoids cascading updates
- simplifies offline sync
- ensures data availability even if catalog item is deleted
