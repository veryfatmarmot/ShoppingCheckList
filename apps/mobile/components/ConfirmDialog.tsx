import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Reusable confirm/cancel dialog (ux-flows: "Modal: Delete Confirmation").
// Uses a react-native Modal so it behaves identically on web and native.
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttons}>
            <Pressable style={styles.button} onPress={onCancel}>
              <Text style={styles.cancelLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                destructive ? styles.confirmDestructive : styles.confirm,
              ]}
              onPress={onConfirm}
            >
              <Text
                style={[
                  styles.confirmLabel,
                  destructive && styles.confirmLabelDestructive,
                ]}
              >
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  cancelLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
  },
  confirm: {
    backgroundColor: colors.accent,
  },
  confirmDestructive: {
    backgroundColor: colors.danger,
  },
  confirmLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onAccent,
  },
  confirmLabelDestructive: {
    color: colors.onDanger,
  },
});
