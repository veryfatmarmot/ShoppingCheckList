import { validateQuantity } from '@shopping-check-list/domain';
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '../theme';

interface QuantityModalProps {
  visible: boolean;
  // Name of the item the quantity applies to (shown for context).
  itemName: string;
  initialQuantity: number;
  confirmLabel: string;
  onCancel: () => void;
  onSubmit: (quantity: number) => void;
}

// Controlled quantity input with domain validation (quantity > 0, decimals
// allowed). Used when adding a catalog item to the shopping list.
export function QuantityModal({
  visible,
  itemName,
  initialQuantity,
  confirmLabel,
  onCancel,
  onSubmit,
}: QuantityModalProps) {
  const [text, setText] = useState(String(initialQuantity));

  useEffect(() => {
    if (visible) {
      setText(String(initialQuantity));
    }
  }, [visible, initialQuantity]);

  const quantity = Number(text);
  const valid =
    text.trim() !== '' &&
    Number.isFinite(quantity) &&
    validateQuantity(quantity) === null;

  function submit() {
    if (valid) {
      onSubmit(quantity);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{itemName}</Text>
          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            keyboardType="numeric"
            placeholder="1"
            placeholderTextColor={colors.textFaint}
            autoFocus
            selectTextOnFocus
            returnKeyType="done"
            onSubmitEditing={submit}
          />
          <View style={styles.buttons}>
            <Pressable style={styles.button} onPress={onCancel}>
              <Text style={styles.cancelLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.confirm, !valid && styles.disabled]}
              disabled={!valid}
              onPress={submit}
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
    backgroundColor: colors.backdrop,
  },
  dialog: {
    width: '100%',
    maxWidth: 320,
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
  label: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.accent,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceSunken,
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
  disabled: {
    opacity: 0.5,
  },
  confirmLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onAccent,
  },
});
