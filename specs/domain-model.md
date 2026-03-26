# Domain Model

This document defines the core domain entities, invariants, and rules.
It is the single source of truth for business logic.

---

# Common Rules

## IDs
- All IDs are client-generated GUIDs (string)
- IDs must be globally unique per collection
- Creating with an existing ID is considered a conflict

## Timestamps
- `createdAt` and `updatedAt` are UNIX epoch milliseconds (number)
- `createdAt` is immutable
- `updatedAt` must be updated on every write
- Conflict resolution uses `updatedAt` (last-write-wins)

---

# Normalization

## normalizedName rules
Derived from `name`:

- trim leading/trailing spaces
- convert to lowercase
- collapse multiple spaces into one

Example:
" Milk 2% " → "milk 2%"


## Invariant
- `normalizedName` MUST always match `name`
- Any update to `name` MUST recompute `normalizedName` in the same write

---

# Entity: ItemData

Reusable data shared by CatalogItem and ListItem.

## Fields
- name: string
- normalizedName: string
- groupId: string | null
- note: string

## Invariants

### name
- must be non-empty after trim

### groupId
- may be null
- if not null, may reference non-existing group (handled gracefully as it was nul)

### note
- optional string (may be empty)

---

# Entity: CatalogItem

Represents reusable item in the catalog.

## Fields
- id: string
- createdAt: number
- updatedAt: number
- deleted: boolean
- itemData: ItemData

## Invariants

- `deleted = false` → active item
- `deleted = true` → tombstone (soft deleted)

## Behavior

### Create
- generate id
- set createdAt = updatedAt = now
- set deleted = false
- validate ItemData

### Update
- overwrite entire object
- update updatedAt
- recompute normalizedName if needed

### Delete
- set deleted = true
- update updatedAt

### Resurrection
- if a newer write sets `deleted = false`, item becomes active again

---

# Entity: ListItem

Represents an item in the active shopping list.

## Fields
- id: string
- catalogItemId: string | null
- quantity: number
- createdAt: number
- updatedAt: number
- itemData: ItemData

## Invariants

### quantity
- must be > 0
- decimals allowed

### itemData
- always required
- must be complete even if catalogItemId exists

## Behavior

### Snapshot rule (MVP)
- When created from CatalogItem:
  - itemData is copied (snapshot)
  - future catalog changes DO NOT affect this ListItem

### Create (from catalog)
- copy itemData from CatalogItem
- set catalogItemId
- set quantity

### Create (one-time item)
- catalogItemId = null
- itemData provided by user
- set quantity

### Update
- overwrite entire object
- update updatedAt

### Buy (complete)
- ListItem is physically deleted

### Undo
- client recreates ListItem with a new ID

---

# Entity: Group

Represents logical grouping (e.g. store section).

## Fields
- id: string
- name: string
- normalizedName: string
- order: number
- createdAt: number
- updatedAt: number

## Invariants

### name
- must be non-empty after trim

### normalizedName
- must follow normalization rules
- must be updated on every *name* change

### order
- numeric
- used for sorting (ascending)

## Behavior

### Create / Update
- recompute normalizedName on name change
- update updatedAt

### Delete
- before delete, clear `groupId` to null on all referencing CatalogItem.itemData and ListItem.itemData
- physically removed

---

# Derived Behavior (Important)

## Missing group handling

For any entity referencing groupId:

- if groupId == null → Ungrouped
- if groupId not found → Ungrouped

---

## Duplicate handling (Catalog)

- Duplicate prevention is best-effort:
  - compare normalizedName among non-deleted items
- Duplicates may still exist due to offline conflicts
- System must tolerate duplicates

---

## Sorting

### Groups
- sorted by `order` ascending

### Items within group (both the ListItems and CatalogItems)
- sorted by `itemData.normalizedName`

---

# Notes for Implementation

- This is a DOMAIN model, not a Firestore schema
- All validation must be implemented in the domain layer
- UI and backend must respect these invariants
