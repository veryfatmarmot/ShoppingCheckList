import type { CatalogItem } from '@shopping-check-list/domain';
import { useMemo } from 'react';

import { useAppData } from '../context/AppDataProvider';

export interface CatalogState {
  // Active (non-deleted) catalog items.
  items: CatalogItem[];
  loading: boolean;
}

// Reads the catalog from the shared AppDataProvider (subscribed once at app
// start). The provider holds soft-deleted tombstones too; they are filtered
// out here for display.
export function useCatalog(): CatalogState {
  const { catalogItems, catalogLoading } = useAppData();
  const active = useMemo(
    () => catalogItems.filter((item) => !item.deleted),
    [catalogItems],
  );
  return { items: active, loading: catalogLoading };
}
