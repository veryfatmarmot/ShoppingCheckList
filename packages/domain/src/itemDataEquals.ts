import type { ItemData } from './itemData';

// Structural equality of two ItemData values across every field. Used to decide
// whether a ListItem and its linked CatalogItem are still "in sync" — i.e. the
// list item's snapshot has not diverged from its catalog source — which gates
// whether editing the list item also updates the catalog item.
export function itemDataEquals(a: ItemData, b: ItemData): boolean {
  return (
    a.name === b.name &&
    a.normalizedName === b.normalizedName &&
    a.groupId === b.groupId &&
    a.note === b.note
  );
}
