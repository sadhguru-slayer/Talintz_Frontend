import React, { useState, useEffect } from 'react';
import { 
  Modal, Button, Card, Pagination, Tooltip, Progress, 
  Statistic, Empty, Spin, Tag, Rate, Select, Avatar, message, Steps
} from 'antd';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ProjectOutlined, DollarOutlined,
  UserOutlined, StarOutlined, MessageOutlined,
  CalendarOutlined, GlobalOutlined,
  InfoCircleOutlined, EditOutlined,
  ReloadOutlined, FileOutlined, LinkOutlined,
  RocketOutlined, TeamOutlined, CrownOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  ClockCircleOutlined, FileTextOutlined
} from '@ant-design/icons';
import CSider from '../../components/client/CSider';
import CHeader from '../../components/client/CHeader';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useMediaQuery } from 'react-responsive';
import moment from 'moment';
import QuickAssignment from './ProjectAssignment/QuickAssignment';
import StandardAssignment from './ProjectAssignment/StandardAssignment';
import PremiumAssignment from './ProjectAssignment/PremiumAssignment';
import TierDetermination from './ProjectAssignment/TierDetermination';
import {getBaseURL} from '../../config/axios';
const { Option } = Select;

const formatText = (text) => {
  if (!text) return '';
  return text.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
};


const PostedProjectForBidsPage = ({ userId, role }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidsLoading, setBidsLoading] = useState(false);
  const location = useLocation();
  const [selectedBid, setSelectedBid] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { id: projectId } = useParams();

  // NEW: Assignment Flow States
  const [assignmentMode, setAssignmentMode] = useState('view'); // 'view', 'quick', 'standard', 'premium'
  const [assignmentTier, setAssignmentTier] = useState(null);
  const [shortlistedBids, setShortlistedBids] = useState([]);
  const [currentAssignmentStep, setCurrentAssignmentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [counterOffer, setCounterOffer] = useState('');
  const [negotiationMessage, setNegotiationMessage] = useState('');

  // Add state for multiple acceptances
  const [acceptedBids, setAcceptedBids] = useState([]);
  const [primaryAssignment, setPrimaryAssignment] = useState(null);

  // Responsive layout hooks
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  const [activeProfileComponent, setActiveProfileComponent] = useState('');
  const [activeComponent, setActiveComponent] = useState('');

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${getBaseURL()}/api/client/get_project/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get('accessToken')}`,
            },
          }
        );
        console.log(response.data)
        setProject(response.data);
        determineAssignmentTier(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  // UPDATED: Determine assignment tier based on project complexity level
  const determineAssignmentTier = (projectData) => {
    // Use complexity_level instead of budget for tier determination
    const complexityLevel = projectData.complexity_level;
    
    if (complexityLevel === 'entry') {
      setAssignmentTier('quick');
      setTimeRemaining(24 * 60 * 60); // 24 hours
    } else if (complexityLevel === 'intermediate') {
      setAssignmentTier('standard');
      setTimeRemaining(5 * 24 * 60 * 60); // 5 days
    } else if (complexityLevel === 'advanced') {
      setAssignmentTier('premium');
      setTimeRemaining(14 * 24 * 60 * 60); // 14 days
    }
  };

  // NEW: Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && assignmentMode !== 'view') {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timeRemaining, assignmentMode]);

  const fetchBids = async () => {
    setBidsLoading(true);
    try {
      const response = await axios.get(
        `${getBaseURL()}/api/client/get_bids_on_project/${parseInt(projectId)}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('accessToken')}`,
          },
        }
      );
      console.log(response.data)
      let fetchedBids = response.data.bids;
      
      if (!fetchedBids || !Array.isArray(fetchedBids) || fetchedBids.length === 0) {
        fetchedBids = [
          {
            id: 1,
            total_value: 25000,
            delivery_time: 7,
            proposal: "I have extensive experience with similar projects and can deliver high quality work within a week.",
            state: "submitted",
            freelancer: {
              name: "Jane Doe",
              avatar: "https://randomuser.me/api/portraits/women/44.jpg",
              country: "India",
              rating: 4.8,
            },
          },
          {
            id: 2,
            total_value: 22000,
            delivery_time: 10,
            proposal: "Ready to start immediately. My portfolio includes several related projects.",
            state: "submitted",
            freelancer: {
              name: "John Smith",
              avatar: "https://randomuser.me/api/portraits/men/32.jpg",
              country: "USA",
              rating: 4.6,
            },
          },
          {
            id: 3,
            total_value: 27000,
            delivery_time: 5,
            proposal: "Can deliver faster with premium quality. Let's discuss your requirements in detail.",
            state: "submitted",
            freelancer: {
              name: "Priya Patel",
              avatar: "https://randomuser.me/api/portraits/women/65.jpg",
              country: "UK",
              rating: 4.9,
            },
          },
        ];
      }
      setBids(fetchedBids);
    } catch (error) {
      console.error('Error fetching bids:', error);
      setBids([
        {
          id: 1,
          total_value: 25000,
          delivery_time: 7,
          proposal: "I have extensive experience with similar projects and can deliver high quality work within a week.",
          state: "submitted",
          freelancer: {
            name: "Jane Doe",
            avatar: "https://randomuser.me/api/portraits/women/44.jpg",
            country: "India",
            rating: 4.8,
          },
        },
      ]);
    } finally {
      setBidsLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, [projectId]);

  useEffect(() => {
    if (activeTab === 'bids') {
      fetchBids();
    }
  }, [activeTab]);

  const handleMenuClick = (component) => {
    navigate('/client/dashboard', { state: { component } });
  };

  const handleProfileMenu = (profileComponent) => {
    navigate(`/client/profile/${profileComponent}`, { state: { profileComponent } });
  };

  

  const handleBackToView = () => {
    setAssignmentMode('view');
    setCurrentAssignmentStep(0);
    setShortlistedBids([]);
  };


  // ADD THESE MISSING HANDLER FUNCTIONS
  const handleQuickAssign = async (bid) => {
    try {
      // For quick assignment, directly accept the bid
      const success = await handleBidAction(bid, bid.id, 'accept');
      if (success) {
        message.success('Project assigned successfully!');
        setAssignmentMode('view');
        fetchBids();
      }
    } catch (error) {
      console.error('Error in quick assignment:', error);
      message.error('Failed to assign project');
    }
  };

  const handleFinalSelection = async (bid) => {
    try {
      // For standard/premium assignment, accept the final selected bid
      const success = await handleBidAction(bid, bid.id, 'accept');
      if (success) {
        message.success('Project assigned successfully!');
        setAssignmentMode('view');
        fetchBids();
      }
    } catch (error) {
      console.error('Error in final selection:', error);
      message.error('Failed to assign project');
    }
  };

  // Project Overview Component
  const ProjectOverview = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Project Summary with Stats Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Content - 8 columns */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Project Description Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-client-accent rounded-full"></div>
              <h3 className="text-xl font-semibold text-white">About This Project</h3>
            </div>
            <div className="prose prose-invert max-w-none text-white/80 mb-6">
              <div dangerouslySetInnerHTML={{ __html: project?.description }} />
            </div>
            
            {/* Skills Required */}
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
              <h4 className="font-medium text-white mb-2">Skills Required</h4>
              <div className="flex flex-wrap gap-2">
                {project?.skills_required?.map((skill, index) => (
                  <Tag 
                    key={index} 
                    className="bg-client-accent/20 text-client-accent border-client-accent/30 px-3 py-1"
                  >
                    {skill.name}
                  </Tag>
                ))}
              </div>
            </div>
          </div>

          {/* Milestones Timeline */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-client-accent rounded-full"></div>
              <h3 className="text-xl font-semibold text-white">Project Milestones</h3>
            </div>
            
            {project?.milestones?.length > 0 ? (
              <div className="relative">
                {/* Vertical Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-client-accent/40 via-client-primary/30 to-transparent"></div>
                
                <div className="space-y-6">
                  {project.milestones.map((milestone, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="relative pl-12"
                    >
                      {/* Timeline Dot */}
                      <div className="absolute left-0 w-3 h-3 rounded-full bg-client-accent border-2 border-white top-1/2 transform -translate-y-1/2"></div>
                      
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-white font-semibold">{milestone.title}</h4>
                            <Tag className={`mt-2 ${
                              milestone.status === 'completed' 
                                ? 'bg-status-success/20 text-status-success border-status-success/30'
                                : milestone.status === 'in_progress'
                                ? 'bg-client-accent/20 text-client-accent border-client-accent/30'
                                : 'bg-white/20 text-white/80 border-white/30'
                            }`}>
                              {formatText(milestone.status)}
                            </Tag>
                          </div>
                          {(milestone.milestone_type === 'payment' || milestone.milestone_type === 'hybrid') && (
                            <div className="text-right">
                              <div className="text-lg font-semibold text-client-accent">
                                ₹{milestone.amount.toLocaleString()}
                              </div>
                              <Tag className="mt-1 bg-client-accent/20 text-client-accent border-client-accent/30">
                                {milestone.milestone_type === 'hybrid' ? 'Progress & Payment' : 'Payment Only'}
                              </Tag>
                            </div>
                          )}
                        </div>
                        
                        <Progress 
                          percent={milestone.status === 'completed' ? 100 : 
                                  milestone.status === 'in_progress' ? 50 : 25}
                          strokeColor={{
                            '0%': 'var(--client-accent)',
                            '100%': 'var(--client-primary)',
                          }}
                          trailColor="rgba(255, 255, 255, 0.1)"
                          className="mt-3"
                        />
                        
                        {/* Milestone Details */}
                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-white/60">
                            <CalendarOutlined className="text-client-accent" />
                            <span>Due: {moment(milestone.due_date).format('MMM D, YYYY')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white/60">
                            <UserOutlined className="text-client-accent" />
                            <span>Assigned: {milestone.assigned_to || 'Not Assigned'}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ProjectOutlined className="text-4xl text-white/40 mb-4" />
                <h3 className="text-white font-semibold mb-2">No Milestones Set</h3>
                <p className="text-white/60">Add milestones to track project progress</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Sidebar - 4 columns */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Project Budget Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <DollarOutlined className="text-client-accent text-xl" />
              <h3 className="text-lg font-semibold text-white">Project Budget</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              ₹{project?.budget.toLocaleString()}
            </div>
            <div className="text-sm text-white/60 mb-4">
              Total Spent: ₹{(project?.total_spent || 0).toLocaleString()}
            </div>
            <Progress
              percent={((project?.total_spent || 0) / project?.budget) * 100}
              status="active"
              strokeColor={{
                '0%': 'var(--client-accent)',
                '100%': 'var(--client-primary)',
              }}
              trailColor="rgba(255, 255, 255, 0.1)"
            />
          </div>

          {/* Time Remaining Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <CalendarOutlined className="text-client-accent text-xl" />
              <h3 className="text-lg font-semibold text-white">Time Remaining</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-white">
                {Math.ceil((new Date(project?.deadline) - new Date()) / (1000 * 60 * 60 * 24))}
              </span>
              <span className="text-white/60">days</span>
            </div>
            <div className="mt-2 text-sm text-white/60">
              Due: {moment(project?.deadline).format('MMM D, YYYY')}
            </div>
          </div>

          {/* Project Status Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <InfoCircleOutlined className="text-client-accent text-xl" />
              <h3 className="text-lg font-semibold text-white">Project Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Status</span>
                <Tag className="bg-client-accent/20 text-client-accent border-client-accent/30">
                  {formatText(project?.status)}
                </Tag>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Posted</span>
                <span className="text-white">{moment(project?.created_at).format('MMM D, YYYY')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Bids Received</span>
                <span className="text-white">{bids?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );


  // UPDATED: handleBidAction with proper action mapping
  const handleBidAction = async (bid, bidId, action, data = {}) => {
    try {
      const complexityLevel = project?.complexity_level;
      const endpoints = {
        accept: 'accept_bid/',
        reject: 'reject_bid/',
        mark_under_review: 'mark_bid_under_review/', // ADDED: Missing endpoint
        mark_submitted: 'mark_bid_submitted/', // ADDED: Missing endpoint
        negotiate: 'negotiate_bid/',
        shortlist: 'mark_bid_under_review/',
        interview: 'schedule_interview/',
        longlist: 'longlist_bid/',
        case_study: 'assign_case_study/',
        send_assignment_invitation: 'send_assignment_invitation/' // ADDED: Missing endpoint
      };

      // UPDATED: Complexity-based action validation - Include mark_under_review for all levels
      const allowedActions = {
        entry: ['accept', 'reject', 'mark_under_review', 'mark_submitted', 'negotiate'],
        intermediate: ['accept', 'reject', 'mark_under_review', 'mark_submitted', 'negotiate', 'shortlist', 'interview'],
        advanced: ['accept', 'reject', 'mark_under_review', 'mark_submitted', 'negotiate', 'shortlist', 'longlist', 'interview', 'case_study']
      };

      if (!allowedActions[complexityLevel]?.includes(action)) {
        message.error(`Action '${action}' not available for ${complexityLevel} level projects`);
        return false;
      }

      // UPDATED: State-based validation - Simplified for all complexity levels
      const stateValidation = {
        submitted: ['mark_under_review', 'negotiate', 'reject'],
        under_review: ['accept', 'reject', 'send_assignment_invitation'],
        negotiation: ['accept', 'reject'],
        accepted: [],
        rejected: [],
        withdrawn: []
      };

      const allowedStates = stateValidation[bid.state] || [];
      if (!allowedStates.includes(action)) {
        message.error(`Cannot perform '${action}' on bid in '${bid.state}' state`);
        return false;
      }

      const response = await axios.post(
        `${getBaseURL()}/api/client/${endpoints[action]}`,
        { 
          bid_id: bidId,
          project_complexity: complexityLevel,
          ...data 
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('accessToken')}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (response.data.status === 'success') {
        message.success(`Bid ${action.replace('_', ' ')}ed successfully`);
        return true;
      } else {
        throw new Error(response.data.message || 'Action failed');
      }
    } catch (error) {
      console.error(`Error ${action}ing bid:`, error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      message.error(`Failed to ${action.replace('_', ' ')} bid: ${errorMessage}`);
      return false;
    }
  };

  // Modified return statement to include assignment flow
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return <div>No project details available.</div>;
  }

  // UPDATED: Simplified main return - Assignment as primary interface
  return (
    <div className="flex h-screen bg-client-primary">
      <CSider
        userId={userId}
        role={role}
        dropdown={true}
        collapsed={true} 
        handleMenuClick={handleMenuClick}
        activeComponent={activeComponent}
        handleProfileMenu={handleProfileMenu}
        activeProfileComponent={activeProfileComponent}
      />

      <div className={`flex-1 flex flex-col overflow-hidden `}>
        <CHeader userId={userId} />

        <div className={`${isMobile ? 'ml-0' : 'ml-16'} flex-1 overflow-auto p-4 md:p-6`}>
          <div className="max-w-7xl mx-auto space-y-6">
            {/* UPDATED: Premium Header Card matching DashboardOverview */}
            <div className="mb-6 lg:mb-8 relative overflow-hidden">
              {/* Premium Background with Multiple Layers */}
              <div className="absolute inset-0 bg-client-gradient-primary rounded-xl lg:rounded-2xl"></div>
              <div className="absolute inset-0 bg-client-gradient-soft opacity-50 rounded-xl lg:rounded-2xl"></div>
              
              {/* Floating Orbs - Responsive */}
              <div className="absolute top-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-client-accent/8 rounded-full blur-3xl -mr-24 lg:-mr-48 -mt-24 lg:-mt-48 animate-float"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 lg:w-80 lg:h-80 bg-brand-accent/6 rounded-full blur-2xl -ml-20 lg:-ml-40 -mb-20 lg:-mb-40 animate-float-delayed"></div>
              <div className="absolute top-1/2 right-1/4 w-16 h-16 lg:w-32 lg:h-32 bg-client-accent/10 rounded-full blur-xl"></div>
              
              {/* Premium Content - Responsive */}
              <div className="relative z-10 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    {/* Premium Badge */}
                    <div className="inline-flex items-center gap-2 bg-client-accent/20 backdrop-blur-sm border border-client-accent/30 rounded-full px-3 py-1.5 lg:px-4 lg:py-2 mb-4 lg:mb-6">
                      <span className="text-client-accent text-xs lg:text-sm font-semibold">Project Details</span>
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">
                      {project?.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="bg-white/10 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full border border-white/20">
                        Budget: ₹{project?.budget?.toLocaleString()}
                      </span>
                      <span className="bg-white/10 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full border border-white/20">
                        {bids?.length || 0} Bids Received
                      </span>
                      <span className="bg-white/10 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full border border-white/20">
                        Due: {moment(project?.deadline).format('MMM D, YYYY')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      icon={<EditOutlined />}
                      className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                    >
                      Edit Project
                    </Button>
                    <Button 
                      icon={<ReloadOutlined />}
                      className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                      onClick={fetchBids}
                    >
                      Refresh
                    </Button>
                </div>
              </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
                  {[
                    { icon: <ProjectOutlined />, label: "Project Status", value: formatText(project?.status) },
                    { icon: <DollarOutlined />, label: "Total Spent", value: `₹${(project?.total_spent || 0).toLocaleString()}` },
                    { icon: <CalendarOutlined />, label: "Days Left", value: Math.ceil((new Date(project?.deadline) - new Date()) / (1000 * 60 * 60 * 24)) },
                    { icon: <UserOutlined />, label: "Complexity", value: formatText(project?.complexity_level) }
                  ].map((stat, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-white/70 text-sm">{stat.label}</p>
                        <p className="text-white font-semibold">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-client-bg backdrop-blur-xl rounded-xl p-2 border border-white/10">
              <div className="flex overflow-x-auto">
                {[
                  { key: 'overview', label: 'Overview', icon: <InfoCircleOutlined /> },
                  { key: 'bids', label: 'Bids & Assignment', icon: <UserOutlined /> }
                ].map((tab) => (
                  <Button 
                    key={tab.key}
                    type={activeTab === tab.key ? 'primary' : 'text'}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 rounded-lg flex items-center gap-2 ${
                      activeTab === tab.key 
                        ? 'bg-client-accent text-white border-0' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                    icon={tab.icon}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
              <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <ProjectOverview />
                </motion.div>
                )}

                {activeTab === 'bids' && (
                <motion.div
                  key="bids"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >

                  {/* Handle No Bids Scenario */}
                  {bidsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Spin size="large" />
                    </div>
                  ) : bids.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-8 border border-white/10">
                      <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center">
                          <UserOutlined className="text-3xl text-white/40" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Bids Yet</h3>
                        <p className="text-white/60 max-w-md mx-auto mb-6">
                          Freelancers haven't submitted any bids for this project yet. 
                          Bids will appear here once they start submitting their proposals.
                        </p>
                        
                        {/* Assignment Process Info for No Bids */}
                        <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-6">
                          <h4 className="text-white font-semibold mb-3">What happens when bids arrive?</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-client-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                <FileTextOutlined className="text-client-accent text-lg" />
                              </div>
                              <div className="text-white font-medium mb-1">Review Bids</div>
                              <div className="text-white/60">Evaluate proposals and freelancer profiles</div>
                            </div>
                            <div className="text-center">
                              <div className="w-12 h-12 bg-client-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                <StarOutlined className="text-client-accent text-lg" />
                              </div>
                              <div className="text-white font-medium mb-1">Shortlist Candidates</div>
                              <div className="text-white/60">Select top candidates for further review</div>
                            </div>
                            <div className="text-center">
                              <div className="w-12 h-12 bg-client-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                <CheckCircleOutlined className="text-client-accent text-lg" />
                              </div>
                              <div className="text-white font-medium mb-1">Assign Project</div>
                              <div className="text-white/60">Choose the best freelancer for your project</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-4 justify-center">
                      <Button 
                            type="primary"
                            className="bg-client-accent hover:bg-client-accent/90 shadow-none border-0"
                        icon={<ReloadOutlined />}
                            onClick={fetchBids}
                          >
                            Refresh Bids
                          </Button>
                          <Button 
                            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                            onClick={() => setActiveTab('overview')}
                          >
                            View Project Details
                      </Button>
                    </div>
                  </div>
                    </div>
                  ) : (
                    /* Show Assignment Components when bids exist */
                    <AnimatePresence mode="wait">
                      {assignmentTier === 'quick' && (
                        <QuickAssignment 
                          project={project}
                          bids={bids}
                          onBack={handleBackToView}
                          onAssign={handleQuickAssign}
                          onBidSelect={setSelectedBid}
                          timeRemaining={timeRemaining}
                          onRefreshBids={fetchBids}
                        />
                      )}
                      
                      {assignmentTier === 'standard' && (
                        <StandardAssignment 
                          project={project}
                          bids={bids}
                          onBack={handleBackToView}
                          onAssign={handleFinalSelection}
                          onBidSelect={setSelectedBid}
                          timeRemaining={timeRemaining}
                          onRefreshBids={fetchBids}
                        />
                      )}
                      
                      {assignmentTier === 'premium' && (
                        <PremiumAssignment 
                          project={project}
                          bids={bids}
                          onBack={handleBackToView}
                          onAssign={handleFinalSelection}
                          onBidSelect={setSelectedBid}
                          timeRemaining={timeRemaining}
                          onRefreshBids={fetchBids}
                        />
                      )}
                    </AnimatePresence>
                )}
              </motion.div>
              )}
            </AnimatePresence>
        </div>
      </div>

        {/* FIXED: Bid Details Modal with proper error handling */}
      <Modal
          visible={selectedBid !== null}
        onCancel={() => setSelectedBid(null)}
        title={
            <div className="flex items-center gap-3">
              <Avatar 
                size={40} 
                src={selectedBid?.freelancer?.avatar || ''}
                className="ring-2 ring-client-accent/30"
              />
              <div>
                <div className="text-lg font-semibold text-white">
                  {selectedBid?.freelancer?.name || 'Unknown Freelancer'}
                </div>
                <div className="text-sm text-white/60">
                  {selectedBid?.freelancer?.country || 'Location not specified'}
                </div>
            </div>
          </div>
        }
          footer={null}
          width={800}
          className="custom-modal"
          bodyStyle={{ padding: 0 }}
      >
        {selectedBid && (
            <div className="bg-white/5">
              {/* Bid Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                <Avatar 
                  size={80} 
                  src={selectedBid.freelancer?.avatar || ''}
                  className="ring-2 ring-client-accent/30 ring-offset-2 ring-offset-client-bg-dark"
                />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {selectedBid.freelancer?.name || 'Unknown Freelancer'}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Rate disabled defaultValue={selectedBid.freelancer?.rating || 0} className="text-sm" />
                        <span className="text-sm text-white/60">
                          ({selectedBid.freelancer?.rating || 0.0})
                        </span>
                      </div>
                      <Tag className="bg-client-accent/20 text-client-accent border-client-accent/30">
                        {selectedBid.state === 'submitted' ? 'Ready to Review' : 
                         selectedBid.state === 'under_review' ? 'Under Review' : 
                         selectedBid.state || 'Unknown State'}
                      </Tag>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-client-accent mb-2">
                    ₹{(selectedBid.total_value || 0).toLocaleString()}
                </div>
                    <div className="text-sm text-white/60">
                      {selectedBid.delivery_time || 0} days delivery
                </div>
              </div>
            </div>

                {/* Bid Stats */}
                <div className="grid grid-cols-3 gap-4 py-4 border-t border-white/10">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">
                      {selectedBid.delivery_time || 0} days
                </div>
                    <div className="text-xs text-white/60">Delivery Time</div>
                </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-white">
                      {moment().add(selectedBid.delivery_time || 0, 'days').format('MMM D')}
                    </div>
                    <div className="text-xs text-white/60">Expected Delivery</div>
                          </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">
                      ₹{((selectedBid.total_value || 0) / (selectedBid.delivery_time || 1)).toFixed(0)}
                    </div>
                    <div className="text-xs text-white/60">Per Day</div>
                  </div>
              </div>
            </div>

              {/* Bid Content */}
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">Proposal</h4>
                  <div className="text-white/80 leading-relaxed">
                    {selectedBid.proposal || 'No proposal provided'}
              </div>
            </div>

                {/* Freelancer Info */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-6">
                  <h4 className="text-white font-semibold mb-3">About the Freelancer</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-white/60">Location</div>
                      <div className="text-white">{selectedBid.freelancer?.country || 'Not specified'}</div>
                              </div>
                    <div>
                      <div className="text-white/60">Rating</div>
                      <div className="text-white">{(selectedBid.freelancer?.rating || 0).toFixed(1)}/5</div>
                          </div>
                    {selectedBid.freelancer?.completedProjects && (
                      <div>
                        <div className="text-white/60">Completed Projects</div>
                        <div className="text-white">{selectedBid.freelancer.completedProjects}</div>
                    </div>
                    )}
                    {selectedBid.freelancer?.memberSince && (
                      <div>
                        <div className="text-white/60">Member Since</div>
                        <div className="text-white">{selectedBid.freelancer.memberSince}</div>
                  </div>
                )}
                  </div>
              </div>

                {/* Skills Section - if available */}
                {selectedBid.skills && selectedBid.skills.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-6">
                    <h4 className="text-white font-semibold mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedBid.skills.map((skill, index) => (
                        <Tag 
                          key={index} 
                          className="bg-client-accent/20 text-client-accent border-client-accent/30"
                        >
                          {skill}
                        </Tag>
                      ))}
                                </div>
                                </div>
                )}

                {/* Attachments Section - if available */}
                {selectedBid.attachments && selectedBid.attachments.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-6">
                    <h4 className="text-white font-semibold mb-3">Attachments</h4>
                    <div className="space-y-2">
                      {selectedBid.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-white/5 rounded">
                          <FileOutlined className="text-client-accent" />
                          <span className="text-white text-sm flex-1">
                            {attachment.filename || `Attachment ${index + 1}`}
                          </span>
                          {attachment.file_url && (
                            <Button
                              size="small" 
                              type="link"
                              className="text-client-accent p-0"
                              onClick={() => window.open(attachment.file_url, '_blank')}
                            >
                              View
                            </Button>
                          )}
                          </div>
                        ))}
                    </div>
              </div>
            )}

                {/* Action Buttons - UPDATED with proper error handling */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  {selectedBid.state === 'submitted' && (
                    <>
                <Button 
                        type="primary"
                  onClick={() => {
                          handleBidAction(selectedBid, selectedBid.id, 'mark_under_review');
                          setSelectedBid(null); // Close modal after action
                  }}
                        className="bg-client-accent hover:bg-client-accent/90 shadow-none border-0"
                        icon={<StarOutlined />}
                >
                        Shortlist
                </Button>
                        <Button
                        onClick={() => {
                          message.info('Negotiation feature coming soon');
                        }}
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                        icon={<MessageOutlined />}
                        >
                          Negotiate
                        </Button>
                      </>
                  )}

                  {selectedBid.state === 'under_review' && (
                        <Button
                          type="primary"
                      onClick={() => {
                        // Handle final selection based on assignment tier
                        if (assignmentTier === 'quick') {
                          handleQuickAssign(selectedBid);
                        } else {
                          handleFinalSelection(selectedBid);
                        }
                              setSelectedBid(null);
                          }}
                      className="bg-client-accent hover:bg-client-accent/90 shadow-none border-0"
                      icon={<CheckCircleOutlined />}
                        >
                      {assignmentTier === 'quick' ? 'Quick Assign' : 'Select This Freelancer'}
                        </Button>
                  )}
                  
                            <Button
                    onClick={() => setSelectedBid(null)}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    Close
                            </Button>
                          </div>
                        </div>
                      </div>
        )}
      </Modal>
      </div>
    </div>
  );
};

export default PostedProjectForBidsPage;
