import type { Group } from '@shopping-check-list/domain';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
    borderColor: '#d8cdbb',
    backgroundColor: '#f4efe6',
  },
  chipSelected: {
    backgroundColor: '#8a5a14',
    borderColor: '#8a5a14',
  },
  chipLabel: {
    fontSize: 14,
    color: '#4d463d',
  },
  chipLabelSelected: {
    color: '#fffdf8',
    fontWeight: '600',
  },
});
