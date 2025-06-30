import React, { useState, useEffect, useCallback } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Card, Empty, Tooltip, Spin, Button, Badge, Tabs } from 'antd';
import CHeader from '../../components/client/CHeader';
import CSider from '../../components/client/CSider';
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
  ReloadOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import {getBaseURL} from '../../config/axios';
// Skeleton component for loading state
const NotificationsSkeleton = ({ isMobile }) => (
  <div className={`flex-1 overflow-auto p-4 ${isMobile ? 'md:p-6' : 'p-6'} bg-client-bg`}>
    <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl p-6 mb-6 border border-white/10">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-white/10 rounded mb-4"></div>
        <div className="flex gap-3">
          <div className="h-6 w-24 bg-white/10 rounded"></div>
          <div className="h-6 w-24 bg-white/10 rounded"></div>
        </div>
      </div>
    </div>
    
    {[1, 2, 3].map((i) => (
      <div key={i} className="mb-4 bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl p-4 border border-white/10">
        <div className="animate-pulse flex items-start gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-6 w-3/4 bg-white/10 rounded mb-3"></div>
            <div className="h-4 w-1/2 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const CNotifications = ({ userId, role }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const token = Cookies.get('accessToken');
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [connectionRequestCount, setConnectionRequestCount] = useState(0);

  // Filter categories with icons
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

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axios.get(`${getBaseURL()}/api/notifications/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(response.data)) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [token]);

  const fetchConnectionRequestCount = useCallback(async () => {
    try {
      const response = await axios.get(`${getBaseURL()}/api/get_connection_requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConnectionRequestCount(Array.isArray(response.data) ? response.data.length : 0);
    } catch (error) {
      console.error('Error fetching connection requests:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications().finally(() => setLoading(false));
    fetchConnectionRequestCount();
  }, [fetchNotifications, fetchConnectionRequestCount]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  // Mark a notification as read
  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `${getBaseURL()}/api/notifications/${id}/mark-as-read/`,
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

  // Delete a notification
  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${getBaseURL()}/api/notifications/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Filter notifications by type
  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' ? true : notification.type === filter
  );

  if (loading) {
    return <NotificationsSkeleton isMobile={isMobile} />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-client-primary via-client-secondary/10 to-client-bg-dark">
      <CSider 
        userId={userId} 
        role={role} 
        dropdown={true} 
        collapsed={true}
      />
    
      <div className={`flex-1 flex flex-col overflow-hidden `}>
        <CHeader userId={userId}/>
        
        <div className={`${isMobile ? 'ml-0' : 'ml-14'} flex-1 overflow-auto ${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="max-w-[1200px] mx-auto">
            {/* Header Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl mb-6 shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-client-primary via-client-primary/80 to-client-bg-dark"></div>
              <div className="absolute inset-0 bg-client-gradient-soft opacity-30"></div>
              <div className="absolute top-0 right-0 w-48 h-48 bg-client-accent/10 rounded-full blur-3xl -mr-24 -mt-24 animate-float"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-accent/8 rounded-full blur-2xl -ml-20 -mb-20 animate-float-delayed"></div>
              
              <div className="relative z-10 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Notifications</h1>
                    <div className="flex gap-3">
                      <span className="bg-white/10 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full border border-white/20">
                        {notifications.filter(n => !n.is_read).length} Unread
                      </span>
                      <span className="bg-white/10 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full border border-white/20">
                        {notifications.length} Total
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {connectionRequestCount > 0 && (
                      <Button
                        onClick={() => navigate('/client/connection_requests')}
                        className="bg-client-secondary text-white border-0 hover:bg-client-secondary/80 flex items-center gap-2"
                      >
                        <TeamOutlined />
                        Connection Requests ({connectionRequestCount})
                      </Button>
                    )}
                    <Button
                      icon={<ReloadOutlined spin={refreshing} />}
                      onClick={handleRefresh}
                      className="bg-client-accent text-white border-0 hover:bg-client-accent/80"
                    >
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl p-4 border border-white/10 mb-6"
            >
              <Tabs
                activeKey={filter}
                onChange={setFilter}
                className="custom-tabs"
                items={filterCategories.map(cat => ({
                  key: cat.key,
                  label: (
                    <span className="flex items-center gap-2 text-text-light">
                      {cat.icon}
                      {cat.label}
                      {cat.key !== 'all' && (
                        <Badge 
                          count={notifications.filter(n => n.type === cat.key && !n.is_read).length}
                          style={{ backgroundColor: 'var(--client-accent)' }}
                        />
                      )}
                    </span>
                  )
                }))}
              />
            </motion.div>

            {/* Notifications List */}
            <div className="space-y-4">
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                  className={`
                    bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl p-4 border border-white/10
                    ${notification.is_read ? 'hover:bg-white/5' : 'bg-client-primary/5 hover:bg-client-primary/10'}
                    transition-all duration-300
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`
                      p-3 rounded-lg
                      ${notification.is_read ? 'bg-white/10' : 'bg-client-primary/20'}
                    `}>
                      {filterCategories.find(cat => cat.key === notification.type)?.icon}
                    </div>

                    <div className="flex-1">
                      <div
                        className="text-white"
                        dangerouslySetInnerHTML={{
                          __html: notification.notification_text,
                        }}
                      />
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm text-white/60">
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
                        
                        <div className="flex gap-2">
                          {!notification.is_read && (
                            <Tooltip title="Mark as Read">
                              <Button
                                icon={<CheckCircleOutlined />}
                                onClick={() => markAsRead(notification.id)}
                                className="bg-client-secondary text-white border-0 hover:bg-client-secondary/80"
                              />
                            </Tooltip>
                          )}
                          <Tooltip title="Delete">
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => deleteNotification(notification.id)}
                              className="bg-status-error text-white border-0 hover:bg-status-error/80"
                            />
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredNotifications.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl p-8 border border-white/10 text-center"
                >
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <span className="text-white/60">No notifications found</span>
                    }
                  />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-tabs .ant-tabs-nav {
          margin: 0 !important;
          background: transparent !important;
        }
        
        .custom-tabs .ant-tabs-tab {
          margin: 0 8px 0 0 !important;
          padding: 12px 24px !important;
          background: rgba(255, 255, 255, 0.08) !important;
          border: 1.5px solid rgba(255, 255, 255, 0.13) !important;
          border-radius: 18px 18px 0 0 !important;
          transition: all 0.3s cubic-bezier(.4,2,.6,1) !important;
          color: var(--text-light) !important;
          font-weight: 600 !important;
        }
        
        .custom-tabs .ant-tabs-tab-active {
          background: var(--client-secondary) !important;
          color: #fff !important;
          border-color: var(--client-accent) !important;
          box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10);
        }
        
        .custom-tabs .ant-tabs-ink-bar {
          background: var(--client-accent) !important;
          height: 4px !important;
          border-radius: 2px !important;
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        @keyframes float-delayed {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
          
      `}</style>
    </div>
  );
};

export default CNotifications;
