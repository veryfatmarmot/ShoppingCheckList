import {
  sectionItemsByGroup,
  type ListItem,
} from '@shopping-check-list/domain';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useGroups } from '../../hooks/useGroups';
import { useList } from '../../hooks/useList';

function ShoppingListRow({ item }: { item: ListItem }) {
  return (
    <View style={styles.row}>
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
  const { items, loading: listLoading } = useList();
  const { groups, loading: groupsLoading } = useGroups();

  const sections = useMemo(
    () =>
      sectionItemsByGroup(items, groups).map((section) => ({
        title: section.group?.name ?? 'Ungrouped',
        data: section.items,
      })),
    [items, groups],
  );

  if (listLoading || groupsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#8a5a14" />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Shopping Complete</Text>
      </View>
    );
  }

  return (
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
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f4efe6',
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
