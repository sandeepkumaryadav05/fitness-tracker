import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  TextInput, FlatList, Alert, ToastAndroid, Animated
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../ThemeContext';

const workoutTypes = [
  { label: '🏃 Running', value: 'Running', caloriesPerMin: 10 },
  { label: '🏋️ Bench Press', value: 'Bench Press', caloriesPerMin: 6 },
  { label: '🧘 Yoga', value: 'Yoga', caloriesPerMin: 4 },
  { label: '🤸 Jump Rope', value: 'Jump Rope', caloriesPerMin: 12 },
  { label: '🦵 Squats', value: 'Squats', caloriesPerMin: 8 },
  { label: '🚴 Cycling', value: 'Cycling', caloriesPerMin: 9 },
  { label: '🏊 Swimming', value: 'Swimming', caloriesPerMin: 11 },
  { label: '🧍 Plank', value: 'Plank', caloriesPerMin: 5 },
  { label: '🧎 Lunges', value: 'Lunges', caloriesPerMin: 7 },
  { label: '🥊 Boxing', value: 'Boxing', caloriesPerMin: 13 },
];

export default function WorkoutScreen() {
  const { darkMode } = useContext(ThemeContext);
  const [selectedWorkout, setSelectedWorkout] = useState('Running');
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(0);
  const [goal, setGoal] = useState(30); // in minutes
  const [modalVisible, setModalVisible] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [history, setHistory] = useState([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    loadData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();
  }, []);

  useEffect(() => {
    saveData();
  }, [history, goal]);

  const startTimer = () => {
    setIsRunning(true);
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);

    const caloriesPerMin = workoutTypes.find(w => w.value === selectedWorkout)?.caloriesPerMin || 0;
    const calories = ((duration / 60) * caloriesPerMin).toFixed(2);
    const entry = {
      id: Date.now().toString(),
      type: selectedWorkout,
      duration,
      calories,
      date: new Date().toLocaleDateString('en-IN'),
    };

    const updatedHistory = [entry, ...history];
    setHistory(updatedHistory);
    setDuration(0);

    ToastAndroid.show(`🎉 Hooray! You burned ${calories} cal!`, ToastAndroid.SHORT);
  };

  const saveData = async () => {
    await AsyncStorage.setItem('workoutHistory', JSON.stringify(history));
    await AsyncStorage.setItem('workoutGoal', goal.toString());
  };

  const loadData = async () => {
    const stored = await AsyncStorage.getItem('workoutHistory');
    const storedGoal = await AsyncStorage.getItem('workoutGoal');
    if (stored) setHistory(JSON.parse(stored));
    if (storedGoal) setGoal(parseInt(storedGoal));
  };

  const deleteEntry = (id) => {
    setHistory(history.filter(e => e.id !== id));
  };

  const handleGoalSave = () => {
    const g = parseInt(newGoal);
    if (!isNaN(g) && g > 0) {
      setGoal(g);
      setModalVisible(false);
      setNewGoal('');
    } else {
      Alert.alert('Invalid goal', 'Please enter a valid number.');
    }
  };

  const selectedLabel = workoutTypes.find(w => w.value === selectedWorkout)?.label || selectedWorkout;

  return (
    <Animated.View style={[styles.container, darkMode && styles.darkContainer, { opacity: fadeAnim }]}>
      <Text style={[styles.title, darkMode && styles.darkText]}>🏋️‍♂️ Workout Tracker</Text>
      <Text style={[styles.sub, darkMode && styles.darkText]}>Goal: {goal} mins</Text>

      <View style={styles.section}>
        <Text style={[styles.label, darkMode && styles.darkText]}>Select Exercise:</Text>
        <View style={[styles.pickerWrapper, darkMode && styles.darkPickerWrapper]}>
          <Picker
            selectedValue={selectedWorkout}
            onValueChange={setSelectedWorkout}
            style={[styles.picker, darkMode && styles.darkPicker]}
            mode="dropdown"
          >
            {workoutTypes.map(({ label, value }) => (
              <Picker.Item label={label} value={value} key={value} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.ringContainer}>
        <AnimatedCircularProgress
          size={160}
          width={14}
          fill={(duration / (goal * 60)) * 100}
          tintColor="#ff9800"
          backgroundColor="#ccc"
          duration={800}
        >
          {() => (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="fitness" size={30} color="#ff9800" />
              <Text style={styles.ringText}>{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')} min</Text>
              <Text style={styles.subSmall}>{selectedLabel}</Text>
            </View>
          )}
        </AnimatedCircularProgress>
      </View>

      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: isRunning ? '#f44336' : '#4caf50' }]}
          onPress={isRunning ? stopTimer : startTimer}
        >
          <Text style={styles.btnText}>{isRunning ? 'Stop' : 'Start'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#2196f3' }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.btnText}>🎯 Set Goal</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.historyTitle, darkMode && styles.darkText]}>📜 Workout History</Text>
      <FlatList
        data={history}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.entry, darkMode && styles.darkEntry]}>
            <Text style={[styles.entryText, darkMode && styles.darkText]}>
              {item.date} | {item.type} | {item.duration} sec | 🔥 {item.calories} cal
            </Text>
            <TouchableOpacity onPress={() => deleteEntry(item.id)}>
              <MaterialIcons name="delete" size={20} color="#e53935" />
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={[styles.modalBox, darkMode && styles.darkModalBox]}>
            <Text style={[styles.modalTitle, darkMode && styles.darkText]}>Set Duration Goal (in mins)</Text>
            <TextInput
              style={[styles.modalInput, darkMode && styles.darkInput]}
              placeholder="e.g., 30"
              keyboardType="numeric"
              value={newGoal}
              onChangeText={setNewGoal}
              placeholderTextColor={darkMode ? '#ccc' : '#888'}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleGoalSave}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff7f0' },
  darkContainer: { backgroundColor: '#121212' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#222' },
  sub: { fontSize: 16, textAlign: 'center', color: '#555', marginBottom: 16 },
  darkText: { color: '#eee' },
  subSmall: { fontSize: 13, color: '#777' },
  section: { marginBottom: 10 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 10,
    overflow: 'hidden',
    minHeight: 50,
    justifyContent: 'center',
  },
  darkPickerWrapper: {
    borderColor: '#777',
  },
  picker: { height: 50, width: '100%', color: '#000', fontSize: 16 },
  darkPicker: { color: '#fff' },
  ringContainer: { alignItems: 'center', marginVertical: 20 },
  ringText: { fontSize: 22, fontWeight: 'bold', color: '#ff9800' },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: {
    flex: 1,
    padding: 14,
    margin: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: 'bold' },
  historyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#444' },
  entry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff3e0',
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
  },
  darkEntry: { backgroundColor: '#1e1e1e' },
  entryText: { color: '#333', fontSize: 15 },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  darkModalBox: {
    backgroundColor: '#1e1e1e',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 16,
    color: '#000',
  },
  darkInput: {
    borderColor: '#666',
    color: '#fff',
  },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelText: { color: '#f44336', fontWeight: 'bold', fontSize: 16 },
  saveText: { color: '#4caf50', fontWeight: 'bold', fontSize: 16 },
});
