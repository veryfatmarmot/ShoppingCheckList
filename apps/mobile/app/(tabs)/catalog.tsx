import { catalogRepository, listRepository } from '@shopping-check-list/data';
import {
  normalizeName,
  sectionItemsByGroup,
  type CatalogItem,
  type ListItem,
} from '@shopping-check-list/domain';
import { randomUUID } from 'expo-crypto';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  CatalogItemFormModal,
  type CatalogItemFormValues,
} from '../../components/CatalogItemFormModal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { QuantityModal } from '../../components/QuantityModal';
import { useAuthState } from '../../hooks/useAuthState';
import { useCatalog } from '../../hooks/useCatalog';
import { useGroups } from '../../hooks/useGroups';

function CatalogItemRow({
  item,
  onEdit,
  onAdd,
}: {
  item: CatalogItem;
  onEdit: () => void;
  onAdd: () => void;
}) {
  return (
    <View style={styles.row}>
      <Pressable style={styles.rowMain} onPress={onEdit}>
        <Text style={styles.rowName}>{item.itemData.name}</Text>
        {item.itemData.note ? (
          <Text style={styles.rowNote}>{item.itemData.note}</Text>
        ) : null}
      </Pressable>
      <Pressable
        style={styles.addToList}
        onPress={onAdd}
        accessibilityLabel={`Add ${item.itemData.name} to shopping list`}
      >
        <Text style={styles.addToListGlyph}>+</Text>
      </Pressable>
    </View>
  );
}

export default function CatalogScreen() {
  const { user } = useAuthState();
  const { items, loading: catalogLoading } = useCatalog();
  const { groups, loading: groupsLoading } = useGroups();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogItem | null>(null);
  const [addTarget, setAddTarget] = useState<CatalogItem | null>(null);

  const sections = useMemo(
    () =>
      sectionItemsByGroup(items, groups).map((section) => ({
        title: section.group?.name ?? 'Ungrouped',
        data: section.items,
      })),
    [items, groups],
  );

  function openCreate() {
    setEditing(null);
    setModalVisible(true);
  }

  function openEdit(item: CatalogItem) {
    setEditing(item);
    setModalVisible(true);
  }

  async function handleSubmit({ name, note, groupId }: CatalogItemFormValues) {
    if (!user) {
      return;
    }

    const now = Date.now();
    const itemData = {
      name,
      normalizedName: normalizeName(name),
      groupId,
      note,
    };
    const item: CatalogItem = editing
      ? { ...editing, updatedAt: now, itemData }
      : {
          id: randomUUID(),
          createdAt: now,
          updatedAt: now,
          deleted: false,
          itemData,
        };

    setModalVisible(false);
    await catalogRepository.set(user.userId, item);
  }

  function requestDelete() {
    setDeleteTarget(editing);
    setModalVisible(false);
  }

  async function addToList(quantity: number) {
    const target = addTarget;
    setAddTarget(null);
    if (!user || !target) {
      return;
    }
    // ListItem is a snapshot: copy the catalog item's itemData at add time so
    // later catalog edits don't change this list entry.
    const now = Date.now();
    const listItem: ListItem = {
      id: randomUUID(),
      catalogItemId: target.id,
      quantity,
      createdAt: now,
      updatedAt: now,
      itemData: { ...target.itemData },
    };
    await listRepository.set(user.userId, listItem);
  }

  async function confirmDelete() {
    const target = deleteTarget;
    setDeleteTarget(null);
    if (!user || !target) {
      return;
    }
    // Soft delete: write a tombstone (deleted = true) rather than removing the
    // document. useCatalog filters it out of the view; the tombstone keeps the
    // delete arbitrable by updatedAt and allows later resurrection.
    await catalogRepository.set(user.userId, {
      ...target,
      deleted: true,
      updatedAt: Date.now(),
    });
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.addButton} onPress={openCreate}>
        <Text style={styles.addLabel}>Add item</Text>
      </Pressable>

      {catalogLoading || groupsLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#8a5a14" />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.empty}>No catalog items yet.</Text>
        </View>
      ) : (
        <SectionList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <CatalogItemRow
              item={item}
              onEdit={() => openEdit(item)}
              onAdd={() => setAddTarget(item)}
            />
          )}
          stickySectionHeadersEnabled={false}
        />
      )}

      <CatalogItemFormModal
        visible={modalVisible}
        title={editing ? 'Edit item' : 'Add item'}
        initialName={editing?.itemData.name ?? ''}
        initialNote={editing?.itemData.note ?? ''}
        initialGroupId={editing?.itemData.groupId ?? null}
        groups={groups}
        existingItems={items}
        editingId={editing?.id}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        onDelete={editing ? requestDelete : undefined}
      />

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete item?"
        message={`"${deleteTarget?.itemData.name ?? ''}" will be removed from your catalog.`}
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <QuantityModal
        visible={addTarget !== null}
        itemName={addTarget?.itemData.name ?? ''}
        initialQuantity={1}
        confirmLabel="Add to list"
        onCancel={() => setAddTarget(null)}
        onSubmit={addToList}
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
    backgroundColor: '#f4efe6',
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#8a5a14',
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#d8cdbb',
    marginBottom: 8,
    overflow: 'hidden',
  },
  rowMain: {
    flex: 1,
    padding: 16,
    gap: 4,
  },
  rowName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f1b16',
  },
  rowNote: {
    fontSize: 14,
    color: '#6b6153',
  },
  addToList: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderLeftWidth: 1,
    borderLeftColor: '#ece3d3',
  },
  addToListGlyph: {
    fontSize: 26,
    fontWeight: '700',
    color: '#8a5a14',
  },
});
