import { useRouter } from 'expo-router';

import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Header from '@/utils/components/Header';
import { useTheme, theme } from '@/utils/context/ThemeContext';
import { api } from '@/utils/utils/apiClient';

// Type definitions
interface PDV {
  id: number;
  pdvName: string;
  firstName: string;
  lastName: string;
  simErselli: number;
  address: string;
  contact: number;
  status: string;
  type: string;
  zoneId: number;
  latitude: number;
  longitude: number;
}

interface TaskExecution {
  id?: number;
  startedAt?: string;
  endedAt?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  note?: string;
  photos?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface Task {
  id: number;
  planningId: number;
  pdvId: number;
  assignedAt: string;
  pdv: PDV;
  execution: TaskExecution | null;
}

interface Planning {
  id: number;
  startDate: string;
  endDate: string;
  description: string;
  details: Task[];  // API returns 'details' instead of 'tasks'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function PlanningsManagementRN() {
  const [selected, setSelected] = useState<Planning | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(currentTheme.background);
      StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
    } else {
      StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
    }
  }, [isDarkMode, currentTheme.background]);

  React.useEffect(() => {
    const getData = async () => {
      try {
        const planningsRes = await api.get<Planning>('/users/planning');

        if (__DEV__) {
          console.log(
            '\n=== API Response ===\n',
            JSON.stringify(planningsRes, null, 2),
            '\n==================\n'
          );
        }

        // Use the planning response directly since it matches our interface
        const planning = {
          id: planningsRes.id,
          startDate: planningsRes.startDate,
          endDate: planningsRes.endDate,
          description: planningsRes.description,
          details: planningsRes.details || [],
        };

        setSelected(planning);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching planning:', error);
        if (
          error instanceof Error &&
          error.message.includes('Session expired')
        ) {
          router.replace('/');
        }
        setLoading(false);
      }
    };

    getData();
  }, []);

  const handleTaskPress = (task: Task) => {
    try {
      const serializedTask = JSON.stringify(task);
      // @ts-ignore: Expo Router type limitation for modal navigation
      router.push({
        pathname: '/taskdetails',
        params: { task: serializedTask },
      });
    } catch (error) {
      console.error('Error serializing task:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: currentTheme.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View
          style={[
            styles.container,
            { backgroundColor: currentTheme.background },
          ]}>
          <Header showBackButton={false} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.light.primary} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!selected) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: currentTheme.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View
          style={[
            styles.container,
            { backgroundColor: currentTheme.background },
          ]}>
          <Header showBackButton={false} />
          <View style={styles.errorContainer}>
            <Text
              style={[styles.errorText, { color: currentTheme.secondaryText }]}>
              No planning available
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: currentTheme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View
        style={[
          styles.container,
          { backgroundColor: currentTheme.background },
        ]}>
        <Header showBackButton={false} />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          <View
            style={[
              styles.detailCard,
              {
                backgroundColor: currentTheme.card,
                shadowColor: isDarkMode ? '#000' : '#000',
              },
            ]}>
            <Text style={[styles.detailTitle, { color: currentTheme.text }]}>
              Planning
            </Text>
            <Text
              style={[styles.detailDescription, { color: currentTheme.text }]}>
              {selected.description}
            </Text>
            <View style={styles.dateContainer}>
              <Text
                style={[
                  styles.dateLabel,
                  { color: currentTheme.secondaryText },
                ]}>
                Period:
              </Text>
              <Text style={[styles.dateText, { color: currentTheme.text }]}>
                {formatDate(selected.startDate)} -{' '}
                {formatDate(selected.endDate)}
              </Text>
            </View>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Tasks:
            </Text>

            <View style={styles.tasksList}>
              {selected.details
                .slice()
                .sort(
                  (a: Task, b: Task) =>
                    new Date(a.assignedAt).getTime() -
                    new Date(b.assignedAt).getTime()
                )
                .map((task: Task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={[
                      styles.taskItem,
                      { backgroundColor: currentTheme.background },
                    ]}
                    onPress={() => handleTaskPress(task)}>
                    <View style={styles.taskDot} />
                    <View style={styles.taskContent}>
                      <Text
                        style={[
                          styles.taskTitle,
                          { color: currentTheme.text },
                        ]}>
                        {task.pdv.pdvName}
                      </Text>
                      <Text
                        style={[
                          styles.taskDate,
                          { color: currentTheme.secondaryText },
                        ]}>
                        {formatDate(task.assignedAt)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            task.execution?.status === 'completed'
                              ? currentTheme.completed
                              : currentTheme.pending,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.statusText,
                          { color: isDarkMode ? '#1A1C1E' : '#FFFFFF' },
                        ]}>
                        {task.execution?.status
                          ? task.execution.status.charAt(0).toUpperCase() +
                            task.execution.status.slice(1)
                          : 'Pending'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              {selected.details.length === 0 && (
                <Text
                  style={[
                    styles.emptyTasks,
                    { color: currentTheme.secondaryText },
                  ]}>
                  No tasks available
                </Text>
              )}
            </View>
          </View>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  confirmButton: {
    backgroundColor: '#53B946',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  taskContent: {
    flex: 1,
    marginRight: 8,
  },
  taskDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  headerContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  logo: {
    width: 120,
    height: 40,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  detailDescription: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
    lineHeight: 24,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  tasksList: {
    gap: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 8,
  },
  taskDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: '#6B7280',
    marginRight: 15,
  },
  taskTitle: {
    flex: 1,
    fontSize: 20,
    color: '#374151',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyTasks: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    padding: 20,
  },
});
