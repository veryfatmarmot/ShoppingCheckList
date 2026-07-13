import 'react-native-gesture-handler';

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { LoadingScreen } from '../components/LoadingScreen';
import { useAuthState } from '../hooks/useAuthState';

// M1-T4 auth guard. Stack.Protected makes a route group available only when
// its guard is true; expo-router redirects away from any route the current
// guard has made unavailable. So:
//   - signed out: only `index` (login) is reachable; `/shopping` etc. redirect
//     back to `/`.
//   - signed in: `index` becomes unavailable, so `/` redirects into the tabs.
// While auth is still initializing, the loading screen (M1-T5) is shown first.
//
// GestureHandlerRootView wraps everything so react-native-gesture-handler (used
// by the draggable groups list, M2-T4) has its required root on every screen.
export default function RootLayout() {
  const { user, initializing } = useAuthState();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {initializing ? (
        <LoadingScreen />
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={user !== null}>
            <Stack.Screen name="(tabs)" />
          </Stack.Protected>
          <Stack.Protected guard={user === null}>
            <Stack.Screen name="index" />
          </Stack.Protected>
        </Stack>
      )}
    </GestureHandlerRootView>
  );
}
