import {
  signInWithGoogleIdToken,
  signOutUser,
  type AuthUser,
} from '@shopping-check-list/data';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Closes the OAuth popup and delivers the result back to this page on web.
WebBrowser.maybeCompleteAuthSession();

export interface GoogleSignInState {
  user: AuthUser | null;
  error: string | null;
  inProgress: boolean;
  canSignIn: boolean;
  signIn: () => void;
  signOut: () => Promise<void>;
}

export function useGoogleSignIn(): GoogleSignInState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exchanging, setExchanging] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    // expo-auth-session's automatic redirect detection produces an exp:// URL
    // in the dev client, which Google rejects (invalid_request). Google's
    // Android OAuth clients only accept the AppAuth form: the app's package
    // name as scheme (registered in app.json + AndroidManifest), single slash.
    ...(Platform.OS === 'web'
      ? {}
      : { redirectUri: 'dev.marmot.shoppingchecklist:/oauthredirect' }),
  });

  useEffect(() => {
    if (!response) {
      return;
    }

    if (response.type === 'success') {
      const idToken = response.params.id_token;
      if (!idToken) {
        setError('Google response did not include an ID token');
        return;
      }

      setExchanging(true);
      setError(null);
      signInWithGoogleIdToken(idToken)
        .then(setUser)
        .catch((cause: unknown) => {
          setError(
            cause instanceof Error ? cause.message : 'Firebase sign-in failed',
          );
        })
        .finally(() => setExchanging(false));
      return;
    }

    if (response.type === 'error') {
      setError(response.error?.message ?? 'Google sign-in failed');
    }
  }, [response]);

  const signIn = useCallback(() => {
    setError(null);
    void promptAsync();
  }, [promptAsync]);

  const signOut = useCallback(async () => {
    await signOutUser();
    setUser(null);
  }, []);

  return {
    user,
    error,
    inProgress: exchanging,
    canSignIn: request !== null && !exchanging,
    signIn,
    signOut,
  };
}
