import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { ThemeContext } from '../ThemeContext';

const screenWidth = Dimensions.get('window').width;

export default function CalorieTrackerScreen() {
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [intake, setIntake] = useState('');
  const [entries, setEntries] = useState([]);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [newGoal, setNewGoal] = useState('');

  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [entries, calorieGoal]);

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('calorieEntries', JSON.stringify(entries));
      await AsyncStorage.setItem('calorieGoal', calorieGoal.toString());
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const loadData = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem('calorieEntries');
      const storedGoal = await AsyncStorage.getItem('calorieGoal');
      if (storedEntries) setEntries(JSON.parse(storedEntries));
      if (storedGoal) setCalorieGoal(parseInt(storedGoal));
    } catch (error) {
      console.error('Failed to load:', error);
    }
  };

  const addEntry = () => {
    const value = parseInt(intake);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Invalid Entry', 'Please enter a valid calorie amount.');
      return;
    }
    const newEntry = {
      id: Date.now().toString(),
      amount: value,
      date: new Date().toLocaleDateString('en-GB'),
    };
    setEntries([...entries, newEntry]);
    setIntake('');
  };

  const deleteEntry = (id) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const resetHistory = () => {
    Alert.alert('Clear History', 'Are you sure you want to clear all entries?', [
      { text: 'Cancel' },
      { text: 'Clear', onPress: () => setEntries([]), style: 'destructive' },
    ]);
  };

  const handleGoalUpdate = () => {
    const parsedGoal = parseInt(newGoal);
    if (!isNaN(parsedGoal) && parsedGoal > 0) {
      setCalorieGoal(parsedGoal);
      setGoalModalVisible(false);
      setNewGoal('');
    } else {
      Alert.alert('Invalid Input', 'Please enter a valid number.');
    }
  };

  const totalIntake = entries.reduce((sum, entry) => sum + parseInt(entry.amount), 0);
  const weeklyAverage = entries.length > 0 ? Math.round(totalIntake / entries.length) : 0;
  const remaining = Math.max(calorieGoal - totalIntake, 0);

  const validEntries = entries.filter(e => !isNaN(e.amount));

  const lineChartData = validEntries.length > 0 ? {
    labels: validEntries.map(entry => entry.date),
    datasets: [
      {
        data: validEntries.map(e => e.amount),
        strokeWidth: 2,
      },
    ],
  } : {
    labels: [''],
    datasets: [{ data: [0] }],
  };

  const Header = () => (
    <View>
      <Text style={[styles.title, darkMode && styles.darkText]}>Calorie Tracker</Text>
      <Text style={[styles.goal, darkMode && styles.darkSubtext]}>Goal: {calorieGoal} kcal</Text>

      <View style={styles.progressContainer}>
        <AnimatedCircularProgress
          size={140}
          width={12}
          fill={(totalIntake / calorieGoal) * 100}
          tintColor="#ff6f00"
          backgroundColor="#ddd"
          duration={1000}
        >
          {() => (
            <View style={styles.progressInner}>
              <FontAwesome5 name="fire" size={24} color="#ff6f00" style={{ marginBottom: 4 }} />
              <Text style={styles.calorieText}>{totalIntake} kcal</Text>
              <Text style={styles.remainingText}>Remaining: {remaining} kcal</Text>
            </View>
          )}
        </AnimatedCircularProgress>
      </View>

      {validEntries.length > 0 && (
        <LineChart
          data={lineChartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 111, 0, ${opacity})`,
            labelColor: () => '#777',
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: '#ff6f00',
            },
          }}
          bezier
          style={styles.chart}
        />
      )}

      <Text style={[styles.average, darkMode && styles.darkSubtext]}>📊 Weekly Average: {weeklyAverage} kcal</Text>

      <TextInput
        style={[styles.input, darkMode && styles.darkInput]}
        placeholder="Enter calorie intake"
        placeholderTextColor={darkMode ? '#aaa' : undefined}
        value={intake}
        onChangeText={setIntake}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.addButton} onPress={addEntry}>
        <Text style={styles.addButtonText}>Add Intake</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <FlatList
        contentContainerStyle={[styles.container, darkMode && styles.darkContainer]}
        data={entries}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={Header}
        renderItem={({ item }) => (
          <View style={[styles.entryItem, darkMode && styles.darkCard]}>
            <Text style={[styles.entryText, darkMode && styles.darkText]}>{item.amount} kcal</Text>
            <TouchableOpacity onPress={() => deleteEntry(item.id)}>
              <MaterialIcons name="delete" size={22} color="#e53935" />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <>
            <TouchableOpacity style={styles.goalButton} onPress={() => setGoalModalVisible(true)}>
              <Text style={styles.buttonText}>Change Goal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearButton} onPress={resetHistory}>
              <Text style={styles.buttonText}>Clear History</Text>
            </TouchableOpacity>
          </>
        }
      />

      {/* Custom Modal for Changing Goal */}
      <Modal visible={goalModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, darkMode && styles.darkCard]}>
            <Text style={[styles.modalTitle, darkMode && styles.darkText]}>Set New Goal</Text>
            <TextInput
              style={[styles.modalInput, darkMode && styles.darkInput]}
              placeholder="e.g. 2200"
              placeholderTextColor={darkMode ? '#aaa' : undefined}
              keyboardType="numeric"
              value={newGoal}
              onChangeText={setNewGoal}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleGoalUpdate}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setGoalModalVisible(false)}>
              <Text style={[styles.cancelText, darkMode && styles.darkSubtext]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9fb',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  darkCard: {
    backgroundColor: '#1e1e1e',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  darkText: {
    color: '#eee',
  },
  darkSubtext: {
    color: '#ccc',
  },
  goal: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
    textAlign: 'center',
  },
  progressContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  progressText: {
    alignItems: 'center',
    marginTop: 10,
  },
  progressInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  calorieText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff6f00',
  },
  remainingText: {
    fontSize: 14,
    color: '#555',
  },
  chart: {
    borderRadius: 12,
    marginBottom: 10,
  },
  average: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#777',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    color: '#000',
  },
  darkInput: {
    borderColor: '#555',
    backgroundColor: '#222',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#4caf50',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#eef3f8',
    padding: 12,
    marginVertical: 5,
    borderRadius: 8,
  },
  entryText: {
    fontSize: 16,
    color: '#333',
  },
  goalButton: {
    backgroundColor: '#2196f3',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  clearButton: {
    backgroundColor: '#e53935',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 30,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 10,
  },
});