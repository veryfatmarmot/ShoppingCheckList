import { groupRepository } from '@shopping-check-list/data';
import {
  nextGroupOrder,
  normalizeName,
  type Group,
} from '@shopping-check-list/domain';
import { randomUUID } from 'expo-crypto';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { GroupFormModal } from '../../components/GroupFormModal';
import { useAuthState } from '../../hooks/useAuthState';
import { useGroups } from '../../hooks/useGroups';

export default function GroupsScreen() {
  const { user } = useAuthState();
  const { groups, loading } = useGroups();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);

  function openCreate() {
    setEditing(null);
    setModalVisible(true);
  }

  function openEdit(group: Group) {
    setEditing(group);
    setModalVisible(true);
  }

  async function handleSubmit(name: string) {
    if (!user) {
      return;
    }

    const now = Date.now();
    const normalizedName = normalizeName(name);
    // Edit preserves id/createdAt/order and only changes the name; create
    // assigns a new GUID, timestamps, and the next order.
    const group: Group = editing
      ? { ...editing, name, normalizedName, updatedAt: now }
      : {
          id: randomUUID(),
          name,
          normalizedName,
          order: nextGroupOrder(groups),
          createdAt: now,
          updatedAt: now,
        };

    setModalVisible(false);
    await groupRepository.set(user.userId, group);
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.addButton} onPress={openCreate}>
        <Text style={styles.addLabel}>Add group</Text>
      </Pressable>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#8a5a14" />
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.empty}>No groups yet.</Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={groups}
          keyExtractor={(group) => group.id}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => openEdit(item)}>
              <Text style={styles.rowName}>{item.name}</Text>
            </Pressable>
          )}
        />
      )}

      <GroupFormModal
        visible={modalVisible}
        title={editing ? 'Edit group' : 'Add group'}
        initialName={editing?.name ?? ''}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4efe6',
  },
  addButton: {
    margin: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#8a5a14',
  },
  addLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fffdf8',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  empty: {
    fontSize: 16,
    color: '#6b6153',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  row: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#d8cdbb',
  },
  rowName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f1b16',
  },
});
