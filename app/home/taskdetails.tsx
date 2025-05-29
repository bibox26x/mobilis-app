import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '@/app/components/Header';
import { useTheme, theme } from '@/app/context/ThemeContext';
import { api } from '@/app/utils/apiClient';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function TaskDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Parse the task parameter
  const task = (() => {
    try {
      if (typeof params.task === 'string') {
        return JSON.parse(params.task);
      }
      if (params.task && typeof params.task === 'object') {
        return params.task;
      }
      throw new Error('Invalid task data');
    } catch (e) {
      console.error('Error parsing task:', e);
      router.replace('/home/mainpage');
      return null;
    }
  })();

  const [confirmed, setConfirmed] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reported, setReported] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!task || !task.pdv) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: currentTheme.background }}>
        <View style={{ flex: 1 }}>
          <Header showBackButton={true} />
          <View style={styles.errorContainer}>
            <Text
              style={[styles.errorText, { color: currentTheme.secondaryText }]}>
              Invalid task data
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      let token = await AsyncStorage.getItem('token');
      const savedToken = await AsyncStorage.getItem('savedToken');
      const userId = await AsyncStorage.getItem('userId');

      if (!token && savedToken) {
        token = savedToken;
        await AsyncStorage.setItem('token', savedToken);
      }

      if (!token || !userId) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [{ text: 'OK', onPress: () => router.replace('/') }]
        );
        return;
      }
      const executionData = {
        detailId: task.id,
        visitDate: new Date().toISOString(),
        status: 'completed',
        tasks: 'sold some cocacola made by @bibox26',
        userId: parseInt(userId, 10),
        detail: task,
      };

      // Use the api.post helper to ensure POST is always used
      let result;
      try {
        result = await api.post('/plannings/executions', executionData);
      } catch (err: any) {
        if (err.status === 401) {
          // Session expired, handle as before
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please log in again.',
            [{ text: 'OK', onPress: () => router.replace('/') }]
          );
          return;
        }
        throw err;
      }

      setConfirmed(true);
      setModalVisible(false);
      Alert.alert('Success', 'Task has been successfully marked as completed');
      setTimeout(() => {
        router.replace('/home/mainpage');
      }, 1500);
    } catch (error) {
      console.error('Error submitting execution:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to submit task execution';
      Alert.alert(
        'Error',
        errorMessage +
          '\nPlease try again or contact support if the issue persists.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SafeAreaView
        style={[{ flex: 1 }, { backgroundColor: currentTheme.background }]}>
        <View style={{ flex: 1 }}>
          <Header showBackButton={true} />
          <ScrollView
            style={[{ flex: 1 }, { backgroundColor: currentTheme.background }]}
            contentContainerStyle={[
              styles.container,
              { backgroundColor: currentTheme.background },
            ]}>
            {/* Task Status Badge */}
            <View
              style={[
                styles.statusBadgeContainer,
                {
                  backgroundColor:
                    task.execution?.status === 'completed'
                      ? currentTheme.completed
                      : currentTheme.pending,
                  shadowColor: isDarkMode
                    ? 'rgba(0, 0, 0, 0.3)'
                    : 'rgba(0, 0, 0, 0.1)',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 4,
                  elevation: 3,
                },
              ]}>
              <Text
                style={[
                  styles.statusBadgeText,
                  {
                    color: isDarkMode ? '#1A1C1E' : '#FFFFFF',
                  },
                ]}>
                {task.execution?.status === 'completed'
                  ? 'COMPLETED'
                  : 'PENDING'}
              </Text>
            </View>

            {/* PDV Info Card */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: currentTheme.card,
                  shadowColor: isDarkMode
                    ? 'rgba(0, 0, 0, 0.5)'
                    : 'rgba(0, 0, 0, 0.1)',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 1,
                  shadowRadius: 8,
                  elevation: 5,
                },
              ]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.pdvName, { color: currentTheme.text }]}>
                  {task.pdv.pdvName}
                </Text>
                <Text
                  style={[
                    styles.pdvAddress,
                    { color: currentTheme.secondaryText },
                  ]}>
                  {task.pdv.address}
                </Text>
              </View>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: currentTheme.border },
                ]}
              />
              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Text
                    style={[
                      styles.infoLabel,
                      { color: currentTheme.secondaryText },
                    ]}>
                    Contact
                  </Text>
                  <Text
                    style={[styles.infoValue, { color: currentTheme.text }]}>
                    {task.pdv.contact}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text
                    style={[
                      styles.infoLabel,
                      { color: currentTheme.secondaryText },
                    ]}>
                    Status
                  </Text>
                  <Text
                    style={[styles.infoValue, { color: currentTheme.text }]}>
                    {task.pdv.status
                      ? task.pdv.status.charAt(0).toUpperCase() +
                        task.pdv.status.slice(1)
                      : ''}
                  </Text>
                </View>
              </View>
            </View>

            {/* Execution Info Card */}
            {task.execution?.status === 'completed' && (
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: currentTheme.card,
                    shadowColor: isDarkMode
                      ? 'rgba(0, 0, 0, 0.5)'
                      : 'rgba(0, 0, 0, 0.1)',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 1,
                    shadowRadius: 8,
                    elevation: 5,
                  },
                ]}>
                <View style={styles.cardHeader}>
                  <Text
                    style={[styles.sectionTitle, { color: currentTheme.text }]}>
                    Visit Information
                  </Text>
                </View>
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: currentTheme.border },
                  ]}
                />
                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: currentTheme.secondaryText },
                      ]}>
                      Salesperson
                    </Text>
                    <Text
                      style={[styles.infoValue, { color: currentTheme.text }]}>
                      {`${task.execution.commercial.user.firstName} ${task.execution.commercial.user.lastName}`}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: currentTheme.secondaryText },
                      ]}>
                      Visit Date
                    </Text>
                    <Text
                      style={[styles.infoValue, { color: currentTheme.text }]}>
                      {task.execution.visitDate
                        ? formatDate(task.execution.visitDate)
                        : 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            {task.execution?.status !== 'completed' &&
              !confirmed &&
              !reported && (
                <View style={styles.actionsContainer}>
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        {
                          backgroundColor: currentTheme.primary,
                          shadowColor: currentTheme.shadowPrimary,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.8,
                          shadowRadius: 2,
                          elevation: 3,
                        },
                      ]}
                      onPress={() => setModalVisible(true)}>
                      <Text style={[styles.actionButtonText, { color: isDarkMode ? '#1A1C1E' : '#FFFFFF' }]}>
                        Confirm Visit
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        {
                          backgroundColor: currentTheme.error,
                          shadowColor: currentTheme.shadowError,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.8,
                          shadowRadius: 2,
                          elevation: 3,
                        },
                      ]}
                      onPress={() => setReportModalVisible(true)}>
                      <Text style={[styles.actionButtonText, { color: isDarkMode ? '#1A1C1E' : '#FFFFFF' }]}>
                        Report Issue
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.gotoButton,
                      {
                        backgroundColor: currentTheme.location,
                        shadowColor: currentTheme.shadowLocation,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.8,
                        shadowRadius: 2,
                        elevation: 3,
                      },
                    ]}
                    onPress={() => {
                      const latitude = task.pdv.latitude || 0;
                      const longitude = task.pdv.longitude || 0;
                      const url = `https://www.google.com/maps/place/${latitude},${longitude}`;
                      Linking.openURL(url).catch(() =>
                        Alert.alert('Error', 'Could not open Google Maps')
                      );
                    }}>
                    <Text style={[styles.gotoButtonText, { color: isDarkMode ? '#1A1C1E' : '#FFFFFF' }]}>
                      Go to Location
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* Modals */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={reportModalVisible}
        onRequestClose={() => setReportModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: currentTheme.card,
                shadowColor: isDarkMode ? '#000' : '#000',
              },
            ]}>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
              Report Task
            </Text>
            <Text
              style={[
                styles.modalSubtitle,
                { color: currentTheme.secondaryText },
              ]}>
              Explain the reason for reporting
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: currentTheme.border,
                  color: currentTheme.text,
                  backgroundColor: currentTheme.background,
                },
              ]}
              value={reportReason}
              onChangeText={setReportReason}
              placeholder="Reason for reporting"
              placeholderTextColor={currentTheme.secondaryText}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: isDarkMode ? currentTheme.card : '#F3F4F6',
                  },
                ]}
                onPress={() => setReportModalVisible(false)}>
                <Text
                  style={[
                    styles.cancelButtonText,
                    { color: currentTheme.secondaryText },
                  ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: currentTheme.error,
                    shadowColor: currentTheme.shadowError,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.8,
                    shadowRadius: 2,
                    elevation: 3,
                  },
                ]}
                onPress={() => {
                  setReported(true);
                  setReportModalVisible(false);
                }}
                disabled={!reportReason.trim()}>
                <Text
                  style={[
                    styles.confirmButtonText,
                    { color: isDarkMode ? '#1A1C1E' : '#FFFFFF' },
                  ]}>
                  Report
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: currentTheme.card,
                shadowColor: isDarkMode ? '#000' : '#000',
              },
            ]}>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
              Confirm Visit
            </Text>
            <Text
              style={[
                styles.modalSubtitle,
                { color: currentTheme.secondaryText },
              ]}>
              Are you sure you want to mark this visit as completed?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: isDarkMode ? currentTheme.card : '#F3F4F6',
                  },
                  isSubmitting && styles.buttonDisabled,
                ]}
                onPress={() => setModalVisible(false)}
                disabled={isSubmitting}>
                <Text
                  style={[
                    styles.cancelButtonText,
                    { color: currentTheme.secondaryText },
                    isSubmitting && styles.buttonDisabledText,
                  ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: currentTheme.primary,
                    shadowColor: currentTheme.shadowPrimary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.8,
                    shadowRadius: 2,
                    elevation: 3,
                  },
                  isSubmitting && styles.buttonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={isSubmitting}>
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    color={isDarkMode ? '#1A1C1E' : '#FFFFFF'}
                    size="small"
                    style={!isSubmitting && { display: 'none' }}
                  />
                  <Text
                    style={[
                      styles.confirmButtonText,
                      { color: isDarkMode ? '#1A1C1E' : '#FFFFFF' },
                      isSubmitting && styles.loadingText,
                    ]}>
                    {isSubmitting ? 'Submitting...' : 'Confirm'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  buttonDisabledText: {
    opacity: 0.6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  statusBadgeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    marginBottom: 24,
    alignSelf: 'flex-start',
    marginLeft: 4,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  cardHeader: {
    marginBottom: 20,
  },
  pdvName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  pdvAddress: {
    fontSize: 16,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    marginTop: 6,
    marginBottom: 20,
  },
  cardBody: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  actionsContainer: {
    marginTop: 32,
    gap: 16,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  reportButton: {},
  gotoButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  gotoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  confirmButton: {
    backgroundColor: '#006C45',  // Updated to new primary color
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    letterSpacing: 0.5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
