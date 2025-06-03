import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ImageCache } from '@/utils/components/ImageCache';
import { useRouter } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from '@/utils/components/Header';
import { useTheme, theme } from '@/utils/context/ThemeContext';
import { api } from '@/utils/utils/apiClient';

interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  structureId: number;
  structure: {
    id: number;
    name: string;
    type: string;
    parentId: number;
  };
  roles: string[];
}

export default function Settings() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserData | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('No user ID found');
      }

      const userData = await api.get<UserData>(`/users/${userId}`);
      setUserInfo(userData);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch user data'
      );
      if (err instanceof Error && err.message.includes('Session expired')) {
        router.replace('/');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUserData();
    // Cleanup logic could be added here if needed
  }, [fetchUserData]);

  const handleLogout = async () => {
    try {
      // Clear all tokens and credentials
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('savedToken');
      await AsyncStorage.removeItem('rememberedEmail');
      await AsyncStorage.removeItem('rememberMe');
      await AsyncStorage.removeItem('userId');

      // Force navigation back to login
      router.replace('/');
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  const renderAccountCard = () => {
    if (isLoading) {
      return (
        <View style={[styles.card, { backgroundColor: currentTheme.card }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.light.primary} />
          </View>
        </View>
      );
    }

    if (error || !userInfo) {
      return (
        <View style={[styles.card, { backgroundColor: currentTheme.card }]}>
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: currentTheme.error }]}>
              {error || 'Failed to load user data'}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchUserData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.card, { backgroundColor: currentTheme.card }]}>
        <View style={styles.accountInfo}>
          <View style={styles.avatarContainer}>
            <ImageCache
              style={styles.avatar}
              source={require('../../assets/images/user-pic.jpg')}
              resizeMode="cover"
            />
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.userName, { color: currentTheme.text }]}>
              {userInfo.firstName} {userInfo.lastName}
            </Text>
            <Text
              style={[styles.userEmail, { color: currentTheme.secondaryText }]}>
              {userInfo.email}
            </Text>
            <View style={styles.badgeContainer}>
              <View
                style={[
                  styles.roleBadge,
                  { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' },
                ]}>
                <Text style={[styles.roleText, { color: currentTheme.text }]}>
                  {userInfo.roles[0]}
                </Text>
              </View>
              <View
                style={[
                  styles.structureBadge,
                  { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' },
                ]}>
                <Text style={[styles.roleText, { color: currentTheme.text }]}>
                  {userInfo.structure.name}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: currentTheme.background }]}>
      <View
        style={[
          styles.container,
          { backgroundColor: currentTheme.background },
        ]}>
        <Header showBackButton={false} />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.title, { color: currentTheme.text }]}>
            Settings
          </Text>

          {renderAccountCard()}

          {/* App Settings Card */}
          <View style={[styles.card, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              App Settings
            </Text>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Text
                  style={[styles.settingLabel, { color: currentTheme.text }]}>
                  Dark Mode
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: currentTheme.secondaryText },
                  ]}>
                  Switch to dark theme
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  isDarkMode && styles.toggleButtonActive,
                ]}
                onPress={toggleTheme}>
                <View
                  style={[
                    styles.toggleKnob,
                    isDarkMode && styles.toggleKnobActive,
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  toggleButton: {
    width: 51,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    padding: 2,
  },
  toggleButtonActive: {
    backgroundColor: '#53B946',
  },
  toggleKnob: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    paddingVertical: 12,
  },
  avatarContainer: {
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  structureBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#53B946',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
