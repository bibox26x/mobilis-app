import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load saved theme preference
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('isDarkMode');
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newThemeValue = !isDarkMode;
      setIsDarkMode(newThemeValue);
      await AsyncStorage.setItem('isDarkMode', JSON.stringify(newThemeValue));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export const theme = {
  light: {
    // Base colors
    background: '#FFFFFF',
    text: '#1A1C1E',
    secondaryText: '#49454F',
    card: '#F7F8F9',
    border: '#E3E5E8',

    // Action colors
    primary: '#006C45', // Main action color
    footer: '#53B946', // Footer text color
    login_text: '#53B946', // Main action color
    primaryPressed: '#005435', // Darker shade for press states
    error: '#B3261E', // Error/Delete actions
    errorPressed: '#8C1D17', // Darker error for press states
    location: '#1B4B8A', // Location/Navigation actions
    locationPressed: '#153B6E', // Darker location for press states

    // Status colors
    success: '#006C45', // Success states
    warning: '#E5B800', // Warning states
    info: '#1B4B8A', // Info states
    completed: '#4CAF50', // Completed tasks - A fresh green color
    pending: '#FF9800', // Pending tasks - A warm orange color

    // Shadow colors (more subtle)
    shadowPrimary: 'rgba(0, 0, 0, 0.1)',
    shadowError: 'rgba(0, 0, 0, 0.1)',
    shadowLocation: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    // Base colors
    background: '#1A1C1E',
    text: '#F2F2F3',
    secondaryText: '#C4C7C5',
    card: '#2D3135',
    border: '#404347',

    // Action colors
    primary: '#7FD1AE', // Light green for dark mode
    login_text: '#53B946', // Main action color
    primaryPressed: '#66A78B', // Darker shade for press
    error: '#FFB4AB', // Light red for dark mode
    errorPressed: '#E5A299', // Darker error for press
    location: '#9EB9E9', // Light blue for dark mode
    locationPressed: '#839BC4', // Darker location for press

    // Status colors
    success: '#7FD1AE', // Success states
    warning: '#FFD789', // Warning states
    info: '#9EB9E9', // Info states
    completed: '#81C784', // Completed tasks - A softer green for dark mode
    pending: '#FFB74D', // Pending tasks - A softer orange for dark mode

    // Shadow colors (more subtle)
    shadowPrimary: 'rgba(0, 0, 0, 0.2)',
    shadowError: 'rgba(0, 0, 0, 0.2)',
    shadowLocation: 'rgba(0, 0, 0, 0.2)',
  },
};

export default ThemeProvider;
