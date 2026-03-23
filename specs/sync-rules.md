# Sync Rules

## Strategy
- Last-write-wins
- Compare updatedAt

## CatalogItem
Create:
- id, timestamps, deleted=false

Edit:
- overwrite full record

Delete:
- deleted=true

Resurrection:
- newer write restores deleted item

## ListItem
Create:
- snapshot itemData
- set catalogItemId or null

Edit:
- overwrite

Buy:
- delete doc

Undo:
- local buffer + recreate

## Groups
- LWW ordering

## Notes
- client timestamps
- client-generated IDs
