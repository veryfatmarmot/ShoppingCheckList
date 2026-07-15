import { Tabs } from 'expo-router';
import { View } from 'react-native';

import { OfflineBanner } from '../../components/OfflineBanner';
import { SignOutControl } from '../../components/SignOutControl';
import { AppDataProvider } from '../../context/AppDataProvider';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

// M1-T3 app shell + M1-T6 shared-header sign-out. The auth guard (M1-T4)
// gates access to this group. M5-T2: an offline banner sits above the tabs
// while offline; the header drops its status-bar inset then so it stays flush
// below the banner (the banner owns the top safe area).
export default function TabsLayout() {
  const online = useOnlineStatus();

  return (
    <AppDataProvider>
      <View style={{ flex: 1 }}>
        {online ? null : <OfflineBanner />}
        <Tabs
          screenOptions={{
            headerShown: true,
            headerRight: () => <SignOutControl />,
            headerStatusBarHeight: online ? undefined : 0,
          }}
        >
          <Tabs.Screen name="shopping" options={{ title: 'Shopping List' }} />
          <Tabs.Screen name="catalog" options={{ title: 'Catalog' }} />
          <Tabs.Screen name="groups" options={{ title: 'Groups' }} />
        </Tabs>
      </View>
    </AppDataProvider>
  );
}
