import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

// Shown during app bootstrap while Firebase restores (or fails to restore) a
// persisted session. Rendered by the root layout before the auth guard
// decides between the login screen and the tabs.
export function LoadingScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>Refillio</Text>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    backgroundColor: colors.background,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.accent,
  },
});
