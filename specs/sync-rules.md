# Sync Rules

This document defines synchronization behavior, conflict resolution, and write semantics.

This is a BEHAVIORAL contract. It must align with:
- domain-model.md
- firestore-schema.md

---

# Core Principles

## Offline-first
- All operations must work offline
- Writes are applied locally first
- Firestore syncs changes when connection is available

## Conflict Resolution
- Strategy: Last-Write-Wins (LWW)
- Field: `updatedAt`
- Rule:
  - New write replaces existing document if:
    new.updatedAt > existing.updatedAt

- Entire document is replaced (no field-level merge)

---

# Sources of Truth

## IDs
- Client-generated GUIDs
- Must be unique per collection

## Timestamps
- Client-generated (MVP)
- Stored as UNIX epoch milliseconds

⚠ Known limitation:
- Clock drift may cause incorrect ordering
- Accepted for MVP

---

# Write Model

## General Rule
- All writes are FULL overwrites
- No partial updates

---

# CatalogItem Sync Rules

## Create
- Generate GUID
- Validate name (non-empty after trim)
- Compute normalizedName
- Set:
  - createdAt = now
  - updatedAt = now
  - deleted = false

## Edit
- Same ID
- Overwrite entire document
- Recompute normalizedName if name changed
- updatedAt = now

## Delete (Soft)
- Set:
  - deleted = true
  - updatedAt = now

## Resurrection
- If later write has:
  - same ID
  - deleted = false
  - newer updatedAt
→ item becomes active again

---

# ListItem Sync Rules

## Snapshot Principle (Critical)
- ListItem.itemData is a snapshot
- It MUST NOT change if CatalogItem changes

---

## Create from Catalog
- Generate GUID
- Copy CatalogItem.itemData
- Set catalogItemId
- Set quantity
- createdAt = updatedAt = now

## Create One-Time Item
- Generate GUID
- catalogItemId = null
- itemData fully defined by user
- Set quantity
- createdAt = updatedAt = now

## Edit
- Overwrite full document
- updatedAt = now

## Buy (Complete)
- Hard delete document

## Undo (Local Only)
- Store last N deleted items locally
- Undo = recreate ListItem via normal create flow with a new ID
- Not synchronized across devices

---

# Group Sync Rules

## Create / Edit
- Recompute normalizedName on name change
- updatedAt = now

## Reorder
- Update `order`
- updatedAt = now

## Delete
- First overwrite every referencing CatalogItem and ListItem so `itemData.groupId = null` with a newer `updatedAt`
- Then hard delete document

---

# Derived Behavior

## Missing Group Handling
For any entity referencing groupId:

- if groupId == null → Ungrouped
- if group does not exist → Ungrouped

---

# Duplicate Handling

## Catalog
- Duplicate prevention is best-effort (client-side)
- Based on normalizedName
- Only among non-deleted items

## Reality
- Duplicates MAY appear due to offline conflicts
- System must:
  - allow duplicates
  - render duplicates independently

---

# ID Collision Handling

If a write uses an existing ID:

## Case 1: Intended update
- Apply LWW rule

## Case 2: Unintended collision
- Treat as abnormal
- Client should log and surface for debugging

---

# Failure Scenarios

## Concurrent edits (same document)
- Later updatedAt wins
- Entire document replaced

## Delete vs Edit

Case:
- Device A deletes
- Device B edits later

Result:
- If edit.updatedAt > delete.updatedAt
→ document is restored (resurrection)

---

## Create duplicates offline

Case:
- Two devices create same item name offline

Result:
- Two different IDs created
- Both appear after sync
- User resolves manually

---

# Guarantees

The system guarantees:

- Deterministic conflict resolution (LWW)
- No partial merge inconsistencies
- ListItem always has valid renderable data
- Missing references never break UI

The system does NOT guarantee:

- Strong consistency
- Global uniqueness of names
- Perfect ordering across devices (due to client clocks)

---

# Future Improvements (Post-MVP)

- Server timestamps instead of client time
- Conflict resolution on backend
- Field-level merge strategies
- CRDT-based sync (optional)
- Duplicate resolution tools in UI
