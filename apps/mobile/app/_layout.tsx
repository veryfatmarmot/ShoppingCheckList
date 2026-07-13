import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuthState } from '../hooks/useAuthState';

// M1-T4 auth guard. Stack.Protected makes a route group available only when
// its guard is true; expo-router redirects away from any route the current
// guard has made unavailable. So:
//   - signed out: only `index` (login) is reachable; `/shopping` etc. redirect
//     back to `/`.
//   - signed in: `index` becomes unavailable, so `/` redirects into the tabs.
// The `initializing` spinner is a placeholder; M1-T5 replaces it with a proper
// loading screen.
export default function RootLayout() {
  const { user, initializing } = useAuthState();

  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={user !== null}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={user === null}>
        <Stack.Screen name="index" />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4efe6',
  },
});
