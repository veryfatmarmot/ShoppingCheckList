import { subscribeToAuthUser, type AuthUser } from '@shopping-check-list/data';
import { useEffect, useState } from 'react';

export interface AuthState {
  user: AuthUser | null;
  // True until the first auth-state callback fires, i.e. while Firebase is
  // still restoring (or failing to restore) a persisted session.
  initializing: boolean;
}

export function useAuthState(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    return subscribeToAuthUser((nextUser) => {
      setUser(nextUser);
      setInitializing(false);
    });
  }, []);

  return { user, initializing };
}
