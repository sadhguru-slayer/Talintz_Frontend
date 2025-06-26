// Create this new file to help diagnose issues
import axios from 'axios';
import { getBaseURL } from '../config/axios';
import Cookies from 'js-cookie';

export const runConnectionDiagnostics = async () => {
  console.log("=== RUNNING CONNECTION DIAGNOSTICS ===");
  
  // Check environment
  console.log("Current URL:", window.location.href);
  console.log("Hostname:", window.location.hostname);
  
  // Check cookies
  console.log("Cookies available:");
  console.log("- accessToken:", !!Cookies.get('accessToken'));
  console.log("- refreshToken:", !!Cookies.get('refreshToken'));
  console.log("- userId:", Cookies.get('userId'));
  console.log("- role:", Cookies.get('role'));
  
  // Check base URL determination
  const baseUrl = getBaseURL();
  console.log("Using base URL:", baseUrl);
  
  // Try a simple ping request
  try {
    console.log("Testing API connection...");
    const response = await axios.get(`${baseUrl}/api/client/homepage/`, {
      headers: {
        Authorization: `Bearer ${Cookies.get('accessToken')}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    console.log("Connection successful!");
    console.log("Response status:", response.status);
    console.log("Response data available:", !!response.data);
  } catch (error) {
    console.error("Connection failed!");
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
  
  console.log("=== DIAGNOSTICS COMPLETE ===");
}; 