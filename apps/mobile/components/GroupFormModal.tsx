import { validateName } from '@shopping-check-list/domain';
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

interface GroupFormModalProps {
  visible: boolean;
  title: string;
  initialName: string;
  onCancel: () => void;
  onSubmit: (name: string) => void;
  // When provided (edit mode), a Delete button is shown.
  onDelete?: () => void;
}

// Controlled add/edit form for a group. Validation comes from the domain
// layer (validateName); the parent owns persistence and passes the trimmed
// name back through onSubmit.
export function GroupFormModal({
  visible,
  title,
  initialName,
  onCancel,
  onSubmit,
  onDelete,
}: GroupFormModalProps) {
  const [name, setName] = useState(initialName);

  // Reset the field to the target value each time the modal opens.
  useEffect(() => {
    if (visible) {
      setName(initialName);
    }
  }, [visible, initialName]);

  const error = validateName(name);

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
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Group name"
            placeholderTextColor={colors.textFaint}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => {
              if (!error) {
                onSubmit(name.trim());
              }
            }}
          />
          <View style={styles.buttons}>
            {onDelete ? (
              <Pressable style={styles.button} onPress={onDelete}>
                <Text style={styles.deleteLabel}>Delete</Text>
              </Pressable>
            ) : (
              <View />
            )}
            <View style={styles.buttonsRight}>
              <Pressable style={styles.button} onPress={onCancel}>
                <Text style={styles.cancelLabel}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.button,
                  styles.save,
                  error !== null && styles.saveDisabled,
                ]}
                disabled={error !== null}
                onPress={() => onSubmit(name.trim())}
              >
                <Text style={styles.saveLabel}>Save</Text>
              </Pressable>
            </View>
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
    gap: 16,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonsRight: {
    flexDirection: 'row',
    gap: 8,
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
  deleteLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.danger,
  },
  save: {
    backgroundColor: colors.accent,
  },
  saveDisabled: {
    opacity: 0.5,
  },
  saveLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onAccent,
  },
});
