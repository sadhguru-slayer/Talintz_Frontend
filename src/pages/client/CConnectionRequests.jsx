import React, { useState, useEffect } from 'react';
import { Button, notification, Empty, Spin, Avatar, Tooltip } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import CHeader from '../../components/client/CHeader';
import CSider from '../../components/client/CSider';
import Cookies from 'js-cookie';
import axios from 'axios';
import { FaTimes, FaCheck } from "react-icons/fa";
import { motion } from 'framer-motion';
import { UserOutlined, ClockCircleOutlined, GlobalOutlined } from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';

const CConnectionRequests = ({userId, role}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [error, setError] = useState(null);
  const location = useLocation();
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  // Simplified animation variant
  const pageTransition = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  };

  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          'http://127.0.0.1:8000/api/client/get_connection_requests',
          {
            headers: {
              'Authorization': `Bearer ${Cookies.get('accessToken')}`,
            },
          }
        );

        setConnections(response.data || []);
      } catch (error) {
        console.error("Error fetching connections:", error);
        setError('Failed to load connection requests. Please try again later.');
        notification.error({ 
          message: 'Error loading connections',
          description: error.response?.data?.message || 'Failed to load connection requests'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  const handleAccept = async (connectionId) => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/client/connections/${connectionId}/accept_connection/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${Cookies.get('accessToken')}`,
          },
        }
      );
  
      if (response.data.status === 'accepted') {
        notification.success({ 
          message: 'Connection Accepted',
          description: 'Connection request has been accepted successfully.'
        });
        
        setConnections(prev => prev.filter(conn => conn.id !== connectionId));
      }
    } catch (error) {
      notification.error({ 
        message: 'Failed to accept connection',
        description: error.response?.data?.message || 'Please try again later'
      });
    }
  };
  
  const handleReject = async (connectionId) => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/client/connections/${connectionId}/reject_connection/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${Cookies.get('accessToken')}`,
          },
        }
      );
  
      if (response.data.status === 'rejected') {
        notification.success({ 
          message: 'Connection Rejected',
          description: 'Connection request has been rejected successfully.'
        });
  
        setConnections(prev => prev.filter(conn => conn.id !== connectionId));
      }
    } catch (error) {
      notification.error({ 
        message: 'Failed to reject connection',
        description: error.response?.data?.message || 'Please try again later'
      });
    }
  };

  const format_timeStamp = (date) => {
    try {
      const dateObject = new Date(date);
      return dateObject.toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-client-bg">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-client-bg">
      <CSider 
        userId={userId} 
        role={role}
        dropdown={true} 
        collapsed={true} 
      />

      <div className={`
        flex-1 flex flex-col overflow-hidden
        ${isMobile ? 'ml-0 pb-16' : 'ml-14'}
      `}>
        <CHeader userId={userId}/>

        <div className="flex-1 overflow-auto p-4">
          <div className="w-full min-w-[320px] max-w-[1200px] mx-auto">
            <motion.div
              {...pageTransition}
              className="bg-client-bg-card rounded-2xl shadow-md border border-client-border overflow-hidden"
            >
              {/* Header Section */}
              <div className="bg-client-primary/5 p-6 border-b border-client-border">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-text-primary">Connection Requests</h1>
                    <p className="text-text-secondary mt-1">Manage your incoming connection requests</p>
                  </div>
                  <Button
                    type="primary"
                    icon={<GlobalOutlined />}
                    onClick={() => navigate('/client/connections')}
                    className="bg-client-primary hover:bg-client-secondary text-text-light"
                  >
                    View Connections
                  </Button>
                </div>
              </div>

              {/* Connections List */}
              <div className="p-6">
                {error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">{error}</p>
                    <Button 
                      onClick={() => window.location.reload()}
                      className="mt-4 bg-client-primary text-text-light hover:bg-client-secondary"
                    >
                      Retry
                    </Button>
                  </div>
                ) : connections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <div className="text-center">
                          <p className="text-text-secondary mb-4">No pending connection requests</p>
                          <p className="text-text-secondary">
                            You'll see connection requests here when freelancers want to connect with you.
                          </p>
                        </div>
                      }
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {connections.map((connection) => (
                      <div
                        key={connection.id}
                        className="p-6 rounded-xl border border-client-border hover:shadow-md 
                                 transition-all duration-300 bg-client-bg-card"
                      >
                        <div className="flex items-start gap-4">
                          <Avatar
                            size={64}
                            src={connection.profile_picture}
                            icon={<UserOutlined />}
                            className="bg-client-primary"
                          />

                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-semibold text-client-primary">
                                  {connection.user_name}
                                </h3>
                                <p className="text-text-secondary mt-1">{connection.bio || 'No bio available'}</p>
                                <div className="flex items-center gap-2 mt-2 text-sm text-text-secondary">
                                  <ClockCircleOutlined />
                                  {format_timeStamp(connection.created_at)}
                                </div>
                              </div>

                              <div className="flex gap-3">
                                <Tooltip title="Accept Request">
                                  <Button
                                    icon={<FaCheck />}
                                    onClick={() => handleAccept(connection.id)}
                                    className="bg-client-primary/10 text-client-primary hover:bg-client-primary 
                                             hover:text-text-light border-none"
                                  />
                                </Tooltip>
                                <Tooltip title="Reject Request">
                                  <Button
                                    icon={<FaTimes />}
                                    onClick={() => handleReject(connection.id)}
                                    className="bg-red-50 text-red-500 hover:bg-red-500 
                                             hover:text-white border-none"
                                  />
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CConnectionRequests;
