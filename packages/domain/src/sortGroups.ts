import type { Group } from './group';

// Display order for groups: ascending `order`, with normalizedName as a
// deterministic tiebreaker when orders collide (which can happen after
// offline edits). Returns a new array; does not mutate the input.
export function sortGroups(groups: Group[]): Group[] {
  return [...groups].sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    return a.normalizedName.localeCompare(b.normalizedName);
  });
}
