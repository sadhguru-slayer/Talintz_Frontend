import axios from "axios";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaSearch, FaBell, FaUserCircle, FaComments, FaHome, FaWallet, FaCog } from "react-icons/fa";
import { FaPlus, FaLock, FaEnvelope, FaUsers } from "react-icons/fa";
import { FaDiagramProject } from "react-icons/fa6";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, Badge, Input, AutoComplete, Spin } from 'antd';
import { useMediaQuery } from 'react-responsive';
import { RiMessage3Fill } from "react-icons/ri";
import PropTypes from 'prop-types';
import DOMPurify from "dompurify";
import api from '../../config/axios';

// Add debounce implementation
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const FHeader = ({ userId, role, isAuthenticated, isEditable, sidebarCollapsed = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState({
    users: [],
    projects: [],
  });
  const [showResults, setShowResults] = useState(false);
  const [isProfileClicked, setIsProfileClicked] = useState(false);
  const socketRef = useRef(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [user, setUser] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Quick Actions (Freelancer specific)
  const quickActions = [
    {
      icon: <FaDiagramProject className="text-lg" />,
      label: 'My Projects',
      path: '/freelancer/dashboard/projects',
      color: 'text-freelancer-accent',
      bgColor: 'bg-freelancer-accent/10',
    },
    {
      icon: <FaSearch className="text-lg" />,
      label: 'Browse Projects',
      path: '/freelancer/browse-projects',
      color: 'text-freelancer-accent',
      bgColor: 'bg-freelancer-accent/10',
    }
  ];


  useEffect(() => {
    const socket = new WebSocket(
        `wss://talintzbackend-production.up.railway.app/ws/freelancer/notification_count/?token=${Cookies.get('accessToken')}`
    );

    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        if (data.notifications_count !== undefined) {
            setNotificationsCount(data.notifications_count);
        }
        if (data.unread_messages !== undefined) {
             setUnreadMessages(data.unread_messages);
        }
    };

    socket.onclose = function (event) {
      if (event.code !== 1000) {
        console.error("Freelancer Notification WebSocket closed unexpectedly");
      }
    };

    socket.onerror = function (error) {
      console.error("Freelancer Notification WebSocket error:", error);
    };

    return () => socket.close();
  }, []);


  // Optimize user fetch
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/api/profile/', {
          headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` },
        });
        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
         if (error.response && error.response.status === 401) {
             handleLogout();
         }
      }
    };
    if (isAuthenticated) {
        fetchUser();
    } else {
        setUser(null);
    }
  }, [isAuthenticated]);

  // Optimize click outside handlers by combining them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileClicked(false);
      }
      if (messagesDropdownRef.current && !messagesDropdownRef.current.contains(event.target)) {
        setIsMessagesOpen(false);
      }
      if (!event.target.closest('.search-container')) {
           setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Optimize search handler with useCallback and debounce
  const handleSearch = useCallback(
    debounce((term) => {
      if (term.length >= 2 && socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          query: term,
          token: Cookies.get("accessToken"),
          role_filter: 'client'
         }));
      } else {
        setShowResults(false);
      }
    }, 300),
    []
  );

  const handleSearchInput = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    handleSearch(term);
  };

  // Optimize wallet balance fetch with proper cleanup
  useEffect(() => {
    let isMounted = true;
    const fetchWalletBalance = async () => {
      try {
        const response = await api.get('/api/finance/wallet/balance/', {
          headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` },
        });
        if (isMounted) {
          setWalletBalance(response.data.balance);
          setIsLoadingWallet(false);
        }
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
        if (isMounted) setIsLoadingWallet(false);
         if (isMounted && error.response && error.response.status === 401) {
             handleLogout();
         }
      }
    };

    if (isAuthenticated) {
        fetchWalletBalance();
        const intervalId = setInterval(fetchWalletBalance, 30000);

        return () => {
          isMounted = false;
          clearInterval(intervalId);
        };
    } else {
        return () => {};
    }

  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
    const refreshToken = Cookies.get("refreshToken");
    const accessToken = Cookies.get("accessToken");

    if (!refreshToken) {
      navigate("/login");
      return;
    }

      await axios.post(
        "http://localhost:8000/api/logout/",
        { refreshToken, accessToken },
        {
        headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      Cookies.remove("accessToken", { path: '/' });
      Cookies.remove("refreshToken", { path: '/' });
      Cookies.remove("role", { path: '/' });
      Cookies.remove("userId", { path: '/' });
      localStorage.clear();
      
      setTimeout(() => {
        navigate("/login");
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
       Cookies.remove("accessToken", { path: '/' });
       Cookies.remove("refreshToken", { path: '/' });
       Cookies.remove("role", { path: '/' });
       Cookies.remove("userId", { path: '/' });
       localStorage.clear();
       setTimeout(() => {
         navigate("/login");
       }, 100);
    }
  };

  // Wallet Display Component (similar to CHeader's)
  const WalletDisplay = ({ isCompact = false }) => {
    const formatBalance = (balance) => {
      if (balance === null) return '---';
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(balance);
    };

    if (isCompact) {
      return (
        <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaWallet className="text-freelancer-accent text-sm" />
            <span className="text-sm text-white/70">Balance:</span>
          </div>
          {isLoadingWallet ? (
            <Spin size="small" className="text-freelancer-accent" />
          ) : (
            <span className="text-sm font-medium text-white">
              {formatBalance(walletBalance)}
            </span>
          )}
        </div>
      );
    }

    return (
      <Tooltip title="Wallet Balance" overlayClassName="dark-tooltip freelancer-tooltip">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative cursor-pointer group"
          onClick={() => navigate('/freelancer/wallet')}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200">
            <FaWallet className="text-freelancer-accent text-sm" />
            {isLoadingWallet ? (
              <Spin size="small" className="text-freelancer-accent" />
            ) : (
              <span className="text-sm font-medium text-white">
                {formatBalance(walletBalance)}
              </span>
            )}
          </div>
        </motion.div>
      </Tooltip>
    );
  };

  // Messages Dropdown Component (similar to CHeader's)
  const MessagesDropdown = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute right-0 mt-2 w-80 rounded-xl bg-freelancer-primary border border-white/10 overflow-hidden z-[100] shadow-2xl backdrop-blur-xl"
        ref={messagesDropdownRef}
      >
        <div className="py-2">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-white text-sm">Messages</h3>
              <button
                onClick={() => {
                    setIsMessagesOpen(false);
                    navigate('/freelancer/chat');
                }}
                className="text-xs text-freelancer-accent hover:text-freelancer-accent/80 transition-colors"
              >
                View All
              </button>
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {unreadMessages > 0 ? (
               <div className="px-4 py-2 text-xs text-white/50">
                 You have {unreadMessages} unread message{unreadMessages > 1 ? 's' : ''}
               </div>
            ) : (
              <div className="p-8 text-center text-white/50 text-sm">
                No new messages
              </div>
            )}
          </div>

          <div className="px-4 py-3 bg-white/5 border-t border-white/10">
            <button
              onClick={() => {
                setIsMessagesOpen(false);
                navigate('/freelancer/chat');
              }}
              className="w-full py-2 text-center text-xs text-freelancer-accent hover:text-freelancer-accent/80 transition-colors"
            >
              Open Messages
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

   // Mobile Search Overlay Component (similar to CHeader's)
  const MobileSearch = () => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-freelancer-primary z-[100] mt-16"
      >
        <div className="sticky top-0 p-4 bg-freelancer-primary border-b border-white/10">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects, clients..."
              className="w-full px-4 py-3 pl-10 pr-16 rounded-lg bg-white/5 border border-white/10 focus:border-freelancer-accent focus:ring-1 focus:ring-freelancer-accent/20 text-white placeholder-white/50"
              value={searchTerm}
              onChange={handleSearchInput}
              autoFocus
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <button
              onClick={() => setIsMobileSearchOpen(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 text-white/60 hover:text-white text-sm"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="h-[calc(100vh-4rem)] overflow-y-auto pb-20 custom-scrollbar">
          <div className={`transition-opacity duration-200 ${searchTerm.length >= 2 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="p-4">
              {searchResults.users.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-white/50 mb-3 px-2 uppercase tracking-wide">CLIENTS</h3>
                  <div className="space-y-2">
                    {searchResults.users.map((user) => (
                      <motion.div
                        key={user.id}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-all duration-200"
                        onClick={() => {
                          navigate(`/${user.pathrole}/profile/${user.id}/view_profile`);
                          setIsMobileSearchOpen(false);
                        }}
                      >
                        {user.profile_picture ? (
                          <img
                            src={`http://localhost:8000${user.profile_picture}`}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-white/20"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-freelancer-accent/20 flex items-center justify-center">
                            <FaUserCircle className="text-freelancer-accent text-sm" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white text-sm">{user.username}</p>
                          <p className="text-xs text-white/50 capitalize">{user.role}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.projects.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-white/50 mb-3 px-2 uppercase tracking-wide">PROJECTS</h3>
                  <div className="space-y-2">
                    {searchResults.projects.map((project) => (
                       <motion.div
                        key={project.id}
                         whileTap={{ scale: 0.98 }}
                        className="p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-all duration-200"
                        onClick={() => {
                          navigate(`/project/${project.id}/view_project`);
                          setIsMobileSearchOpen(false);
                        }}
                      >
                        <p className="font-medium text-white text-sm">{project.title}</p>
                        <div
                          className="text-xs text-white/50 line-clamp-2"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(project.description)
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {searchTerm.length >= 2 && !searchResults.users.length && !searchResults.projects.length && (
                <div className="p-8 text-center">
                  <p className="text-white/50 text-sm">No results found for "{searchTerm}"</p>
                </div>
              )}
            </div>
          </div>

          {searchTerm.length < 2 && (
            <div className="p-8 text-center text-white/50 text-sm">
              Start typing to search projects or clients...
            </div>
          )}
        </div>
      </motion.div>
    );
  };

    // Add shouldShowRestricted function
  const shouldShowRestricted = () => {
    return !isAuthenticated || !Cookies.get('accessToken');
  };

  const toggleProfileDropdown = () => {
    setIsProfileClicked(prevState => !prevState);
    if (isMessagesOpen) setIsMessagesOpen(false);
  };

  const toggleMessagesDropdown = (e) => {
    e.stopPropagation();
    setIsMessagesOpen(prevState => !prevState);
    if (isProfileClicked) setIsProfileClicked(false);
  };

  // Refs for dropdown menus
  const profileDropdownRef = useRef(null);
  const messagesDropdownRef = useRef(null);

  return (
    <>
      <header className={`
        sticky top-0 bg-freelancer-primary backdrop-blur-xl border-b border-white/5
        h-16 min-h-[64px] flex items-center px-6 justify-between z-50 transition-all duration-300
        `}>
        {/* Logo Section - Minimal */}
        <div className="flex items-center w-[120px] flex-shrink-0">
          <Link
            to="/freelancer/homepage"
            className="flex items-center gap-2"
          >
            <img 
              src="/logo.jpg" 
              alt="Talintz Logo" 
              className="w-8 h-8 rounded-full object-cover border border-white/10"
            />
            <span className="text-white font-semibold text-lg hidden sm:block">Talintz</span>
          </Link>
        </div>

        {shouldShowRestricted() ? (
          // Restricted view - Minimal
          <div className="flex items-center gap-3 ml-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-4 py-1.5 bg-freelancer-accent hover:bg-freelancer-accent/90 text-white rounded-lg transition-all duration-200 text-sm"
            >
              Sign In
            </motion.button>
          </div>
        ) : (
          <>
            {/* Search Bar - Minimal and Centered */}
            <div className="relative hidden lg:block flex-1 mx-8 search-container">
              <div className="relative w-full max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-4 py-2 pl-9 pr-4 rounded-lg bg-white/5 border border-white/10 focus:border-freelancer-accent focus:ring-1 focus:ring-freelancer-accent/20 transition-all duration-200 text-white placeholder-white/50 text-sm"
                  value={searchTerm}
                  onChange={handleSearchInput}
                   onFocus={() => setShowResults(true)}
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm" />
              </div>

              {/* Search Results Dropdown - Minimal */}
              <AnimatePresence>
                {showResults && searchTerm.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-[100] top-full left-1/2 -translate-x-1/2 bg-freelancer-primary mt-2 rounded-xl border border-white/10 overflow-hidden w-full max-w-md shadow-2xl backdrop-blur-xl"
                  >
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {searchResults.users.length > 0 && (
                        <div className="p-3">
                          <h3 className="text-xs font-medium text-white/50 mb-2 uppercase tracking-wide">CLIENTS</h3>
                          <div className="space-y-1">
                            {searchResults.users.map((user) => (
                              <motion.div
                                key={user.id}
                                whileHover={{ x: 2 }}
                                className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg cursor-pointer"
                                onClick={() => navigate(`/${user.pathrole}/profile/${user.id}/view_profile`)}
                              >
                                {user.profile_picture ? (
                                  <img
                                    src={`http://localhost:8000/${user.profile_picture}`}
                                    alt=""
                                    className="w-6 h-6 rounded-full object-cover border border-white/20"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-freelancer-accent/20 flex items-center justify-center">
                                    <FaUserCircle className="text-freelancer-accent text-xs" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-white text-sm">{user.username}</p>
                                  <p className="text-xs text-white/50 capitalize">{user.role}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {searchResults.projects.length > 0 && (
                        <div className="p-3 border-t border-white/10">
                          <h3 className="text-xs font-medium text-white/50 mb-2 uppercase tracking-wide">PROJECTS</h3>
                          <div className="space-y-1">
                            {searchResults.projects.map((project) => (
                              <motion.div
                                key={project.id}
                                whileHover={{ x: 2 }}
                                className="p-2 hover:bg-white/5 rounded-lg cursor-pointer"
                                 onClick={() => navigate(`/project/${project.id}/view_project`)}
                              >
                                <p className="font-medium text-white text-sm">{project.title}</p>
                                <div
                                  className="text-xs text-white/50 line-clamp-1"
                                  dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(project.description)
                                  }}
                                />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                       {searchTerm.length >= 2 && !searchResults.users.length && !searchResults.projects.length && (
                        <div className="p-6 text-center">
                          <p className="text-white/50 text-sm">No results found</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions Section - Minimal */}
            <div className="flex items-center gap-3">
              {/* Wallet Display - Hidden on mobile */}
              <div className="hidden lg:block">
                <WalletDisplay />
              </div>

              {/* Mobile Search Button */}
              <div className="lg:hidden">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsMobileSearchOpen(true)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all duration-200"
                >
                  <FaSearch className="text-sm" />
                </motion.button>
              </div>

              {/* Notifications - Minimal */}
              <Tooltip title="Notifications" overlayClassName="dark-tooltip freelancer-tooltip">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative cursor-pointer group"
                  onClick={() => navigate('/freelancer/notifications')}
                >
                  <div className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200">
                    <FaBell className={`text-sm ${
                      location.pathname === '/freelancer/notifications'
                        ? 'text-freelancer-accent'
                        : 'text-white/60 group-hover:text-white'
                    } transition-colors`} />
                    {notificationsCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center border border-freelancer-primary"
                      >
                        {notificationsCount > 9 ? '9+' : notificationsCount}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </Tooltip>

              {/* Messages Icon - Minimal */}
              <div className="relative messages-dropdown">
                <Tooltip title="Messages" overlayClassName="dark-tooltip freelancer-tooltip">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative cursor-pointer group"
                    onClick={toggleMessagesDropdown}
                  >
                    <div className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200">
                      <RiMessage3Fill className={`text-sm ${
                        location.pathname.includes('/freelancer/chat')
                          ? 'text-freelancer-accent'
                          : 'text-white/60 group-hover:text-white'
                      } transition-colors`} />
                      {unreadMessages > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 bg-freelancer-accent text-white text-xs rounded-full h-4 w-4 flex items-center justify-center border border-freelancer-primary"
                        >
                          {unreadMessages > 9 ? '9+' : unreadMessages}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </Tooltip>

                {/* Messages Dropdown */}
                <AnimatePresence>
                  {isMessagesOpen && <MessagesDropdown />}
                </AnimatePresence>
              </div>

              {/* Profile - Minimal */}
              <div className="relative profile-dropdown" ref={profileDropdownRef}>
                <Tooltip title="Profile" overlayClassName="dark-tooltip freelancer-tooltip">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={toggleProfileDropdown}
                    className="cursor-pointer p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200"
                  >
                    {user?.profile_picture ? (
                      <img
                        src={`http://localhost:8000${user.profile_picture}`}
                        alt=""
                        className="w-6 h-6 object-cover rounded-full border border-white/20"
                      />
                    ) : (
                      <FaUserCircle className="text-sm text-white/60 hover:text-white transition-colors" />
                    )}
                  </motion.div>
                </Tooltip>

                {/* Profile Dropdown Menu - Minimal */}
                <AnimatePresence>
                  {isProfileClicked && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-64 rounded-xl bg-freelancer-primary border border-white/10 overflow-hidden z-[100] shadow-2xl backdrop-blur-xl"
                    >
                      <div className="py-2">
                        <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-freelancer-accent flex items-center justify-center">
                              {user?.profile_picture ? (
                                <img
                                  src={`http://localhost:8000${user.profile_picture}`}
                                  alt=""
                                  className="w-8 h-8 object-cover rounded-full"
                                />
                              ) : (
                                <FaUserCircle className="text-white text-lg" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{user?.username}</p>
                              <p className="text-xs text-white/50 truncate max-w-[180px]">{user?.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/50">
                             <span className="w-1.5 h-1.5 rounded-full bg-freelancer-accent"></span>
                             <span>{user?.role || 'Freelancer'}</span>
                          </div>
                        </div>

                        <div className="md:hidden">
                          <WalletDisplay isCompact={true} />
                        </div>

                        <div className="py-2">
                          <motion.button
                            whileHover={{ x: 2 }}
                            className="w-full px-4 py-2 text-left hover:bg-white/5 flex items-center gap-3 text-white/70 hover:text-white transition-all duration-200 text-sm"
                            onClick={() => {
                              setIsProfileClicked(false);
                              navigate(`/freelancer/profile/${userId}/view_profile`);
                            }}
                          >
                            <span>View Profile</span>
                          </motion.button>

                           <motion.button
                            whileHover={{ x: 2 }}
                            className="w-full px-4 py-2 text-left hover:bg-white/5 flex items-center gap-3 text-white/70 hover:text-white transition-all duration-200 text-sm"
                            onClick={() => {
                              setIsProfileClicked(false);
                              navigate(`/freelancer/profile/${userId}/portfolio`);
                            }}
                          >
                            <span>Portfolio</span>
                          </motion.button>
                           <motion.button
                            whileHover={{ x: 2 }}
                            className="w-full px-4 py-2 text-left hover:bg-white/5 flex items-center gap-3 text-white/70 hover:text-white transition-all duration-200 text-sm"
                            onClick={() => {
                              setIsProfileClicked(false);
                              navigate(`/freelancer/profile/${userId}/connections`);
                            }}
                          >
                            <span>Connections</span>
                          </motion.button>

                          <motion.button
                            whileHover={{ x: 2 }}
                            className="w-full px-4 py-2 text-left hover:bg-white/5 flex items-center gap-3 text-white/70 hover:text-white transition-all duration-200 text-sm"
                            onClick={() => {
                              setIsProfileClicked(false);
                              navigate(`/freelancer/profile/${userId}/settings`);
                            }}
                          >
                            <span>Settings</span>
                          </motion.button>

                          <div className="border-t border-white/10 mt-2 pt-2">
                            <motion.button
                              whileHover={{ x: 2 }}
                              className="w-full px-4 py-2 text-left hover:bg-white/5 flex items-center gap-3 text-red-400 hover:text-red-300 transition-all duration-200 text-sm"
                              onClick={handleLogout}
                            >
                              <span>Sign Out</span>
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isMobileSearchOpen && <MobileSearch />}
      </AnimatePresence>

      {/* Updated styles */}
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

        .freelancer-tooltip .ant-tooltip-inner {
          background-color: rgba(15, 15, 35, 0.95) !important;
          color: white !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 8px !important;
          backdrop-filter: blur(12px) !important;
          font-size: 12px !important;
        }

        .freelancer-tooltip .ant-tooltip-arrow::before {
          background-color: rgba(15, 15, 35, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        input[type="text"] {
          caret-color: var(--freelancer-accent);
        }

        input[type="text"]:focus {
          background-color: rgba(255, 255, 255, 0.08) !important;
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 30px rgba(15, 15, 35, 0.9) inset !important;
          -webkit-text-fill-color: white !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </>
  );
};

FHeader.propTypes = {
  userId: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  isEditable: PropTypes.bool.isRequired,
  sidebarCollapsed: PropTypes.bool
};

export default FHeader;
