import {
  catalogRepository,
  groupRepository,
  listRepository,
} from '@shopping-check-list/data';
import {
  nextGroupOrder,
  normalizeName,
  type Group,
} from '@shopping-check-list/domain';
import { randomUUID } from 'expo-crypto';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import ReorderableList, {
  reorderItems,
  useReorderableDrag,
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list';

import { ConfirmDialog } from '../../components/ConfirmDialog';
import { GroupFormModal } from '../../components/GroupFormModal';
import { useAuthState } from '../../hooks/useAuthState';
import { useGroups } from '../../hooks/useGroups';
import { colors } from '../../theme';

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
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null);

  // Reorder pan that yields horizontal swipes to the swipe-between-tabs pager
  // (P1-T2). activeOffsetY means the drag only engages once the finger has moved
  // vertically — so a sideways swipe never activates the reorder and flows to
  // the pager (navigating tabs), while a vertical drag on the grab handle still
  // reorders. We deliberately do NOT add failOffsetX: it fails the drag on the
  // small sideways jitter of a vertical drag and corrupts the library's
  // drag-direction tracking.
  const reorderPan = useMemo(() => Gesture.Pan().activeOffsetY([-12, 12]), []);

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

  function requestDelete() {
    // Close the edit modal and open the delete confirmation for that group.
    setDeleteTarget(editing);
    setModalVisible(false);
  }

  async function confirmDelete() {
    const target = deleteTarget;
    setDeleteTarget(null);
    if (!user || !target) {
      return;
    }

    // M4-T9 cascade: before removing the group, clear its reference on every
    // catalog item and list item (full-document overwrite, newer updatedAt), so
    // no document keeps a dangling groupId. getAll (not the active-only hook)
    // is used so soft-deleted catalog tombstones are cleared too.
    const now = Date.now();
    const [catalogItems, listItems] = await Promise.all([
      catalogRepository.getAll(user.userId),
      listRepository.getAll(user.userId),
    ]);

    const clears: Promise<void>[] = [];
    for (const item of catalogItems) {
      if (item.itemData.groupId === target.id) {
        clears.push(
          catalogRepository.set(user.userId, {
            ...item,
            updatedAt: now,
            itemData: { ...item.itemData, groupId: null },
          }),
        );
      }
    }
    for (const item of listItems) {
      if (item.itemData.groupId === target.id) {
        clears.push(
          listRepository.set(user.userId, {
            ...item,
            updatedAt: now,
            itemData: { ...item.itemData, groupId: null },
          }),
        );
      }
    }
    await Promise.all(clears);

    await groupRepository.delete(user.userId, target.id);
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

  const addButton = (
    <Pressable style={styles.addButton} onPress={openCreate}>
      <Text style={styles.addLabel}>Add group</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ReorderableList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={ordered}
          onReorder={handleReorder}
          panGesture={reorderPan}
          // Autoscroll disabled (P1-T2): inside the material-top-tabs swipe pager
          // the list mis-measures its own height (oscillates 758 <-> 83), so its
          // autoscroll threshold lands mid-screen and runs away. speedScale 0
          // stops the autoscroll movement (drag still works); reorder is limited
          // to the on-screen area — scroll first, then drag, for a long list.
          // See tickets.md P1-T2 for the full investigation.
          autoscrollSpeedScale={0}
          keyExtractor={(group) => group.id}
          // The add button lives inside the list so it scrolls away with the
          // groups, saving header space.
          ListHeaderComponent={addButton}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.empty}>No groups yet.</Text>
            </View>
          }
          renderItem={({ item }) => <GroupRow group={item} onEdit={openEdit} />}
        />
      )}

      <GroupFormModal
        visible={modalVisible}
        title={editing ? 'Edit group' : 'Add group'}
        initialName={editing?.name ?? ''}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        onDelete={editing ? requestDelete : undefined}
      />

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete group?"
        message={`"${deleteTarget?.name ?? ''}" will be deleted. Items in it become Ungrouped.`}
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Outlined "ghost" pill rather than a solid fill: it sits inside the list, so
  // a solid accent block would outweigh the groups it scrolls with.
  addButton: {
    marginBottom: 6,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  addLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyBox: {
    alignItems: 'center',
    paddingTop: 56,
  },
  empty: {
    fontSize: 16,
    color: colors.textMuted,
  },
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  rowMain: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  handle: {
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: colors.divider,
  },
  handleGlyph: {
    fontSize: 22,
    color: colors.textFaint,
  },
});
