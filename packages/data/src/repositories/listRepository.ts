import type { ListItem } from '@shopping-check-list/domain';

import type {
  RepositorySubscription,
  RepositoryUnsubscribe,
  RepositoryUserId,
} from './types';

export interface ListRepository {
  getAll(userId: RepositoryUserId): Promise<ListItem[]>;
  subscribe(
    userId: RepositoryUserId,
    onChange: RepositorySubscription<ListItem>,
  ): RepositoryUnsubscribe;
  set(userId: RepositoryUserId, item: ListItem): Promise<void>;
  delete(userId: RepositoryUserId, itemId: string): Promise<void>;
}
