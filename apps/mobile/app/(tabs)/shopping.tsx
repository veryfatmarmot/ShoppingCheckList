import { catalogRepository, listRepository } from '@shopping-check-list/data';
import {
  itemDataEquals,
  normalizeName,
  sectionItemsByGroup,
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
  ListItemFormModal,
  type ListItemFormValues,
} from '../../components/ListItemFormModal';
import { Snackbar } from '../../components/Snackbar';
import { useAuthState } from '../../hooks/useAuthState';
import { useCatalog } from '../../hooks/useCatalog';
import { useGroups } from '../../hooks/useGroups';
import { useList } from '../../hooks/useList';
import { useShoppingUndo } from '../../hooks/useShoppingUndo';

function ShoppingListRow({
  item,
  onEdit,
  onMarkBought,
}: {
  item: ListItem;
  onEdit: () => void;
  onMarkBought: () => void;
}) {
  // One-time items (no catalog reference) get a distinct row color.
  const oneTime = item.catalogItemId === null;

  return (
    <View style={[styles.row, oneTime && styles.rowOneTime]}>
      <Pressable
        style={styles.checkbox}
        onPress={onMarkBought}
        accessibilityRole="checkbox"
        accessibilityLabel={`Mark ${item.itemData.name} bought`}
      />
      <Pressable style={styles.rowMain} onPress={onEdit}>
        <Text style={styles.rowName}>{item.itemData.name}</Text>
        {item.itemData.note ? (
          <Text style={styles.rowNote}>{item.itemData.note}</Text>
        ) : null}
      </Pressable>
      <Text style={styles.rowQty}>×{item.quantity}</Text>
    </View>
  );
}

export default function ShoppingScreen() {
  const { user } = useAuthState();
  const { items, loading: listLoading } = useList();
  const { groups, loading: groupsLoading } = useGroups();
  const { items: catalogItems } = useCatalog();
  const [addVisible, setAddVisible] = useState(false);
  const [editing, setEditing] = useState<ListItem | null>(null);
  const { pending, remaining, markBought, undo } = useShoppingUndo(
    user?.userId,
  );

  // When editing a catalog-linked item whose snapshot still matches its catalog
  // source (in sync), the linked catalog item is exposed here so the edit can
  // propagate to it. null when unlinked, diverged, or the catalog item is gone
  // (soft-deleted items are absent from the active catalog, so no propagation).
  const linkedInSyncCatalog = useMemo(() => {
    if (!editing || editing.catalogItemId === null) {
      return null;
    }
    const catalog = catalogItems.find((c) => c.id === editing.catalogItemId);
    if (!catalog) {
      return null;
    }
    return itemDataEquals(editing.itemData, catalog.itemData) ? catalog : null;
  }, [editing, catalogItems]);

  const sections = useMemo(
    () =>
      sectionItemsByGroup(items, groups).map((section) => ({
        title: section.group?.name ?? 'Ungrouped',
        data: section.items,
      })),
    [items, groups],
  );

  function closeForm() {
    setAddVisible(false);
    setEditing(null);
  }

  async function handleSubmit({
    name,
    quantity,
    groupId,
    note,
  }: ListItemFormValues) {
    const target = editing;
    const linkedCatalog = linkedInSyncCatalog;
    closeForm();
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
    // Edit overwrites the full document but preserves id/catalogItemId/createdAt
    // (so a catalog-backed item stays linked and one-time stays one-time);
    // add creates a new one-time item.
    const listItem: ListItem = target
      ? { ...target, quantity, updatedAt: now, itemData }
      : {
          id: randomUUID(),
          catalogItemId: null,
          quantity,
          createdAt: now,
          updatedAt: now,
          itemData,
        };
    await listRepository.set(user.userId, listItem);

    // If this list item was in sync with its catalog source, propagate the
    // shared-field changes to the catalog item too (quantity is list-only, so
    // a quantity-only edit leaves itemData unchanged and skips this write).
    if (linkedCatalog && !itemDataEquals(itemData, linkedCatalog.itemData)) {
      await catalogRepository.set(user.userId, {
        ...linkedCatalog,
        itemData,
        updatedAt: now,
      });
    }
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.addButton} onPress={() => setAddVisible(true)}>
        <Text style={styles.addLabel}>Add one-time item</Text>
      </Pressable>

      {listLoading || groupsLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#8a5a14" />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Shopping Complete</Text>
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
            <ShoppingListRow
              item={item}
              onEdit={() => setEditing(item)}
              onMarkBought={() => markBought(item)}
            />
          )}
          stickySectionHeadersEnabled={false}
        />
      )}

      <ListItemFormModal
        visible={addVisible || editing !== null}
        title={editing ? 'Edit item' : 'Add one-time item'}
        initialName={editing?.itemData.name ?? ''}
        initialQuantity={editing?.quantity ?? 1}
        initialGroupId={editing?.itemData.groupId ?? null}
        initialNote={editing?.itemData.note ?? ''}
        groups={groups}
        catalogLinked={linkedInSyncCatalog !== null}
        onCancel={closeForm}
        onSubmit={handleSubmit}
      />

      {pending ? (
        <Snackbar
          message={
            remaining > 1
              ? `Bought: ${pending.itemData.name} (+${remaining - 1} more)`
              : `Bought: ${pending.itemData.name}`
          }
          actionLabel="Undo"
          onAction={() => void undo()}
        />
      ) : null}
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
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8a5a14',
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#d8cdbb',
    marginBottom: 6,
  },
  rowOneTime: {
    backgroundColor: '#eadfca',
    borderColor: '#d8c9a6',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#8a5a14',
    marginRight: 10,
  },
  // Name + note share a line; the note hugs the right (marginLeft auto) and
  // wraps to its own line below only when it doesn't fit next to the name.
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    columnGap: 8,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f1b16',
  },
  rowNote: {
    fontSize: 14,
    color: '#6b6153',
    flexShrink: 0,
    marginLeft: 'auto',
    textAlign: 'right',
  },
  rowQty: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8a5a14',
    marginLeft: 10,
  },
});
