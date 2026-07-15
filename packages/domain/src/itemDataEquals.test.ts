import { describe, expect, it } from 'vitest';

import type { ItemData } from './itemData';
import { itemDataEquals } from './itemDataEquals';

const base: ItemData = {
  name: 'Milk',
  normalizedName: 'milk',
  groupId: 'dairy',
  note: '2%',
};

describe('itemDataEquals', () => {
  it('is true for identical item data', () => {
    expect(itemDataEquals(base, { ...base })).toBe(true);
  });

  it('is false when the name differs', () => {
    expect(itemDataEquals(base, { ...base, name: 'Milk ' })).toBe(false);
  });

  it('is false when the normalizedName differs', () => {
    expect(itemDataEquals(base, { ...base, normalizedName: 'milks' })).toBe(
      false,
    );
  });

  it('is false when the groupId differs (including null)', () => {
    expect(itemDataEquals(base, { ...base, groupId: null })).toBe(false);
  });

  it('is false when the note differs', () => {
    expect(itemDataEquals(base, { ...base, note: 'whole' })).toBe(false);
  });
});
