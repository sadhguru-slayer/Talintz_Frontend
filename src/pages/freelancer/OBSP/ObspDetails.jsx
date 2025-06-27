import React, { useState, useEffect } from 'react';
import { 
  Card, Col, Row, Progress, Badge, Button, Tag, Statistic, 
  Modal, Divider, Typography, Tabs, Space, Breadcrumb, message
} from 'antd';
import { 
  TrophyOutlined, LockOutlined, UnlockOutlined, CheckCircleOutlined,
  ClockCircleOutlined, StarOutlined, CrownOutlined,
  RocketOutlined, ThunderboltOutlined,
  GiftOutlined, CodeOutlined, MobileOutlined, 
  RobotOutlined, RiseOutlined, FilterOutlined,
  DownOutlined, BulbOutlined, HeartOutlined,
  ArrowLeftOutlined, HomeOutlined, FileTextOutlined, LoadingOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import axios from 'axios';
import Cookies from 'js-cookie';

const { Title, Text, Paragraph } = Typography;

const ObspDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  
  const [obspData, setObspData] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('easy');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eligibilityAnalysis,setEligibilityAnalysis] = useState({})
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [applyingLevel, setApplyingLevel] = useState(null);

  // Fetch OBSP data from backend using the ID
  useEffect(() => {
    const fetchObspData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`https://talintzbackend-production.up.railway.app/api/freelancer/obsps/${id}/`, {
          headers: {
            'Authorization': `Bearer ${Cookies.get('accessToken')}`
          }
        });
        if (response.data && response.data.success) {
          setObspData(response.data.data.obsp);
          setEligibilityAnalysis(response.data.data.eligibility_analysis)

          // Set the first available level as default
          if (response.data.data.eligibility_analysis) {

            const availableLevels = Object.keys(response.data.data.eligibility_analysis).filter(
              level => response.data.data.eligibility_analysis[level].is_eligible
            );
            if (availableLevels.length > 0) {
              setSelectedLevel(availableLevels[0]);
            }
          }
        } else {
          setError('Failed to load OBSP data');
          message.error('Failed to load OBSP details');
        }
      } catch (error) {
        console.error('Error fetching OBSP data:', error);
        setError(error.response?.data?.error || 'Failed to load OBSP details');
        message.error('Failed to load OBSP details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchObspData();
    }
  }, [id]);

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

  // Helper to render proof JSON in a readable way
  const renderProof = (proof) => {
    if (!proof || Object.keys(proof).length === 0) {
      return <div className="text-text-secondary italic">No detailed requirements available for this level.</div>;
    }

    // Exclude 'detailed_breakdown' and 'proof' keys
    const filteredEntries = Object.entries(proof).filter(
      ([key]) => key !== 'detailed_breakdown' && key !== 'proof' && key !== 'is_eligible'
    );

    return (
      <div className="space-y-4">
        {filteredEntries.map(([key, value]) => (
          <div key={key}>
            <Text strong className="!text-text-light block mb-1 capitalize">
              {key.replace(/_/g, ' ')}:
            </Text>
            {typeof value === 'object' && value !== null ? (
              <ul className="ml-4 space-y-1">
                {Object.entries(value).map(([subKey, subValue]) => (
                  <li key={subKey} className="text-text-muted text-sm !capitalize">
                    <span className="font-medium">{subKey.replace(/_/g, ' ')}:</span> {String(subValue)}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-text-muted !capitalize">{String(value)}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Open the modal for a level
  const handleOpenApplyModal = (levelKey) => {
    setApplyingLevel(levelKey);
    setApplyModalVisible(true);
  };

  // Submit the application
  const handleSubmitApplication = async () => {
    if (!obspData || !applyingLevel) {
      message.error('Missing application data');
      return;
    }
    const selectedLevelValue = applyingLevel;
    const requestData = {
      obsp_template_id: obspData.id,
      selected_level: selectedLevelValue,
      pitch: `I am interested in working on the ${obspData.title} project at ${selectedLevelValue} level. I have the required skills and experience to deliver high-quality results.`
    };
    try {
      const response = await axios.post('https://talintzbackend-production.up.railway.app/api/freelancer/obsp/apply/', requestData, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data.success) {
        message.success('Application submitted successfully!');
        setApplyModalVisible(false);
        window.location.reload(); // or re-fetch data
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoadingOutlined className="text-4xl text-freelancer-accent mb-4" />
          <Text className="!text-text-secondary">Loading OBSP details...</Text>
        </div>
      </div>
    );
  }

  if (error || !obspData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 mx-auto mb-4 flex items-center justify-center">
            <FileTextOutlined className="text-2xl text-red-500" />
          </div>
          <Text className="!text-text-secondary">{error || 'OBSP not found'}</Text>
          <div className="mt-4">
            <Button 
              type="primary" 
              onClick={() => navigate('/freelancer/obsp/list')}
              className="bg-freelancer-accent border-none"
            >
              Back to OBSP List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-freelancer-primary min-h-screen overflow-y-auto custom-scrollbar">
      {/* Breadcrumb Navigation - Fixed Alignment */}
      <div className="mb-6">
        <Breadcrumb 
          separator={<span className="!text-text-secondary mx-2">/</span>}
          className="flex items-center"
        >
          <Breadcrumb.Item>
            <Button 
              type="link" 
              className="!text-text-light hover:text-freelancer-accent p-0 h-auto border-none shadow-none"
              onClick={() => navigate('/freelancer/obsp/list')}
            >
              <HomeOutlined className="mr-1" /> 
              OBSP Packs
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Button 
              type="link" 
              className="!text-text-light hover:text-freelancer-accent p-0 h-auto border-none shadow-none"
              onClick={() => navigate('/freelancer/obsp/list')}
            >
              {obspData.industry}
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <span className="!text-text-secondary">{obspData.title}</span>
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      {/* Header Section - Improved Layout */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-freelancer-bg-card rounded-xl shadow-lg p-8 relative overflow-hidden border border-white/10 mb-8"
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-freelancer-accent/10 rounded-full -mr-48 -mt-48 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-freelancer-secondary/10 rounded-full -ml-32 -mb-32 blur-xl"></div>
        
        <div className="relative">
          {/* Main Header Content */}
          <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
            {/* Left Side - Icon and Info */}
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div 
                  className="p-4 rounded-xl text-3xl flex-shrink-0"
                  style={{ 
                    backgroundColor: `${getCategoryColor(obspData.category)}20`,
                    color: getCategoryColor(obspData.category) 
                  }}
                >
                  {getCategoryIcon(obspData.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <Title level={1} className="!text-text-light mb-3 font-bold tracking-wide break-words">
                    {obspData.title}
                  </Title>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <Tag color={getCategoryColor(obspData.category)} className="text-sm font-medium">
                      {obspData.category}
                    </Tag>
                    <Tag color="blue" className="text-sm font-medium">
                      {obspData.industry}
                    </Tag>
                  </div>
                  <div className="h-1 w-16 bg-freelancer-accent rounded-full"></div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <Paragraph className="!text-text-secondary text-lg leading-relaxed mb-0">
                  {obspData.description}
                </Paragraph>
              </div>
            </div>

            {/* Right Side - Quick Stats */}
            <div className="lg:flex-shrink-0 lg:w-64">
              <div className="grid grid-cols-1 gap-4">
                <div className="text-center p-4 bg-freelancer-bg-card/50 rounded-lg border border-white/10">
                  <Text className="text-freelancer-accent font-bold text-lg block">
                    {obspData.price_range ? `₹${obspData.price_range.min}K - ₹${obspData.price_range.max}K` : 'N/A'}
                  </Text>
                  <Text className="!text-text-secondary text-sm">
                    Budget Range
                  </Text>
                </div>
                <div className="text-center p-4 bg-freelancer-bg-card/50 rounded-lg border border-white/10">
                  <Text className="text-freelancer-accent font-bold text-lg block">
                    {obspData.is_active ? 'Active' : 'Inactive'}
                  </Text>
                  <Text className="!text-text-secondary text-sm">
                    Status
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Levels Section - Improved Layout */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-white/10 bg-gradient-to-br from-freelancer-secondary/40 to-freelancer-bg-dark/30 backdrop-blur-xl shadow-xl"
      >
        <div className="p-6">
          {/* Section Header */}
          <div className="mb-6">
            <Title level={3} className="!text-text-light mb-2 font-semibold">
              Project Levels & Eligibility
            </Title>
            <Text className="!text-text-secondary">
              Review your eligibility for each project level
            </Text>
          </div>

          {/* Tabs */}
          <Tabs 
            defaultActiveKey="easy" 
            onChange={setSelectedLevel}
            className="custom-tabs"
            tabBarStyle={{
              margin: 0,
              padding: isMobile ? '12px 16px 0' : '16px 24px 0',
              background: 'transparent',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {['easy', 'medium', 'hard'].map((level) => {
              const levelData = eligibilityAnalysis[level] || {};
              const isEligible = levelData.is_eligible || false;
              const isApplied = levelData.is_applied || false;
              return (
                <Tabs.TabPane 
                  key={level} 
                  tab={
                    <div className="flex items-center gap-2">
                      {isEligible ? (
                        <UnlockOutlined className="text-green-500" />
                      ) : (
                        <LockOutlined className="!text-text-muted" />
                      )}
                      <span className="!text-text-light font-medium capitalize">{level}</span>
                    </div>
                  }
                >
                  <div className="mt-6">
                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      {/* Eligibility Details Card */}
                      <Card 
                        title={
                          <span className="!text-text-light font-semibold flex items-center gap-2">
                            <CheckCircleOutlined className="text-freelancer-accent" />
                            Eligibility Status
                          </span>
                        }
                        className="bg-freelancer-bg-card/90 border border-white/10 shadow-md h-fit"
                        bodyStyle={{ background: "transparent", padding: "20px" }}
                      >
                        <div className="space-y-4">
                          <div>
                            <Text strong className="!text-text-light block mb-1">Status:</Text>
                            <div className={`font-semibold text-lg ${isEligible ? 'text-green-500' : 'text-red-400'}`}>
                              {isEligible ? 'Eligible' : 'Not Eligible'}
                            </div>
                          </div>
                          <div>
                            <Text strong className="!text-text-light block mb-1">Score:</Text>
                            <div className="text-freelancer-accent font-semibold text-lg">
                              {levelData.score || 0}/100
                            </div>
                          </div>
                          {levelData.reasons && levelData.reasons.length > 0 && (
                            <div>
                              <Text strong className="!text-text-light block mb-1">Reasons:</Text>
                              <ul className="space-y-2">
                                {levelData.reasons.map((reason, idx) => (
                                  <li key={idx} className="text-text-secondary text-sm">
                                    • {reason}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </Card>

                      {/* Requirements Card */}
                      <Card 
                        title={
                          <span className="!text-text-light font-semibold flex items-center gap-2">
                            <FileTextOutlined className="text-freelancer-accent" />
                            Requirements
                          </span>
                        }
                        className="bg-freelancer-bg-card/90 border border-white/10 shadow-md h-fit"
                        bodyStyle={{ background: "transparent", padding: "20px" }}
                      >
                        {renderProof(levelData.proof)}
                      </Card>
                    </div>

                    {/* Action Buttons - Centered */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Button 
                        type="primary" 
                        size="large"
                        disabled={!isEligible || isApplied}
                        className={
                          isEligible && !isApplied
                            ? 'bg-freelancer-accent text-white hover:bg-freelancer-accent/90 border-none shadow-lg min-w-48'
                            : 'bg-freelancer-secondary/20 !text-text-muted hover:bg-freelancer-secondary/30 border-white/20 min-w-48'
                        }
                        icon={
                          isEligible
                            ? isApplied
                              ? <CheckCircleOutlined />
                              : <CheckCircleOutlined />
                            : <LockOutlined />
                        }
                        onClick={() => {
                          if (isEligible && !isApplied) {
                            handleOpenApplyModal(level);
                          }
                        }}
                      >
                        {isEligible
                          ? isApplied
                            ? 'Already Applied'
                            : 'Apply for This Level'
                          : 'Requirements Not Met'}
                      </Button>
                      
                      <Button 
                        type="default" 
                        size="large"
                        className="!text-text-secondary border-white/20 hover:bg-white/10 min-w-32"
                        onClick={() => navigate('/freelancer/obsp/list')}
                      >
                        <ArrowLeftOutlined className="mr-2" /> 
                        Back to List
                      </Button>
                    </div>
                  </div>
                </Tabs.TabPane>
              );
            })}
          </Tabs>
        </div>
      </motion.div>

      {/* Enhanced CSS */}
      <style jsx global>{`
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
          background: var(--freelancer-secondary) !important;
          color: #fff !important;
          border-color: var(--freelancer-accent) !important;
          box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10);
        }
        .custom-tabs .ant-tabs-ink-bar {
          background: var(--freelancer-accent) !important;
          height: 4px !important;
          border-radius: 2px !important;
        }
        .custom-tabs .ant-tabs-tab-btn {
          color: var(--text-light) !important;
        }
        .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #fff !important;
        }
        .ant-card, .ant-card-body {
          background: transparent !important;
          border: none !important;
        }
        .ant-card-head {
          color: var(--text-light) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          padding: 16px 20px 12px !important;
        }
        .ant-card-head-title {
          color: var(--text-light) !important;
        }
        .ant-breadcrumb {
          color: var(--text-light) !important;
        }
        .ant-breadcrumb-link {
          color: var(--text-light) !important;
        }
        .ant-breadcrumb-separator {
          color: var(--text-secondary) !important;
        }
        .ant-btn-link {
          color: var(--text-light) !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .ant-btn-link:hover {
          color: var(--freelancer-accent) !important;
          background: transparent !important;
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
        .ant-tabs-content-holder {
          padding: 0 !important;
        }
        .ant-tabs-tabpane {
          padding: 0 !important;
        }
      `}</style>

      <Modal
        title={
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg text-xl"
              style={{ 
                backgroundColor: `${getCategoryColor(obspData.category)}20`,
                color: getCategoryColor(obspData.category)
              }}
            >
              {getCategoryIcon(obspData.category)}
            </div>
            <div>
              <Title level={3} className="!text-text-light mb-0">
                Apply for {obspData?.title}
              </Title>
              <Text className="text-text-secondary">
                {applyingLevel && <span className="capitalize">{applyingLevel} Level</span>}
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
        {obspData && applyingLevel && (
          <div className="space-y-6">
            {/* Project Summary */}
            <div className="bg-freelancer-bg-card/50 rounded-lg p-4 border border-white/10">
              <Title level={4} className="!text-text-light mb-3">
                Project Summary
              </Title>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text className="text-text-secondary text-sm">Project:</Text>
                  <div className="text-text-light font-semibold">{obspData.title}</div>
                </div>
                <div>
                  <Text className="text-text-secondary text-sm">Level:</Text>
                  <div className="text-text-light font-semibold capitalize">{applyingLevel}</div>
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
    </div>
  );
};

export default ObspDetails;
