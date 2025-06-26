import React, { useState, useMemo, useCallback, lazy, Suspense, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, Col, Row, Button, Tag, Statistic, Modal, Divider, Typography, 
  Radio, Space, Badge, Progress, Avatar, message, Select,
  Breadcrumb, Tabs, Table, Collapse, Skeleton
} from 'antd';
import { 
  ShoppingCartOutlined, DollarOutlined, ClockCircleOutlined,
  StarOutlined, CrownOutlined, RocketOutlined, ThunderboltOutlined,
  GiftOutlined, CodeOutlined, MobileOutlined, RobotOutlined,
  RiseOutlined, FilterOutlined, DownOutlined, BulbOutlined,
  HeartOutlined, CheckCircleOutlined, PlusOutlined, MinusOutlined,
  ShoppingOutlined, FileTextOutlined, TeamOutlined, CloseOutlined,
  ArrowLeftOutlined, HomeOutlined, EyeOutlined, InfoCircleOutlined,
  UserOutlined, TrophyOutlined, SafetyCertificateOutlined,
  QuestionCircleOutlined, MessageOutlined, CalendarOutlined,
  DollarCircleOutlined, FlagOutlined, CheckSquareOutlined,
  PlayCircleOutlined, PauseCircleOutlined, StopOutlined,
  WarningOutlined, WalletOutlined, PlusCircleOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import ScopeOptions from './ScopeOptions';
import axios from 'axios';
import Cookies from 'js-cookie';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// Lazy load heavy components
const ModalComponent = lazy(() => import('antd').then(module => ({ default: module.Modal })));

// Memoized components for better performance
const CategoryIcon = React.memo(({ category, size = 24 }) => {
  const getCategoryIcon = useCallback((cat) => {
    const icons = {
      'Web Development': <CodeOutlined />,
      'Mobile Development': <MobileOutlined />,
      'AI/ML Services': <RobotOutlined />,
      'UI/UX Design': <BulbOutlined />,
      'Logo Design': <HeartOutlined />,
      'Video Editing': <RocketOutlined />,
      'Content Creation': <GiftOutlined />,
      'Animation': <RocketOutlined />
    };
    return icons[cat] || <CodeOutlined />;
  }, []);

  return (
    <div style={{ fontSize: size }}>
      {getCategoryIcon(category)}
    </div>
  );
});

const ObspDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState('easy');
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [showScopeOptions, setShowScopeOptions] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [selectedScopeData, setSelectedScopeData] = useState(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [obspData, setObspData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [obspFields, setObspFields] = useState(null);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [purchaseEligibility, setPurchaseEligibility] = useState({});
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletHoldBalance, setWalletHoldBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);
  const [draftResponseId, setDraftResponseId] = useState(null);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftResponseData, setDraftResponseData] = useState(null);

  // Updated LevelCard with draft information
const LevelCard = React.memo(({ level, data, isSelected, onSelect }) => {
  const levelColors = {
    easy: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22C55E', border: 'rgba(34, 197, 94, 0.3)' },
    medium: { bg: 'rgba(249, 115, 22, 0.1)', text: '#F97316', border: 'rgba(249, 115, 22, 0.3)' },
    hard: { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.3)' }
  };

  const colors = levelColors[level] || levelColors.easy;
    const eligibility = purchaseEligibility[level];
    const isEligible = eligibility?.eligible !== false;
    const isBlocked = eligibility?.reason === 'already_purchased_same_level';
    const hasDraft = data.draft_info?.has_draft;

  return (
    <div
        onClick={() => onSelect(level)} // Always allow clicking to view details
      className={`
        relative p-3 rounded-xl border cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'ring-2 ring-client-accent ring-opacity-50 shadow-lg' 
          : 'hover:bg-white/5 hover:border-white/20'
        }
      `}
      style={{
        backgroundColor: isSelected ? 'rgba(0, 212, 170, 0.1)' : 'rgba(255, 255, 255, 0.02)',
        borderColor: isSelected ? '#00D4AA' : 'rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span 
            className="px-2 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
              {data.level_display}
          </span>
          <div className="text-client-accent font-bold text-lg">₹{data.price.toLocaleString()}</div>
        </div>
        <div className="font-semibold text-text-light text-sm mb-1">{data.name}</div>
          <div className="text-text-light/50 text-xs flex items-center justify-center gap-1">
          <ClockCircleOutlined className="text-client-accent" /> {data.duration}
        </div>
          
          {/* Draft Status */}
          {hasDraft && (
            <div className="mt-2">
              <Tag color="orange" className="text-xs">
                Draft Available
              </Tag>
              <div className="text-text-light/50 text-xs mt-1">
                ₹{data.draft_info.draft_price.toLocaleString()}
              </div>
            </div>
          )}
          
          {/* Eligibility Status - Show but don't prevent clicking */}
          {!isEligible && (
            <div className="mt-2">
              <Tag color="red" className="text-xs">
                {isBlocked ? 'Already Purchased' : 'Not Available'}
              </Tag>
            </div>
          )}
          
          {eligibility?.warning && (
            <div className="mt-2">
              <Tag color="orange" className="text-xs">
                Active Purchase Exists
              </Tag>
            </div>
          )}
      </div>
    </div>
  );
});

  // Fetch OBSP data
  useEffect(() => {
    const fetchObspData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://127.0.0.1:8000/api/obsp/api/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get('accessToken')}`,
            },
          }
        );
        console.log(response.data)
        
        if (response.data.success) {
          setObspData(response.data.data);
          // Set first available level as default
          const levels = response.data.data.levels;
          if (levels && Object.keys(levels).length > 0) {
            setSelectedLevel(Object.keys(levels)[0]);
          }
        } else {
          setError(response.data.error || 'Failed to fetch OBSP data');
        }
      } catch (err) {
        console.error('Error fetching OBSP data:', err);
        setError(err.response?.data?.error || 'Failed to fetch OBSP data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchObspData();
    }
  }, [id]);

  // New useEffect to fetch OBSP fields when level changes
  useEffect(() => {
    const fetchObspFields = async () => {
      if (!id || !selectedLevel) return;
      
      try {
        setFieldsLoading(true);
        const response = await axios.get(
          `http://127.0.0.1:8000/api/obsp/api/${id}/fields/${selectedLevel}/`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get('accessToken')}`,
            },
          }
        );
        
        if (response.data.success) {
          setObspFields(response.data.data.phases);
          console.log('OBSP Phases:', response.data.data.phases);
        } else {
          console.error('Failed to fetch OBSP fields:', response.data.error);
        }
      } catch (err) {
        console.error('Error fetching OBSP fields:', err);
      } finally {
        setFieldsLoading(false);
      }
    };

    fetchObspFields();
  }, [id, selectedLevel]);

  // Fetch wallet balance only when needed (not in useEffect)
  const fetchWalletBalance = useCallback(async () => {
    try {
      setWalletLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/api/finance/wallet/balance/', {
        headers: {
          Authorization: `Bearer ${Cookies.get('accessToken')}`,
        },
      });
      
      if (response.data) {
        setWalletBalance(response.data.balance || 0);
        setWalletHoldBalance(response.data.hold_balance || 0);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      message.error('Failed to fetch wallet balance');
    } finally {
      setWalletLoading(false);
    }
  }, []);

  useEffect(()=>{
  fetchWalletBalance()
}, []);

  // Memoized utility functions
  const getCategoryColor = useCallback((category) => {
    const colors = {
      'web-development': '#00D4AA',
      'mobile-development': '#6366F1',
      'ai-ml': '#F59E0B',
      'design': '#EC4899',
      'marketing': '#8B5CF6',
      'content': '#10B981',
      'video': '#EF4444',
      'animation': '#F97316'
    };
    return colors[category] || '#00D4AA';
  }, []);

  // Memoized computed values
  const selectedLevelData = useMemo(() => {
    if (!obspData?.levels) return null;
    return obspData.levels[selectedLevel];
  }, [obspData, selectedLevel]);

  const minPrice = useMemo(() => {
    if (!obspData?.levels) return 0;
    return Math.min(...Object.values(obspData.levels).map(level => level.price));
  }, [obspData]);

  const categoryColor = useMemo(() => {
    if (!obspData?.category) return '#00D4AA';
    return getCategoryColor(obspData.category);
  }, [getCategoryColor, obspData]);

  // Function to check purchase eligibility
  const checkPurchaseEligibility = useCallback(async (level) => {
    if (!id || !level) return;
    
    try {
      setCheckingEligibility(true);
      const response = await axios.get(
        `http://127.0.0.1:8000/api/obsp/api/${id}/check-eligibility/${level}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('accessToken')}`,
          },
        }
      );
      
      if (response.data.success) {
        setPurchaseEligibility(prev => ({
          ...prev,
          [level]: response.data
        }));
      } else {
        setPurchaseEligibility(prev => ({
          ...prev,
          [level]: { eligible: false, message: response.data.error }
        }));
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setPurchaseEligibility(prev => ({
        ...prev,
        [level]: { eligible: false, message: 'Error checking eligibility' }
      }));
    } finally {
      setCheckingEligibility(false);
    }
  }, [id]);

  // Check eligibility when level changes
  useEffect(() => {
    if (selectedLevel) {
      checkPurchaseEligibility(selectedLevel);
    }
  }, [selectedLevel, checkPurchaseEligibility]);

  // Optimized event handlers
  const handlePurchase = useCallback(async () => {
    try {
      // Create basic OBSPResponse for direct purchase
      if (id) {
        const responseData = {
          selected_level: selectedLevel,
          dynamicResponses: {},
          phaseData: {},
          totalPrice: selectedLevelData?.price || 0
        };

        const response = await axios.post(
          `http://127.0.0.1:8000/api/obsp/api/${id}/submit/`,
          responseData,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get('accessToken')}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data.success) {
          console.log('OBSPResponse created successfully:', response.data.data);
          message.success('Purchase completed successfully! Your package has been purchased.');
        } else {
          console.error('Failed to create OBSPResponse:', response.data.error);
          message.error('Purchase completed but there was an issue saving your order. Please contact support.');
        }
      }
    } catch (error) {
      console.error('Error creating OBSPResponse:', error);
      message.error('Purchase completed but there was an issue saving your order. Please contact support.');
    }
    
    setPurchaseModalVisible(false);
    navigate('/client/obsp/list');
  }, [id, selectedLevel, selectedLevelData?.price, navigate]);

  const handleStartWithPack = useCallback(async () => {
    // Always proceed with scope options, don't check wallet balance here
    setShowScopeOptions(true);
  }, []);

  // New function to fetch draft response data
  const fetchDraftResponse = useCallback(async (level) => {
    if (!id || !level) return null;
    
    try {
      setDraftLoading(true);
      const response = await axios.get(
        `http://127.0.0.1:8000/api/obsp/api/${id}/draft/${level}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('accessToken')}`,
          },
        }
      );
      
      if (response.data.success) {
        console.log('Draft response data fetched:', response.data.data);
        return response.data.data;
      } else {
        console.error('Failed to fetch draft response:', response.data.error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching draft response:', error);
      return null;
    } finally {
      setDraftLoading(false);
    }
  }, [id]);

  // Updated function to handle continue draft
  const handleContinueDraft = useCallback(async () => {
    try {
      // Fetch draft response data first
      const draftData = await fetchDraftResponse(selectedLevel);
      
      if (draftData) {
        // Store draft data in state
        setDraftResponseData(draftData);
        
        // Proceed to scope options with draft data
        setShowScopeOptions(true);
      } else {
        // No draft found, proceed normally
        setShowScopeOptions(true);
      }
    } catch (error) {
      console.error('Error continuing draft:', error);
      message.error('Failed to load draft data. Starting fresh configuration.');
      setShowScopeOptions(true);
    }
  }, [selectedLevel, fetchDraftResponse]);

  const handleScopeConfirm = useCallback((scopeData, needsPayment = false) => {
    console.log('Scope configuration:', scopeData);
    console.log('Dynamic field responses:', scopeData.dynamicResponses);
    setSelectedScopeData(scopeData);
    
    if (needsPayment) {
      setPaymentModalVisible(true);
      setShowScopeOptions(false);
    } else {
      setShowScopeOptions(false);
      setPurchaseModalVisible(true);
    }
  }, []);

  const handleScopeBack = useCallback(() => {
    setShowScopeOptions(false);
  }, []);

  const handleLevelSelect = useCallback((level) => {
    setSelectedLevel(level);
  }, []);

  // Updated payment handler with draft ID from level data
  const handlePaymentComplete = useCallback(async () => {
    // Check eligibility before proceeding
    const eligibility = purchaseEligibility[selectedLevel];
    if (!eligibility?.eligible) {
      message.error(eligibility?.message || 'You are not eligible to purchase this package level.');
      return;
    }

    setPaymentLoading(true);
    try {
      // Calculate total amount
      const basePrice = selectedLevelData?.price || 0;
      const totalAddOns = selectedScopeData ? Object.values(selectedScopeData.phaseData).reduce((total, data) => {
        if (data.phaseImpacts && typeof data.phaseImpacts === 'object') {
          return total + Object.values(data.phaseImpacts).reduce((sum, impact) => sum + (impact || 0), 0);
        }
        return total;
      }, 0) : 0;
      const totalAmount = basePrice + totalAddOns;

      // Atomic wallet balance check - fresh API call
      const walletResponse = await axios.get('http://127.0.0.1:8000/api/finance/wallet/balance/', {
        headers: {
          Authorization: `Bearer ${Cookies.get('accessToken')}`,
        },
      });
      console.log(walletResponse.status)
       // Check if the request was successful (status 200-299)
    if (walletResponse.status < 200 || walletResponse.status >= 300) {
      throw new Error(`Failed to fetch wallet balance. Status: ${walletResponse.status}`);
    }
      const currentBalance = walletResponse.data.balance || 0;
      const currentHoldBalance = walletResponse.data.hold_balance || 0;
      const availableBalance = currentBalance - currentHoldBalance;
      
      if (availableBalance < totalAmount) {
        // Insufficient funds - save to draft
        const responseData = {
          selected_level: selectedLevel,
          dynamicResponses: selectedScopeData?.dynamicResponses || {},
          phaseData: selectedScopeData?.phaseData || {},
          totalPrice: totalAmount,
          status: 'draft',
          draft_id: selectedLevelData?.draft_info?.draft_id || selectedScopeData?.draftId || null
        };

        const response = await axios.post(
          `http://127.0.0.1:8000/api/obsp/api/${id}/submit/`,
          responseData,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get('accessToken')}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data.success) {
          setDraftResponseId(response.data.data.response_id);
          setPaymentModalVisible(false);
          message.success(
            `Your purchase has been saved as draft! Please add ₹${(totalAmount - availableBalance).toLocaleString()} to your wallet to complete the purchase.`
          );
        } else {
          message.error('Failed to save draft purchase');
        }
        setPaymentLoading(false);
        return;
      }

      // Sufficient funds - proceed with normal purchase
      if (selectedScopeData && id) {
        const responseData = {
          selected_level: selectedLevel,
          dynamicResponses: selectedScopeData.dynamicResponses || {},
          phaseData: selectedScopeData.phaseData || {},
          totalPrice: totalAmount,
          wallet_payment: true,
          draft_id: selectedLevelData?.draft_info?.draft_id || selectedScopeData?.draftId || null
        };

        const response = await axios.post(
          `http://127.0.0.1:8000/api/obsp/api/${id}/submit/`,
          responseData,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get('accessToken')}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log(response)

        if (response.data.success) {
          console.log('OBSPResponse created successfully:', response.data.data);
          setPaymentModalVisible(false);
          setIsPurchased(true);
          message.success('Payment completed successfully! Your package has been purchased and configured.');
          
          // Update wallet balance after successful purchase
          setWalletBalance(currentBalance - totalAmount);
        } else {
          console.error('Failed to create OBSPResponse:', response.data.error);
          if (response.data.blocked) {
            message.error(response.data.error);
            setPaymentModalVisible(false);
            setShowScopeOptions(true);
          } else {
            message.error('Payment completed but there was an issue saving your configuration. Please contact support.');
          }
        }
      } else {
        // Fallback if no scope data
    setPaymentModalVisible(false);
    setIsPurchased(true);
    message.success('Payment completed successfully! Your package has been purchased.');
      }
    } catch (error) {
      console.error('Error creating OBSPResponse:', error);
      if (error.response?.data?.blocked) {
        message.error(error.response.data.error);
        setPaymentModalVisible(false);
        setShowScopeOptions(true);
      } else {
        // Still complete the purchase even if response creation fails
        setPaymentModalVisible(false);
        setIsPurchased(true);
        message.success('Payment completed successfully! Your package has been purchased.');
        message.warning('There was an issue saving your configuration. Please contact support.');
      }
    } finally {
      setPaymentLoading(false);
    }
  }, [selectedScopeData, id, selectedLevel, selectedLevelData, purchaseEligibility, walletBalance, walletHoldBalance]);

  const handlePaymentCancel = useCallback(() => {
    setPaymentModalVisible(false);
    setShowScopeOptions(true);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="bg-client-primary min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-client-accent mx-auto mb-4"></div>
          <Text className="text-text-light">Loading OBSP details...</Text>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-client-primary min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <Title level={3} className="!text-text-light mb-2">Error Loading OBSP</Title>
          <Text className="text-text-light/50 mb-4">{error}</Text>
          <Button 
            type="primary" 
            onClick={() => window.location.reload()}
            className="bg-client-accent"
          >
            Try Again
          </Button>
          </div>
        </div>
    );
  }

  // No data state
  if (!obspData) {
    return (
      <div className="bg-client-primary min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-text-light/50 text-6xl mb-4">📄</div>
          <Title level={3} className="!text-text-light mb-2">OBSP Not Found</Title>
          <Text className="text-text-light/50 mb-4">The requested OBSP template could not be found.</Text>
          <Button 
            type="default" 
            onClick={() => navigate('/client/obsp/list')}
            className="bg-white/10 border-white/20 text-text-light"
          >
            Back to OBSP List
          </Button>
    </div>
      </div>
    );
  }

  return (
    <div className="bg-client-primary min-h-screen overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="my-4 sm:my-6"
        >
          <div className="flex items-center justify-start">
            <Breadcrumb className="text-text-light">
              <Breadcrumb.Item>
                <Button 
                  type="text" 
                  icon={<HomeOutlined />} 
                  className="text-text-light hover:text-client-accent transition-colors duration-300 flex items-center"
                  onClick={() => navigate('/client/homepage')}
                >
                  Home
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Button 
                  type="text" 
                  className="text-text-light hover:text-client-accent transition-colors duration-300 flex items-center"
                  onClick={() => navigate('/client/obsp/list')}
                >
                  OBSP Packs
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <span className="text-text-light/50 flex items-center">{obspData.title}</span>
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </motion.div>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <Card className="bg-client-bg-card border border-white/10 shadow-xl">
            <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-6">
              {/* Icon */}
              <div 
                className="p-4 lg:p-5 rounded-xl lg:rounded-2xl text-2xl lg:text-3xl shadow-lg border border-white/20"
                style={{ 
                  backgroundColor: `${categoryColor}15`,
                  color: categoryColor,
                  boxShadow: `0 4px 20px ${categoryColor}20`
                }}
              >
                <CategoryIcon category={obspData.category_display} size={32} />
              </div>
              
              <div className="flex-1">
                <Title level={2} className="!text-text-light mb-2 font-bold text-xl sm:text-2xl lg:text-3xl leading-tight">
                  {obspData.title}
                </Title>
                <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-3">
                  <Tag 
                    color={categoryColor} 
                    className="text-xs lg:text-sm font-semibold border-0 shadow-sm"
                    style={{ 
                      backgroundColor: `${categoryColor}20`,
                      color: categoryColor
                    }}
                  >
                    {obspData.industry_display}
                  </Tag>
                  </div>
                <Paragraph className="text-text-light/50 text-sm lg:text-base leading-relaxed">
                  {obspData.description}
                </Paragraph>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 lg:gap-4 mt-4 lg:mt-6">
              <div className="text-center p-2 lg:p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-text-light font-bold text-sm lg:text-lg mb-1">
                  {Object.keys(obspData.levels).length}
                </div>
                <div className="text-text-light/50 text-xs">
                  Levels
                </div>
              </div>
              <div className="text-center p-2 lg:p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-text-light font-bold text-sm lg:text-lg mb-1">
                  {obspData.currency}
                </div>
                <div className="text-text-light/50 text-xs">
                  Currency
                </div>
              </div>
              <div className="text-center p-2 lg:p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-text-light font-bold text-sm lg:text-lg mb-1">
                  ₹{minPrice.toLocaleString()}
                </div>
                <div className="text-text-light/50 text-xs">
                  Starting
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Level Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6 sm:mb-8"
        >
          <Card className="bg-client-bg-card border border-white/10 shadow-xl">
            <div className="mb-4 text-center">
              <Title level={3} className="!text-text-light mb-2">Choose Your Package Level</Title>
              <Text className="text-text-light/50 text-sm lg:text-base">
                Select the level that best matches your requirements and budget
              </Text>
            </div>

            {/* Level Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {Object.entries(obspData.levels).map(([key, level]) => (
                <LevelCard
                  key={key}
                  level={key}
                  data={level}
                  isSelected={selectedLevel === key}
                  onSelect={handleLevelSelect}
                />
              ))}
            </div>

            {/* Selected Level Details */}
            {selectedLevelData && (
            <motion.div
              key={selectedLevel}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 rounded-xl p-4 lg:p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                  <Title level={4} className="!text-text-light mb-0">{selectedLevelData.name}</Title>
                <Tag 
                  color={selectedLevel === 'easy' ? 'green' : selectedLevel === 'medium' ? 'orange' : 'red'}
                  className="text-xs font-semibold"
                >
                    {selectedLevelData.level_display}
                </Tag>
              </div>

                {/* Price and Duration */}
              <div className="bg-gradient-to-r from-client-accent/10 to-client-secondary/10 rounded-lg p-4 border border-white/10 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="text-client-accent font-bold text-2xl lg:text-3xl mb-1">
                        ₹{selectedLevelData.price.toLocaleString()}
                    </div>
                    <div className="text-text-light/50 text-sm">One-time payment</div>
                  </div>
                  <div className="flex items-center gap-2 text-text-light">
                    <ClockCircleOutlined className="text-client-accent" />
                      <span className="font-semibold text-sm lg:text-base">Delivery in {selectedLevelData.duration}</span>
                  </div>
                </div>
              </div>

                {/* Features and Deliverables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Features */}
                <div>
                  <Title level={5} className="!text-text-light mb-3 flex items-center gap-2">
                    <CheckCircleOutlined className="text-client-accent" />
                    What's Included
                  </Title>
                  <div className="space-y-2">
                      {selectedLevelData.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-white/5 rounded-lg p-2 border border-white/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-client-accent mt-2 flex-shrink-0"></div>
                        <Text className="text-text-light/50 text-sm">{feature}</Text>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deliverables */}
                <div>
                  <Title level={5} className="!text-text-light mb-3 flex items-center gap-2">
                    <GiftOutlined className="text-client-accent" />
                    What You'll Receive
                  </Title>
                  <div className="space-y-2">
                      {selectedLevelData.deliverables.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-white/5 rounded-lg p-2 border border-white/10">
                        <div className="w-4 h-4 rounded-full bg-client-accent/20 flex items-center justify-center flex-shrink-0">
                          <GiftOutlined className="text-client-accent text-xs" />
                        </div>
                        <Text className="text-text-light/50 text-sm font-medium">{item}</Text>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
                                          {/* Milestones Section - Apple-inspired Grid Design */}
              <div className="mb-6">
                <Title level={5} className="!text-text-light mb-4 flex items-center gap-2">
                  <FlagOutlined className="text-client-accent" />
                  Project Timeline & Payment Schedule
                </Title>
                
                {selectedLevelData.milestones && selectedLevelData.milestones.length > 0 ? (
                  <div className="space-y-4">
                    {/* Milestones Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {selectedLevelData.milestones.map((milestone, idx) => (
                        <div key={milestone.id} className="group">
                          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-client-accent/30 transition-all duration-300 hover:bg-white/8">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-client-accent to-client-accent/80 flex items-center justify-center shadow-lg">
                                  <span className="text-white font-bold text-sm">{idx + 1}</span>
                                </div>
                                <div>
                                  <Text className="text-text-light font-semibold text-base block">
                                    {milestone.title}
                                  </Text>
                                  <Text className="text-text-light/50 text-xs">
                                    {milestone.milestone_type_display}
                                  </Text>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-client-accent font-bold text-lg">
                                  ₹{milestone.payout_amount.toLocaleString()}
                                </div>
                                <div className="text-text-light/50 text-xs">
                                  {milestone.payout_percentage}% of total
                                </div>
                              </div>
                            </div>
                            
                            {/* Description */}
                            <Text className="text-text-light/50 text-sm leading-relaxed mb-4 block">
                              {milestone.description}
                            </Text>
                            
                            {/* Timeline Info */}
                            <div className="flex items-center gap-4 mb-4 p-3 bg-white/5 rounded-xl">
                              <div className="flex items-center gap-2 text-text-light/50 text-xs">
                                <CalendarOutlined className="text-client-accent" />
                                <span>Day {milestone.estimated_days}</span>
                              </div>
                              <div className="flex items-center gap-2 text-text-light/50 text-xs">
                                <CheckSquareOutlined className="text-client-accent" />
                                <span>{milestone.client_approval_required ? 'Approval Required' : 'Auto Approved'}</span>
                              </div>
                            </div>
                            
                            {/* Deliverables */}
                            {milestone.deliverables && milestone.deliverables.length > 0 && (
                              <div className="mb-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <GiftOutlined className="text-client-accent text-sm" />
                                  <Text className="text-text-light text-sm font-semibold">
                                    What You'll Receive
                                  </Text>
                                </div>
                                <div className="space-y-2">
                                  {milestone.deliverables.map((deliverable, dIdx) => (
                                    <div key={dIdx} className="flex items-start gap-3 p-2 bg-white/5 rounded-lg">
                                      <div className="w-1.5 h-1.5 rounded-full bg-client-accent mt-2 flex-shrink-0"></div>
                                      <Text className="text-text-light/50 text-sm leading-relaxed">
                                        {deliverable}
                                      </Text>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Quality Checklist */}
                            {milestone.quality_checklist && milestone.quality_checklist.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <CheckCircleOutlined className="text-green-500 text-sm" />
                                  <Text className="text-text-light text-sm font-semibold">
                                    Quality Assurance
                                  </Text>
                                </div>
                                <div className="space-y-2">
                                  {milestone.quality_checklist.map((item, qIdx) => (
                                    <div key={qIdx} className="flex items-start gap-3 p-2 bg-green-500/5 rounded-lg border border-green-500/10">
                                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                                      <Text className="text-text-light/50 text-sm leading-relaxed">
                                        {item}
                                      </Text>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Project Summary Card */}
                    <div className="bg-gradient-to-r from-client-accent/10 to-client-secondary/10 rounded-2xl p-6 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-client-accent/20 border border-client-accent/30">
                            <FlagOutlined className="text-client-accent text-xl" />
                          </div>
                          <div>
                            <Text className="text-text-light font-semibold text-lg block">
                              Project Overview
                            </Text>
                            <Text className="text-text-light/50 text-sm">
                              {selectedLevelData.milestones.length} phases • {selectedLevelData.milestones[selectedLevelData.milestones.length - 1]?.estimated_days || 0} days total
                            </Text>
                          </div>
                        </div>
                        <div className="text-right">
                          <Text className="text-text-light font-semibold text-base block">Total Investment</Text>
                          <Text className="text-client-accent font-bold text-2xl">
                            ₹{selectedLevelData.price.toLocaleString()}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-12 bg-white/5 rounded-2xl border border-white/10">
                    <div className="text-text-light/50 text-6xl mb-6">📋</div>
                    <Text className="text-text-light/50 text-lg font-medium block mb-3">
                      Timeline Coming Soon
                    </Text>
                    <Text className="text-text-light/50 text-sm max-w-md mx-auto">
                      Our team is setting up the detailed project timeline and milestones for this package.
                    </Text>
                  </div>
                )}
              </div>
            </motion.div>
            )}

            {/* Purchase Button - Updated with draft information from level data */}
            <div className="mt-6 text-center">
              {isPurchased ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CheckCircleOutlined className="text-green-500 text-xl" />
                      <Text className="text-green-500 font-semibold text-lg">Package Purchased!</Text>
                    </div>
                    <Text className="text-text-light/50 text-sm">
                      Your package is ready. Our team will contact you within 24 hours.
                    </Text>
                  </div>
                  <Button
                    type="default"
                    size="large"
                    className="bg-white/10 hover:bg-white/20 border-white/20 text-text-light px-8"
                    onClick={() => navigate('/client/obsp/list')}
                  >
                    View All Packages
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Wallet Balance Display */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <WalletOutlined className="text-client-accent" />
                        <Text className="text-text-light font-medium">Wallet Balance</Text>
                      </div>
                      <div className="text-right">
                        <Text className="text-client-accent font-bold text-lg">
                          ₹{walletBalance.toLocaleString()}
                        </Text>
                        {walletHoldBalance > 0 && (
                          <Text className="text-text-light/50 text-xs block">
                            Hold: ₹{walletHoldBalance.toLocaleString()}
                          </Text>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Text className="text-text-light/50 text-sm">Available Balance</Text>
                      <Text className="text-text-light font-semibold">
                        ₹{(walletBalance - walletHoldBalance).toLocaleString()}
                      </Text>
                    </div>
                  </div>

                  {/* Conditional Button Based on Eligibility and Draft Status */}
                  {purchaseEligibility[selectedLevel] && !purchaseEligibility[selectedLevel].eligible ? (
                    <div className="space-y-4">
                      {/* Eligibility Warning */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <WarningOutlined className="text-red-500 text-xl" />
                          <Text className="text-red-500 font-semibold text-lg">Purchase Not Available</Text>
                        </div>
                        <Text className="text-text-light/50 text-sm">
                          {purchaseEligibility[selectedLevel].message}
                        </Text>
                      </div>
                      
                      {/* Alternative Actions */}
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {purchaseEligibility[selectedLevel].existing_response && (
                          <Button
                            type="primary"
                            size="large"
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none shadow-lg hover:shadow-xl px-8"
                            onClick={() => navigate('/client/workspace')}
                            icon={<EyeOutlined />}
                          >
                            View in Workspace
                          </Button>
                        )}
                        
                        <Button
                          type="default"
                          size="large"
                          className="bg-white/10 hover:bg-white/20 border-white/20 text-text-light px-8"
                          onClick={() => navigate('/client/obsp/list')}
                          icon={<ArrowLeftOutlined />}
                        >
                          Try Different Level
                        </Button>
                      </div>
                    </div>
                  ) : selectedLevelData?.draft_info?.has_draft ? (
                    /* Draft exists for this level - Show continue purchase button */
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <FileTextOutlined className="text-orange-500 text-xl" />
                          <Text className="text-orange-500 font-semibold text-lg">Draft Configuration Found</Text>
                        </div>
                        <Text className="text-text-light/50 text-sm">
                          You have a saved configuration for this level. Continue where you left off.
                        </Text>
                        <div className="mt-2 text-center">
                          <Text className="text-text-light/70 text-xs">
                            Draft Price: ₹{selectedLevelData.draft_info.draft_price.toLocaleString()}
                          </Text>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          type="primary"
                          size="large"
                          className="bg-gradient-to-r from-client-accent to-client-accent/90 text-white border-none shadow-lg hover:shadow-xl px-8"
                          onClick={handleContinueDraft}
                          icon={<FileTextOutlined />}
                          loading={draftLoading}
                        >
                          {draftLoading ? 'Loading Draft...' : 'Continue Draft'}
                        </Button>
                        
                        <Button
                          type="default"
                          size="large"
                          className="bg-white/10 hover:bg-white/20 border-white/20 text-text-light px-8"
                          onClick={() => navigate('/client/wallet')}
                          icon={<PlusCircleOutlined />}
                        >
                          Add Funds
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Eligible for purchase - Show normal purchase button */
              <Button
                type="primary"
                size="large"
                className="w-full sm:w-auto bg-gradient-to-r from-client-accent to-client-accent/90 text-white border-none shadow-lg hover:shadow-xl px-8"
                  onClick={handleStartWithPack}
                icon={<ShoppingOutlined />}
                      disabled={checkingEligibility}
                      loading={checkingEligibility}
              >
                      {checkingEligibility ? 'Checking Availability...' : 'Start with Pack'}
              </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Conditional Rendering: Show ScopeOptions or other sections */}
        <AnimatePresence mode="wait">
          {showScopeOptions ? (
            <motion.div
              key="scope-options"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-6 sm:mb-8"
            >
              {fieldsLoading ? (
                <Card className="bg-client-bg-card border border-white/10 shadow-xl">
                  <div className="text-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-client-accent mx-auto mb-4"></div>
                    <Text className="text-text-light">Loading customization options...</Text>
                  </div>
                </Card>
              ) : (
              <ScopeOptions
                onCancel={handleScopeBack}
                onConfirm={handleScopeConfirm}
                selectedLevel={selectedLevel}
                initialPrice={selectedLevelData?.price}
                obspPhases={obspFields}
                obspId={id}
                showBackButton={true}
                onBack={handleScopeBack}
                selectedLevelData={selectedLevelData}
                draftResponseData={draftResponseData}
              />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="other-sections"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Trust Badges Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-6 sm:mb-8"
              >
                <Card className="bg-client-bg-card border border-white/10 shadow-xl">
                  <div className="mb-4 text-center">
                    <Title level={3} className="!text-text-light mb-2">Why Choose This Package?</Title>
                    <Text className="text-text-light/50 text-sm lg:text-base">
                      Guaranteed outcomes with professional delivery
                      </Text>
                    </div>
                    
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[
                      { icon: <CheckCircleOutlined />, text: "Outcome Guarantee", color: "#10B981" },
                      { icon: <TrophyOutlined />, text: "QA Milestone Included", color: "#F59E0B" },
                      { icon: <DollarOutlined />, text: "Delivery-Linked Payouts", color: "#3B82F6" },
                      { icon: <FileTextOutlined />, text: "Pre-scoped", color: "#8B5CF6" },
                      { icon: <TeamOutlined />, text: "Pre-vetted Freelancers", color: "#EC4899" }
                    ].map((badge, index) => (
                      <div 
                        key={index}
                        className="p-3 rounded-lg border border-white/10 bg-white/5 text-center"
                        style={{ borderColor: `${badge.color}30` }}
                      >
                        <div 
                          className="text-lg mb-2 flex justify-center"
                          style={{ color: badge.color }}
                        >
                          {badge.icon}
                    </div>
                        <Text className="text-text-light text-xs font-medium">{badge.text}</Text>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Basic Info Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-6 sm:mb-8"
              >
                <Card className="bg-client-bg-card border border-white/10 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-client-accent/20 border border-client-accent/30">
                      <InfoCircleOutlined className="text-lg text-client-accent" />
                    </div>
                    <div>
                      <Title level={3} className="!text-text-light mb-1">Package Information</Title>
                      <Text className="text-text-light/50 text-sm">Key details about this service package</Text>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag color={categoryColor} className="text-xs font-semibold">
                          {obspData.category_display}
                        </Tag>
                          </div>
                      <Text className="text-text-light font-semibold block mb-1">Category</Text>
                      <Text className="text-text-light/50 text-sm">{obspData.category_display}</Text>
                          </div>
                    
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag color={categoryColor} className="text-xs font-semibold">
                          {obspData.industry_display}
                        </Tag>
                    </div>
                      <Text className="text-text-light font-semibold block mb-1">Industry</Text>
                      <Text className="text-text-light/50 text-sm">{obspData.industry_display}</Text>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-client-accent/20 border border-client-accent/30">
                <DollarCircleOutlined className="text-xl text-client-accent" />
              </div>
              <div>
                <Title level={4} className="!text-text-light mb-0">
                  Complete Payment
                </Title>
                <Text className="text-text-light/50 text-sm">
                  Secure payment for your customized package
                </Text>
              </div>
            </div>
          }
          open={paymentModalVisible}
          onCancel={handlePaymentCancel}
          footer={null}
          width={600}
          className="payment-modal"
        >
          <div className="space-y-6">
            {/* Wallet Balance Check */}
            {(() => {
              const basePrice = selectedLevelData?.price || 0;
              const totalAddOns = selectedScopeData ? Object.values(selectedScopeData.phaseData).reduce((total, data) => {
                if (data.phaseImpacts && typeof data.phaseImpacts === 'object') {
                  return total + Object.values(data.phaseImpacts).reduce((sum, impact) => sum + (impact || 0), 0);
                }
                return total;
              }, 0) : 0;
              const totalAmount = basePrice + totalAddOns;
              const availableBalance = walletBalance - walletHoldBalance;
              const isInsufficient = availableBalance < totalAmount;
              
              if (isInsufficient) {
                return (
                  <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <WarningOutlined className="text-orange-500 text-xl" />
                      <div>
                        <Text className="text-orange-500 font-semibold text-lg block">Insufficient Wallet Balance</Text>
                        <Text className="text-text-light/50 text-sm">Your purchase will be saved as draft</Text>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Text className="text-text-light">Required Amount:</Text>
                        <Text className="text-orange-500 font-semibold">₹{totalAmount.toLocaleString()}</Text>
                      </div>
                      <div className="flex justify-between items-center">
                        <Text className="text-text-light">Available Balance:</Text>
                        <Text className="text-text-light">₹{availableBalance.toLocaleString()}</Text>
                      </div>
                      <div className="flex justify-between items-center">
                        <Text className="text-text-light">Shortfall:</Text>
                        <Text className="text-red-500 font-semibold">₹{(totalAmount - availableBalance).toLocaleString()}</Text>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                      <Text className="text-text-light/70 text-sm">
                        <strong>What happens next?</strong><br/>
                        • Your configuration will be saved as draft<br/>
                        • Add ₹{(totalAmount - availableBalance).toLocaleString()} to your wallet<br/>
                        • Return here to complete the purchase
                      </Text>
                    </div>
                  </div>
                );
              }
              
              return (
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-4 border border-green-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircleOutlined className="text-green-500 text-xl" />
                    <div>
                      <Text className="text-green-500 font-semibold text-lg block">Sufficient Balance</Text>
                      <Text className="text-text-light/50 text-sm">Ready to complete purchase</Text>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text className="text-text-light">Available Balance:</Text>
                    <Text className="text-green-500 font-semibold">₹{availableBalance.toLocaleString()}</Text>
                  </div>
                </div>
              );
            })()}

            {/* Order Summary */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <Title level={5} className="!text-text-light mb-3">Order Summary</Title>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Text className="text-text-light font-semibold block">
                      {obspData.title}
                    </Text>
                    <Text className="text-text-light/50 text-sm">
                      {selectedLevelData?.name}
                    </Text>
                  </div>
                  <Tag 
                    color={selectedLevel === 'easy' ? 'green' : selectedLevel === 'medium' ? 'orange' : 'red'}
                    className="text-xs font-semibold"
                  >
                    {selectedLevelData?.level_display}
                  </Tag>
                </div>
                
                {/* Custom Features Summary */}
                {selectedScopeData && selectedScopeData.phaseData && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <Text className="text-text-light font-medium text-sm mb-2 block">Custom Features:</Text>
                    {Object.entries(selectedScopeData.phaseData).map(([phaseKey, phaseData]) => {
                      const phaseImpact = phaseData?.phaseImpacts?.[phaseKey] || 0;
                      if (phaseImpact > 0) {
                        const phase = obspFields?.find(p => p.phase === phaseKey);
                      return (
                          <div key={phaseKey} className="flex items-center justify-between text-sm mb-1">
                            <Text className="text-text-light/70">{phase?.phase_display || phaseKey}</Text>
                            <Text className="text-client-accent font-medium">+₹{phaseImpact.toLocaleString()}</Text>
                        </div>
                      );
                  }
                  return null;
                })}
                  </div>
                )}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-gradient-to-r from-client-accent/10 to-client-secondary/10 rounded-xl p-4 border border-white/10">
              <Title level={5} className="!text-text-light mb-3">Price Breakdown</Title>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Text className="text-text-light">Base Package</Text>
                  <Text className="text-text-light">₹{selectedLevelData?.price?.toLocaleString()}</Text>
              </div>
                
                {/* Add-ons */}
                {selectedScopeData && selectedScopeData.phaseData && (() => {
                  const totalAddOns = Object.values(selectedScopeData.phaseData).reduce((total, data) => {
                    if (data.phaseImpacts && typeof data.phaseImpacts === 'object') {
                      return total + Object.values(data.phaseImpacts).reduce((sum, impact) => sum + (impact || 0), 0);
                    }
                    return total;
                  }, 0);
                  
                  if (totalAddOns > 0) {
                    return (
                      <div className="flex justify-between items-center">
                        <Text className="text-text-light">Additional Features</Text>
                        <Text className="text-client-accent font-medium">+₹{totalAddOns.toLocaleString()}</Text>
            </div>
                    );
                  }
                  return null;
                })()}
                
                <Divider className="border-white/10 my-3" />
                
                <div className="flex justify-between items-center">
                  <Text className="text-text-light font-semibold text-lg">Total Amount</Text>
                <Text className="text-client-accent font-bold text-2xl">
                    ₹{(() => {
                      const basePrice = selectedLevelData?.price || 0;
                      const totalAddOns = selectedScopeData ? Object.values(selectedScopeData.phaseData).reduce((total, data) => {
                        if (data.phaseImpacts && typeof data.phaseImpacts === 'object') {
                          return total + Object.values(data.phaseImpacts).reduce((sum, impact) => sum + (impact || 0), 0);
                        }
                        return total;
                      }, 0) : 0;
                      return (basePrice + totalAddOns).toLocaleString();
                    })()}
                </Text>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="default"
                size="large"
                className="flex-1 bg-white/10 hover:bg-white/20 border-white/20 text-text-light"
                onClick={handlePaymentCancel}
                disabled={paymentLoading}
              >
                Back to Configuration
              </Button>
              
              {(() => {
                const basePrice = selectedLevelData?.price || 0;
                const totalAddOns = selectedScopeData ? Object.values(selectedScopeData.phaseData).reduce((total, data) => {
                  if (data.phaseImpacts && typeof data.phaseImpacts === 'object') {
                    return total + Object.values(data.phaseImpacts).reduce((sum, impact) => sum + (impact || 0), 0);
                  }
                  return total;
                }, 0) : 0;
                const totalAmount = basePrice + totalAddOns;
                const availableBalance = walletBalance - walletHoldBalance;
                const isInsufficient = availableBalance < totalAmount;
                
                if (isInsufficient) {
                  return (
                    <Button
                      type="primary"
                      size="large"
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white border-none shadow-lg hover:shadow-xl"
                      onClick={handlePaymentComplete}
                      loading={paymentLoading}
                      icon={!paymentLoading ? <FileTextOutlined /> : null}
                    >
                      {paymentLoading ? 'Saving Draft...' : 'Save as Draft'}
                    </Button>
                  );
                }
                
                return (
              <Button
                type="primary"
                size="large"
                className="flex-1 bg-gradient-to-r from-client-accent to-client-accent/90 text-white border-none shadow-lg hover:shadow-xl"
                onClick={handlePaymentComplete}
                    loading={paymentLoading}
                    icon={!paymentLoading ? <DollarCircleOutlined /> : null}
              >
                    {paymentLoading ? 'Processing Payment...' : `Pay ₹${totalAmount.toLocaleString()}`}
              </Button>
                );
              })()}
            </div>
          </div>
        </Modal>

        {/* Existing Purchase Modal - Keep for fallback */}
        <Suspense fallback={<div>Loading...</div>}>
          {purchaseModalVisible && (
            <ModalComponent
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-client-accent/20 border border-client-accent/30">
                <ShoppingOutlined className="text-xl text-client-accent" />
              </div>
              <div>
                <Title level={4} className="!text-text-light mb-0">
                  Confirm Purchase
                </Title>
                <Text className="text-text-light/50 text-sm">
                  Review your order details
                </Text>
              </div>
            </div>
          }
          open={purchaseModalVisible}
          onCancel={() => setPurchaseModalVisible(false)}
          footer={null}
          width={500}
          className="purchase-modal"
        >
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Text className="text-text-light font-semibold block">
                    {obspData.title}
                  </Text>
                  <Text className="text-text-light/50 text-sm">
                    {selectedLevelData?.name}
                  </Text>
                </div>
                <Tag 
                  color={selectedLevel === 'easy' ? 'green' : selectedLevel === 'medium' ? 'orange' : 'red'}
                  className="text-xs font-semibold"
                >
                      {selectedLevelData?.level_display}
                </Tag>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-text-light/50 text-sm">
                  Duration: {selectedLevelData?.duration}
                </div>
                <div className="text-client-accent font-bold text-xl">
                  ₹{selectedLevelData?.price.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-client-accent/10 to-client-secondary/10 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <Text className="text-text-light font-semibold text-lg">
                  Total Amount:
                </Text>
                <Text className="text-client-accent font-bold text-2xl">
                  ₹{selectedLevelData?.price.toLocaleString()}
                </Text>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="default"
                size="large"
                className="flex-1 bg-white/10 hover:bg-white/20 border-white/20 text-text-light"
                onClick={() => setPurchaseModalVisible(false)}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                className="flex-1 bg-gradient-to-r from-client-accent to-client-accent/90 text-white border-none shadow-lg hover:shadow-xl"
                onClick={handlePurchase}
                icon={<ShoppingOutlined />}
              >
                Confirm Purchase
              </Button>
            </div>
          </div>
            </ModalComponent>
          )}
        </Suspense>

        {/* CSS Styles */}
        <style jsx global>{`
          .custom-radio .ant-radio {
            display: none !important;
          }
          .custom-radio .ant-radio-wrapper {
            width: 100% !important;
          }
          .custom-radio .ant-radio-wrapper:hover .ant-radio-checked + div {
            border-color: var(--client-accent) !important;
            background: rgba(0, 212, 170, 0.05) !important;
          }
          .custom-radio .ant-radio-checked + div {
            border-color: var(--client-accent) !important;
            background: rgba(0, 212, 170, 0.1) !important;
          }
          
          .purchase-modal .ant-modal-content {
            background: var(--client-bg-card) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 16px !important;
          }
          .purchase-modal .ant-modal-header {
            background: transparent !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            padding: 24px 24px 16px !important;
          }
          .purchase-modal .ant-modal-title {
            color: var(--text-light) !important;
          }
          .purchase-modal .ant-modal-body {
            background: transparent !important;
            padding: 24px !important;
          }
          .purchase-modal .ant-modal-close {
            color: var(--text-secondary) !important;
          }
          .purchase-modal .ant-modal-close:hover {
            color: var(--client-accent) !important;
          }
          
          .ant-card, .ant-card-body {
            background: transparent !important;
            border: none !important;
          }
          
          .ant-btn {
            color: var(--text-light) !important;
          }
          .ant-btn-primary {
            background: var(--client-accent) !important;
            border-color: var(--client-accent) !important;
            color: #fff !important;
          }
          .ant-btn-primary:hover {
            background: var(--client-accent-dark) !important;
            border-color: var(--client-accent-dark) !important;
          }
          
          /* Fixed Tag Styles - Allow colors to show properly */
          .ant-tag {
            color: inherit !important;
            border: 1px solid !important;
            background: transparent !important;
          }
          
          /* Specific tag color overrides */
          .ant-tag.ant-tag-green {
            color: #52c41a !important;
            border-color: #52c41a !important;
            background: rgba(82, 196, 26, 0.1) !important;
          }
          
          .ant-tag.ant-tag-orange {
            color: #fa8c16 !important;
            border-color: #fa8c16 !important;
            background: rgba(250, 140, 22, 0.1) !important;
          }
          
          .ant-tag.ant-tag-red {
            color: #ff4d4f !important;
            border-color: #ff4d4f !important;
            background: rgba(255, 77, 79, 0.1) !important;
          }
          
          .ant-tag.ant-tag-blue {
            color: #1890ff !important;
            border-color: #1890ff !important;
            background: rgba(24, 144, 255, 0.1) !important;
          }
          
          .ant-tag.ant-tag-purple {
            color: #722ed1 !important;
            border-color: #722ed1 !important;
            background: rgba(114, 46, 209, 0.1) !important;
          }
          
          .ant-tag.ant-tag-cyan {
            color: #13c2c2 !important;
            border-color: #13c2c2 !important;
            background: rgba(19, 194, 194, 0.1) !important;
          }
          
          .ant-tag.ant-tag-magenta {
            color: #eb2f96 !important;
            border-color: #eb2f96 !important;
            background: rgba(235, 47, 150, 0.1) !important;
          }
          
          .ant-tag.ant-tag-volcano {
            color: #fa541c !important;
            border-color: #fa541c !important;
            background: rgba(250, 84, 28, 0.1) !important;
          }
          
          .ant-tag.ant-tag-lime {
            color: #a0d911 !important;
            border-color: #a0d911 !important;
            background: rgba(160, 217, 17, 0.1) !important;
          }
          
          .ant-tag.ant-tag-gold {
            color: #faad14 !important;
            border-color: #faad14 !important;
            background: rgba(250, 173, 20, 0.1) !important;
          }
          
          .ant-breadcrumb {
            color: var(--text-light) !important;
            display: flex !important;
            align-items: center !important;
          }
          
          .ant-breadcrumb-item {
            display: flex !important;
            align-items: center !important;
          }
          
          .ant-breadcrumb-link {
            color: var(--text-light) !important;
            display: flex !important;
            align-items: center !important;
          }
          
          .ant-breadcrumb-separator {
            color: var(--text-secondary) !important;
            display: flex !important;
            align-items: center !important;
            margin: 0 8px !important;
          }
          
          .ant-breadcrumb .ant-btn {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: auto !important;
            padding: 4px 8px !important;
          }
          
          .ant-breadcrumb .ant-btn .anticon {
            margin-right: 4px !important;
          }
          
          .scope-modal .ant-modal-content {
            background: var(--client-bg-card) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 16px !important;
            max-height: 90vh !important;
            overflow: hidden !important;
          }
          
          .scope-modal .ant-modal-body {
            background: transparent !important;
            padding: 0 !important;
            max-height: calc(90vh - 110px) !important;
            overflow-y: auto !important;
          }
          
          .scope-modal .ant-modal-close {
            color: var(--text-secondary) !important;
            top: 16px !important;
            right: 16px !important;
          }
          
          .scope-modal .ant-modal-close:hover {
            color: var(--client-accent) !important;
          }

          .payment-modal .ant-modal-content {
            background: var(--client-bg-card) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 16px !important;
          }
          .payment-modal .ant-modal-header {
            background: transparent !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            padding: 24px 24px 16px !important;
          }
          .payment-modal .ant-modal-title {
            color: var(--text-light) !important;
          }
          .payment-modal .ant-modal-body {
            background: transparent !important;
            padding: 24px !important;
          }
          .payment-modal .ant-modal-close {
            color: var(--text-secondary) !important;
          }
          .payment-modal .ant-modal-close:hover {
            color: var(--client-accent) !important;
          }
          
          .payment-modal input[type="radio"] {
            accent-color: var(--client-accent) !important;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ObspDetails;
