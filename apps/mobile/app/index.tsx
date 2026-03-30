import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Shopping Check List</Text>
        <Text style={styles.title}>Expo app ready for Android and Web</Text>
        <Text style={styles.body}>
          Foundation setup is in place. Next tickets can build auth, tabs, and data
          layers on top of this shell.
        </Text>
      </View>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f4efe6',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#d8cdbb',
    gap: 12,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#8a5a14',
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: '#1f1b16',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4d463d',
  },
});
