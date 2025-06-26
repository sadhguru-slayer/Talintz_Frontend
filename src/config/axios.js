import axios from 'axios';

// Base URL configuration - easy to change for different environments
const API_BASE_URL = {
  // For local development
  local: 'http://127.0.0.1:8000',
  // When sharing on your local network
  network: `http://${window.location.hostname}:8000`,
  // For production (update when deployed)
  production: 'https://your-production-api.com',
};

// Select which environment to use
const CURRENT_ENV = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'local' 
  : window.location.hostname.includes('your-production-domain.com')
    ? 'production'
    : 'network';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL[CURRENT_ENV],
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach auth token
api.interceptors.request.use(
  config => {
    const accessToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('accessToken='))
      ?.split('=')[1];
      
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Handle token refresh logic here if needed
    
    return Promise.reject(error);
  }
);

// API endpoint functions
export const authAPI = {
  login: (userData) => api.post('/api/login/', userData),
  register: (userData) => api.post('/api/register/', userData),
  refreshToken: (refreshToken) => api.post('/api/token/refresh/', { refresh: refreshToken }),
  verifyToken: (token) => api.post('/api/token/verify/', { token }),
  logout: () => api.post('/api/logout/'),
};

export const userAPI = {
  getProfile: (userId) => api.get(`/api/users/${userId}/`),
  updateProfile: (userId, data) => api.patch(`/api/users/${userId}/`, data),
};

// Export the base URL for direct usage if needed
export const getBaseURL = () => API_BASE_URL[CURRENT_ENV];

export default api; 