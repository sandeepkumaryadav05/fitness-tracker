// ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const stored = await AsyncStorage.getItem('darkMode');
      if (stored !== null) {
        setDarkMode(stored === 'true');
      } else {
        const sysTheme = Appearance.getColorScheme();
        setDarkMode(sysTheme === 'dark');
      }
    };
    loadTheme();
  }, []);

  const toggleDarkMode = async () => {
    const updated = !darkMode;
    setDarkMode(updated);
    await AsyncStorage.setItem('darkMode', updated.toString());
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme: toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
