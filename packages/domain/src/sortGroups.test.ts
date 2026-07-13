import { describe, expect, it } from 'vitest';

import type { Group } from './group';
import { sortGroups } from './sortGroups';

function group(partial: Partial<Group>): Group {
  return {
    id: 'id',
    name: 'Name',
    normalizedName: 'name',
    order: 0,
    createdAt: 0,
    updatedAt: 0,
    ...partial,
  };
}

describe('sortGroups', () => {
  it('sorts by order ascending', () => {
    const result = sortGroups([
      group({ id: 'b', order: 2 }),
      group({ id: 'a', order: 1 }),
      group({ id: 'c', order: 3 }),
    ]);

    expect(result.map((g) => g.id)).toEqual(['a', 'b', 'c']);
  });

  it('breaks ties by normalizedName', () => {
    const result = sortGroups([
      group({ id: 'z', order: 1, normalizedName: 'zucchini' }),
      group({ id: 'a', order: 1, normalizedName: 'apple' }),
    ]);

    expect(result.map((g) => g.id)).toEqual(['a', 'z']);
  });

  it('does not mutate the input array', () => {
    const input = [group({ id: 'b', order: 2 }), group({ id: 'a', order: 1 })];

    sortGroups(input);

    expect(input.map((g) => g.id)).toEqual(['b', 'a']);
  });

  it('returns an empty array unchanged', () => {
    expect(sortGroups([])).toEqual([]);
  });
});
