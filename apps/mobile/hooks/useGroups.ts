import { sortGroups, type Group } from '@shopping-check-list/domain';
import { useMemo } from 'react';

import { useAppData } from '../context/AppDataProvider';

export interface GroupsState {
  groups: Group[];
  loading: boolean;
}

// Reads groups from the shared AppDataProvider (subscribed once at app start)
// and returns them sorted for display.
export function useGroups(): GroupsState {
  const { groups, groupsLoading } = useAppData();
  const sorted = useMemo(() => sortGroups(groups), [groups]);
  return { groups: sorted, loading: groupsLoading };
}
