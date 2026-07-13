import { describe, expect, it } from 'vitest';

import type { Group } from './group';
import { nextGroupOrder } from './nextGroupOrder';

function group(order: number): Group {
  return {
    id: `id-${order}`,
    name: 'Name',
    normalizedName: 'name',
    order,
    createdAt: 0,
    updatedAt: 0,
  };
}

describe('nextGroupOrder', () => {
  it('returns 0 when there are no groups', () => {
    expect(nextGroupOrder([])).toBe(0);
  });

  it('returns one past the maximum order', () => {
    expect(nextGroupOrder([group(0), group(1), group(2)])).toBe(3);
  });

  it('ignores gaps and uses the maximum, not the count', () => {
    expect(nextGroupOrder([group(5)])).toBe(6);
  });

  it('handles negative orders', () => {
    expect(nextGroupOrder([group(-3), group(-1)])).toBe(0);
  });
});
