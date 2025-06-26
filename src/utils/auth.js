import api from '../config/axios';
import Cookies from 'js-cookie';

// Token refresh state management
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Check if the token is valid
export const verifyToken = async (token) => {
  try {
    const response = await api.post('/api/token_verify/', { token }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.status === 200;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
};

// Enhanced refresh token function with queue management
export const refreshToken = async () => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const refreshToken = Cookies.get('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const response = await api.post('/api/token/refresh/', {
      refresh: refreshToken,
    });

    if (response.data.access) {
      // Save the new access token
      Cookies.set('accessToken', response.data.access, {
        expires: 1,
        secure: true,
        sameSite: 'Strict',
        path: '/'
      });

      // If a new refresh token is provided, save it too
      if (response.data.refresh) {
        Cookies.set('refreshToken', response.data.refresh, {
          expires: 7,
          secure: true,
          sameSite: 'Strict',
          path: '/'
        });
      }

      processQueue(null, response.data.access);
      return response.data.access;
    }
    throw new Error('No access token in response');
  } catch (error) {
    console.error('Error refreshing token:', error);
    processQueue(error, null);
    
    // Clear all auth cookies on refresh failure
    Cookies.remove('accessToken', { path: '/' });
    Cookies.remove('refreshToken', { path: '/' });
    Cookies.remove('userId', { path: '/' });
    Cookies.remove('role', { path: '/' });
    
    // Redirect to login if refresh fails
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    
    return null;
  } finally {
    isRefreshing = false;
  }
};

// Enhanced axios interceptor for automatic token refresh
export const setupAxiosInterceptors = () => {
  // Request interceptor to add token
  api.interceptors.request.use(
    (config) => {
      const token = Cookies.get('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token refresh
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // If the error is 401 and we haven't tried to refresh yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await refreshToken();
          if (newToken) {
            // Retry the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Don't redirect here, let the component handle it
        }
      }

      return Promise.reject(error);
    }
  );
};

// Function to check if user is authenticated
export const isAuthenticated = () => {
  const token = Cookies.get('accessToken');
  const refreshToken = Cookies.get('refreshToken');
  return !!(token && refreshToken);
};

// Function to get current token
export const getCurrentToken = () => {
  return Cookies.get('accessToken');
};

// Function to logout user
export const logout = () => {
  Cookies.remove('accessToken', { path: '/' });
  Cookies.remove('refreshToken', { path: '/' });
  Cookies.remove('userId', { path: '/' });
  Cookies.remove('role', { path: '/' });
  
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

// Function to check token expiration time
export const getTokenExpirationTime = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

// Function to check if token is about to expire (within 5 minutes)
export const isTokenExpiringSoon = (token) => {
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) return false;
  
  const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
  return expirationTime < fiveMinutesFromNow;
};

// Proactive token refresh function
export const proactiveTokenRefresh = async () => {
  const token = getCurrentToken();
  if (!token) return false;

  if (isTokenExpiringSoon(token)) {
    console.log('Token expiring soon, refreshing proactively...');
    const newToken = await refreshToken();
    return !!newToken;
  }
  
  return true;
};

