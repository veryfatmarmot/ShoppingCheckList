import type { Group } from './group';
import type { ItemData } from './itemData';
import { sortGroups } from './sortGroups';

// A `null` group means the "Ungrouped" bucket.
export interface GroupSection<T> {
  group: Group | null;
  items: T[];
}

function byNormalizedName<T extends { itemData: ItemData }>(
  a: T,
  b: T,
): number {
  return a.itemData.normalizedName.localeCompare(b.itemData.normalizedName);
}

// Buckets items (CatalogItem or ListItem — anything carrying `itemData`) into
// ordered display sections: named groups first, ordered by `group.order`, each
// with its items sorted by `itemData.normalizedName`; then a single "Ungrouped"
// section (group === null) for items whose `groupId` is null or does not match
// an existing group. Sections with no items are omitted.
export function sectionItemsByGroup<T extends { itemData: ItemData }>(
  items: T[],
  groups: Group[],
): GroupSection<T>[] {
  const knownGroupIds = new Set(groups.map((group) => group.id));

  // Resolve each item to a group id, or null for ungrouped/unknown.
  const buckets = new Map<string | null, T[]>();
  for (const item of items) {
    const groupId = item.itemData.groupId;
    const key = groupId !== null && knownGroupIds.has(groupId) ? groupId : null;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(item);
    } else {
      buckets.set(key, [item]);
    }
  }

  const sections: GroupSection<T>[] = [];

  for (const group of sortGroups(groups)) {
    const bucket = buckets.get(group.id);
    if (bucket && bucket.length > 0) {
      sections.push({ group, items: [...bucket].sort(byNormalizedName) });
    }
  }

  const ungrouped = buckets.get(null);
  if (ungrouped && ungrouped.length > 0) {
    sections.push({
      group: null,
      items: [...ungrouped].sort(byNormalizedName),
    });
  }

  return sections;
}
