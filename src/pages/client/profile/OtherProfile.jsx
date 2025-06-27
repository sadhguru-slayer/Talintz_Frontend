import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from'axios';
import { Button, message, Pagination,Table } from "antd";
import { FaEye } from 'react-icons/fa';
import { GrConnect } from "react-icons/gr";
import { BiSolidMessageRounded } from "react-icons/bi";
import { FaUserClock } from "react-icons/fa6";
import { FaTimes,FaCheck } from "react-icons/fa";
import { motion } from "framer-motion";
import { FaUserPlus, FaRegBell, FaBell,FaGraduationCap  } from "react-icons/fa";
import { 
  UserOutlined, 
  EnvironmentOutlined, 
  LinkOutlined,
  ProjectOutlined,
  StarOutlined,
  TeamOutlined,
  CalendarOutlined,
  MailOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  DashboardOutlined,
  BookOutlined,
  TrophyOutlined,
  ExperimentOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  MessageOutlined,
  PhoneOutlined,
  RightOutlined,
  FileProtectOutlined,
} from '@ant-design/icons';

import { Tooltip, Progress, Tabs, Card, Statistic, Tag, Avatar } from "antd";
import { useMediaQuery } from 'react-responsive';
const { TabPane } = Tabs;
import { useParams } from 'react-router-dom';

const OtherProfile = ({userRole,currentUserId}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [clientInfo, setClientInfo] = useState({});
    const [projects, setProjects] = useState([]);
    const [reviewsList, setReviewsList] = useState([]);
    const [connectionCount, setConnectionCount] = useState(0);  // To store connection count
    const [averageRating, setAverageRating] = useState(0);  // To store average rating  
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connection_id, setConnection_id] = useState(null);
    const [connection_status, setConnection_status] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const paginatedData = projects.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState('1');
    const [projectStats, setProjectStats] = useState({
      completed: 0,
      ongoing: 0,
      total: 0
    });
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [showAllSkills, setShowAllSkills] = useState(false);

    const params = useParams();
    const userId = params.id;

  
    const handlePaginationChange = (page) => {
      setCurrentPage(page);
    };
    useEffect(() => {
      const fetchProfileDetails = async () => {
        const accessToken = Cookies.get('accessToken');
        if (!userId || !accessToken) return;
        setLoading(true);
        try {
          const response = await axios.get('https://talintzbackend-production.up.railway.app/api/client/get_profile_data',
            {
              params: { userId: userId },
              headers: { Authorization: `Bearer ${accessToken}` },
            });
          const data = response.data;
          console.log(data)
          setConnection_id(data.profile.connection_id);
          setConnection_status(data.connection_status);
          setIsConnected(data.is_connected);
          setClientInfo(data.profile);
          setProjects(data.projects);
          setReviewsList(data.reviews_and_ratings.reviews);
          setConnectionCount(data.connection_Count);
          setAverageRating(data.reviews_and_ratings.average_rating);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      };
      fetchProfileDetails();
    }, [userId]);

    useEffect(() => {
      if (projects.length > 0) {
        const stats = projects.reduce((acc, project) => {
          if (project.status === 'completed') acc.completed++;
          if (project.status === 'ongoing') acc.ongoing++;
          acc.total++;
          return acc;
        }, { completed: 0, ongoing: 0, total: 0 });
        setProjectStats(stats);
      }
    }, [projects]);

    const handleConnect = async (user_id)=>{
      try {
        const token = Cookies.get('accessToken');
        if (!token) {
          console.log('No access token available');
          return;
        }
        const response = await axios.post(
          `https://talintzbackend-production.up.railway.app/api/connections/${user_id}/establish_connection/`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`, // Correct token format
            },
          }
        );
        setConnection_status(response.data.status);
      } catch (error) {
        console.error('Error accepting connection:', error);
      }
    }

    const handleAccept = async (connectionId) => {
        try {
          const token = Cookies.get('accessToken');
          if (!token) {
            console.log('No access token available');
            return;
          }
          const response = await axios.post(
            `https://talintzbackend-production.up.railway.app/api/connections/${connectionId}/accept_connection/`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`, // Correct token format
              },
            }
          );
          setConnection_status(response.data.status);
          setIsConnected(true)
        } catch (error) {
          console.error('Error accepting connection:', error);
        }
      };
      
      
      const handleReject = async (connectionId) => {
        try {
          const response = await axios.post(
            `https://talintzbackend-production.up.railway.app/api/connections/${connectionId}/reject_connection/`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${Cookies.get('accessToken')}`, // Include auth token if necessary
              },
            }
          );
          setConnection_status(response.data.status);


        } catch (error) {
          console.error('Error rejecting connection:', error);
        }
      };

    const handleFollow = async () => {
      try {
        const token = Cookies.get('accessToken');
        if (!token) return;
        
        setIsFollowing(!isFollowing);
        
        message.success(isFollowing ? 'Unfollowed successfully' : 'Following now');
      } catch (error) {
        console.error('Error following user:', error);
        setIsFollowing(!isFollowing);
        message.error('Failed to update follow status');
      }
    };

    // Add new student-specific stats
    const getStudentStats = () => [
      {
        title: "Learning Progress",
        value: 75,
        icon: <BookOutlined />,
        color: '#0d9488',
        suffix: "%"
      },
      {
        title: "Skills Mastered",
        value: clientInfo.student_info?.skills?.length || 0,
        icon: <ExperimentOutlined />,
        color: '#6366f1'
      },
      {
        title: "Projects Completed",
        value: projectStats.completed,
        icon: <TrophyOutlined />,
        color: '#eab308'
      },
      {
        title: "Graduation Year",
        value: clientInfo.student_info?.academic_info.year_of_study || 'N/A',
        icon: <FaGraduationCap  />,
        color: '#ec4899'
      }
    ];
    const getStatusColor = (status) => {
      switch (status) {
        case 'completed':
          return { color: 'green', label: 'Completed' }; // Green for completed
        case 'ongoing':
          return { color: 'yellow', label: 'Ongoing' }; // Yellow for ongoing
        case 'pending':
          return { color: 'red', label: 'Pending' }; // Red for pending
        default:
          return { color: 'gray', label: 'Unknown' }; // Gray for undefined status
      }
    };

  return (
    <div className="min-h-fit w-full bg-gradient-to-br from-client-primary via-client-secondary/5 to-client-primary">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-client-accent/2 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-brand-accent/1 rounded-full blur-xl animate-float-delayed"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        {/* Profile Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl sm:rounded-2xl"
        >
          {/* Premium Background with Multiple Layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-client-primary via-client-primary/95 to-client-bg-dark"></div>
          <div className="absolute inset-0 bg-client-gradient-soft opacity-30"></div>
          
          {/* Floating Orbs */}
          <div className="absolute top-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-client-accent/10 rounded-full blur-3xl -mr-24 lg:-mr-48 -mt-24 lg:-mt-48 animate-float"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 lg:w-80 lg:h-80 bg-brand-accent/8 rounded-full blur-2xl -ml-20 lg:-ml-40 -mb-20 lg:-mb-40 animate-float-delayed"></div>

          {/* Hero Section */}
          <div className="relative px-4 sm:px-8 py-6 sm:py-10">
            {/* Profile Image and Basic Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
              {/* Profile Image Section */}
              <div className="relative z-10">
                <div className="relative group">
                  <div className="relative">
                    <Avatar 
                      size={isMobile ? 96 : 120}
                      src={clientInfo?.profile_picture ? `https://talintzbackend-production.up.railway.app${clientInfo?.profile_picture}` : null}
                      icon={<UserOutlined />}
                      className="border-4 border-white/20 shadow-xl transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  {/* Profile Status Badge */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                    <Tag color="client-accent" className="px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      {clientInfo?.role}
                    </Tag>
                  </div>
                </div>
              </div>

              {/* Profile Info Section */}
              <div className="flex-1 z-10 text-center sm:text-left">
                {/* Name and Tags */}
                <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-3 sm:gap-4 mb-4">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                    {clientInfo?.name}
                  </h1>
                </div>

                {/* Bio under username */}
                {clientInfo?.bio && (
                  <p className="text-sm text-white/80 mb-6 max-w-2xl">
                    {clientInfo.bio}
                  </p>
                )}

                {/* Contact Information */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { icon: <MailOutlined />, label: 'Email', value: clientInfo?.email },
                    { icon: <PhoneOutlined />, label: 'Phone', value: clientInfo?.contact_info?.phone_number || 'Not provided' },
                    { icon: <UserOutlined />, label: 'Gender', value: clientInfo?.gender || 'Not specified' },
                    { icon: <CalendarOutlined />, label: 'Date of Birth', value: clientInfo?.dob ? new Date(clientInfo.dob).toLocaleDateString() : 'Not provided' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                      <div className="p-1.5 rounded-lg bg-white/10 flex-shrink-0">
                        {React.cloneElement(item.icon, { className: 'text-client-accent text-base' })}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-xs font-medium text-white/60 truncate">{item.label}</p>
                        <p className="text-sm text-white/90 truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* About Section */}
                {clientInfo?.description && (
                  <div className="mt-4 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <FileProtectOutlined className="text-client-accent text-base" />
                      <h3 className="text-sm font-medium text-white/80">About</h3>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed">{clientInfo.description}</p>
                  </div>
                )}

                {/* Connection Count Section */}
                <div className="mt-4">
                  <div 
                    onClick={() => navigate('/client/connections')}
                    className="flex items-center gap-2 p-3 rounded-lg bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300 cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-white/10">
                      <TeamOutlined className="text-client-accent text-base" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-white/60">Connections</p>
                      <p className="text-sm text-white/90">{connectionCount} connections</p>
                    </div>
                    <div className="text-white/60">
                      <RightOutlined />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                    onClick={() => handleFollow()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border text-text-muted border-gray-300 hover:bg-gray-50"
                >
                    {isFollowing ? <FaBell className="text-text-muted" /> : <FaRegBell />}
                  <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </motion.button>

                  {/* Connection Status Buttons */}
                {!isConnected && connection_status === 'notset' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleConnect(userId)}
                      className="flex items-center rounded-lg gap-2 px-6 py-2 bg-client-accent/90 hover:bg-client-accent text-white border-none shadow-lg transition-all duration-300 hover:scale-110"
                  >
                    <UserOutlined />
                    <span>Connect</span>
                  </motion.button>
                )}

                  {connection_status === 'pending' && (
                    <Tooltip title={`Connection request sent to ${clientInfo.name}`}>
                      <motion.button
                        className="flex items-center gap-2 px-6 py-2  text-gray-500 rounded-lg cursor-not-allowed"
                        disabled
                      >
                        <FaUserClock className="text-gray-500" />
                      <span>Pending</span>
                    </motion.button>
                  </Tooltip>
                )}

                {connection_status === 'not_accepted' && (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAccept(connection_id)}
                        className="flex items-center gap-2 px-4 py-2 bg-client-accent/90 hover:bg-client-accent text-white border-none shadow-lg transition-all duration-300 hover:scale-110"
                    >
                        <FaCheck />
                      Accept
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleReject(connection_id)}
                      className="flex items-center gap-2 px-4 py-2  text-gray-700 rounded-lg"
                    >
                      <FaTimes />
                      Reject
                    </motion.button>
                  </div>
                )}

                {isConnected && connection_status === 'accepted' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => message.success("Message feature coming soon")}
                      className="flex items-center gap-2 px-6 py-2 bg-client-accent/90 hover:bg-client-accent text-white border-none shadow-lg transition-all duration-300 hover:scale-110"
                  >
                      <MessageOutlined />
                    Message
                  </motion.button>
                )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[
            {
              title: "Total Projects",
              value: projectStats?.total,
              icon: <ProjectOutlined className="text-2xl" />,
              color: 'var(--client-primary)'
            },
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
            },
            {
              title: "Success Rate",
              value: (projectStats.completed / projectStats.total * 100) || 0,
              icon: <CheckCircleOutlined className="text-2xl" />,
              suffix: "%",
              color: 'var(--status-success)'
            }
          ].map((stat, index) => (
            <Card key={index} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: `${stat.color}20` }}>
                  {React.cloneElement(stat.icon, { style: { color: stat.color } })}
                </div>
                <div>
                  <p className="text-text-secondary text-sm">{stat.title}</p>
                  <p className="text-2xl font-semibold mt-1 text-white">
                    {stat.value}{stat.suffix}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Projects & Reviews Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
        >
          <div className="p-4 sm:p-6">
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              className="custom-tabs"
            >
              <TabPane 
                tab={<span><ProjectOutlined />Projects</span>} 
                key="1"
              >
                <div className="space-y-4">
                  {/* Projects Table */}
                  {!isMobile && (
                    <Table
                      dataSource={paginatedData}
                      columns={[
                        {
                          title: "Project Title",
                          dataIndex: "title",
                          key: "title",
                          render: (text, project) => (
                            <div className="flex items-center space-x-2">
                              <ProjectOutlined />
                              <span className="text-white/90">{text}</span>
                            </div>
                          ),
                        },
                        {
                          title: "Status",
                          dataIndex: "status",
                          key: "status",
                          render: (status) => (
                            <Tag color={getStatusColor(status).color}>{status}</Tag>
                          ),
                        },
                        {
                          title: "Action",
                          key: "action",
                          render: (_, project) => (
                            <Button 
                              type="link" 
                              onClick={() => navigate(`/client/view-bids/posted-project/${project.id}`)}
                              icon={<EyeOutlined />}
                              className="text-client-accent hover:text-client-accent/80"
                            >
                              View Details
                            </Button>
                          ),
                        }
                      ]}
                      pagination={false}
                      rowKey="id"
                      className="custom-table"
                      locale={{
                        emptyText: (
                          <div className="py-8 text-center">
                            <ProjectOutlined className="text-4xl text-white/40 mb-4" />
                            <p className="text-white/60">No projects available</p>
                          </div>
                        )
                      }}
                    />
                  )}

                  {/* Mobile view */}
                  {isMobile && (
                    <div className="space-y-4">
                      {paginatedData.length > 0 ? (
                        paginatedData.map((project, index) => (
                          <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4"
                          >
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium text-white/90">{project.title}</h3>
                              <Tag color={getStatusColor(project.status).color}>
                                {project.status}
                              </Tag>
                            </div>
                            <Button 
                              type="link" 
                              onClick={() => navigate(`/client/view-bids/posted-project/${project.id}`)}
                              className="mt-2 text-client-accent hover:text-client-accent/80"
                              icon={<EyeOutlined />}
                            >
                              View Details
                            </Button>
                          </motion.div>
                        ))
                      ) : (
                        <div className="py-8 text-center bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                          <ProjectOutlined className="text-4xl text-white/40 mb-4" />
                          <p className="text-white/60">No projects available</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end mt-4">
                    <Pagination
                      current={currentPage}
                      pageSize={pageSize}
                      total={projects.length}
                      onChange={handlePaginationChange}
                      showSizeChanger={false}
                    />
                  </div>
                </div>
              </TabPane>

              <TabPane 
                tab={<span><StarOutlined />Reviews</span>} 
                key="2"
              >
                <div className="space-y-6">
                  {/* Rating Overview */}
                  <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-500">{averageRating}</div>
                      <div className="text-sm text-white/60">Average Rating</div>
                    </div>
                    <div className="flex-1 max-w-sm mx-8">
                      {[5,4,3,2,1].map(rating => {
                        const count = reviewsList.filter(r => r.rating === rating).length;
                        const percentage = (count / reviewsList.length) * 100;
                        return (
                          <div key={rating} className="flex items-center space-x-2">
                            <span className="text-sm w-8 text-white/80">{rating}★</span>
                            <Progress 
                              percent={percentage} 
                              size="small" 
                              showInfo={false}
                              strokeColor="var(--client-accent)"
                              trailColor="rgba(255, 255, 255, 0.1)"
                            />
                            <span className="text-sm w-8 text-white/80">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {reviewsList.length > 0 ? (
                      reviewsList.map((review) => (
                        <motion.div
                          key={review.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-colors duration-300"
                        >
                          <div className="flex items-start space-x-4">
                            <Avatar size={48} className="border-2 border-white/20">
                              {review.from_freelancer_username ? review.from_freelancer_username[0] : '?'}
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-white/90">{review.from_freelancer_username || 'Anonymous'}</h4>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <StarOutlined 
                                      key={i}
                                      className={i < (review.rating || 0) ? 'text-yellow-400' : 'text-white/20'}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="mt-2 text-white/70">{review.feedback || 'No feedback provided'}</p>
                              <div className="mt-2 text-sm text-white/50">
                                <CalendarOutlined className="mr-1" />
                                {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Date not available'}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="py-8 text-center bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                        <StarOutlined className="text-4xl text-white/40 mb-4" />
                        <p className="text-white/60">No reviews available</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </div>
        </motion.div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .custom-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: var(--client-accent);
        }
        
        .custom-tabs .ant-tabs-ink-bar {
          background: var(--client-accent);
        }

        .ant-card {
          background: transparent;
        }

        .ant-card-head {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .ant-card-head-title {
          color: white;
        }

        .ant-tabs-tab {
          color: rgba(255, 255, 255, 0.6);
        }

        .ant-tabs-tab:hover {
          color: var(--client-accent);
        }

        .custom-timeline .ant-timeline-item-tail {
          border-color: rgba(255, 255, 255, 0.1);
        }

        .custom-timeline .ant-timeline-item-head {
          background-color: var(--client-accent);
        }

        .custom-pagination .ant-pagination-item {
          background: transparent;
          border-color: rgba(255, 255, 255, 0.1);
        }

        .custom-pagination .ant-pagination-item a {
          color: white;
        }

        .custom-pagination .ant-pagination-item-active {
          background: var(--client-accent);
          border-color: var(--client-accent);
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

        .custom-table .ant-table {
          background: transparent;
        }

        .custom-table .ant-table-thead > tr > th {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.8);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .custom-table .ant-table-tbody > tr > td {
          background: transparent;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .custom-table .ant-table-tbody > tr:hover > td {
          background: rgba(255, 255, 255, 0.05);
        }

        .ant-progress-bg {
          background-color: var(--client-accent);
        }

        .ant-progress-outer {
          background-color: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  )
}

export default OtherProfile;