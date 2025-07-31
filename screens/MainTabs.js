// MainTabs.js
import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Animated } from 'react-native';

import HomeScreen from './HomeScreen';
import WorkoutScreen from './WorkoutScreen';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();

function AnimatedTabBarIcon({ name, color, size, focused }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.3 : 1,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Ionicons name={name} color={color} size={size} />
    </Animated.View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Workout') iconName = 'barbell';
          else if (route.name === 'Profile') iconName = 'person-circle';

          return (
            <AnimatedTabBarIcon
              name={iconName}
              color={color}
              size={size}
              focused={focused}
            />
          );
        },
        tabBarActiveTintColor: '#4caf50',
        tabBarInactiveTintColor: '#aaa',
        tabBarShowLabel: true,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#ddd',
          elevation: 8,
          height: Platform.OS === 'ios' ? 80 : 60,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 6,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -2 },
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Workout" component={WorkoutScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
