import {
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import { Platform } from 'react-native';

import { firebaseApp } from './firebaseApp';

function createFirestore(): Firestore {
  try {
    if (Platform.OS === 'web') {
      // Browsers have IndexedDB, so enable disk-backed persistence: offline
      // reads and queued writes survive reloads, and it works across tabs.
      return initializeFirestore(firebaseApp, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    }

    // React Native has no IndexedDB, so the JS SDK can only cache in memory:
    // offline writes survive while the JS process is alive but not across
    // backgrounding/restart. This is the documented MVP limitation — see
    // sync-rules.md "Known MVP Limitation — Mobile Offline Persistence".
    return initializeFirestore(firebaseApp, {
      localCache: memoryLocalCache(),
    });
  } catch {
    // Fast Refresh re-runs this module; initializeFirestore throws if the
    // instance already exists for this app.
    return getFirestore(firebaseApp);
  }
}

export const firestoreDb = createFirestore();
