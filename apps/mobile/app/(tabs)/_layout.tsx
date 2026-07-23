import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Tabs, withLayoutContext } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OfflineBanner } from '../../components/OfflineBanner';
import { SignOutControl } from '../../components/SignOutControl';
import { AppDataProvider } from '../../context/AppDataProvider';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { colors } from '../../theme';

// Swipeable tabs on native (P1-T2). Material Top Tabs is a pager
// (react-native-pager-view) that supports horizontal swipe between screens;
// positioned at the bottom it keeps the bottom-bar UX. Web keeps the tap-only
// Expo Router `Tabs` — no pager, so no swipe there, by design.
const MaterialTopTabs = withLayoutContext(
  createMaterialTopTabNavigator().Navigator,
);

const SCREENS = [
  { name: 'shopping', title: 'Shopping List' },
  { name: 'catalog', title: 'Catalog' },
  { name: 'groups', title: 'Groups' },
] as const;

// Native custom header: Material Top Tabs has no built-in header, so we render
// one. Static "Refillio" brand title (the bottom bar already shows the active
// tab). When offline the OfflineBanner owns the top safe-area inset, so the
// header drops its own inset then to stay flush below the banner.
function NativeHeader({ online }: { online: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: online ? insets.top : 0 }]}>
      <Text style={styles.headerTitle}>Refillio</Text>
      <SignOutControl />
    </View>
  );
}

function NativeSwipeTabs() {
  return (
    <MaterialTopTabs
      tabBarPosition="bottom"
      screenOptions={{
        swipeEnabled: true,
        tabBarStyle: {
          backgroundColor: colors.surfaceRaised,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 54,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        // Active tab highlight: a filled accent pill that slides under the
        // current tab as you swipe (more legible than a thin edge line).
        tabBarIndicatorStyle: {
          height: 38,
          borderRadius: 19,
          backgroundColor: colors.accentSurface,
        },
        tabBarIndicatorContainerStyle: { marginVertical: 8 },
        tabBarPressColor: 'transparent',
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '700',
          textTransform: 'none',
        },
      }}
    >
      {SCREENS.map((s) => (
        <MaterialTopTabs.Screen
          key={s.name}
          name={s.name}
          options={{ title: s.title }}
        />
      ))}
    </MaterialTopTabs>
  );
}

// Web: unchanged tap-only bottom tabs with the built-in header.
function WebTapTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerRight: () => <SignOutControl />,
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
      {SCREENS.map((s) => (
        <Tabs.Screen key={s.name} name={s.name} options={{ title: s.title }} />
      ))}
    </Tabs>
  );
}

// M1-T3 app shell + M1-T6 shared-header sign-out. The auth guard (M1-T4) gates
// access to this group. M5-T2: an offline banner sits above the tabs while
// offline.
export default function TabsLayout() {
  const online = useOnlineStatus();

  return (
    <AppDataProvider>
      <View style={styles.root}>
        {online ? null : <OfflineBanner />}
        {Platform.OS === 'web' ? (
          <WebTapTabs />
        ) : (
          <>
            <NativeHeader online={online} />
            <NativeSwipeTabs />
          </>
        )}
      </View>
    </AppDataProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 16,
    backgroundColor: colors.surfaceRaised,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingVertical: 12,
  },
});
