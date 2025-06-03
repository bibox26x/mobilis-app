import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ImageCache } from '../utils/components/ImageCache';
import { useTheme, theme } from '../utils/context/ThemeContext';
import { api } from '../utils/utils/apiClient';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    // Add other user fields as needed
  };
}

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Check for saved email when component mounts
  React.useEffect(() => {
    const checkSavedCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('rememberedEmail');
        const wasRemembered = await AsyncStorage.getItem('rememberMe');
        const savedToken = await AsyncStorage.getItem('savedToken');

        if (savedEmail && wasRemembered === 'true' && savedToken) {
          setEmail(savedEmail);
          setRememberMe(true);
          // If we have a saved token, automatically redirect to mainpage
          router.replace('/home/mainpage');
        }
      } catch (err) {
        console.error('Error checking saved credentials:', err);
      }
    };

    checkSavedCredentials();
  }, []);

  const handleLogin = async () => {
    try {
      const response = await api.post<LoginResponse>(
        '/auth/login',
        { email, password },
        { requiresAuth: false }
      );

      const { token, user } = response;

      // If remember me is checked, save everything including token
      if (rememberMe) {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('savedToken', token);
        await AsyncStorage.setItem('rememberedEmail', email);
        await AsyncStorage.setItem('rememberMe', 'true');
        await AsyncStorage.setItem('userId', user.id.toString());
      } else {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('userId', user.id.toString());
        await AsyncStorage.removeItem('savedToken');
        await AsyncStorage.removeItem('rememberedEmail');
        await AsyncStorage.removeItem('rememberMe');
      }

      router.replace('/home/mainpage');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Login error details:', err);
      setError(errorMessage);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.header}>
        <ImageCache
          source={require('../assets/images/mobilis-logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.loginContainer}>
        <Text style={[styles.loginTitle, { color: theme.light.login_text }]}>
          Login
        </Text>

        <View style={styles.inputContainer}>
          <Text
            style={[styles.inputLabel, { color: currentTheme.secondaryText }]}>
            Email or phone number
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: currentTheme.border,
                backgroundColor: isDarkMode ? currentTheme.card : '#f9f9f9',
                color: currentTheme.text,
              },
            ]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Enter your email or phone"
            placeholderTextColor={currentTheme.secondaryText}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text
            style={[styles.inputLabel, { color: currentTheme.secondaryText }]}>
            Password
          </Text>
          <View
            style={[
              styles.passwordInputContainer,
              {
                borderColor: currentTheme.border,
                backgroundColor: isDarkMode ? currentTheme.card : '#f9f9f9',
              },
            ]}>
            <TextInput
              style={[styles.passwordInput, { color: currentTheme.text }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="Enter your password"
              placeholderTextColor={currentTheme.secondaryText}
            />
            <TouchableOpacity
              style={styles.hideButton}
              onPress={() => setShowPassword(!showPassword)}>
              <Text
                style={[
                  styles.hideButtonText,
                  { color: theme.light.login_text },
                ]}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {error && (
          <Text
            style={{
              color: theme.light.error,
              textAlign: 'center',
              marginBottom: 10,
            }}>
            {error}
          </Text>
        )}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.rememberMeContainer}
            onPress={() => setRememberMe(!rememberMe)}>
            <View
              style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text
              style={[
                styles.rememberMeText,
                { color: currentTheme.secondaryText },
              ]}>
              Remember me
            </Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={[styles.helpText, { color: theme.light.login_text }]}>
              Need help?
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
  logoImage: {
    width: 250,
    height: 80,
    marginBottom: 40,
    marginTop: 60,
  },
  loginContainer: {
    paddingHorizontal: 25,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  hideButton: {
    paddingHorizontal: 15,
  },
  hideButtonText: {
    color: '#53B946',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    height: 50,
    backgroundColor: '#53B946',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#53B946',
    borderColor: '#53B946',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
  },
  rememberMeText: {
    color: '#666',
    fontSize: 14,
  },
  helpText: {
    color: '#53B946',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LoginScreen;
