import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../ThemeContext';
import { UserContext } from '../context/UserContext';

export default function ProfileScreen() {
  const { darkMode } = useContext(ThemeContext);
  const { username, setUsername } = useContext(UserContext);

  const [newName, setNewName] = useState(username);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [gender, setGender] = useState('Male');
  const [useMetric, setUseMetric] = useState(true);
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateBMI();
  }, [height, weight, useMetric]);

  const calculateBMI = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w) {
      setBmi(null);
      setBmiCategory('');
      return;
    }
    let bmiCalc = 0;
    if (useMetric) {
      const heightInMeters = h / 100;
      bmiCalc = w / (heightInMeters * heightInMeters);
    } else {
      bmiCalc = (703 * w) / (h * h);
    }
    const result = bmiCalc.toFixed(1);
    setBmi(result);
    setBmiCategory(getBMICategory(bmiCalc));
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const handleSave = async () => {
  if (newName.trim()) {
    setUsername(newName);
    const profile = {
      username: newName,
      age,
      height,
      weight,
      goalWeight,
      gender,
      useMetric
    };
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      await AsyncStorage.setItem('username', newName);  // ✅ Add this line
      Alert.alert('Profile Saved', 'Your profile has been updated.');
    } catch (err) {
      Alert.alert('Error', 'Failed to save profile.');
    }
  }
  };


  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem('userProfile');
      if (stored) {
        const profile = JSON.parse(stored);
        setNewName(profile.username);
        setAge(profile.age);
        setHeight(profile.height);
        setWeight(profile.weight);
        setGoalWeight(profile.goalWeight);
        setGender(profile.gender);
        setUseMetric(profile.useMetric);
      }
    } catch (err) {
      console.error('Failed to load user profile', err);
    }
  };

  const styles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: darkMode ? '#121212' : '#f9f9f9',
      flex: 1,
    },
    label: {
      fontSize: 16,
      marginBottom: 6,
      color: darkMode ? '#eee' : '#333',
    },
    input: {
      borderColor: darkMode ? '#555' : '#ccc',
      borderWidth: 1,
      padding: 10,
      marginBottom: 16,
      borderRadius: 8,
      color: darkMode ? '#fff' : '#000',
      backgroundColor: darkMode ? '#1e1e1e' : '#fff',
    },
    pickerWrapper: {
      borderWidth: 1,
      borderColor: darkMode ? '#555' : '#ccc',
      borderRadius: 8,
      marginBottom: 16,
      backgroundColor: darkMode ? '#1e1e1e' : '#fff',
    },
    picker: {
      color: darkMode ? '#fff' : '#000',
      height: 48,
    },
    unitToggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    bmiResult: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      color: darkMode ? '#bb86fc' : '#673ab7',
    },
    saveBtn: {
      backgroundColor: '#4caf50',
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    saveText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Username:</Text>
      <TextInput
        style={styles.input}
        value={newName}
        onChangeText={setNewName}
        placeholder="Enter name"
        placeholderTextColor={darkMode ? '#aaa' : '#888'}
      />

      <Text style={styles.label}>Age:</Text>
      <TextInput
        style={styles.input}
        value={age}
        onChangeText={setAge}
        placeholder="e.g., 25"
        keyboardType="numeric"
        placeholderTextColor={darkMode ? '#aaa' : '#888'}
      />

      <Text style={styles.label}>Height ({useMetric ? 'cm' : 'inch'}):</Text>
      <TextInput
        style={styles.input}
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
        placeholder={useMetric ? 'e.g., 170' : 'e.g., 67'}
        placeholderTextColor={darkMode ? '#aaa' : '#888'}
      />

      <Text style={styles.label}>Weight ({useMetric ? 'kg' : 'lbs'}):</Text>
      <TextInput
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        placeholder={useMetric ? 'e.g., 65' : 'e.g., 143'}
        placeholderTextColor={darkMode ? '#aaa' : '#888'}
      />

      <Text style={styles.label}>Goal Weight ({useMetric ? 'kg' : 'lbs'}):</Text>
      <TextInput
        style={styles.input}
        value={goalWeight}
        onChangeText={setGoalWeight}
        keyboardType="numeric"
        placeholder={useMetric ? 'e.g., 60' : 'e.g., 132'}
        placeholderTextColor={darkMode ? '#aaa' : '#888'}
      />

      <Text style={styles.label}>Gender:</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={gender}
          onValueChange={(value) => setGender(value)}
          style={styles.picker}
          mode="dropdown"
        >
          <Picker.Item label="Male" value="Male" />
          <Picker.Item label="Female" value="Female" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>

      <View style={styles.unitToggleRow}>
        <Text style={styles.label}>Use Metric Units</Text>
        <Switch
          value={useMetric}
          onValueChange={() => setUseMetric(prev => !prev)}
          thumbColor={useMetric ? '#4caf50' : '#ccc'}
        />
      </View>

      {bmi && (
        <Text style={styles.bmiResult}>Your BMI: {bmi} ({bmiCategory})</Text>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Save Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}