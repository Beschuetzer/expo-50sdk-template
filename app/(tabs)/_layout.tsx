import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';

import { useClientOnlyValue } from '@/components/hooks/useClientOnlyValue';
import { useColorScheme } from '@/components/hooks/useColorScheme';
import { COLORS } from '@/constants/colors';
import { Routes } from '@/constants/navigation';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name={Routes.ShoppingListScreen}
        options={{
          title: 'Shopping',
          headerTitleAlign: 'center',
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
        }}
      />
      <Tabs.Screen
        name={Routes.ScannerScreen}
        options={{
          title: 'Scanner',
          headerTitleAlign: 'center',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="barcode" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name={Routes.StoreScreen}
        options={{
          title: 'Stores',
          headerTitleAlign: 'center',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="building" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name={Routes.ItemsScreen}
        options={{
          title: 'Items',
          headerTitleAlign: 'center',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="list-alt" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name={Routes.OptionsScreen}
        options={{
          title: 'Options',
          headerTitleAlign: 'center',
          tabBarIcon: ({ color }) => <TabBarIcon name="adjust" color={color} />,
        }}
      />
    </Tabs>
  );
}
