import type { ItemData } from '@shopping-check-list/domain';
import type { DocumentData } from 'firebase/firestore';

// Reads the nested `itemData` map from a Firestore document into the domain
// ItemData shape. Shared by the catalog and list repositories (both embed
// ItemData). On write, itemData is stored as-is, so only the read side needs
// mapping.
export function itemDataFromRaw(raw: DocumentData): ItemData {
  return {
    name: raw.name as string,
    normalizedName: raw.normalizedName as string,
    groupId: (raw.groupId ?? null) as string | null,
    note: raw.note as string,
  };
}
