import type { Group } from '@shopping-check-list/domain';

import type {
  RepositorySubscription,
  RepositoryUnsubscribe,
  RepositoryUserId,
} from './types';

export interface GroupRepository {
  getAll(userId: RepositoryUserId): Promise<Group[]>;
  subscribe(
    userId: RepositoryUserId,
    onChange: RepositorySubscription<Group>,
  ): RepositoryUnsubscribe;
  set(userId: RepositoryUserId, group: Group): Promise<void>;
  delete(userId: RepositoryUserId, groupId: string): Promise<void>;
}
