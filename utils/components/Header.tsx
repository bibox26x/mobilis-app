import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ImageCache } from '@/utils/components/ImageCache';
import { useTheme, theme } from '@/utils/context/ThemeContext';

type HeaderProps = {
  showBackButton?: boolean;
  onBackPress?: () => void;
};

export default function Header({ showBackButton = true, onBackPress }: HeaderProps) {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  return (
    <View
      style={[
        styles.headerContainer,
        {
          backgroundColor: currentTheme.background,
          borderBottomColor: currentTheme.border,
        },
      ]}>
      <SafeAreaView>
        <View
          style={[styles.header, { backgroundColor: currentTheme.background }]}>
          {showBackButton ? (
            <TouchableOpacity
              onPress={onBackPress || (() => router.back())}
              style={styles.headerBackButton}>
              <Text
                style={[
                  styles.headerBackButtonText,
                  { color: currentTheme.text },
                ]}>
                {'<'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 32 }} />
          )}
          <ImageCache
            source={require('../../assets/images/mobilis-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={{ width: 32 }} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    height: 60,
  },
  headerBackButton: {
    padding: 8,
  },
  headerBackButtonText: {
    fontSize: 24,
    fontWeight: '600',
  },
  logo: {
    width: 120,
    height: 40,
  },
});
