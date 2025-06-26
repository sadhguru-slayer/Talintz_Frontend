import { useState, useEffect } from 'react';
import { 
  Card, Col, Row, Button, Tag, Statistic, 
  Modal, Typography, Select, Space, message
} from 'antd';
import Cookies from 'js-cookie';
import { 
  TrophyOutlined, LockOutlined, UnlockOutlined, CheckCircleOutlined,
  RocketOutlined,
  GiftOutlined, CodeOutlined, MobileOutlined, 
  RobotOutlined, RiseOutlined, FilterOutlined,
  BulbOutlined, HeartOutlined, LoadingOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OBSP.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Helper functions for category icons and colors
const getCategoryIcon = (category) => {
  switch (category) {
    case 'web-development': return <CodeOutlined />;
    case 'mobile-development': return <MobileOutlined />;
    case 'ai-ml': return <RobotOutlined />;
    case 'design': return <BulbOutlined />;
    case 'marketing': return <HeartOutlined />;
    case 'content': return <GiftOutlined />;
    case 'video': return <RiseOutlined />;
    case 'animation': return <RocketOutlined />;
    default: return <CodeOutlined />;
  }
};

const getCategoryColor = (category) => {
  switch (category) {
    case 'web-development': return '#00D4AA';
    case 'mobile-development': return '#6366F1';
    case 'ai-ml': return '#F59E0B';
    case 'design': return '#EC4899';
    case 'marketing': return '#8B5CF6';
    case 'content': return '#10B981';
    case 'video': return '#EF4444';
    case 'animation': return '#F97316';
    default: return '#00D4AA';
  }
};

// Enhanced OBSP Pack Card Component
const OBSPPackCard = ({ pack, onCardClick, onViewDetails, onApply, onOpenApplyModal, isLevelApplied }) => {
  // Calculate available levels from eligibility summary
  const availableLevels = pack.eligibility_summary ? 
    pack.eligibility_summary.eligible_levels.length : 0;
  const totalLevels = pack.eligibility_summary ? 
    pack.eligibility_summary.total_levels : 0;

  const handleApplyClick = (level, e) => {
    e.stopPropagation();
    
    if (!level.is_eligible) {
      message.warning('You are not eligible for this level yet. Please check the requirements.');
      return;
    }

    // Open the apply modal instead of directly applying
    if (onOpenApplyModal) {
      onOpenApplyModal(pack, level);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        className="h-full bg-gradient-to-br from-freelancer-bg-card to-freelancer-bg-card/80 border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer obsp-card group"
        onClick={() => onCardClick(pack)}
        bodyStyle={{ background: "transparent", padding: "24px" }}
      >
        <div className="relative">
          {/* Premium Category Badge */}
          <div className="absolute -top-3 -right-3 z-10">
            <div 
              className="px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg border border-white/20 backdrop-blur-sm"
              style={{ 
                backgroundColor: getCategoryColor(pack.category.name),
                boxShadow: `0 4px 20px ${getCategoryColor(pack.category.name)}40`
              }}
            >
              {pack.category.name}
            </div>
          </div>

          {/* Premium Header */}
          <div className="flex items-start gap-4 mb-6">
            <div 
              className="p-4 rounded-2xl text-2xl shadow-lg border border-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300"
              style={{ 
                backgroundColor: `${getCategoryColor(pack.category.name)}15`,
                color: getCategoryColor(pack.category.name),
                boxShadow: `0 8px 32px ${getCategoryColor(pack.category.name)}20`
              }}
            >
              {getCategoryIcon(pack.category.name)}
            </div>
            <div className="flex-1 min-w-0">
              <Title level={3} className="!text-text-light mb-2 font-bold leading-tight group-hover:text-freelancer-accent transition-colors duration-300">
                {pack.title}
              </Title>
              <div className="flex items-center gap-3 mb-3">
                <Tag 
                  color={getCategoryColor(pack.category.name)} 
                  className="text-xs font-semibold border-0 shadow-sm"
                  style={{ 
                    backgroundColor: `${getCategoryColor(pack.category.name)}20`,
                    color: getCategoryColor(pack.category.name)
                  }}
                >
                  {pack.industry_display}
                </Tag>
                <div className="flex items-center gap-1 text-text-muted text-sm">
                  <UnlockOutlined className="text-green-500" />
                  <span>{availableLevels}/{totalLevels} available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Description */}
          <div className="mb-6">
            <Paragraph className="text-text-secondary leading-relaxed mb-0 line-clamp-3">
              {pack.description}
            </Paragraph>
          </div>

          {/* Premium Levels Preview */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <Title level={5} className="!text-text-light mb-0 font-semibold">
                Project Levels
              </Title>
              <div className="text-xs text-text-muted">
                {totalLevels} levels
              </div>
            </div>
            
            {pack.levels && pack.levels.slice(0, 2).map((level, idx) => {
              const isApplied = isLevelApplied && isLevelApplied(pack, level);
              
              return (
                <div 
                  key={idx} 
                  className="p-4 rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        level.is_eligible 
                          ? (isApplied ? 'bg-blue-500/20 text-blue-500' : 'bg-green-500/20 text-green-500')
                          : 'bg-text-muted/20 text-text-muted'
                      }`}>
                        {level.is_eligible ? (
                          isApplied ? (
                            <CheckCircleOutlined className="text-sm" />
                          ) : (
                            <UnlockOutlined className="text-sm" />
                          )
                        ) : (
                          <LockOutlined className="text-sm" />
                        )}
                      </div>
                      <div>
                        <Text className="text-text-light font-semibold block capitalize">
                          {level.name}
                        </Text>
                        <div className="text-sm text-text-secondary">
                          {level.is_eligible 
                            ? (isApplied ? 'Applied' : 'Available')
                            : 'Locked'
                          }
                          {level.price && (
                            <span className="text-freelancer-accent ml-2">• ₹{level.price}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      type={level.is_eligible ? 'primary' : 'default'}
                      disabled={!level.is_eligible || isApplied}
                      size="small"
                      style={{
                        // Override disabled styles for applied status
                        backgroundColor: !level.is_eligible 
                          ? 'rgba(255, 255, 255, 0.05)' 
                          : isApplied
                          ? '#3B82F6' // Blue for applied
                          : '#00D4AA', // Green for available
                        color: !level.is_eligible 
                          ? 'var(--text-muted)' 
                          : '#ffffff',
                        borderColor: !level.is_eligible 
                          ? 'rgba(255, 255, 255, 0.2)' 
                          : 'transparent',
                        border: 'none',
                        boxShadow: level.is_eligible ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
                        cursor: level.is_eligible && !isApplied ? 'pointer' : 'default',
                        opacity: level.is_eligible ? 1 : 0.6
                      }}
                      className="transition-all duration-300 hover:scale-105"
                      onClick={(e) => handleApplyClick(level, e)}
                    >
                      {!level.is_eligible ? 'Locked' : 
                       isApplied ? 'Applied' : 'Apply'}
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {totalLevels > 2 && (
              <div className="text-center py-2">
                <Text className="text-text-secondary text-sm font-medium">
                  +{totalLevels - 2} more levels available
                </Text>
              </div>
            )}
          </div>

          {/* Premium Action Button */}
          <div className="pt-4 border-t border-white/10">
            <Button 
              type="primary" 
              size="large"
              className="w-full bg-gradient-to-r from-freelancer-accent to-freelancer-accent/90 text-white border-none shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(pack);
              }}
            >
              View Full Details
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const ListOfObsps = () => {
  const [selectedOBSP, setSelectedOBSP] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [obspPacks, setObspPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  // Fetch OBSP data from backend
  useEffect(() => {
    fetchOBSPData();
  }, []);

  const fetchOBSPData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/api/freelancer/obsps/', {
        headers: {
          'Authorization': `Bearer ${Cookies.get('accessToken')}`
        }
      });

      console.log('Full response:', response);
      console.log('Response data:', response.data);
      
      // Check if response has the expected structure
      if (response.data && response.data.success && response.data.data && response.data.data.obsps) {
        setObspPacks(response.data.data.obsps);
        
        // Calculate stats
        const totalObsps = response.data.data.total_count;
        const eligibleCount = response.data.data.eligible_count;
        const industries = [...new Set(response.data.data.obsps.map(obsp => obsp.industry))];
        
        setStats({
          totalObsps,
          industries: industries.length,
          availableLevels: eligibleCount
        });
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback: if response.data is directly an array
        setObspPacks(response.data);
        
        // Calculate stats from array
        const totalObsps = response.data.length;
        const industries = [...new Set(response.data.map(obsp => obsp.industry))];
        const availableLevels = response.data.reduce((sum, obsp) => {
          return sum + (obsp.eligibility_summary ? obsp.eligibility_summary.eligible_levels.length : 0);
        }, 0);
        
        setStats({
          totalObsps,
          industries: industries.length,
          availableLevels
        });
      } else {
        console.error('Unexpected response structure:', response.data);
        message.error('Unexpected data format received from server');
      }
    } catch (error) {
      console.error('Error fetching OBSP data:', error);
      message.error('Failed to load OBSP packs');
    } finally {
      setLoading(false);
    }
  };

  // Industry and Category Options
  const industries = [
    { value: 'all', label: 'All Industries', icon: <FilterOutlined /> },
    ...Array.from(new Set(obspPacks.map(pack => pack.industry))).map(industry => ({
      value: industry,
      label: industry.charAt(0).toUpperCase() + industry.slice(1),
      icon: <FilterOutlined />
    }))
  ];

  const getCategoriesByIndustry = (industry) => {
    if (industry === 'all') return [];
    const industryPacks = obspPacks.filter(pack => pack.industry === industry);
    const categories = [...new Set(industryPacks.map(pack => pack.category.name))];
    return categories.map(category => ({
      value: category,
      label: category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }));
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    ...getCategoriesByIndustry(selectedIndustry)
  ];

  // Filter packs based on selections
  const filteredPacks = obspPacks.filter(pack => {
    const industryMatch = selectedIndustry === 'all' || pack.industry === selectedIndustry;
    const categoryMatch = selectedCategory === 'all' || pack.category.name === selectedCategory;
    return industryMatch && categoryMatch;
  });

  const showOBSPDetails = (pack) => {
    setSelectedOBSP(pack);
    setModalVisible(true);
  };

  const handleViewDetails = (pack) => {
    navigate(`/freelancer/obsp/details/${pack.id}`)
    
  };

  const handleIndustryChange = (value) => {
    setSelectedIndustry(value);
    setSelectedCategory('all'); // Reset category when industry changes
  };

  const handleApply = (obspId, levelName) => {
    // Optionally update the UI to show the application was submitted
    message.success(`Application submitted for ${levelName} level!`);
    // You could also refresh the data or update the specific pack's state
  };

  const handleOpenApplyModal = (pack, level) => {
    setSelectedOBSP(pack);
    setSelectedLevel(level);
    setApplyModalVisible(true);
  };

  const handleSubmitApplication = async () => {
    if (!selectedOBSP || !selectedLevel) {
      message.error('Missing application data');
      return;
    }

    // Determine the selected level
    let selectedLevelValue = selectedLevel.level;
    
    // If level.level is not available, try to infer from level.name
    if (!selectedLevelValue && selectedLevel.name) {
      const nameLower = selectedLevel.name.toLowerCase();
      if (nameLower.includes('easy') || nameLower.includes('basic')) {
        selectedLevelValue = 'easy';
      } else if (nameLower.includes('medium') || nameLower.includes('standard')) {
        selectedLevelValue = 'medium';
      } else if (nameLower.includes('hard') || nameLower.includes('advanced') || nameLower.includes('premium')) {
        selectedLevelValue = 'hard';
      }
    }

    if (!selectedLevelValue) {
      message.error('Could not determine the level. Please try again.');
      return;
    }

    const requestData = {
      obsp_template_id: selectedOBSP.id,
      selected_level: selectedLevelValue,
      pitch: `I am interested in working on the ${selectedOBSP.title} project at ${selectedLevel.name} level. I have the required skills and experience to deliver high-quality results.`
    };

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/freelancer/obsp/apply/', requestData, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        message.success('Application submitted successfully!');
        setApplyModalVisible(false);
        
        // Refresh the data to get updated applied status
        fetchOBSPData();
      } else {
        message.error(response.data.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error applying for OBSP:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Failed to submit application. Please try again.');
      }
    }
  };

  // Update the isLevelApplied function to use backend data
  const isLevelApplied = (pack, level) => {
    // Check if the level has an is_applied property from backend
    if (level.is_applied !== undefined) {
      return level.is_applied;
    }
    
    // Fallback: check if there's an applications array in the pack
    if (pack.applications && Array.isArray(pack.applications)) {
      return pack.applications.some(app => 
        app.selected_level === level.level || app.selected_level === level.name.toLowerCase()
      );
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="p-6 bg-freelancer-primary min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingOutlined className="text-4xl text-freelancer-accent mb-4" />
          <Text className="text-text-secondary">Loading OBSP packs...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-freelancer-primary min-h-screen overflow-y-auto custom-scrollbar">
      {/* Enhanced Header Section - Professional and Consistent */}
      <div className="mb-8">
        <div className="bg-freelancer-bg-card rounded-xl shadow-lg p-8 relative overflow-hidden border border-white/10">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-freelancer-accent/10 rounded-full -mr-48 -mt-48 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-freelancer-secondary/10 rounded-full -ml-32 -mb-32 blur-xl"></div>
          
          <div className="relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Main Header */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div>
                  <Title level={1} className="!text-text-light mb-1 font-bold tracking-wide">
                    Outcome-Based Service Packs
                  </Title>
                  <div className="h-1 w-16 bg-freelancer-accent mx-auto rounded-full"></div>
                </div>
              </div>
              
              {/* Subtitle */}
              <Paragraph className="text-text-secondary text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
                Predefined projects with clear deliverables, budgets, and progressive difficulty levels. 
                Choose from our curated collection of professional service packages.
              </Paragraph>
              
              {/* Enhanced Stats Grid - Professional Layout */}
              <Row gutter={[20, 20]} className="justify-center">
                <Col xs={24} sm={12} lg={6}>
                  <div className="h-full">
                    <Card 
                      className="h-full overflow-hidden relative bg-freelancer-bg-card/80 border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
                      bodyStyle={{ background: "transparent", padding: "24px" }}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-xl bg-freelancer-accent/20 border border-freelancer-accent/30 mx-auto mb-3 flex items-center justify-center">
                          <TrophyOutlined className="text-xl text-freelancer-accent" />
                        </div>
                        <Statistic
                          title={
                            <span className="text-text-light font-semibold text-base">
                              Total Packs
                            </span>
                          }
                          value={stats.totalObsps || 0}
                          valueStyle={{ 
                            color: 'var(--text-light)', 
                            fontWeight: '700',
                            fontSize: '28px',
                            lineHeight: '1.2'
                          }}
                        />
                      </div>
                    </Card>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <div className="h-full">
                    <Card 
                      className="h-full overflow-hidden relative bg-freelancer-bg-card/80 border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
                      bodyStyle={{ background: "transparent", padding: "24px" }}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-xl bg-freelancer-secondary/20 border border-freelancer-secondary/30 mx-auto mb-3 flex items-center justify-center">
                          <FilterOutlined className="text-xl text-freelancer-secondary" />
                        </div>
                        <Statistic
                          title={
                            <span className="text-text-light font-semibold text-base">
                              Industries
                            </span>
                          }
                          value={stats.industries || 0}
                          valueStyle={{ 
                            color: 'var(--text-light)', 
                            fontWeight: '700',
                            fontSize: '28px',
                            lineHeight: '1.2'
                          }}
                        />
                      </div>
                    </Card>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <div className="h-full">
                    <Card 
                      className="h-full overflow-hidden relative bg-freelancer-bg-card/80 border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
                      bodyStyle={{ background: "transparent", padding: "24px" }}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 mx-auto mb-3 flex items-center justify-center">
                          <UnlockOutlined className="text-xl text-green-500" />
                        </div>
                        <Statistic
                          title={
                            <span className="text-text-light font-semibold text-base">
                              Available Levels
                            </span>
                          }
                          value={stats.availableLevels || 0}
                          valueStyle={{ 
                            color: 'var(--text-light)', 
                            fontWeight: '700',
                            fontSize: '28px',
                            lineHeight: '1.2'
                          }}
                        />
                      </div>
                    </Card>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <div className="h-full">
                    <Card 
                      className="h-full overflow-hidden relative bg-freelancer-bg-card/80 border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
                      bodyStyle={{ background: "transparent", padding: "24px" }}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 mx-auto mb-3 flex items-center justify-center">
                          <RiseOutlined className="text-xl text-orange-500" />
                        </div>
                        <Statistic
                          title={
                            <span className="text-text-light font-semibold text-base">
                              Starting Budget
                            </span>
                          }
                          value="₹8K"
                          valueStyle={{ 
                            color: 'var(--text-light)', 
                            fontWeight: '700',
                            fontSize: '28px',
                            lineHeight: '1.2'
                          }}
                          suffix={
                            <span className="text-freelancer-accent font-semibold text-lg">+</span>
                          }
                        />
                      </div>
                    </Card>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filter Section - Professional Styling */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-xl border border-white/10 bg-gradient-to-br from-freelancer-secondary/40 to-freelancer-bg-dark/30 backdrop-blur-xl shadow-xl mb-6"
      >
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Filter Header */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-freelancer-accent/20 border border-freelancer-accent/30">
                <FilterOutlined className="text-xl text-freelancer-accent" />
              </div>
              <div>
                <Title level={4} className="!text-text-light mb-0 font-semibold">
                  Filter OBSP Packs
                </Title>
                <Text className="text-text-muted text-sm">
                  Narrow down by industry and category
                </Text>
              </div>
            </div>
            
            {/* Filter Controls */}
            <Space size="large" className="flex flex-col sm:flex-row gap-4">
              {/* Industry Filter */}
              <div className="flex items-center gap-3">
                <Text className="text-text-light font-medium text-sm">Industry:</Text>
                <Select
                  value={selectedIndustry}
                  onChange={handleIndustryChange}
                  className="w-44 custom-select"
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
              <div className="flex items-center gap-3">
                <Text className="text-text-light font-medium text-sm">Category:</Text>
                <Select
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  className="w-52 custom-select"
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
            </Space>
          </div>
        </div>
      </motion.div>

      {/* OBSP Packs Grid - Professional Layout */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.3 }}
        className="rounded-xl border border-white/10 bg-gradient-to-br from-freelancer-secondary/40 to-freelancer-bg-dark/30 backdrop-blur-xl shadow-xl"
      >
        <div className="p-6">
          {/* Section Header */}
          <div className="mb-6">
            <Title level={3} className="!text-text-light mb-2 font-semibold">
              Available Service Packs
            </Title>
            <Text className="text-text-secondary">
              {filteredPacks.length} pack{filteredPacks.length !== 1 ? 's' : ''} found
            </Text>
          </div>

          {filteredPacks.length > 0 ? (
            <Row gutter={[24, 24]}>
              {filteredPacks.map((pack) => (
                <Col xs={24} lg={12} key={pack.id}>
                  <OBSPPackCard 
                    pack={pack} 
                    onCardClick={showOBSPDetails}
                    onViewDetails={handleViewDetails}
                    onApply={handleApply}
                    onOpenApplyModal={handleOpenApplyModal}
                    isLevelApplied={isLevelApplied}
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-freelancer-accent/20 border border-freelancer-accent/30 mx-auto mb-6 flex items-center justify-center">
                <FilterOutlined className="text-3xl text-freelancer-accent" />
              </div>
              <Title level={4} className="text-text-light mb-3 font-semibold">
                No OBSP Packs Found
              </Title>
              <Text className="text-text-secondary text-base leading-relaxed max-w-md mx-auto">
                Try adjusting your filters to see more options. You can select different industries or categories to explore available service packs.
              </Text>
            </div>
          )}
        </div>
      </motion.div>

      {/* Enhanced Detailed Modal - Matching FreelancerAnalyticsPage modal styling */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg text-xl"
              style={{ 
                backgroundColor: `${selectedOBSP ? getCategoryColor(selectedOBSP.category.name) : '#00D4AA'}20`,
                color: selectedOBSP ? getCategoryColor(selectedOBSP.category.name) : '#00D4AA'
              }}
            >
              {selectedOBSP ? getCategoryIcon(selectedOBSP.category.name) : <CodeOutlined />}
            </div>
            <div>
              <Title level={3} className="!text-text-light mb-0">
                {selectedOBSP?.title}
              </Title>
              <div className="flex items-center gap-2">
                <Tag color={selectedOBSP ? getCategoryColor(selectedOBSP.category.name) : '#8B5CF6'}>
                  {selectedOBSP?.category.name}
              </Tag>
                <Tag color="blue">{selectedOBSP?.industry_display}</Tag>
              </div>
            </div>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={900}
        className="obsp-modal"
      >
        {selectedOBSP && (
          <div className="space-y-6">
            <Paragraph className="!text-text-secondary text-lg">
              {selectedOBSP.description}
            </Paragraph>

            {/* Enhanced Levels Tabs - Matching FWallet.jsx tab styling */}
            <div className="space-y-4">
              {selectedOBSP.levels && selectedOBSP.levels.map((level, index) => (
                    <Card 
                  key={index}
                  title={
                    <div className="flex items-center gap-2">
                      {level.is_eligible ? (
                        <UnlockOutlined className="text-green-500" />
                      ) : (
                        <LockOutlined className="text-text-muted" />
                      )}
                      <span className="text-text-light capitalize">{level.name} Level</span>
                    </div>
                  }
                      className="bg-freelancer-bg-card/90 border border-white/10 shadow-md transition-shadow duration-DEFAULT"
                      bodyStyle={{ background: "transparent" }}
                    >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Project Details */}
                      <div className="space-y-4">
                        <div>
                        <Text strong className="text-text-light">Status:</Text>
                        <div className={`font-semibold ${level.is_eligible ? 'text-green-500' : 'text-red-400'}`}>
                          {level.is_eligible ? 'Available' : 'Locked'}
                        </div>
                      </div>
                      {level.price && (
                        <div>
                          <Text strong className="text-text-light">Budget:</Text>
                          <div className="text-freelancer-accent font-semibold">₹{level.price}</div>
                        </div>
                      )}
                      {level.duration && (
                        <div>
                          <Text strong className="text-text-light">Duration:</Text>
                          <div className="text-text-secondary">{level.duration}</div>
                        </div>
                      )}
                      {level.description && (
                        <div>
                          <Text strong className="text-text-light">Description:</Text>
                          <div className="text-text-secondary">{level.description}</div>
                        </div>
                      )}
                      </div>

                    {/* Eligibility Details */}
                    {level.score !== undefined && (
    <div>
                        <Text strong className="text-text-light block mb-3">Eligibility Score:</Text>
                      <div className="text-text-secondary">
                        <div className="text-lg font-semibold text-freelancer-accent">{level.score}</div>
                        <div className="text-sm text-text-muted">
                          Last calculated: {level.last_calculated ? new Date(level.last_calculated).toLocaleDateString() : 'Never'}
                        </div>
                      </div>
                    </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="mt-6 text-center">
                    <Button 
                      type="primary" 
                      size="large"
                      disabled={!level.is_eligible || isLevelApplied(selectedOBSP, level)}
                      style={{
                        // Override disabled styles for applied status
                        backgroundColor: !level.is_eligible 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : isLevelApplied(selectedOBSP, level)
                          ? '#3B82F6' // Blue for applied
                          : '#00D4AA', // Green for available
                        color: '#ffffff',
                        borderColor: 'transparent',
                        border: 'none',
                        boxShadow: level.is_eligible ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
                        cursor: level.is_eligible && !isLevelApplied(selectedOBSP, level) ? 'pointer' : 'default',
                        opacity: level.is_eligible ? 1 : 0.6
                      }}
                      className="transition-all duration-300"
                      icon={
                        !level.is_eligible ? <LockOutlined /> : 
                        isLevelApplied(selectedOBSP, level) ? <CheckCircleOutlined /> : 
                        <CheckCircleOutlined />
                      }
                      onClick={() => handleOpenApplyModal(selectedOBSP, level)}
                    >
                      {!level.is_eligible ? 'Requirements not met' : 
                       isLevelApplied(selectedOBSP, level) ? 'Already Applied' : 'Apply for this pack'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
    </div>
        )}
      </Modal>

      {/* New Apply Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg text-xl"
              style={{ 
                backgroundColor: `${selectedOBSP ? getCategoryColor(selectedOBSP.category.name) : '#00D4AA'}20`,
                color: selectedOBSP ? getCategoryColor(selectedOBSP.category.name) : '#00D4AA'
              }}
            >
              {selectedOBSP ? getCategoryIcon(selectedOBSP.category.name) : <CodeOutlined />}
            </div>
            <div>
              <Title level={3} className="!text-text-light mb-0">
                Apply for {selectedOBSP?.title}
              </Title>
              <Text className="text-text-secondary">
                {selectedLevel?.name} Level
              </Text>
            </div>
          </div>
        }
        open={applyModalVisible}
        onCancel={() => setApplyModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setApplyModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleSubmitApplication}
            className="bg-freelancer-accent border-none"
          >
            Apply for this pack
          </Button>
        ]}
        width={600}
        className="obsp-modal"
      >
        {selectedOBSP && selectedLevel && (
          <div className="space-y-6">
            {/* Project Summary */}
            <div className="bg-freelancer-bg-card/50 rounded-lg p-4 border border-white/10">
              <Title level={4} className="!text-text-light mb-3">
                Project Summary
              </Title>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text className="text-text-secondary text-sm">Project:</Text>
                  <div className="text-text-light font-semibold">{selectedOBSP.title}</div>
                </div>
                <div>
                  <Text className="text-text-secondary text-sm">Level:</Text>
                  <div className="text-text-light font-semibold">{selectedLevel.name}</div>
                </div>
                <div>
                  <Text className="text-text-secondary text-sm">Budget:</Text>
                  <div className="text-freelancer-accent font-semibold">₹{selectedLevel.price}</div>
                </div>
                <div>
                  <Text className="text-text-secondary text-sm">Duration:</Text>
                  <div className="text-text-light">{selectedLevel.duration}</div>
                </div>
              </div>
            </div>

            {/* Eligibility Status */}
            <div className="bg-freelancer-bg-card/50 rounded-lg p-4 border border-white/10">
              <Title level={4} className="!text-text-light mb-3">
                Your Eligibility
              </Title>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedLevel.is_eligible 
                    ? 'bg-green-500/20 text-green-500' 
                    : 'bg-red-500/20 text-red-500'
                }`}>
                  {selectedLevel.is_eligible ? (
                    <CheckCircleOutlined className="text-sm" />
                  ) : (
                    <LockOutlined className="text-sm" />
                  )}
                </div>
                <div>
                  <div className={`font-semibold ${selectedLevel.is_eligible ? 'text-green-500' : 'text-red-400'}`}>
                    {selectedLevel.is_eligible ? 'Eligible' : 'Not Eligible'}
                  </div>
                  <div className="text-text-secondary text-sm">
                    Score: {selectedLevel.score}
                  </div>
                </div>
              </div>
            </div>

            {/* Application Note */}
            <div>
              <Title level={4} className="!text-text-light mb-3">
                Application Note
              </Title>
              <Paragraph className="text-text-secondary">
                By clicking "Apply for this pack", you confirm that you have the required skills and experience 
                to deliver this project successfully. Your application will be reviewed by our team.
              </Paragraph>
            </div>
          </div>
        )}
      </Modal>

      {/* Enhanced Premium CSS */}
      <style>{`
        .obsp-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        .obsp-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
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
          border-color: var(--freelancer-accent) !important;
          background: rgba(255, 255, 255, 0.12) !important;
        }
        .custom-select.ant-select-focused .ant-select-selector {
          border-color: var(--freelancer-accent) !important;
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
          color: var(--freelancer-accent) !important;
        }
        .custom-dropdown .ant-select-item-option-active {
          background: rgba(255, 255, 255, 0.05) !important;
        }
        .ant-card, .ant-card-body {
          background: transparent !important;
          border: none !important;
        }
        .ant-card-head {
          color: var(--text-light) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .ant-card-head-title {
          color: var(--text-light) !important;
        }
        .ant-modal-content {
          background: var(--freelancer-bg-card) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 16px !important;
        }
        .ant-modal-header {
          background: transparent !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          padding: 24px 24px 16px !important;
        }
        .ant-modal-title {
          color: var(--text-light) !important;
        }
        .ant-modal-body {
          background: transparent !important;
          padding: 24px !important;
        }
        .ant-modal-close {
          color: var(--text-secondary) !important;
        }
        .ant-modal-close:hover {
          color: var(--freelancer-accent) !important;
        }
        .ant-statistic-title {
          color: var(--text-light) !important;
        }
        .ant-statistic-content {
          color: var(--text-light) !important;
        }
        .ant-tag {
          color: var(--text-light) !important;
        }
        .ant-badge-ribbon {
          color: #fff !important;
        }
        .ant-btn {
          color: var(--text-light) !important;
        }
        .ant-btn[disabled] {
          color: var(--text-muted) !important;
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        .ant-btn-primary {
          background: var(--freelancer-accent) !important;
          border-color: var(--freelancer-accent) !important;
          color: #fff !important;
        }
        .ant-btn-primary:hover {
          background: var(--freelancer-accent-dark) !important;
          border-color: var(--freelancer-accent-dark) !important;
        }
        .ant-btn-primary[disabled] {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
          color: var(--text-muted) !important;
        }
      `}</style>
    </div>
  );
};

export default ListOfObsps;

