import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { RootTabParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { AIScreen } from '../screens/AIScreen';
import { PlannerScreen } from '../screens/PlannerScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useThemeStore } from '../store/useThemeStore';

const Tab = createBottomTabNavigator<RootTabParamList>();

export const BottomTabs: React.FC = () => {
  const { colors } = useThemeStore();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="AI"
        component={AIScreen}
        options={{
          tabBarLabel: 'AI Brain',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🤖</Text>,
        }}
      />
      <Tab.Screen
        name="Planner"
        component={PlannerScreen}
        options={{
          tabBarLabel: 'Planner',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>📅</Text>,
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarLabel: 'Library',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>📚</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};
