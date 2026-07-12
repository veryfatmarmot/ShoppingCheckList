import type { CatalogItem } from '@shopping-check-list/domain';

import type {
  RepositorySubscription,
  RepositoryUnsubscribe,
  RepositoryUserId,
} from './types';

// No delete method: CatalogItem is soft-deleted only (deleted = true written
// via set), and Firestore security rules reject hard deletes on catalogItems.
export interface CatalogRepository {
  getAll(userId: RepositoryUserId): Promise<CatalogItem[]>;
  subscribe(
    userId: RepositoryUserId,
    onChange: RepositorySubscription<CatalogItem>,
  ): RepositoryUnsubscribe;
  set(userId: RepositoryUserId, item: CatalogItem): Promise<void>;
}
