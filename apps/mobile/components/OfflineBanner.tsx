import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  banner: {
    backgroundColor: '#6b6153',
    paddingBottom: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: '#fffdf8',
    fontSize: 13,
    fontWeight: '600',
  },
});
