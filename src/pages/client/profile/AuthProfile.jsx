import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Button, Pagination, Table, Tooltip, Progress, Tabs, Card, Statistic, Avatar, Tag } from "antd";
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import api from '../../../config/axios';
import { 
  UserOutlined, 
  EnvironmentOutlined, 
  LinkOutlined,
  EditOutlined,
  ProjectOutlined,
  StarOutlined,
  TeamOutlined,
  CalendarOutlined,
  MailOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  UserAddOutlined,
  DashboardOutlined,
  ExclamationCircleOutlined,
  BankOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  PhoneOutlined,
  FileProtectOutlined,
  BuildOutlined,
  SolutionOutlined,
  ContactsOutlined,
  UpOutlined,
  DownOutlined,
  VerifiedOutlined,
  SecurityScanOutlined,
  AuditOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  RightOutlined
} from '@ant-design/icons';
import { Timeline } from 'antd';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useMediaQuery } from 'react-responsive';

import { Modal } from 'antd';
import { FaEye, FaCheckCircle, FaBriefcase } from 'react-icons/fa';

import { RiAwardLine, RiUserStarLine } from 'react-icons/ri';
import { IoSchoolOutline } from 'react-icons/io5';
import {getBaseURL} from '../../../config/axios';

const { TabPane } = Tabs;

const ProfileCompletionModal = ({ visible, onClose, clientInfo, navigate }) => (
  <Modal
    title={
      <div className="flex items-center gap-2">
        <SafetyCertificateOutlined className="text-yellow-500" />
        <span>Profile Completion Details</span>
      </div>
    }
    open={visible}
    onCancel={onClose}
    footer={null}
    width={700}
    className="profile-completion-modal"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {[
        {
          title: "Overall Information",
          icon: <UserOutlined className="text-blue-500" />,
          data: clientInfo?.profile_completion?.category_scores?.basic_info,
          section: 'basic_info',
          color: 'blue',
          fields: [
            { name: 'profile_picture', label: 'Profile Picture', required: true },
            { name: 'bio', label: 'Bio', required: true },
            { name: 'location', label: 'Location', required: true },
            { name: 'description', label: 'Description', required: true }
          ]
        },
        {
          title: "Business & Banking",
          icon: <ShopOutlined className="text-purple-500" />,
          data: clientInfo?.profile_completion?.category_scores?.business_info,
          section: 'business_info',
          color: 'purple',
          fields: [
            { name: 'company_name', label: 'Company Name', required: true },
            { name: 'registration_number', label: 'Registration Number', required: true },
            { name: 'gst_number', label: 'GST Number', required: true },
            { name: 'bank_name', label: 'Bank Name', required: true },
            { name: 'bank_account', label: 'Bank Account', required: true }
          ]
        },
        {
          title: "Verification & Documents",
          icon: <SecurityScanOutlined className="text-red-500" />,
          data: clientInfo?.profile_completion?.category_scores?.verification,
          section: 'verification',
          color: 'red',
          required: true,
          fields: [
            { name: 'id_proof', label: 'ID Proof', required: true },
            { name: 'pan_card', label: 'PAN Card', required: true },
            { name: 'company_registration', label: 'Company Registration', required: true },
            { name: 'gst_certificate', label: 'GST Certificate', required: true },
            { name: 'bank_verification', label: 'Bank Verification', required: true }
          ]
        }
      ].map((category, index) => {
        const score = category.data?.score || 0;
        const total = category.data?.total || 0;
        const percentage = Math.round((score / total) * 100);
        const remaining = total - score;

        return (
          <div
            key={index}
            className="rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
            onClick={() => {
              navigate(`/client/profile/${clientInfo.id}/edit_profile`, {
                state: { section: category.section }
              });
              onClose();
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {category.icon}
                <h4 className="font-medium text-gray-700">{category.title}</h4>
              </div>
              <Tag color={percentage === 100 ? 'success' : category.required && percentage < 50 ? 'error' : 'warning'}>
                {percentage}%
              </Tag>
            </div>

            <Progress 
              percent={percentage}
              size="small"
              strokeColor={
                percentage === 100 
                  ? '#10b981' 
                  : category.required && percentage < 50 
                    ? '#ef4444' 
                    : '#f59e0b'
              }
            />

            <div className="mt-3 space-y-2">
              {category.fields.map((field, fieldIndex) => (
                <div key={fieldIndex} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{field.label}</span>
                  {clientInfo?.[field.name] ? (
                    <CheckCircleOutlined className="text-green-500" />
                  ) : (
                    <ExclamationCircleOutlined className="text-red-500" />
                  )}
                </div>
              ))}
            </div>

            {remaining > 0 && (
              <div className="mt-2">
                <p className={`text-xs ${category.required ? 'text-red-500' : 'text-orange-500'}`}>
                  {remaining} points remaining {category.required && '(Required)'}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </Modal>
);

const AuthProfile = () => {
  const { userId, isEditable, isAuthenticated, role, currentUserId } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [clientInfo, setClientInfo] = useState({});
  const [projects, setProjects] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [connectionCount, setConnectionCount] = useState(0);  // To store connection count
  const [averageRating, setAverageRating] = useState(0);  // To store average rating  
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const paginatedData = projects.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const [showDetails, setShowDetails] = useState(false); // To toggle the modal visibility
  const [selectedProject, setSelectedProject] = useState(null); // To store the selected project

  const handlePaginationChange = (page) => {
    setCurrentPage(page);
  };

  const [loading, setLoading] = useState(true);

  // Add new states for enhanced features
  const [activeTab, setActiveTab] = useState('1');
  const [projectStats, setProjectStats] = useState({
    completed: 0,
    ongoing: 0,
    total: 0
  });

  const isMobile = useMediaQuery({ maxWidth: 767 });

  const [profileCompletion, setProfileCompletion] = useState(0);
  const [profileSuggestions, setProfileSuggestions] = useState([]);

  const [categoryScores, setCategoryScores] = useState({
    basic_info: { score: 0, total: 20 },
    business_info: { score: 0, total: 25 },
    verification: { score: 0, total: 30 },
    banking: { score: 0, total: 25 }
  });

  const [showCompletionDetails, setShowCompletionDetails] = useState(false);

  const categoryConfig = {
    basic_info: {
      title: "Basic Information",
      icon: <UserOutlined className="text-blue-500" />,
      color: 'blue',
      fields: ['profile_picture', 'bio', 'location', 'description']
    },
    business_info: {
      title: "Business Information",
      icon: <ShopOutlined className="text-purple-500" />,
      color: 'purple',
      fields: ['company_name', 'registration_number', 'gst_number', 'website', 'pan_number']
    },
    verification: {
      title: "Verification Documents",
      icon: <SecurityScanOutlined className="text-red-500" />,
      color: 'red',
      required: true,
      fields: ['id_proof', 'pan_card', 'company_registration', 'gst_certificate', 'identity_verified']
    },
    banking: {
      title: "Banking Details",
      icon: <BankOutlined className="text-green-500" />,
      color: 'green',
      required: true,
      fields: ['bank_details', 'bank_verification']
    }
  };


  const [isCompletionModalVisible, setIsCompletionModalVisible] = useState(false);

  // Add new state for testing completed profile
  const [isProfileComplete, setIsProfileComplete] = useState(false); // For testing

  const [profileViewMode, setProfileViewMode] = useState('overview'); // 'overview', 'required', 'optional'

  useEffect(() => {
    // This ensures that we wait for userId and accessToken to be available
    const fetchProfileDetails = async () => {
      const accessToken = Cookies.get("accessToken");

      if (!userId || !accessToken) {
        console.log("Waiting for userId or accessToken...");
        return; 
      }

      setLoading(true); // Start loading indicator

      try {
        const response = await api.get(`${getBaseURL()}/api/client/get_profile_data`, {
          params: { userId: userId }, // Passing userId as query parameter
          headers: {
            Authorization: `Bearer ${accessToken}`, // Passing the access token as Authorization header
          },
        });

        // Assuming the response data structure is as expected
        const data = response.data;
        console.log(data)
        setClientInfo(data.profile);
        setProjects(data.projects);
        setReviewsList(data.reviews_and_ratings.reviews);
        setConnectionCount(data.connection_Count || 0);
        setAverageRating(data.reviews_and_ratings.average_rating);
        
        // Set profile completion data
        console.log(data.profile.profile_completion.total_score)
        if (data.profile.profile_completion) {
          setProfileCompletion(data.profile.profile_completion.total_score);
          setCategoryScores(data.profile.profile_completion.category_scores);
        }
      } catch (error) {
        console.log(error); // Handle any errors
      } finally {
        setLoading(false); // Stop loading after request is completed
      }
    };

    // Ensure that we wait for userId and accessToken before making the request
    if (userId && Cookies.get("accessToken")) {
      fetchProfileDetails();
    } else {
      console.log("Waiting for userId and accessToken...");
    }
  }, [userId]); 
  
  // Calculate project stats
  useEffect(() => {
    if (projects.length > 0) {
      const stats = projects.reduce((acc, project) => {
        if (project.status === 'completed') acc.completed++;
        if (project.status === 'ongoing') acc.ongoing++;
        acc.total++;
        return acc;
      }, { completed: 0, ongoing: 0, total: 0 });
      setProjectStats(stats);
    }
  }, [projects]);

  useEffect(() => {
    const analyzeProfile = () => {
      const suggestions = [];
      let completionScore = 0;
      const requiredFields = [
        // Basic Profile (20%)
        {
          category: 'Basic Profile',
          fields: [
            { name: 'profile_picture', value: clientInfo.profile_picture, weight: 5, message: 'Add a professional profile picture' },
            { name: 'bio', value: clientInfo.bio, weight: 5, message: 'Add a brief bio' },
            { name: 'location', value: clientInfo.location, weight: 5, message: 'Add your location' },
            { name: 'description', value: clientInfo.description, weight: 5, message: 'Add a detailed business description' }
          ]
        },
        // Business Information (25%)
        {
          category: 'Business Information',
          fields: [
            { name: 'company_name', value: clientInfo.company_name, weight: 5, message: 'Add your company name' },
            { name: 'company_website', value: clientInfo.company_website, weight: 5, message: 'Add your company website' },
            { name: 'company_registration_number', value: clientInfo.company_registration_number, weight: 5, message: 'Add company registration number' },
            { name: 'gst_number', value: clientInfo.gst_number, weight: 5, message: 'Add GST number' },
            { name: 'registered_address', value: clientInfo.registered_address, weight: 5, message: 'Add registered business address' }
          ]
        },
        // Verification Documents (30%)
        {
          category: 'Verification Documents',
          fields: [
            { name: 'id_proof', value: clientInfo.id_proof, weight: 6, message: 'Upload ID proof', required: true },
            { name: 'pan_card_image', value: clientInfo.pan_card_image, weight: 6, message: 'Upload PAN card', required: true },
            { name: 'company_incorporation_doc', value: clientInfo.company_incorporation_doc, weight: 6, message: 'Upload company incorporation document' },
            { name: 'tax_declaration_doc', value: clientInfo.tax_declaration_doc, weight: 6, message: 'Upload tax declaration document' },
            { name: 'id_verified', value: clientInfo.id_verified, weight: 6, message: 'Complete ID verification', required: true }
          ]
        },
        // Banking Details (25%)
        {
          category: 'Banking Details',
          fields: [
            { name: 'bank_name', value: clientInfo.bank_name, weight: 5, message: 'Add bank name', required: true },
            { name: 'bank_account_number', value: clientInfo.bank_account_number, weight: 5, message: 'Add bank account number', required: true },
            { name: 'bank_ifsc', value: clientInfo.bank_ifsc, weight: 5, message: 'Add IFSC code', required: true },
            { name: 'bank_verified', value: clientInfo.bank_verified, weight: 5, message: 'Complete bank verification', required: true },
            { name: 'terms_accepted', value: clientInfo.terms_accepted, weight: 5, message: 'Accept terms and conditions', required: true }
          ]
        }
      ];

      requiredFields.forEach(category => {
        category.fields.forEach(field => {
          if (!field.value) {
            suggestions.push({
              type: field.name,
              message: field.message,
              priority: field.required ? 1 : 2,
              category: category.category
            });
          } else {
            completionScore += field.weight;
          }
        });
      });

      setProfileCompletion(Math.round(completionScore));
      setProfileSuggestions(suggestions.sort((a, b) => a.priority - b.priority));

      // Check if all category scores are 100%
      const allCategoriesComplete = Object.values(categoryScores).every(
        category => category.score === category.total
      );
      
      setIsProfileComplete(allCategoriesComplete);
    };

    if (clientInfo && userId === currentUserId) {
      analyzeProfile();
    }
  }, [clientInfo, userId, currentUserId, categoryScores]);

  // Add this near your other useEffect hooks
  useEffect(() => {
    // Simulate completed profile for testing
    if (isProfileComplete) {
      setClientInfo(prev => ({
        ...prev,
        profile_completion: {
          total_score: 100,
          category_scores: {
            basic_info: { score: 20, total: 20 },
            business_info: { score: 25, total: 25 },
            verification: { score: 30, total: 30 },
            banking: { score: 25, total: 25 }
          }
        },
        verification_status: {
          email_verified: true,
          phone_verified: true,
          identity_verified: true,
          bank_verified: true
        }
      }));
    }
  }, [isProfileComplete]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return { color: 'green', label: 'Completed' }; // Green for completed
      case 'ongoing':
        return { color: 'yellow', label: 'Ongoing' }; // Yellow for ongoing
      case 'pending':
        return { color: 'red', label: 'Pending' }; // Red for pending
      default:
        return { color: 'gray', label: 'Unknown' }; // Gray for undefined status
    }
  };
  
  const openDetails = (project) => {
    setSelectedProject(project);
    setShowDetails(true);
  };
  
  const closeDetails = () => {
    setShowDetails(false);
  };
  


  return (
    <div className="min-h-fit w-full bg-client-primary">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-client-accent/2 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-brand-accent/1 rounded-full blur-xl animate-float-delayed"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        {/* Row 1: Profile Header and Profile Completion */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 mb-3 sm:mb-6">
          {/* Profile Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-xl sm:rounded-2xl ${
              clientInfo?.profile_completion?.total_score === 100 
                ? 'lg:col-span-12' 
                : 'lg:col-span-8'
            }`}
          >
            {/* Premium Background with Multiple Layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-client-primary via-client-primary/95 to-client-bg-dark"></div>
            <div className="absolute inset-0 bg-client-gradient-soft opacity-30"></div>
            
            {/* Floating Orbs - Responsive */}
            <div className="absolute top-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-client-accent/10 rounded-full blur-3xl -mr-24 lg:-mr-48 -mt-24 lg:-mt-48 animate-float"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 lg:w-80 lg:h-80 bg-brand-accent/8 rounded-full blur-2xl -ml-20 lg:-ml-40 -mb-20 lg:-mb-40 animate-float-delayed"></div>
            <div className="absolute top-1/2 right-1/4 w-16 h-16 lg:w-32 lg:h-32 bg-client-accent/10 rounded-full blur-xl"></div>

            {/* Hero Section */}
            <div className="relative px-4 sm:px-8 py-6 sm:py-10">
              {/* Profile Image and Basic Info with Improved Spacing */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                {/* Profile Image Section */}
                <div className="relative z-10">
            <div className="relative group">
                    <div className="relative">
                      <Avatar 
                        size={isMobile ? 96 : 120}
                        src={clientInfo?.profile_picture ? `https://talintzbackend-production.up.railway.app${clientInfo?.profile_picture}` : null}
                        icon={<UserOutlined />}
                        className="border-4 border-white/20 shadow-xl transition-transform duration-300 group-hover:scale-105"
              />
              {isEditable && (
                    <Button 
                      icon={<EditOutlined />}
                          size={isMobile ? "small" : "default"}
                          className="absolute -bottom-2 -right-2 rounded-full bg-client-accent/90 hover:bg-client-accent text-white border-none shadow-lg transition-all duration-300 hover:scale-110"
                      onClick={() => navigate(`/client/profile/${userId}/edit_profile`)}
                    />
                      )}
                </div>
                    {/* Profile Status Badge */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                      <Tag color="client-accent" className="px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                        {clientInfo?.role}
                      </Tag>
                    </div>
                  </div>
                </div>

                {/* Profile Info Section */}
                <div className="flex-1 z-10 text-center sm:text-left">
                  {/* Name and Tags with Enhanced Typography */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-3 sm:gap-4 mb-4">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                      {clientInfo?.name}
                    </h1>
                    {clientInfo?.profile_completion?.total_score === 100 && (
                      <Tag color="success" icon={<CheckCircleOutlined />} className="px-3 py-1">
                        Profile Complete
                      </Tag>
              )}
            </div>

                  {/* Contact Information with Improved Layout */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {[
                      { icon: <MailOutlined />, label: 'Email', value: clientInfo?.email },
                      { icon: <PhoneOutlined />, label: 'Phone', value: clientInfo?.contact_info?.phone_number || 'Not provided' },
                      { icon: <UserOutlined />, label: 'Gender', value: clientInfo?.gender || 'Not specified' },
                      { icon: <CalendarOutlined />, label: 'Date of Birth', value: clientInfo?.dob ? new Date(clientInfo.dob).toLocaleDateString() : 'Not provided' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                        <div className="p-1.5 rounded-lg bg-white/10 flex-shrink-0">
                          {React.cloneElement(item.icon, { className: 'text-client-accent text-base' })}
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <p className="text-xs font-medium text-white/60 truncate">{item.label}</p>
                          <p className="text-sm text-white/90 truncate">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Connection Count Section */}
                  <div className="mt-4">
                    <div 
                      onClick={() => navigate('/client/connections')}
                      className="flex items-center gap-2 p-3 rounded-lg bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300 cursor-pointer"
                    >
                      <div className="p-2 rounded-lg bg-white/10">
                        <TeamOutlined className="text-client-accent text-base" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-white/60">Connections</p>
                        <p className="text-sm text-white/90">{connectionCount} connections</p>
                      </div>
                      <div className="text-white/60">
                        <RightOutlined />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio and Description Section with Enhanced Layout */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bio */}
                {clientInfo?.bio && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <UserOutlined className="text-client-accent text-lg" />
                      <h3 className="text-base font-semibold text-white">Bio</h3>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">{clientInfo.bio}</p>
                  </div>
                )}

                {/* Description */}
                {clientInfo?.description && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <FileProtectOutlined className="text-client-accent text-lg" />
                      <h3 className="text-base font-semibold text-white">About</h3>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">{clientInfo.description}</p>
                  </div>
                )}
              </div>

              {/* Additional Info Section with Enhanced Design */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: <EnvironmentOutlined />, label: 'Location', value: clientInfo?.location || 'Not specified' },
                  { icon: <GlobalOutlined />, label: 'Website', value: clientInfo?.website || 'Not provided' },
                  { icon: <TeamOutlined />, label: 'Company', value: clientInfo?.company_details?.name || 'Not specified' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                    <div className="p-2 rounded-lg bg-white/10">
                      {React.cloneElement(item.icon, { className: 'text-client-accent text-base' })}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/60">{item.label}</p>
                      <p className="text-sm text-white/90">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Profile Completion Card */}
          {clientInfo?.profile_completion?.total_score !== 100 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-4 bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10"
            >
              <div className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-medium text-white flex items-center gap-2">
                      <SafetyCertificateOutlined className="text-client-accent" />
                      Profile Completion
                    </h3>
                    <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">
                      {profileViewMode === 'overview' ? 'Overview' : 
                       profileViewMode === 'basic' ? 'Basic & Business' : 'Verification & Banking'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* View Mode Toggle Dots */}
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setProfileViewMode('overview')}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          profileViewMode === 'overview' ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'
                        }`}
                      />
                      <button 
                        onClick={() => setProfileViewMode('basic')}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          profileViewMode === 'basic' ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'
                        }`}
                      />
                      <button 
                        onClick={() => setProfileViewMode('verification')}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          profileViewMode === 'verification' ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'
                        }`}
                      />
              </div>
            </div>
          </div>

                {/* Overview View - Shows all categories */}
                {profileViewMode === 'overview' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Progress 
                        type="circle" 
                        percent={clientInfo?.profile_completion?.total_score || 0}
                        width={60}
                        strokeColor={{
                          '0%': '#0ea5e9',
                          '100%': '#0d9488',
                        }}
                      />
                      <div>
                        <h3 className="text-base font-medium text-white">Overall Progress</h3>
                        <p className="text-sm text-white/60">
                          {clientInfo?.profile_completion?.total_score || 0}% Complete
                        </p>
            </div>
        </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { 
                          label: 'Basic Info', 
                          value: clientInfo?.profile_completion?.category_scores?.basic_info?.percentage || 0,
                          color: '#0ea5e9'
                        },
                        { 
                          label: 'Business Info', 
                          value: clientInfo?.profile_completion?.category_scores?.business_info?.percentage || 0,
                          color: '#8b5cf6'
                        },
                        { 
                          label: 'Verification', 
                          value: clientInfo?.profile_completion?.category_scores?.verification?.percentage || 0,
                          color: '#ef4444'
                        },
                        { 
                          label: 'Banking', 
                          value: clientInfo?.profile_completion?.category_scores?.banking?.percentage || 0,
                          color: '#10b981'
          }
        ].map((stat, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-3">
                          <p className="text-sm text-white/60">{stat.label}</p>
                          <p className="text-lg font-medium text-white" style={{ color: stat.color }}>
                            {stat.value}%
                </p>
              </div>
        ))}
      </div>
                  </div>
                )}

                {/* Basic & Business View */}
                {profileViewMode === 'basic' && (
                  <div className="space-y-3">
                    {[
                      {
                        title: 'Basic Information',
                        icon: <UserOutlined className="text-blue-500" />,
                        data: clientInfo?.profile_completion?.category_scores?.basic_info,
                        color: '#0ea5e9'
                      },
                      {
                        title: 'Business Information',
                        icon: <ShopOutlined className="text-purple-500" />,
                        data: clientInfo?.profile_completion?.category_scores?.business_info,
                        color: '#8b5cf6'
                      }
                    ].map((category, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          {category.icon}
                          <h4 className="text-white font-medium text-sm">{category.title}</h4>
                  <Progress
                            percent={category.data?.percentage || 0}
                            size="small"
                            showInfo={false}
                            strokeColor={category.color}
                            trailColor="rgba(255, 255, 255, 0.1)"
                            className="w-24"
                          />
                        </div>
                        {category.data?.pending_items?.length > 0 ? (
                          <div className="space-y-2">
                            {category.data.pending_items.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <ExclamationCircleOutlined className="text-red-500" />
                                  <span className="text-sm text-white/60">
                                    {item.item}
                                  </span>
                                </div>
                                <Button 
                                  type="link" 
                                  size="small"
                                  className="text-client-accent hover:text-client-accent/80"
                                  onClick={() => navigate(`/client/profile/${userId}/edit_profile`)}
                                >
                                  Complete
                                </Button>
                              </div>
                            ))}
              </div>
                        ) : (
                          <div className="flex items-center justify-center py-2">
                            <CheckCircleOutlined className="text-green-500 mr-2" />
                            <span className="text-sm text-white/60">All caught up!</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Verification & Banking View */}
                {profileViewMode === 'verification' && (
                  <div className="space-y-3">
                    {[
                      {
                        title: 'Verification Documents',
                        icon: <SecurityScanOutlined className="text-red-500" />,
                        data: clientInfo?.profile_completion?.category_scores?.verification,
                        color: '#ef4444'
                      },
                      {
                        title: 'Banking Details',
                        icon: <BankOutlined className="text-green-500" />,
                        data: clientInfo?.profile_completion?.category_scores?.banking,
                        color: '#10b981'
                      }
                    ].map((category, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          {category.icon}
                          <h4 className="text-white font-medium text-sm">{category.title}</h4>
                          <Progress 
                            percent={category.data?.percentage || 0}
                            size="small"
                            showInfo={false}
                            strokeColor={category.color}
                            trailColor="rgba(255, 255, 255, 0.1)"
                            className="w-24"
                          />
                        </div>
                        {category.data?.pending_items?.length > 0 ? (
                          <div className="space-y-2">
                            {category.data.pending_items.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <ExclamationCircleOutlined className="text-red-500" />
                                  <span className="text-sm text-white/60">
                                    {item.item}
                                  </span>
                                </div>
                        <Button 
                          type="link" 
                                  size="small"
                                  className="text-client-accent hover:text-client-accent/80"
                                  onClick={() => navigate(`/client/profile/${userId}/edit_profile`)}
                        >
                                  Complete
                        </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center py-2">
                            <CheckCircleOutlined className="text-green-500 mr-2" />
                            <span className="text-sm text-white/60">All caught up!</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Row 2: Company Details and Bank Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Company Details Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShopOutlined className="text-client-accent" />
                  Company Details
                </h3>
                {clientInfo?.company_details?.verified && (
                  <Tag color="success" icon={<CheckCircleOutlined />}>Verified</Tag>
                )}
              </div>

              {clientInfo?.company_details && Object.values(clientInfo.company_details).some(value => value) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  {[
                    { label: 'Company Name', value: clientInfo.company_details.name },
                    { label: 'Company Type', value: clientInfo.company_details.company_type },
                    { label: 'Industry', value: clientInfo.company_details.industry },
                    { label: 'Employee Count', value: clientInfo.company_details.employee_count },
                    { label: 'GST Number', value: clientInfo.company_details.gst_number },
                    { label: 'PAN Number', value: clientInfo.company_details.pan_number },
                    { label: 'Registration Number', value: clientInfo.company_details.registration_number },
                    { label: 'Registration Date', value: clientInfo.company_details.registration_date },
                    { label: 'Website', value: clientInfo.company_details.website },
                    { label: 'Annual Turnover', value: clientInfo.company_details.annual_turnover }
                  ].map((item, index) => (
                    item.value && (
                      <div key={index} className="flex flex-col">
                        <p className="text-xs text-white/60">{item.label}</p>
                        <p className="text-sm text-white/80 mt-1">{item.value}</p>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center gap-4">
                    <ShopOutlined className="text-4xl text-white/40" />
                    <p className="text-white/60">Add your company details to complete your profile</p>
                    <Button
                      type="primary"
                      className="bg-client-accent hover:bg-client-accent/90"
                      onClick={() => navigate(`/client/profile/${userId}/edit_profile`)}
                    >
                      Add Company Details
                    </Button>
                      </div>
                    </div>
              )}
            </div>
          </motion.div>
        
          {/* Bank Details Card */}
                        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BankOutlined className="text-client-accent" />
                  Bank Details
                </h3>
                {clientInfo?.bank_details?.verified && (
                  <Tag color="success" icon={<CheckCircleOutlined />}>Verified</Tag>
                )}
                            </div>

              {clientInfo?.bank_details && Object.values(clientInfo.bank_details).some(value => value) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  {[
                    { label: 'Account Holder', value: clientInfo.bank_details.account_holder_name },
                    { label: 'Account Number', value: clientInfo.bank_details.account_number },
                    { label: 'Bank Name', value: clientInfo.bank_details.bank_name },
                    { label: 'Branch Name', value: clientInfo.bank_details.branch_name },
                    { label: 'IFSC Code', value: clientInfo.bank_details.ifsc_code },
                    { label: 'SWIFT Code', value: clientInfo.bank_details.swift_code }
                  ].map((item, index) => (
                    item.value && (
                      <div key={index} className="flex flex-col">
                        <p className="text-xs text-white/60">{item.label}</p>
                        <p className="text-sm text-white/80 mt-1">{item.value}</p>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center gap-4">
                    <BankOutlined className="text-4xl text-white/40" />
                    <p className="text-white/60">Add your bank details to complete your profile</p>
                              <Button
                                type="primary"
                      className="bg-client-accent hover:bg-client-accent/90"
                      onClick={() => navigate(`/client/profile/${userId}/edit_profile`)}
                              >
                      Add Bank Details
                              </Button>
                            </div>
                          </div>
                      )}
            </div>
                  </motion.div>
        </div>

        {/* Row 3: Addresses and Projects & Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Addresses Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
          >
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                <EnvironmentOutlined className="text-client-accent" />
                Addresses
              </h3>

              {clientInfo?.addresses?.length > 0 ? (
                <div className="space-y-4">
                  {clientInfo.addresses.map((address, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <Tag color={address.is_primary ? 'success' : 'default'}>
                          {address.address_type}
                        </Tag>
                        {address.verified && (
                          <Tag color="success" icon={<CheckCircleOutlined />}>Verified</Tag>
                        )}
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-white/80">{address.street_address}</p>
                        <p className="text-white/60">{address.city}, {address.state}</p>
                        <p className="text-white/60">{address.country} - {address.postal_code}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <EnvironmentOutlined className="text-4xl text-white/40 mb-4" />
                  <p className="text-white/60">No addresses available</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Projects & Reviews Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
          >
            <div className="p-4 sm:p-6">
              <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                className="custom-tabs"
              >
                {/* Projects Tab */}
                <Tabs.TabPane 
                  tab={<span className="flex items-center gap-2"><ProjectOutlined />Projects</span>} 
                  key="1"
                >
                  <div className="space-y-4">
                    {paginatedData.map((project) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <ProjectOutlined className="text-client-accent" />
                            <div>
                              <h4 className="text-white font-medium">{project.title}</h4>
                              <p className="text-sm text-white/60">{project.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Tag color={getStatusColor(project.status).color}>
                              {getStatusColor(project.status).label}
                            </Tag>
                            <Button
                              type="link" 
                              className="text-client-accent"
                              onClick={() => navigate(`/client/view-bids/posted-project/${project.id}`)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
              
              <div className="flex justify-end mt-4">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={projects.length}
                  onChange={handlePaginationChange}
                  showSizeChanger={false}
                  className="custom-pagination"
                />
              </div>
            </Tabs.TabPane>

            {/* Reviews Tab */}
            <Tabs.TabPane 
              tab={<span className="flex items-center gap-2"><StarOutlined />Reviews</span>} 
            key="2"
          >
            <div className="space-y-6">
              {/* Rating Overview */}
                <div className="flex items-center justify-between p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-500">{averageRating}</div>
                    <div className="text-sm text-white/60">Average Rating</div>
                </div>
                <div className="flex-1 max-w-sm mx-8">
                  {[5,4,3,2,1].map(rating => {
                    const count = reviewsList.filter(r => r.rating === rating).length;
                    const percentage = (count / reviewsList.length) * 100;
                    return (
                      <div key={rating} className="flex items-center space-x-2">
                          <span className="text-sm w-8 text-white/80">{rating}★</span>
                        <Progress percent={percentage} size="small" showInfo={false} />
                          <span className="text-sm w-8 text-white/80">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviewsList.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                      className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      <Avatar size={48}>
                        {review.from_freelancer_username ? review.from_freelancer_username[0] : '?'}
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-white">{review.from_freelancer_username || 'Anonymous'}</h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarOutlined 
                                key={i}
                                  className={i < (review.rating || 0) ? 'text-yellow-400' : 'text-white/30'}
                              />
                            ))}
                          </div>
                        </div>
                          <p className="mt-2 text-white/80">{review.feedback || 'No feedback provided'}</p>
                          <div className="mt-2 text-sm text-white/60">
                          <CalendarOutlined className="mr-1" />
                          {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Date not available'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            </Tabs.TabPane>
        </Tabs>
            </div>
        </motion.div>
      </div>
    </div>


      {/* Custom Styles */}
      <style jsx global>{`
        .custom-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: var(--client-accent);
        }
        
        .custom-tabs .ant-tabs-ink-bar {
          background: var(--client-accent);
        }

        .ant-card {
          background: transparent;
        }

        .ant-card-head {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .ant-card-head-title {
          color: white;
        }

        .ant-tabs-tab {
          color: rgba(255, 255, 255, 0.6);
        }

        .ant-tabs-tab:hover {
          color: var(--client-accent);
        }

        .custom-timeline .ant-timeline-item-tail {
          border-color: rgba(255, 255, 255, 0.1);
        }

        .custom-timeline .ant-timeline-item-head {
          background-color: var(--client-accent);
        }

        .custom-pagination .ant-pagination-item {
          background: transparent;
          border-color: rgba(255, 255, 255, 0.1);
        }

        .custom-pagination .ant-pagination-item a {
          color: white;
        }

        .custom-pagination .ant-pagination-item-active {
          background: var(--client-accent);
          border-color: var(--client-accent);
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
      `}</style>
    </div>
  );
};

export default AuthProfile;