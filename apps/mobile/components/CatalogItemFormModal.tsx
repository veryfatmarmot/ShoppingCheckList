import {
  hasDuplicateCatalogName,
  normalizeName,
  validateName,
  type CatalogItem,
  type Group,
} from '@shopping-check-list/domain';
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

import { GroupPicker } from './GroupPicker';

export interface CatalogItemFormValues {
  name: string;
  note: string;
  groupId: string | null;
}

interface CatalogItemFormModalProps {
  visible: boolean;
  title: string;
  initialName: string;
  initialNote: string;
  initialGroupId: string | null;
  groups: Group[];
  // Active catalog items, used for best-effort duplicate-name detection.
  existingItems: CatalogItem[];
  // Id of the item being edited, excluded from the duplicate check.
  editingId?: string;
  onCancel: () => void;
  onSubmit: (values: CatalogItemFormValues) => void;
  // When provided (edit mode), a Delete button is shown (wired in M3-T6).
  onDelete?: () => void;
}

// Controlled add/edit form for a catalog item: name, an optional note, and a
// group chosen from a chip picker (including "Ungrouped" → null). Validation
// comes from the domain layer; the parent owns persistence.
export function CatalogItemFormModal({
  visible,
  title,
  initialName,
  initialNote,
  initialGroupId,
  groups,
  existingItems,
  editingId,
  onCancel,
  onSubmit,
  onDelete,
}: CatalogItemFormModalProps) {
  const [name, setName] = useState(initialName);
  const [note, setNote] = useState(initialNote);
  const [groupId, setGroupId] = useState<string | null>(initialGroupId);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setNote(initialNote);
      setGroupId(initialGroupId);
    }
  }, [visible, initialName, initialNote, initialGroupId]);

  const nameError = validateName(name);
  const isDuplicate =
    nameError === null &&
    hasDuplicateCatalogName(normalizeName(name), existingItems, editingId);
  const canSave = nameError === null && !isDuplicate;

  function submit() {
    if (canSave) {
      onSubmit({ name: name.trim(), note: note.trim(), groupId });
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
          <Text style={styles.title}>{title}</Text>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Item name"
            placeholderTextColor={colors.textFaint}
            autoFocus
          />
          {isDuplicate ? (
            <Text style={styles.error}>
              An item named “{name.trim()}” already exists.
            </Text>
          ) : null}

          <TextInput
            style={[styles.input, styles.noteInput]}
            value={note}
            onChangeText={setNote}
            placeholder="Note (optional)"
            placeholderTextColor={colors.textFaint}
            multiline
          />

          <Text style={styles.label}>Group</Text>
          <GroupPicker
            groups={groups}
            selectedId={groupId}
            onSelect={setGroupId}
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
                  !canSave && styles.saveDisabled,
                ]}
                disabled={!canSave}
                onPress={submit}
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
    gap: 12,
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
  noteInput: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.danger,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.accent,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
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
