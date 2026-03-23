# Firestore Schema

## Paths
users/{userId}
users/{userId}/catalogItems/{id}
users/{userId}/listItems/{id}
users/{userId}/groups/{id}

## catalogItems
{
  id,
  createdAt,
  updatedAt,
  deleted,
  itemData: { name, normalizedName, groupId, note }
}

## listItems
{
  id,
  catalogItemId,
  quantity,
  createdAt,
  updatedAt,
  itemData: { name, normalizedName, groupId, note }
}

## groups
{
  id,
  name,
  normalizedName,
  order,
  createdAt,
  updatedAt
}

## Queries
- Load all collections
- Filter deleted catalog items client-side
- Group + sort in client
