import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Empty, Tooltip, Spin } from 'antd';
import FHeader from '../../components/freelancer/FHeader';
import FSider from '../../components/freelancer/FSider';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import {
  BellOutlined,
  MessageOutlined,
  DollarOutlined,
  ProjectOutlined,
  TeamOutlined,
  SettingOutlined,
  CalendarOutlined,
  UsergroupAddOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  LoadingOutlined
} from '@ant-design/icons';

const FNotifications = ({ userId, role, isAuthenticated, isEditable }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [activeProfileComponent, setActiveProfileComponent] = useState('');
  const [activeComponent, setActiveComponent] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const token = Cookies.get('accessToken');
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const filterCategories = [
    { key: 'all', label: 'All', icon: <BellOutlined /> },
    { key: 'Messages', label: 'Messages', icon: <MessageOutlined /> },
    { key: 'Payments', label: 'Payments', icon: <DollarOutlined /> },
    { key: 'Projects', label: 'Projects', icon: <ProjectOutlined /> },
    { key: 'Connections', label: 'Connections', icon: <TeamOutlined /> },
    { key: 'System', label: 'System', icon: <SettingOutlined /> },
    { key: 'Events', label: 'Events', icon: <CalendarOutlined /> },
    { key: 'Collaborations', label: 'Collaborations', icon: <UsergroupAddOutlined /> }
  ];

  const handleMenuClick = (component) => {
    if (location.pathname !== '/freelancer/dashboard') {
      navigate('/freelancer/dashboard', { state: { component } });
    } else {
      setActiveComponent(component);
    }
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const handleProfileMenu = (profileComponent) => {
    if (location.pathname !== '/freelancer/profile') {
      navigate(`/freelancer/profile/${userId}`, { state: { profileComponent } });
    } else {
      setActiveProfileComponent(profileComponent);
    }
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://talintzbackend-production.up.railway.app/api/notifications/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(response.data)) {
          setNotifications(response.data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token]);

  // WebSocket connection
  useEffect(() => {
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/notifications/?token=${token}`);
    
    socket.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        if (Array.isArray(notification)) return;

        if (notification && typeof notification === "object") {
          setNotifications(prevNotifications => {
            if (!prevNotifications.some(existing => existing.id === notification.notification_id)) {
              return [{
                id: notification.notification_id,
                notification_text: notification.notification_text,
                created_at: notification.created_at,
                related_model_id: notification.related_model_id,
                type: notification.type,
                is_read: false,
              }, ...prevNotifications];
            }
            return prevNotifications;
          });
        }
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    };

    return () => socket.close();
  }, [token]);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `https://talintzbackend-production.up.railway.app/api/notifications/${id}/mark-as-read/`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setNotifications(prev =>
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      await axios.delete(`https://talintzbackend-production.up.railway.app/api/notifications/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      setSelectedNotification(null);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' ? true : notification.type === filter
  );

  // Helper functions for connection requests
  const isConnectionRequest = (notification) => {
    return notification.type === 'Connections' && 
      notification.notification_text.toLowerCase().includes('received a connection request');
  };

  const hasUnreadConnectionRequests = notifications.some(
    notif => isConnectionRequest(notif) && !notif.is_read
  );

  // Mark all connection requests as read
  const markAllConnectionRequestsAsRead = async () => {
    try {
      const connectionRequestIds = notifications
        .filter(notif => isConnectionRequest(notif) && !notif.is_read)
        .map(notif => notif.id);

      await Promise.all(
        connectionRequestIds.map(id =>
          axios.patch(
            `https://talintzbackend-production.up.railway.app/api/notifications/${id}/mark-as-read/`,
            {},
            { headers: { Authorization: `Bearer ${token}` }}
          )
        )
      );

      setNotifications(prev =>
        prev.map(notif =>
          connectionRequestIds.includes(notif.id)
            ? { ...notif, is_read: true }
            : notif
        )
      );

      navigate('/freelancer/connections_requests');
    } catch (error) {
      console.error('Error marking connection requests as read:', error);
    }
  };

  return (
    <div className="flex h-screen bg-freelancer-primary">
      <FSider 
        userId={userId}
        role={role}
        isAuthenticated={isAuthenticated}
        isEditable={isEditable}
        dropdown={true} 
        collapsed={true}
        handleMenuClick={handleMenuClick}
        abcds={activeComponent}
        handleProfileMenu={handleProfileMenu}
        activeProfileComponent={activeProfileComponent}
      />

      <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'ml-0' : 'ml-14'}`}>
        <FHeader 
          userId={userId}
          role={role}
          isAuthenticated={isAuthenticated}
          isEditable={isEditable}
        />

        <div className="flex-1 overflow-auto p-4">
          <div className="w-full min-w-[320px] max-w-[1200px] mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
            >
              {/* Header Section */}
              <div className="p-6 border-b border-white/10">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BellOutlined className="text-2xl text-freelancer-accent" />
                      <h1 className="text-2xl font-bold text-text-light">
                        Notifications
                      </h1>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFilter('all')}
                      className="px-4 py-2 bg-freelancer-primary/10 text-freelancer-accent 
                               rounded-lg hover:bg-freelancer-primary/20 transition-all duration-300
                               border border-freelancer-primary/20"
                    >
                      Clear All
                    </motion.button>
                  </div>

                  {/* Connection Requests Button */}
                  {hasUnreadConnectionRequests && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full"
                    >
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={markAllConnectionRequestsAsRead}
                        className="w-full p-4 bg-freelancer-primary/10 text-freelancer-accent 
                                 rounded-xl hover:bg-freelancer-primary/20 transition-all duration-300 
                                 flex items-center justify-center gap-3 border border-freelancer-primary/20"
                      >
                        <TeamOutlined className="text-xl" />
                        <span className="font-medium">View All Connection Requests</span>
                        <Badge 
                          count={notifications.filter(notif => 
                            isConnectionRequest(notif) && !notif.is_read
                          ).length}
                          className="ml-2"
                          style={{ backgroundColor: 'var(--freelancer-accent)' }}
                        />
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Filter Buttons */}
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {filterCategories.map((category) => (
                      <motion.button
                        key={category.key}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFilter(category.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap 
                                  transition-all duration-300 ${
                                    filter === category.key 
                                      ? 'bg-freelancer-primary text-white shadow-md' 
                                      : 'bg-white/5 border border-white/10 text-text-light hover:border-freelancer-primary/50'
                                  }`}
                      >
                        {category.icon}
                        <span>{category.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="p-6 space-y-4">
                <AnimatePresence>
                  {filteredNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl border backdrop-blur-sm group
                        ${notification.is_read 
                          ? 'bg-freelancer-primary/10 border-white/10' 
                          : 'bg-freelancer-primary/40 border-freelancer-primary/40'
                        }
                        hover:shadow-lg hover:shadow-freelancer-primary/10 transition-all duration-300`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        {/* Icon */}
                        <div className={`p-3 rounded-full flex items-center justify-center
                          ${notification.is_read 
                            ? 'bg-white/5 text-text-muted' 
                            : 'bg-freelancer-primary/20 text-freelancer-accent'
                          }`}>
                          {filterCategories.find(cat => cat.key === notification.type)?.icon}
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                          {/* Title */}
                          <h3 className={`font-semibold mb-1 truncate
                            ${notification.is_read 
                              ? 'text-text-light' 
                              : 'text-freelancer-accent'
                            }`}>
                            {notification.title}
                          </h3>
                          {/* Message Body */}
                          <div
                            className="text-text-secondary text-sm leading-relaxed break-words"
                            dangerouslySetInnerHTML={{
                              __html: notification.notification_text,
                            }}
                          />
                          {/* Timestamp and Actions */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2 text-xs text-text-muted">
                              <CalendarOutlined />
                              {new Date(notification.created_at).toLocaleString()}
                            </div>
                            <div className="flex gap-2">
                              {isConnectionRequest(notification) && !notification.is_read && (
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={async () => {
                                    await markAsRead(notification.id);
                                    navigate('/freelancer/connections_requests');
                                  }}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-freelancer-primary/20 
                                    text-freelancer-accent rounded-lg hover:bg-freelancer-primary/30 
                                    border border-freelancer-primary/30 text-xs font-medium transition-all duration-300"
                                >
                                  <TeamOutlined />
                                  View Request
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 items-end">
                          {!notification.is_read && (
                            <Tooltip title="Mark as Read">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => markAsRead(notification.id)}
                                className="p-2 rounded-full bg-freelancer-primary/10 text-freelancer-accent 
                                  hover:bg-freelancer-primary/20 transition-all duration-300"
                              >
                                <CheckCircleOutlined />
                              </motion.button>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteNotification(notification.id)}
                              className="p-2 rounded-full bg-red-500/10 text-red-500 
                                hover:bg-red-500/20 transition-all duration-300"
                            >
                              <DeleteOutlined />
                            </motion.button>
                          </Tooltip>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredNotifications.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <span className="text-text-muted">No notifications found</span>
                      }
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FNotifications;