import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../ThemeContext'; // Adjust the path if needed

export default function SettingsScreen() {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const navigation = useNavigation();

  const confirmReset = () => {
    Alert.alert(
      'Reset All Data?',
      'This will clear all progress, goals, and preferences. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Reset',
          style: 'destructive',
          onPress: resetAllData,
        },
      ]
    );
  };

  const resetAllData = async () => {
    try {
      await AsyncStorage.multiRemove([
        'calorieEntries',
        'cyclingEntries',
        'workoutHistory',
        'calorieGoal',
        'cyclingGoal',
        'workoutGoal',
        'stepGoal',
        'darkMode',
      ]);
      Alert.alert('Reset Complete', 'All data has been cleared.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home'),
        },
      ]);
    } catch (error) {
      console.error('Reset failed', error);
      Alert.alert('Error', 'Failed to reset data.');
    }
  };

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <Text style={[styles.title, darkMode && styles.darkText]}>⚙️ Settings</Text>

      <View style={[styles.card, darkMode && styles.darkCard]}>
        <Text style={[styles.label, darkMode && styles.darkText]}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={toggleTheme} />
      </View>

      <TouchableOpacity
        style={[styles.resetButton, darkMode && styles.darkResetButton]}
        onPress={confirmReset}
      >
        <Text style={styles.resetText}>Reset All Data</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  darkText: {
    color: '#eee',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: '#1e1e1e',
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  resetButton: {
    backgroundColor: '#e53935',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  darkResetButton: {
    backgroundColor: '#c62828',
  },
  resetText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
