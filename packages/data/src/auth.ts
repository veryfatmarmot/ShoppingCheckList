import {
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
  signOut,
} from 'firebase/auth';

import { firebaseApp } from './firebaseApp';

export const firebaseAuth = getAuth(firebaseApp);

export interface AuthUser {
  userId: string;
  displayName: string | null;
  email: string | null;
}

export async function signInWithGoogleIdToken(
  idToken: string,
): Promise<AuthUser> {
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(firebaseAuth, credential);

  return {
    userId: result.user.uid,
    displayName: result.user.displayName,
    email: result.user.email,
  };
}

export async function signOutUser(): Promise<void> {
  await signOut(firebaseAuth);
}
