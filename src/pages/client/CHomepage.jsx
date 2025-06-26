import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReferralTab from '../../components/ReferralTab'
import { 
  Button, Avatar, Tag, 
  Progress, Skeleton
} from 'antd';
import {
  ProjectOutlined,
  TeamOutlined,
  RocketOutlined,
  CrownOutlined,
  StarOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  FireOutlined,
  ArrowRightOutlined,
  BellOutlined
} from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import CHeader from "../../components/client/CHeader";
import CSider from "../../components/client/CSider";
import PropTypes from 'prop-types';

// Loading skeleton
const HomePageSkeleton = () => (
  <div className="p-6 max-w-7xl mx-auto">
    <div className="mb-8">
      <Skeleton.Input active size="large" className="mb-4 !bg-white/20 !w-96" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton.Image active className="w-full h-[300px] rounded-xl" />
        <Skeleton.Image active className="w-full h-[200px] rounded-xl" />
      </div>
      <div>
        <Skeleton.Image active className="w-full h-[520px] rounded-xl" />
      </div>
    </div>
  </div>
);

const CHomepage = ({ userId, role }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [currentDeadlinePage, setCurrentDeadlinePage] = useState(1);
  const [currentProjectPage, setCurrentProjectPage] = useState(1);

  // Premium dashboard data
  const dashboardData = {
    stats: {
      activeProjects: 8,
      totalSpent: 125000,
      successRate: 98,
      onTimeRate: 95,
      completedProjects: 24,
      monthlyBudget: 25000,
      savedAmount: 5200
    },
    featuredProject: {
      title: "E-Commerce Platform Redesign",
      progress: 75,
      dueDate: "Feb 28, 2024",
      freelancer: {
        name: "Sarah Chen",
        role: "Senior UI/UX Designer",
        rating: 4.9,
        avatar: "/api/placeholder/48/48"
      },
      tags: ["UI/UX Design", "High Priority", "Enterprise"]
    },
    recentActivities: [
      {
        type: 'milestone',
        title: 'Design System Completed',
        description: 'Final design system delivered',
        time: '2 hours ago',
        status: 'completed'
      },
      {
        type: 'payment',
        title: 'Milestone Payment',
        description: 'Payment processed for Phase 2',
        amount: '$2,500.00',
        time: 'Yesterday',
        status: 'completed'
      },
      {
        type: 'review',
        title: 'Project Review',
        description: 'New review received',
        rating: 5,
        time: '2 days ago',
        status: 'completed'
      }
    ]
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1500);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-client-primary via-client-secondary/10 to-client-bg-dark">
        <CSider userId={userId} role={role} collapsed={true} />
        <div className="flex-1 flex flex-col">
          <CHeader userId={userId} sidebarCollapsed={true} />
          <div className={`flex-1 ${isMobile ? 'ml-0' : 'ml-16'}`}>
          
            <HomePageSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-client-primary via-client-secondary/10 to-client-bg-dark">
      <CSider userId={userId} role={role} collapsed={true} />
      <div className={`flex-1 flex flex-col ${isMobile ? 'ml-0' : 'ml-16'}`}>
        <CHeader userId={userId} sidebarCollapsed={true} />
        
        <div className={`flex-1 overflow-auto `}>
        
          <div className="relative z-10 p-6 max-w-7xl mx-auto">
          
        <ReferralTab
          role="client"
          placement="homepage"
          userStats={{
            referralCount: 0,
            totalEarnings: 0,
            referralCode: null
          }}
          className="mb-2"
          />  
            {/* Main Content */}
            <div className="grid grid-cols-12 gap-3 lg:gap-4 auto-rows-min">
              {/* Hero Section - Full Width (12 columns) */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="col-span-12 relative overflow-hidden rounded-2xl mb-6"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-client-primary via-client-primary/80 to-client-bg-dark"></div>
                <div className="absolute inset-0 bg-client-gradient-soft opacity-30"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-client-accent/10 rounded-full blur-3xl -mr-48 -mt-48 animate-float"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-accent/8 rounded-full blur-2xl -ml-40 -mb-40 animate-float-delayed"></div>
                
                <div className="relative z-10 p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="inline-flex items-center gap-2 bg-client-accent/20 backdrop-blur-sm border border-client-accent/30 rounded-full px-4 py-2 mb-4"
                      >
                        <CrownOutlined className="text-client-accent" />
                        <span className="text-client-accent font-semibold">Welcome to Talintz</span>
                      </motion.div>

                      <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-4xl lg:text-5xl font-bold text-white mb-4"
                      >
                        Find Top Tech &<br />
                        <span className="bg-gradient-to-r from-white to-client-accent bg-clip-text text-transparent">
                          Creative Talent
                        </span>
                      </motion.h1>

                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="text-white/80 text-lg mb-6 max-w-2xl"
                      >
                        Connect with skilled professionals and bring your projects to life.
                      </motion.p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Suggestions Section (Keeping 8 columns for now, adjust later if needed) */}
              {/* Note: Suggestions was previously 8 columns and is now separate from the internal/external flow */}
              {/* I'll keep it in a distinct row for now, possibly paired with Internal Factors */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="col-span-12 lg:col-span-8 bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <FireOutlined className="text-client-accent text-xl" />
                    <h2 className="text-xl font-bold text-white">Recommended for You</h2>
                  </div>
                  <Button 
                    type="text" 
                    className="text-white/60 hover:text-white flex items-center gap-1"
                    icon={<ArrowRightOutlined />}
                  >
                    View All
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Freelancer Suggestions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold">Top Freelancers</h3>
                      <Button 
                        type="text" 
                        size="small"
                        className="text-white/60 hover:text-white"
                        icon={<ArrowRightOutlined />}
                      >
                        View All
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {[1, 2].map((_, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-all duration-300">
                          <Avatar 
                            size={48} 
                            src={`/api/placeholder/48/48?${index}`}
                            className="border-2 border-client-accent/30"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">Sarah Chen</p>
                            <p className="text-white/60 text-sm truncate">UI/UX Designer</p>
                            <div className="flex items-center gap-2 mt-1">
                              <StarOutlined className="text-client-accent" />
                              <span className="text-white/60 text-sm">4.9 (120+ reviews)</span>
                            </div>
                          </div>
                          <Button 
                            type="primary"
                            size="small"
                            className="bg-client-accent hover:bg-client-accent/90 border-0"
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Project Suggestions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold">Similar Projects</h3>
                      <Button 
                        type="text" 
                        size="small"
                        className="text-white/60 hover:text-white"
                        icon={<ArrowRightOutlined />}
                      >
                        View All
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {[1, 2].map((_, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-all duration-300">
                          <div className="w-12 h-12 rounded-lg bg-client-accent/20 flex items-center justify-center flex-shrink-0">
                            <ProjectOutlined className="text-client-accent text-xl" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">E-Commerce Platform</p>
                            <p className="text-white/60 text-sm truncate">Web Development</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Tag color="success" className="bg-status-success/20 text-status-success border-status-success/30">
                                Active
                              </Tag>
                              <span className="text-white/60 text-sm">$5K - $10K</span>
                            </div>
                          </div>
                          <Button 
                            type="primary"
                            size="small"
                            className="bg-client-accent hover:bg-client-accent/90 border-0"
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Internal Factors - 4 columns (Keeping its size for now) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="col-span-12 lg:col-span-4 space-y-4"
              >
                {/* Profile Completion */}
                <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <h2 className="text-xl font-bold text-white mb-4">Profile Status</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Profile Completion</span>
                      <Progress percent={75} size="small" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Verification Status</span>
                      <Tag color="success">Verified</Tag>
                    </div>
                    <Button type="primary" className="w-full bg-client-accent hover:bg-client-accent/90">
                      Complete Profile
                    </Button>
                  </div>
                </div>

                {/* Preferences */}
                <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <h2 className="text-xl font-bold text-white mb-4">Your Preferences</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Preferred Categories</span>
                      <div className="flex gap-1">
                        <Tag>Tech</Tag>
                        <Tag>Creative</Tag>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Budget Range</span>
                      <span className="text-white">$1K - $10K</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Workspace - 9 columns (Moved to the left) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="col-span-12 lg:col-span-9 bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <ProjectOutlined className="text-client-accent text-xl" />
                    <h2 className="text-xl font-bold text-white">Your Workspace</h2>
                  </div>
                </div>

                {dashboardData.stats.activeProjects > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                        className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-client-accent/20 flex items-center justify-center flex-shrink-0">
                            <ProjectOutlined className="text-client-accent text-xl" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold mb-1">E-Commerce Platform</h3>
                            <p className="text-white/60 text-sm mb-2">Web Development</p>
                            <div className="flex items-center gap-2">
                              <Tag color="processing">In Progress</Tag>
                              <span className="text-white/60 text-sm">75% Complete</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ProjectOutlined className="text-4xl text-white/40 mb-4" />
                    <h3 className="text-white font-semibold mb-2">No Active Projects</h3>
                    <p className="text-white/60 mb-4">Your projects need to be assigned to a freelancer to view your workspace</p>
                    <Button
                      type="primary"
                      className="bg-client-accent hover:bg-client-accent/90"
                      onClick={() => navigate('/client/post-project')}
                    >
                      Post a Project
                    </Button>
                  </div>
                )}
              </motion.div>

              {/* Quick Access - 3 columns (Moved to the right, updated layout) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="col-span-12 lg:col-span-3 bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <h2 className="text-xl font-bold text-white mb-4">Quick Access</h2>
                {/* Auto-adjusting grid for quick actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-4">
                  <Button
                    onClick={() => navigate('/client/post-project')}
                    type="primary"
                    className="h-24 bg-client-accent hover:bg-client-accent/90 border-0 flex flex-col items-center justify-center gap-2"
                  >
                    <RocketOutlined className="text-2xl" />
                    <span>Post Project</span>
                  </Button>
                  <Button
                    onClick={() => navigate('/client/browse-freelancers')}
                    className="h-24 bg-white/10 hover:bg-white/20 border-white/20 text-white flex flex-col items-center justify-center gap-2"
                  >
                    <TeamOutlined className="text-2xl" />
                    <span>Find Talent</span>
                  </Button>
                  <Button
                    onClick={() => navigate('/client/projects')}
                    className="h-24 bg-white/10 hover:bg-white/20 border-white/20 text-white flex flex-col items-center justify-center gap-2"
                  >
                    <ProjectOutlined className="text-2xl" />
                    <span>My Projects</span>
                  </Button>
                  <Button
                    onClick={() => navigate('/client/wallet')}
                    className="h-24 bg-white/10 hover:bg-white/20 border-white/20 text-white flex flex-col items-center justify-center gap-2"
                  >
                    <DollarOutlined className="text-2xl" />
                    <span>Wallet</span>
                  </Button>
                   {/* Add more buttons here if needed, they will auto-adjust */}
                </div>
              </motion.div>

              {/* Upcoming Deadlines - 5 columns */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="col-span-12 lg:col-span-5 bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-2xl p-4 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ClockCircleOutlined className="text-client-accent text-lg" />
                    <h2 className="text-lg font-bold text-white">Upcoming Deadlines</h2>
                  </div>
                  <Button 
                    type="text" 
                    className="text-white/60 hover:text-white"
                    icon={<ArrowRightOutlined />}
                  >
                    View All
                  </Button>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      title: "Design System Delivery",
                      deadline: "Feb 28, 2024",
                      project: "E-Commerce Platform",
                      freelancer: "Sarah Chen"
                    },
                    {
                      title: "API Integration",
                      deadline: "Mar 5, 2024",
                      project: "Mobile App",
                      freelancer: "Alex Kumar"
                    },
                     {
                      title: "Phase 3 Review",
                      deadline: "Mar 10, 2024",
                      project: "E-Commerce Platform",
                      freelancer: "Sarah Chen"
                    },
                     {
                      title: "Backend Finalization",
                      deadline: "Mar 15, 2024",
                      project: "Mobile App",
                      freelancer: "Alex Kumar"
                    },
                     {
                      title: "Marketing Assets Complete",
                      deadline: "Mar 20, 2024",
                      project: "E-Commerce Platform",
                      freelancer: "Sarah Chen"
                    }
                  ].slice((currentDeadlinePage - 1) * 3, currentDeadlinePage * 3).map((deadline, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                      className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-white font-semibold text-sm truncate">{deadline.title}</h3>
                        <Tag color="warning" className="text-xs flex-shrink-0">{deadline.deadline}</Tag>
                      </div>
                      <p className="text-white/60 text-xs truncate mb-1">{deadline.project}</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-white/60 text-xs truncate">Freelancer: {deadline.freelancer}</span>
                        <Button 
                          type="text" 
                          size="small"
                          className="text-client-accent hover:text-client-accent/80 text-xs p-0 flex-shrink-0"
                          icon={<BellOutlined />}
                        >
                          Notify
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination for Deadlines */}
                <div className="flex justify-center mt-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${
                        currentDeadlinePage === 1 
                          ? 'bg-client-accent scale-125' 
                          : 'bg-white/30 hover:bg-white/50'
                      }`}
                      onClick={() => setCurrentDeadlinePage(1)}
                    />
                    <div 
                      className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${
                        currentDeadlinePage === 2 
                          ? 'bg-client-accent scale-125' 
                          : 'bg-white/30 hover:bg-white/50'
                      }`}
                      onClick={() => setCurrentDeadlinePage(2)}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Your Projects - 7 columns */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="col-span-12 lg:col-span-7 bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <ProjectOutlined className="text-client-accent text-xl" />
                    <h2 className="text-xl font-bold text-white">Your Projects</h2>
                  </div>
                  <Button 
                    type="text" 
                    className="text-white/60 hover:text-white"
                    icon={<ArrowRightOutlined />}
                  >
                    View All
                  </Button>
                </div>

                {dashboardData.stats.activeProjects > 0 ? (
                  <div className="relative">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-client-accent/40 via-client-primary/30 to-transparent"></div>

                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5, 6].slice((currentProjectPage - 1) * 3, currentProjectPage * 3).map((_, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
                          className="relative pl-12"
                        >
                          {/* Timeline Dot */}
                          <div className="absolute left-0 w-3 h-3 rounded-full bg-client-accent border-2 border-white top-1/2 transform -translate-y-1/2"></div>
                          
                          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all duration-300">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-client-accent/20 flex items-center justify-center flex-shrink-0">
                              <ProjectOutlined className="text-client-accent text-lg" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-semibold text-base mb-1">Project Title {index + 1}</h3>
                              <p className="text-white/60 text-sm mb-2">Category</p>
                              <div className="flex items-center gap-2">
                                <Tag color="processing" className="text-xs">In Progress</Tag>
                                <span className="text-white/60 text-xs">$5K - $10K</span>
                              </div>
                            </div>
                            </div>
                            {/* Hover Effect Line */}
                            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-client-accent transition-all duration-300 group-hover:w-full"></div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination for Projects */}
                    <div className="flex justify-center mt-4">
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${
                            currentProjectPage === 1 
                              ? 'bg-client-accent scale-125' 
                              : 'bg-white/30 hover:bg-white/50'
                          }`}
                          onClick={() => setCurrentProjectPage(1)}
                        />
                        <div 
                          className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${
                            currentProjectPage === 2 
                              ? 'bg-client-accent scale-125' 
                              : 'bg-white/30 hover:bg-white/50'
                          }`}
                          onClick={() => setCurrentProjectPage(2)}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ProjectOutlined className="text-4xl text-white/40 mb-4" />
                    <h3 className="text-white font-semibold mb-2">No Projects Yet</h3>
                    <p className="text-white/60 mb-4">Start by posting your first project</p>
                    <Button
                      type="primary"
                      className="bg-client-accent hover:bg-client-accent/90"
                      onClick={() => navigate('/client/post-project')}
                    >
                      Post a Project
                    </Button>
                  </div>
                )}
              </motion.div>

              {/* Industry Insights - 6 columns (Separate and in a new row) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="col-span-12 lg:col-span-6 bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <h2 className="text-xl font-bold text-white mb-4">Industry Insights</h2>
                <div className="space-y-4">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <h3 className="text-white font-semibold mb-2">Tech Trends</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2 text-white/80">
                        <div className="w-1.5 h-1.5 bg-client-accent rounded-full flex-shrink-0"></div>
                        <span>AI & ML Integration</span>
                      </li>
                      <li className="flex items-center gap-2 text-white/80">
                        <div className="w-1.5 h-1.5 bg-client-accent rounded-full flex-shrink-0"></div>
                        <span>Cloud-Native Development</span>
                      </li>
                       <li className="flex items-center gap-2 text-white/80">
                        <div className="w-1.5 h-1.5 bg-client-accent rounded-full flex-shrink-0"></div>
                        <span>Cybersecurity Focus</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <h3 className="text-white font-semibold mb-2">Creative Trends</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2 text-white/80">
                        <div className="w-1.5 h-1.5 bg-client-accent rounded-full flex-shrink-0"></div>
                        <span>3D Design & Animation</span>
                      </li>
                      <li className="flex items-center gap-2 text-white/80">
                        <div className="w-1.5 h-1.5 bg-client-accent rounded-full flex-shrink-0"></div>
                        <span>AR/VR Experiences</span>
                      </li>
                       <li className="flex items-center gap-2 text-white/80">
                        <div className="w-1.5 h-1.5 bg-client-accent rounded-full flex-shrink-0"></div>
                        <span>Motion Graphics</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Success Stories - 6 columns (Separate and in the same row as Insights) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="col-span-12 lg:col-span-6 bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <h2 className="text-xl font-bold text-white mb-4">Success Stories</h2>
                <div className="relative">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-client-accent/40 via-client-primary/30 to-transparent"></div>

                  {/* Success Stories (Minimalistic) */}
                  <div className="space-y-4">
                    {[
                      {
                        title: "AI-Powered E-Commerce Platform",
                        client: "TechCorp",
                        year: "2024"
                      },
                      {
                        title: "Immersive AR Experience",
                        client: "Creative Solutions",
                        year: "2023"
                      },
                       {
                        title: "Cloud Migration Success",
                        client: "DataFlow Inc",
                        year: "2023"
                      },
                       {
                        title: "Mobile App Development",
                        client: "Innovate Ltd",
                        year: "2022"
                      },
                       {
                        title: "Website Redesign",
                        client: "Global Services",
                        year: "2022"
                      }
                    ].map((story, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }} 
                        className="relative pl-12"
                      >
                        {/* Timeline Dot */}
                        <div className="absolute left-0 w-3 h-3 rounded-full bg-client-accent border-2 border-white top-1/2 transform -translate-y-1/2"></div>
                        
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer">
                          <h3 className="text-white font-semibold text-sm">{story.title}</h3>
                          <p className="text-white/60 text-xs">{story.client}, {story.year}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Newsletter Signup - 8 columns (Keeping for now, can adjust placement) */}
               <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="col-span-12 lg:col-span-8 bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <h2 className="text-xl font-bold text-white mb-2">Stay Updated</h2>
                <p className="text-white/60 text-sm mb-4">Get the latest tech and creative industry insights delivered to your inbox.</p>
                <div className="flex flex-col md:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-client-accent"
                  />
                  <Button
                    type="primary"
                    className="bg-client-accent hover:bg-client-accent/90 border-0"
                  >
                    Subscribe
                  </Button>
                </div>
              </motion.div>

              {/* Industry Stats - 4 columns (Keeping for now, can adjust placement) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.3 }}
                className="col-span-12 lg:col-span-4 bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <h2 className="text-xl font-bold text-white mb-4">Industry Stats</h2>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Tech Projects</span>
                    <span className="text-white font-semibold">2,500+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Creative Projects</span>
                    <span className="text-white font-semibold">1,800+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Active Freelancers</span>
                    <span className="text-status-success font-semibold">10,000+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Success Rate</span>
                    <span className="text-status-success font-semibold">98%</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CHomepage.propTypes = {
  userId: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
};

export default CHomepage;

