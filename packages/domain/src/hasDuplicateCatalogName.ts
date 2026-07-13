import type { CatalogItem } from './catalogItem';

// Best-effort duplicate detection for the catalog: is there another active
// (non-deleted) item with the same normalizedName? `excludeId` skips the item
// currently being edited so renaming-in-place isn't flagged against itself.
// Duplicates can still slip in via offline conflicts — this only blocks the
// obvious case in the UI (domain-model.md → Duplicate handling).
export function hasDuplicateCatalogName(
  normalizedName: string,
  items: CatalogItem[],
  excludeId?: string,
): boolean {
  return items.some(
    (item) =>
      !item.deleted &&
      item.id !== excludeId &&
      item.itemData.normalizedName === normalizedName,
  );
}
