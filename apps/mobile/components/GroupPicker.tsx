import type { Group } from '@shopping-check-list/domain';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

// Chip picker for choosing a group (or "Ungrouped" → null). Shared by the
// catalog and list item form modals.
export function GroupPicker({
  groups,
  selectedId,
  onSelect,
}: {
  groups: Group[];
  selectedId: string | null;
  onSelect: (groupId: string | null) => void;
}) {
  return (
    <View style={styles.chips}>
      <Chip
        label="Ungrouped"
        selected={selectedId === null}
        onPress={() => onSelect(null)}
      />
      {groups.map((group) => (
        <Chip
          key={group.id}
          label={group.name}
          selected={selectedId === group.id}
          onPress={() => onSelect(group.id)}
        />
      ))}
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSunken,
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  chipLabelSelected: {
    color: colors.onAccent,
    fontWeight: '600',
  },
});
