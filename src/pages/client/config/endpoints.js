// Base URL for API
const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const ENDPOINTS = {
  // Project related endpoints
  POST_PROJECT: `${API_BASE_URL}/post_project/`,
  GET_CATEGORIES: `${API_BASE_URL}/categories/`,
  GET_SKILLS: (domainId) => `${API_BASE_URL}/skills/${domainId}`,
  
  // Wallet related endpoints
  GET_WALLET_BALANCE: `${API_BASE_URL}/finance/wallet/balance/`,
  
  // Profile related endpoints
  GET_PROFILE: `${API_BASE_URL}/profile/`,
  
  // Freelancer related endpoints
  NOTIFY_FREELANCER: (objectId, type) => `${API_BASE_URL}/notify-freelancer/${objectId}&${type}`,
  
  // Client related endpoints
  CLIENT_HOMEPAGE: `${API_BASE_URL}/client/homepage/`,
  CLIENT_DASHBOARD: `${API_BASE_URL}/client/dashboard_overview`,
  CLIENT_SPENDING_DATA: `${API_BASE_URL}/client/spending_data/`
};

// API configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}; 