import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from'axios';
import { Button, Pagination, Table, Modal, Tag, Progress, Avatar, Card, Tabs } from "antd";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ProjectOutlined, 
  StarOutlined, 
  CalendarOutlined, 
  TeamOutlined,
  CheckCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
  MailOutlined,
  LockOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { FaLock, FaUserPlus, FaGraduationCap } from 'react-icons/fa';
import {getBaseURL} from '../../../config/axios';
const { TabPane } = Tabs;

const LoginModal = ({ isVisible, onClose, onSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${getBaseURL()}/api/login/`, {
        username,
        password
      });
      const { access, refresh, role } = response.data;
      
      // Store tokens
      Cookies.set("accessToken", access, { secure: true, sameSite: 'Strict' });
      Cookies.set("refreshToken", refresh, { secure: true, sameSite: 'Strict' });
      Cookies.set("role", role, { secure: true, sameSite: 'Strict' });
      
      onSuccess(role, location.pathname);
    } catch (error) {
      setErrors({ api: error.response?.data?.error || "Login failed." });
    }
  };

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to re-enable scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed  inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop with blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-[8px]"
        onClick={onClose}
      />

      {/* Modal wrapper for centering */}
      <div className="fixed min-h-fit h-screen  inset-0 flex items-center justify-center p-4">
        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-[400px] bg-white rounded-lg shadow-2xl z-[10000]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors z-[10001]"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="bg-gradient-to-r rounded-t-lg from-client-primary to-client-secondary p-6">
            <h2 className="text-2xl font-bold text-white text-center">Welcome Back</h2>
            <p className="text-client-tertiary text-center mt-2">Sign in to connect with professionals</p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {errors.api && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-red-600 text-sm text-center">{errors.api}</p>
                </motion.div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-client-primary focus:ring-1 focus:ring-client-primary transition-colors"
                  placeholder="Enter your username"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-client-primary focus:ring-1 focus:ring-client-primary transition-colors"
                  placeholder="Enter your password"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-client-primary to-client-secondary text-white rounded-lg font-medium 
                         hover:from-client-secondary hover:to-client-accent transition-all duration-300 shadow-sm"
              >
                Sign In
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                New to our platform?{' '}
                <Link to="/register" className="text-client-primary hover:text-client-secondary font-medium">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Add dummy data
const DUMMY_PROJECTS = [
  { id: 1, title: "E-commerce Platform Development", status: "completed", deadline: "2024-05-01" },
  { id: 2, title: "Mobile App UI/UX Design", status: "ongoing", deadline: "2024-06-15" },
  { id: 3, title: "Website Optimization Project", status: "ongoing", deadline: "2024-07-01" },
  { id: 4, title: "Custom CRM Development", status: "completed", deadline: "2024-04-20" },
  { id: 5, title: "Digital Marketing Dashboard", status: "ongoing", deadline: "2024-08-10" }
];

const DUMMY_REVIEWS = [
  { id: 1, from_freelancer_username: "JohnDev", rating: 5, feedback: "Excellent client to work with! Clear requirements and timely payments.", created_at: "2024-03-15" },
  { id: 2, from_freelancer_username: "DesignPro", rating: 4, feedback: "Great communication throughout the project.", created_at: "2024-03-10" },
  { id: 3, from_freelancer_username: "WebMaster", rating: 5, feedback: "One of the best clients I've worked with. Looking forward to future projects!", created_at: "2024-03-05" }
];

const NotAuthProfile = ({userId, role, editable}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [clientInfo, setClientInfo] = useState({});
    const [connectionCount, setConnectionCount] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  
    useEffect(() => {
      const fetchProfileDetails = async () => {
        try {
          const response = await axios.get(`${getBaseURL()}/api/client/get_unauth_profile_data`, {
            params: { userId: userId },
          });
           
          const data = response.data;
          setClientInfo(data.client_profile);
          setConnectionCount(data.connection_count);
          setAverageRating(data.average_rating);
        } catch (error) {
          console.log(error);
        }
      };
      fetchProfileDetails();
    }, [userId]);
    
  const handleLoginSuccess = (userRole) => {
    setIsLoginModalVisible(false);
    
    // Get the current URL path
    const currentPath = location.pathname;
    
    // Check if we're already on a profile page
    if (currentPath.includes('/profile/')) {
      // Refresh the current page to show authenticated view
      window.location.reload();
    } else {
      // Navigate based on role if not on a profile page
      if (userRole === 'client') {
        navigate('/client/dashboard');
      } else {
        navigate('/freelancer/homepage');
      }
    }
  };

  // Update the stats cards to use the simplified data
  const statsCards = [
    {
      title: "Average Rating",
      value: averageRating,
      icon: <StarOutlined className="text-2xl" />,
      suffix: "/5",
      color: 'var(--client-accent)'
    },
    {
      title: "Connections",
      value: connectionCount,
      icon: <TeamOutlined className="text-2xl" />,
      color: 'var(--client-secondary)'
    }
  ];

  return (
    <div className="w-full max-w-[1200px] min-w-[320px] min-h-full h-fit mx-auto p-3 space-y-6">
      {/* Enhanced Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-md overflow-hidden"
      >
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-client-primary to-client-secondary relative">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -bottom-16 left-8 flex items-end space-x-6">
            <div className="relative group">
              <img 
                src={clientInfo?.profile_picture ? `https://talintzbackend-production.up.railway.app${clientInfo?.profile_picture}` : "https://www.w3schools.com/howto/img_avatar.png"} 
              alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md"
            />
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-20 px-8 pb-8">
          <div className="flex justify-between items-start flex-wrap gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-2xl font-bold text-text-primary">{clientInfo?.name}</h1>
                <Tag color="var(--client-primary)" className="px-3 py-1 uppercase text-xs font-semibold">
                  {clientInfo?.role}
                </Tag>
              </div>

              {/* Contact Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {[
                  {
                    icon: <MailOutlined className="text-client-primary text-lg" />,
                    label: "Email",
                    value: clientInfo?.email
                  },
                  {
                    icon: <EnvironmentOutlined className="text-client-primary text-lg" />,
                    label: "Location",
                    value: clientInfo?.location
                  },
                  {
                    icon: <TeamOutlined className="text-client-primary text-lg" />,
                    label: "Network",
                    value: `${connectionCount} Connections`
                  }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-3 bg-client-bg p-3 rounded-lg border border-client-border-DEFAULT"
                  >
                    <div className="p-2 bg-client-bg-card rounded-lg">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">{item.label}</p>
                      <p className="text-sm font-medium text-text-primary">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="mt-6">
            <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
              onClick={() => setIsLoginModalVisible(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-client-primary text-white rounded-lg hover:bg-client-secondary transition-all duration-300"
            >
                  <UserAddOutlined />
              <span>Connect</span>
            </motion.button>
          </div>
        </div>
      </div>

          {/* Bio Section */}
          {clientInfo?.bio && (
            <div className="mt-8 p-6 bg-client-bg rounded-lg border border-client-border-DEFAULT">
              <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                <UserOutlined className="text-client-primary" />
                About
          </h3>
              <p className="text-text-secondary leading-relaxed">{clientInfo?.bio}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Update Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {statsCards.map((stat, index) => (
          <Card 
            key={index}
            className="shadow-sm hover:shadow-md transition-all duration-DEFAULT border border-client-border-DEFAULT bg-client-bg-card"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${stat.color}20` }}>
                {React.cloneElement(stat.icon, { style: { color: stat.color } })}
              </div>
              <div>
                <p className="text-text-secondary text-sm">{stat.title}</p>
                <p className="text-2xl font-semibold mt-1 text-text-primary">
                  {stat.value}{stat.suffix}
                </p>
              </div>
            </div>
          </Card>
        ))}
          </div>
        
      {/* Main Content Tabs */}
      <Card className="rounded-lg shadow-md">
        <Tabs 
          defaultActiveKey="1" 
          className="custom-tabs"
        >
          <TabPane 
            tab={<span><ProjectOutlined />Projects</span>} 
            key="1"
          >
            <div className="relative overflow-hidden p-8">
              <div className="text-center">
                <LockOutlined className="text-4xl text-client-primary mb-4" />
                <h4 className="text-xl font-semibold text-gray-800 mb-3">Premium Content</h4>
                <p className="text-gray-600 mb-6">Sign in to view {clientInfo?.name}'s projects</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button
                type="primary"
                    icon={<UserAddOutlined />}
                onClick={() => setIsLoginModalVisible(true)}
                    className="bg-client-primary hover:bg-client-secondary h-10"
              >
                Sign In to Connect
                          </Button>
                  <Button
                    type="default"
                    onClick={() => navigate('/register')}
                    className="h-10 border-client-primary text-client-primary hover:text-client-secondary hover:border-client-secondary"
                  >
                    Create Account
                  </Button>
                  </div>
              </div>
            </div>
          </TabPane>

          <TabPane 
            tab={<span><StarOutlined />Reviews</span>} 
            key="2"
          >
            <div className="relative overflow-hidden p-8">
              <div className="text-center">
                <StarOutlined className="text-4xl text-client-primary mb-4" />
                <h4 className="text-xl font-semibold text-gray-800 mb-3">Client Reviews</h4>
                <p className="text-gray-600 mb-6">Sign in to read reviews for {clientInfo?.name}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={() => setIsLoginModalVisible(true)}
                    className="bg-client-primary hover:bg-client-secondary h-10"
                  >
                    Sign In to View
                  </Button>
                  <Button
                    type="default"
                    onClick={() => navigate('/register')}
                    className="h-10 border-client-primary text-client-primary hover:text-client-secondary hover:border-client-secondary"
                  >
                    Create Account
                  </Button>
                </div>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Login Modal */}
      <LoginModal
        isVisible={isLoginModalVisible}
        onClose={() => setIsLoginModalVisible(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Styles */}
      <style jsx>{`
        .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: var(--client-primary);
        }
      
        .ant-tabs-ink-bar {
          background: var(--client-primary);
        }
      
        .ant-table-thead > tr > th {
          background-color: var(--client-bg);
          color: var(--text-primary);
          font-weight: 500;
        }
      
        .ant-table-tbody > tr:hover > td {
          background-color: var(--client-bg);
        }
      
        .ant-progress-bg {
          background-color: var(--client-primary);
        }
      
        .ant-btn-primary {
          background-color: var(--client-primary);
        }
      
        .ant-btn-primary:hover {
          background-color: var(--client-secondary) !important;
        }
      
        .ant-progress-success-bg {
          background-color: var(--status-success);
        }
      
        .ant-card {
          background-color: var(--client-bg-card);
        }

        /* Add these additional styles */
        .text-client-primary {
          color: var(--client-primary);
        }

        .bg-client-primary {
          background-color: var(--client-primary);
        }

        .hover\:bg-client-secondary:hover {
          background-color: var(--client-secondary);
        }

        .border-client-primary {
          border-color: var(--client-primary);
        }

        .focus\:border-client-primary:focus {
          border-color: var(--client-primary);
        }

        .focus\:ring-client-primary:focus {
          --tw-ring-color: var(--client-primary);
        }
      `}</style>
    </div>
  );
};

export default NotAuthProfile;