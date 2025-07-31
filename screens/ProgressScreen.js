import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const AchievementCard = ({ title, icon, unlocked }) => (
  <Animated.View style={[styles.achievementCard, { opacity: unlocked ? 1 : 0.4 }]}>
    {icon}
    <Text style={styles.achievementText}>{title}</Text>
  </Animated.View>
);

export default function ProgressScreen() {
  const [calories, setCalories] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [cycling, setCycling] = useState(0);
  const [cyclingGoal, setCyclingGoal] = useState(10);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [workoutGoal, setWorkoutGoal] = useState(30);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const calorieData = await AsyncStorage.getItem('calorieEntries');
          const calorieG = await AsyncStorage.getItem('calorieGoal');
          const cyclingData = await AsyncStorage.getItem('cyclingEntries');
          const cyclingG = await AsyncStorage.getItem('cyclingGoal');
          const workoutData = await AsyncStorage.getItem('workoutHistory');
          const workoutG = await AsyncStorage.getItem('workoutGoal');

          if (calorieData) {
            const entries = JSON.parse(calorieData);
            const total = entries.reduce((sum, e) => sum + e.amount, 0);
            setCalories(total);
          }
          if (calorieG) setCalorieGoal(parseInt(calorieG));

          if (cyclingData) {
            const entries = JSON.parse(cyclingData);
            const total = entries.reduce((sum, e) => sum + e.distance, 0);
            setCycling(total);
          }
          if (cyclingG) setCyclingGoal(parseFloat(cyclingG));

          if (workoutData) {
            const entries = JSON.parse(workoutData);
            const totalDuration = entries.reduce((sum, e) => sum + e.duration, 0);
            setWorkoutDuration(Math.floor(totalDuration / 60));
          }
          if (workoutG) setWorkoutGoal(parseInt(workoutG));
        } catch (err) {
          console.log('Failed to load progress data:', err);
        }
      };

      loadData();
    }, [])
  );

  const progressRing = (label, value, goal, color, icon) => (
    <View style={styles.ringContainer}>
      <AnimatedCircularProgress
        size={140}
        width={14}
        fill={(value / goal) * 100}
        tintColor={color}
        backgroundColor="#ddd"
        duration={1000}
      >
        {() => (
          <View style={{ alignItems: 'center' }}>
            {icon}
            <Text style={styles.ringValue}>{value} / {goal}</Text>
            <Text style={styles.ringLabel}>{label}</Text>
          </View>
        )}
      </AnimatedCircularProgress>
    </View>
  );

  const achievements = [
    {
      title: '500 kcal in a Day',
      unlocked: calories >= 500,
      icon: <FontAwesome5 name="fire" size={30} color="#f44336" />,
      category: '🔥 Calories Achievements'
    },
    {
      title: '10 km Cycling',
      unlocked: cycling >= 10,
      icon: <MaterialCommunityIcons name="bike" size={30} color="#03a9f4" />,
      category: '🔥 Calories Achievements'
    },
    {
      title: '15 km Ride',
      unlocked: cycling >= 15,
      icon: <MaterialCommunityIcons name="bike-fast" size={30} color="#0288d1" />,
      category: '🚴 Cycling Achievements'
    },
    {
      title: '30 Min Workout',
      unlocked: workoutDuration >= 30,
      icon: <Ionicons name="barbell-outline" size={30} color="#4caf50" />,
      category: '🏋️‍♂️ Workout Achievements'
    },
    {
      title: 'Active 3 Days',
      unlocked: calories > 0 && cycling > 0 && workoutDuration > 0,
      icon: <Ionicons name="trophy-outline" size={30} color="#ff9800" />,
      category: '⭐ Combo Achievements'
    },
  ];

  const groupedAchievements = achievements.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>📊 Weekly Summary</Text>

      <View style={styles.ringsRow}>
        {progressRing('Calories (kcal)', calories.toFixed(0), calorieGoal, '#f44336', <FontAwesome5 name="fire" size={24} color="#f44336" />)}
        {progressRing('Cycling (km)', cycling.toFixed(1), cyclingGoal, '#03a9f4', <MaterialCommunityIcons name="bike" size={24} color="#03a9f4" />)}
        {progressRing('Workout (min)', workoutDuration, workoutGoal, '#4caf50', <Ionicons name="barbell-outline" size={24} color="#4caf50" />)}
      </View>

      <Text style={styles.sectionTitle}>🏆 Achievements</Text>
      {Object.keys(groupedAchievements).map((category, idx) => (
        <View key={idx}>
          <Text style={styles.categoryHeader}>{category}</Text>
          <View style={styles.achievementWrapper}>
            {groupedAchievements[category].map((achieve, index) => (
              <AchievementCard
                key={index}
                title={achieve.title}
                icon={achieve.icon}
                unlocked={achieve.unlocked}
              />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  ringContainer: {
    width: '32%',
    alignItems: 'center',
    marginBottom: 10,
  },
  ringValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  ringLabel: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
  },
  achievementWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  achievementCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    width: '45%',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
  },
  achievementText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#444',
    fontWeight: '600',
  },
  categoryHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginVertical: 8,
  },
});
