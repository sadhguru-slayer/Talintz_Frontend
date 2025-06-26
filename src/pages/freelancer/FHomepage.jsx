import { useState, useEffect, useMemo } from "react";
import FHeader from "../../components/freelancer/FHeader";
import FSider from "../../components/freelancer/FSider";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { useMediaQuery } from "react-responsive";
import axios from 'axios';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';
import {
  Card, Button, Row, Col, Avatar,
  Skeleton, Tag, Select, Progress
} from 'antd';
import {
  ProjectOutlined,
  RocketOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  UserAddOutlined,
  FileTextOutlined,
  TeamOutlined,
  ArrowRightOutlined,
  TrophyOutlined,
  StarOutlined,
  CalendarOutlined,
  BellOutlined
} from '@ant-design/icons';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js';

import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import ReferralTab from "../../components/ReferralTab";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);


// Simplified IconBox component using Tailwind config values
const IconBox = React.memo(({ icon, size = 'md', variant = 'default', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const variantClasses = {
    default: 'bg-freelancer-bg-card text-freelancer-text-primary border border-white/10',
    success: 'bg-status-success/10 text-status-success border border-status-success/20',
    warning: 'bg-status-warning/10 text-status-warning border border-status-warning/20',
    accent: 'bg-freelancer-accent/10 text-freelancer-accent border border-freelancer-accent/20',
    primary: 'bg-freelancer-primary/10 text-freelancer-primary border border-freelancer-primary/20',
    ghost: 'bg-freelancer-secondary/20 text-freelancer-secondary border border-freelancer-secondary/30'
  };

  return (
    <div className={`
      ${sizeClasses[size]}
      ${variantClasses[variant]}
      rounded-md flex items-center justify-center
      ${className}
    `}>
      {icon}
    </div>
  );
});

IconBox.displayName = 'IconBox';
IconBox.propTypes = {
  icon: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'accent', 'ghost', 'primary']),
  className: PropTypes.string
};

// Simplified CardTitle component
const CardTitle = React.memo(({ icon, title, subtitle, action }) => (
  <div className="flex items-center justify-between w-full">
    <div className="flex items-center gap-3">
      <IconBox icon={icon} size="md" variant="primary" />
      <div>
        <h3 className="font-semibold text-freelancer-text-primary text-base">{title}</h3>
        {subtitle && (
          <p className="text-freelancer-text-secondary text-sm mt-1">{subtitle}</p>
        )}
      </div>
    </div>
    {action}
  </div>
));

CardTitle.displayName = 'CardTitle';
CardTitle.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  action: PropTypes.node
};

// Simplified ProjectCard component
const ProjectCard = React.memo(({ project }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-freelancer-bg-card rounded-xl border border-white/10 p-6 h-full flex flex-col shadow-lg transition-all duration-300 hover:shadow-xl"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h4 className="font-semibold text-freelancer-text-primary mb-2 line-clamp-2 text-lg">
          {project.title}
        </h4>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-freelancer-secondary/20 text-freelancer-secondary border border-freelancer-secondary/30">
            <ClockCircleOutlined className="text-xs" />
            {project.daysLeft}d left
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1">
          <StarOutlined className="text-sm text-freelancer-accent" />
          <span className="text-sm font-semibold text-freelancer-accent">{project.matchScore}%</span>
        </div>
        <span className="text-xs text-freelancer-text-secondary">match</span>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="p-3 bg-freelancer-tertiary/20 rounded-lg border border-white/10">
        <div className="flex items-center gap-2">
          <DollarOutlined className="text-freelancer-orange text-lg" />
          <span className="font-semibold text-freelancer-text-primary text-base">{project.budget}</span>
        </div>
      </div>
      <div className="p-3 bg-freelancer-tertiary/20 rounded-lg border border-white/10">
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-freelancer-purple text-lg" />
          <span className="font-semibold text-freelancer-text-primary text-base">{project.duration}</span>
        </div>
      </div>
    </div>

    <p className="text-freelancer-text-secondary text-sm leading-relaxed mb-4 line-clamp-3">
      {project.description}
    </p>

    <div className="flex flex-wrap gap-2 mb-6 mt-auto">
      {project.skills.slice(0, 3).map((skill, i) => (
        <span
          key={i}
          className="px-3 py-1 text-xs font-medium rounded-full bg-freelancer-border-DEFAULT/50 text-freelancer-text-secondary border border-white/10"
        >
          {skill}
        </span>
      ))}
      {project.skills.length > 3 && (
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-freelancer-border-DEFAULT/50 text-freelancer-text-muted border border-white/10">
          +{project.skills.length - 3}
        </span>
      )}
    </div>

    <Button
      block
      type="primary"
      size="large"
      className="rounded-full border-0 h-12 bg-freelancer-accent text-white font-bold text-base shadow-lg hover:bg-freelancer-accent/90 transition-all duration-300"
    >
      Apply Now
      <ArrowRightOutlined className="ml-2 text-sm" />
    </Button>
  </motion.div>
));

ProjectCard.displayName = 'ProjectCard';
ProjectCard.propTypes = {
  project: PropTypes.shape({
    title: PropTypes.string.isRequired,
    budget: PropTypes.string.isRequired,
    duration: PropTypes.string.isRequired,
    daysLeft: PropTypes.number.isRequired,
    matchScore: PropTypes.number.isRequired,
    skills: PropTypes.arrayOf(PropTypes.string).isRequired,
    description: PropTypes.string.isRequired
  }).isRequired
};

const FHomepage = ({ userId, role, isAuthenticated, isEditable }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [freelancerData] = useState({
    activeProjects: 5,
    completedProjects: 20,
    successRate: 95,
    earnings: 50000,
    inProgressProjects: 30,
    pendingProposals: 8,
    recentActivity: [],
    skillRatings: {
      'React.js': 98,
      'Node.js': 92,
      'UI/UX Design': 88,
      'MongoDB': 85
    },
    clientFeedback: 4.9,
    totalHours: 1250,
    projectCompletionRate: 97
  });

  const chartGradientRef = React.useRef(null); // Create a ref to store the gradient

  const getChartGradient = React.useCallback((ctx) => {
    if (!ctx) return 'var(--freelancer-secondary)';
    // If gradient already exists for this context, return it
    if (chartGradientRef.current && chartGradientRef.current.chartCtx === ctx) {
      return chartGradientRef.current.gradient;
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    const freelancerSecondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--freelancer-secondary').trim();
    gradient.addColorStop(0, freelancerSecondaryColor);
    const hexToRgba = (hex, alpha) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    gradient.addColorStop(1, hexToRgba(freelancerSecondaryColor, 0.2));

    // Store the gradient and its context in the ref
    chartGradientRef.current = { gradient, chartCtx: ctx };
    return gradient;
  }, []); // Dependencies are empty because the gradient color is static.

  const earningsTrend = useMemo(() => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Monthly Earnings (₹)',
      data: [30000, 45000, 35000, 50000, 42000, 60000],
      backgroundColor: function(context) {
        const chart = context?.chart;
        const ctx = chart?.ctx;
        return ctx ? getChartGradient(ctx) : 'var(--freelancer-secondary)';
      },
      borderColor: 'var(--freelancer-secondary)',
      borderWidth: 2,
      borderRadius: 4,
      barThickness: 20,
    }]
  }), [getChartGradient]);

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [currentDeadlinePage, setCurrentDeadlinePage] = useState(1);
  const [currentProjectPage, setCurrentProjectPage] = useState(1);

  useEffect(() => {
    const fetchUser = async () => {
      setUserLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/profile/', {
          headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` },
        });
        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setUserLoading(false);
      }
    };

    const fetchDashboardData = async () => {
      try {
        // Simulate data loading
        setTimeout(() => setLoading(false), 400);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchUser();
    fetchDashboardData();
  }, []);

  const handleProfileMenu = (profileComponent) => {
    if (location.pathname !== "/freelancer/profile") {
      navigate("/freelancer/profile", { state: { profileComponent } });
    }
  };

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'var(--freelancer-bg-card)',
        titleColor: 'var(--freelancer-text-primary)',
        bodyColor: 'var(--freelancer-text-secondary)',
        borderColor: 'var(--freelancer-border-DEFAULT)',
        borderWidth: 1,
        padding: 16,
        cornerRadius: 4,
        displayColors: false,
        titleFont: { size: 14, weight: '600' },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        border: { display: false },
        ticks: {
          padding: 12,
          color: 'var(--freelancer-text-secondary)',
          font: { size: 12 },
          callback: (value) => '₹' + (value/1000).toFixed(0) + 'K'
        }
      },
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          padding: 12,
          color: 'var(--freelancer-text-secondary)',
          font: { size: 12 }
        }
      }
    },
    animation: {
      duration: 600,
      easing: 'easeOutQuart'
    }
  }), []);

  // Consistent card styles using Tailwind config values
  const cardStyles = {
    borderRadius: '1rem', // rounded-xl
    boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)', // similar to cred-btn-shadow
    background: 'var(--freelancer-bg-card)', // Solid background color
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)' // Updated border style
  };

  const headerStyles = {
    padding: '1.5rem', // p-6
    borderBottom: 'none',
    background: 'transparent'
  };

  const bodyStyles = {
    padding: '1.5rem', // p-6
    backgroundColor: 'transparent'
  };

  // Simplified RecommendedProjects component
  const recommendedProjects = useMemo(() => [
    {
      title: "React Dashboard with Real-time Analytics",
      budget: "₹50-70K",
      duration: "2-3 weeks",
      daysLeft: 14,
      matchScore: 95,
      skills: ["React", "Redux", "TypeScript", "D3.js"],
      description: "Looking for an experienced React developer to build a modern analytics dashboard with real-time data visualization and responsive design."
    },
    {
      title: "E-commerce Platform with Next.js",
      budget: "₹70-90K",
      duration: "1-2 months",
      daysLeft: 30,
      matchScore: 88,
      skills: ["Next.js", "Node.js", "MongoDB", "Stripe"],
      description: "Need a full-stack developer to create a scalable e-commerce platform with modern features and payment integration."
    },
    {
      title: "Mobile App UI/UX Design",
      budget: "₹35-45K",
      duration: "2 weeks",
      daysLeft: 10,
      matchScore: 92,
      skills: ["Figma", "UI/UX", "Prototyping"],
      description: "Seeking a creative UI/UX designer for our mobile app redesign project focusing on user experience and modern design trends."
    },
    {
      title: "WordPress E-learning Platform",
      budget: "₹40-60K",
      duration: "3-4 weeks",
      daysLeft: 7,
      matchScore: 85,
      skills: ["WordPress", "PHP", "LMS"],
      description: "Development of a custom WordPress-based e-learning platform with course management and progress tracking features."
    }
  ], []);

  const RecommendedProjects = React.memo(() => (
    <Card
      title={
        <CardTitle
          icon={<RocketOutlined />}
          title="Recommended Projects"
          subtitle="Curated based on your skills and preferences"
          action={
            <Select
              defaultValue="best-match"
              size="small"
              className="w-32 rounded-full ant-select-dark-mode"
              options={[
                { value: 'best-match', label: 'Best Match' },
                { value: 'newest', label: 'Newest' },
                { value: 'budget-high', label: 'High Budget' },
                { value: 'deadline-soon', label: 'Ending Soon' },
              ]}
              dropdownStyle={{ background: 'var(--freelancer-bg-card)', border: '1px solid var(--freelancer-border-DEFAULT)' }}
              optionLabelProp="label"
              optionRender={(option) => <span className="text-freelancer-text-primary">{option.label}</span>}
            />
          }
        />
      }
      extra={
        <Button
          type="link"
          onClick={() => navigate('/freelancer/browse-projects')}
          className="text-freelancer-accent font-medium px-0 h-auto hover:text-freelancer-accent/80 transition-all duration-300"
        >
          View All <ArrowRightOutlined className="ml-1 text-xs" />
        </Button>
      }
      style={cardStyles}
      headStyle={headerStyles}
      bodyStyle={bodyStyles}
    >
      <Row gutter={[24, 24]}>
        {recommendedProjects.map((project, index) => (
          <Col xs={24} sm={12} lg={6} key={project.title}>
            <ProjectCard project={project} />
          </Col>
        ))}
      </Row>
    </Card>
  ));

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
        <div className={`flex-1 overflow-auto `}>
          <div className="relative z-10 p-6 max-w-7xl mx-auto">

          <ReferralTab
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
              {/* Hero Section - Keep its custom background */}
          <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="col-span-12 relative overflow-hidden rounded-2xl mb-6"
              >
                <div className="relative z-10 p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
            <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="inline-flex items-center gap-2 bg-freelancer-accent/20 backdrop-blur-sm border border-freelancer-accent/30 rounded-full px-4 py-2 mb-4"
                      >
                        <TrophyOutlined className="text-freelancer-accent" />
                        <span className="text-freelancer-accent font-semibold">Welcome to Talintz Freelancer</span>
                      </motion.div>

                      <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-4xl lg:text-5xl font-bold text-white mb-4"
                      >
                        Your Gateway to <br />
                        <span className="bg-gradient-to-r from-white to-freelancer-accent bg-clip-text text-transparent">
                          Impactful Projects
                        </span>
                      </motion.h1>

                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="text-white/80 text-lg mb-6 max-w-2xl"
                      >
                        Find exciting opportunities and grow your career.
                      </motion.p>
                </div>

                    <div className="flex flex-col md:flex-row gap-3">
                  <Button
                    onClick={() => navigate('/freelancer/profile')}
                        className="h-12 px-6 bg-freelancer-tertiary/20 border border-white/10 text-freelancer-text-primary font-medium rounded-full hover:bg-freelancer-tertiary/30 transition-all duration-300 flex items-center justify-center"
                        icon={<UserAddOutlined className="text-xl" />}
                  >
                    Profile
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => navigate('/freelancer/browse-projects')}
                        className="h-12 px-6 bg-freelancer-accent border-0 text-white font-bold rounded-full shadow-lg hover:bg-freelancer-accent/90 transition-all duration-300 flex items-center justify-center"
                        icon={<FileTextOutlined className="text-xl" />}
                  >
                    Find Work
                  </Button>
                </div>
              </div>
                </div>
              </motion.div>

              {/* Stats Grid - Remove gradient */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {[
                  { icon: <ProjectOutlined />, label: 'Active Projects', value: freelancerData.activeProjects, change: '+2', variant: 'primary' },
                  { icon: <TrophyOutlined />, label: 'Success Rate', value: `${freelancerData.projectCompletionRate}%`, change: '+3%', variant: 'success' },
                  { icon: <DollarOutlined />, label: 'Total Earnings', value: `₹${(freelancerData.earnings/1000).toFixed(0)}K`, change: '+12%', variant: 'accent' },
                  { icon: <StarOutlined />, label: 'Client Score', value: `${freelancerData.successRate}%`, change: 'Top 5%', variant: 'ghost' }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 + (i * 0.1) }}
                    className="p-4 rounded-xl bg-freelancer-bg-card backdrop-blur-xl border border-white/10 flex items-center gap-3 shadow-md" // Updated background
                  >
                      <IconBox
                        icon={stat.icon}
                        size="md"
                      variant={stat.variant}
                      className="bg-freelancer-accent/20 text-freelancer-accent border-freelancer-accent/30"
                      />
                      <div>
                      <p className="text-white/70 text-sm font-medium">{stat.label}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-white text-xl font-bold">{stat.value}</p>
                        <span className="text-status-success text-xs bg-status-success/20 px-2 py-0.5 rounded-full">
                            {stat.change}
                          </span>
                        </div>
                      </div>
                  </motion.div>
                ))}
            </motion.div>

              {/* Recommended Projects */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="col-span-12"
              >
              <RecommendedProjects />
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 col-span-12">
                {/* Earnings Analytics - Remove gradient */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="lg:col-span-2 bg-freelancer-bg-card backdrop-blur-xl rounded-2xl p-6 border border-white/10"> {/* Updated background */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <DollarOutlined className="text-freelancer-accent text-xl" />
                      <h2 className="text-xl font-bold text-white">Earnings Overview</h2>
                    </div>
                      <Select
                        defaultValue="6months"
                        size="small"
                      className="w-28 rounded-full ant-select-dark-mode"
                        options={[
                          { value: '1month', label: '1M' },
                          { value: '3months', label: '3M' },
                          { value: '6months', label: '6M' },
                          { value: '1year', label: '1Y' },
                        ]}
                      dropdownStyle={{ background: 'var(--freelancer-bg-card)', border: '1px solid var(--freelancer-border-DEFAULT)' }}
                      optionLabelProp="label"
                      optionRender={(option) => <span className="text-freelancer-text-primary">{option.label}</span>}
                    />
                  </div>
                    <AnimatePresence>
                      {loading ? (
                        <motion.div
                        className="h-[300px] flex items-center justify-center" // Adjusted height to 300px
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className="space-y-3 w-full">
                          <div className="animate-pulse h-6 w-1/3 bg-freelancer-border-DEFAULT/50 rounded-md" />
                          <div className="animate-pulse h-48 w-full bg-freelancer-border-DEFAULT/50 rounded-md" />
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        className="h-[300px]" // Adjusted height to 300px
                        >
                          <Bar data={earningsTrend} options={chartOptions} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                </motion.div>

                {/* Deadlines - Remove gradient */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="bg-freelancer-bg-card backdrop-blur-xl rounded-2xl p-6 border border-white/10"> {/* Updated background */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <BellOutlined className="text-freelancer-accent text-xl" />
                      <h2 className="text-xl font-bold text-white">Upcoming Deadlines</h2>
                    </div>
                  </div>
                  <div className="space-y-4 h-full overflow-y-auto custom-scrollbar">
                      {[
                        { project: 'E-commerce Website', deadline: 'Apr 26', progress: 75, status: 'On Track', daysLeft: 3 },
                        { project: 'Mobile App UI', deadline: 'Apr 24', progress: 45, status: 'At Risk', daysLeft: 1 },
                        { project: 'React Dashboard', deadline: 'Apr 30', progress: 60, status: 'On Track', daysLeft: 7 },
                        { project: 'Logo Design', deadline: 'May 2', progress: 30, status: 'Starting', daysLeft: 9 }
                    ].slice((currentDeadlinePage - 1) * 3, currentDeadlinePage * 3).map((item, index) => (
                      <motion.div
                          key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                        className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-sm transition-all duration-300 hover:bg-white/10"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                            <h4 className="font-semibold text-white text-sm">{item.project}</h4>
                            <p className="text-white/60 text-xs mt-1">Due: {item.deadline}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Tag
                                color={
                                  item.status === 'On Track' ? 'success' :
                                  item.status === 'At Risk' ? 'error' :
                                  item.status === 'Starting' ? 'processing' : 'warning'
                                }
                              className="text-xs font-medium rounded-full px-2 py-0.5"
                              >
                                {item.status}
                              </Tag>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                item.daysLeft <= 1 ? 'text-status-error bg-status-error/10' :
                                item.daysLeft <= 3 ? 'text-status-warning bg-status-warning/10' :
                                'text-status-success bg-status-success/10'
                              }`}>
                                {item.daysLeft}d left
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                            <span className="text-white/70">Progress</span>
                            <span className="font-semibold text-white">{item.progress}%</span>
                            </div>
                            <Progress
                              percent={item.progress}
                              size="small"
                            strokeColor="var(--freelancer-secondary)"
                            trailColor="rgba(255, 255, 255, 0.1)"
                              showInfo={false}
                              className="mb-0"
                            />
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
                            ? 'bg-freelancer-accent scale-125'
                            : 'bg-white/30 hover:bg-white/50'
                        }`}
                        onClick={() => setCurrentDeadlinePage(1)}
                      />
                      <div
                        className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${
                          currentDeadlinePage === 2
                            ? 'bg-freelancer-accent scale-125'
                            : 'bg-white/30 hover:bg-white/50'
                        }`}
                        onClick={() => setCurrentDeadlinePage(2)}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 col-span-12">
                {/* Active Projects - Remove gradient */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="bg-freelancer-bg-card backdrop-blur-xl rounded-2xl p-6 border border-white/10"> {/* Updated background */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <ProjectOutlined className="text-freelancer-accent text-xl" />
                      <h2 className="text-xl font-bold text-white">Active Projects</h2>
                    </div>
                      <Button
                      type="text"
                        onClick={() => navigate('/freelancer/projects')}
                      className="text-white/60 hover:text-white flex items-center gap-1"
                      icon={<ArrowRightOutlined />}
                      >
                      View All
                      </Button>
                  </div>
                  <div className="relative">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-freelancer-accent/40 via-freelancer-primary/30 to-transparent"></div>
                    <div className="space-y-4">
                      {[
                        { title: 'React Dashboard', client: 'TechCorp Solutions', progress: 75, priority: 'High', status: 'In Progress' },
                        { title: 'E-commerce Website', client: 'Fashion Boutique', progress: 90, priority: 'Medium', status: 'Review' },
                        { title: 'Mobile App Design', client: 'StartUp Inc.', progress: 30, priority: 'Low', status: 'Planning' }
                      ].slice((currentProjectPage - 1) * 3, currentProjectPage * 3).map((project, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
                          className="relative pl-12"
                        >
                          {/* Timeline Dot */}
                          <div className="absolute left-0 w-3 h-3 rounded-full bg-freelancer-accent border-2 border-white top-1/2 transform -translate-y-1/2"></div>
                          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all duration-300">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-lg bg-freelancer-accent/20 flex items-center justify-center flex-shrink-0">
                                <ProjectOutlined className="text-freelancer-accent text-lg" />
                            </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-white text-base mb-1">{project.title}</h4>
                                <p className="text-white/60 text-sm mb-2">{project.client}</p>
                                <div className="flex items-center gap-2">
                            <Tag
                              color={
                                project.priority === 'High' ? 'error' :
                                project.priority === 'Medium' ? 'warning' : 'success'
                              }
                                    className="text-xs"
                            >
                              {project.priority}
                            </Tag>
                                  <span className="text-white/60 text-xs">{project.status}</span>
                          </div>
                            </div>
                            </div>
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
                              ? 'bg-freelancer-accent scale-125'
                              : 'bg-white/30 hover:bg-white/50'
                          }`}
                          onClick={() => setCurrentProjectPage(1)}
                        />
                        <div
                          className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${
                            currentProjectPage === 2
                              ? 'bg-freelancer-accent scale-125'
                              : 'bg-white/30 hover:bg-white/50'
                          }`}
                          onClick={() => setCurrentProjectPage(2)}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Recent Activities - Remove gradient */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }} className="bg-freelancer-bg-card backdrop-blur-xl rounded-2xl p-6 border border-white/10"> {/* Updated background */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <MessageOutlined className="text-freelancer-accent text-xl" />
                      <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                    </div>
                    <Button
                      type="text"
                      className="text-white/60 hover:text-white flex items-center gap-1"
                      icon={<ArrowRightOutlined />}
                    >
                      View All
                    </Button>
                  </div>
                  <div className="relative">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-freelancer-accent/40 via-freelancer-primary/30 to-transparent"></div>
                    <div className="space-y-4">
                      {[
                        { icon: <CheckCircleOutlined />, title: 'Milestone Completed', desc: 'Authentication module finished successfully', time: '3h ago', type: 'success' },
                        { icon: <MessageOutlined />, title: 'New Client Message', desc: 'Client sent project feedback and approval', time: '5h ago', type: 'info' },
                        { icon: <DollarOutlined />, title: 'Payment Received', desc: '₹15,000 payment for logo design project', time: '8h ago', type: 'success' }
                      ].map((activity, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
                          className="relative pl-12"
                        >
                          {/* Timeline Dot */}
                          <div className="absolute left-0 w-3 h-3 rounded-full bg-freelancer-accent border-2 border-white top-1/2 transform -translate-y-1/2"></div>
                          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all duration-300">
                            <div className="flex items-start gap-4">
                          <IconBox
                            icon={activity.icon}
                            size="sm"
                                variant={activity.type === 'success' ? 'success' : 'primary'}
                                className="bg-freelancer-accent/20 text-freelancer-accent border-freelancer-accent/30"
                          />
                          <div className="flex-1">
                                <h4 className="font-semibold text-white text-sm">{activity.title}</h4>
                                <p className="text-white/60 text-xs mt-1 leading-relaxed">{activity.desc}</p>
                                <span className="text-white/60 text-xs mt-2 inline-block">{activity.time}</span>
                          </div>
                        </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>


              {/* Skill Ratings - Remove gradient */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="col-span-12 lg:col-span-6 bg-freelancer-bg-card backdrop-blur-xl rounded-2xl p-6 border border-white/10" // Updated background
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <StarOutlined className="text-freelancer-accent text-xl" />
                    <h2 className="text-xl font-bold text-white">Skill Ratings</h2>
                  </div>
                  <Button
                    type="text"
                    className="text-white/60 hover:text-white flex items-center gap-1"
                    icon={<ArrowRightOutlined />}
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {Object.entries(freelancerData.skillRatings).map(([skill, rating], index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-white/70">{skill}</span>
                      <Progress
                        percent={rating}
                        size="small"
                        strokeColor="var(--freelancer-secondary)"
                        trailColor="rgba(255, 255, 255, 0.1)"
                        className="w-1/2"
                      />
                    </div>
                  ))}
            </div>
          </motion.div>

              {/* Client Feedback - Remove gradient */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="col-span-12 lg:col-span-6 bg-freelancer-bg-card backdrop-blur-xl rounded-2xl p-6 border border-white/10" // Updated background
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <TeamOutlined className="text-freelancer-accent text-xl" />
                    <h2 className="text-xl font-bold text-white">Client Feedback</h2>
        </div>
                  <Button
                    type="text"
                    className="text-white/60 hover:text-white flex items-center gap-1"
                    icon={<ArrowRightOutlined />}
                  >
                    View All
                  </Button>
      </div>
                <div className="space-y-4">
                  {[
                    { client: "TechCorp Solutions", feedback: "Excellent work, delivered on time and exceeded expectations.", rating: 5 },
                    { client: "Fashion Boutique", feedback: "Very professional and responsive, happy with the outcome.", rating: 4.5 },
                  ].map((item, index) => (
                    <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar size="small" src={`/api/placeholder/24/24?${index}`} className="border border-freelancer-accent/30"/>
                        <h4 className="text-white font-semibold">{item.client}</h4>
                        <div className="flex items-center gap-1">
                          <StarOutlined className="text-freelancer-accent text-sm" />
                          <span className="text-white/60 text-xs">{item.rating}/5.0</span>
                        </div>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed">{item.feedback}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Newsletter Signup - Remove gradient */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="col-span-12 lg:col-span-8 bg-freelancer-bg-card backdrop-blur-xl rounded-2xl p-6 border border-white/10" // Updated background
              >
                <h2 className="text-xl font-bold text-white mb-2">Stay Updated</h2>
                <p className="text-white/60 text-sm mb-4">Get the latest project opportunities and freelancer insights delivered to your inbox.</p>
                <div className="flex flex-col md:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-freelancer-accent"
                  />
                  <Button
                    type="primary"
                    className="bg-freelancer-accent hover:bg-freelancer-accent/90 border-0"
                  >
                    Subscribe
                  </Button>
                </div>
              </motion.div>

              {/* Freelancer Stats - Remove gradient */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.3 }}
                className="col-span-12 lg:col-span-4 bg-freelancer-bg-card backdrop-blur-xl rounded-2xl p-6 border border-white/10" // Updated background
              >
                <h2 className="text-xl font-bold text-white mb-4">Your Performance Stats</h2>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Projects Completed</span>
                    <span className="text-white font-semibold">{freelancerData.completedProjects}+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Total Hours Worked</span>
                    <span className="text-white font-semibold">{freelancerData.totalHours}+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Proposals Sent</span>
                    <span className="text-status-success font-semibold">{freelancerData.pendingProposals}+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Profile Views</span>
                    <span className="text-status-success font-semibold">150+</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        /* Custom scrollbar for themed scroll areas */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--freelancer-bg-card);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--freelancer-secondary);
          border-radius: 10px;
          border: 2px solid var(--freelancer-bg-card);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--freelancer-secondary);
        }

        /* Ant Design Select overrides for dark mode */
        .ant-select-dark-mode .ant-select-selector {
          background-color: var(--freelancer-bg-card) !important;
          border: 1px solid var(--freelancer-border-DEFAULT) !important;
          color: var(--freelancer-text-primary) !important;
          border-radius: 9999px !important; /* full */
          padding: 0.25rem 0.75rem !important; /* px-3 py-1.5 */
          height: auto !important;
        }

        .ant-select-dark-mode .ant-select-arrow {
          color: var(--freelancer-text-secondary) !important;
        }

        .ant-select-dark-mode .ant-select-selection-item {
          color: var(--freelancer-text-primary) !important;
        }

        .ant-select-dark-mode .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
          background-color: var(--freelancer-secondary) !important;
          color: #fff !important;
        }

        .ant-select-dark-mode .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
          background-color: var(--freelancer-tertiary) !important;
        }
        .ant-select-dropdown {
          background-color: var(--freelancer-bg-card) !important;
          border: 1px solid var(--freelancer-border-DEFAULT) !important;
          border-radius: 0.5rem !important;
        }
        .ant-select-item {
          color: var(--freelancer-text-primary) !important;
        }
        .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
          background-color: var(--freelancer-secondary) !important;
          color: #fff !important;
        }
        .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
          background-color: var(--freelancer-tertiary) !important;
        }
      `}</style>
    </div>
  );
};


FHomepage.propTypes = {
  userId: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  isEditable: PropTypes.bool.isRequired
};

export default FHomepage; 