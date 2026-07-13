import { catalogRepository } from '@shopping-check-list/data';
import type { CatalogItem } from '@shopping-check-list/domain';
import { useEffect, useMemo, useState } from 'react';

import { useAuthState } from './useAuthState';

export interface CatalogState {
  // Active (non-deleted) catalog items.
  items: CatalogItem[];
  loading: boolean;
}

// Subscribes to the signed-in user's catalog and exposes the active items.
// The repository returns soft-deleted tombstones too; they are filtered out
// here for display. Live: updates as Firestore pushes changes.
export function useCatalog(): CatalogState {
  const { user } = useAuthState();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = catalogRepository.subscribe(user.userId, (next) => {
      setItems(next);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const active = useMemo(() => items.filter((item) => !item.deleted), [items]);

  return { items: active, loading };
}
