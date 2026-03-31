import type { CatalogItem } from '@shopping-check-list/domain';

import type {
  RepositorySubscription,
  RepositoryUnsubscribe,
  RepositoryUserId,
} from './types';

export interface CatalogRepository {
  getAll(userId: RepositoryUserId): Promise<CatalogItem[]>;
  subscribe(
    userId: RepositoryUserId,
    onChange: RepositorySubscription<CatalogItem>,
  ): RepositoryUnsubscribe;
  set(userId: RepositoryUserId, item: CatalogItem): Promise<void>;
  delete(userId: RepositoryUserId, itemId: string): Promise<void>;
}
