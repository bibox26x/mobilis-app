import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://backend-mobilis-production.up.railway.app/api';


interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  requiresAuth?: boolean;
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function getAuthToken(): Promise<string | null> {
  // Try to get the current session token first
  let token = await AsyncStorage.getItem('token');

  // If no current token, try the saved token
  if (!token) {
    token = await AsyncStorage.getItem('savedToken');
    // If we're using the saved token, update the current token
    if (token) {
      await AsyncStorage.setItem('token', token);
    }
  }
  console.log('[apiClient] getAuthToken - token:', token);
  return token;
}

async function handleTokenExpiry() {
  const savedToken = await AsyncStorage.getItem('savedToken');
  const currentToken = await AsyncStorage.getItem('token');

  // If we have a saved token different from the current one, try using it
  if (savedToken && savedToken !== currentToken) {
    await AsyncStorage.setItem('token', savedToken);
    return savedToken;
  }

  // If we don't have a valid saved token, clear both tokens and throw error
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('savedToken');
  throw new ApiError('Session expired. Please log in again.', 401);
}

export async function apiRequest<T = any>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const { requiresAuth = true, ...fetchConfig } = config;

  try {
    // Add authorization header if required
    if (requiresAuth) {
      const token = await getAuthToken();
      if (!token) {
        console.warn('[apiClient] No authentication token found');
        throw new ApiError('No authentication token found', 401);
      }
      console.log('[apiClient] apiRequest - Using token:', token);
      fetchConfig.headers = {
        ...fetchConfig.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    // Add default headers
    fetchConfig.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...fetchConfig.headers,
    };

    // Make the request
    const response = await fetch(`${BASE_URL}${endpoint}`, fetchConfig);

    // Handle 401 errors by trying to use saved token
    if (response.status === 401) {
      // Try to handle token expiry
      const newToken = await handleTokenExpiry();

      // If we got a new token, retry the request
      if (newToken) {
        fetchConfig.headers = {
          ...fetchConfig.headers,
          Authorization: `Bearer ${newToken}`,
        };
        const retryResponse = await fetch(
          `${BASE_URL}${endpoint}`,
          fetchConfig
        );

        if (!retryResponse.ok) {
          throw new ApiError(
            await getErrorMessage(retryResponse),
            retryResponse.status
          );
        }

        return parseResponse(retryResponse);
      }
    }

    // Handle other errors
    if (!response.ok) {
      throw new ApiError(await getErrorMessage(response), response.status);
    }

    return parseResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      500
    );
  }
}

async function getErrorMessage(response: globalThis.Response): Promise<string> {
  try {
    const errorText = await response.text();
    const errorData = JSON.parse(errorText);
    return errorData.message || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

async function parseResponse<T>(response: globalThis.Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    const data = await response.json();
    if (!data.success) {
      throw new ApiError(data.message || 'Request failed', response.status);
    }
    return data.data;
  }
  throw new ApiError('Unexpected response format', response.status);
}

// Export a pre-configured instance with commonly used methods
export const api = {
  get: <T>(endpoint: string, config?: RequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: 'GET' }),

  post: <T>(endpoint: string, data: any, config?: RequestConfig) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data: any, config?: RequestConfig) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string, config?: RequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: 'DELETE' }),
};
