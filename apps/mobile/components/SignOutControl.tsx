import { signOutUser } from '@shopping-check-list/data';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

// Shared-header sign-out (M1-T6): a header button that opens a confirmation
// dialog, then signs out. The root layout's auth guard handles the redirect
// back to the login screen once the user becomes null. A react-native Modal
// is used (not Alert.alert) so the confirmation works identically on web.
export function SignOutControl() {
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        style={styles.headerButton}
        onPress={() => setConfirming(true)}
      >
        <Text style={styles.headerButtonLabel}>Sign out</Text>
      </Pressable>

      <Modal
        visible={confirming}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirming(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Sign out?</Text>
            <Text style={styles.dialogBody}>
              You&apos;ll need to sign in again to use the app.
            </Text>
            <View style={styles.dialogButtons}>
              <Pressable
                style={styles.dialogButton}
                onPress={() => setConfirming(false)}
              >
                <Text style={styles.dialogCancelLabel}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.dialogButton, styles.dialogConfirm]}
                onPress={() => {
                  setConfirming(false);
                  void signOutUser();
                }}
              >
                <Text style={styles.dialogConfirmLabel}>Sign out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginRight: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  headerButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent,
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.backdrop,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    padding: 24,
    borderRadius: 16,
    gap: 12,
    backgroundColor: colors.surface,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dialogBody: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  dialogButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  dialogCancelLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
  },
  dialogConfirm: {
    backgroundColor: colors.danger,
  },
  dialogConfirmLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onDanger,
  },
});
