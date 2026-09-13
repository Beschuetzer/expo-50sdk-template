import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';

import { useClientOnlyValue } from '@/components/hooks/useClientOnlyValue';
import { useColorScheme } from '@/components/hooks/useColorScheme';
import { COLORS } from '@/constants/colors';
import { Routes } from '@/constants/navigation';
import { useI18n } from '@/utils/i18n';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name={Routes.DashboardScreen}
        options={{
          title: t('tabs.home'),
          headerTitleAlign: 'center',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name={Routes.OptionsScreen}
        options={{
          title: t('tabs.settings'),
          headerTitleAlign: 'center',
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}
