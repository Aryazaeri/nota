import { Tabs } from 'expo-router';
import React from 'react';
import { View, useWindowDimensions } from 'react-native';

import { ResponsiveTabBar } from '@/components/navigation/ResponsiveTabBar';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  return (
    <View style={{ flex: 1, flexDirection: isDesktop ? 'row' : 'column' }}>
      <Tabs
        tabBar={(props) => <ResponsiveTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Generate',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="sparkles" color={color} />,
          }}
        />
        <Tabs.Screen
          name="decks"
          options={{
            title: 'Decks',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="rectangle.stack.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.fill" color={color} />,
          }}
        />
        <Tabs.Screen name="explore" options={{ href: null }} />
      </Tabs>
    </View>
  );
}
