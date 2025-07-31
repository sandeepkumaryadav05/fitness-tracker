import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';

import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import CalorieTrackerScreen from './screens/CalorieTrackerScreen';
import CyclingTrackerScreen from './screens/CyclingTrackerScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import ProgressScreen from './screens/ProgressScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProfileScreen from './screens/ProfileScreen';

import { ThemeProvider } from './ThemeContext';
import { UserProvider } from './context/UserContext';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="CalorieTracker" component={CalorieTrackerScreen} />
      <Drawer.Screen name="CyclingTracker" component={CyclingTrackerScreen} />
      <Drawer.Screen name="Workout" component={WorkoutScreen} />
      <Drawer.Screen name="Progress" component={ProgressScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}

const fetchFonts = () => {
  return Font.loadAsync({
    'Orbitron': require('./assets/fonts/Orbitron-Bold.ttf'),
    // Add more fonts here if needed
  });
};

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  if (!fontsLoaded) {
    return (
      <AppLoading 
        startAsync={fetchFonts} 
        onFinish={() => setFontsLoaded(true)} 
        onError={console.warn} 
      />
    );
  }

  return (
    <ThemeProvider>
      <UserProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="MainDrawer" component={DrawerNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </UserProvider>
    </ThemeProvider>
  );
}
