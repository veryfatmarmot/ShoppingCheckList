import { groupRepository } from '@shopping-check-list/data';
import { sortGroups, type Group } from '@shopping-check-list/domain';
import { useEffect, useMemo, useState } from 'react';

import { useAuthState } from './useAuthState';

export interface GroupsState {
  groups: Group[];
  loading: boolean;
}

// Subscribes to the signed-in user's groups and returns them sorted for
// display. Live: the list updates as Firestore pushes changes.
export function useGroups(): GroupsState {
  const { user } = useAuthState();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = groupRepository.subscribe(user.userId, (next) => {
      setGroups(next);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const sorted = useMemo(() => sortGroups(groups), [groups]);

  return { groups: sorted, loading };
}
