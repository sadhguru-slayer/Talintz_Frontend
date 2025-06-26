import { 
  FaHome, FaSearch, FaUserCircle, FaChartBar, FaProjectDiagram,
  FaClipboardList, FaCalendarAlt, FaHandshake, FaInbox, FaCog, FaEdit,
  FaTrophy, FaBriefcase
} from 'react-icons/fa';

export const createMainLinks = (iconClass) => [
  { 
    abcd: 'homepage', 
    to: '/freelancer/homepage', 
    icon: FaHome,
    text: 'Home',
    tooltip: 'Home Page'
  },
  { 
    abcd: 'browse-projects', 
    to: '/freelancer/browse-projects', 
    icon: FaSearch,
    text: 'Browse Projects',
    tooltip: 'Browse Available Projects'
  },
  { 
    abcd: 'obsp', 
    to: '/freelancer/obsp', 
    icon: FaTrophy,
    text: 'OBSP',
    tooltip: 'Outcome-Based Service Packs'
  }
];

export const createDashboardLinks = (iconClass) => [
  { 
    abcd: 'freelancer-analytics', 
    to: '/freelancer/dashboard/freelancer-analytics',
    text: 'Analytics', 
    icon: FaChartBar,
    tooltip: 'Activity Overview' 
  },
  { 
    abcd: 'project-management', 
    to: '/freelancer/dashboard/projects',
    text: 'Project Management', 
    icon: FaProjectDiagram,
    tooltip: 'Manage Projects' 
  },
  { 
    abcd: 'bidding-overview', 
    to: '/freelancer/dashboard/bidding-overview',
    text: 'Bidding Overview', 
    icon: FaClipboardList,
    tooltip: 'View Bids' 
  },
  { 
    abcd: 'upcoming-events', 
    to: '/freelancer/dashboard/upcoming-events',
    text: 'Upcoming Events', 
    icon: FaCalendarAlt,
    tooltip: 'View Events' 
  }
];

export const createProfileLinks = (iconClass, userId) => [
  { 
    abcd: 'view_profile', 
    to: `/freelancer/profile/${userId}/view_profile`, 
    text: 'View Profile', 
    icon: FaUserCircle,
    tooltip: 'View Your Profile' 
  },
  { 
    abcd: 'connections', 
    to: `/freelancer/profile/${userId}/connections`, 
    text: 'Connections', 
    icon: FaHandshake,
    tooltip: 'Manage Connections' 
  },
  { 
    abcd: 'edit_profile', 
    to: `/freelancer/profile/${userId}/edit_profile`, 
    text: 'Edit Profile', 
    icon: FaEdit,
    tooltip: 'Profile Edit' 
  },
  { 
    abcd: 'portfolio', 
    to: `/freelancer/profile/${userId}/portfolio`, 
    text: 'Portfolio', 
    icon: FaProjectDiagram,
    tooltip: 'Manage Portfolio' 
  },
  { 
    abcd: 'settings', 
    to: `/freelancer/profile/${userId}/settings`, 
    text: 'Settings', 
    icon: FaCog,
    tooltip: 'Profile Settings' 
  }
];

export const createMobileLinks = (iconClass, userId) => [
  { 
    abcd: 'homepage', 
    to: '/freelancer/homepage', 
    icon: FaHome,
    text: 'Home'
  },
  { 
    abcd: 'dashboard', 
    to: '/freelancer/dashboard', 
    icon: FaChartBar,
    text: 'Dashboard'
  },
  { 
    abcd: 'browse-projects', 
    to: '/freelancer/browse-projects', 
    icon: FaSearch,
    text: 'Browse'
  },
  { 
    abcd: 'obsp', 
    to: '/freelancer/obsp', 
    icon: FaTrophy,
    text: 'OBSP'
  },
  { 
    abcd: 'profile', 
    to: `/freelancer/profile/${userId}`, 
    icon: FaUserCircle,
    text: 'Profile'
  }
]; 