import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams, Outlet } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { 
  verifyToken, 
  refreshToken, 
  setupAxiosInterceptors, 
  isAuthenticated,
  proactiveTokenRefresh 
} from './utils/auth';
import FProfile from './pages/freelancer/FProfile';
import CProfile from './pages/client/CProfile';
import ProfilePageLayout from './components/layouts/ProfilePageLayout';
import api from './config/axios';
import LoadingComponent from './components/LoadingComponent';
import FreelancerOtherProfile from './pages/freelancer/profile/OtherProfile';
import ClientOtherProfile from './pages/client/profile/OtherProfile';
import FreelancerNotAuthProfile from './pages/freelancer/profile/NotAuthProfile';
import ClientNotAuthProfile from './pages/client/profile/NotAuthProfile';
import EmailVerificationBanner from "./components/EmailVerificationBanner";
import EmailCodeEntryModal from "./components/EmailCodeEntryModal";

// Setup axios interceptors once when the module loads
setupAxiosInterceptors();

const getRoleFromPath = (pathname) => {
  if (pathname.includes('/freelancer/')) return 'freelancer';
  if (pathname.includes('/client/')) return 'client';
  return null;
};

const PrivateRoute = ({ element: Component, allowedRoles = [], ...rest }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const [authState, setAuthState] = useState({
    isAuthenticated: null,
    isProfiled: false,
    role: '',
    userId: null,
    loading: true,
    hasPermission: false,
    isEmailVerified: false,
    username: '',
    email: ''
  });
  const [showVerificationModal, setShowVerificationModal] = useState(true);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState("");

  // Proactive token refresh interval
  useEffect(() => {
    const checkTokenInterval = setInterval(async () => {
      if (isAuthenticated()) {
        await proactiveTokenRefresh();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkTokenInterval);
  }, []);

  useEffect(() => {
    const authenticateUser = async () => {
      const accessToken = Cookies.get('accessToken');
      const refreshTokenValue = Cookies.get('refreshToken');
      
      // If no tokens, set unauthenticated and stop loading
      if (!accessToken || !refreshTokenValue) {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: false,
          loading: false
        }));
        return;
      }

      try {
        // First, try proactive token refresh
        await proactiveTokenRefresh();
        
        // Verify current token
        const isValid = await verifyToken(accessToken);
        let currentToken = accessToken;

        // If token is invalid or expired, try refresh
        if (!isValid) {
          const newToken = await refreshToken();
          if (!newToken) {
            throw new Error('Token refresh failed');
          }
          currentToken = newToken;
        }

        // Fetch user profile with retry mechanism
        let profileResponse;
        try {
          profileResponse = await api.get('/api/profile/', {
            headers: { Authorization: `Bearer ${currentToken}` },
          });
        } catch (profileError) {
          // If profile fetch fails with 401, try one more refresh
          if (profileError.response?.status === 401) {
            const retryToken = await refreshToken();
            if (retryToken) {
              profileResponse = await api.get('/api/profile/', {
                headers: { Authorization: `Bearer ${retryToken}` },
              });
            } else {
              throw new Error('Profile fetch failed after token refresh');
            }
          } else {
            throw profileError;
          }
        }

        const { is_profiled, role: userRole, id, is_email_verified, username, email } = profileResponse.data.user;
        const effectiveRole = userRole === 'student' ? 'freelancer' : userRole;
        const hasPermission = allowedRoles.length === 0 || allowedRoles.includes(effectiveRole);

        setAuthState({
          isAuthenticated: true,
          isProfiled: is_profiled,
          role: effectiveRole,
          userId: id,
          loading: false,
          hasPermission,
          isEmailVerified: is_email_verified,
          username,
          email
        });

      } catch (error) {
        console.error('Authentication error:', error);
        // Clear cookies on error
        Cookies.remove('accessToken', { path: '/' });
        Cookies.remove('refreshToken', { path: '/' });
        Cookies.remove('userId', { path: '/' });
        Cookies.remove('role', { path: '/' });
        
        setAuthState({
          isAuthenticated: false,
          isProfiled: false,
          role: '',
          userId: null,
          loading: false,
          hasPermission: false,
          isEmailVerified: false,
          username: '',
          email: ''
        });
      }
    };

    authenticateUser();
  }, [allowedRoles]);

  // Helper: check if URL is a profile view
  const isProfileView = location.pathname.match(/\/profile\/\d+\/view_profile/);
  const urlRole = getRoleFromPath(location.pathname);

  if (authState.loading) {
    return <LoadingComponent />;
  }

  // Unauthenticated: show NotAuthProfile via main profile layout
  if (authState.isAuthenticated === false) {
    // Allow only non-auth profile pages
    if (isProfileView && routeId) {
      if (urlRole === 'freelancer') {
        return (
          <FProfile
            userId={routeId}
            isAuthenticated={false}
            isEditable={false}
          />
        );
      } else if (urlRole === 'client') {
        return (
          <CProfile
            userId={routeId}
            isAuthenticated={false}
            isEditable={false}
          />
        );
      }
      // fallback
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    // For all other routes, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated: viewing another user's profile, but use main profile layout
  if (
    authState.isAuthenticated &&
    isProfileView &&
    routeId &&
    routeId !== authState.userId?.toString()
  ) {
    // Always use the authenticated user's profile layout, but pass urlRole for OtherProfile
    if (authState.role === 'freelancer') {
      return (
        <FProfile
          userId={routeId}
          isAuthenticated={true}
          isEditable={false}
          otherProfileRole={urlRole}
        />
      );
    } else if (authState.role === 'client') {
      return (
        <CProfile
          userId={routeId}
          isAuthenticated={true}
          isEditable={false}
          otherProfileRole={urlRole}
        />
      );
    }
    // fallback
    return <Navigate to={`/${authState.role}/homepage`} replace />;
  }

  // Handle unauthorized access (wrong role)
  if (authState.isAuthenticated && !authState.hasPermission) {
    const redirectPath = `/${authState.role}/homepage`;
    return <Navigate to={redirectPath} replace />;
  }
console.log(authState)

  // Simulate sending code to email
  const handleSendCode = async () => {
    try {
      const accessToken = Cookies.get("accessToken");
      await axios.post(
        "http://127.0.0.1:8000/api/send_email_verification_code/",
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setShowCodeModal(true);
      setShowVerificationModal(false);
      setCodeError("");
    } catch (err) {
      setCodeError(
        err.response?.data?.detail || "Failed to send verification code."
      );
    }
  };

  // Verify the code with backend
  const handleVerifyCode = async (code) => {
    setCodeLoading(true);
    setCodeError("");
    try {
      const accessToken = Cookies.get("accessToken");
      await axios.post(
        "http://127.0.0.1:8000/api/verify_email_code/",
        { code },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      // Don't update auth state immediately - let the modal handle the success flow
      // The modal will show animations and then close itself
      setCodeLoading(false);
      
    } catch (err) {
      setCodeError(
        err.response?.data?.detail || "Invalid code. Please try again."
      );
      setCodeLoading(false);
    }
  };

  // Resend code
  const handleResendCode = async () => {
    try {
      const accessToken = Cookies.get("accessToken");
      await axios.post(
        "http://127.0.0.1:8000/api/send_email_verification_code/",
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setCodeError("");
      // Optionally show a success message
      console.log("Verification code resent!");
    } catch (err) {
      setCodeError(
        err.response?.data?.detail || "Failed to resend verification code."
      );
    }
  };

  // Add this function in PrivateRoute.jsx
  const handleVerificationSuccess = () => {
    setAuthState(prev => ({ ...prev, isEmailVerified: true }));
  };

  // Render the protected component (editable profile or other protected routes)
  return (
    <>
      {!authState.isEmailVerified && authState.isAuthenticated && (
        <>
          {showVerificationModal && (
            <EmailVerificationBanner
              username={authState.username}
              email={authState.email}
              onVerify={handleSendCode}
              onClose={() => setShowVerificationModal(false)}
            />
          )}
          {showCodeModal && (
            <EmailCodeEntryModal
              email={authState.email}
              onSubmit={handleVerifyCode}
              onResend={handleResendCode}
              onClose={() => {
                setShowCodeModal(false);
                setShowVerificationModal(true);
              }}
              onVerificationSuccess={handleVerificationSuccess}
              loading={codeLoading}
              error={codeError}
            />
          )}
        </>
      )}
      {Component ? (
        <Component
          {...rest}
          userId={authState.userId}
          role={authState.role}
          isAuthenticated={authState.isAuthenticated}
          isEditable={routeId === authState.userId?.toString()}
          isEmailVerified={authState.isEmailVerified}
        >
          {rest.children}
        </Component>
      ) : (
        <Outlet
          context={{
            userId: authState.userId,
            role: authState.role,
            isAuthenticated: authState.isAuthenticated,
            isEditable: routeId === authState.userId?.toString(),
            isEmailVerified: authState.isEmailVerified
          }}
        />
      )}
    </>
  );
};

export default PrivateRoute;
