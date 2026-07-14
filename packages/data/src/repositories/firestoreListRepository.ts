import type { ListItem } from '@shopping-check-list/domain';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  type CollectionReference,
  type FirestoreDataConverter,
} from 'firebase/firestore';

import { firestoreDb } from '../firestore';

import { itemDataFromRaw } from './itemDataMapper';
import type { ListRepository } from './listRepository';
import { withLwwConflictHandling } from './writeConflict';
import type {
  RepositorySubscription,
  RepositoryUnsubscribe,
  RepositoryUserId,
} from './types';

// Typed mapper between the ListItem domain entity and its Firestore document
// (including the nested itemData snapshot). The document ID is the source of
// truth for `id`.
const listItemConverter: FirestoreDataConverter<ListItem> = {
  toFirestore(item) {
    return {
      id: item.id,
      catalogItemId: item.catalogItemId,
      quantity: item.quantity,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      itemData: item.itemData,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      catalogItemId: (data.catalogItemId ?? null) as string | null,
      quantity: data.quantity as number,
      createdAt: data.createdAt as number,
      updatedAt: data.updatedAt as number,
      itemData: itemDataFromRaw(data.itemData),
    };
  },
};

function listCollection(
  userId: RepositoryUserId,
): CollectionReference<ListItem> {
  return collection(firestoreDb, 'users', userId, 'listItems').withConverter(
    listItemConverter,
  );
}

// Firestore-backed ListRepository. A thin storage adapter: whole-document
// reads/writes only. Unlike the catalog, ListItems are hard-deleted (a bought
// item is removed), so `delete` removes the document.
export class FirestoreListRepository implements ListRepository {
  async getAll(userId: RepositoryUserId): Promise<ListItem[]> {
    const snapshot = await getDocs(listCollection(userId));
    return snapshot.docs.map((document) => document.data());
  }

  subscribe(
    userId: RepositoryUserId,
    onChange: RepositorySubscription<ListItem>,
  ): RepositoryUnsubscribe {
    return onSnapshot(listCollection(userId), (snapshot) => {
      onChange(snapshot.docs.map((document) => document.data()));
    });
  }

  async set(userId: RepositoryUserId, item: ListItem): Promise<void> {
    await withLwwConflictHandling(
      setDoc(doc(listCollection(userId), item.id), item),
    );
  }

  async delete(userId: RepositoryUserId, itemId: string): Promise<void> {
    await deleteDoc(doc(listCollection(userId), itemId));
  }
}

export const listRepository: ListRepository = new FirestoreListRepository();
