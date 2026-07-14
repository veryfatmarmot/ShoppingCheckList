import { describe, expect, it } from 'vitest';

import type { CatalogItem } from './catalogItem';
import type { Group } from './group';
import { hasDuplicateCatalogName } from './hasDuplicateCatalogName';
import { normalizeName } from './normalizeName';
import { sectionItemsByGroup } from './sectionItemsByGroup';

function catalogItem(
  id: string,
  name: string,
  { deleted = false, groupId = null as string | null } = {},
): CatalogItem {
  return {
    id,
    createdAt: 0,
    updatedAt: 0,
    deleted,
    itemData: { name, normalizedName: normalizeName(name), groupId, note: '' },
  };
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

// What the user is about to type, normalized the same way a real save would be.
function wouldDuplicate(
  typed: string,
  items: CatalogItem[],
  excludeId?: string,
) {
  return hasDuplicateCatalogName(normalizeName(typed), items, excludeId);
}

describe('duplicate scenarios', () => {
  // Prevention is best-effort and happens in the UI before a write.
  describe('prevention', () => {
    const existing = [catalogItem('a', 'Milk')];

    it.each(['milk', 'MILK', 'Milk', '  Milk  ', 'milk  '])(
      'flags "%s" as a duplicate of an existing "Milk"',
      (typed) => {
        expect(wouldDuplicate(typed, existing)).toBe(true);
      },
    );

    it('does not flag a genuinely different name', () => {
      expect(wouldDuplicate('Milk 2%', existing)).toBe(false);
    });

    it('does not flag an item against itself while editing', () => {
      expect(wouldDuplicate('Milk', existing, 'a')).toBe(false);
    });

    it('lets a name be reused after the original was soft-deleted', () => {
      const tombstoned = [catalogItem('a', 'Milk', { deleted: true })];

      expect(wouldDuplicate('Milk', tombstoned)).toBe(false);
    });
  });

  // Prevention cannot be guaranteed: two offline devices can each create the
  // same name. The system must then tolerate them and render them
  // independently so the user can resolve the duplication themselves.
  describe('tolerance when duplicates slip through', () => {
    it('renders same-named items as separate rows rather than collapsing them', () => {
      const produce = group('produce', 0);
      const items = [
        catalogItem('from-phone', 'Milk', { groupId: 'produce' }),
        catalogItem('from-web', 'Milk', { groupId: 'produce' }),
      ];

      const [section] = sectionItemsByGroup(items, [produce]);

      expect(section.items).toHaveLength(2);
      expect(section.items.map((item) => item.id)).toEqual([
        'from-phone',
        'from-web',
      ]);
    });

    it('keeps duplicates in their own groups when they were filed differently', () => {
      const groups = [group('produce', 0), group('dairy', 1)];
      const items = [
        catalogItem('a', 'Milk', { groupId: 'produce' }),
        catalogItem('b', 'Milk', { groupId: 'dairy' }),
      ];

      const sections = sectionItemsByGroup(items, groups);

      expect(sections.map((s) => s.group?.id)).toEqual(['produce', 'dairy']);
      expect(sections[0].items.map((i) => i.id)).toEqual(['a']);
      expect(sections[1].items.map((i) => i.id)).toEqual(['b']);
    });

    it('still hides a soft-deleted twin, showing only the surviving item', () => {
      const items = [
        catalogItem('kept', 'Milk'),
        catalogItem('removed', 'Milk', { deleted: true }),
      ];

      // The catalog view filters tombstones before sectioning.
      const active = items.filter((item) => !item.deleted);
      const [section] = sectionItemsByGroup(active, []);

      expect(section.items.map((item) => item.id)).toEqual(['kept']);
    });
  });
});
