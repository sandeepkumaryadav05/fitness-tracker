// SplashScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
  const navigation = useNavigation();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      })
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('MainDrawer'); // Navigate to Home
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#000000', '#00ff66']}
      style={styles.container}
    >
      <Animated.Image
        source={require('../assets/fitness-logo.png')} // Your logo here
        style={[styles.logo, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
        resizeMode="contain"
      />
      <Animated.Text style={[styles.text, { opacity: fadeAnim }]}>
        Your Progress, Your Arc.
      </Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 20,
  },
  text: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
