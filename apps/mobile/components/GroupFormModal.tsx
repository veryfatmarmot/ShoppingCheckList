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

interface GroupFormModalProps {
  visible: boolean;
  title: string;
  initialName: string;
  onCancel: () => void;
  onSubmit: (name: string) => void;
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
            placeholderTextColor="#a89e8c"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => {
              if (!error) {
                onSubmit(name.trim());
              }
            }}
          />
          <View style={styles.buttons}>
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
    gap: 16,
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
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
