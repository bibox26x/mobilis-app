import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useTheme, theme } from '@/app/context/ThemeContext';

type FooterProps = {
  currentRoute: 'tasks' | 'settings';
};

export default function Footer({ currentRoute }: FooterProps) {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  return (
    <View
      style={[
        styles.footer,
        {
          backgroundColor: currentTheme.background,
          borderTopColor: currentTheme.border,
        },
      ]}>
      <TouchableOpacity
        style={styles.footerButton}
        onPress={() => router.replace('/home/mainpage')}>
        <MaterialIcons
          name="assignment"
          size={20}
          color={
            currentRoute === 'tasks'
              ? theme.light.primary
              : currentTheme.secondaryText
          }
        />
        <Text
          style={[
            styles.footerButtonText,
            {
              color:
                currentRoute === 'tasks'
                  ? theme.light.primary
                  : currentTheme.secondaryText,
            },
          ]}>
          Tasks
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.footerButton}
        onPress={() => router.replace('/home/settings')}>
        <MaterialIcons
          name="settings"
          size={20}
          color={
            currentRoute === 'settings'
              ? theme.light.primary
              : currentTheme.secondaryText
          }
        />
        <Text
          style={[
            styles.footerButtonText,
            {
              color:
                currentRoute === 'settings'
                  ? theme.light.primary
                  : currentTheme.secondaryText,
            },
          ]}>
          Settings
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  footerButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 2,
  },
  footerButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});
