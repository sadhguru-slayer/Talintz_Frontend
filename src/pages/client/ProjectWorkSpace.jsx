import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaRegFileAlt } from "react-icons/fa";
import { SlPicture } from "react-icons/sl";
import { 
  Button, Progress,
  Form, Input, Select,
  Collapse, Typography,
  notification, Tabs, Avatar, Tag, 
  Card, List, Badge,
  Modal, Tooltip,
  message,
  Popover,
  Popconfirm,
  
} from 'antd';
import { Pagination } from 'antd';
import { 
  CalendarOutlined, MessageOutlined, FileOutlined, 
  CheckCircleOutlined, SettingOutlined, BarChartOutlined,
  PlusOutlined, DollarOutlined, InboxOutlined, UploadOutlined,
  EditOutlined, DeleteOutlined, EyeOutlined,
  StarOutlined, TeamOutlined, ShareAltOutlined, GithubOutlined,
  UserOutlined, HomeOutlined, ProjectOutlined,
  DownloadOutlined,
  ArrowUpOutlined, CheckOutlined, LockOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import CSider from '../../components/client/CSider';
import CHeader from '../../components/client/CHeader';
import { CheckCircleFilled } from '@ant-design/icons';


const ProjectWorkSpace = ({ userId, role }) => {
  // Get the projectId from URL params
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const [mobileSiderVisible, setMobileSiderVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMilestoneModalVisible, setIsMilestoneModalVisible] = useState(false);
  const [milestoneForm] = Form.useForm();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [projectFiles, setProjectFiles] = useState([]);
  const [mobileView, setMobileView] = useState(false);
  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setMobileView(isMobile);
      if (!isMobile && mobileSiderVisible) {
        setMobileSiderVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileSiderVisible]);

  const [activeComponent, setActiveComponent] = useState('');

  const handleMenuClick = (component) => {
    if (component !== 'projects') {
      navigate('/client/dashboard', { state: { component } });
    }
  };

  const [activeProfileComponent, setActiveProfileComponent] = useState('');

  const handleProfileMenu = (profileComponent) => {
    if (location.pathname !== '/client/profile') {
      navigate(`/client/profile/${userId}`, { state: { profileComponent } });
    }
  };

  // Mock data for demonstration - in real implementation, fetch from API
  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      try {
        // Mock data - replace with actual API calls
        const projectData = {
          id: projectId || 1,
          title: "E-commerce Website Development",
          description: "Create a fully functional e-commerce platform with payment integration, inventory management, and analytics dashboard.",
          status: "ongoing",
          budget: 5000,
          paymentStatus: "partial",
          amountPaid: 2000,
          deadline: "2023-12-01",
          client: { id: 1, name: "Acme Corp", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
          startDate: "2023-08-15",
          progress: 45,
          complexity: "Intermediate",
          domain: "Web Development",
          repositoryUrl: "https://github.com/acme/ecommerce",
          freelancer: { id: 2, name: "Jane Smith", avatar: "https://randomuser.me/api/portraits/women/2.jpg" }
        };
        
        const milestonesData = [
          { id: 1, title: "UI Design Approval", amount: 1000, status: "paid", dueDate: "2023-09-15", milestone_type: "hybrid", completed: true },
          { id: 2, title: "Core Functionality", amount: 2000, status: "pending", dueDate: "2023-10-30", milestone_type: "payment", completed: false },
          { id: 3, title: "Final Delivery", amount: 2000, status: "pending", dueDate: "2023-11-30", milestone_type: "hybrid", completed: false }
        ];
        
        const filesData = [
          { id: 1, name: "UI-Mockups.zip", size: "24.5 MB", type: "application/zip", uploadedBy: "Client", date: "2023-08-20" },
          { id: 2, name: "database-schema.pdf", size: "2.7 MB", type: "application/pdf", uploadedBy: "Freelancer", date: "2023-08-25" },
          { id: 3, name: "project-requirements.docx", size: "1.2 MB", type: "application/docx", uploadedBy: "Client", date: "2023-08-15" }
        ];
        
        const messagesData = [
          { id: 1, sender: { id: 1, name: "Acme Corp", avatar: "https://randomuser.me/api/portraits/men/1.jpg" }, message: "How is the progress on the project?", timestamp: "2023-09-15T14:30:00" },
          { id: 2, sender: { id: 2, name: "Jane Smith", avatar: "https://randomuser.me/api/portraits/women/2.jpg" }, message: "Making good progress. Will update the milestone soon.", timestamp: "2023-09-15T14:45:00" }
        ];
        
        setProject(projectData);
        setMilestones(milestonesData);
        setProjectFiles(filesData);
        setMessages(messagesData);
        
      } catch (error) {
        console.error("Error fetching project data:", error);
        notification.error({
          message: "Failed to load project data",
          description: "Please try refreshing the page or contact support if the issue persists."
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [projectId]);

  // Handle milestone creation
  const handleMilestoneCreate = (values) => {
    const newMilestone = {
      id: milestones.length + 1,
      title: values.title,
      amount: values.amount,
      status: "pending",
      dueDate: values.dueDate.format("YYYY-MM-DD"),
      milestone_type: values.milestoneType,
      completed: false
    };
    
    setMilestones([...milestones, newMilestone]);
    milestoneForm.resetFields();
    setIsMilestoneModalVisible(false);
    
    notification.success({
      message: "Milestone Created",
      description: `"${values.title}" has been added to the project milestones`,
      placement: "topRight",
      duration: 4
    });
  };

  // Mark milestone as complete
  const completeMilestone = (milestoneId) => {
    const updatedMilestones = milestones.map(milestone => {
      if (milestone.id === milestoneId) {
        return { ...milestone, completed: true, status: milestone.milestone_type === 'payment' ? 'paid' : 'approved' };
      }
      return milestone;
    });
    
    setMilestones(updatedMilestones);
    
    notification.success({
      message: "Milestone Completed",
      description: `${milestones.find(m => m.id === milestoneId)?.title} has been marked as complete`,
      placement: "topRight"
    });
  };

  // Determine project progress color
  const getProgressColor = (progress) => {
    if (progress < 30) return "#f5222d";
    if (progress < 70) return "#faad14";
    return "#52c41a";
  };

  // Navigation route items
  const getRouteItems = () => [
    {
      title: "Back to Dashboard",
      icon: <HomeOutlined />,
      link: "/client/dashboard"
    },
    {
      title: "All Projects",
      icon: <ProjectOutlined />,
      link: "/client/dashboard/projects"
    }
  ];

  // Render main workspace content
  return (
      <div className={`flex-1 flex flex-col overflow-hidden `}>
        <div className={`  flex-1 overflow-auto p-4 md:p-6`}>
          {/* Project Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl mb-6 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-client-primary via-client-primary/80 to-client-bg-dark"></div>
            <div className="absolute inset-0 bg-client-gradient-soft opacity-30"></div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-client-accent/10 rounded-full blur-3xl -mr-24 -mt-24 animate-float"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-accent/8 rounded-full blur-2xl -ml-20 -mb-20 animate-float-delayed"></div>
            <div className="relative z-10 p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-wide text-white mb-2 cred-font">{project?.title}</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-white/10 backdrop-blur-sm text-white text-lg px-5 py-2 rounded-full border border-white/20 font-bold cred-balance-shadow">
                      {project?.domain}
                    </span>
                    <span className="text-white/90 text-lg">
                      <UserOutlined className="mr-2" /> {project?.freelancer?.name}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} 
                    className="cred-btn-secondary flex items-center gap-2 px-6 py-2 rounded-full font-semibold shadow-lg"
                    onClick={() => setIsChatOpen(!isChatOpen)}
                  >
                    <MessageOutlined /> Chat
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} 
                    className="cred-btn-accent flex items-center gap-2 px-6 py-2 rounded-full font-semibold shadow-lg"
                  >
                    <SettingOutlined /> Settings
                  </motion.button>
                </div>
              </div>
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
                {[
                  { icon: <ProjectOutlined />, label: "Milestones", value: `${milestones.filter(m => m.completed).length}/${milestones.length}`, color: 'var(--client-accent)' },
                  { icon: <DollarOutlined />, label: "Budget", value: `$${project?.amountPaid?.toLocaleString()}`, color: 'var(--status-success)' },
                  { icon: <CalendarOutlined />, label: "Timeline", value: `${Math.ceil((new Date(project?.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days`, color: 'var(--client-primary)' },
                  { icon: <TeamOutlined />, label: "Team", value: "4 Members", color: 'var(--client-secondary)' }
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 shadow-md"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}20` }}>
                      {React.cloneElement(stat.icon, { style: { color: stat.color, fontSize: 22 } })}
                    </div>
                    <div>
                      <p className="text-white/70 text-base font-medium">{stat.label}</p>
                      <p className="text-white font-bold text-xl">{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Content with Modern Tabs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl shadow-xl"
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className="custom-tabs"
              tabBarStyle={{
                margin: 0,
                padding: isMobile ? '12px 16px 0' : '16px 24px 0',
                background: 'transparent',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Overview Tab */}
              <Tabs.TabPane 
                tab={<span className="flex items-center gap-2 cred-tab-label text-text-light"><BarChartOutlined />Overview</span>}
                key="overview"
              >
                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Project Description */}
                    <div className="lg:col-span-2">
                      <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-md">
                        <h3 className="text-xl font-bold text-white mb-4 cred-font">Project Description</h3>
                        <p className="text-white/80">{project?.description}</p>
                      </div>
                            </div>

                    {/* Upcoming Milestones */}
                                  <div>
                      <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-md">
                        <h3 className="text-xl font-bold text-white mb-4 cred-font">Upcoming Milestones</h3>
                              <div className="space-y-4">
                                {milestones.filter(m => !m.completed).slice(0, 2).map(milestone => (
                            <motion.div key={milestone.id} whileHover={{ x: 4 }} className="p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                              <h4 className="font-semibold text-white cred-font">{milestone.title}</h4>
                              <div className="flex justify-between items-center mt-2 text-sm">
                                <span className="text-white/60"><CalendarOutlined className="mr-1" />{milestone.dueDate}</span>
                                <span className="font-semibold text-client-accent">${milestone.amount}</span>
                              </div>
                            </motion.div>
                          ))}
                                  </div>
                      </div>
                                </div>
                                  </div>
                        </div>
              </Tabs.TabPane>

              {/* Milestones Tab */}
              <Tabs.TabPane 
                tab={<span className="flex items-center gap-2 cred-tab-label text-text-light"><ClockCircleOutlined />Milestones</span>}
                key="milestones"
              >
                      <div className="p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                          <div>
                      <h3 className="text-xl font-bold text-white cred-font">Project Milestones</h3>
                      <p className="text-sm text-white/60 mt-1">Track project progress and payments</p>
                          </div>
                          <Button 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={() => setIsMilestoneModalVisible(true)}
                      className="cred-btn-accent"
                          >
                            Add Milestone
                          </Button>
                          </div>

                  {/* Milestone List */}
                  <div className="space-y-4">
                    {milestones.map(milestone => (
                      <motion.div key={milestone.id} whileHover={{ x: 4 }} 
                        className="rounded-xl bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl border border-white/10 p-4 shadow-md overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              milestone.completed ? 'bg-status-success/20 text-status-success' : 'bg-white/10 text-white/60'
                            }`}>
                              {milestone.completed ? <CheckCircleOutlined style={{ fontSize: 22 }} /> : <span className="text-xl font-semibold">{milestones.indexOf(milestone) + 1}</span>}
                            </div>
                                    <div>
                              <h4 className="font-semibold text-white cred-font">{milestone.title}</h4>
                              <p className="text-sm text-white/60">{milestone.dueDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-semibold text-client-accent text-lg">${milestone.amount}</span>
                                        {!milestone.completed && (
                                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                              size="small"
                                              onClick={() => completeMilestone(milestone.id)}
                                className="cred-btn-secondary px-4 py-2 rounded-full font-semibold text-sm shadow-lg"
                              >
                                Complete
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                                        </div>
                              </div>
                            </Tabs.TabPane>
                            
              {/* Files Tab */}
                            <Tabs.TabPane 
                tab={<span className="flex items-center gap-2 cred-tab-label text-text-light"><FileOutlined />Files</span>}
                key="files"
                            >
                <div className="p-6">
                  <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center bg-white/5 backdrop-blur-sm shadow-md">
                    <UploadOutlined className="text-4xl text-white/60 mb-4" />
                    <p className="text-white font-medium mb-2">
                      Drag files here or <span className="text-client-accent cursor-pointer">browse</span>
                                </p>
                    <p className="text-white/60 text-sm">Supports all common file formats</p>
                              </div>

                  <div className="mt-6 space-y-3">
                    {projectFiles.map(file => (
                      <motion.div key={file.id} whileHover={{ x: 4 }} className="flex items-center p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                        <FileOutlined className="text-xl text-white/60 mr-3" />
                        <div className="flex-1">
                          <div className="font-medium text-white">{file.name}</div>
                          <div className="text-sm text-white/60">{file.size} • {file.uploadedBy}</div>
                        </div>
                        <Button type="text" icon={<DownloadOutlined className="text-white/60 hover:text-white" />} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Tabs.TabPane>
            </Tabs>
            </motion.div>
          </div>





          <style jsx global>{`
          .cred-font {
            font-family: 'Montserrat', 'Inter', 'Segoe UI', Arial, sans-serif;
            letter-spacing: 0.02em;
          }
          .cred-balance-shadow {
            box-shadow: 0 4px 32px 0 rgba(0,0,0,0.18), 0 1.5px 4px 0 rgba(0,0,0,0.10);
          }
          .cred-btn-secondary {
            background: var(--client-secondary);
            color: #fff;
            border: none;
            border-radius: 9999px;
            box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10);
            transition: all 0.3s ease;
          }
          .cred-btn-secondary:hover {
            background: var(--client-secondary-dark);
            box-shadow: 0 8px 32px 0 rgba(0,0,0,0.15);
            transform: translateY(-2px) scale(1.03);
          }
          .cred-btn-accent {
            background: var(--client-accent);
            color: #fff;
            border: none;
            border-radius: 9999px;
            box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10);
            transition: all 0.3s ease;
          }
          .cred-btn-accent:hover {
            background: var(--client-accent-dark);
            box-shadow: 0 8px 32px 0 rgba(0,0,0,0.15);
            transform: translateY(-2px) scale(1.03);
          }
          .cred-pill {
            display: inline-block;
            padding: 0.5em 1.2em;
            border-radius: 9999px;
            font-weight: 700;
            font-size: 1rem;
            letter-spacing: 0.03em;
            box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
          }
          .cred-pill-credit {
            background: var(--status-success);
            color: #fff;
          }
          .cred-pill-debit {
            background: var(--status-error);
            color: #fff;
          }
          .cred-tab-label {
            font-size: 1.1rem;
            font-weight: 600;
            letter-spacing: 0.02em;
            color: var(--text-light);
          }
          .custom-tabs .ant-tabs-nav {
            margin: 0 !important;
            padding: ${isMobile ? '12px 16px 0' : '16px 24px 0'} !important;
            background: transparent !important;
          }
          .custom-tabs .ant-tabs-tab {
            margin: 0 ${isMobile ? '4px' : '8px'} 0 0 !important;
            padding: ${isMobile ? '10px 20px' : '14px 32px'} !important;
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
          .ant-card, .ant-card-body {
            background: transparent !important;
            border: none !important;
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
  
          .ant-tabs-nav-list{
            flex-wrap:wrap !important;
            gap:0.25rem;
            
        `}</style>

    </div>
    

    
  );
};

export default ProjectWorkSpace;