import { Tabs } from 'expo-router';

import { SignOutControl } from '../../components/SignOutControl';

// M1-T3 app shell + M1-T6 shared-header sign-out. The auth guard (M1-T4)
// gates access to this group.
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerRight: () => <SignOutControl />,
      }}
    >
      <Tabs.Screen name="shopping" options={{ title: 'Shopping List' }} />
      <Tabs.Screen name="catalog" options={{ title: 'Catalog' }} />
      <Tabs.Screen name="groups" options={{ title: 'Groups' }} />
    </Tabs>
  );
}
