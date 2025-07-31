import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState('Guest');
  const [age, setAge] = useState(null);
  const [height, setHeight] = useState(null); // in cm
  const [weight, setWeight] = useState(null); // in kg
  const [gender, setGender] = useState('Other');

  useEffect(() => {
    const loadUsername = async () => {
      try {
        const storedName = await AsyncStorage.getItem('username');
        if (storedName) {
          setUsername(storedName);
        }
      } catch (err) {
        console.error('Failed to load username from storage:', err);
      }
    };

    loadUsername();
  }, []);

  return (
    <UserContext.Provider
      value={{
        username,
        setUsername,
        age,
        setAge,
        height,
        setHeight,
        weight,
        setWeight,
        gender,
        setGender,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
