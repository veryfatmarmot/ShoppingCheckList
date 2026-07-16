import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { OfflineBanner } from '../../components/OfflineBanner';
import { SignOutControl } from '../../components/SignOutControl';
import { AppDataProvider } from '../../context/AppDataProvider';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { colors } from '../../theme';

// M1-T3 app shell + M1-T6 shared-header sign-out. The auth guard (M1-T4)
// gates access to this group. M5-T2: an offline banner sits above the tabs
// while offline; the header drops its status-bar inset then so it stays flush
// below the banner (the banner owns the top safe area).
//
// The header and tab bar are themed here because React Navigation defaults to
// light chrome — without this they stay white while the screens are dark.
// sceneStyle paints the area behind a screen so tab switches don't flash white.
export default function TabsLayout() {
  const online = useOnlineStatus();

  return (
    <AppDataProvider>
      <View style={styles.root}>
        {online ? null : <OfflineBanner />}
        <Tabs
          screenOptions={{
            headerShown: true,
            headerRight: () => <SignOutControl />,
            headerStatusBarHeight: online ? undefined : 0,
            headerStyle: { backgroundColor: colors.surfaceRaised },
            headerTitleStyle: { color: colors.textPrimary },
            headerTintColor: colors.textPrimary,
            headerShadowVisible: false,
            sceneStyle: { backgroundColor: colors.background },
            tabBarStyle: {
              backgroundColor: colors.surfaceRaised,
              borderTopColor: colors.border,
            },
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.textMuted,
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
