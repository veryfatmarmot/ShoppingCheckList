import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoogleAuthProvider,
  getAuth,
  initializeAuth,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
  // @ts-expect-error -- firebase/auth's default (browser) type entry doesn't
  // declare the React Native persistence helper, but the function exists at
  // runtime: @firebase/auth's package.json "react-native" field points Metro
  // at a different build that exports it.
  getReactNativePersistence,
  type Auth,
  type User,
} from 'firebase/auth';
import { Platform } from 'react-native';

import { firebaseApp } from './firebaseApp';

export interface AuthUser {
  userId: string;
  displayName: string | null;
  email: string | null;
}

function toAuthUser(user: User): AuthUser {
  return {
    userId: user.uid,
    displayName: user.displayName,
    email: user.email,
  };
}

function createFirebaseAuth(): Auth {
  if (Platform.OS === 'web') {
    // Web persists sign-in via IndexedDB automatically.
    return getAuth(firebaseApp);
  }

  try {
    // React Native has no window/IndexedDB; without an explicit persistence,
    // the JS SDK keeps auth state in memory only, so every app restart would
    // force sign-in again.
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Fast Refresh re-runs this module without recreating firebaseApp;
    // initializeAuth throws if called twice for the same app instance.
    return getAuth(firebaseApp);
  }
}

export const firebaseAuth = createFirebaseAuth();

/**
 * Notifies `onChange` with the signed-in user (or null) whenever auth state
 * changes, including once synchronously-soon-after-call with the restored
 * session, if any. Returns an unsubscribe function.
 */
export function subscribeToAuthUser(
  onChange: (user: AuthUser | null) => void,
): () => void {
  return onAuthStateChanged(firebaseAuth, (user) => {
    onChange(user ? toAuthUser(user) : null);
  });
}

export async function signInWithGoogleIdToken(
  idToken: string,
): Promise<AuthUser> {
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(firebaseAuth, credential);
  return toAuthUser(result.user);
}

export async function signOutUser(): Promise<void> {
  await signOut(firebaseAuth);
}
