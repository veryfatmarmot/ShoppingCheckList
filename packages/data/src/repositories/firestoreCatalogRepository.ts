import type { CatalogItem } from '@shopping-check-list/domain';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  type CollectionReference,
  type FirestoreDataConverter,
} from 'firebase/firestore';

import { firestoreDb } from '../firestore';

import type { CatalogRepository } from './catalogRepository';
import { itemDataFromRaw } from './itemDataMapper';
import { withLwwConflictHandling } from './writeConflict';
import type {
  RepositorySubscription,
  RepositoryUnsubscribe,
  RepositoryUserId,
} from './types';

// Typed mapper between the CatalogItem domain entity and its Firestore
// document (including the nested itemData map). The document ID is the source
// of truth for `id`.
const catalogItemConverter: FirestoreDataConverter<CatalogItem> = {
  toFirestore(item) {
    // itemData already matches the stored map shape exactly (name,
    // normalizedName, groupId, note), so it is written as-is.
    return {
      id: item.id,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      deleted: item.deleted,
      itemData: item.itemData,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      createdAt: data.createdAt as number,
      updatedAt: data.updatedAt as number,
      deleted: data.deleted as boolean,
      itemData: itemDataFromRaw(data.itemData),
    };
  },
};

function catalogCollection(
  userId: RepositoryUserId,
): CollectionReference<CatalogItem> {
  return collection(firestoreDb, 'users', userId, 'catalogItems').withConverter(
    catalogItemConverter,
  );
}

// Firestore-backed CatalogRepository. A thin storage adapter: whole-document
// reads/writes only. It returns every item, including soft-deleted tombstones
// (`deleted: true`) — the `deleted == false` filter for display, plus
// duplicate/resurrection logic, is applied by consumers. There is no delete:
// removal is a soft delete via `set` with `deleted: true`.
export class FirestoreCatalogRepository implements CatalogRepository {
  async getAll(userId: RepositoryUserId): Promise<CatalogItem[]> {
    const snapshot = await getDocs(catalogCollection(userId));
    return snapshot.docs.map((document) => document.data());
  }

  subscribe(
    userId: RepositoryUserId,
    onChange: RepositorySubscription<CatalogItem>,
  ): RepositoryUnsubscribe {
    return onSnapshot(catalogCollection(userId), (snapshot) => {
      onChange(snapshot.docs.map((document) => document.data()));
    });
  }

  async set(userId: RepositoryUserId, item: CatalogItem): Promise<void> {
    await withLwwConflictHandling(
      setDoc(doc(catalogCollection(userId), item.id), item),
    );
  }
}

export const catalogRepository: CatalogRepository =
  new FirestoreCatalogRepository();
