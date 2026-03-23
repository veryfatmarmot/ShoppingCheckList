# Firestore Schema

## Paths
users/{userId}  
users/{userId}/catalogItems/{id}  
users/{userId}/listItems/{id}  
users/{userId}/groups/{id}

## Document models with example data

### catalogItems
```
{
  "id": "guid",
  "createdAt": 1760000000000,
  "updatedAt": 1760000000000,
  "deleted": false,
  "itemData": {
    "name": "Milk",
    "normalizedName": "milk",
    "groupId": "group-guid-or-null",
    "note": ""
  }
}
```

### listItems
```
{
  "id": "guid",
  "catalogItemId": "catalog-guid-or-null",
  "quantity": 2.0,
  "createdAt": 1760000000000,
  "updatedAt": 1760000000000,
  "itemData": {
    "name": "Milk",
    "normalizedName": "milk",
    "groupId": "group-guid-or-null",
    "note": ""
  }
}
```

### groups
```
{
  "id": "guid",
  "name": "Dairy",
  "normalizedName": "dairy",
  "order": 100,
  "createdAt": 1760000000000,
  "updatedAt": 1760000000000
}
```

## Required queries for MVP

### Load catalog
- all catalogItems
- filter deleted == false on client or query if convenient
- group by effective group
- sort inside group by itemData.normalizedName

### Load active list
- all listItems
- group by effective group
- sort inside group by itemData.normalizedName

### Load groups
- all groups
- sort by order

### Best-effort duplicate check
- scan loaded catalog in memory by itemData.normalizedName
- since MVP loads all, this is simple and avoids complicated Firestore uniqueness guarantees

That last point is important: since you load all anyway, duplicate detection can be done reliably enough in client memory for MVP.
