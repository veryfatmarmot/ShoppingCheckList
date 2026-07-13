import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useGroups } from '../../hooks/useGroups';

export default function GroupsScreen() {
  const { groups, loading } = useGroups();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#8a5a14" />
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>No groups yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={groups}
      keyExtractor={(group) => group.id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.rowName}>{item.name}</Text>
        </View>
      )}
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
    gap: 8,
  },
  row: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#d8cdbb',
  },
  rowName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f1b16',
  },
});
