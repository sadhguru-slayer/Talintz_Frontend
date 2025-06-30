import axios from 'axios';

// Fallback URLs if environment variables are not defined
const DEFAULT_DEV_URL = 'http://127.0.0.1:8000';
const DEFAULT_PROD_URL = 'https://talintzbackend-production.up.railway.app';

// Safely determine the base URL
const isDevelopment = 
  typeof process !== 'undefined' && 
  process.env.NODE_ENV === 'development';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_DEV || 
                     import.meta.env.VITE_API_BASE_URL_PROD || 
                     DEFAULT_PROD_URL;

// Export the base URL for use in other files
export const getBaseURL = () => API_BASE_URL;

// Create axios instance with dynamic config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach accessToken to every request
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken') || 
      document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1];

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration/refresh (optional)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      const { data } = await authAPI.refreshToken(refreshToken);
      localStorage.setItem('accessToken', data.access);
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (userData) => api.post('/api/login/', userData),
  register: (userData) => api.post('/api/register/', userData),
  logout: () => api.post('/api/logout/'),
};

export const userAPI = {
  getProfile: () => api.get('/api/users/me/'),
  updateProfile: (data) => api.patch('/api/users/me/', data),
};

export default api;