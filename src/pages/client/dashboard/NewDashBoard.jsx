import React, { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { 
  Card, Row, Col, Progress, Skeleton, Table, Badge, 
  Tooltip, Button, Tag, Select, List, Alert, Tabs
} from 'antd';
import { 
  ProjectOutlined, 
  CheckCircleOutlined, DollarCircleOutlined, 
  TeamOutlined, BellOutlined, SettingOutlined, BarChartOutlined, CrownOutlined, LockOutlined, DollarOutlined, MoreOutlined, EditOutlined, ClockCircleOutlined, FileTextOutlined, RocketOutlined, StarOutlined, AppstoreOutlined, WalletOutlined, PlusOutlined, CustomerServiceOutlined, FilePdfOutlined, FileWordOutlined, QuestionCircleOutlined, MessageOutlined, DownloadOutlined, RightOutlined
} from '@ant-design/icons';
import { Pie } from '@ant-design/plots';
import { useMediaQuery } from 'react-responsive';
import { AiFillProject } from 'react-icons/ai';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Legend } from 'chart.js';
Chart.register(ArcElement, Legend);

// Update the project metrics data to match Talintz model
const projectMetrics = {
  projectHealth: {
    activeOBSP: 8,
    traditionalProjects: 4,
    completedPacks: 15,
    pendingDelivery: 3
  },
  packCategories: {
    basic: 45,  // Packs < ₹10K
    mid: 35,    // Packs < ₹20K
    custom: 20  // Traditional projects
  },
  financialMetrics: {
    totalInvested: 150000,
    inEscrow: 50000,
    released: 80000,
    refunded: 20000,
    onProjects: 30000,
    onPacks: 20000,
    available: 50000
  },
  milestones: [
    { name: 'UI/UX Pack Delivery', progress: 100, status: 'completed', type: 'OBSP' },
    { name: 'Web Development Pack', progress: 65, status: 'in_progress', type: 'OBSP' },
    { name: 'Custom Project', progress: 40, status: 'in_progress', type: 'Traditional' },
    { name: 'Content Writing Pack', progress: 0, status: 'upcoming', type: 'OBSP' }
  ],
  recentActivities: [
    { id: 1, description: 'New OBSP claimed by freelancer', timestamp: '2 hours ago', type: 'OBSP' },
    { id: 2, description: 'Escrow released for completed pack', timestamp: '5 hours ago', type: 'Payment' },
    { id: 3, description: 'Project milestone approved', timestamp: '1 day ago', type: 'Traditional' },
    { id: 4, description: 'Freelancer stake returned', timestamp: '2 days ago', type: 'Stake' }
  ]
};

const DashboardSkeleton = () => (
  <div className="flex-1 p-4 md:p-6 bg-client-bg">
    {/* Header Card Skeleton */}
    <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl p-6 mb-6 border border-white/10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Skeleton.Input 
            active 
            size="large" 
            className="mb-4" 
            style={{ width: 200, background: 'rgba(255, 255, 255, 0.1)' }} 
          />
          <div className="flex gap-3">
            <Skeleton.Button 
              active 
              size="small" 
              style={{ width: 120, background: 'rgba(255, 255, 255, 0.1)' }} 
            />
            <Skeleton.Button 
              active 
              size="small" 
              style={{ width: 120, background: 'rgba(255, 255, 255, 0.1)' }} 
            />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton.Button 
            active 
            style={{ width: 120, background: 'rgba(255, 255, 255, 0.1)' }} 
          />
          <Skeleton.Button 
            active 
            style={{ width: 120, background: 'rgba(255, 255, 255, 0.1)' }} 
          />
        </div>
      </div>

      {/* Stats Row Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Skeleton.Avatar 
                active 
                size={24} 
                style={{ background: 'rgba(255, 255, 255, 0.1)' }} 
              />
            </div>
            <div>
              <Skeleton.Input 
                active 
                size="small" 
                style={{ width: 80, background: 'rgba(255, 255, 255, 0.1)' }} 
              />
              <Skeleton.Input 
                active 
                size="small" 
                className="mt-1" 
                style={{ width: 60, background: 'rgba(255, 255, 255, 0.1)' }} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Main Content Skeleton */}
    <div className="grid grid-cols-12 gap-3 lg:gap-4 auto-rows-min">
      {/* Left Column - Upcoming Events & Financial Overview */}
      <div className="col-span-12 lg:col-span-8 space-y-3 lg:space-y-4">
        {/* Upcoming Events Timeline Skeleton */}
        <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Skeleton.Input 
                active 
                size="small" 
                style={{ width: 150, background: 'rgba(255, 255, 255, 0.1)' }} 
              />
            <Skeleton.Button 
                active 
                size="small" 
                style={{ width: 60, background: 'rgba(255, 255, 255, 0.1)' }} 
              />
            </div>
            <Skeleton.Button 
              active 
              size="small" 
              style={{ width: 32, background: 'rgba(255, 255, 255, 0.1)' }} 
            />
          </div>

          <div className="relative min-h-[320px]">
            {/* Timeline line skeleton */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-client-accent/40 via-client-primary/30 to-transparent z-0 rounded-full" />
            
            {/* Timeline events skeleton */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div
              key={i} 
                className={`absolute w-1/2 px-1 sm:px-2 ${
                  i % 2 === 0 ? 'left-0 text-right' : 'right-0 text-left'
                }`}
                style={{
                  top: `calc(${(i + 0.5) * 56}px)`,
                  zIndex: 2
                }}
              >
                <div className={`
                  inline-flex flex-col items-${i % 2 === 0 ? 'end' : 'start'} max-w-xs sm:max-w-sm md:max-w-md
                `}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Skeleton.Avatar 
              active 
                      size={20} 
                      style={{ background: 'rgba(255, 255, 255, 0.1)' }} 
                    />
                    <Skeleton.Input 
                      active 
                      size="small" 
                      style={{ width: 120, background: 'rgba(255, 255, 255, 0.1)' }} 
                    />
                    <Skeleton.Button 
                      active 
                      size="small" 
                      style={{ width: 60, background: 'rgba(255, 255, 255, 0.1)' }} 
                    />
                  </div>
                  <Skeleton.Input 
                    active 
                    size="small" 
                    style={{ width: 180, background: 'rgba(255, 255, 255, 0.1)' }} 
                  />
            <div className="flex items-center gap=1 mt-0.5">
                    <Skeleton.Avatar 
                      active 
                      size={12} 
                      style={{ background: 'rgba(255, 255, 255, 0.1)' }} 
                    />
                    <Skeleton.Input 
                      active 
                      size="small" 
                      style={{ width: 80, background: 'rgba(255, 255, 255, 0.1)' }} 
                    />
                  </div>
                </div>
                {/* Timeline dot skeleton */}
                <div className={`absolute top-1/2 -translate-y-1/2 z-10 ${
                  i % 2 === 0 ? 'left-full -translate-x-1/2' : 'right-full translate-x-1/2'
                }`}>
                  <Skeleton.Avatar 
                    active 
                    size={10} 
                    style={{ background: 'rgba(255, 255, 255, 0.2)' }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Overview Skeleton */}
        <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <Skeleton.Input 
              active 
              size="small" 
              style={{ width: 150, background: 'rgba(255, 255, 255, 0.1)' }} 
            />
            <Skeleton.Button 
              active 
              size="small" 
              style={{ width: 32, background: 'rgba(255, 255, 255, 0.1)' }} 
            />
                    </div>
          <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton.Avatar 
                    active 
                    size={32} 
                    style={{ background: 'rgba(255, 255, 255, 0.1)' }} 
                  />
                  <div>
                    <Skeleton.Input 
                      active 
                      size="small" 
                      style={{ width: 80, background: 'rgba(255, 255, 255, 0.1)' }} 
                    />
                    <Skeleton.Input 
                      active 
                      size="small" 
                      className="mt-1" 
                style={{ width: 60, background: 'rgba(255, 255, 255, 0.1)' }} 
                    />
                          </div>
                          </div>
                <Skeleton.Input 
                  active 
                  size="small" 
                  style={{ width: '100%', background: 'rgba(255, 255, 255, 0.1)' }} 
                />
                        </div>
                      ))}
                    </div>
        </div>
            </div>

      {/* Right Column - Pack Distribution & Recent Activity */}
      <div className="col-span-12 lg:col-span-4 space-y-3 lg:space-y-4">
        {/* Pack Distribution Skeleton */}
  <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <Skeleton.Input 
            active 
            size="small" 
            style={{ width: 150, background: 'rgba(255, 255, 255, 0.1)' }} 
            className="mb-4"
          />
          <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                  <Skeleton.Input 
                    active 
                    size="small" 
                    style={{ width: 100, background: 'rgba(255, 255, 255, 0.1)' }} 
                  />
                  <Skeleton.Input 
                    active 
                    size="small" 
                    style={{ width: 40, background: 'rgba(255, 255, 255, 0.1)' }} 
                  />
                      </div>
                <Skeleton.Input 
                  active 
                  size="small" 
                  style={{ width: '100%', background: 'rgba(255, 255, 255, 0.1)' }} 
                />
                    </div>
                  ))}
                </div>
            </div>

        {/* Recent Activity Skeleton */}
        <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <Skeleton.Input 
              active 
              size="small" 
              style={{ width: 150, background: 'rgba(255, 255, 255, 0.1)' }} 
            />
            <Skeleton.Button 
              active 
              size="small" 
              style={{ width: 32, background: 'rgba(255, 255, 255, 0.1)' }} 
            />
                      </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Skeleton.Avatar 
                    active 
                    size={32} 
                    style={{ background: 'rgba(255, 255, 255, 0.1)' }} 
                  />
                  <div className="flex-1">
                    <Skeleton.Input 
                      active 
                      size="small" 
                      style={{ width: '80%', background: 'rgba(255, 255, 255, 0.1)' }} 
                      className="mb-1"
                    />
                    <div className="flex items-center justify-between">
                      <Skeleton.Input 
                        active 
                        size="small" 
                        style={{ width: 80, background: 'rgba(255, 255, 255, 0.1)' }} 
                      />
                      <Skeleton.Button 
                        active 
                        size="small" 
                  style={{ width: 60, background: 'rgba(255, 255, 255, 0.1)' }} 
                      />
                    </div>
                  </div>
                </div>
            </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Add this new component before the main DashboardOverview component
const UpcomingEventsSection = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.7 }}
    className="col-span-12 lg:col-span-8 bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-bold text-white">Upcoming Events</h3>
        <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">Timeline</span>
      </div>
      <Button 
        type="text" 
        size="small"
        className="text-white/60 hover:text-white"
        icon={<MoreOutlined />}
      />
    </div>

    <div className="relative min-h-[320px]">
      {/* Timeline line */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-client-accent/40 via-client-primary/30 to-transparent z-0 rounded-full" />
      
      {/* Timeline events */}
      {projectMetrics.milestones.map((event, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
          className={`absolute w-1/2 px-1 sm:px-2 ${
            index % 2 === 0 ? 'left-0 text-right' : 'right-0 text-left'
          }`}
          style={{
            top: `calc(${(index + 0.5) * 56}px)`,
            zIndex: 2
          }}
        >
          <div className={`
            inline-flex flex-col items-${index % 2 === 0 ? 'end' : 'start'} max-w-xs sm:max-w-sm md:max-w-md
          `}>
            <div className="flex items-center gap-2 mb-0.5">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                event.type === 'OBSP' ? 'bg-client-accent/20' : 'bg-client-primary/20'
              }`}>
                {event.type === 'OBSP' ? (
                  <ProjectOutlined className="text-client-accent" />
                ) : (
                  <TeamOutlined className="text-client-primary" />
                )}
              </div>
              <span className="text-white/80 text-sm font-medium">{event.name}</span>
              <Tag 
                color={
                  event.status === 'completed' ? 'success' :
                  event.status === 'in_progress' ? 'processing' :
                  'default'
                }
                className="text-xs"
              >
                {event.status.replace('_', ' ')}
              </Tag>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <ClockCircleOutlined className="text-white/40 text-xs" />
              <span className="text-white/60 text-xs">Due in 2 days</span>
            </div>
          </div>
          {/* Timeline dot */}
          <div className={`absolute top-1/2 -translate-y-1/2 z-10 ${
            index % 2 === 0 ? 'left-full -translate-x-1/2' : 'right-full translate-x-1/2'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              event.status === 'completed' ? 'bg-status-success' :
              event.status === 'in_progress' ? 'bg-client-primary' :
              'bg-client-accent'
            }`} />
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [viewMode, setViewMode] = useState('chart');
  const [projectViewMode, setProjectViewMode] = useState('combined');
  const [financialView, setFinancialView] = useState('donut');

  // Optimize data fetching with debounce and caching
  const fetchData = useCallback(
    debounce(async () => {
    try {
      const startTime = Date.now();
      const accessToken = Cookies.get('accessToken');
        
        // Add cache control headers
        const response = await axios.get(
          `https://talintzbackend-production.up.railway.app/api/client/dashboard_overview`,
      {            headers: { 
              Authorization: `Bearer ${accessToken}`,
              'Cache-Control': 'max-age=300' // Cache for 5 minutes
            }
          }
        );
        
      const elapsedTime = Date.now() - startTime;
        const minimumLoadTime = 1000;
      
      if (elapsedTime < minimumLoadTime) {
        await new Promise(resolve => setTimeout(resolve, minimumLoadTime - elapsedTime));
      }

      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    }
    }, 300),
    []
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoize computed values
  const quickStats = useMemo(() => [
    {
      title: 'Active OBSPs',
      value: projectMetrics.projectHealth.activeOBSP,
      icon: <AiFillProject />,
      color: 'var(--client-primary)',
      trend: 'up'
    },
    {
      title: 'In Escrow',
      value: `₹${(projectMetrics.financialMetrics.inEscrow).toLocaleString()}`,
      icon: <DollarCircleOutlined />,
      color: 'var(--status-success)',
      trend: 'stable'
    },
    {
      title: 'Projects',
      value: projectMetrics.projectHealth.traditionalProjects,
      icon: <ProjectOutlined />,
color: 'var(--client-accent)',
      trend: 'up'
    },
    {
      title: 'Completed Packs',
      value: projectMetrics.projectHealth.completedPacks,
      icon: <CheckCircleOutlined />,
      color: 'var(--status-info)',
      trend: 'up'
    }
  ], [projectMetrics]);

  const packDistributionConfig = useMemo(() => ({
    data: [
      { type: 'Basic Packs (<₹10K)', value: projectMetrics.packCategories.basic },
      { type: 'Mid Packs (<₹20K)', value: projectMetrics.packCategories.mid },
      { type: 'Custom Projects', value: projectMetrics.packCategories.custom }
    ],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    color: ['#1C2E4A', '#D6E6F2', '#FF6B5A'],
    label: {
      type: 'outer',
      content: '{percentage}'
    }
  }), [projectMetrics.packCategories]);

  // Optimize animations with reduced complexity
  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  };

  // Optimized Chart Configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: 'easeOutQuad'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(30,41,59,0.85)',
        borderColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        padding: 8,
        boxPadding: 4,
        cornerRadius: 6,
        callbacks: {
          label: (context) => `₹${context.parsed.y?.toLocaleString('en-IN')}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255,255,255,0.08)',
          borderDash: [4, 4]
        },
        ticks: {
          color: 'rgba(255,255,255,0.7)',
          font: { size: 12 }
        }
      },
      x: {
        grid: { display: false },
        ticks: {
    color: 'rgba(255,255,255,0.7)',
          font: { size: 12 }
        }
      }
    }
  };

  // Add virtualization for long lists
  const VirtualizedList = ({ items, renderItem }) => {
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
    
    const onScroll = useCallback(
      debounce((e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        const start = Math.floor(scrollTop / 60); // Assuming each item is ~60px
        const end = start + Math.ceil(clientHeight / 60) + 1;
        setVisibleRange({ start, end: Math.min(end, items.length) });
      }, 100),
      []
    );

    return (
      <div 
  className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar"
        onScroll={onScroll}
      >
        {items.slice(visibleRange.start, visibleRange.end).map((item, index) => 
          renderItem(item, visibleRange.start + index)
        )}
      </div>
    );
  };

  // Optimize the render of activity items
  const renderActivityItem = useCallback((activity, index) => (
    <motion.div
      key={activity.id}
      {...fadeIn}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-all duration-300"
    >
      <div className="flex items-start gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          activity.type === 'OBSP' ? 'bg-client-accent/20' : 
          activity.type === 'Payment' ? 'bg-status-success/20' : 'bg-client-primary/20'
        }`}>
          {activity.type === 'OBSP' ? (
            <ProjectOutlined className="text-client-accent" />
          ) : activity.type === 'Payment' ? (
            <DollarOutlined className="text-status-success" />
          ) : (
            <CheckCircleOutlined className="text-client-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm mb-1 line-clamp-2">{activity.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-xs">{activity.timestamp}</span>
            <Tag color={
              activity.type === 'OBSP' ? 'processing' :
              activity.type === 'Payment' ? 'success' :
              'default'
            }>
              {activity.type}
            </Tag>
          </div>
        </div>
      </div>
    </motion.div>
  ), []);

  const financialMetrics = [
    { 
      title: 'In Escrow', 
      value: projectMetrics.financialMetrics.inEscrow,
      color: '#22c55e', // green
      icon: <LockOutlined />
    },
    { 
      title: 'On Projects', 
      value: projectMetrics.financialMetrics.onProjects,
      color: '#6366F1', // indigo
      icon: <ProjectOutlined />
    },
    { 
      title: 'On Packs', 
      value: projectMetrics.financialMetrics.onPacks,
      color: '#F59E42', // orange
      icon: <AppstoreOutlined />
    },
    { 
      title: 'Available', 
      value: projectMetrics.financialMetrics.available,
      color: '#38bdf8', // sky blue
      icon: <WalletOutlined />
    }
  ];

  const donutData = {
    labels: financialMetrics.map(m => m.title),
    datasets: [
      {
        data: financialMetrics.map(m => m.value),
        backgroundColor: financialMetrics.map(m => m.color),
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.15)',
        hoverOffset: 8,
      }
    ]
  };

  const donutOptions = {
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ₹${value.toLocaleString()}`;
          }
        }
      }
    }
  };

  // Add the Projects Section component (modified)
  const ProjectsSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="col-span-12 lg:col-span-6 bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 min-h-[28rem]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-white">
            {projectViewMode === 'combined' ? 'Your Projects' : 'Project Health'}
          </h3>
          <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">
            {projectViewMode === 'combined' ? 'Latest 4' : 'Overview'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setProjectViewMode('combined')}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                projectViewMode === 'combined' ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'
              }`}
            />
            <button
              onClick={() => setProjectViewMode('health')}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                projectViewMode === 'health' ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          </div>
          <Button
            type="text"
            size="small"
            className="text-white/60 hover:text-white"
            icon={<MoreOutlined />}
          />
        </div>
      </div>

      {/* Content with smooth transition: Added min-h and flex-col */}
      <AnimatePresence mode="wait">
        <motion.div
          key={projectViewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="min-h-[410px] flex flex-col" // Ensures a consistent height
        >
          {projectViewMode === 'combined' ? (
            <div className="space-y-3">
              {projectMetrics.milestones.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {projectMetrics.milestones.slice(0, 4).map((project, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
                      className="group relative bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 overflow-hidden"
                    >
                      {/* Project Card Content */}
                      <div className="flex items-center p-3">
                        <div className="flex-shrink-0 mr-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            project.type === 'OBSP' ? 'bg-client-accent/20' : 'bg-client-primary/20'
                          }`}>
                            {project.type === 'OBSP' ? (
                              <ProjectOutlined className="text-client-accent" />
                            ) : (
                              <TeamOutlined className="text-client-primary" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-medium text-sm truncate">{project.name}</h4>
                            <Tag 
                              color={
                                project.status === 'completed' ? 'success' :
                                project.status === 'in_progress' ? 'processing' :
                                'default'
                              }
                              className="text-xs"
                            >
                              {project.status.replace('_', ' ')}
                            </Tag>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress 
                              percent={project.progress} 
                              showInfo={false}
                              size="small"
                              strokeColor={
                                project.status === 'completed' ? 'var(--status-success)' :
                                project.status === 'in_progress' ? 'var(--client-primary)' :
                                'var(--client-accent)'
                              }
                              trailColor="rgba(255, 255, 255, 0.1)"
                              className="w-24"
                            />
                            <span className="text-white/60 text-xs">{project.progress}%</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-3 flex items-center gap-2">
                          <Button 
                            type="text" 
                            size="small"
                            className="text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            icon={<EditOutlined />}
                          />
                          <Button 
                            type="text" 
                            size="small"
                            className="text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            icon={<MoreOutlined />}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center justify-center py-6 px-4 text-center bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 flex-grow" // flex-grow helps fill the min-h
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 backdrop-blur-sm flex items-center justify-center">
                      <ProjectOutlined className="text-white/40 text-xl" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-white font-medium text-sm">No Active Projects</h4>
                      <p className="text-white/60 text-xs">Start a new project to begin</p>
                    </div>
                    <Button 
                      type="primary"
                      size="small"
                      className="bg-client-primary hover:bg-client-primary/90 ml-2"
                    >
                      New Project
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Projects Health */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <ProjectOutlined className="text-client-primary" />
                  <h4 className="text-white font-medium">Projects</h4>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { status: 'In Progress', count: 5, color: 'var(--client-primary)' },
                    { status: 'Completed', count: 3, color: 'var(--status-success)' },
                    { status: 'Pending', count: 2, color: 'var(--status-warning)' }
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">{stat.count}</div>
                      <div className="text-white/60 text-xs">{stat.status}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* OBSPs Health */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <AppstoreOutlined className="text-client-accent" />
                  <h4 className="text-white font-medium">OBSPs</h4>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { status: 'Active', count: 8, color: 'var(--client-accent)' },
                    { status: 'Completed', count: 4, color: 'var(--status-success)' },
                    { status: 'Upcoming', count: 2, color: '#6366F1' }
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">{stat.count}</div>
                      <div className="text-white/60 text-xs">{stat.status}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <div className="text-white/60 text-xs mb-1">Total Projects</div>
                  <div className="text-xl font-bold text-white">10</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <div className="text-white/60 text-xs mb-1">Total OBSPs</div>
                  <div className="text-xl font-bold text-white">14</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );

  // Add the Quick Actions Card component
  const QuickActionsCard = () => (
    <motion.div 
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.9 }}
      className="col-span-12 lg:col-span-4 bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-white">Quick Actions</h3>
          <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">Essential</span>
        </div>
        <Button 
          type="text" 
          size="small"
          className="text-white/60 hover:text-white"
          icon={<MoreOutlined />}
        />
      </div>

      <div className="space-y-3">
        {[
          { 
            title: 'New Project',
            icon: <PlusOutlined />,
            color: 'var(--client-accent)',
            action: () => {/* Handle new project */}
          },
          { 
            title: 'Support',
            icon: <CustomerServiceOutlined />,
            color: 'var(--client-primary)',
            action: () => {/* Handle support */}
          },
          { 
            title: 'Documents',
            icon: <FileTextOutlined />,
            color: '#6366F1',
            action: () => {/* Handle documents */}
          }
        ].map((action, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 + (index * 0.1) }}
            onClick={action.action}
            className="group w-full flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300"
          >
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${action.color}20` }}
            >
              {React.cloneElement(action.icon, { 
                style: { color: action.color }
              })}
            </div>
            <span className="text-white text-sm font-medium">{action.title}</span>
            <RightOutlined className="ml-auto text-white/40 group-hover:text-white/60 transition-colors duration-300" />
          </motion.button>
        ))}

        {/* Support Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="group flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
            <QuestionCircleOutlined className="text-white/60" />
          </div>
          <div className="flex-1">
            <span className="text-white text-sm font-medium">Need Help?</span>
            <p className="text-white/50 text-xs">Contact our support team</p>
          </div>
          <RightOutlined className="text-white/40 group-hover:text-white/60 transition-colors duration-300" />
        </motion.div>
      </div>
    </motion.div>
  );

  // Add the error boundary component
  class DashboardErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError(error) {
      return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
      console.error('Dashboard Error:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="flex items-center justify-center h-full">
            <Alert
              message="Something went wrong"
              description="Please try refreshing the page"
              type="error"
              showIcon
            />
          </div>
        );
      }

      return this.props.children;
    }
  }

  // Update the loading check in the component
  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <DashboardErrorBoundary>
      <div className="flex-1 overflow-auto p-4 md:p-6 bg-client-bg">
        {/* Header Card */}
        <motion.div 
          {...fadeIn}
          className="mb-6 lg:mb-8 relative overflow-hidden"
        >
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
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-client-accent/20 backdrop-blur-sm border border-client-accent/30 rounded-full px-3 py-1.5 lg:px-4 lg:py-2 mb-4 lg:mb-6"
                >
                  <span className="text-client-accent text-xs lg:text-sm font-semibold">Dashboard Overview</span>
                </motion.div>

                <h1 className="text-2xl font-bold text-white mb-2">
                  Client Dashboard
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-white/10 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full border border-white/20">
                    {`${projectMetrics.projectHealth.activeOBSP} Active OBSPs`}
                  </span>
                  <span className="bg-white/10 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full border border-white/20">
                    {`${projectMetrics.projectHealth.traditionalProjects} Projects`}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  icon={<BellOutlined />}
                  className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                >
                  Notifications
                </Button>
                <Button 
                  icon={<SettingOutlined />}
                  className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                >
                  Settings
                </Button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
              {[
                { icon: <ProjectOutlined />, label: "Active OBSPs", value: `${projectMetrics.projectHealth.activeOBSP}` },
                { icon: <DollarCircleOutlined />, label: "In Escrow", value: `₹${projectMetrics.financialMetrics.inEscrow.toLocaleString()}` },
                { icon: <CheckCircleOutlined />, label: "Completed", value: projectMetrics.projectHealth.completedPacks },
                { icon: <TeamOutlined />, label: "Freelancers", value: "Active" }
              ].map((stat, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 + (i * 0.1) }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">{stat.label}</p>
                    <p className="text-white font-semibold">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content section */}
        <div className="grid grid-cols-12 gap-3 lg:gap-4 auto-rows-min">
          {/* Financial Overview Card - 4 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="col-span-12 lg:col-span-4 bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-white">Financial Overview</h3>
                <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">Monthly</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setFinancialView('donut')}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      financialView === 'donut' ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                  <button
                    onClick={() => setFinancialView('standard')}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      financialView === 'standard' ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                </div>
                <Button
                  type="text"
                  size="small"
                  className="text-white/60 hover:text-white"
                  icon={<MoreOutlined />}
                />
              </div>
            </div>

            {/* Content with smooth transition: Added flex-col */}
            <AnimatePresence mode="wait">
              <motion.div
                key={financialView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="h-[220px] flex flex-col" // h-[220px] already set, added flex-col
              >
                {financialView === 'donut' ? (
                  <div className="relative flex flex-col items-center justify-center h-full">
                    <Doughnut data={donutData} options={donutOptions} className="!w-[140px] !h-[140px]" />
                    <div className="flex flex-col gap-1.5 mt-4 w-full">
                      {financialMetrics.map((metric, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full" style={{ background: metric.color }} />
                          <span className="text-white/80 text-xs">{metric.title}</span>
                          <span className="ml-auto text-white font-semibold text-xs">₹{metric.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 h-full justify-between">
                    {financialMetrics.map((metric, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="group flex items-center gap-2 p-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300"
                      >
                        <div 
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${metric.color}20` }}
                        >
                          {metric.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/80 text-sm">{metric.title}</p>
                          <p className="text-white font-semibold">₹{metric.value.toLocaleString()}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Add the Upcoming Events Section here */}
          <UpcomingEventsSection />

          {/* Pack Distribution Card - 4 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="col-span-12 lg:col-span-4 bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white">Pack Distribution</h3>
              <Button 
                type="text" 
                size="small"
                className="text-white/60 hover:text-white"
                icon={<MoreOutlined />}
              />
            </div>

            {/* Pack Distribution Chart */}
            <div className="flex flex-col items-center justify-center h-[220px]">
              <Pie {...packDistributionConfig} />
            </div>

            {/* Pack Distribution Details */}
            <div className="flex flex-col gap-2 mt-4">
              {packDistributionConfig.data.map((pack, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + (index * 0.1) }}
                  className="group flex items-center gap-2 p-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${packDistributionConfig.color[index]}20` }}
                  >
                    <ProjectOutlined />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm">{pack.type}</p>
                    <p className="text-white font-semibold">{pack.value} Packs</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity Card - 4 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="col-span-12 lg:col-span-4 bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white">Recent Activity</h3>
              <Button 
                type="text" 
                size="small"
                className="text-white/60 hover:text-white"
                icon={<MoreOutlined />}
              />
            </div>

            {/* Recent Activity List */}
            <VirtualizedList
              items={projectMetrics.recentActivities}
              renderItem={renderActivityItem}
            />
          </motion.div>

          {/* Add Projects Section */}
          <ProjectsSection />
          
          {/* Add Quick Actions Card */}
          <QuickActionsCard />
        </div>
      </div>
    </DashboardErrorBoundary>
  );
};

export default DashboardOverview;