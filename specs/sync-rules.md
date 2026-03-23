# Sync Rules

## Conflict strategy
- last-write-wins
- compare updatedAt
- newer write wins
- entire record is replaced by the winning record

## Timestamp source
- client-generated for MVP

## ID source
- client-generated GUID

## CatalogItem rules
### Create
- generate GUID
- validate name non-empty after trim
- compute normalizedName
- set createdAt = updatedAt = now
- set deleted = false

### Edit
- same ID
- overwrite full record
- recompute normalizedName if name changed
- updatedAt = now

### Delete
- set deleted = true
- updatedAt = now

### Recreate after delete
- same ID
- later write with deleted = false and newer updatedAt resurrects item

## ListItem rules
### Create from catalog
- generate GUID
- copy snapshot of catalog itemData
- set catalogItemId
- set quantity
- createdAt = updatedAt = now

### Create one-time
- generate GUID
- set catalogItemId = null
- fill full itemData
- set quantity
- createdAt = updatedAt = now

### Edit
- overwrite full record
- updatedAt = now

### Buy
- physically delete ListItem document

### Undo
- local-only
- client stores recent deleted/bought list items
- undo performs compensating create call

## Group rules
### Create/edit
- recompute normalizedName when name changes
- updatedAt = now

### Delete
- physical delete
- items referencing missing group automatically render as Ungrouped

## Missing group resolution

For any item:
- if groupId == null → Ungrouped
- if group document missing → Ungrouped

## Duplicate policy
- best-effort prevent duplicates in UI
- offline collisions may still create duplicates
- app must tolerate duplicates without breaking