import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useGoogleSignIn } from '../hooks/useGoogleSignIn';

// Temporary home screen for M1-T1: exercises Google sign-in end to end.
// M1-T3 (app shell) and M1-T4 (auth guard) will replace this with the real
// login screen + tab navigation.
export default function HomeScreen() {
  const { user, error, inProgress, canSignIn, signIn, signOut } =
    useGoogleSignIn();

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Shopping Check List</Text>
        {user ? (
          <>
            <Text style={styles.title}>Signed in</Text>
            <Text style={styles.body}>
              {user.displayName ?? 'No name'} ({user.email ?? 'no email'})
            </Text>
            <Text style={styles.body}>userId: {user.userId}</Text>
            <Pressable style={styles.button} onPress={() => void signOut()}>
              <Text style={styles.buttonLabel}>Sign out</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.title}>Sign in</Text>
            {inProgress ? (
              <ActivityIndicator />
            ) : (
              <Pressable
                style={[styles.button, !canSignIn && styles.buttonDisabled]}
                disabled={!canSignIn}
                onPress={signIn}
              >
                <Text style={styles.buttonLabel}>Continue with Google</Text>
              </Pressable>
            )}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        )}
      </View>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f4efe6',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#d8cdbb',
    gap: 12,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#8a5a14',
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: '#1f1b16',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4d463d',
  },
  button: {
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#8a5a14',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fffdf8',
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
    color: '#a4262c',
  },
});
