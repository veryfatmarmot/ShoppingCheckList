import { groupRepository } from '@shopping-check-list/data';
import {
  nextGroupOrder,
  normalizeName,
  type Group,
} from '@shopping-check-list/domain';
import { randomUUID } from 'expo-crypto';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ReorderableList, {
  reorderItems,
  useReorderableDrag,
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list';

import { GroupFormModal } from '../../components/GroupFormModal';
import { useAuthState } from '../../hooks/useAuthState';
import { useGroups } from '../../hooks/useGroups';

function GroupRow({
  group,
  onEdit,
}: {
  group: Group;
  onEdit: (group: Group) => void;
}) {
  const drag = useReorderableDrag();

  return (
    <View style={styles.row}>
      <Pressable style={styles.rowMain} onPress={() => onEdit(group)}>
        <Text style={styles.rowName}>{group.name}</Text>
      </Pressable>
      {/* Grab handle: starts dragging on touch-down (no hold). Tapping the
          rest of the row opens the edit modal instead. */}
      <Pressable
        style={styles.handle}
        onPressIn={drag}
        accessibilityLabel={`Reorder ${group.name}`}
      >
        <Text style={styles.handleGlyph}>⣿</Text>
      </Pressable>
    </View>
  );
}

export default function GroupsScreen() {
  const { user } = useAuthState();
  const { groups, loading } = useGroups();
  const [ordered, setOrdered] = useState<Group[]>(groups);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);

  // Mirror the live, sorted groups locally so a drag can update positions
  // immediately; Firestore's push (after we persist) reconciles this back.
  useEffect(() => {
    setOrdered(groups);
  }, [groups]);

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

  function handleReorder({ from, to }: ReorderableListReorderEvent) {
    if (!user || from === to) {
      return;
    }

    const next = reorderItems(ordered, from, to);
    setOrdered(next);

    // Reindex to 0..n-1 and persist only the groups whose order changed.
    const now = Date.now();
    next.forEach((group, index) => {
      if (group.order !== index) {
        void groupRepository.set(user.userId, {
          ...group,
          order: index,
          updatedAt: now,
        });
      }
    });
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
      ) : ordered.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.empty}>No groups yet.</Text>
        </View>
      ) : (
        <ReorderableList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={ordered}
          onReorder={handleReorder}
          keyExtractor={(group) => group.id}
          renderItem={({ item }) => <GroupRow group={item} onEdit={openEdit} />}
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
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 12,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#d8cdbb',
    overflow: 'hidden',
  },
  rowMain: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  rowName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f1b16',
  },
  handle: {
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#ece3d3',
  },
  handleGlyph: {
    fontSize: 22,
    color: '#b3a892',
  },
});
