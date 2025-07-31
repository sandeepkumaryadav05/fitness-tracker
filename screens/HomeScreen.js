import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { username } = useContext(UserContext);
  const { darkMode } = useContext(ThemeContext);

  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [stepCount, setStepCount] = useState(0);
  const [calories, setCalories] = useState(0);
  const [cyclingDistance, setCyclingDistance] = useState(0);
  const [workoutDuration, setWorkoutDuration] = useState(0);

  const glowAnim = new Animated.Value(1);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString(undefined, { day: 'numeric', month: 'long' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const calorieData = await AsyncStorage.getItem('calorieEntries');
        const cyclingData = await AsyncStorage.getItem('cyclingEntries');
        const workoutData = await AsyncStorage.getItem('workoutHistory');
        const stepData = await AsyncStorage.getItem('stepCount');

        if (calorieData) {
          const entries = JSON.parse(calorieData);
          const total = entries.reduce((sum, e) => sum + e.amount, 0);
          setCalories(total);
        }

        if (cyclingData) {
          const entries = JSON.parse(cyclingData);
          const total = entries.reduce((sum, e) => sum + e.distance, 0);
          setCyclingDistance(total);
        }

        if (workoutData) {
          const entries = JSON.parse(workoutData);
          const totalDuration = entries.reduce((sum, e) => sum + e.duration, 0);
          setWorkoutDuration(Math.floor(totalDuration / 60));
        }

        if (stepData) {
          setStepCount(parseInt(stepData));
        }
      } catch (err) {
        console.log('Failed to load home screen data:', err);
      }
    };

    const unsubscribe = navigation.addListener('focus', fetchData);
    fetchData();
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleGoogleFitSync = () => {
    Alert.alert("Google Fit", "Data synced successfully!");
  };

  return (
    <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.Text style={[styles.appName  ]}>
          ActiveArc
        </Animated.Text>

        <View style={styles.topRow}>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.greeting}>👋 Welcome back, {username}</Text>
            <Text style={styles.time}>{currentDate} | {currentTime}</Text>
          </View>
        </View>

        <View style={styles.cardsRow}>
          <Card
            icon={<Ionicons name="walk" size={30} color="#4caf50" />}
            label="Steps"
            value={stepCount}
            fill={(stepCount / 10000) * 100}
            tintColor="#4caf50"
          />
          <Card
            icon={<FontAwesome5 name="fire" size={30} color="#ff9800" />}
            label="Calories"
            value={`${calories} kcal`}
            fill={(calories / 2000) * 100}
            tintColor="#ff9800"
            onPress={() => navigation.navigate('CalorieTracker')}
          />
        </View>

        <View style={styles.cardsRow}>
          <Card
            icon={<Ionicons name="barbell-outline" size={30} color="#4caf50" />}
            label="Workout"
            value={`${workoutDuration} min`}
            fill={(workoutDuration / 30) * 100}
            tintColor="#4caf50"
            onPress={() => navigation.navigate('Workout')}
          />
          <Card
            icon={<MaterialCommunityIcons name="bike" size={30} color="#2196f3" />}
            label="Cycling"
            value={`${cyclingDistance.toFixed(1)} km`}
            fill={(cyclingDistance / 10) * 100}
            tintColor="#2196f3"
            onPress={() => navigation.navigate('CyclingTracker')}
          />
        </View>

        <TouchableOpacity style={styles.syncButton} onPress={handleGoogleFitSync}>
          <MaterialCommunityIcons name="google-fit" size={20} color="white" />
          <Text style={styles.syncButtonText}>Sync with Google Fit</Text>
        </TouchableOpacity>

        <Text style={styles.quote}>💪 Let’s have a fit day ahead!</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const Card = ({ icon, label, value, fill, tintColor, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <AnimatedCircularProgress
      size={100}
      width={10}
      fill={fill}
      tintColor={tintColor}
      backgroundColor="#eee"
    >
      {() => icon}
    </AnimatedCircularProgress>
    <Text style={styles.cardLabel}>{label}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 100,
  },
  appName: {
    fontfamily:'orbitron',
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
    letterSpacing: 2,
},

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  time: {
    fontSize: 14,
    color: '#ddd',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 5,
  },
  cardLabel: {
    fontSize: 16,
    marginTop: 8,
    color: '#333',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#db4437',
    padding: 12,
    borderRadius: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  syncButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  quote: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
});
