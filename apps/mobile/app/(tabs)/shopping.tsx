import { listRepository } from '@shopping-check-list/data';
import {
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
import { useAuthState } from '../../hooks/useAuthState';
import { useGroups } from '../../hooks/useGroups';
import { useList } from '../../hooks/useList';

function ShoppingListRow({ item }: { item: ListItem }) {
  // One-time items (no catalog reference) get a distinct row color.
  const oneTime = item.catalogItemId === null;

  return (
    <View style={[styles.row, oneTime && styles.rowOneTime]}>
      <View style={styles.rowMain}>
        <Text style={styles.rowName}>{item.itemData.name}</Text>
        {item.itemData.note ? (
          <Text style={styles.rowNote}>{item.itemData.note}</Text>
        ) : null}
      </View>
      <Text style={styles.rowQty}>×{item.quantity}</Text>
    </View>
  );
}

export default function ShoppingScreen() {
  const { user } = useAuthState();
  const { items, loading: listLoading } = useList();
  const { groups, loading: groupsLoading } = useGroups();
  const [addVisible, setAddVisible] = useState(false);

  const sections = useMemo(
    () =>
      sectionItemsByGroup(items, groups).map((section) => ({
        title: section.group?.name ?? 'Ungrouped',
        data: section.items,
      })),
    [items, groups],
  );

  async function addOneTime({
    name,
    quantity,
    groupId,
    note,
  }: ListItemFormValues) {
    setAddVisible(false);
    if (!user) {
      return;
    }
    const now = Date.now();
    const listItem: ListItem = {
      id: randomUUID(),
      catalogItemId: null,
      quantity,
      createdAt: now,
      updatedAt: now,
      itemData: { name, normalizedName: normalizeName(name), groupId, note },
    };
    await listRepository.set(user.userId, listItem);
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
          renderItem={({ item }) => <ShoppingListRow item={item} />}
          stickySectionHeadersEnabled={false}
        />
      )}

      <ListItemFormModal
        visible={addVisible}
        title="Add one-time item"
        initialName=""
        initialQuantity={1}
        initialGroupId={null}
        initialNote=""
        groups={groups}
        onCancel={() => setAddVisible(false)}
        onSubmit={addOneTime}
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
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#d8cdbb',
    marginBottom: 8,
  },
  rowOneTime: {
    backgroundColor: '#eadfca',
    borderColor: '#d8c9a6',
  },
  rowMain: {
    flex: 1,
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
  rowQty: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8a5a14',
    marginLeft: 12,
  },
});
