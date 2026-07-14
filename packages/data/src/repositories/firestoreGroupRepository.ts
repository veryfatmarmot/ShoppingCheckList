import type { Group } from '@shopping-check-list/domain';
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

import type { GroupRepository } from './groupRepository';
import type {
  RepositorySubscription,
  RepositoryUnsubscribe,
  RepositoryUserId,
} from './types';
import { withLwwConflictHandling } from './writeConflict';

// Typed mapper between the Group domain entity and its Firestore document.
// The document ID is the source of truth for `id` (schema guarantees they are
// equal on write), so `fromFirestore` reads it from the snapshot.
const groupConverter: FirestoreDataConverter<Group> = {
  toFirestore(group) {
    return {
      id: group.id,
      name: group.name,
      normalizedName: group.normalizedName,
      order: group.order,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data.name as string,
      normalizedName: data.normalizedName as string,
      order: data.order as number,
      createdAt: data.createdAt as number,
      updatedAt: data.updatedAt as number,
    };
  },
};

function groupsCollection(
  userId: RepositoryUserId,
): CollectionReference<Group> {
  return collection(firestoreDb, 'users', userId, 'groups').withConverter(
    groupConverter,
  );
}

// Firestore-backed GroupRepository. A thin storage adapter: it maps and
// reads/writes whole documents only (per the full-overwrite write model) and
// does not sort or validate — sorting is client-side and validation lives in
// the domain layer. `delete` removes only the group document; clearing
// references on catalog/list items (M4-T9) is orchestrated a layer up.
export class FirestoreGroupRepository implements GroupRepository {
  async getAll(userId: RepositoryUserId): Promise<Group[]> {
    const snapshot = await getDocs(groupsCollection(userId));
    return snapshot.docs.map((document) => document.data());
  }

  subscribe(
    userId: RepositoryUserId,
    onChange: RepositorySubscription<Group>,
  ): RepositoryUnsubscribe {
    return onSnapshot(groupsCollection(userId), (snapshot) => {
      onChange(snapshot.docs.map((document) => document.data()));
    });
  }

  async set(userId: RepositoryUserId, group: Group): Promise<void> {
    await withLwwConflictHandling(
      setDoc(doc(groupsCollection(userId), group.id), group),
    );
  }

  async delete(userId: RepositoryUserId, groupId: string): Promise<void> {
    await deleteDoc(doc(groupsCollection(userId), groupId));
  }
}

export const groupRepository: GroupRepository = new FirestoreGroupRepository();
