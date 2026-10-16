import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Bot, Search, Calendar, BookOpen, User } from 'lucide-react-native';
import { RootTabParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { AIScreen } from '../screens/AIScreen';
import { SearchScreen } from '../screens/SearchScreen';
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
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Home size={19} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="AI"
        component={AIScreen}
        options={{
          tabBarLabel: 'Assistant',
          tabBarIcon: ({ color }) => <Bot size={19} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color }) => <Search size={19} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Planner"
        component={PlannerScreen}
        options={{
          tabBarLabel: 'Planner',
          tabBarIcon: ({ color }) => <Calendar size={19} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarLabel: 'Library',
          tabBarIcon: ({ color }) => <BookOpen size={19} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <User size={19} color={color} strokeWidth={2} />,
        }}
      />
    </Tab.Navigator>
  );
};
