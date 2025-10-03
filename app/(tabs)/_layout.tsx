import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

const THEME = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#E0E0E0',
  primary: '#BB86FC',
  placeholder: '#6E6E6E',
};

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
          tabBarIcon: ({ color }) => <FontAwesome5 name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Progression',
          tabBarIcon: ({ color }) => <FontAwesome5 name="chart-line" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

