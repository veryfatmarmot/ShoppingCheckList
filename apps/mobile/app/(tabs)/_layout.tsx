import { Tabs } from 'expo-router';

// M1-T3 app shell: the three main tabs. Auth guard (M1-T4) will gate access
// to this group; sign-out (M1-T6) will live in the shared header.
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="shopping" options={{ title: 'Shopping List' }} />
      <Tabs.Screen name="catalog" options={{ title: 'Catalog' }} />
      <Tabs.Screen name="groups" options={{ title: 'Groups' }} />
    </Tabs>
  );
}
