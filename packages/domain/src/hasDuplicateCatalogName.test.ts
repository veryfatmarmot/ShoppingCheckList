import { describe, expect, it } from 'vitest';

import type { CatalogItem } from './catalogItem';
import { hasDuplicateCatalogName } from './hasDuplicateCatalogName';

function catalogItem(
  id: string,
  normalizedName: string,
  deleted = false,
): CatalogItem {
  return {
    id,
    createdAt: 0,
    updatedAt: 0,
    deleted,
    itemData: { name: normalizedName, normalizedName, groupId: null, note: '' },
  };
}

describe('hasDuplicateCatalogName', () => {
  it('returns false when no item matches', () => {
    expect(hasDuplicateCatalogName('milk', [catalogItem('a', 'bread')])).toBe(
      false,
    );
  });

  it('returns true when an active item has the same normalizedName', () => {
    expect(hasDuplicateCatalogName('milk', [catalogItem('a', 'milk')])).toBe(
      true,
    );
  });

  it('ignores soft-deleted tombstones', () => {
    expect(
      hasDuplicateCatalogName('milk', [catalogItem('a', 'milk', true)]),
    ).toBe(false);
  });

  it('excludes the item being edited', () => {
    expect(
      hasDuplicateCatalogName('milk', [catalogItem('a', 'milk')], 'a'),
    ).toBe(false);
  });

  it('flags a different active item with the same name while editing', () => {
    const items = [catalogItem('a', 'milk'), catalogItem('b', 'milk')];
    expect(hasDuplicateCatalogName('milk', items, 'a')).toBe(true);
  });
});
