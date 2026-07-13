import { describe, expect, it } from 'vitest';

import type { Group } from './group';
import type { ItemData } from './itemData';
import { sectionItemsByGroup } from './sectionItemsByGroup';

interface TestItem {
  id: string;
  itemData: ItemData;
}

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

function item(
  id: string,
  groupId: string | null,
  normalizedName: string,
): TestItem {
  return {
    id,
    itemData: { name: normalizedName, normalizedName, groupId, note: '' },
  };
}

describe('sectionItemsByGroup', () => {
  it('returns no sections for empty input', () => {
    expect(sectionItemsByGroup([], [])).toEqual([]);
  });

  it('places items with a null groupId in the Ungrouped section', () => {
    const sections = sectionItemsByGroup([item('a', null, 'apple')], []);

    expect(sections).toHaveLength(1);
    expect(sections[0].group).toBeNull();
    expect(sections[0].items.map((i) => i.id)).toEqual(['a']);
  });

  it('treats an unknown/stale groupId as Ungrouped', () => {
    const sections = sectionItemsByGroup(
      [item('a', 'deleted-group', 'apple')],
      [group('produce', 0)],
    );

    expect(sections).toHaveLength(1);
    expect(sections[0].group).toBeNull();
  });

  it('orders sections by group.order and puts Ungrouped last', () => {
    const groups = [group('dairy', 1), group('produce', 0)];
    const items = [
      item('milk', 'dairy', 'milk'),
      item('apple', 'produce', 'apple'),
      item('mystery', null, 'mystery'),
    ];

    const sections = sectionItemsByGroup(items, groups);

    expect(sections.map((s) => s.group?.id ?? 'ungrouped')).toEqual([
      'produce',
      'dairy',
      'ungrouped',
    ]);
  });

  it('sorts items within a section by normalizedName', () => {
    const groups = [group('produce', 0)];
    const items = [
      item('z', 'produce', 'zucchini'),
      item('a', 'produce', 'apple'),
      item('m', 'produce', 'mango'),
    ];

    const [section] = sectionItemsByGroup(items, groups);

    expect(section.items.map((i) => i.id)).toEqual(['a', 'm', 'z']);
  });

  it('omits groups that have no items', () => {
    const groups = [group('produce', 0), group('empty', 1)];
    const sections = sectionItemsByGroup(
      [item('apple', 'produce', 'apple')],
      groups,
    );

    expect(sections.map((s) => s.group?.id)).toEqual(['produce']);
  });
});
