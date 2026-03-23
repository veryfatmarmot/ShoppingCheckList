# Domain Model

## ItemData
- name: string
- normalizedName: string
- groupId: string | null
- note: string

Rule: normalizedName recomputed on name change

Normalization:
- trim
- lowercase
- collapse spaces

## CatalogItem
- id: string
- createdAt: number
- updatedAt: number
- deleted: boolean
- itemData: ItemData

## ListItem
- id: string
- catalogItemId: string | null
- quantity: number
- createdAt: number
- updatedAt: number
- itemData: ItemData

## Group
- id: string
- name: string
- normalizedName: string
- order: number
- createdAt: number
- updatedAt: number
