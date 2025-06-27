import React, { useState, useEffect } from 'react';
import { 
  Card, Col, Row, Button, Tag, Statistic, Modal, Divider, Typography, 
  Radio, Space, Badge, Progress, Avatar, InputNumber, message, Select, Spin, Alert
} from 'antd';
import Cookies from 'js-cookie'
import { 
  DollarOutlined, ClockCircleOutlined,
  StarOutlined, CrownOutlined, RocketOutlined, ThunderboltOutlined,
  GiftOutlined, CodeOutlined, MobileOutlined, RobotOutlined,
  RiseOutlined, FilterOutlined, DownOutlined, BulbOutlined,
  HeartOutlined, CheckCircleOutlined, PlusOutlined, MinusOutlined,
  FileTextOutlined, TeamOutlined, CloseOutlined,
  EyeOutlined, ReloadOutlined
} from '@ant-design/icons';
import { LiaIndustrySolid  } from "react-icons/lia";
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Enhanced OBSP Card Component with Mobile Optimization
const OBSPCard = ({ obsp, onViewDetails }) => {
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Web Development': return '#00D4AA';
      case 'Mobile Development': return '#6366F1';
      case 'AI/ML Services': return '#F59E0B';
      case 'UI/UX Design': return '#EC4899';
      case 'Logo Design': return '#8B5CF6';
      case 'Video Editing': return '#EF4444';
      case 'Content Creation': return '#10B981';
      case 'Animation': return '#F97316';
      default: return '#00D4AA';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Web Development': return <CodeOutlined />;
      case 'Mobile Development': return <MobileOutlined />;
      case 'AI/ML Services': return <RobotOutlined />;
      case 'UI/UX Design': return <BulbOutlined />;
      case 'Logo Design': return <HeartOutlined />;
      case 'Video Editing': return <RiseOutlined />;
      case 'Content Creation': return <GiftOutlined />;
      case 'Animation': return <RocketOutlined />;
      default: return <CodeOutlined />;
    }
  };

  // Use the new price range structure
  const minPrice = obsp.price_range?.min || 0;
  const maxPrice = obsp.price_range?.max || 0;
  const levelCount = obsp.level_count || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        className="h-full bg-gradient-to-br from-client-bg-card to-client-bg-card/80 border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer group"
        bodyStyle={{ background: "transparent", padding: "16px sm:20px lg:24px" }}
      >
        <div className="relative">
          {/* Category Badge - Mobile Optimized */}
          <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 z-10">
            <div 
              className="px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs font-bold text-white shadow-lg border border-white/20 backdrop-blur-sm"
              style={{ 
                backgroundColor: getCategoryColor(obsp.category),
                boxShadow: `0 4px 20px ${getCategoryColor(obsp.category)}40`
              }}
            >
              <span className="hidden sm:inline">{obsp.category_display || obsp.category}</span>
              <span className="sm:hidden">{(obsp.category_display || obsp.category).split(' ')[0]}</span>
            </div>
          </div>

          {/* Header - Mobile Optimized */}
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div 
              className="p-3 sm:p-4 rounded-xl sm:rounded-2xl text-xl sm:text-2xl shadow-lg border border-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300"
              style={{ 
                backgroundColor: `${getCategoryColor(obsp.category)}15`,
                color: getCategoryColor(obsp.category),
                boxShadow: `0 8px 32px ${getCategoryColor(obsp.category)}20`
              }}
            >
              {getCategoryIcon(obsp.category)}
            </div>
            <div className="flex-1 min-w-0">
              <Title level={4} className="!text-text-light mb-1 sm:mb-2 font-bold leading-tight group-hover:text-client-accent transition-colors duration-300 sm:text-lg lg:text-xl">
                {obsp.title}
              </Title>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <Tag 
                  color={getCategoryColor(obsp.category)} 
                  className="text-xs font-semibold border-0 shadow-sm w-fit"
                  style={{ 
                    backgroundColor: `${getCategoryColor(obsp.category)}20`,
                    color: getCategoryColor(obsp.category)
                  }}
                >
                  {obsp.industry_display || obsp.industry.charAt(0).toUpperCase() + obsp.industry.slice(1)}
                </Tag>
                <div className="flex items-center gap-1 text-text-muted text-xs sm:text-sm">
                  <StarOutlined className="text-yellow-500" />
                  <span>4.8 (156 reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description - Mobile Optimized */}
          <div className="mb-4 sm:mb-6">
            <Paragraph className="text-text-secondary leading-relaxed mb-0 line-clamp-2 sm:line-clamp-3 text-sm sm:text-base">
              {obsp.description}
            </Paragraph>
          </div>

          {/* Price Range - Mobile Optimized */}
          <div className="bg-gradient-to-r from-client-accent/10 to-client-secondary/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 backdrop-blur-sm mb-4 sm:mb-6">
            <div className="text-center">
              <div className="text-client-accent font-bold text-lg sm:text-2xl mb-1">
                ₹{minPrice.toLocaleString()} - ₹{maxPrice.toLocaleString()}
              </div>
              <div className="text-text-secondary text-xs sm:text-sm font-medium">
                Starting Price Range
              </div>
            </div>
          </div>

          {/* Stats - Mobile Optimized */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="text-center p-2 sm:p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-text-light font-bold text-base sm:text-lg mb-1">
                0
              </div>
              <div className="text-text-secondary text-xs">
                Completed
              </div>
            </div>
            <div className="text-center p-2 sm:p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-text-light font-bold text-base sm:text-lg mb-1">
                {levelCount}
              </div>
              <div className="text-text-secondary text-xs">
                Levels Available
              </div>
            </div>
          </div>

          {/* Action Button - Mobile Optimized */}
          <div className="pt-3 sm:pt-4 border-t border-white/10">
            <Button 
              type="primary" 
              size="middle"
              className="w-full bg-gradient-to-r from-client-accent to-client-accent/90 text-white border-none shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 font-semibold text-sm sm:text-base"
              onClick={() => onViewDetails(obsp.id)}
              icon={<FileTextOutlined />}
            >
              <span className="sm:hidden">View Details</span>
              <span className="hidden sm:inline">View Details</span>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const ObspPurchaseList = () => {
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [obspData, setObspData] = useState([]);
  const [headerStats, setHeaderStats] = useState({
    total_obsps: 0,
    unique_industries: 0,
    completed_projects: 0,
    price_range: { min: 0, max: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const navigate = useNavigate();

  // Fetch OBSP data from backend
  const fetchObspData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('Fetching OBSP data...');
      const token = Cookies.get('accessToken');
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Token value:', token);

      // Try different authorization header formats
      const headers = {
        'Content-Type': 'application/json',
      };

      // Add authorization header based on token format
      if (token) {
        // Check if token already has 'Bearer ' prefix
        if (token.startsWith('Bearer ')) {
          headers['Authorization'] = token;
        } else {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      console.log('Request headers:', headers);

      const response = await axios.get('https://talintzbackend-production.up.railway.app/api/obsp/api/list/', {
        headers: headers,
        });

      console.log('API Response:', response);
      console.log('Response data:', response.data);

      if (response.data.success) {
        setObspData(response.data.data.obsps);
        setHeaderStats(response.data.data.header_stats);
        console.log('OBSP data set:', response.data.data.obsps);
        console.log('Header stats set:', response.data.data.header_stats);
      } else {
        throw new Error(response.data.error || 'Failed to fetch OBSP data');
      }
    } catch (err) {
      console.error('Error fetching OBSP data:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error status:', err.response.status);
        console.error('Error data:', err.response.data);
        
        if (err.response.status === 401) {
          // Unauthorized - try to get a new token or redirect to login
          console.error('Unauthorized - token might be invalid or expired');
          setError('Authentication failed. Please log in again.');
          // Optionally redirect to login
          // navigate('/login');
        } else {
          setError(err.response.data?.error || `HTTP ${err.response.status}: ${err.response.statusText}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received');
        setError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', err.message);
        setError(err.message || 'Failed to load OBSP data');
      }
      
      message.error('Failed to load OBSP data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchObspData();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    fetchObspData(true);
  };

  // Industry and Category Options
  const industries = [
    { value: 'all', label: 'All Industries', icon: <LiaIndustrySolid  /> },
    { value: 'tech', label: 'Tech', icon: <CodeOutlined /> },
    { value: 'creativity', label: 'Creativity', icon: <BulbOutlined /> }
  ];

  const getCategoriesByIndustry = (industry) => {
    if (industry === 'all') return [];
    const industryPacks = obspData.filter(pack => 
      pack.industry.toLowerCase() === industry
    );
    const categories = [...new Set(industryPacks.map(pack => pack.category))];
    return categories.map(category => ({
      value: category.toLowerCase().replace(/\s+/g, '-'),
      label: category
    }));
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    ...getCategoriesByIndustry(selectedIndustry)
  ];

  // Filter packs based on selections
  const filteredPacks = obspData.filter(pack => {
    const industryMatch = selectedIndustry === 'all' || 
      pack.industry.toLowerCase() === selectedIndustry;
    const categoryMatch = selectedCategory === 'all' || 
      pack.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory;
    return industryMatch && categoryMatch;
  });

  const handleViewDetails = (obspId) => {
    navigate(`/client/obsp/details/${obspId}`);
  };

  const handleIndustryChange = (value) => {
    setSelectedIndustry(value);
    setSelectedCategory('all');
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-3 sm:p-6 bg-client-primary min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" className="mb-4" />
          <Text className="text-text-light text-lg">Loading OBSP packages...</Text>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-3 sm:p-6 bg-client-primary min-h-screen">
        <div className="max-w-2xl mx-auto">
          <Alert
            message="Error Loading OBSP Data"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" danger onClick={handleRefresh}>
                <ReloadOutlined /> Retry
              </Button>
            }
            className="mb-6"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 bg-client-primary min-h-screen overflow-y-auto custom-scrollbar">
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
                <span className="text-client-accent text-xs lg:text-sm font-semibold">Service Packs</span>
              </div>

              <h1 className="text-2xl font-bold text-white mb-2">
                Outcome-Based Service Packs
              </h1>
              <p className="text-white/70">Predefined projects with clear deliverables, budgets, and guaranteed outcomes</p>
            </div>

            <div className="flex gap-3">
              <Button 
                icon={<ReloadOutlined spin={refreshing} />}
                className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                onClick={handleRefresh}
                loading={refreshing}
              >
                Refresh
              </Button>
              <Button 
                icon={<FilterOutlined />}
                className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
              >
                Filters
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
            {[
              { icon: <FileTextOutlined />, label: "Available Packs", value: headerStats.total_obsps },
              { icon: <LiaIndustrySolid />, label: "Industries", value: headerStats.unique_industries },
              { icon: <CheckCircleOutlined />, label: "Completed", value: headerStats.completed_projects },
              { icon: <DollarOutlined />, label: "Starting Price", value: `₹${(headerStats.price_range.min / 1000).toFixed(0)}K+` }
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

      {/* Main Content Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* OBSP Packs List */}
        <div>
          {/* Filter Section - Mobile Optimized */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-xl border border-white/10 bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl shadow-xl mb-4 sm:mb-6"
          >
            <div className="p-4 sm:p-6">
              <div className="flex flex-col gap-4 sm:gap-6">
                {/* Filter Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-client-accent/20 border border-client-accent/30">
                      <FilterOutlined className="text-lg sm:text-xl text-client-accent" />
                    </div>
                    <div>
                      <Title level={5} className="!text-text-light mb-0 font-semibold sm:text-base">
                        Filter OBSP Packs
                      </Title>
                      <Text className="text-text-muted text-xs sm:text-sm">
                        Narrow down by industry and category
                      </Text>
                    </div>
                  </div>
                </div>
                
                {/* Filter Controls - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* Industry Filter */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <Text className="text-text-light font-medium text-sm">Industry:</Text>
                    <Select
                      value={selectedIndustry}
                      onChange={handleIndustryChange}
                      className="w-full sm:w-44 custom-select"
                      dropdownClassName="custom-dropdown"
                      placeholder="Select Industry"
                    >
                      {industries.map(industry => (
                        <Option key={industry.value} value={industry.value}>
                          <div className="flex items-center gap-2">
                            {industry.icon}
                            <span className="font-medium">{industry.label}</span>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </div>

                  {/* Category Filter */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <Text className="text-text-light font-medium text-sm">Category:</Text>
                    <Select
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                      className="w-full sm:w-52 custom-select"
                      dropdownClassName="custom-dropdown"
                      disabled={selectedIndustry === 'all'}
                      placeholder="Select Category"
                    >
                      {categories.map(category => (
                        <Option key={category.value} value={category.value}>
                          <span className="font-medium">{category.label}</span>
                        </Option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* OBSP Packs Grid - Mobile Optimized */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-xl border border-white/10 bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl shadow-xl"
          >
            <div className="p-4 sm:p-6">
              {/* Section Header */}
              <div className="mb-4 sm:mb-6">
                <Title level={4} className="!text-text-light mb-2 font-semibold sm:text-lg">
                  Available Service Packs
                </Title>
                <Text className="text-text-secondary text-sm sm:text-base">
                  {filteredPacks.length} pack{filteredPacks.length !== 1 ? 's' : ''} found
                </Text>
              </div>

              {filteredPacks.length > 0 ? (
                <Row gutter={[16, 16]} className="sm:gutter-[24px]">
                  {filteredPacks.map((pack, index) => (
                    <Col xs={24} sm={24} lg={12} key={pack.id}>
                      <OBSPCard 
                        obsp={pack} 
                        onViewDetails={handleViewDetails}
                      />
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="text-center py-12 sm:py-16">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-client-accent/20 border border-client-accent/30 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                    <FilterOutlined className="text-2xl sm:text-3xl text-client-accent" />
                  </div>
                  <Title level={5} className="text-text-light mb-3 font-semibold sm:text-lg">
                    No OBSP Packs Found
                  </Title>
                  <Text className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-md mx-auto">
                    Try adjusting your filters to see more options. You can select different industries or categories to explore available service packs.
                  </Text>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced CSS Styles with Mobile Optimizations */}
      <style jsx global>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .custom-select .ant-select-selector {
          background: rgba(255, 255, 255, 0.08) !important;
          border: 1.5px solid rgba(255, 255, 255, 0.13) !important;
          border-radius: 12px !important;
          color: var(--text-light) !important;
          padding: 8px 16px !important;
          transition: all 0.3s ease !important;
        }
        .custom-select:hover .ant-select-selector {
          border-color: var(--client-accent) !important;
          background: rgba(255, 255, 255, 0.12) !important;
        }
        .custom-select.ant-select-focused .ant-select-selector {
          border-color: var(--client-accent) !important;
          box-shadow: 0 0 0 2px rgba(0, 212, 170, 0.2) !important;
        }
        .custom-dropdown {
          background: rgba(26, 27, 46, 0.95) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
        }
        .custom-dropdown .ant-select-item {
          color: var(--text-light) !important;
          transition: all 0.2s ease !important;
        }
        .custom-dropdown .ant-select-item-option-selected {
          background: rgba(0, 212, 170, 0.1) !important;
          color: var(--client-accent) !important;
        }
        .custom-dropdown .ant-select-item-option-active {
          background: rgba(255, 255, 255, 0.05) !important;
        }
        
        /* Mobile-specific optimizations */
        @media (max-width: 767px) {
          .custom-select .ant-select-selector {
            padding: 6px 12px !important;
            font-size: 14px !important;
          }
        }
        
        /* Tablet optimizations */
        @media (min-width: 768px) and (max-width: 1023px) {
          .ant-radio-button-wrapper {
            font-size: 13px !important;
            padding: 10px 16px !important;
          }
        }
        
        /* Custom scrollbar for mobile */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        /* Enhanced animations for mobile */
        @media (max-width: 767px) {
          .group:hover .group-hover\\:scale-110 {
            transform: scale(1.05) !important;
          }
          
          .group:hover .group-hover\\:text-client-accent {
            color: var(--client-accent) !important;
          }
        }
        
        /* Improved touch targets for mobile */
        @media (max-width: 767px) {
          .ant-btn {
            min-height: 44px !important;
            font-size: 14px !important;
          }
          
          .ant-card {
            border-radius: 12px !important;
          }
          
          .ant-tag {
            font-size: 12px !important;
            padding: 2px 8px !important;
          }
        }
        
        /* Loading states and transitions */
        .ant-btn-loading {
          opacity: 0.7 !important;
        }
        
        .ant-btn:disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
        }
        
        /* Enhanced focus states for accessibility */
        .ant-btn:focus,
        .ant-select:focus {
          outline: 2px solid var(--client-accent) !important;
          outline-offset: 2px !important;
        }
        
        /* Smooth transitions for all interactive elements */
        .ant-btn,
        .ant-card,
        .ant-select,
        .ant-tag {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
      `}</style>
    </div>
  );
};

export default ObspPurchaseList;
