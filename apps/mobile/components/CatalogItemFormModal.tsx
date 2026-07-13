import { validateName, type Group } from '@shopping-check-list/domain';
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

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

  const error = validateName(name);

  function submit() {
    if (!error) {
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
            placeholderTextColor="#a89e8c"
            autoFocus
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
          <View style={styles.chips}>
            <GroupChip
              label="Ungrouped"
              selected={groupId === null}
              onPress={() => setGroupId(null)}
            />
            {groups.map((group) => (
              <GroupChip
                key={group.id}
                label={group.name}
                selected={groupId === group.id}
                onPress={() => setGroupId(group.id)}
              />
            ))}
          </View>

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

function GroupChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
        {label}
      </Text>
    </Pressable>
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d8cdbb',
    backgroundColor: '#f4efe6',
  },
  chipSelected: {
    backgroundColor: '#8a5a14',
    borderColor: '#8a5a14',
  },
  chipLabel: {
    fontSize: 14,
    color: '#4d463d',
  },
  chipLabelSelected: {
    color: '#fffdf8',
    fontWeight: '600',
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
    color: '#6b6153',
  },
  deleteLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#a4262c',
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
});
