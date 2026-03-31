import { getApp, getApps, initializeApp } from 'firebase/app';

import { getFirebaseOptions } from './firebaseConfig';

export const firebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(getFirebaseOptions());
