import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

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
              <Text style={styles.confirmLabel}>{confirmLabel}</Text>
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
    backgroundColor: 'rgba(31, 27, 22, 0.4)',
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    padding: 24,
    borderRadius: 16,
    gap: 12,
    backgroundColor: '#fffdf8',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f1b16',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4d463d',
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
    color: '#6b6153',
  },
  confirm: {
    backgroundColor: '#8a5a14',
  },
  confirmDestructive: {
    backgroundColor: '#a4262c',
  },
  confirmLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fffdf8',
  },
});
