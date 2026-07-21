import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useGoogleSignIn } from '../hooks/useGoogleSignIn';
import { colors } from '../theme';

// Login screen. The root layout's auth guard only routes here while signed
// out; once sign-in succeeds, onAuthStateChanged flips the guard and the user
// is redirected into the tabs, so this screen has no signed-in state.
export default function LoginScreen() {
  const { error, inProgress, canSignIn, signIn } = useGoogleSignIn();

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Refillio</Text>
        <Text style={styles.title}>Sign in</Text>
        {inProgress ? (
          <ActivityIndicator color={colors.accent} />
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.accent,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  // The one solid accent fill in the app: this is the single action on the
  // screen, so it should carry full weight.
  button: {
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.accent,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onAccent,
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.danger,
  },
});
