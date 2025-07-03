import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { message, Spin, ConfigProvider, Tabs } from "antd";
import Cookies from "js-cookie";
import FWallet from "./pages/freelancer/FWallet";
import DOMPurify from "dompurify";
import { verifyToken, refreshToken, setupAxiosInterceptors, isAuthenticated, proactiveTokenRefresh } from "./utils/auth";
import PrivateRoute from "./PrivateRoute";
// import DashboardLayout from './components/layouts/DashboardLayout';
import FDashboard from "./pages/freelancer/FDashboard";
import FreelancerAnalyticsPage from "./pages/freelancer/dashboard/FreelancerAnalyticsPage";
import ProjectManagementPage from "./pages/freelancer/dashboard/ProjectManagementPage";
import Earnings from "./pages/freelancer/dashboard/Earnings";
import BiddingOverview from "./pages/freelancer/dashboard/BiddingOverview";
import UpcomingEvents from "./pages/freelancer/dashboard/UpcomingEvents";
import ClientUpcomingEvents from "./pages/client/dashboard/UpcomingEvents";
import ProjectDetailPage from "./pages/freelancer/dashboard/ProjectDetailPage";
import CDashboard from "./pages/client/CDashboard";
import DashboardOverview from "./pages/client/dashboard/DashboardOverview";
import PostedProjects from "./pages/client/dashboard/PostedProjects";
import RecentActivity from "./pages/client/dashboard/RecentActivity";
import Spendings from "./pages/client/dashboard/Spendings";
import React from "react";
import CProfile from "./pages/client/CProfile";
import FProfile from "./pages/freelancer/FProfile";
import CConnections from "./pages/client/CConnections";
import CConnectionRequests from "./pages/client/CConnectionRequests";
import FConnections from "./pages/freelancer/FConnections";
import FConnectionRequests from "./pages/freelancer/FConnectionRequests";
import CWallet from "./pages/client/CWallet";
import OBSPLayout from "./pages/freelancer/OBSP/OBSPLayout";
import ListOfObsps from "./pages/freelancer/OBSP/ListOfObsps";
import ObspDetails from "./pages/freelancer/OBSP/ObspDetails";
import ClientOBSPLayout from "./pages/client/OBSP/OBSPLayout";
import ClientObspPurchaseList from "./pages/client/OBSP/ObspPurchaseList";
import ClientObspDetails from "./pages/client/OBSP/ObspDetails";
// Lazy load components for better performance
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ChatSystem = lazy(() => import("./pages/common/chatsystem/ChatSystem"))

import './styles/theme.css';
import { antdTheme } from './config/antd.config';
import { getBaseURL } from './config/axios';
import { components } from "react-select";
import { EyeOutlined, EyeInvisibleOutlined, CloseOutlined } from '@ant-design/icons';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';

// Move this function to the top, before any component definitions
const getEffectiveRole = (role) => {
  return role === "student" ? "freelancer" : role;
};

// Client Routes Configuration
const clientRoutes = [
  {
    path: "profile/:id",
    component: lazy(() => import("./pages/client/CProfile")),
    allowedRoles: ["client", "freelancer"],
  },
  {
    path: "homepage",
    component: lazy(() => import("./pages/client/CHomepage")),
    allowedRoles: ["client"],
  },
  {
    path: "connection_requests",
    component: lazy(() => import("./pages/client/CConnectionRequests")),
    allowedRoles: ["client"],
  },
  {
    path: "connections",
    component: lazy(() => import("./pages/client/CConnections")),
    allowedRoles: ["client"],
  },
  {
    path: "notifications",
    component: lazy(() => import("./pages/client/CNotifications")),
    allowedRoles: ["client"],
  },
  {
    path: "dashboard",
    component: lazy(() => import("./pages/client/CDashboard")),
    allowedRoles: ["client"],
  },
  {
    path: "dashboard/projects/:id",
    component: lazy(() => import("./pages/client/PostedProjectForBidsPage")),
    allowedRoles: ["client"],
  },
  {
    path: "collaboration",
    component: lazy(() => import("./pages/client/profile/Collaboration")),
    allowedRoles: ["client"],
  },
  {
    path: "post-project",
    component: lazy(() => import("./pages/client/ProjectPost")),
    allowedRoles: ["client"],
  },
  {
    path: "view-bids",
    component: lazy(() => import("./pages/client/ViewBids")),
    allowedRoles: ["client"],
  },
  {
    path: "view-bids/posted-project/:id",
    component: lazy(() => import("./pages/client/PostedProjectForBidsPage")),
    allowedRoles: ["client"],
  },
  
  {
    path: "find-talent",
    component: lazy(() => import("./pages/client/FindTalent")),
    allowedRoles: ["client"],
  },
  {
    path: "wallet",
    component: lazy(() => import("./pages/client/CWallet")),
    allowedRoles: ["client"],
  },
  {
    path: "referrals",
    component: lazy(() => import("./pages/common/ReferralsPage")),
    allowedRoles: ["client"],
  },
];

// Client Profile Routes
const clientProfileRoutes = [
  {
    path: "",
    component: lazy(() => import("./pages/client/profile/AuthProfile")),
    allowedRoles: ["client", "freelancer"],
  },
  {
    path: "view_profile",
    component: lazy(() => import("./pages/client/profile/AuthProfile")),
    allowedRoles: ["client", "freelancer"],
  },
  {
    path: "edit_profile",
    component: lazy(() => import("./pages/client/profile/EditProfile")),
    allowedRoles: ["client"],
  },
  {
    path: "reviews_ratings",
    component: lazy(() => import("./pages/client/profile/RatingsRatings")),
    allowedRoles: ["client"],
  },
  {
    path: "collaborations",
    component: lazy(() => import("./pages/client/profile/Collaboration")),
    allowedRoles: ["client"],
  },
];

// Freelancer Routes Configuration
const freelancerRoutes = [
  {
    path: "profile/:id",
    component: lazy(() => import("./pages/client/CProfile")),
    allowedRoles: ["client", "freelancer"],
  },
  {
    path: "homepage",
    component: lazy(() => import("./pages/freelancer/FHomepage")),
    allowedRoles: ["freelancer"],
  },
  {
    path: "notifications",
    component: lazy(() => import("./pages/freelancer/FNotifications")),
    allowedRoles: ["freelancer"],
  },
  {
    path: "collaboration",
    component: lazy(() => import("./pages/freelancer/FCollaboration")),
    allowedRoles: ["freelancer"],
  },
  {
    path: "browse-projects",
    component: lazy(() => import("./pages/freelancer/BrowseProjectsPage")),
    allowedRoles: ["freelancer"],
  },
  {
    path: "browse-projects/project-view/:id",
    component: lazy(() => import("./pages/freelancer/ProjectPageForBidding")),
    allowedRoles: ["freelancer"],
  },
  {
    path: "referrals",
    component: lazy(() => import("./pages/common/ReferralsPage")),
    allowedRoles: ["freelancer", "student"],
  },
];

// Create a separate array for OBSP routes (similar to dashboard routes)
const obspRoutes = [
  {
    path: "",
    component: lazy(() => import("./pages/freelancer/OBSP/ListOfObsps")),
    allowedRoles: ["freelancer", "student"],
  },
  {
    path: "list",
    component: lazy(() => import("./pages/freelancer/OBSP/ListOfObsps")),
    allowedRoles: ["freelancer", "student"],
  },
  {
    path: "details/:id",
    component: lazy(() => import("./pages/freelancer/OBSP/ObspDetails")),
    allowedRoles: ["freelancer", "student"],
  },
  // {
  //   path: "progress",
  //   component: lazy(() => import("./pages/freelancer/OBSP/OBSPProgress")),
  //   allowedRoles: ["freelancer", "student"],
  // },
  // {
  //   path: "achievements",
  //   component: lazy(() => import("./pages/freelancer/OBSP/OBSPSuccess")),
  //   allowedRoles: ["freelancer", "student"],
  // },
];

// Freelancer Profile Routes
const freelancerProfileRoutes = [
  {
    path: "view_profile",
    component: lazy(() => import("./pages/freelancer/profile/AuthProfile")),
    allowedRoles: ["client", "freelancer"],
  },

  {
    path: "connections",
    component: lazy(() => import("./pages/freelancer/profile/Connections")),
    allowedRoles: ["freelancer"],
  },
  {
    path: "collaborations",
    component: lazy(() => import("./pages/freelancer/profile/Collaborations")),
    allowedRoles: ["freelancer"],
  },
  {
    path: "portfolio",
    component: lazy(() => import("./pages/freelancer/profile/Portfolio")),
    allowedRoles: ["freelancer"],
  },
  {
    path: "settings",
    component: lazy(() => import("./pages/freelancer/profile/Settings")),
    allowedRoles: ["freelancer"],
  },
  {
    path: "edit_profile",
    component: lazy(() => import("./pages/freelancer/profile/EditProfile")),
    allowedRoles: ["freelancer"],
  },
];

// Create a separate array for dashboard routes
const dashboardRoutes = [
  {
    path: "",
    component: lazy(() =>
      import("./pages/freelancer/dashboard/FreelancerAnalyticsPage")
    ),
    allowedRoles: ["freelancer"],
  },
  {
    path: "freelancer-analytics",
    component: lazy(() =>
      import("./pages/freelancer/dashboard/FreelancerAnalyticsPage")
    ),
    allowedRoles: ["freelancer"],
  },
  {
    path: "projects",
    component: lazy(() =>
      import("./pages/freelancer/dashboard/ProjectManagementPage")
    ),
    allowedRoles: ["freelancer"],
  },
  {
    path: "project-management",
    component: lazy(() =>
      import("./pages/freelancer/dashboard/ProjectManagementPage")
    ),
    allowedRoles: ["freelancer"],
  },
  {
    path: "earnings",
    component: lazy(() => import("./pages/freelancer/dashboard/Earnings")),
    allowedRoles: ["freelancer"],
  },
  {
    path: "bidding-overview",
    component: lazy(() =>
      import("./pages/freelancer/dashboard/BiddingOverview")
    ),
    allowedRoles: ["freelancer"],
  },
  {
    path: "upcoming-events",
    component: lazy(() =>
      import("./pages/client/dashboard/UpcomingEvents")
    ),
    allowedRoles: ["freelancer"],
  },
  {
    path: "projects/:id",
    component: lazy(() => import("./pages/freelancer/dashboard/ProjectDetailPage")),
    allowedRoles: ["freelancer"],
  },
];

// Create a separate array for client dashboard routes
const clientDashboardRoutes = [
  {
    path: "",
    component: lazy(() => import("./pages/client/dashboard/DashboardOverview")),
    allowedRoles: ["client"],
  },
  {
    path: "overview",
    component: lazy(() => import("./pages/client/dashboard/DashboardOverview")),
    allowedRoles: ["client"],
  },
  {
    path: "projects",
    component: lazy(() => import("./pages/client/dashboard/PostedProjects")),
    allowedRoles: ["client"],
  },
  {
    path: "recent_activity",
    component: lazy(() => import("./pages/client/dashboard/RecentActivity")),
    allowedRoles: ["client"],
  },
  {
    path: "spendings",
    component: lazy(() => import("./pages/client/dashboard/Spendings")),
    allowedRoles: ["client"],
  },
  {
    path: "upcoming-events",
    component: lazy(() => import("./pages/client/dashboard/UpcomingEvents")),
    allowedRoles: ["client"],
  },
  // {
  //   path: "workspace/:workspaceId",
  //   component: lazy(() => import("./pages/client/ProjectWorkSpace")),
  //   allowedRoles: ["client"],
  // },
  {
    path: "workspace/:workspaceId",
    component: lazy(() => import("./pages/client/workspace/WorkspaceLayout")),
    allowedRoles: ["client"],
  },
];

// Now update the LoadingSpinner component
const LoadingSpinner = () => {
  const userRole = Cookies.get("role");
  const isClient = userRole === "client";
  
  return (
    <div className={`h-screen w-screen flex items-center justify-center ${
      isClient ? 'bg-client-bg-DEFAULT' : 'bg-freelancer-bg-DEFAULT'
    }`}>
      <div className="relative flex flex-col items-center">
        <div className={`w-12 h-12 rounded-full border-4 ${
          isClient 
            ? 'border-client-primary border-t-transparent' 
            : 'border-freelancer-primary border-t-transparent'
        } animate-spin`}></div>
        <div className={`mt-4 font-medium ${
          isClient ? 'text-client-primary' : 'text-freelancer-primary'
        }`}>
          Loading...
        </div>
      </div>
    </div>
  );
};

// Setup axios interceptors globally
setupAxiosInterceptors();

const App = () => {
  const [isDemoActivated, setIsDemoActivated] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const token = Cookies.get("accessToken");
  const userId = Cookies.get("userId");
  const userRole = getEffectiveRole(Cookies.get("role")) || "client";

  // Enhanced token validation with proactive refresh
  useEffect(() => {
    const checkTokenAndProfile = async () => {
      if (!token) return;

      try {
        const isValid = await verifyToken(token);
        if (!isValid) {
          const newToken = await refreshToken();
          if (newToken) {
            Cookies.set("accessToken", newToken, {
              expires: 1,
              secure: true,
              sameSite: "Strict",
            });
          } else {
            setIsTokenValid(false);
          }
        }
      } catch (error) {
        console.error("Token validation error:", error);
        setIsTokenValid(false);
      }
    };

    checkTokenAndProfile();
  }, [token]);

  // PROFESSIONAL notification handler with preview/expand functionality and close button
  const showNotification = useCallback((notification) => {
    const isClient = userRole === "client";
    
    // Professional color scheme based on user role
    const styles = {
      container: isClient
        ? 'bg-white/95 backdrop-blur-md border border-gray-200 shadow-lg'
        : 'bg-white/95 backdrop-blur-md border border-gray-200 shadow-lg',
      header: isClient
        ? 'border-b border-gray-100'
        : 'border-b border-gray-100',
      icon: isClient
        ? 'text-blue-600'
        : 'text-purple-600',
      title: 'text-gray-900 font-medium',
      text: 'text-gray-700',
      timestamp: 'text-gray-500',
      expandButton: isClient
        ? 'text-blue-600 hover:text-blue-700'
        : 'text-purple-600 hover:text-purple-700',
      closeButton: 'text-gray-400 hover:text-gray-600',
      accent: isClient
        ? 'text-blue-600'
        : 'text-purple-600'
    };

    const getNotificationIcon = (type) => {
      switch(type) {
        case 'project_assignment':
          return '📋';
        case 'interview_request':
          return '🎯';
        case 'bid_invitation':
          return '💼';
        case 'bid_update':
          return '💰';
        case 'payment_received':
          return '💳';
        case 'project_update':
          return '📈';
        default:
          return '🔔';
      }
    };

    // Create notification component with preview/expand functionality and close button
    const NotificationComponent = () => {
      const [isExpanded, setIsExpanded] = useState(false);
      const [isVisible, setIsVisible] = useState(true);
      
      // Extract text content for preview (remove HTML tags)
      const getTextContent = (htmlString) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;
        return tempDiv.textContent || tempDiv.innerText || '';
      };

      const textContent = getTextContent(notification.notification_text);
      const previewText = textContent.length > 80 ? textContent.substring(0, 80) + '...' : textContent;
      const needsExpansion = textContent.length > 80;

      // Handle close button click
      const handleClose = () => {
        setIsVisible(false);
      };

      // Auto-hide after 8 seconds
      useEffect(() => {
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 8000);

        return () => clearTimeout(timer);
      }, []);

      if (!isVisible) return null;

      return (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ 
            duration: 0.25,
            ease: "easeOut"
          }}
          className={`
            notification-custom-container
            ${styles.container}
            rounded-lg overflow-hidden
            transform transition-all duration-200
            hover:shadow-xl hover:scale-[1.01]
            will-change-transform
            w-full max-w-sm sm:max-w-md
            mx-auto
            relative
          `}
        >
          {/* Close Button - Top Right */}
          <button
            onClick={handleClose}
            className={`
              ${styles.closeButton}
              absolute top-2 right-2
              p-1 rounded-full hover:bg-gray-100
              transition-all duration-200
              flex-shrink-0
              z-10
              group
            `}
            aria-label="Close notification"
          >
            <CloseOutlined className="text-sm group-hover:scale-110 transition-transform duration-200" />
          </button>

          {/* Header */}
          <div className={`${styles.header} px-4 py-3 flex items-center justify-between pr-8`}>
            <div className="flex items-center gap-3">
              <div className={`text-lg ${styles.icon}`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`${styles.title} text-sm sm:text-base truncate`}>
                  {notification.title || 'New Notification'}
                </div>
                <div className={`${styles.timestamp} text-xs mt-0.5`}>
                  {new Date(notification.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
            
            {/* Expand/Collapse Button */}
            {needsExpansion && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`
                  ${styles.expandButton}
                  p-1 rounded-full hover:bg-gray-100
                  transition-colors duration-200
                  flex-shrink-0
                `}
                aria-label={isExpanded ? 'Show less' : 'Show more'}
              >
                {isExpanded ? (
                  <EyeInvisibleOutlined className="text-sm" />
                ) : (
                  <EyeOutlined className="text-sm" />
                )}
              </button>
            )}
          </div>

          {/* Content */}
          <div className="px-4 pb-3">
            <div className={`${styles.text} text-sm leading-relaxed`}>
              {isExpanded ? (
                <div 
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(notification.notification_text)
                  }}
                  className="space-y-2"
                />
              ) : (
                <div className="space-y-2">
                  <span>{previewText}</span>
                  {needsExpansion && (
                    <button
                      onClick={() => setIsExpanded(true)}
                      className={`
                        ${styles.accent}
                        text-xs font-medium hover:underline
                        transition-colors duration-200
                        block mt-1
                      `}
                    >
                      View more
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      );
    };

    message.open({
      content: <NotificationComponent />,
      duration: 0, // Set to 0 so we control the duration manually
      style: {
        width: 'auto',
        maxWidth: '100%',
        padding: 0,
        background: 'transparent !important',
        border: 'none',
        boxShadow: 'none',
      },
      className: `professional-notification ${isClient ? 'client-notification' : 'freelancer-notification'}`,
      icon: null, // Remove default icon
    });
  }, [userRole]);

  // UPDATED: WebSocket connection with role-based routing
  useEffect(() => {
    if (!token) return;

    const userRole = Cookies.get('role');
    const isStudent = userRole === 'student';
    const effectiveRole = isStudent ? 'freelancer' : userRole;

    const socketUrl = getBaseURL().replace('http://', 'wss://');
    let socket;
    
    if (effectiveRole === 'freelancer') {
      // Use freelancer-specific WebSocket endpoint
      socket = new WebSocket(
        `${socketUrl}/ws/freelancer/notifications/?token=${token}`
      );
    } else {
      // Use client WebSocket endpoint
      socket = new WebSocket(
      `${socketUrl}/ws/notifications/?token=${token}`
    );
    }

    const handleMessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        if (Array.isArray(notification)) return;

        const requiredFields = [
          "notification_id",
          "notification_text",
          "created_at",
          "related_model_id",
          "type",
        ];

        if (requiredFields.every((field) => field in notification)) {
          showNotification(notification);
        }
      } catch (error) {
        console.error("Notification parsing error:", error);
      }
    };

    socket.onmessage = handleMessage;
    socket.onclose = (event) => {
      if (event.code !== 1000) {
        console.error("WebSocket closed abnormally:", event);
      }
    };
    socket.onerror = (error) => console.error("WebSocket Error:", error);

    return () => socket.close();
  }, [token, showNotification]);

  // Add this function near the top of your App component
  const handleLogout = () => {
    // Clear all cookies
    Cookies.remove('accessToken', { path: '/' });
    Cookies.remove('refreshToken', { path: '/' });
    Cookies.remove('userId', { path: '/' });
    Cookies.remove('role', { path: '/' });
    Cookies.remove('is_talentrise', { path: '/' });
    
    // Force a page refresh to clear any cached state
    window.location.href = '/login';
  };

  // Expose this function globally so it can be called from anywhere in the app
  window.handleLogout = handleLogout;

  if (!isTokenValid) {
    return <Navigate to="/login" replace />;
  }

  // IMPROVED styles - REMOVE THE GLOBAL STYLES
  const styles = `
    /* REMOVED: Global ant-message-notice-content transparency */
    
    /* Only apply to our custom notification system */
    .professional-notification .ant-message-notice-content {
      padding: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
    }

    .professional-notification .ant-message-notice {
      background: transparent !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    .professional-notification {
      will-change: transform, opacity;
      transform: translateZ(0);
      backface-visibility: hidden;
    }

    /* Improved notification animations */
    .professional-notification .ant-message-notice {
      animation: slideInFromTop 0.3s ease-out;
    }

    @keyframes slideInFromTop {
      from {
        opacity: 0;
        transform: translateY(-100%);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Better hover effects for notifications only */
    .professional-notification:hover .ant-message-notice-content > div {
      transform: translateY(-2px);
    }
  `;

  // Add the styles to the document
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);

  return (
    <ConfigProvider theme={antdTheme}>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route
              path="/login"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  {token ? (
                    <Navigate 
                      to={`/${Cookies.get('role') === 'student' ? 'freelancer' : Cookies.get('role')}/homepage`} 
                      replace 
                    />
                  ) : (
                    <LoginPage />
                  )}
                </Suspense>
              }
            />
            <Route
              path="/register"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  {token ? (
                    <Navigate 
                      to={`/${Cookies.get('role') === 'student' ? 'freelancer' : Cookies.get('role')}/homepage`} 
                      replace 
                    />
                  ) : (
                    <RegisterPage />
                  )}
                </Suspense>
              }
            />

            <Route path="/cs/*">
              <Route index element={<Navigate to="homepage" replace />} />
              <Route path="homepage" element={<HomePage />} />
              <Route 
                path="register" 
                element={token ? <Navigate to={`/${userRole}/homepage`} replace /> : <RegisterPage />} 
              />
            </Route>
            


            {/* Client Routes */}
            <Route path="/client/*">
              <Route
                index
                element={
                  <PrivateRoute
                    allowedRoles={['client']}
                    element={() => <Navigate to="homepage" replace />}
                  />
                }
              />

              {/* Regular client routes */}
              {clientRoutes
                .filter((route) => !route.path.startsWith("profile"))
                .map(({ path, component: Component, allowedRoles }) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <PrivateRoute
                        element={Component}
                        allowedRoles={allowedRoles}
                      />
                    }
                  />
                ))}

              {/* Profile routes using CProfile */}
              <Route
                path="profile/:id/*"
                element={
                  <PrivateRoute
                    element={CProfile}
                    allowedRoles={["client", "freelancer"]}
                  />
                }
              >
                {clientProfileRoutes.map(({ path, component: Component }) => (
                  <Route key={path} path={path} element={<Component />} />
                ))}
              </Route>

              {/* Client OBSP routes with shared layout */}
              <Route
                path="obsp/*"
                element={
                  <PrivateRoute
                    element={ClientOBSPLayout}
                    allowedRoles={["client"]}
                  />
                }
              >
                <Route index element={<Navigate to="list" replace />} />
                <Route path="list" element={<ClientObspPurchaseList />} />
                <Route path="details/:id" element={<ClientObspDetails />} />
              </Route>

              {/* Dashboard routes with shared layout */}
              <Route
                path="dashboard/*"
                element={
                  <PrivateRoute
                    element={CDashboard}
                    allowedRoles={["client"]}
                  />
                }
              >
                <Route index element={<DashboardOverview />} />
                <Route path="overview" element={<DashboardOverview />} />
                <Route path="projects" element={<PostedProjects />} />
                <Route path="recent_activity" element={<RecentActivity />} />
                <Route path="spendings" element={<Spendings />} />
                <Route path="upcoming-events" element={<ClientUpcomingEvents />} />
                <Route
                  path="projects/:id"
                  element={
                    <PrivateRoute
                      element={lazy(() =>
                        import("./pages/client/PostedProjectForBidsPage")
                      )}
                      allowedRoles={["client"]}
                    />
                  }
                />
                {/* <Route
                  path="workspace/:workspaceId"
                  element={
                    <PrivateRoute
                      element={lazy(() =>
                        import("./pages/client/ProjectWorkSpace")
                      )}
                      allowedRoles={["client"]}
                    />
                  }
                /> */}
                <Route
                  path="workspace/:workspaceId"
                  element={
                    <PrivateRoute
                      element={lazy(() =>
                        import("./pages/client/workspace/WorkspaceLayout")
                      )}
                      allowedRoles={["client"]}
                    />
                  }
                />
              </Route>

              {/* Client Connection Routes */}
              <Route
                path="connections"
                element={
                  <PrivateRoute allowedRoles={["client"]}>
                    <CConnections />
                  </PrivateRoute>
                }
              />
              <Route
                path="connection_requests"
                element={
                  <PrivateRoute
                    element={CConnectionRequests}
                    allowedRoles={["client"]}
                  />
                }
              />

              <Route
                path="chat/*"
                element={
                  <PrivateRoute
                    element={ChatSystem}
                    allowedRoles={["client", "freelancer", "student"]}
                  />
                }
              />

            </Route>

            {/* Freelancer Routes */}
            <Route path="/freelancer/*">
              <Route
                index
                element={
                  <PrivateRoute
                    allowedRoles={['freelancer', 'student']}
                    element={() => <Navigate to="homepage" replace />}
                  />
                }
              />

              {/* Regular freelancer routes */}
              {freelancerRoutes
                .filter((route) => !route.path.startsWith("profile"))
                .map(({ path, component: Component, allowedRoles }) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <PrivateRoute
                        element={Component}
                        allowedRoles={[...allowedRoles, "student"]} // Add student to allowed roles
                      />
                    }
                  />
                ))}

                {/* OBSP routes with shared layout */}
                <Route
                  path="obsp/*"
                  element={
                    <PrivateRoute
                      element={OBSPLayout}
                      allowedRoles={["freelancer", "student"]}
                    />
                  }
                >
                  <Route index element={<Navigate to="list" replace />} />
                  <Route path="list" element={<ListOfObsps />} />
                  <Route path="details/:id" element={<ObspDetails />} />
                </Route>

              {/* Profile routes using FProfile */}
              <Route
                path="profile/:id/*"
                element={
                  <PrivateRoute
                    element={FProfile}
                    allowedRoles={["client", "freelancer", "student"]}
                  />
                }
              >
                {freelancerProfileRoutes.map(({ path, component: Component }) => (
                  <Route key={path} path={path} element={<Component />} />
                ))}
              </Route>

              {/* Dashboard routes with shared layout */}
              <Route
                path="dashboard/*"
                element={
                  <PrivateRoute
                    element={FDashboard}
                    allowedRoles={["freelancer", "student"]}
                  />
                }
              >
                <Route index element={<FreelancerAnalyticsPage />} />
                <Route path="freelancer-analytics" element={<FreelancerAnalyticsPage />} />
                <Route path="projects" element={<ProjectManagementPage />} />
                <Route path="project-management" element={<ProjectManagementPage />} />
                <Route path="earnings" element={<Earnings />} />
                <Route path="bidding-overview" element={<BiddingOverview />} />
                <Route path="upcoming-events" element={<UpcomingEvents />} />
                <Route path="projects/:id" element={<ProjectDetailPage />} />
              </Route>




              <Route
                path="wallet"
                element={
                  <PrivateRoute
                    element={FWallet}
                    allowedRoles={["freelancer", "student"]}  
                  />
                }
              />
              

              {/* Freelancer Connection Routes */}
              <Route
                path="connections"
                element={
                  <PrivateRoute
                    element={FConnections}
                    allowedRoles={["freelancer", "student"]}
                  ></PrivateRoute>
                }
              />

              <Route
                path="connection_requests"
                element={
                  <PrivateRoute
                    element={FConnectionRequests}
                    allowedRoles={["freelancer", "student"]}
                  />
                }
              />

              <Route
                path="chat/*"
                element={
                  <PrivateRoute
                    element={ChatSystem}
                    allowedRoles={["freelancer", "student"]}
                  />
                }
              />

            </Route>

            {/* Catch-all route */}
            <Route
              path="*"
              element={
                token ? (
                  <Navigate
                    to={`/${Cookies.get('role') === 'student' ? 'freelancer' : Cookies.get('role')}/homepage`}
                    replace
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </ConfigProvider>
  );
};

export default App;
