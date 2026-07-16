import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

// Temporary body for the tab screens created in M1-T3. Each tab's real
// content arrives in later milestones (Groups M2, Catalog M3, Shopping M4).
export function ScreenPlaceholder({ note }: { note: string }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.note}>{note}</Text>
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
  note: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
