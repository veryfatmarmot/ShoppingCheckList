import { FirebaseError } from 'firebase/app';

// Runs a Firestore write and absorbs a lost last-write-wins race. Our security
// rules reject an update whose `updatedAt` does not exceed the stored value,
// which surfaces as a `permission-denied` error. Because the client only ever
// writes domain-validated documents, that code here means "a newer version
// already won" — the live subscription delivers the winning document, so we
// log and resolve instead of throwing. Any other error propagates.
export async function withLwwConflictHandling(
  write: Promise<void>,
): Promise<void> {
  try {
    await write;
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'permission-denied') {
      console.warn(
        '[data] write rejected by last-write-wins rule; newer version kept',
      );
      return;
    }
    throw error;
  }
}
