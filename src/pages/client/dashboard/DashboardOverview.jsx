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
  TeamOutlined, BellOutlined, SettingOutlined, BarChartOutlined, CrownOutlined, LockOutlined, DollarOutlined, MoreOutlined, EditOutlined, ClockCircleOutlined, FileTextOutlined, RocketOutlined, StarOutlined, AppstoreOutlined, WalletOutlined, PlusOutlined, CustomerServiceOutlined, FilePdfOutlined, FileWordOutlined, QuestionCircleOutlined, MessageOutlined, DownloadOutlined, RightOutlined, InfoCircleOutlined, SearchOutlined, ToolOutlined
} from '@ant-design/icons';
import { Pie } from '@ant-design/plots';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useMediaQuery } from 'react-responsive';
import { AiFillProject } from 'react-icons/ai';
import { motion } from 'framer-motion';
import { debounce } from 'lodash';
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

const messagesData = [
  {
    project: 'UI/UX Pack Delivery',
    unread: [
      { id: 1, sender: 'Jane Doe', text: 'Can you review the latest screens?', time: '2h ago' },
      { id: 2, sender: 'John Smith', text: 'Sent the invoice for approval.', time: '4h ago' }
    ]
  },
  {
    project: 'Web Development Pack',
    unread: [
      { id: 3, sender: 'Dev Team', text: 'Milestone 2 is ready for review.', time: '1d ago' }
    ]
  }
];

const notificationsData = [
  { id: 1, type: 'warning', text: 'Milestone overdue: Web Development Pack', time: '3h ago' },
  { id: 2, type: 'info', text: 'New invoice available: UI/UX Pack Delivery', time: '1d ago' }
];

const MessagesNotificationsCard = () => (
  <div className="col-span-12 md:col-span-6 lg:col-span-8 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <MessageOutlined className="text-client-primary text-lg" />
        <h3 className="text-lg font-bold text-white">Messages & Notifications</h3>
      </div>
      <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">
        {messagesData.reduce((acc, p) => acc + p.unread.length, 0)} Unread
      </span>
    </div>
    <div className="flex flex-col gap-4">
      {/* Unread Messages */}
      <div>
        <h4 className="text-white/70 text-sm mb-2">Unread Messages</h4>
        {messagesData.length === 0 ? (
          <div className="text-white/50 text-xs">No unread messages</div>
        ) : (
          messagesData.map((proj) => (
            <div key={proj.project} className="mb-2">
              <div className="text-client-accent font-semibold text-xs mb-1">{proj.project}</div>
              <div className="space-y-1">
                {proj.unread.map(msg => (
                  <div key={msg.id} className="flex items-center gap-2 bg-white/5 rounded p-2">
                    <span className="text-client-primary font-medium text-xs">{msg.sender}:</span>
                    <span className="text-white/90 text-xs flex-1 truncate">{msg.text}</span>
                    <span className="text-white/40 text-xs">{msg.time}</span>
                    <a
                      href={`/chat/${proj.project.replace(/\s+/g, '-').toLowerCase()}`}
                      className="text-client-primary text-xs font-semibold hover:underline ml-2"
                    >
                      Reply
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      {/* System Notifications */}
      <div>
        <h4 className="text-white/70 text-sm mb-2">System Notifications</h4>
        {notificationsData.length === 0 ? (
          <div className="text-white/50 text-xs">No notifications</div>
        ) : (
          <div className="space-y-1">
            {notificationsData.map(note => (
              <div
                key={note.id}
                className={`flex items-center gap-2 p-2 rounded bg-white/5 ${
                  note.type === 'warning' ? 'border-l-4 border-status-warning' : 'border-l-4 border-client-primary'
                }`}
              >
                <span className={`text-xs font-semibold ${
                  note.type === 'warning' ? 'text-status-warning' : 'text-client-primary'
                }`}>
                  {note.type === 'warning' ? <ClockCircleOutlined /> : <InfoCircleOutlined />}
                </span>
                <span className="text-white/90 text-xs flex-1">{note.text}</span>
                <span className="text-white/40 text-xs">{note.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

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
      <div className="col-span-12 lg:col-span-8 md:col-span-8 space-y-3 lg:space-y-4">
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
      <div className="col-span-12 lg:col-span-4 md:col-span-4 space-y-3 lg:space-y-4">
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
const UpcomingEventsSection = () => {
  const [milestoneView, setMilestoneView] = useState('all');

  const filteredMilestones = useMemo(() => {
    if (milestoneView === 'all') {
      return projectMetrics.milestones;
    } else {
      const currentIndex = projectMetrics.milestones.findIndex(m => m.status === 'in_progress');
      if (currentIndex === -1) {
        return projectMetrics.milestones.slice(0, 2);
      }
      return projectMetrics.milestones.slice(currentIndex, currentIndex + 2);
    }
  }, [milestoneView]);

  return (
    <div className="col-span-12 lg:col-span-8 md:col-span-8 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300">
      {/* Minimalist Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CrownOutlined className="text-yellow-400 text-lg" />
          <h3 className="text-lg font-bold text-white">Workflow</h3>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
          <button 
            onClick={() => setMilestoneView('all')}
            className={`px-2 py-0.5 rounded text-xs transition-all duration-300 ${
              milestoneView === 'all' 
                ? 'bg-white/10 text-white' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setMilestoneView('current')}
            className={`px-2 py-0.5 rounded text-xs transition-all duration-300 ${
              milestoneView === 'current' 
                ? 'bg-white/10 text-white' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            Current
          </button>
        </div>
      </div>

      {/* Workflow Container */}
      <div className="relative h-[280px] overflow-hidden">
        {/* Horizontal Timeline Line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-client-accent/40 via-client-primary/30 to-client-accent/40" />
        
        {/* Scrollable Milestones */}
        <div className="relative h-full overflow-x-auto overflow-y-hidden custom-scrollbar">
          <div className="flex items-center h-full min-w-max px-2">
            {filteredMilestones.map((event, index) => (
              <div
                key={index}
                className="relative flex-shrink-0 w-[200px] mx-2"
              >
                {/* Milestone Card */}
                <div className={`
                  bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-lg p-2.5
                  border border-white/10 hover:border-white/20 transition-all duration-300
                  transform hover:scale-105
                  ${index % 2 === 0 ? 'mt-[-80px]' : 'mt-[80px]'}
                `}>
                  {/* Status Indicator */}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className={`
                      w-1.5 h-1.5 rounded-full
                      ${event.status === 'completed' 
                        ? 'bg-status-success' 
                        : event.status === 'in_progress'
                        ? 'bg-client-primary'
                        : 'bg-client-accent'
                      }
                    `} />
                    <span className="text-white/80 text-sm font-medium truncate">{event.name}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/5 rounded-full h-1 mb-1.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        event.status === 'completed' 
                          ? 'bg-status-success' 
                          : event.status === 'in_progress'
                          ? 'bg-client-primary'
                          : 'bg-client-accent'
                      }`}
                      style={{ width: `${event.progress}%` }}
                    />
                  </div>

                  {/* Minimal Info */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">{event.type}</span>
                    <span className="text-white/80">{event.progress}%</span>
                  </div>
                </div>

                {/* Connection Dot - Fixed Positioning */}
                <div 
                  className="absolute left-1/2 -translate-x-1/2 z-10"
                  style={{
                    top: index % 2 === 0 ? 'calc(50% - 40px)' : 'calc(50% + 40px)'
                  }}
                >
                  <div className={`
                    w-2 h-2 rounded-full flex items-center justify-center
                    ${event.status === 'completed' 
                      ? 'bg-status-success' 
                      : event.status === 'in_progress'
                      ? 'bg-client-primary'
                      : 'bg-client-accent'
                    }
                  `}>
                    <div className="w-1 h-1 rounded-full bg-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicators */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-client-secondary/40 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-client-secondary/40 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [viewMode, setViewMode] = useState('chart');
  const [projectViewMode, setProjectViewMode] = useState('combined');
  const [financialView, setFinancialView] = useState('donut');
  const [packView, setPackView] = useState('bar');

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
    <div
      key={activity.id}
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
    </div>
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
        <div 
          className="col-span-12 lg:col-span-8 md:col-span-8 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 min-h-[28rem]"
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

      {/* Content now switches instantly */}
      <div
        key={projectViewMode}
        className="h-full !max-h-[20rem] flex flex-col"
      >
        {projectViewMode === 'combined' ? (
            <div className="space-y-3">
              {projectMetrics.milestones.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {projectMetrics.milestones.slice(0, 4).map((project, index) => (
                    <div
                      key={index}
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
                    </div>
                  ))}
                </div>
              ) : (
              <div // Changed from motion.div to div
                className="flex items-center justify-center py-6 px-4 text-center bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 flex-grow"
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
            </div>
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
            </div>
              </div>
  );

  // Add the Quick Actions Card component
  const QuickActionsCard = () => (
    <div 
      className="col-span-12 lg:col-span-4 md:col-span-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-white">Quick Actions</h3>
          <span className="px-2 py-1 bg-gradient-to-r from-client-accent/20 to-client-primary/20 rounded-full text-xs text-white/80 border border-white/10">
            Essential
          </span>
        </div>
        <Button 
          type="text" 
          size="small"
          className="text-white/60 hover:text-white"
          icon={<MoreOutlined />}
        />
      </div>

      {/* Main Action Button */}
      <div className="relative mb-4 group">
        <div className="absolute inset-0 bg-gradient-to-r from-client-accent/20 to-client-primary/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
        <button className="relative w-full flex items-center justify-center gap-3 p-2 bg-gradient-to-r from-client-accent/10 to-client-primary/10 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <PlusOutlined className="text-white text-xl" />
          </div>
          <div className="text-left">
            <h4 className="text-white font-semibold">Start New Project</h4>
            <p className="text-white/60 text-xs">Create OBSP or Traditional Project</p>
          </div>
          <RightOutlined className="ml-auto text-white/40 group-hover:text-white/60 transition-colors duration-300" />
        </button>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { 
            title: 'Support',
            icon: <CustomerServiceOutlined />,
            color: 'var(--client-primary)',
            gradient: 'from-client-primary/20 to-client-primary/10'
          },
          { 
            title: 'Documents',
            icon: <FileTextOutlined />,
            color: '#6366F1',
            gradient: 'from-indigo-500/20 to-indigo-500/10'
          },
          { 
            title: 'Analytics',
            icon: <BarChartOutlined />,
            color: 'var(--status-success)',
            gradient: 'from-green-500/20 to-green-500/10'
          },
          { 
            title: 'Settings',
            icon: <SettingOutlined />,
            color: 'var(--client-accent)',
            gradient: 'from-client-accent/20 to-client-accent/10'
          }
        ].map((action, index) => (
          <div
            key={index}
            className="group relative"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} rounded-lg blur-md group-hover:blur-lg transition-all duration-300`} />
            <button className="relative w-full flex flex-col items-center justify-center gap-2 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300">
              <div 
                className="w-4 h-4 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${action.color}20` }}
              >
                {React.cloneElement(action.icon, { 
                  style: { color: action.color }
                })}
              </div>
              <span className="text-white text-xs font-medium">{action.title}</span>
            </button>
          </div>
        ))}
      </div>

    </div>
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

  // Define colors
  const packColors = {
    basic: '#1C2E4A', // Navy blue
    mid: '#FF9800',   // Orange
    custom: 'linear-gradient(90deg, #C0C0C0 0%, #F8F8FF 100%)', // Silver gradient for shiny effect
    customSolid: '#C0C0C0', // fallback for chart.js
  };

  // Update the packBarData and packBarOptions
  const packBarData = {
    labels: ['Basic', 'Mid', 'High'],
    datasets: [
      {
        data: [
          projectMetrics.packCategories.basic,
          projectMetrics.packCategories.mid,
          projectMetrics.packCategories.custom
        ],
        backgroundColor: [
          'rgba(13, 71, 161, 0.8)',
          'rgba(255, 152, 0, 0.8)',
          'rgba(192, 192, 192, 0.8)'
        ],
        borderColor: [
          'rgba(13, 71, 161, 1)',
          'rgba(255, 152, 0, 1)',
          'rgba(192, 192, 192, 1)'
        ],
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 70,
        maxBarThickness: 70,
        
      }
    ]
  };

  const packBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 35, // Space for legend
        right: 15,
        bottom: 0, // Removed bottom padding to start from bottom
        left: 5
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const packType = context.label;
            const price = packType === 'Basic' ? '< ₹10K' : 
                         packType === 'Mid' ? '< ₹20K' : 'Custom';
            return `${value} Packs ${price}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 12,
            weight: '500'
          },
          padding: 8
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 11
          },
          padding: 6,
          stepSize: 1
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  return (
    <DashboardErrorBoundary>
      <div className="flex-1 overflow-auto p-4 md:p-6 bg-client-bg">
        {/* Header Card */}
        <div 
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
                <div 
                  className="inline-flex items-center gap-2 bg-client-accent/20 backdrop-blur-sm border border-client-accent/30 rounded-full px-3 py-1.5 lg:px-4 lg:py-2 mb-4 lg:mb-6"
                >
                  <span className="text-client-accent text-xs lg:text-sm font-semibold">Dashboard Overview</span>
                </div>

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

        {/* Main Content section */}
        <div className="grid grid-cols-12 gap-3 lg:gap-4 auto-rows-min">
          {/* Financial Overview Card - 4 columns */}
          <div 
            className="col-span-12 lg:col-span-4 md:col-span-6 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300"
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

            {/* Content now switches instantly */}
            <div
              key={financialView}
              className="h-full max-h-[20rem] flex flex-col"
            >
              {financialView === 'donut' ? (
                <div className="relative flex flex-col items-center justify-center h-full">
                  <Doughnut data={donutData} options={donutOptions} className="!w-[140px] !h-[140px]" />
                  <div className="flex flex-col gap-1.5 mt-4 w-full">
                    {financialMetrics.map((metric, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2"
                      >
                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: metric.color }} />
                        <span className="text-white/80 text-xs">{metric.title}</span>
                        <span className="ml-auto text-white font-semibold text-xs">₹{metric.value.toLocaleString()}</span>
                        </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 h-full overflow-y-auto">
                  {/* Total Spend This Month */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-sm">Total Spend This Month</span>
                      <DollarCircleOutlined className="text-status-success" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">₹85,000</span>
                      <span className="text-status-success text-sm">+12% from last month</span>
                      </div>
                    </div>

                  {/* Budget Remaining */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-sm">Budget Remaining</span>
                      <WalletOutlined className="text-client-primary" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">₹2,15,000</span>
                      <span className="text-white/60 text-sm">of ₹3,00,000</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                      <div className="bg-client-primary h-full rounded-full" style={{ width: '71.6%' }} />
                    </div>
              </div>

                  {/* Pending Payments */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-sm">Pending Payments</span>
                      <ClockCircleOutlined className="text-status-warning" />
            </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">₹45,000</span>
                      <span className="text-status-warning text-sm">3 payments pending</span>
                    </div>
                  </div>

                  {/* Upcoming Invoices/Due Milestones */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-sm">Due This Week</span>
                      <FileTextOutlined className="text-client-accent" />
                          </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">UI/UX Pack Delivery</span>
                        <span className="text-white font-medium">₹25,000</span>
                    </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">Web Development Milestone</span>
                        <span className="text-white font-medium">₹35,000</span>
                  </div>
                    </div>
                  </div>
            </div>
          )}
            </div>
          </div>
          <MessagesNotificationsCard />

          {/* Upcoming Events Section */}
          <UpcomingEventsSection />

          {/* Pack Distribution Card - 4 columns */}
          <div 
            className="col-span-12 lg:col-span-4 md:col-span-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white">Pack Distribution</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPackView('bar')}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    packView === 'bar' ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label="Bar Chart"
                />
                <button
                  onClick={() => setPackView('boxes')}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    packView === 'boxes' ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label="Box View"
                />
            <Button 
              type="text" 
              size="small"
              className="text-white/60 hover:text-white"
              icon={<MoreOutlined />}
            />
              </div>
            </div>

            {/* Content now switches instantly */}
            <div key={packView} className="h-[20rem]">
              {packView === 'bar' ? (
                <div className="relative h-full">
                  <div className="absolute top-0 right-0 flex items-center gap-3 text-xs text-white/60">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0D47A1]" />
                      <span>Basic</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF9800]" />
                      <span>Mid</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#C0C0C0]" />
                      <span>High</span>
                    </div>
                  </div>
                  <div className="h-full pt-8"> {/* Added padding-top to account for legend */}
                    <Bar 
                      data={packBarData} 
                      options={{
                        ...packBarOptions,
                        maintainAspectRatio: false,
                        responsive: true,
                        layout: {
                          padding: {
                            top: 0,
                            right: 15,
                            bottom: 0,
                            left: 5
                          }
                        }
                      }} 
                      className="!w-full !h-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Basic Pack */}
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: packColors.basic }}
                    >
                      <ProjectOutlined style={{ color: '#fff' }} />
      </div>
                <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-sm font-bold">Basic Packs</p>
                      <p className="text-white font-semibold">{projectMetrics.packCategories.basic} Packs &lt; ₹10K</p>
                    </div>
                  </div>
                  {/* Mid Pack */}
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10" style={{ backgroundColor: '#FFF3E0' }}>
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: packColors.mid }}
                    >
                      <ProjectOutlined style={{ color: '#fff' }} />
                  </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#FF9800] text-sm font-bold">Mid Packs</p>
                      <p className="text-[#FF9800] font-semibold">{projectMetrics.packCategories.mid} Packs &lt; ₹20K</p>
                </div>
          </div>
                  {/* High Pack */}
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10" style={{
                    background: 'linear-gradient(90deg, #C0C0C0 0%, #F8F8FF 100%)'
                  }}>
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #C0C0C0 60%, #F8F8FF 100%)' }}
                    >
                      <ProjectOutlined style={{ color: '#222' }} />
            </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#888] text-sm font-bold">High Packs</p>
                      <p className="text-[#222] font-semibold">{projectMetrics.packCategories.custom} Custom Projects</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Card - 4 columns */}
          <div 
            className="col-span-12 lg:col-span-4 md:col-span-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300"
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
          </div>

          {/* Add Projects Section */}
          <ProjectsSection />
          

          {/* Quick Action Cards Row */}
          <div className="col-span-12 grid grid-cols-12 gap-3 lg:gap-4 mt-3 lg:mt-4">
            
                      {/* Add Quick Actions Card */}
          <QuickActionsCard />

            {/* OBSP Management Card */}
            <div className="col-span-12 md:col-span-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <AppstoreOutlined className="text-client-accent text-lg" />
                <h3 className="text-lg font-bold text-white">OBSP Management</h3>
              </div>
          <div className="space-y-3">
            {[
                  { title: 'Browse Packs', icon: <SearchOutlined />, color: 'var(--client-accent)' },
                  { title: 'My OBSPs', icon: <AppstoreOutlined />, color: 'var(--client-primary)' },
                  { title: 'Pack Analytics', icon: <BarChartOutlined />, color: '#6366F1' }
            ].map((action, index) => (
                  <div
                key={index}
                    className="group flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${action.color}20` }}
                >
                      {React.cloneElement(action.icon, { style: { color: action.color } })}
                </div>
                <span className="text-white text-sm font-medium">{action.title}</span>
                <RightOutlined className="ml-auto text-white/40 group-hover:text-white/60 transition-colors duration-300" />
                  </div>
                ))}
              </div>
            </div>

            {/* Support & Resources Card */}
            <div className="col-span-12 md:col-span-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <CustomerServiceOutlined className="text-client-primary text-lg" />
                <h3 className="text-lg font-bold text-white">Support & Resources</h3>
              </div>
              <div className="space-y-3">
                {[
                  { title: 'Help Center', icon: <QuestionCircleOutlined />, color: 'var(--client-primary)' },
                  { title: 'Documentation', icon: <FileTextOutlined />, color: '#6366F1' },
                  { title: 'Contact Support', icon: <MessageOutlined />, color: 'var(--status-success)' }
                ].map((action, index) => (
                  <div
                    key={index}
              className="group flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
            >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${action.color}20` }}
                    >
                      {React.cloneElement(action.icon, { style: { color: action.color } })}
              </div>
                    <span className="text-white text-sm font-medium">{action.title}</span>
                    <RightOutlined className="ml-auto text-white/40 group-hover:text-white/60 transition-colors duration-300" />
              </div>
                ))}
          </div>
      </div>
      
    </div>
        </div>
      </div>
    </DashboardErrorBoundary>
  );
};

export default DashboardOverview;