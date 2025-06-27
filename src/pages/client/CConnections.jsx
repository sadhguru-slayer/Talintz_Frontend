import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, notification, Checkbox, Empty, Spin, Avatar, Tooltip, Tag } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CHeader from '../../components/client/CHeader';
import CSider from '../../components/client/CSider';
import Cookies from 'js-cookie'
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  UserOutlined, 
  GlobalOutlined, 
  MessageOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';

const CConnections = ({ userId, role }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const location = useLocation();
  const [activeComponent, setActiveComponent] = useState('');
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const pageTransition = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  };

  const handleMenuClick = (component) => {
    if (component !== 'connections') {
      navigate('/client/dashboard', { state: { component } });
    }
    setActiveComponent(component);
  };

  const handleProfileMenu = (profileComponent) => {
    if (location.pathname !== '/client/profile') {
      navigate(`/client/profile/${userId}`, { state: { profileComponent } });
    }
  };

  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://talintzbackend-production.up.railway.app/api/client/get_connections', {
          headers: {
            'Authorization': `Bearer ${Cookies.get('accessToken')}`,
          },
        });
        setConnections(response.data);
      } catch (error) {
        console.error("Error fetching connections", error);
        notification.error({ 
          message: 'Error loading connections',
          description: 'Failed to load your connections. Please try again later.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  const format_timeStamp = (date) => {
    const dateObject = new Date(date);
    return dateObject.toLocaleString();
  };

  return (
    <div className="flex h-screen bg-client-bg">
      <CSider 
        userId={userId} 
        role={role}
        dropdown={true} 
        collapsed={true} 
        handleMenuClick={handleMenuClick} 
        activeComponent={activeComponent} 
        handleProfileMenu={handleProfileMenu} 
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
                    <h1 className="text-2xl font-bold text-text-primary">Your Connections</h1>
                    <p className="text-text-secondary mt-1">Manage your professional network</p>
                  </div>
                  <Button
                    type="primary"
                    icon={<GlobalOutlined />}
                    onClick={() => navigate('/client/connection-requests')}
                    className="bg-client-primary hover:bg-client-secondary text-text-light"
                  >
                    View Requests
                  </Button>
                </div>
              </div>

              {/* Connections List */}
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Spin size="large" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {connections.length > 0 ? (
                      connections.map((connection) => (
                        <div
                          key={connection.user_id}
                          className="p-4 rounded-xl border border-client-border hover:shadow-md 
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
                              <h3 
                                onClick={() => navigate(`/${connection.role}/profile/${connection.user_id}/view_profile`)}
                                className="text-lg font-semibold text-client-primary cursor-pointer hover:text-client-secondary"
                              >
                                {connection.user_name}
                              </h3>
                              <p className="text-sm text-text-secondary mt-1">{connection.bio}</p>

                              <div className="flex flex-wrap gap-2 mt-3">
                                <Tag color="blue" className="bg-client-primary/10 text-client-primary border-client-primary">
                                  {connection.role}
                                </Tag>
                                {connection.skills?.slice(0, 3).map((skill, idx) => (
                                  <Tag key={idx} className="bg-client-secondary/10 text-client-secondary border-client-secondary">
                                    {skill}
                                  </Tag>
                                ))}
                              </div>

                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                  <ClockCircleOutlined />
                                  {format_timeStamp(connection.created_at)}
                                </div>
                            
                                <Tooltip title="Send Message">
                                  <Button
                                    icon={<MessageOutlined />}
                                    onClick={() => navigate('/client/messages/direct', { 
                                      state: { userId: connection.user_id }
                                    })}
                                    className="bg-client-primary/10 text-client-primary hover:bg-client-primary 
                                             hover:text-text-light border-none"
                                  />
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full flex flex-col items-center justify-center py-12">
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={
                            <div className="text-center">
                              <p className="text-text-secondary mb-4">You have no connections yet</p>
                              <Button
                                type="primary"
                                onClick={() => navigate('/client/browse-freelancers')}
                                className="bg-client-primary hover:bg-client-secondary"
                              >
                                Browse Freelancers
                              </Button>
                            </div>
                          }
                        />
                      </div>
                    )}
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

export default CConnections;
