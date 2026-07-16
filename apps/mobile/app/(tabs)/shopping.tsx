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
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// How long the "checked → fade out" animation runs before the item is deleted.
const BOUGHT_ANIM_MS = 250;

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
import { colors } from '../../theme';

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

  // 0 = normal, 1 = fully "checked and leaving". Tapping the checkbox fills it
  // and fades/slides the row out; the actual delete fires when it completes.
  const progress = useSharedValue(0);

  const rowStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ translateX: progress.value * 24 }],
  }));

  // The tick fills in over the first half, so it reads as "checked" before the
  // row is gone.
  const checkStyle = useAnimatedStyle(() => ({
    opacity: Math.min(progress.value / 0.5, 1),
  }));

  function handleBought() {
    if (progress.value !== 0) {
      return; // already leaving — ignore repeat taps
    }
    progress.value = withTiming(1, { duration: BOUGHT_ANIM_MS }, (finished) => {
      if (finished) {
        runOnJS(onMarkBought)();
      }
    });
  }

  return (
    <Animated.View style={[styles.row, oneTime && styles.rowOneTime, rowStyle]}>
      <Pressable style={styles.rowMain} onPress={onEdit}>
        <Text style={styles.rowName}>{item.itemData.name}</Text>
        {item.itemData.note ? (
          <Text style={styles.rowNote}>{item.itemData.note}</Text>
        ) : null}
      </Pressable>
      {/* A quantity of 1 means "no count given" and is left off the row. The
          test is `!== 1`, not `> 1`: fractional amounts like 0.5 are explicit
          counts and must stay visible. */}
      {item.quantity !== 1 ? (
        <Text style={styles.rowQty}>{item.quantity}</Text>
      ) : null}
      {/* Mark-bought on the right — easier thumb reach, and consistent with the
          catalog's right-side action control. */}
      <Pressable
        style={styles.checkbox}
        onPress={handleBought}
        hitSlop={10}
        accessibilityRole="checkbox"
        accessibilityLabel={`Mark ${item.itemData.name} bought`}
      >
        <Animated.View style={[styles.checkFill, checkStyle]}>
          <Text style={styles.checkMark}>✓</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
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

  const addButton = (
    <Pressable style={styles.addButton} onPress={() => setAddVisible(true)}>
      <Text style={styles.addLabel}>Add one-time item</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {listLoading || groupsLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <SectionList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          sections={sections}
          keyExtractor={(item) => item.id}
          // The add button lives inside the list so it scrolls away with the
          // items, saving header space.
          ListHeaderComponent={addButton}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Shopping Complete</Text>
            </View>
          }
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
    backgroundColor: colors.background,
  },
  // Outlined "ghost" pill rather than a solid fill: it sits inside the list, so
  // a solid accent block would outweigh the items it scrolls with.
  addButton: {
    marginBottom: 8,
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
  empty: {
    alignItems: 'center',
    paddingTop: 56,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.accent,
  },
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.accent,
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 6,
  },
  rowOneTime: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.borderAlt,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.accent,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  checkFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  checkMark: {
    color: colors.onAccent,
    fontSize: 13,
    fontWeight: '700',
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
    color: colors.textPrimary,
  },
  rowNote: {
    fontSize: 14,
    color: colors.textMuted,
    flexShrink: 0,
    marginLeft: 'auto',
    textAlign: 'right',
  },
  rowQty: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.accent,
    marginLeft: 10,
  },
});
