import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

// Transient bottom bar with a single action (e.g. "Bought — Undo").
export function Snackbar({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <View style={styles.snackbar}>
      <Text style={styles.message} numberOfLines={1}>
        {message}
      </Text>
      <Pressable onPress={onAction} hitSlop={8}>
        <Text style={styles.action}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  snackbar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    // Raised above the dark screen rather than darker than it — on a dark theme
    // a near-black snackbar would sink into the background instead of standing
    // out as a transient notice.
    backgroundColor: colors.surfaceRaised,
  },
  message: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
  },
  action: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
