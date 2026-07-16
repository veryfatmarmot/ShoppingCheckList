import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme';

// Shown at the top of the app while offline. Owns the top safe-area inset (the
// tab header sits flush below it via headerStatusBarHeight: 0 when offline).
export function OfflineBanner() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.banner, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.text}>Offline — changes sync when you reconnect</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Neutral, not coral: being offline is a status, not a destructive event or
  // an error the user caused.
  banner: {
    backgroundColor: colors.surfaceRaised,
    paddingBottom: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
});
