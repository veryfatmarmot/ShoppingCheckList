import type { ListItem } from '@shopping-check-list/domain';

import { useAppData } from '../context/AppDataProvider';

export interface ListState {
  items: ListItem[];
  loading: boolean;
}

// Reads the shopping list from the shared AppDataProvider (subscribed once at
// app start). ListItems are hard-deleted, so no filtering is needed.
export function useList(): ListState {
  const { listItems, listLoading } = useAppData();
  return { items: listItems, loading: listLoading };
}
