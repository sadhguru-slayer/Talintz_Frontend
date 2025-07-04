import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tooltip, Modal } from 'antd';
import { motion } from 'framer-motion';
import { FaSignOutAlt, FaBars, FaChevronDown } from 'react-icons/fa';
import { useMediaQuery } from 'react-responsive';
import Cookies from 'js-cookie';
import axios from 'axios';
import PropTypes from 'prop-types';

import { 
  createMainLinks, 
  createDashboardLinks, 
  createProfileLinks,
  createMobileLinks 
} from './navigation/config';
import { SidebarLink } from './navigation/SidebarLink';
import { MobileNavigation } from './navigation/MobileNavigation';
import { DropdownSection } from './navigation/DropdownSection';
import { getBaseURL } from '../../config/axios';

const FSider = ({ 
  userId, 
  role, 
  isAuthenticated, 
  isEditable,
  dropdown, 
  collapsed, 
  handleMenuClick, 
  abcds,
  handleProfileMenu,
  activeProfileComponent,
  activeSection
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed || false);
  const [showText, setShowText] = useState(!collapsed);
  const [dropdowns, setDropdowns] = useState({
    dashboard: true,
    profile: true
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logoutStep, setLogoutStep] = useState('initial');
  
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const iconClass = "w-5 h-5";
  const sidebarRef = useRef(null);

  // Generate navigation links
  const mainLinks = createMainLinks(iconClass);
  const dashboardLinks = createDashboardLinks(iconClass);
  const profileLinks = createProfileLinks(iconClass, userId);
  const mobileLinks = createMobileLinks(iconClass, userId);

  const showLogoutModal = () => {
    setIsModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  const handleLogout = async () => {
    setLogoutStep('processing');

    try {
    const refreshToken = Cookies.get('refreshToken');
    const accessToken = Cookies.get('accessToken');

    if (!refreshToken) {
        window.location.reload();
      return;
    }

      await axios.post(`${getBaseURL()}/api/logout/`,
        { accessToken, refreshToken },
        { headers: { Authorization: `Bearer ${accessToken}` }}
      );

      // Remove all cookies
      Cookies.remove('accessToken', { path: '/' });
      Cookies.remove('refreshToken', { path: '/' });
      Cookies.remove('userId', { path: '/' });
      Cookies.remove('role', { path: '/' });
      Cookies.remove('is_talentrise', { path: '/' });

      setLogoutStep('done');

      await new Promise(resolve => setTimeout(resolve, 1500));
      window.location.reload(true);

    } catch (error) {
      console.error('Logout error:', error);
      setLogoutStep('done');

      // Clear cookies even on error
      Cookies.remove('accessToken', { path: '/' });
      Cookies.remove('refreshToken', { path: '/' });
      Cookies.remove('userId', { path: '/' });
      Cookies.remove('role', { path: '/' });
      Cookies.remove('is_talentrise', { path: '/' });

      await new Promise(resolve => setTimeout(resolve, 1500));
      window.location.reload(true);
    }
  };

  const getModalContent = () => {
    switch (logoutStep) {
      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-8 h-8 border-2 border-freelancer-accent border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white text-center">Logging you out...</p>
          </div>
        );
      case 'done':
        return (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-8 h-8 bg-freelancer-accent rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-sm">✓</span>
            </div>
            <p className="text-white text-center">Logout successful!</p>
          </div>
        );
      default:
        return (
          <div className="text-center py-4">
            <p className="text-white mb-2">Are you sure you want to logout?</p>
            <p className="text-white/60 text-sm">You'll need to sign in again to access your account.</p>
          </div>
        );
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (isCollapsed) {
      setTimeout(() => setShowText(true), 200);
    } else {
      setShowText(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsCollapsed(true);
        setShowText(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDropdownToggle = (section) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setTimeout(() => {
        setShowText(true);
        setDropdowns(prev => ({ ...prev, [section]: true }));
      }, 200);
    } else {
      setDropdowns(prev => ({ ...prev, [section]: !prev[section] }));
    }
  };

  // Return MobileNavigation for mobile screens
  if (isMobile) {
    return (
      <MobileNavigation 
        links={mobileLinks}
        dashboardLinks={dashboardLinks}
        profileLinks={profileLinks}
        userId={userId}
        currentUserId={userId}
        activeSection={activeSection}
        activeProfileComponent={activeProfileComponent}
      />
    );
  }

  return (
    <div
      ref={sidebarRef}
      className={`
        h-screen bg-freelancer-primary backdrop-blur-xl flex flex-col
        transition-all duration-300 ease-in-out fixed z-[100]
        border-r border-white/5
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Sidebar Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/5">
        {!isCollapsed && showText && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-freelancer-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">F</span>
            </div>
            <span className="text-white font-semibold text-lg">Freelancer</span>
          </div>
        )}
        
        <Tooltip title={isCollapsed ? "Expand" : "Collapse"} placement="right">
            <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            <FaBars className="w-4 h-4 text-white/60 hover:text-white" />
            </motion.button>
          </Tooltip>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {/* Main Links */}
        <div className="space-y-1">
          {mainLinks.map((link) => (
            <SidebarLink 
              key={link.abcd}
              link={link}
              isCollapsed={isCollapsed}
              showText={showText}
              currentPath={location.pathname}
              iconClass={iconClass}
              darkTheme={true}
            />
          ))}
        </div>
    
        {/* Dashboard Section */}
        <DropdownSection
          title="Dashboard"
          icon={FaChevronDown}
          isOpen={dropdowns.dashboard}
          isCollapsed={isCollapsed}
          links={dashboardLinks}
          currentPath={location.pathname}
          onToggle={() => handleDropdownToggle('dashboard')}
          iconClass={iconClass}
          darkTheme={true}
        />

        {/* Profile Section */}
        <DropdownSection
          title="Profile"
          icon={FaChevronDown}
          isOpen={dropdowns.profile}
          isCollapsed={isCollapsed}
          links={profileLinks}
          currentPath={location.pathname}
          onToggle={() => handleDropdownToggle('profile')}
          iconClass={iconClass}
          darkTheme={true}
        />
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-white/5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
          onClick={showLogoutModal}
          className={`
            w-full flex items-center gap-3 p-2.5 rounded-lg
            bg-red-500/10 hover:bg-red-500/20 
            border border-red-500/20 hover:border-red-500/30
            transition-all duration-200
            ${isCollapsed ? 'justify-center' : 'justify-start'}
          `}
        >
          <FaSignOutAlt className="w-4 h-4 text-red-400" />
          {!isCollapsed && showText && (
            <span className="text-red-400 font-medium text-sm">
                Logout
              </span>
          )}
            </motion.button>
      </div>

      {/* Logout Modal */}
      <Modal
        title={
          <div className="text-white font-semibold">
            {logoutStep === 'initial' ? "Confirm Logout" : "Logging Out"}
          </div>
        }
        open={isModalOpen}
        onOk={handleLogout}
        onCancel={handleModalCancel}
        okText="Yes, logout"
        cancelText="Cancel"
        footer={logoutStep === 'initial' ? undefined : null}
        closable={logoutStep === 'initial'}
        maskClosable={logoutStep === 'initial'}
        className="dark-modal"
        styles={{
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
          content: { 
            backgroundColor: '#0F0F23',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px'
          }
        }}
      >
        <div className="bg-freelancer-primary rounded-lg p-4">
          {getModalContent()}
        </div>
      </Modal>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }

        .dark-tooltip .ant-tooltip-inner {
          background-color: rgba(15, 15, 35, 0.95) !important;
          color: white !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 8px !important;
        }

        .dark-tooltip .ant-tooltip-arrow::before {
          background-color: rgba(15, 15, 35, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .dark-modal .ant-modal-header {
          background-color: #0F0F23 !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .dark-modal .ant-modal-footer {
          background-color: #0F0F23 !important;
          border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .dark-modal .ant-btn-primary {
          background-color: #00D4AA !important;
          border-color: #00D4AA !important;
        }

        .dark-modal .ant-btn-primary:hover {
          background-color: rgba(0, 212, 170, 0.8) !important;
          border-color: rgba(0, 212, 170, 0.8) !important;
        }

        .dark-modal .ant-btn-default {
          background-color: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
          color: white !important;
        }

        .dark-modal .ant-btn-default:hover {
          background-color: rgba(255, 255, 255, 0.2) !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
        }
      `}</style>
    </div>
  );
};

FSider.propTypes = {
  userId: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  isEditable: PropTypes.bool.isRequired,
  dropdown: PropTypes.bool,
  collapsed: PropTypes.bool,
  handleMenuClick: PropTypes.func,
  abcds: PropTypes.string,
  handleProfileMenu: PropTypes.func,
  activeProfileComponent: PropTypes.string,
  activeSection: PropTypes.string
};

export default FSider;

<style jsx global>{`
  .h-safe-area {
    height: env(safe-area-inset-bottom);
  }

  @supports not (height: env(safe-area-inset-bottom)) {
    .h-safe-area {
      height: 0px;
    }
  }

  @media (min-width: 768px) {
    .main-content {
      margin-left: 4rem;
    }
    
    .sidebar-expanded .main-content {
      margin-left: 16rem;
    }
  }

  @media (max-width: 767px) {
    .main-content {
      margin-left: 0 !important;
      padding-bottom: 5rem;
    }
  }

  .dropdown-enter {
    opacity: 0;
    transform: translateY(-10px);
  }
  
  .dropdown-enter-active {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 200ms, transform 200ms;
  }
  
  .dropdown-exit {
    opacity: 1;
    transform: translateY(0);
  }
  
  .dropdown-exit-active {
    opacity: 0;
    transform: translateY(-10px);
    transition: opacity 200ms, transform 200ms;
  }
`}</style>
