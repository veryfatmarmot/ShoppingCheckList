import type { Group } from './group';

// The `order` for a newly created group: one past the current maximum, or 0
// when there are no groups yet. (Domain rule from domain-model.md → Group →
// Create.)
export function nextGroupOrder(groups: Group[]): number {
  if (groups.length === 0) {
    return 0;
  }
  return Math.max(...groups.map((group) => group.order)) + 1;
}
