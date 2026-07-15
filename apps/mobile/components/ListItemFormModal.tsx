import {
  validateName,
  validateQuantity,
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

import { GroupPicker } from './GroupPicker';

export interface ListItemFormValues {
  name: string;
  quantity: number;
  groupId: string | null;
  note: string;
}

interface ListItemFormModalProps {
  visible: boolean;
  title: string;
  initialName: string;
  initialQuantity: number;
  initialGroupId: string | null;
  initialNote: string;
  groups: Group[];
  // True when saving will also update the linked catalog item (edit of an
  // in-sync catalog-backed list item). Shown as a small hint.
  catalogLinked?: boolean;
  onCancel: () => void;
  onSubmit: (values: ListItemFormValues) => void;
}

// Controlled add/edit form for a shopping-list item: name, quantity, a group
// (chip picker), and an optional note. Used for both one-time items (M4-T5)
// and editing an existing list item (M4-T6). Validation comes from the domain
// layer; the parent owns persistence.
export function ListItemFormModal({
  visible,
  title,
  initialName,
  initialQuantity,
  initialGroupId,
  initialNote,
  groups,
  catalogLinked = false,
  onCancel,
  onSubmit,
}: ListItemFormModalProps) {
  const [name, setName] = useState(initialName);
  const [quantityText, setQuantityText] = useState(String(initialQuantity));
  const [groupId, setGroupId] = useState<string | null>(initialGroupId);
  const [note, setNote] = useState(initialNote);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setQuantityText(String(initialQuantity));
      setGroupId(initialGroupId);
      setNote(initialNote);
    }
  }, [visible, initialName, initialQuantity, initialGroupId, initialNote]);

  const quantity = Number(quantityText);
  const quantityValid =
    quantityText.trim() !== '' &&
    Number.isFinite(quantity) &&
    validateQuantity(quantity) === null;
  const canSave = validateName(name) === null && quantityValid;

  function submit() {
    if (canSave) {
      onSubmit({ name: name.trim(), quantity, groupId, note: note.trim() });
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
            placeholderTextColor="#a89e8c"
            autoFocus
          />

          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            value={quantityText}
            onChangeText={setQuantityText}
            keyboardType="numeric"
            placeholder="1"
            placeholderTextColor="#a89e8c"
            selectTextOnFocus
          />

          <TextInput
            style={[styles.input, styles.noteInput]}
            value={note}
            onChangeText={setNote}
            placeholder="Note (optional)"
            placeholderTextColor="#a89e8c"
            multiline
          />

          <Text style={styles.label}>Group</Text>
          <GroupPicker
            groups={groups}
            selectedId={groupId}
            onSelect={setGroupId}
          />

          <View style={styles.buttons}>
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

          {catalogLinked ? (
            <Text style={styles.catalogLinked}>catalog linked</Text>
          ) : null}
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
  input: {
    borderWidth: 1,
    borderColor: '#d8cdbb',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1f1b16',
    backgroundColor: '#f4efe6',
  },
  noteInput: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#8a5a14',
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
  save: {
    backgroundColor: '#8a5a14',
  },
  saveDisabled: {
    opacity: 0.5,
  },
  saveLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fffdf8',
  },
  catalogLinked: {
    fontSize: 12,
    color: '#a89e8c',
    textAlign: 'center',
  },
});
