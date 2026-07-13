import { signOutUser } from '@shopping-check-list/data';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuthState } from '../../hooks/useAuthState';

export default function ShoppingScreen() {
  const { user } = useAuthState();

  return (
    <View style={styles.screen}>
      <Text style={styles.note}>Shopping list arrives in M4.</Text>

      {/* Temporary: exercises the auth-guard sign-out path. M1-T6 replaces
          this with a sign-out action in the shared header (with a
          confirmation dialog). */}
      <Text style={styles.meta}>Signed in as {user?.email ?? '—'}</Text>
      <Pressable style={styles.button} onPress={() => void signOutUser()}>
        <Text style={styles.buttonLabel}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    backgroundColor: '#f4efe6',
  },
  note: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4d463d',
    textAlign: 'center',
  },
  meta: {
    fontSize: 14,
    color: '#6b6153',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#6b6153',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fffdf8',
  },
});
