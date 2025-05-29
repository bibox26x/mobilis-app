import { Stack } from 'expo-router';
import ThemeProvider from './context/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            // Login screen with fade animation
            headerShown: false,
            animation: 'fade',
            presentation: 'card',
            animationDuration: 100,
            gestureEnabled: false,
          }}
        />

        {/* Modal style routes (settings) */}
        <Stack.Screen
          name="home/settings"
          options={{
            headerShown: false,
            animation: 'fade',
            presentation: 'card',
            animationDuration: 100,
            gestureEnabled: false,
            animationTypeForReplace: 'pop',
          }}
        />

        {/* Slide animation routes (main app flow) */}
        <Stack.Screen
          name="home/taskdetails"
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
            presentation: 'modal',
            animationDuration: 200,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            animationTypeForReplace: 'push',
          }}
        />

        {/* Default route */}
        <Stack.Screen
          name="home/mainpage"
          options={{
            headerShown: false,
            animation: 'fade',
            presentation: 'card',
            animationDuration: 100,
            gestureEnabled: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
