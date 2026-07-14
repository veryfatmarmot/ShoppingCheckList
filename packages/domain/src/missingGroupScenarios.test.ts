import { describe, expect, it } from 'vitest';

import type { CatalogItem } from './catalogItem';
import type { Group } from './group';
import type { ListItem } from './listItem';
import { normalizeName } from './normalizeName';
import { sectionItemsByGroup } from './sectionItemsByGroup';

function group(id: string, order: number): Group {
  return {
    id,
    name: id,
    normalizedName: id,
    order,
    createdAt: 0,
    updatedAt: 0,
  };
}

function itemData(name: string, groupId: string | null) {
  return { name, normalizedName: normalizeName(name), groupId, note: '' };
}

function catalogItem(
  id: string,
  name: string,
  groupId: string | null,
): CatalogItem {
  return {
    id,
    createdAt: 0,
    updatedAt: 0,
    deleted: false,
    itemData: itemData(name, groupId),
  };
}

function listItem(id: string, name: string, groupId: string | null): ListItem {
  return {
    id,
    catalogItemId: null,
    quantity: 1,
    createdAt: 0,
    updatedAt: 0,
    itemData: itemData(name, groupId),
  };
}

// A dangling groupId is not hypothetical: deleting a group removes the group
// document, and any item that has not yet had its reference cleared (M4-T9
// cascade, or a device that was offline when the group was deleted) still
// carries the old id. The fallback is what stops that from breaking the UI.
describe('missing group fallback', () => {
  it('renders items whose group was deleted as Ungrouped', () => {
    const items = [catalogItem('a', 'Apple', 'produce')];

    // "produce" no longer exists.
    const sections = sectionItemsByGroup(items, []);

    expect(sections).toHaveLength(1);
    expect(sections[0].group).toBeNull();
    expect(sections[0].items.map((item) => item.id)).toEqual(['a']);
  });

  it('collapses items from several deleted groups into one Ungrouped section', () => {
    const items = [
      catalogItem('a', 'Apple', 'produce'),
      catalogItem('b', 'Bread', 'bakery'),
    ];

    const sections = sectionItemsByGroup(items, []);

    expect(sections).toHaveLength(1);
    expect(sections[0].group).toBeNull();
    expect(sections[0].items.map((item) => item.id)).toEqual(['a', 'b']);
  });

  // The cascade clears groupId to null; until it lands, the item still points at
  // the deleted group. Both must look the same to the user — which is exactly
  // why the cascade could safely be deferred to a later ticket.
  it('treats a cleared (null) and a not-yet-cleared (dangling) item identically', () => {
    const cleared = catalogItem('cleared', 'Apple', null);
    const dangling = catalogItem('dangling', 'Bread', 'deleted-group');

    const sections = sectionItemsByGroup([cleared, dangling], []);

    expect(sections).toHaveLength(1);
    expect(sections[0].group).toBeNull();
    expect(sections[0].items.map((item) => item.id)).toEqual([
      'cleared',
      'dangling',
    ]);
  });

  it('applies the fallback to list items too, not just catalog items', () => {
    const items = [
      listItem('a', 'Apple', 'deleted-group'),
      listItem('b', 'Bread', null),
    ];

    const sections = sectionItemsByGroup(items, []);

    expect(sections).toHaveLength(1);
    expect(sections[0].group).toBeNull();
    expect(sections[0].items.map((item) => item.id)).toEqual(['a', 'b']);
  });

  it('only the dangling items fall back; surviving groups keep theirs', () => {
    const groups = [group('dairy', 0)];
    const items = [
      catalogItem('milk', 'Milk', 'dairy'),
      catalogItem('apple', 'Apple', 'deleted-group'),
    ];

    const sections = sectionItemsByGroup(items, groups);

    expect(sections.map((s) => s.group?.id ?? 'ungrouped')).toEqual([
      'dairy',
      'ungrouped',
    ]);
    expect(sections[0].items.map((i) => i.id)).toEqual(['milk']);
    expect(sections[1].items.map((i) => i.id)).toEqual(['apple']);
  });

  it('still sorts Ungrouped items by normalizedName', () => {
    const items = [
      catalogItem('z', 'Zucchini', 'deleted-group'),
      catalogItem('a', 'Apple', null),
      catalogItem('m', 'Mango', 'another-deleted-group'),
    ];

    const [section] = sectionItemsByGroup(items, []);

    expect(section.items.map((item) => item.id)).toEqual(['a', 'm', 'z']);
  });
});
