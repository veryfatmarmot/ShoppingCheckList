import {
  sectionItemsByGroup,
  type CatalogItem,
} from '@shopping-check-list/domain';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useCatalog } from '../../hooks/useCatalog';
import { useGroups } from '../../hooks/useGroups';

function CatalogItemRow({ item }: { item: CatalogItem }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowName}>{item.itemData.name}</Text>
      {item.itemData.note ? (
        <Text style={styles.rowNote}>{item.itemData.note}</Text>
      ) : null}
    </View>
  );
}

export default function CatalogScreen() {
  const { items, loading: catalogLoading } = useCatalog();
  const { groups, loading: groupsLoading } = useGroups();

  const sections = useMemo(
    () =>
      sectionItemsByGroup(items, groups).map((section) => ({
        title: section.group?.name ?? 'Ungrouped',
        data: section.items,
      })),
    [items, groups],
  );

  // Wait for both so grouped items don't briefly flash under "Ungrouped"
  // before the groups arrive.
  if (catalogLoading || groupsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#8a5a14" />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>No catalog items yet.</Text>
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
      renderItem={({ item }) => <CatalogItemRow item={item} />}
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
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#d8cdbb',
    marginBottom: 8,
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
});
