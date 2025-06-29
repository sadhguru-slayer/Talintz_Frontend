import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaSearch, FaBell, FaUserCircle, FaPlus, FaLock, FaUsers, FaWallet } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, Spin } from 'antd';
import { RiMessage3Fill } from "react-icons/ri";
import { useMediaQuery } from 'react-responsive';
import api from '../../config/axios';
import { VideoCameraOutlined, PhoneOutlined, MoreOutlined } from '@ant-design/icons';

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

const CHeader = ({ isAuthenticated = true, userId, sidebarCollapsed = true }) => {
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
  const [isProfiledClicked, setIsProfiledClicked] = useState(false);
  const socketRef = useRef(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [user, setUser] = useState(null);

  // Updated Quick Actions with new color scheme
  const quickActions = [
    {
      icon: <FaPlus className="text-lg" />,
      label: 'Post Project',
      path: '/client/post-project',
      color: 'text-client-accent',
      bgColor: 'bg-client-accent/10',
    },
    {
      icon: <FaUsers className="text-lg" />,
      label: 'Find Talent',
      path: '/client/browse-freelancers',
      color: 'text-client-accent',
      bgColor: 'bg-client-accent/10',
    }
  ];

  // Optimize WebSocket connection for notifications
  useEffect(() => {
    const socket = new WebSocket(
      `wss://talintzbackend-production.up.railway.app/ws/notification_count/?token=${Cookies.get('accessToken')}`
    );
  
    socket.onmessage = function (event) {
      const data = JSON.parse(event.data);
      if (data.notifications_count !== undefined) {
        setNotificationsCount(data.notifications_count);
      }
    };
  
    socket.onclose = function (event) {
      if (event.code !== 1000) {
        console.error("WebSocket closed unexpectedly");
      }
    };
  
    return () => socket.close();
  }, []);

  // Optimize WebSocket connection for search with debounce
  useEffect(() => {
    const connectWebSocket = () => {
      socketRef.current = new WebSocket("wss://talintzbackend-production.up.railway.app/ws/search/");
      
      socketRef.current.onopen = () => {
        const token = Cookies.get("accessToken");
        if (token) {
          socketRef.current.send(JSON.stringify({ type: "auth", token }));
        }
      };

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.error) return;
        setSearchResults({
          users: data.users || [],
          projects: data.projects || [],
        });
        setShowResults(true);
      };

      socketRef.current.onclose = () => setTimeout(connectWebSocket, 3000);
    };

    connectWebSocket();
    return () => socketRef.current?.close();
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
      }
    };
    fetchUser();
  }, []);

  // Optimize click outside handlers by combining them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown')) {
        setIsProfiledClicked(false);
      }
      if (!event.target.closest('.messages-dropdown')) {
        setIsMessagesOpen(false);
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
          token: Cookies.get("accessToken")
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
        console.log(response.data)
        if (isMounted) {
          setWalletBalance(response.data.balance);
          setIsLoadingWallet(false);
        }
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
        if (isMounted) setIsLoadingWallet(false);
      }
    };

    fetchWalletBalance();
    const intervalId = setInterval(fetchWalletBalance, 30000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleLogout = async () => {
    try {
    const refreshToken = Cookies.get("refreshToken");
    const accessToken = Cookies.get("accessToken");
      
    if (!refreshToken) {
      navigate("/login");
      return;
    }

      await axios.post(
        "https://talintzbackend-production.up.railway.app/api/logout/",
        { refreshToken, accessToken },
        {
        headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      Cookies.remove("role");
      Cookies.remove("userId");
      localStorage.clear();
      setTimeout(() => {  
        navigate("/client/homepage");
      }, 1000);
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/client/homepage");
    }
  };

  const MobileSearch = () => {
    if (!isMobileSearchOpen) return null;

    return (
      <div className="fixed inset-0 bg-client-primary z-[100] mt-16">
        {/* Search Input */}
        <div className="sticky top-0 p-4 bg-client-primary border-b border-white/10">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects, freelancers..."
              className="w-full px-4 py-3 pl-10 pr-16 rounded-lg bg-white/5 border border-white/10 focus:border-client-accent focus:ring-1 focus:ring-client-accent/20 text-white placeholder-white/50"
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

        {/* Search Results */}
        <div className="h-[calc(100vh-4rem)] overflow-y-auto pb-20">
          <div className={`transition-opacity duration-200 ${searchTerm.length >= 2 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="p-4">
              {/* Users Section */}
              {searchResults.users.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-white/50 mb-3 px-2 uppercase tracking-wide">USERS</h3>
                  <div className="space-y-2">
                    {searchResults.users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-all duration-200"
                        onClick={() => {
                          navigate(`/${user.pathrole}/profile/${user.id}/view_profile`);
                          setIsMobileSearchOpen(false);
                        }}
                      >
                        {user.profile_picture ? (
                          <img 
                            src={`wss://talintzbackend-production.up.railway.app${user.profile_picture}`} 
                            alt="" 
                            className="w-8 h-8 rounded-full object-cover border border-white/20"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-client-accent/20 flex items-center justify-center">
                            <FaUserCircle className="text-client-accent text-sm" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white text-sm">{user.username}</p>
                          <p className="text-xs text-white/50 capitalize">{user.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Section */}
              {searchResults.projects.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-white/50 mb-3 px-2 uppercase tracking-wide">PROJECTS</h3>
                  <div className="space-y-2">
                    {searchResults.projects.map((project) => (
                      <div
                        key={project.id}
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
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {searchTerm.length >= 2 && !searchResults.users.length && !searchResults.projects.length && (
                <div className="p-8 text-center">
                  <p className="text-white/50 text-sm">No results found for "{searchTerm}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Initial State */}
          {searchTerm.length < 2 && (
            <div className="p-8 text-center text-white/50 text-sm">
              Start typing to search...
            </div>
          )}
        </div>
      </div>
    );
  };

  const WalletDisplay = ({ isCompact = false }) => {
    const formatBalance = (balance) => {
      if (balance === null) return '---';
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(balance);
    };

    if (isCompact) {
      return (
        <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaWallet className="text-client-accent text-sm" />
            <span className="text-sm text-white/70">Balance:</span>
          </div>
          {isLoadingWallet ? (
            <Spin size="small" />
          ) : (
            <span className="text-sm font-medium text-white">
              {formatBalance(walletBalance)}
            </span>
          )}
        </div>
      );
    }

    return (
      <Tooltip title="Wallet Balance" overlayClassName="dark-tooltip">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative cursor-pointer group"
          onClick={() => navigate('/client/wallet')}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200">
            <FaWallet className="text-client-accent text-sm" />
            {isLoadingWallet ? (
              <Spin size="small" />
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

  // Messages Dropdown Component
  const MessagesDropdown = () => {
    if (!isMessagesOpen) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute right-0 mt-2 w-80 rounded-xl bg-client-primary border border-white/10 overflow-hidden z-[100] shadow-2xl backdrop-blur-xl"
      >
        <div className="py-2">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-white text-sm">Messages</h3>
              <button 
                onClick={() => navigate('/client/chat')}
                className="text-xs text-client-accent hover:text-client-accent/80 transition-colors"
              >
                View All
              </button>
            </div>
          </div>

          {/* Messages List */}
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

          {/* Footer */}
          <div className="px-4 py-3 bg-white/5 border-t border-white/10">
            <button
              onClick={() => {
                setIsMessagesOpen(false);
                navigate('/client/chat');
              }}
              className="w-full py-2 text-center text-xs text-client-accent hover:text-client-accent/80 transition-colors"
            >
              Open Messages
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Add shouldShowRestricted function
  const shouldShowRestricted = () => {
    return !isAuthenticated || !Cookies.get('accessToken');
  };

  return (
    <>
      <header className={`
        sticky top-0 bg-client-primary/95 backdrop-blur-xl border-b border-white/5 
        h-16 min-h-[64px] flex items-center px-6 justify-between z-50 transition-all duration-300
        `}>
        {/* Logo Section - Minimal */}
        <div className="flex items-center w-[120px] flex-shrink-0">
          <Link 
            to="/client/homepage" 
            className="flex items-center gap-2"
          >
            <img 
              src="/logo.png" 
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
              className="flex items-center gap-2 px-4 py-1.5 bg-client-accent hover:bg-client-accent/90 text-white rounded-lg transition-all duration-200 text-sm"
            >
              Sign In
            </motion.button>
          </div>
        ) : (
          <>
            {/* Search Bar - Minimal and Centered */}
            <div className="relative hidden lg:block flex-1 mx-8">
              <div className="relative w-full max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-4 py-2 pl-9 pr-4 rounded-lg bg-white/5 border border-white/10 focus:border-client-accent focus:ring-1 focus:ring-client-accent/20 transition-all duration-200 text-white placeholder-white/50 text-sm"
                  value={searchTerm}
                  onChange={handleSearchInput}
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
                    className="absolute z-[100] top-full left-1/2 -translate-x-1/2 bg-client-primary mt-2 rounded-xl border border-white/10 overflow-hidden w-full max-w-md shadow-2xl backdrop-blur-xl"
                  >
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {/* Users Section */}
                      {searchResults.users.length > 0 && (
                        <div className="p-3">
                          <h3 className="text-xs font-medium text-white/50 mb-2 uppercase tracking-wide">USERS</h3>
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
                                    src={`wss://talintzbackend-production.up.railway.app/${user.profile_picture}`} 
                                    alt="" 
                                    className="w-6 h-6 rounded-full object-cover border border-white/20"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-client-accent/20 flex items-center justify-center">
                                    <FaUserCircle className="text-client-accent text-xs" />
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

                      {/* Projects Section */}
                      {searchResults.projects.length > 0 && (
                        <div className="p-3 border-t border-white/10">
                          <h3 className="text-xs font-medium text-white/50 mb-2 uppercase tracking-wide">PROJECTS</h3>
                          <div className="space-y-1">
                            {searchResults.projects.map((project) => (
                              <motion.div
                                key={project.id}
                                whileHover={{ x: 2 }}
                                className="p-2 hover:bg-white/5 rounded-lg cursor-pointer"
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

                      {/* No Results */}
                      {!searchResults.users.length && !searchResults.projects.length && (
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
              <Tooltip title="Notifications" overlayClassName="dark-tooltip">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative cursor-pointer group"
                  onClick={() => navigate('/client/notifications')}
                >
                  <div className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200">
                    <FaBell className={`text-sm ${
                      location.pathname === '/client/notifications' 
                        ? 'text-client-accent' 
                        : 'text-white/60 group-hover:text-white'
                    } transition-colors`} />
                    {notificationsCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center border border-client-primary"
                      >
                        {notificationsCount > 9 ? '9+' : notificationsCount}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </Tooltip>

              {/* Messages Icon - Minimal */}
              <div className="relative messages-dropdown">
                <Tooltip title="Messages" overlayClassName="dark-tooltip">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative cursor-pointer group"
                    onClick={() => setIsMessagesOpen(!isMessagesOpen)}
                  >
                    <div className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200">
                      <RiMessage3Fill className={`text-sm ${
                        location.pathname.includes('/client/messages') 
                          ? 'text-client-accent' 
                          : 'text-white/60 group-hover:text-white'
                      } transition-colors`} />
                      {unreadMessages > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 bg-client-accent text-white text-xs rounded-full h-4 w-4 flex items-center justify-center border border-client-primary"
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
              <div className="relative profile-dropdown">
                <Tooltip title="Profile" overlayClassName="dark-tooltip">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsProfiledClicked(!isProfiledClicked)}
                    className="cursor-pointer p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200"
                  >
                    {user?.profile_picture ? (
                      <img 
                        src={`wss://talintzbackend-production.up.railway.app/${user.profile_picture}`} 
                        alt="" 
                        className="w-6 h-6 object-cover rounded-full"
                      />
                    ) : (
                      <FaUserCircle className="text-sm text-white/60 hover:text-white transition-colors" />
                    )}
                  </motion.div>
                </Tooltip>

                {/* Profile Dropdown Menu - Minimal */}
                <AnimatePresence>
                  {isProfiledClicked && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-64 rounded-xl bg-client-primary border border-white/10 overflow-hidden z-[100] shadow-2xl backdrop-blur-xl"
                    >
                      <div className="py-2">
                        <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-client-accent flex items-center justify-center">
                              {user?.profile_picture ? (
                                <img 
                                  src={`wss://talintzbackend-production.up.railway.app/${user.profile_picture}`} 
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
                            <span className="w-1.5 h-1.5 rounded-full bg-client-accent"></span>
                            <span>Online</span>
                          </div>
                        </div>

                        {/* Add wallet display for mobile */}
                        <div className="md:hidden">
                          <WalletDisplay isCompact={true} />
                        </div>

                        <div className="py-2">
                          <motion.button
                            whileHover={{ x: 2 }}
                            className="w-full px-4 py-2 text-left hover:bg-white/5 flex items-center gap-3 text-white/70 hover:text-white transition-all duration-200 text-sm"
                            onClick={() => { 
                              setIsProfiledClicked(false);
                              navigate(`/client/profile/${userId}`);
                            }}
                          >
                            <span>Profile</span>
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ x: 2 }}
                            className="w-full px-4 py-2 text-left hover:bg-white/5 flex items-center gap-3 text-white/70 hover:text-white transition-all duration-200 text-sm"
                            onClick={() => {
                              setIsProfiledClicked(false);
                              navigate('/settings');
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
          width: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.15);
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.25);
        }

        .dark-tooltip .ant-tooltip-inner {
          background-color: rgba(26, 27, 46, 0.95) !important;
          color: white !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 8px !important;
          backdrop-filter: blur(12px) !important;
          font-size: 12px !important;
        }

        .dark-tooltip .ant-tooltip-arrow::before {
          background-color: rgba(26, 27, 46, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        input[type="text"] {
          caret-color: var(--client-accent);
        }

        input[type="text"]:focus {
          background-color: rgba(255, 255, 255, 0.08) !important;
        }

        /* Prevent autofill background color change */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 30px rgba(26, 27, 46, 0.9) inset !important;
          -webkit-text-fill-color: white !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </>
  );
};

export default CHeader;
