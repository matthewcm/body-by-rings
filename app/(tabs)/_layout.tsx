import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { THEME } from '@/shared/theme/colours';


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: THEME.primary,
        tabBarInactiveTintColor: THEME.placeholder,
        tabBarStyle: {
          backgroundColor: THEME.card,
          borderTopColor: THEME.card,
        },
        headerStyle: {
          backgroundColor: THEME.background,
        },
        headerTintColor: THEME.text,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Dashboard',
          href: '/',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome5 name="home" size={24} color={color} />,

        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Progression',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome5 name="chart-line" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome5 name="flag" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile-screen"
        options={{
          title: 'User',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome5 name="user" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

