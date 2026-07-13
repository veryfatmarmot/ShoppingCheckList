import { listRepository } from '@shopping-check-list/data';
import type { ListItem } from '@shopping-check-list/domain';
import { useEffect, useState } from 'react';

import { useAuthState } from './useAuthState';

export interface ListState {
  items: ListItem[];
  loading: boolean;
}

// Subscribes to the signed-in user's shopping list. ListItems are hard-deleted
// (no tombstones), so no filtering is needed. Live: updates as Firestore
// pushes changes.
export function useList(): ListState {
  const { user } = useAuthState();
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = listRepository.subscribe(user.userId, (next) => {
      setItems(next);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  return { items, loading };
}
