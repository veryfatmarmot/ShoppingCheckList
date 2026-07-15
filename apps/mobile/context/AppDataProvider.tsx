import {
  catalogRepository,
  groupRepository,
  listRepository,
} from '@shopping-check-list/data';
import type { CatalogItem, Group, ListItem } from '@shopping-check-list/domain';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useAuthState } from '../hooks/useAuthState';

// Raw subscription data for all three collections. Transforms (sorting groups,
// filtering catalog tombstones) stay in the per-entity hooks that read this.
interface AppData {
  groups: Group[];
  groupsLoading: boolean;
  catalogItems: CatalogItem[];
  catalogLoading: boolean;
  listItems: ListItem[];
  listLoading: boolean;
}

const AppDataContext = createContext<AppData | null>(null);

// M6-T5: subscribes to the signed-in user's groups, catalog and list ONCE, from
// app start (this provider is mounted at the signed-in root). Every tab then
// has data without waiting to be opened, and on offline→online the always-live
// listeners auto-resync all three. Replaces the previous per-screen listeners
// (which duplicated the groups and list subscriptions across screens).
//
// Note (memory-only cache, P1-T1 deferred): this only helps while the app
// process is alive. A cold start with no network is still empty — see
// sync-rules.md → Known MVP Limitation.
export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthState();
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setGroups([]);
      setGroupsLoading(false);
      setCatalogItems([]);
      setCatalogLoading(false);
      setListItems([]);
      setListLoading(false);
      return;
    }

    setGroupsLoading(true);
    setCatalogLoading(true);
    setListLoading(true);

    const unsubGroups = groupRepository.subscribe(user.userId, (next) => {
      setGroups(next);
      setGroupsLoading(false);
    });
    const unsubCatalog = catalogRepository.subscribe(user.userId, (next) => {
      setCatalogItems(next);
      setCatalogLoading(false);
    });
    const unsubList = listRepository.subscribe(user.userId, (next) => {
      setListItems(next);
      setListLoading(false);
    });

    return () => {
      unsubGroups();
      unsubCatalog();
      unsubList();
    };
  }, [user]);

  const value = useMemo<AppData>(
    () => ({
      groups,
      groupsLoading,
      catalogItems,
      catalogLoading,
      listItems,
      listLoading,
    }),
    [
      groups,
      groupsLoading,
      catalogItems,
      catalogLoading,
      listItems,
      listLoading,
    ],
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData(): AppData {
  const context = useContext(AppDataContext);
  if (context === null) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
