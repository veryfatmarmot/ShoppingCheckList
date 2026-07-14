import { describe, expect, it } from 'vitest';

import type { CatalogItem } from './catalogItem';
import { hasDuplicateCatalogName } from './hasDuplicateCatalogName';
import { normalizeName } from './normalizeName';
import { sectionItemsByGroup } from './sectionItemsByGroup';

function catalogItem(
  name: string,
  {
    deleted = false,
    updatedAt = 0,
    note = '',
  }: { deleted?: boolean; updatedAt?: number; note?: string } = {},
): CatalogItem {
  return {
    // Same id throughout: these are competing versions of ONE item.
    id: 'milk',
    createdAt: 0,
    updatedAt,
    deleted,
    itemData: {
      name,
      normalizedName: normalizeName(name),
      groupId: null,
      note,
    },
  };
}

// Mirrors the arbitration the Firestore security rules enforce: an update is
// only accepted if its updatedAt exceeds the stored one, so the write with the
// higher updatedAt wins regardless of the order the two devices sync in.
function lastWriteWins(a: CatalogItem, b: CatalogItem): CatalogItem {
  return b.updatedAt > a.updatedAt ? b : a;
}

// What the catalog view does: tombstones are filtered out before rendering.
function activeCatalog(items: CatalogItem[]): CatalogItem[] {
  return items.filter((item) => !item.deleted);
}

// Two devices act on the same catalog item while one of them is offline. The
// delete is soft (a tombstone carrying updatedAt) precisely so the race stays
// arbitrable — see sync-rules.md → Resurrection.
describe('delete vs edit conflicts', () => {
  it('keeps the item deleted when the delete is the newer write', () => {
    const edit = catalogItem('Milk', { updatedAt: 100, note: 'semi-skimmed' });
    const remove = catalogItem('Milk', { deleted: true, updatedAt: 200 });

    const winner = lastWriteWins(edit, remove);

    expect(winner.deleted).toBe(true);
    expect(activeCatalog([winner])).toEqual([]);
    expect(sectionItemsByGroup(activeCatalog([winner]), [])).toEqual([]);
  });

  it('resurrects the item when the edit is the newer write', () => {
    const remove = catalogItem('Milk', { deleted: true, updatedAt: 100 });
    const edit = catalogItem('Milk', { updatedAt: 200, note: 'semi-skimmed' });

    const winner = lastWriteWins(remove, edit);

    expect(winner.deleted).toBe(false);
    // It comes back carrying the edit's data, not the pre-delete data.
    expect(winner.itemData.note).toBe('semi-skimmed');

    const [section] = sectionItemsByGroup(activeCatalog([winner]), []);
    expect(section.items.map((item) => item.id)).toEqual(['milk']);
  });

  // This is the reason CatalogItem is soft-deleted rather than hard-deleted: a
  // tombstone still carries an updatedAt, so a late-arriving stale edit loses
  // the comparison. A hard delete would leave nothing to compare against and
  // the stale edit would silently recreate the item.
  it('does not let a stale edit that arrives late resurrect the item', () => {
    const staleEdit = catalogItem('Milk', { updatedAt: 50 });
    const remove = catalogItem('Milk', { deleted: true, updatedAt: 100 });

    // The edit syncs *after* the delete, but it is older.
    const winner = lastWriteWins(remove, staleEdit);

    expect(winner.deleted).toBe(true);
    expect(activeCatalog([winner])).toEqual([]);
  });

  it('frees the name for reuse while the item is deleted', () => {
    const tombstone = catalogItem('Milk', { deleted: true, updatedAt: 100 });

    expect(hasDuplicateCatalogName('milk', [tombstone])).toBe(false);
  });

  it('a resurrected item blocks the name again, like any active item', () => {
    const resurrected = catalogItem('Milk', { updatedAt: 200 });

    expect(hasDuplicateCatalogName('milk', [resurrected])).toBe(true);
  });
});
