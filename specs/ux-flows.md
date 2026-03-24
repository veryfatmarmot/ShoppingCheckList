# UX Flows

This document defines UI structure, navigation, and interaction behavior.

This is a UX CONTRACT for implementation.
It must align with:
- domain-model.md
- firestore-schema.md
- sync-rules.md

---

# App Entry & Auth Flow

## Startup
- App launches
- Check authentication state

## If NOT authenticated
- Show Login Screen (Google Login modal)

## If authenticated
- Load user data
- Navigate to main app (Tabs)

---

# Modal: Google Login

## Layout
- Title: "Sign in"
- Button: "Continue with Google"

## Behavior
- Trigger Google OAuth
- On success:
  - retrieve userId (Google UID)
  - initialize Firestore user scope
  - navigate to main app
- On failure:
  - show error
  - allow retry

---

# Screen Map (Main App)

## Tabs
- Shopping List
- Catalog
- Groups

---

# Screen: Shopping List

## Layout
- Header: "Shopping List"
- Button: "Add one-time item"
- Grouped list of items

## Data
- Source: listItems
- Group by itemData.groupId
- Sort groups by group.order
- Sort items by itemData.normalizedName

## Item Row
- name
- quantity
- checkbox (mark bought)

## Interactions

### Add one-time item
- opens Add One-Time List Item modal

### Edit item
- opens Edit List Item modal

### Mark as bought
- deletes ListItem
- triggers local undo buffer

### Empty state
- show "Shopping Complete"

---

# Screen: Catalog

## Layout
- Header: "Catalog"
- Grouped list of items

## Data
- Source: catalogItems (deleted == false)
- Group by itemData.groupId
- Sort groups by group.order
- Sort items by itemData.normalizedName

## Item Row
- name
- add button [+]

## Interactions

### Add item to list
- if item already in list:
  - disable button
- else:
  - open Add List Item From Catalog modal

### Edit item
- open Add/Edit Catalog Item modal

### Delete item
- open Delete Confirmation modal
- on confirm:
  - set deleted = true

---

# Screen: Groups

## Layout
- Header: "Groups"
- List of groups sorted by order
- Button: "Add Group"

## Interactions

### Create group
- open Add/Edit Group modal

### Edit group
- open Add/Edit Group modal

### Reorder groups
- drag & drop
- update order field

### Delete group
- open Delete Confirmation modal
- on confirm:
  - delete group
  - affected items become Ungrouped

---

# Modal: Add One-Time List Item

## Fields
- name
- quantity
- group
- note

## Behavior
- validate name (non-empty)
- validate quantity (> 0)
- on confirm:
  - create ListItem with catalogItemId = null

---

# Modal: Add List Item From Catalog

## Fields
- quantity

## Behavior
- validate quantity (> 0)
- on confirm:
  - create ListItem from catalog snapshot

---

# Modal: Edit List Item

## Fields
- name
- group
- note
- quantity

## Behavior
- overwrite full ListItem
- updatedAt = now

---

# Modal: Add/Edit Catalog Item

## Fields
- name
- group
- note

## Behavior
- validate name
- prevent duplicates (best-effort)
- recompute normalizedName
- create or update CatalogItem

---

# Modal: Add/Edit Group

## Fields
- name

## Behavior
- validate name
- recompute normalizedName
- create or update group

---

# Modal: Delete Confirmation

## Layout
- Warning text
- Confirm / Cancel buttons

## Behavior
- On confirm:
  - perform delete action
- On cancel:
  - close modal

---

# Global UX Rules

## Group Handling
- null or missing group → Ungrouped

## Sorting
- always use normalizedName

## Duplicate Handling
- prevent in UI if possible
- tolerate if exists

## Offline
- show indicator
- allow all actions
- sync later

## Undo
- local only
- recreates deleted items

---

# Edge Cases

- duplicate items may appear
- deleted catalog item does not break list item
- missing group handled gracefully
- concurrent edits resolved via LWW
