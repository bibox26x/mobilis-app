import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import ThemeProvider from '../utils/context/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 200,
        }}
      >
        <Stack.Screen name="index" />
        
        {/* Home group */}
        <Stack.Screen 
          name="home" 
          options={{
            headerShown: false,
          }}
        />

        {/* Modal screen */}
        <Stack.Screen
          name="taskdetails"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            animationDuration: 300,
            gestureEnabled: true,
            headerShown: false,
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
