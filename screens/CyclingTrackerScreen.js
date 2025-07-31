import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Modal, Alert, Dimensions, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart } from 'react-native-chart-kit';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../ThemeContext';

const screenWidth = Dimensions.get('window').width;

export default function CyclingTrackerScreen() {
  const [entries, setEntries] = useState([]);
  const [distanceGoal, setDistanceGoal] = useState(10);
  const [input, setInput] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [entries, distanceGoal]);

  const loadData = async () => {
    const stored = await AsyncStorage.getItem('cyclingEntries');
    const goal = await AsyncStorage.getItem('cyclingGoal');
    if (stored) setEntries(JSON.parse(stored));
    if (goal) setDistanceGoal(parseFloat(goal));
  };

  const saveData = async () => {
    await AsyncStorage.setItem('cyclingEntries', JSON.stringify(entries));
    await AsyncStorage.setItem('cyclingGoal', distanceGoal.toString());
  };

  const todayDate = new Date().toLocaleDateString('en-IN');

  const addEntry = () => {
    const dist = parseFloat(input);
    if (isNaN(dist) || dist <= 0) {
      Alert.alert('Invalid input', 'Enter a valid distance in km.');
      return;
    }

    const updated = [...entries];
    const index = updated.findIndex(e => e.date === todayDate);
    if (index !== -1) {
      updated[index].distance += dist;
    } else {
      updated.push({
        id: Date.now().toString(),
        date: todayDate,
        distance: dist,
      });
    }

    setEntries(updated);
    setInput('');
  };

  const deleteEntry = (id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const clearHistory = () => {
    Alert.alert('Clear All?', 'This will remove all entries.', [
      { text: 'Cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => setEntries([]) }
    ]);
  };

  const handleGoalSave = () => {
    const g = parseFloat(newGoal);
    if (!isNaN(g) && g > 0) {
      setDistanceGoal(g);
      setModalVisible(false);
      setNewGoal('');
    } else {
      Alert.alert('Invalid', 'Enter a valid number.');
    }
  };

  const todayDistance = entries.find(e => e.date === todayDate)?.distance || 0;
  const weeklyAvg =
    entries.length > 0
      ? (entries.reduce((sum, e) => sum + e.distance, 0) / entries.length).toFixed(2)
      : 0;

  const chartData = {
    labels: entries.map(e => e.date),
    datasets: [
      {
        data: entries.map(e => e.distance),
      },
    ],
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, darkMode && styles.darkContainer]}>
      <Text style={[styles.title, darkMode && styles.darkText]}>🚴 Cycling Tracker</Text>
      <Text style={[styles.subtitle, darkMode && styles.darkText]}>Daily Goal: {distanceGoal} km</Text>

      <View style={styles.progressContainer}>
        <AnimatedCircularProgress
          size={140}
          width={14}
          fill={(todayDistance / distanceGoal) * 100}
          tintColor="#03a9f4"
          backgroundColor="#ccc"
        >
          {() => (
            <View style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons name="bike" size={28} color="#03a9f4" />
              <Text style={styles.progressText}>{todayDistance.toFixed(2)} km</Text>
              <Text style={styles.small}>Today's Distance</Text>
            </View>
          )}
        </AnimatedCircularProgress>
      </View>

      <BarChart
        data={chartData}
        width={screenWidth - 30}
        height={240}
        chartConfig={{
          backgroundColor: darkMode ? '#121212' : '#fff',
          backgroundGradientFrom: darkMode ? '#121212' : '#fff',
          backgroundGradientTo: darkMode ? '#121212' : '#fff',
          decimalPlaces: 2,
          color: () => '#03a9f4',
          labelColor: () => (darkMode ? '#eee' : '#333'),
        }}
        fromZero
        style={{ borderRadius: 12, marginBottom: 20 }}
        showValuesOnTopOfBars
        verticalLabelRotation={45}
      />

      <TextInput
        style={[styles.input, darkMode && styles.darkInput]}
        placeholder="Enter distance (km)"
        keyboardType="numeric"
        value={input}
        onChangeText={setInput}
        placeholderTextColor={darkMode ? '#ccc' : '#999'}
      />
      <TouchableOpacity style={styles.addButton} onPress={addEntry}>
        <Text style={styles.addButtonText}>Add Entry</Text>
      </TouchableOpacity>

      {entries.map(item => (
        <View key={item.id} style={[styles.entryItem, darkMode && styles.darkEntryItem]}>
          <Text style={[styles.entryText, darkMode && styles.darkText]}>{item.date}: {item.distance.toFixed(2)} km</Text>
          <TouchableOpacity onPress={() => deleteEntry(item.id)}>
            <MaterialIcons name="delete" size={22} color="#e53935" />
          </TouchableOpacity>
        </View>
      ))}

      <Text style={[styles.avgText, darkMode && styles.darkText]}>📊 Weekly Avg: {weeklyAvg} km</Text>

      <TouchableOpacity style={styles.goalButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.goalButtonText}>Change Goal</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
        <Text style={styles.clearButtonText}>Clear History</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, darkMode && styles.darkModalBox]}>
            <Text style={[styles.modalTitle, darkMode && styles.darkText]}>Set New Goal</Text>
            <TextInput
              style={[styles.modalInput, darkMode && styles.darkInput]}
              keyboardType="numeric"
              placeholder="Enter km goal"
              value={newGoal}
              onChangeText={setNewGoal}
              placeholderTextColor={darkMode ? '#ccc' : '#999'}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleGoalSave}>
                <Text style={styles.save}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f1f5f9',
    flexGrow: 1,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#222',
    marginBottom: 5,
  },
  darkText: {
    color: '#eee',
  },
  subtitle: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 15,
  },
  small: {
    fontSize: 13,
    color: '#666',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#03a9f4',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  darkInput: {
    backgroundColor: '#1e1e1e',
    borderColor: '#444',
    color: '#eee',
  },
  addButton: {
    backgroundColor: '#4caf50',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  entryItem: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    marginBottom: 6,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  darkEntryItem: {
    backgroundColor: '#263238',
  },
  entryText: {
    fontSize: 15,
    color: '#333',
  },
  avgText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    color: '#555',
  },
  goalButton: {
    backgroundColor: '#2196f3',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  goalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#f44336',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    margin: 30,
    padding: 20,
    borderRadius: 12,
    elevation: 10,
  },
  darkModalBox: {
    backgroundColor: '#1e1e1e',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancel: {
    fontSize: 16,
    color: '#e53935',
    fontWeight: 'bold',
  },
  save: {
    fontSize: 16,
    color: '#4caf50',
    fontWeight: 'bold',
  },
});
