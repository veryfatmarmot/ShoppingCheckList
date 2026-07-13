import {
  signInWithGoogleIdToken,
  signOutUser,
} from '@shopping-check-list/data';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Closes the OAuth popup and delivers the result back to this page on web.
WebBrowser.maybeCompleteAuthSession();

export interface GoogleSignInState {
  error: string | null;
  inProgress: boolean;
  canSignIn: boolean;
  signIn: () => void;
  signOut: () => Promise<void>;
}

// Triggers the Google OAuth flow and exchanges the result for a Firebase
// session. Does not track the signed-in user itself — useAuthState's
// onAuthStateChanged subscription is the single source of truth for that,
// and it observes the sign-in performed here automatically.
export function useGoogleSignIn(): GoogleSignInState {
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

  return {
    error,
    inProgress: exchanging,
    canSignIn: request !== null && !exchanging,
    signIn,
    signOut: signOutUser,
  };
}
