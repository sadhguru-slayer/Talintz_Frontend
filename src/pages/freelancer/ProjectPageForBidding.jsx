import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Input, 
  Form, 
  message, 
  Tag, 
  Progress, 
  Tooltip, 
  Modal,
  Timeline,
  Avatar,
  Rate,
  Divider,
  Space,
  Row,
  Col,
  Statistic,
  Badge,
  Alert,
  Radio,
  Checkbox,
  Upload,
  List,
  InputNumber,
  DatePicker,
  Spin,
  Result,
  Typography
} from 'antd';
import { 
  DollarOutlined, 
  ClockCircleOutlined, 
  UserOutlined, 
  CheckCircleOutlined,
  FileTextOutlined,
  MessageOutlined,
  StarOutlined,
  TeamOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  TagOutlined,
  SendOutlined,
  InfoCircleOutlined,
  PaperClipOutlined,
  LinkOutlined,
  DeleteOutlined,
  UploadOutlined,
  ArrowRightOutlined,
  LoadingOutlined,
  HistoryOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import moment from 'moment';
import FHeader from '../../components/freelancer/FHeader';
import FSider from '../../components/freelancer/FSider';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import './css/ProjectPageForBidding.css';

const { Dragger } = Upload;
const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const ProjectPageForBidding = () => {
  const navigate = useNavigate();
  const { id:projectId } = useParams(); // Get project ID from URL params
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [projectLoading, setProjectLoading] = useState(true);
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidProposal, setBidProposal] = useState('');
  const [bidDuration, setBidDuration] = useState('');
  const [portfolioLinks, setPortfolioLinks] = useState([]);
  const [projectData, setProjectData] = useState(null);
  const [error, setError] = useState(null);
  
  // Add state for real-time calculation
  const [hourlyRate, setHourlyRate] = useState(0);
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  // Add state for file and link attachments
  const [fileList, setFileList] = useState([]);
  const [linkInputs, setLinkInputs] = useState(['']);

  // Add new state for bid-related data
  const [existingBid, setExistingBid] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [pendingAssignment, setPendingAssignment] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentResponse, setAssignmentResponse] = useState('');
  const [respondingToAssignment, setRespondingToAssignment] = useState(false);

  // Add new state for decline confirmation modal
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  // Responsive breakpoints
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  // Get user info from cookies
  const userId = Cookies.get('userId') || '';
  const role = Cookies.get('role') || 'freelancer';
  const isAuthenticated = !!Cookies.get('accessToken');
  const isEditable = true;

  // Fetch project data on component mount
  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setProjectLoading(true);
      setError(null);
      
      const response = await axios.get(
        `http://127.0.0.1:8000/api/freelancer/projects/${projectId}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('accessToken')}`,
          },
        }
      );
      
      console.log(response.data);
      setProjectData(response.data);
      
      // Set bid-related data
      if (response.data.existing_bid) {
        setExistingBid(response.data.existing_bid);
      }
      
      if (response.data.bid_history) {
        setBidHistory(response.data.bid_history);
      }
      
      if (response.data.pending_assignment) {
        setPendingAssignment(response.data.pending_assignment);
      }
      
    } catch (error) {
      console.error('Error fetching project data:', error);
      setError(error.response?.data?.error || 'Failed to load project data');
    } finally {
      setProjectLoading(false);
    }
  };

  const handleProfileMenu = (profileComponent) => {
    if (location.pathname !== "/freelancer/profile") {
      navigate("/freelancer/profile", { state: { profileComponent } });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const handleLinkChange = (index, value) => {
    const newLinks = [...linkInputs];
    newLinks[index] = value;
    setLinkInputs(newLinks);
  };

  const handleRemoveLink = (index) => {
    const newLinks = linkInputs.filter((_, i) => i !== index);
    setLinkInputs(newLinks.length > 0 ? newLinks : ['']);
  };

  const handleAddLink = () => {
    if (linkInputs.length < 5) {
      setLinkInputs([...linkInputs, '']);
    }
  };

  const handleBidSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Prepare bid data based on project pricing strategy
      const bidData = {
        project: projectId,
        proposed_start: values.timeline[0].format('YYYY-MM-DD'),
        proposed_end: values.timeline[1].format('YYYY-MM-DD'),
        notes: values.notes,
        bid_type: projectData.pricing_strategy,
        currency: 'INR',
        delivery_buffer_days: 0
      };

      // Add pricing strategy specific fields
      console.log(projectData.pricing_strategy)
      if (projectData.pricing_strategy === 'hourly') {
        bidData.hourly_rate = parseFloat(hourlyRate);
        bidData.estimated_hours = parseInt(estimatedHours);
        console.log('Sending hourly bid data:', bidData);
      } else {
        bidData.total_value = parseFloat(values.amount);
        console.log('Sending fixed bid data:', bidData);
      }

      // Prepare form data for file uploads
      const formData = new FormData();
      
      // Add basic bid data
      Object.keys(bidData).forEach(key => {
        formData.append(key, bidData[key]);
      });

      // Add files
      fileList.forEach((file, index) => {
        if (file.originFileObj) {
          formData.append('files', file.originFileObj);
        }
      });

      // Add links (filter out empty ones)
      const validLinks = linkInputs.filter(link => link.trim() !== '');
      if (validLinks.length > 0) {
        formData.append('links', JSON.stringify(validLinks));
      }

      console.log('Form data:', {
        ...bidData,
        files: fileList.length,
        links: validLinks
      });

      const response = await axios.post(
        'http://127.0.0.1:8000/api/freelancer/bids/',
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('accessToken')}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      message.success('Your bid has been submitted successfully!');
      setShowBidModal(false);
      form.resetFields();
      
      // Reset state values
      setHourlyRate(0);
      setEstimatedHours(0);
      setTotalCost(0);
      setFileList([]);
      setLinkInputs(['']);
      
      // Optionally refresh project data to show updated bid count
      fetchProjectData();
    } catch (error) {
      console.error('Error submitting bid:', error);
      console.error('Request data sent:', bidData);
      message.error(error.response?.data?.error || 'Failed to submit bid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle assignment invitation response
  const handleAssignmentResponse = async (action) => {
    if (!pendingAssignment) return;
    
    try {
      setRespondingToAssignment(true);
      
      const response = await axios.post(
        `http://127.0.0.1:8000/api/freelancer/invitations/${pendingAssignment.id}/respond_to_assignment/`,
        {
          action: action,
          message: assignmentResponse
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('accessToken')}`,
          },
        }
      );

      if (response.data.status === 'success') {
        message.success(response.data.message);
        setShowAssignmentModal(false);
        setPendingAssignment(null);
        
        // Refresh project data
        fetchProjectData();
        
        // If accepted, redirect to dashboard or project page
        if (action === 'accept') {
          navigate('/freelancer/dashboard');
        }
      }
    } catch (error) {
      console.error('Error responding to assignment:', error);
      message.error(error.response?.data?.error || 'Failed to respond to assignment');
    } finally {
      setRespondingToAssignment(false);
    }
  };

  // Loading state
  if (projectLoading) {
    return (
      <div className="flex h-screen bg-freelancer-primary">
        <FSider
          userId={userId}
          role={role}
          isAuthenticated={isAuthenticated}
          isEditable={isEditable}
          dropdown={true}
          collapsed={true}
          handleProfileMenu={handleProfileMenu}
        />
        <div className={`${isMobile ? 'ml-0' : 'ml-16'} flex-1 flex flex-col bg-freelancer-primary`}>
          <FHeader
            userId={userId}
            role={role}
            isAuthenticated={isAuthenticated}
            isEditable={isEditable}
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Spin 
                indicator={<LoadingOutlined style={{ fontSize: 48, color: 'var(--freelancer-accent)' }} spin />} 
                size="large"
              />
              <p className="text-text-light mt-4 text-lg">Loading project details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-freelancer-primary">
        <FSider
          userId={userId}
          role={role}
          isAuthenticated={isAuthenticated}
          isEditable={isEditable}
          dropdown={true}
          collapsed={true}
          handleProfileMenu={handleProfileMenu}
        />
        <div className={`${isMobile ? 'ml-0' : 'ml-16'} flex-1 flex flex-col bg-freelancer-primary`}>
          <FHeader
            userId={userId}
            role={role}
            isAuthenticated={isAuthenticated}
            isEditable={isEditable}
          />
          <div className="flex-1 flex items-center justify-center">
            <Result
              status="error"
              title="Failed to Load Project"
              subTitle={error}
              extra={[
                <Button 
                  type="primary" 
                  key="retry"
                  onClick={fetchProjectData}
                  className="bg-freelancer-accent border-none"
                >
                  Try Again
                </Button>,
                <Button 
                  key="back"
                  onClick={() => navigate('/freelancer/projects')}
                >
                  Back to Projects
                </Button>
              ]}
            />
          </div>
        </div>
      </div>
    );
  }

  // No project data
  if (!projectData) {
    return (
      <div className="flex h-screen bg-freelancer-primary">
        <FSider
          userId={userId}
          role={role}
          isAuthenticated={isAuthenticated}
          isEditable={isEditable}
          dropdown={true}
          collapsed={true}
          handleProfileMenu={handleProfileMenu}
        />
        <div className={`${isMobile ? 'ml-0' : 'ml-16'} flex-1 flex flex-col bg-freelancer-primary`}>
          <FHeader
            userId={userId}
            role={role}
            isAuthenticated={isAuthenticated}
            isEditable={isEditable}
          />
          <div className="flex-1 flex items-center justify-center">
            <Result
              status="404"
              title="Project Not Found"
              subTitle="The project you're looking for doesn't exist or has been removed."
              extra={
                <Button 
                  type="primary" 
                  onClick={() => navigate('/freelancer/projects')}
                  className="bg-freelancer-accent border-none"
                >
                  Back to Projects
                </Button>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  // Helper function to format budget display
  const getBudgetDisplay = () => {
    if (projectData.pricing_strategy === 'fixed') {
      return `₹${projectData.budget?.toLocaleString() || '0'}`;
    } else {
      return `₹${projectData.hourly_rate}/hour for ${projectData.estimated_hours} hours`;
    }
  };

  // Helper function to get project status
  const getProjectStatus = () => {
    if (projectData.status === 'pending') return 'Open for Bidding';
    if (projectData.status === 'ongoing') return 'In Progress';
    if (projectData.status === 'completed') return 'Completed';
    return 'Draft';
  };

  // Render bid status section
  const renderBidStatus = () => {
    if (!existingBid) return null;

    const getStatusColor = (state) => {
      switch (state) {
        case 'submitted': return 'blue';
        case 'under_review': return 'orange';
        case 'interview_requested': return 'purple';
        case 'interview_accepted': return 'cyan';
        case 'accepted': return 'green';
        case 'withdrawn': return 'red';
        default: return 'default';
      }
    };

    return (
      <Card className="bg-freelancer-bg-card border border-white/10 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Your Bid Status</h2>
          <Tag color={getStatusColor(existingBid.state)} className="text-sm font-medium">
            {existingBid.status_message}
          </Tag>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 bg-freelancer-primary/20 rounded-lg">
            <div className="text-2xl font-bold text-freelancer-accent">
              ₹{existingBid.total_value.toLocaleString()}
            </div>
            <div className="text-sm text-text-light">Your Bid Amount</div>
          </div>
          
          <div className="text-center p-4 bg-freelancer-primary/20 rounded-lg">
            <div className="text-2xl font-bold text-freelancer-accent">
              v{existingBid.version}
            </div>
            <div className="text-sm text-text-light">Bid Version</div>
          </div>
          
          <div className="text-center p-4 bg-freelancer-primary/20 rounded-lg">
            <div className="text-2xl font-bold text-freelancer-accent">
              {moment(existingBid.created_at).format('MMM DD')}
            </div>
            <div className="text-sm text-text-light">Submitted</div>
          </div>
        </div>

        {/* Show resubmit button only for withdrawn bids */}
        {existingBid.can_resubmit && (
          <div className="text-center">
            <Button
              type="primary"
              size="large"
              onClick={() => setShowBidModal(true)}
              className="bg-freelancer-accent hover:bg-freelancer-accent/90 border-none"
              icon={<SendOutlined />}
            >
              Submit New Bid
            </Button>
            <div className="text-sm text-text-light mt-2">
              Your previous bid was withdrawn. You can submit a new proposal.
            </div>
          </div>
        )}

        {/* Show bid history */}
        {bidHistory.length > 1 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <HistoryOutlined />
              Bid History
            </h3>
            <Timeline
              items={bidHistory.map((bid, index) => ({
                color: getStatusColor(bid.state),
                children: (
                  <div className="text-text-light">
                    <div className="font-medium text-white">
                      Version {bid.version} - {bid.status_message}
                    </div>
                    <div className="text-sm">
                      ₹{bid.total_value.toLocaleString()} • {moment(bid.created_at).format('MMM DD, YYYY')}
                    </div>
                  </div>
                ),
              }))}
            />
          </div>
        )}
      </Card>
    );
  };

  // Render assignment invitation
  const renderAssignmentInvitation = () => {
    if (!pendingAssignment) return null;

    return (
      <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 mb-6">
        <div className="text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Project Assignment Invitation!
          </h2>
          <p className="text-text-light mb-4">
            Congratulations! The client has selected you for this project.
          </p>
          
          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <div className="text-sm text-text-light mb-2">Project Terms:</div>
            <div className="text-white font-medium">
              Budget: ₹{pendingAssignment.terms?.total_value?.toLocaleString() || 'N/A'}
            </div>
            <div className="text-white font-medium">
              Timeline: {moment(pendingAssignment.terms?.proposed_start).format('MMM DD')} - {moment(pendingAssignment.terms?.proposed_end).format('MMM DD, YYYY')}
            </div>
          </div>
          
          <div className="text-xs text-text-light mb-4">
            Expires: {moment(pendingAssignment.expires_at).format('MMM DD, h:mm A')}
          </div>
          
          <div className="flex gap-3 justify-center">
            <Button
              type="primary"
              size="large"
              onClick={() => setShowAssignmentModal(true)}
              className="bg-green-500 hover:bg-green-600 border-none"
              icon={<CheckCircleOutlined />}
            >
              Accept Assignment
            </Button>
            <Button
              size="large"
              onClick={() => setShowDeclineModal(true)}
              className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
              icon={<CloseCircleOutlined />}
            >
              Decline
            </Button>
          </div>
        </div>
      </Card>
    );
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
        handleProfileMenu={handleProfileMenu}
      />
      <div className={`${isMobile ? 'ml-0' : 'ml-16'} flex-1 flex flex-col bg-freelancer-primary`}>
        <FHeader
          userId={userId}
          role={role}
          isAuthenticated={isAuthenticated}
          isEditable={isEditable}
        />
        <div className="flex-1 overflow-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mx-auto space-y-6 ${
              isMobile ? 'p-4' : 
              isTablet ? 'p-6 max-w-[900px]' : 
              'p-8 max-w-[1200px]'
            }`}
          >
            {/* Assignment Invitation - Show first if exists */}
            {renderAssignmentInvitation()}
            
            {/* Bid Status - Show if user has bid */}
            {renderBidStatus()}
            
            {/* Project Header */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="relative bg-freelancer-bg-card rounded-xl shadow-lg p-8 mb-6 overflow-hidden border border-white/10"
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-freelancer-accent/10 rounded-full -mr-48 -mt-48 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-freelancer-accent/10 rounded-full -ml-32 -mb-32 blur-xl"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-text-light mb-2 text-center md:text-left">
                    {projectData.title}
                  </h1>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 text-text-light/80 text-center md:text-left">
                    <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      {getProjectStatus()}
                    </span>
                    <span className="hidden md:inline">•</span>
                    <span>Posted {moment(projectData.created_at).format('MMM DD, YYYY')}</span>
                    <span className="hidden md:inline">•</span>
                    <span>Budget: {getBudgetDisplay()}</span>
                    <span className="hidden md:inline">•</span>
                    <span>Deadline: {moment(projectData.deadline).format('MMM DD, YYYY')}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 flex justify-center md:justify-end">
                  {/* Only show submit bid button if no existing bid or bid is withdrawn */}
                  {(!existingBid || existingBid.can_resubmit) && (
                    <Button 
                      type="primary"
                      size="large"
                      icon={<SendOutlined />}
                      onClick={() => setShowBidModal(true)}
                      className="h-12 px-8 bg-freelancer-accent text-white border-none font-semibold shadow-lg hover:bg-freelancer-accent/90 transition-all duration-200"
                      disabled={projectData.status !== 'pending'}
                    >
                      {existingBid ? 'Submit New Bid' : 'Submit Bid'}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Project Details Grid */}
            <Row gutter={[24, 24]}>
              {/* Main Content */}
              <Col xs={24} lg={16}>
                <motion.div variants={itemVariants} className="space-y-6">
                  {/* Project Overview */}
                  <Card className="bg-freelancer-bg-card border border-white/10">
                    <h2 className="text-xl font-semibold text-white mb-4">Project Overview</h2>
                                        <div 
                      className="text-text-light leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: projectData.description }}
                    />
                  </Card>

                  {/* Skills Required */}
                  {projectData.skills_required && projectData.skills_required.length > 0 && (
                  <Card className="bg-freelancer-bg-card border border-white/10">
                    <h2 className="text-xl font-semibold text-white mb-4">Skills Required</h2>
                    <div className="flex flex-wrap gap-2">
                        {projectData.skills_required.map((skill, index) => (
                        <Tag 
                          key={index}
                          className="px-3 py-1 text-sm bg-freelancer-primary/20 text-freelancer-primary border-freelancer-primary/30"
                        >
                            {skill.name}
                        </Tag>
                      ))}
                    </div>
                  </Card>
                  )}

                  {/* Project Timeline */}
                  {projectData.milestones && projectData.milestones.length > 0 && (
                  <Card className="bg-freelancer-bg-card border border-white/10">
                    <h2 className="text-xl font-semibold text-white mb-4">Project Timeline</h2>
                    <Timeline
                        items={projectData.milestones.map((milestone, index) => ({
                        color: 'var(--freelancer-accent)',
                        children: (
                          <div className="text-text-light">
                            <div className="font-medium text-white">{milestone.title}</div>
                              <div className="text-sm">
                                {milestone.due_date && moment(milestone.due_date).format('MMM DD, YYYY')}
                              </div>
                          </div>
                        ),
                      }))}
                    />
                  </Card>
                  )}
                </motion.div>
              </Col>

              {/* Sidebar */}
              <Col xs={24} lg={8}>
                <motion.div variants={itemVariants} className="space-y-6">
                  {/* Client Information */}
                  <Card className="bg-freelancer-bg-card border border-white/10">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar 
                        size={64} 
                        icon={<UserOutlined />}
                      />
    <div>
                        <h3 className="text-lg font-semibold text-white">
                          {projectData.client?.username || 'Anonymous Client'}
                        </h3>
                        <div className="flex items-center gap-2 text-text-light">
                          <span>Client</span>
                        </div>
                      </div>
                    </div>
                    <Divider className="border-white/10" />
                    <Space direction="vertical" className="w-full">
                      <Statistic
                        title="Project Budget"
                        value={getBudgetDisplay()}
                        prefix={<DollarOutlined />}
                        valueStyle={{ color: 'var(--freelancer-accent)' }}
                      />
                      <Statistic
                        title="Project Duration"
                        value={`${moment(projectData.deadline).diff(moment(projectData.created_at), 'days')} days`}
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ color: 'var(--freelancer-accent)' }}
                      />
                      <Statistic
                        title="Pricing Strategy"
                        value={projectData.pricing_strategy === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
                        prefix={<TagOutlined />}
                        valueStyle={{ color: 'var(--freelancer-accent)' }}
                      />
                    </Space>
                  </Card>

                  {/* Project Details */}
                  <Card className="bg-freelancer-bg-card border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Project Details</h3>
                    <Space direction="vertical" className="w-full">
                      <div className="flex items-center gap-2 text-text-light">
                        <EnvironmentOutlined />
                        <span>Remote</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-light">
                        <TagOutlined />
                        <span>{projectData.pricing_strategy === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-light">
                        <StarOutlined />
                        <span>{projectData.complexity_level || 'Intermediate'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-light">
                        <CalendarOutlined />
                        <span>Deadline: {moment(projectData.deadline).format('MMM DD, YYYY')}</span>
                      </div>
                    </Space>
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </motion.div>
        </div>

        {/* Assignment Confirmation Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <CheckCircleOutlined className="text-green-500" />
              <span>Confirm Project Assignment</span>
            </div>
          }
          open={showAssignmentModal}
          onCancel={() => setShowAssignmentModal(false)}
          footer={null}
          width={500}
          className="custom-modal"
        >
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-white mb-4">
              Accept Project Assignment
            </h3>
            <p className="text-text-light mb-6">
              By accepting this assignment, you confirm that you will:
            </p>
            
            <div className="text-left space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircleOutlined className="text-green-400 mt-1" />
                <span className="text-text-light">Complete the project within the agreed timeline</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleOutlined className="text-green-400 mt-1" />
                <span className="text-text-light">Maintain regular communication with the client</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleOutlined className="text-green-400 mt-1" />
                <span className="text-text-light">Deliver high-quality work as specified</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleOutlined className="text-green-400 mt-1" />
                <span className="text-text-light">Follow the project terms and conditions</span>
              </div>
            </div>
            
            <div className="mb-4">
              <TextArea
                rows={3}
                placeholder="Add any additional notes or questions (optional)"
                value={assignmentResponse}
                onChange={(e) => setAssignmentResponse(e.target.value)}
                className="rounded-xl bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
              />
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button
                type="primary"
                size="large"
                onClick={() => handleAssignmentResponse('accept')}
                loading={respondingToAssignment}
                className="bg-green-500 hover:bg-green-600 border-none"
                icon={<CheckCircleOutlined />}
              >
                Accept Assignment
              </Button>
              <Button
                size="large"
                onClick={() => setShowAssignmentModal(false)}
                disabled={respondingToAssignment}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Decline Confirmation Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <ExclamationCircleOutlined className="text-red-500" />
              <span>Confirm Decline</span>
            </div>
          }
          open={showDeclineModal}
          onCancel={() => setShowDeclineModal(false)}
          footer={null}
          width={500}
          className="custom-modal"
        >
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-white mb-4">
              Are you sure you want to decline?
            </h3>
            <p className="text-text-light mb-6">
              Declining this assignment means you'll lose the opportunity to work on this project. 
              This action cannot be undone.
            </p>
            
            <div className="text-left space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <ExclamationCircleOutlined className="text-red-400 mt-1" />
                <span className="text-text-light">You'll lose this project opportunity</span>
              </div>
              <div className="flex items-start gap-3">
                <ExclamationCircleOutlined className="text-red-400 mt-1" />
                <span className="text-text-light">The client will be notified of your decline</span>
              </div>
              <div className="flex items-start gap-3">
                <ExclamationCircleOutlined className="text-red-400 mt-1" />
                <span className="text-text-light">You can still bid on other projects</span>
              </div>
              <div className="flex items-start gap-3">
                <ExclamationCircleOutlined className="text-red-400 mt-1" />
                <span className="text-text-light">Consider if you have any concerns that could be addressed</span>
              </div>
            </div>
            
            <div className="mb-4">
              <TextArea
                rows={3}
                placeholder="Please provide a reason for declining (optional but helpful for the client)"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="rounded-xl bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
              />
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button
                type="primary"
                size="large"
                onClick={() => {
                  handleAssignmentResponse('decline');
                  setShowDeclineModal(false);
                  setDeclineReason('');
                }}
                loading={respondingToAssignment}
                className="bg-red-500 hover:bg-red-600 border-none"
                icon={<CloseCircleOutlined />}
              >
                Yes, Decline Assignment
              </Button>
              <Button
                size="large"
                onClick={() => {
                  setShowDeclineModal(false);
                  setDeclineReason('');
                }}
                disabled={respondingToAssignment}
                className="bg-gray-500 hover:bg-gray-600 border-none"
              >
                Cancel
              </Button>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-400 text-sm">
                💡 <strong>Tip:</strong> If you're unsure, you can ask the client questions first 
                before making a final decision.
              </p>
            </div>
          </div>
        </Modal>

        {/* Bid Submission Modal */}
        <Modal
          title="Submit Your Bid"
          open={showBidModal}
          onCancel={() => setShowBidModal(false)}
          footer={null}
          width={600}
          className="custom-modal"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleBidSubmit}
            className="space-y-4"
          >
            {/* Project Pricing Strategy Display */}
            <div className="mb-6 p-4 bg-freelancer-primary/20 rounded-xl border border-freelancer-primary/30">
              <div className="flex items-center gap-3 mb-2">
                {projectData.pricing_strategy === 'fixed' ? (
                  <DollarOutlined className="text-2xl text-freelancer-accent" />
                ) : (
                  <ClockCircleOutlined className="text-2xl text-freelancer-accent" />
                )}
                <h3 className="text-lg font-semibold text-white">
                  {projectData.pricing_strategy === 'fixed' ? 'Fixed Price Project' : 'Hourly Rate Project'}
                </h3>
              </div>
              <p className="text-text-light text-sm">
                {projectData.pricing_strategy === 'fixed' 
                  ? `Client budget: ${getBudgetDisplay()}`
                  : `Client rate: ₹${projectData.hourly_rate}/hour for ${projectData.estimated_hours} hours`
                }
              </p>
                    </div>

            {/* Conditional Bid Fields Based on Project Pricing Strategy */}
            <AnimatePresence mode="wait">
              {projectData.pricing_strategy === 'fixed' ? (
                <motion.div
                  key="fixed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Form.Item
                    label={
                      <span className="text-lg font-medium text-text-light flex items-center gap-2">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-freelancer-primary flex items-center justify-center text-white"
                        >
                          1
                        </motion.div>
                        Your Fixed Price Bid
                      </span>
                    }
                    name="amount"
                    rules={[{ required: true, message: 'Please enter your bid amount!' }]}
                  >
                    <InputNumber
                      prefix="₹"
                      min={1}
                      step={100}
                      className="w-full h-12 text-lg rounded-xl !bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/₹\s?|(,*)/g, '')}
                      placeholder={`Budget: ${getBudgetDisplay()}`}
                    />
                  </Form.Item>
                </motion.div>
              ) : (
                <motion.div
                  key="hourly"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Form.Item
                    label={
                      <span className="text-lg font-medium text-text-light flex items-center gap-2">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-freelancer-primary flex items-center justify-center text-white"
                        >
                          1
                        </motion.div>
                        Your Hourly Rate & Time Estimate
                      </span>
                    }
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="hourlyRate"
                        rules={[{ required: true, message: 'Please enter your hourly rate!' }]}
                      >
                        <InputNumber
                            prefix="₹"
                          min={10}
                          step={5}
                          className="w-full h-12 rounded-xl !bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/₹\s?|(,*)/g, '')}
                          placeholder="Your hourly rate"
                            onChange={(value) => {
                              const newRate = value || 0;
                              setHourlyRate(newRate);
                              setTotalCost(newRate * estimatedHours);
                            }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="estimatedHours"
                        rules={[{ required: true, message: 'Please enter estimated hours!' }]}
                      >
                        <InputNumber
                          min={1}
                          className="w-full h-12 rounded-xl bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                          placeholder="Estimated hours"
                            onChange={(value) => {
                              const newHours = value || 0;
                              setEstimatedHours(newHours);
                              setTotalCost(hourlyRate * newHours);
                            }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                    
                    {/* Real-time Total Cost Display using state */}
                    <div className="mt-3 p-4 bg-freelancer-primary/10 rounded-lg border border-freelancer-primary/20">
                      <div className="flex justify-between items-center text-text-light mb-2">
                        <span className="font-medium">Estimated Total Cost:</span>
                        <span className="text-freelancer-accent font-bold text-lg">
                          ₹{totalCost > 0 ? totalCost.toLocaleString() : '0'}
                        </span>
                      </div>
                      
                      {/* Additional breakdown */}
                      <div className="text-sm text-text-light/70 space-y-1">
                        <div className="flex justify-between">
                          <span>Hourly Rate:</span>
                          <span>₹{hourlyRate.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Hours:</span>
                          <span>{estimatedHours} hours</span>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-1">
                          <span className="font-medium">Total:</span>
                          <span className="font-medium text-freelancer-accent">
                            ₹{totalCost.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Form.Item>
                </motion.div>
              )}
            </AnimatePresence>

            <Divider>
              <div className="flex items-center gap-2 text-freelancer-accent">
                <ArrowRightOutlined />
                <span>Timeline & Approach</span>
              </div>
            </Divider>

            <Form.Item
              label={<span className="text-text-light">Project Timeline</span>}
              name="timeline"
              rules={[{ required: true, message: 'Please select timeline!' }]}
            >
              <DatePicker.RangePicker
                className="w-full h-12 rounded-xl"
                disabledDate={current => current && current < moment().startOf('day')}
                ranges={{
                  'Next Week': [moment().add(1, 'day'), moment().add(1, 'week')],
                  'Next Month': [moment().add(1, 'day'), moment().add(1, 'month')],
                  'Custom Timeline': [moment().add(1, 'day'), moment().add(3, 'month')],
                }}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-text-light">Your Approach & Notes</span>}
              name="notes"
              rules={[{ required: true, message: 'Please add some notes!' }]}
            >
              <Input.TextArea 
                rows={4}
                className="rounded-xl resize-none"
                placeholder="Describe your approach, experience with similar projects, and why you're a good fit..."
              />
            </Form.Item>

            {/* File and Link Attachments Section */}
            <Divider>
              <div className="flex items-center gap-2 text-freelancer-accent">
                <PaperClipOutlined />
                <span>Attachments (Optional)</span>
                  </div>
            </Divider>

            {/* File Upload Section */}
            <Form.Item
              label={<span className="text-text-light">Upload Files (Max 5 files)</span>}
              name="files"
                >
              <Upload
                multiple
                maxCount={5}
                beforeUpload={(file) => {
                  // Prevent automatic upload
                  return false;
                }}
                onChange={(info) => {
                  // Handle file selection
                  const fileList = info.fileList.slice(0, 5); // Limit to 5 files
                  setFileList(fileList);
                }}
                fileList={fileList}
                listType="text"
                className="w-full"
              >
                    <Button 
                  icon={<UploadOutlined />} 
                  className="w-full h-12 rounded-xl bg-freelancer-primary/20 border-dashed border-freelancer-accent/30 text-freelancer-accent hover:bg-freelancer-primary/30"
                >
                  Choose Files
                    </Button>
              </Upload>
              <div className="text-xs text-text-light/60 mt-2">
                Supported formats: PDF, DOC, DOCX, JPG, PNG, ZIP (Max 10MB each)
                  </div>
            </Form.Item>

            {/* Link Attachments Section */}
                        <Form.Item
              label={<span className="text-text-light">Add Links (Max 5 links)</span>}
              name="links"
                        >
              <div className="space-y-3">
                {linkInputs.map((link, index) => (
                  <div key={index} className="flex gap-2">
                          <Input 
                      placeholder="https://example.com/portfolio"
                            value={link}
                            onChange={(e) => handleLinkChange(index, e.target.value)}
                      className="flex-1 rounded-xl bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                      prefix={<LinkOutlined className="text-freelancer-accent" />}
                          />
                          <Button 
                            type="text"
                            icon={<DeleteOutlined />} 
                            onClick={() => handleRemoveLink(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      disabled={linkInputs.length <= 1}
                          />
                      </div>
                ))}
                {linkInputs.length < 5 && (
                  <Button
                    type="dashed"
                    onClick={handleAddLink}
                    className="w-full h-10 rounded-xl border-dashed border-freelancer-accent/30 text-freelancer-accent hover:bg-freelancer-accent/10"
                    icon={<LinkOutlined />}
                  >
                    Add Another Link
                  </Button>
                  )}
              </div>
              <div className="text-xs text-text-light/60 mt-2">
                Add portfolio links, GitHub repos, or other relevant URLs
              </div>
            </Form.Item>

            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[{ required: true, message: 'You must agree to terms!' }]}
              className="mt-8"
            >
              <Checkbox className="text-text-light">
                I agree to the project terms and conditions
              </Checkbox>
            </Form.Item>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="w-full h-14 text-lg font-medium rounded-xl
                  bg-freelancer-accent border-none
                   shadow-md hover:shadow-lg"
                icon={<SendOutlined />}
              >
                Submit Bid
              </Button>
            </motion.div>
          </Form>
        </Modal>

        {/* Custom styles */}
        <style jsx global>{`
          .custom-modal .ant-modal-content {
            background: var(--freelancer-bg-card);
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(12px);
          }

          .custom-modal .ant-modal-header {
            background: transparent;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .custom-modal .ant-modal-title {
            color: var(--text-light);
          }

          .custom-modal .ant-modal-close {
            color: var(--text-muted);
          }

          .custom-modal .ant-form-item-label > label {
            color: var(--text-light);
          }

          .custom-modal .ant-input,
          .custom-modal .ant-input-number,
          .custom-modal .ant-picker {
            background: rgba(26, 27, 46, 0.4);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: var(--text-light);
          }

          .custom-modal .ant-input:hover,
          .custom-modal .ant-input-number:hover,
          .custom-modal .ant-picker:hover {
            border-color: var(--freelancer-accent);
            background: rgba(26, 27, 46, 0.6);
          }

          .custom-modal .ant-input:focus,
          .custom-modal .ant-input-number-focused,
          .custom-modal .ant-picker-focused {
            border-color: var(--freelancer-accent);
            background: rgba(26, 27, 46, 0.8);
            box-shadow: 0 0 0 2px rgba(0, 212, 170, 0.2);
          }

          .custom-modal .ant-input::placeholder {
            color: var(--text-muted);
          }

          .custom-modal .ant-checkbox-wrapper {
            color: var(--text-light);
          }

          .custom-modal .ant-checkbox-checked .ant-checkbox-inner {
            background-color: var(--freelancer-accent);
            border-color: var(--freelancer-accent);
          }

          .ant-timeline-item-tail {
            border-inline-start: 2px solid rgba(255, 255, 255, 0.1) !important;
          }

          .ant-statistic-title {
            color: rgba(255, 255, 255, 0.65) !important;
          }

          .ant-statistic-content {
            color: white !important;
          }

          .custom-modal .ant-input-number {
            background: var(--freelancer-primary) !important;
            backdrop-filter: blur(12px) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            color: var(--text-light) !important;
          }

          .custom-modal .ant-input-number:hover {
            border-color: var(--freelancer-accent) !important;
            background: var(--freelancer-primary) !important;
          }

          .custom-modal .ant-input-number-focused {
            border-color: var(--freelancer-accent) !important;
            background: var(--freelancer-primary) !important;
            box-shadow: 0 0 0 2px rgba(0, 212, 170, 0.2) !important;
          }

          .custom-modal .ant-input-number-input {
            background: transparent !important;
            color: var(--text-light) !important;
          }

          .custom-modal .ant-input-number-handler-wrap {
            background: transparent !important;
          }

          .custom-modal .ant-input-number-handler {
            background: transparent !important;
            border-color: rgba(255, 255, 255, 0.1) !important;
          }

          .custom-modal .ant-input-number-handler:hover {
            background: rgba(255, 255, 255, 0.05) !important;
          }

          .custom-modal .ant-upload {
            background: var(--freelancer-primary) !important;
            border: 1px dashed rgba(255, 255, 255, 0.1) !important;
            border-radius: 12px !important;
          }

          .custom-modal .ant-upload:hover {
            border-color: var(--freelancer-accent) !important;
            background: var(--freelancer-primary) !important;
          }

          .custom-modal .ant-upload-list {
            background: transparent !important;
          }

          .custom-modal .ant-upload-list-item {
            background: rgba(26, 27, 46, 0.4) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 8px !important;
            color: var(--text-light) !important;
          }

          .custom-modal .ant-upload-list-item:hover {
            border-color: var(--freelancer-accent) !important;
            background: rgba(26, 27, 46, 0.6) !important;
          }

          .custom-modal .ant-upload-list-item-name {
            color: var(--text-light) !important;
          }

          .custom-modal .ant-upload-list-item-actions {
            color: var(--text-light) !important;
          }

          .custom-modal .ant-upload-list-item-actions .anticon {
            color: var(--text-light) !important;
          }

          .custom-modal .ant-upload-list-item-actions .anticon:hover {
            color: var(--freelancer-accent) !important;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ProjectPageForBidding;
