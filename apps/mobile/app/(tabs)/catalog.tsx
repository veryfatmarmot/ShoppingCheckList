import { catalogRepository } from '@shopping-check-list/data';
import {
  normalizeName,
  sectionItemsByGroup,
  type CatalogItem,
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
import { useAuthState } from '../../hooks/useAuthState';
import { useCatalog } from '../../hooks/useCatalog';
import { useGroups } from '../../hooks/useGroups';

function CatalogItemRow({
  item,
  onPress,
}: {
  item: CatalogItem;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={styles.rowName}>{item.itemData.name}</Text>
      {item.itemData.note ? (
        <Text style={styles.rowNote}>{item.itemData.note}</Text>
      ) : null}
    </Pressable>
  );
}

export default function CatalogScreen() {
  const { user } = useAuthState();
  const { items, loading: catalogLoading } = useCatalog();
  const { groups, loading: groupsLoading } = useGroups();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<CatalogItem | null>(null);

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
            <CatalogItemRow item={item} onPress={() => openEdit(item)} />
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
