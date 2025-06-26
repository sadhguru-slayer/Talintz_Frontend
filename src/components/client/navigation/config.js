// Navigation configuration
import { 
  FaHome, FaProjectDiagram, FaClipboardList, FaHandshake,
  FaChartLine, FaInbox, FaWallet, FaCalendarAlt,
  FaUserCircle, FaCog, FaStar, FaChartBar, FaPlus, FaTrophy
} from 'react-icons/fa';

// Main navigation - Essential links that users need quick access to
export const createMainLinks = (iconClass, projectId) => [
  {
    id: 'homepage',
    path: '/client/homepage',
    icon: FaHome,
    label: 'Home',
    tooltip: 'Home Page'
  },
  {
    id: 'post-project',
    path: '/client/post-project',
    icon: FaProjectDiagram,
    label: 'Post Project',
    tooltip: 'Create New Project'
  },
  {
    id: 'find-talent',
    path: '/client/find-talent',
    icon: FaHandshake,
    label: 'Find Talent',
    tooltip: 'Find Freelancers'
  },
  {
    id: 'obsp',
    path: '/client/obsp/list',
    icon: FaTrophy,
    label: 'OBSP Packs',
    tooltip: 'Outcome-Based Service Packs'
  },
  // {
  //   id: 'workspace',
  //   path: `/client/workspace/${projectId}/project-detail`,
  //   icon: FaClipboardList,
  //   label: 'Workspace',
  //   tooltip: 'Project Workspace'
  // }
];

// Dashboard links - Focused on project and financial management
export const createDashboardLinks = (iconClass) => [
  {
    id: 'overview',
    path: '/client/dashboard/overview',
    icon: FaChartLine,
    label: 'Overview',
    tooltip: 'Dashboard Overview'
  },
  {
    id: 'projects',
    path: '/client/dashboard/projects',
    icon: FaProjectDiagram,
    label: 'Projects',
    tooltip: 'Manage Projects'
  },
  {
    id: 'spendings',
    path: '/client/dashboard/spendings',
    icon: FaWallet,
    label: 'Spendings',
    tooltip: 'Track Spendings'
  },
  // {
  //   id: 'analytics',
  //   path: '/client/dashboard/analytics',
  //   icon: FaChartBar,
  //   label: 'Analytics',
  //   tooltip: 'View Analytics'
  // }
];

// Profile links - Essential user-related features
export const createProfileLinks = (iconClass, userId) => [
  {
    id: 'view_profile',
    path: `/client/profile/${userId}/view_profile`,
    icon: FaUserCircle,
    label: 'View Profile',
    tooltip: 'View Your Profile'
  },
  {
    id: 'edit_profile',
    path: `/client/profile/${userId}/edit_profile`,
    icon: FaCog,
    label: 'Edit Profile',
    tooltip: 'Edit Profile Settings'
  },
  {
    id: 'reviews_ratings',
    path: `/client/profile/${userId}/reviews_ratings`,
    icon: FaStar,
    label: 'Reviews',
    tooltip: 'View Reviews & Ratings'
  }
];

// Mobile links - Keep only the most essential features for mobile
export const createMobileLinks = (iconClass) => [
  { 
    id: 'homepage', 
    path: '/client/homepage', 
    link: '/client/homepage',
    icon: FaHome,
    className: iconClass,
    label: 'Home'
  },
  { 
    id: 'dashboard', 
    path: '/client/dashboard', 
    link: '/client/dashboard',
    icon: FaChartBar,
    className: iconClass,
    label: 'Dashboard'
  },
  { 
    id: 'post-project', 
    path: '/client/post-project', 
    link: '/client/post-project',
    icon: FaPlus,
    className: "text-lg",
    label: 'Post'
  }
]; 