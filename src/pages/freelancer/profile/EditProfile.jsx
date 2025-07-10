import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import Cookies from 'js-cookie';
import axios from "axios";
import {getBaseURL} from '../../../config/axios';
import './css/EditProfile.css'
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Switch,
  Row,
  Col,
  Tooltip,
  Tabs,
  Card,
  Select,
  DatePicker,
  InputNumber,
  Tag,
  Alert,
  Modal,
  Checkbox,
  Avatar
} from "antd";
import { 
  UserOutlined, 
  BankOutlined, 
  EnvironmentOutlined,
  GlobalOutlined,
  NumberOutlined,
  IdcardOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  PlusOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  EyeOutlined,
  DeleteOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import { 
  FaBriefcase,
  FaBook,
  FaTrophy,
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGlobe,
  FaCode,
  FaLanguage,
  FaGraduationCap,
  FaBuilding,
  FaLink,
  FaCalendar,
  FaUniversity,
  FaStar,
  FaCertificate,
  FaShieldAlt
} from "react-icons/fa";
import { useMediaQuery } from 'react-responsive';
import moment from 'moment';

const { Option } = Select;

// Update the styling variables to match client
const customStyles = {
  tabActiveColor: 'var(--freelancer-primary)',
  tabHoverColor: 'var(--freelancer-secondary)',
  tabBgColor: 'var(--freelancer-bg)',
};

const EditProfile = () => {
  const { userId, role, isAuthenticated, isEditable, currentUserId } = useOutletContext();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showingProfilePicture, setShowingProfilePicture] = useState(null);
  const [file, setFile] = useState(null);
  const [documentFiles, setDocumentFiles] = useState({});
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

  // Add state for fetched data
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');

  // Add state for tracking form changes
  const [formChanged, setFormChanged] = useState(false);
  const [originalValues, setOriginalValues] = useState({});

  // Add responsive breakpoints
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  // Add state for profile picture modal
  const [profilePictureModalVisible, setProfilePictureModalVisible] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);

  // Add state for UX enhancements
  const [tabLoading, setTabLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [autoNextTimer, setAutoNextTimer] = useState(null);

  // Add new state for all available skills
  const [allSkills, setAllSkills] = useState([]);

  // Fetch all skills from the backend when the component mounts
  useEffect(() => {
    const fetchAllSkills = async () => {
      try {
        const accessToken = Cookies.get('accessToken');
        const response = await axios.get(`${getBaseURL()}/api/skills/`, {  // Assuming an endpoint like /api/core/skills/ exists
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setAllSkills(response.data);  // Assuming the response is an array of skill objects, e.g., [{id: 1, name: 'React'}, ...]
      } catch (error) {
        console.error('Error fetching skills:', error);
        message.error('Failed to load skills');
      }
    };
    fetchAllSkills();
  }, []);

  // Fetch profile data based on active tab
  const fetchProfileData = async (tab) => {
    setTabLoading(true);
    try {
      const accessToken = Cookies.get('accessToken');
      const response = await axios.get(
        `${getBaseURL()}/api/freelancer/get_profile_data/?tab=${tab}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      const data = response.data;
      
      // Populate form based on tab
      switch (tab) {
        case 'personal':
          const personalValues = {
            name: data.user?.username || '',
            email: data.user?.email || '',
            gender: data.profile?.gender || '',
            dob: data.profile?.dob ? moment(data.profile.dob) : null,
            bio: data.profile?.bio || '',
            description: data.profile?.about || '',
          };
          form.setFieldsValue(personalValues);
          setOriginalValues(personalValues);
          break;
          
        case 'professional':
          const professionalValues = {
            title: data.profile?.professional_title || '',
            hourly_rate: data.profile?.hourly_rate || null,
            availability: data.profile?.availability || '',
            
            skills: data.profile?.skills?.map(skill => skill.name) || [],
            location: data.profile?.location || '',
            website: data.profile?.website || '',
          };
          form.setFieldsValue(professionalValues);
          setOriginalValues(professionalValues);
          break;
          
        case 'portfolio':
          const portfolioValues = {
            portfolio: data.profile?.portfolio || [],
          };
          form.setFieldsValue(portfolioValues);
          setOriginalValues(portfolioValues);
          break;
          
        case 'certifications':
          const certificationValues = {
            certifications: data.profile?.certifications?.map(cert => ({
              ...cert,
              date: cert.date ? moment(cert.date) : null,
              expiry_date: cert.expiry_date ? moment(cert.expiry_date) : null,
            })) || [],
          };
          form.setFieldsValue(certificationValues);
          setOriginalValues(certificationValues);
          break;
          
        case 'banking':
          const bankingValues = {
            bank_details: data.profile?.bank_details || {},
            verification_documents: data.profile?.documents?.map(doc => ({
              ...doc,
              expiry_date: doc.expiry_date ? moment(doc.expiry_date) : null,
            })) || [],
          };
          form.setFieldsValue(bankingValues);
          setOriginalValues(bankingValues);
          break;
      }
      
      setProfileData(data);
      setFormChanged(false);
    } catch (error) {
      console.error(`Error fetching ${tab} profile data:`, error);
      message.error(`Failed to load ${tab} data`);
    } finally {
      setTabLoading(false);
    }
  };

  // Handle form submission for each tab
  const handleFormSubmit = async (values) => {
    // Get only the fields for the current tab
    const tabFields = getTabFields(activeTab);
    const currentTabValues = {};
    
    // Extract only the fields that belong to the current tab
    Object.keys(values).forEach(key => {
      if (tabFields.all.includes(key)) {
        currentTabValues[key] = values[key];
      }
    });

    // Get only changed fields for the current tab
    const changedFields = getChangedFields(currentTabValues);
    
    if (Object.keys(changedFields).length === 0) {
      message.info('No changes to save');
      return;
    }

    // Validate only the required fields for the current tab
    const validationErrors = [];
    
    tabFields.required.forEach(fieldName => {
      const fieldValue = currentTabValues[fieldName];
      
      // Check if required field is empty or null
      if (!fieldValue || 
          (typeof fieldValue === 'string' && fieldValue.trim() === '') ||
          (Array.isArray(fieldValue) && fieldValue.length === 0)) {
        validationErrors.push(`${fieldName} is required`);
      }
    });

    if (validationErrors.length > 0) {
      message.error(`Please fill all required fields: ${validationErrors.join(', ')}`);
      return;
    }

    // Convert date fields to strings
    if (changedFields.dob && typeof changedFields.dob !== "string") {
      changedFields.dob = changedFields.dob.format("YYYY-MM-DD");
    }

    if (changedFields.certifications) {
      changedFields.certifications = changedFields.certifications.map(cert => ({
        ...cert,
        date: cert.date && typeof cert.date !== "string" ? cert.date.format("YYYY-MM-DD") : cert.date,
        expiry_date: cert.expiry_date && typeof cert.expiry_date !== "string" ? cert.expiry_date.format("YYYY-MM-DD") : cert.expiry_date,
      }));
    }

    setLoading(true);
    setSaveSuccess(false);
    setSaveSuccessMessage('');
    
    try {
      const accessToken = Cookies.get('accessToken');
      const endpoint = `${getBaseURL()}/api/freelancer/update_profile/${activeTab}/`;

      const response = await axios.put(endpoint, changedFields, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      // Enhanced success feedback
      const successMessage = `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} information updated successfully!`;
      setSaveSuccessMessage(successMessage);
      setSaveSuccess(true);
      setFormChanged(false);
      
      
      // Auto-hide success state after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
        setSaveSuccessMessage('');
      }, 3000);
      
      // Refresh data
      await fetchProfileData(activeTab);
    } catch (error) {
      console.error(`Error updating ${activeTab} profile:`, error);
      message.error(`Failed to update ${activeTab} information`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get required fields for each tab
  const getTabFields = (tab) => {
    switch (tab) {
      case 'personal':
        return {
          required: ['name', 'email'],
          optional: [ 'gender', 'dob', 'bio', 'description'],
          all: ['name', 'email', 'gender', 'dob', 'bio', 'description']
        };
      case 'professional':
        return {
          required: ['title', 'hourly_rate', 'availability', 'skills'],
          optional: ['location', 'website'],
          all: ['title', 'hourly_rate', 'availability', 'skills', 'location', 'website']
        };
      case 'portfolio':
        return {
          required: [],
          optional: ['portfolio'],
          all: ['portfolio']
        };
      case 'certifications':
        return {
          required: [],
          optional: ['certifications'],
          all: ['certifications']
        };
      case 'banking':
        return {
          required: [],
          optional: ['bank_details', 'verification_documents'],
          all: ['bank_details', 'verification_documents']
        };
      default:
        return { required: [], optional: [], all: [] };
    }
  };

  // Enhanced tab change with save & continue
  const handleTabChange = (key) => {
    if (formChanged) {
      Modal.confirm({
        title: 'Unsaved Changes',
        content: 'You have unsaved changes. Do you want to save them before switching tabs?',
        okText: 'Save & Continue',
        cancelText: 'Discard & Continue',
        onOk: async () => {
          try {
            // Use the same validation logic as direct save
            const values = form.getFieldsValue();
            const tabFields = getTabFields(activeTab);
            const currentTabValues = {};
            
            Object.keys(values).forEach(key => {
              if (tabFields.all.includes(key)) {
                currentTabValues[key] = values[key];
              }
            });

            const changedFields = getChangedFields(currentTabValues);
            
            if (Object.keys(changedFields).length > 0) {
              const validationErrors = [];
              
              tabFields.required.forEach(fieldName => {
                const fieldValue = currentTabValues[fieldName];
                
                if (!fieldValue || 
                    (typeof fieldValue === 'string' && fieldValue.trim() === '') ||
                    (Array.isArray(fieldValue) && fieldValue.length === 0)) {
                  validationErrors.push(`${fieldName} is required`);
                }
              });

              if (validationErrors.length > 0) {
                message.error(`Please fill all required fields: ${validationErrors.join(', ')}`);
                return;
              }

              // Save with enhanced feedback
              setLoading(true);
              setSaveSuccess(false);
              
              try {
                const accessToken = Cookies.get('accessToken');
                const endpoint = `${getBaseURL()}/api/freelancer/update_profile/${activeTab}/`;

                const response = await axios.put(endpoint, changedFields, {
                  headers: { Authorization: `Bearer ${accessToken}` }
                });

                const successMessage = `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} saved! Moving to ${key.charAt(0).toUpperCase() + key.slice(1)}...`;
                setSaveSuccessMessage(successMessage);
                setSaveSuccess(true);
                setFormChanged(false);
                
                message.success(successMessage);
                
                // Auto-hide success state after 2 seconds
                setTimeout(() => {
                  setSaveSuccess(false);
                  setSaveSuccessMessage('');
                }, 2000);
                
                setActiveTab(key);
                fetchProfileData(key);
              } catch (error) {
                message.error('Failed to save changes. Please try again.');
                return;
              } finally {
                setLoading(false);
              }
            }
            
            // Switch to new tab
            setActiveTab(key);
            fetchProfileData(key);
          } catch (error) {
            message.error('Failed to save changes. Please try again.');
          }
        },
        onCancel: () => {
          setActiveTab(key);
          fetchProfileData(key);
        },
      });
    } else {
      setActiveTab(key);
      fetchProfileData(key);
    }
  };

  // Handle form values change
  const handleFormValuesChange = (changedValues, allValues) => {
    // Compare current values with original values
    const hasChanges = Object.keys(changedValues).some(key => {
      const currentValue = allValues[key];
      const originalValue = originalValues[key];
      
      if (Array.isArray(currentValue) && Array.isArray(originalValue)) {
        return JSON.stringify(currentValue) !== JSON.stringify(originalValue);
      }
      
      if (currentValue && typeof currentValue === 'object' && currentValue._isAMomentObject) {
        return !originalValue || !originalValue.isSame(currentValue);
      }
      
      return currentValue !== originalValue;
    });
    
    setFormChanged(hasChanges);
  };

  // Get only changed fields for the current tab
  const getChangedFields = (values) => {
    const changedFields = {};
    
    Object.keys(values).forEach(key => {
      const currentValue = values[key];
      const originalValue = originalValues[key];
      
      if (Array.isArray(currentValue) && Array.isArray(originalValue)) {
        if (JSON.stringify(currentValue) !== JSON.stringify(originalValue)) {
          changedFields[key] = currentValue;
        }
      } else if (currentValue && typeof currentValue === 'object' && currentValue._isAMomentObject) {
        if (!originalValue || !originalValue.isSame(currentValue)) {
          changedFields[key] = currentValue;
        }
      } else if (currentValue !== originalValue) {
        changedFields[key] = currentValue;
      }
    });
    
    return changedFields;
  };

  // Handle next tab navigation
  const handleNextTab = () => {
    const tabOrder = ['personal', 'professional', 'portfolio', 'certifications', 'banking'];
    const currentIndex = tabOrder.indexOf(activeTab);
    const nextTab = tabOrder[currentIndex + 1];
    
    if (nextTab) {
      if (formChanged) {
        Modal.confirm({
          title: 'Save & Continue',
          content: 'Would you like to save your changes before moving to the next tab?',
          okText: 'Save & Continue',
          cancelText: 'Continue Without Saving',
          onOk: async () => {
            try {
              const values = form.getFieldsValue();
              const tabFields = getTabFields(activeTab);
              const currentTabValues = {};
              
              Object.keys(values).forEach(key => {
                if (tabFields.all.includes(key)) {
                  currentTabValues[key] = values[key];
                }
              });

              const changedFields = getChangedFields(currentTabValues);
              
              if (Object.keys(changedFields).length > 0) {
                setLoading(true);
                setSaveSuccess(false);
                
                try {
                  const accessToken = Cookies.get('accessToken');
                  const endpoint = `${getBaseURL()}/api/freelancer/update_profile/${activeTab}/`;

                  const response = await axios.put(endpoint, changedFields, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                  });

                  const successMessage = `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} saved! Moving to ${nextTab.charAt(0).toUpperCase() + nextTab.slice(1)}...`;
                  setSaveSuccessMessage(successMessage);
                  setSaveSuccess(true);
                  setFormChanged(false);
                  
                  message.success(successMessage);
                  
                  // Auto-advance to next tab after 1.5 seconds
                  const timer = setTimeout(() => {
                    setActiveTab(nextTab);
                    fetchProfileData(nextTab);
                    setSaveSuccess(false);
                    setSaveSuccessMessage('');
                  }, 1500);
                  
                  setAutoNextTimer(timer);
                  
                  await fetchProfileData(activeTab);
                } catch (error) {
                  message.error('Failed to save changes. Please try again.');
                  return;
                } finally {
                  setLoading(false);
                }
              } else {
                setActiveTab(nextTab);
                fetchProfileData(nextTab);
              }
            } catch (error) {
              message.error('Failed to save changes. Please try again.');
            }
          },
          onCancel: () => {
            setActiveTab(nextTab);
            fetchProfileData(nextTab);
          },
        });
      } else {
        setActiveTab(nextTab);
        fetchProfileData(nextTab);
      }
    }
  };

  // Handle previous tab navigation
  const handlePrevTab = () => {
    const tabOrder = ['personal', 'professional', 'portfolio', 'certifications', 'banking'];
    const currentIndex = tabOrder.indexOf(activeTab);
    const prevTab = tabOrder[currentIndex - 1];
    
    if (prevTab) {
      handleTabChange(prevTab);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoNextTimer) {
        clearTimeout(autoNextTimer);
      }
    };
  }, [autoNextTimer]);

  // Load initial data for personal tab
  useEffect(() => {
    fetchProfileData('personal');
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        message.error('Only image files are allowed!');
        return;
      }
      setFile(file);
      setShowingProfilePicture(URL.createObjectURL(file));
      setProfilePictureModalVisible(true);
    }
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = async () => {
    if (!file) {
      message.error('Please select an image first');
      return;
    }

    setUploadingProfilePicture(true);
    try {
      const formData = new FormData();
      formData.append('profile_picture', file);

      const accessToken = Cookies.get('accessToken');
      const response = await axios.put(
        `${getBaseURL()}/api/freelancer/update_profile_picture/`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      message.success('Profile picture updated successfully!');
      setProfilePictureModalVisible(false);
      setFile(null);
      setCroppedImage(null);
      
      // Refresh profile data to get updated picture
      await fetchProfileData(activeTab);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      message.error('Failed to update profile picture');
    } finally {
      setUploadingProfilePicture(false);
    }
  };

  // Handle modal cancel
  const handleProfilePictureModalCancel = () => {
    setProfilePictureModalVisible(false);
    setFile(null);
    setCroppedImage(null);
    setShowingProfilePicture(null);
  };

  // Profile Picture Modal Component
  const ProfilePictureModal = () => {
    return (
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-freelancer-accent flex items-center justify-center">
              <FaUser className="text-white text-sm" />
            </div>
            <span className="text-lg font-semibold">Update Profile Picture</span>
          </div>
        }
        open={profilePictureModalVisible}
        onCancel={handleProfilePictureModalCancel}
        footer={[
          <Button key="cancel" onClick={handleProfilePictureModalCancel}>
            Cancel
          </Button>,
          <Button 
            key="upload" 
            type="primary"
            loading={uploadingProfilePicture}
            onClick={handleProfilePictureUpload}
            className="bg-freelancer-accent hover:bg-freelancer-accent-hover"
          >
            {uploadingProfilePicture ? 'Uploading...' : 'Save Changes'}
          </Button>
        ]}
        width={600}
        centered
      >
        <div className="space-y-6">
          {/* Current Profile Picture */}
          <div className="text-center">
            <div className="mb-4">
              <h4 className="text-base font-medium text-text-primary mb-2">Current Picture</h4>
              <img
                src={
                  showingProfilePicture || 
                  (profileData?.profile?.profile_picture || "https://www.w3schools.com/howto/img_avatar.png")
                }
                alt="Current Profile"
                className={`w-24 h-24 rounded-full object-cover border-4 border-freelancer-primary mx-auto`}
              />
            </div>
          </div>

          {/* New Profile Picture Preview */}
          {showingProfilePicture && (
            <div className="text-center">
              <div className="mb-4">
                <h4 className="text-base font-medium text-text-primary mb-2">New Picture</h4>
                <div className="relative inline-block">
                  <img
                    src={showingProfilePicture}
                    alt="New Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-freelancer-accent mx-auto"
                  />
                  <div className="absolute inset-0 rounded-full bg-black bg-opacity-20 flex items-center justify-center">
                    
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* File Input */}
          <div className="flex flex-col items-center gap-3">
            <input
              id="profilePicInput"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Button
              icon={<UploadOutlined />}
              onClick={() => document.getElementById('profilePicInput').click()}
              className="bg-freelancer-primary hover:bg-freelancer-secondary text-white"
            >
              Choose New Picture
            </Button>
            {file && (
              <span className="text-sm text-freelancer-tertiary break-all">
                {file.name}
              </span>
            )}
          </div>
        </div>
      </Modal>
    );
  };

  const handleDocumentFileChange = (e, docId) => {
    const file = e.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
            message.error('Only image and PDF files are allowed!');
            return;
        }
        
        setDocumentFiles(prev => ({
            ...prev,
            [docId]: file
        }));
        
        const docs = form.getFieldValue('verification_documents') || [];
        const updatedDocs = docs.map(doc => {
            if ((doc.id && doc.id === docId) || (doc.temp_id && doc.temp_id === docId)) {
                return {
                    ...doc,
                    document_file_name: file.name,
                    preview_url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
                };
            }
            return doc;
        });
        
        form.setFieldsValue({ verification_documents: updatedDocs });
        message.success(`File "${file.name}" attached successfully`);
    }
  };

  const handleDocumentView = (document) => {
    if (document.document_file?.url) {
      window.open(document.document_file.url, '_blank');
    } else if (document.preview_url) {
      window.open(document.preview_url, '_blank');
    }
  };

  const handleDocumentDelete = async (name, currentDoc, remove) => {
    const hasFilledFields = Object.values(currentDoc).some(value => 
      value !== null && value !== undefined && value !== ''
    );
    
    if (hasFilledFields) {
      Modal.confirm({
        title: 'Delete Document',
        content: 'Are you sure you want to delete this document?',
        okText: 'Yes, delete',
        okType: 'danger',
        cancelText: 'No, keep it',
        onOk: () => {
          remove(name);
          message.success('Document removed successfully');
        }
      });
    } else {
      remove(name);
    }
  };

  // Terms and Conditions Modal Component
  const TermsAndConditionsModal = () => {
    return (
      <Modal
        title="Veloro Terms and Conditions"
        open={termsModalVisible}
        onCancel={() => setTermsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setTermsModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        <div className="terms-content" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '15px' }}>
          <h3>Financial Information Terms</h3>
          <p>
            By accepting these terms, you agree to the following conditions regarding your financial and verification information:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>All financial information provided is accurate and up-to-date.</li>
            <li>You authorize us to verify the bank account information provided.</li>
            <li>You understand that verification documents will be reviewed for authenticity.</li>
            <li>Changes to financial information may require additional verification.</li>
            <li>You acknowledge that providing false information is grounds for account termination.</li>
            <li>We may share your information with regulatory bodies as required by law.</li>
            <li>You understand that bank details are used for payment processing.</li>
            <li>Your information will be stored securely according to our privacy policy.</li>
          </ol>
        </div>
      </Modal>
    );
  };

  // Terms Section Component
  const TermsSection = () => {
    if (profileData?.profile?.terms_accepted) {
      return (
        <Alert
          message="Terms and Conditions Accepted"
          description="You have already accepted the terms and conditions for banking and payments."
          type="success"
          showIcon
          className="mb-4"
        />
      );
    }

    return (
      <div className="bg-freelancer-bg-card p-6 rounded-lg border-2 border-freelancer-primary mb-6">
        <h3 className="text-xl font-semibold mb-3 text-text-primary">Terms and Conditions</h3>
        <p className="text-text-secondary mb-4">
          Please accept the terms and conditions to proceed with banking details.
        </p>
        <div className="space-y-4">
          <Checkbox 
            onChange={(e) => {
              setIsCheckboxChecked(e.target.checked);
              setTermsAccepted(e.target.checked);
            }}
            checked={isCheckboxChecked}
            className="text-text-primary text-base"
          >
            I accept Veloro's terms and conditions for banking and payments
          </Checkbox>
          <div className="flex gap-4">
            <Button 
              type="primary"
              onClick={() => setTermsModalVisible(true)}
              className="bg-freelancer-primary hover:bg-freelancer-secondary"
            >
              View Terms and Conditions
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  // Skeleton component for tab loading state
  const TabSkeleton = () => (
    <div className="p-6 md:p-8 space-y-8">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-600 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-600 rounded"></div>
          <div className="h-10 bg-gray-600 rounded"></div>
          <div className="h-10 bg-gray-600 rounded"></div>
        </div>
      </div>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-600 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-600 rounded"></div>
          <div className="h-20 bg-gray-600 rounded"></div>
        </div>
      </div>
    </div>
  );

  // Success indicator component
  const SuccessIndicator = () => (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right duration-300">
        <CheckCircleOutlined className="text-lg" />
        <span className="font-medium">{saveSuccessMessage}</span>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto bg-freelancer-bg min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mx-auto space-y-4 ${
          isMobile ? 'p-2' : 
          isTablet ? 'p-4 max-w-[900px]' : 
          'p-6 max-w-[1200px]'
        }`}
      >
        {/* Header Section */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br from-freelancer-primary via-freelancer-primary/95 to-freelancer-bg-dark"
        >
          <div className="relative py-2 px-3 sm:py-3 sm:px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Edit Profile</h2>
                <p className="text-sm sm:text-base text-freelancer-tertiary">Update your professional information</p>
              </div>
              <motion.div whileHover={{ scale: 1.02 }}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate(`/freelancer/profile/${userId}/view_profile`)}
                  className="bg-freelancer-accent hover:bg-freelancer-accent/90 text-text-light border-none h-8 sm:h-10 text-sm sm:text-base"
                >
                  Back to Profile
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <Form
          form={form}
          onFinish={handleFormSubmit}
          onValuesChange={handleFormValuesChange}
          onFinishFailed={(errorInfo) => {
            console.log("Form validation failed:", errorInfo);
            // Don't show the default error message - we'll handle validation ourselves
          }}
          layout="vertical"
          className="space-y-4 sm:space-y-6"
          validateTrigger={[]}
        >
          {/* Profile Picture Section */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-freelancer-bg-card rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-3 sm:p-6 md:p-8">
              <div className="flex flex-col items-center space-y-4 sm:space-y-6">
                <div className="relative group">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                  >
                    <img
                      src={
                        showingProfilePicture || 
                        (profileData?.profile?.profile_picture || "https://www.w3schools.com/howto/img_avatar.png")
                      }
                      alt="Profile"
                      className={`rounded-full object-cover border-4 border-white shadow-xl ${
                        isMobile ? 'w-24 h-24' :
                        isTablet ? 'w-32 h-32' :
                        'w-40 h-40'
                      }`}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-300" />
                    <Tooltip title="Change Profile Picture">
                      <Button
                        icon={<EditOutlined className="text-base sm:text-lg" />}
                        className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 rounded-full bg-freelancer-primary text-text-light border-none hover:bg-freelancer-secondary shadow-lg flex items-center justify-center"
                        style={{
                          width: isMobile ? '32px' : '40px',
                          height: isMobile ? '32px' : '40px'
                        }}
                        onClick={() => setProfilePictureModalVisible(true)}
                      />
                    </Tooltip>
                  </motion.div>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary text-center">Click the edit button to update your profile picture</p>
              </div>
            </div>
          </motion.div>

          {/* Tabs Section */}
          <motion.div 
            variants={containerVariants}
            className="rounded-lg sm:rounded-xl shadow-lg overflow-hidden bg-gradient-to-br from-freelancer-secondary/40 to-freelancer-bg-dark/30 backdrop-blur-xl border border-white/10"
          >
            <Tabs 
              defaultActiveKey="personal" 
              activeKey={activeTab}
              onChange={handleTabChange}
              className="custom-tabs"
              type={isMobile ? "line" : "card"}
              tabBarStyle={{
                margin: 0,
                padding: isMobile ? '12px 16px 0' : '16px 24px 0',
                background: 'transparent',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Personal Information Tab */}
              <Tabs.TabPane 
                key="personal" 
                tab={
                  <span className="flex items-center gap-2 text-base">
                    <FaUser className="text-lg" />
                    Personal Info
                  </span>
                }
              >
                {tabLoading ? <TabSkeleton /> : (
                  <motion.div 
                    variants={itemVariants} 
                    className="p-6 md:p-8 space-y-6"
                  >
                    <Card className="mb-4 bg-gradient-to-br from-freelancer-secondary/40 to-freelancer-bg-dark/30 backdrop-blur-xl border border-white/10">
                      <Row gutter={24}>
                        <Col span={24} md={12}>
                          <Form.Item label={<span><FaUser className="mr-2" /> Name</span>} name="name">
                            <Input 
                              className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                              placeholder="Enter your name"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={24} md={12}>
                          <Form.Item label={<span><FaEnvelope className="mr-2" /> Email</span>} name="email">
                            <Input 
                              className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                              placeholder="Enter your email"
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col span={24} md={12}>
                          <Form.Item label="Date of Birth" name="dob">
                            <DatePicker 
                              className="bg-freelancer-bg-card text-text-light border-freelancer-border-DEFAULT w-full"
                              placeholder="Select your date of birth"
                              format="YYYY-MM-DD"
                              allowClear
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>

                    <Card className="mb-4 bg-gradient-to-br from-freelancer-secondary/40 to-freelancer-bg-dark/30 backdrop-blur-xl border border-white/10">
                      <Row gutter={24}>
                        <Col span={24}>
                          <Form.Item label="Bio" name="bio">
                            <Input.TextArea 
                              className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                              placeholder="Enter your bio"
                              rows={3}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={24}>
                          <Form.Item label="Description" name="description">
                            <Input.TextArea 
                              className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                              placeholder="Enter your description"
                              rows={4}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  </motion.div>
                )}
              </Tabs.TabPane>

              {/* Professional Information Tab */}
              <Tabs.TabPane 
                key="professional" 
                tab={
                  <span className="flex items-center gap-2 text-base">
                    <FaBriefcase className="text-lg" />
                    Professional Info
                  </span>
                }
              >
                {tabLoading ? <TabSkeleton /> : (
                  <motion.div 
                    variants={itemVariants} 
                    className="p-6 md:p-8 space-y-6"
                  >
                    <Card className="mb-4 bg-gradient-to-br from-freelancer-secondary/40 to-freelancer-bg-dark/30 backdrop-blur-xl border border-white/10">
                      <Row gutter={24}>
                        <Col span={24} md={12}>
                          <Form.Item label={<span><FaUser className="mr-2" /> Professional Title</span>} name="title">
                            <Input 
                              className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                              placeholder="Enter your professional title"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={24} md={12}>
                          <Form.Item label="Hourly Rate (USD)" name="hourly_rate">
                            <InputNumber 
                              className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10 w-full"
                              placeholder="Enter your hourly rate"
                              min={0}
                              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={24} md={12}>
                          <Form.Item label="Availability" name="availability">
                            <Select 
                              className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                              placeholder="Select your availability"
                            >
                              <Option value="available">Available</Option>
                              <Option value="busy">Busy</Option>
                              <Option value="not_available">Not Available</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>

                    <Card className="mb-4 bg-gradient-to-br from-freelancer-secondary/40 to-freelancer-bg-dark/30 backdrop-blur-xl border border-white/10">
                      <Row gutter={24}>
                        <Col span={24}>
                          <Form.Item label={<span><FaCode className="mr-2" /> Skills</span>} name="skills">
                            <Select 
                              mode="tags"  // Allows users to add new tags dynamically
                              showSearch  // Enables search functionality to improve performance with large lists
                              filterOption={(input, option) =>  // Custom filter for better matching
                                option.children.toLowerCase().includes(input.toLowerCase())
                              }
                              className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                              placeholder="Select or add your skills"
                            >
                              {allSkills.map(skill => (
                                <Option key={skill.id} value={skill.name}>
                                  {skill.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  </motion.div>
                )}
              </Tabs.TabPane>

              {/* Portfolio Tab */}
              <Tabs.TabPane 
                key="portfolio" 
                tab={
                  <span className="flex items-center gap-2 text-base">
                    <FaTrophy className="text-lg" />
                    Portfolio
                  </span>
                }
              >
                {tabLoading ? <TabSkeleton /> : (
                  <motion.div 
                    variants={itemVariants} 
                    className="p-6 md:p-8 space-y-6"
                  >
                    <Form.List name="portfolio">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name, ...restField }) => (
                            <Card key={key} className="mb-4">
                              <Row gutter={24}>
                                <Col span={24}>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'title']}
                                    label={<span><FaBook className="mr-2" /> Project Title</span>}
                                  >
                                    <Input 
                                      className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                                      placeholder="Enter project title"
                                    />
                                  </Form.Item>
                                </Col>
                                <Col span={24}>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'description']}
                                    label={<span><FaBook className="mr-2" /> Project Description</span>}
                                  >
                                    <Input.TextArea 
                                      className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                                      placeholder="Enter project description"
                                      rows={4}
                                    />
                                  </Form.Item>
                                </Col>
                                <Col span={24} md={12}>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'technologies']}
                                    label={<span><FaCode className="mr-2" /> Technologies Used</span>}
                                  >
                                    <Select 
                                      mode="tags"
                                      className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                                      placeholder="Enter technologies used"
                                    >
                                      <Option value="React">React</Option>
                                      <Option value="Node.js">Node.js</Option>
                                      <Option value="Python">Python</Option>
                                      <Option value="AWS">AWS</Option>
                                    </Select>
                                  </Form.Item>
                                </Col>
                                <Col span={24} md={12}>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'link']}
                                    label={<span><FaLink className="mr-2" /> Project Link</span>}
                                  >
                                    <Input 
                                      className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                                      placeholder="Enter project link"
                                    />
                                  </Form.Item>
                                </Col>
                              </Row>
                              <Button danger onClick={() => remove(name)}>Delete Project</Button>
                            </Card>
                          ))}
                          <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                            Add Project
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </motion.div>
                )}
              </Tabs.TabPane>

              {/* Certifications Tab */}
              <Tabs.TabPane 
                key="certifications" 
                tab={
                  <span className="flex items-center gap-2 text-base">
                    <FaCertificate className="text-lg" />
                    Certifications
                  </span>
                }
              >
                {tabLoading ? <TabSkeleton /> : (
                  <motion.div 
                    variants={itemVariants} 
                    className="p-6 md:p-8 space-y-6"
                  >
                    <Form.List name="certifications">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name, ...restField }) => {
                            const currentCert = form.getFieldValue(['certifications', name]);
                            const isVerified = currentCert?.verified;
                            
                            return (
                            <Card key={key} className="mb-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                                  <h4 className="text-lg font-semibold">Certification Details</h4>
                                  {isVerified && (
                                    <Tag color="success" className="flex items-center gap-1">
                                      <CheckCircleOutlined />Verified
                                    </Tag>
                                  )}
                                </div>
                              <Row gutter={24}>
                                <Col span={24} md={12}>
                                  <Form.Item
                                    {...restField}
                                      name={[name, 'name']}
                                      label={<span><FaCertificate className="mr-2" /> Certification Name</span>}
                                    rules={[{ required: true }]}
                                  >
                                    <Input 
                                      className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                                        placeholder="Enter certification name"
                                        readOnly={isVerified}
                                    />
                                  </Form.Item>
                                </Col>
                                <Col span={24} md={12}>
                                  <Form.Item
                                    {...restField}
                                      name={[name, 'issuer']}
                                      label={<span><FaUniversity className="mr-2" /> Issuing Organization</span>}
                                    rules={[{ required: true }]}
                                  >
                                    <Input 
                                      className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                                        placeholder="Enter issuing organization"
                                        readOnly={isVerified}
                                    />
                                  </Form.Item>
                                </Col>
                                <Col span={24} md={12}>
                                  <Form.Item
                                    {...restField}
                                      name={[name, 'date']}
                                      label={<span><FaCalendar className="mr-2" /> Issue Date</span>}
                                    rules={[{ required: true }]}
                                  >
                                    <DatePicker 
                                      className="bg-freelancer-bg-card text-text-light border-freelancer-border-DEFAULT w-full"
                                        placeholder="Select issue date"
                                      format="YYYY-MM-DD"
                                      allowClear
                                        disabled={isVerified}
                                    />
                                  </Form.Item>
                                </Col>
                                <Col span={24} md={12}>
                                  <Form.Item
                                    {...restField}
                                      name={[name, 'expiry_date']}
                                      label={<span><FaCalendar className="mr-2" /> Expiry Date</span>}
                                  >
                                    <DatePicker 
                                      className="bg-freelancer-bg-card text-text-light border-freelancer-border-DEFAULT w-full"
                                        placeholder="Select expiry date"
                                      format="YYYY-MM-DD"
                                      allowClear
                                        disabled={isVerified}
                                    />
                                  </Form.Item>
                                </Col>
                                  <Col span={24} md={12}>
                                  <Form.Item
                                    {...restField}
                                      name={[name, 'credential_id']}
                                      label={<span><FaShieldAlt className="mr-2" /> Credential ID</span>}
                                  >
                                      <Input 
                                      className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                                        placeholder="Enter credential ID"
                                        readOnly={isVerified}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={24} md={12}>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'verification_url']}
                                      label={<span><FaLink className="mr-2" /> Verification URL</span>}
                                    >
                                      <Input 
                                        className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                                        placeholder="Enter verification URL"
                                        readOnly={isVerified}
                                    />
                                  </Form.Item>
                                </Col>
                              </Row>
                                {!isVerified && (
                                  <Button danger onClick={() => remove(name)} className="mt-4">
                                    Delete Certification
                                  </Button>
                                )}
                            </Card>
                            );
                          })}
                          <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                            Add Certification
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </motion.div>
                )}
              </Tabs.TabPane>

              {/* Banking & Documents Tab */}
              <Tabs.TabPane 
                key="banking" 
                tab={
                  <span className="flex items-center gap-2 text-base">
                    <BankOutlined className="text-lg" />
                    Banking & Docs
                  </span>
                }
              >
                {tabLoading ? <TabSkeleton /> : (
                  <motion.div 
                    variants={itemVariants} 
                    className="p-6 md:p-8 space-y-6"
                  >
                    {/* Terms and Conditions Section */}
                    <TermsSection />

                    {/* Bank Details Card */}
                    <Card 
                      title={
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <span className="text-lg font-semibold">Bank Details</span>
                          {profileData?.profile?.bank_details?.verified && (
                            <Tag color="success" className="flex items-center gap-1">
                              <CheckCircleOutlined />Verified
                            </Tag>
                          )}
                        </div>
                      }
                      className="mb-6"
                    >
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={12}>
                          <Form.Item name={['bank_details', 'id']} hidden>
                            <Input type="hidden" />
                          </Form.Item>
                          <Form.Item 
                            name={['bank_details', 'bank_name']} 
                            label="Bank Name"
                          >
                            <Input 
                              className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                              readOnly={profileData?.profile?.bank_details?.verified}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12}>
                          <Form.Item 
                            name={['bank_details', 'account_number']} 
                            label="Account Number"
                          >
                            <Input 
                              className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                              readOnly={profileData?.profile?.bank_details?.verified}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12}>
                          <Form.Item 
                            name={['bank_details', 'ifsc_code']} 
                            label="IFSC Code"
                          >
                            <Input 
                              className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                              readOnly={profileData?.profile?.bank_details?.verified}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12}>
                          <Form.Item 
                            name={['bank_details', 'account_holder_name']} 
                            label="Account Holder Name"
                          >
                            <Input 
                              className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                              readOnly={profileData?.profile?.bank_details?.verified}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12}>
                          <Form.Item 
                            name={['bank_details', 'branch_name']} 
                            label="Branch Name"
                          >
                            <Input 
                              className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                              readOnly={profileData?.profile?.bank_details?.verified}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12}>
                          <Form.Item 
                            name={['bank_details', 'swift_code']} 
                            label="SWIFT Code"
                          >
                            <Input 
                              className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10"
                              readOnly={profileData?.profile?.bank_details?.verified}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12}>
                          <Form.Item 
                            name={['bank_details', 'primary']} 
                            valuePropName="checked"
                          >
                            <Switch 
                              checkedChildren="Primary" 
                              unCheckedChildren="Not Primary"
                              disabled={profileData?.profile?.bank_details?.verified}
                            />
                          </Form.Item>
                        </Col>
                        {profileData?.profile?.bank_details?.verified && (
                          <Col span={24}>
                            <Alert
                              message="Bank Details Verified"
                              description="These bank details have been verified and cannot be modified. Please contact support if you need to make changes."
                              type="info"
                              showIcon
                              className="mt-4"
                            />
                          </Col>
                        )}
                      </Row>
                    </Card>

                    {/* Verification Documents */}
                    <Form.List name="verification_documents">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name, ...restField }) => {
                            const currentDoc = form.getFieldValue(['verification_documents', name]);
                            const docId = currentDoc?.id || currentDoc?.temp_id || key;
                            const isVerified = currentDoc?.verified;
                            
                            return (
                              <Card key={key} className="mb-4">
                                <Row gutter={[16, 16]}>
                                  <Col xs={24} sm={24}>
                                    <Form.Item {...restField} name={[name, 'id']} hidden>
                                      <Input type="hidden" />
                                    </Form.Item>
                                    <Form.Item 
                                      {...restField} 
                                      name={[name, 'temp_id']} 
                                      hidden
                                    >
                                      <Input type="hidden" />
                                    </Form.Item>
                                    <Form.Item 
                                      {...restField} 
                                      name={[name, 'document_type']} 
                                      label="Document Type"
                                      rules={[{ required: true, message: 'Document type is required' }]}
                                    >
                                      <Select 
                                        className="bg-freelancer-bg-card text-text-light border-freelancer-border-DEFAULT"
                                        disabled={isVerified}
                                      >
                                        <Select.Option value="id_proof">ID Proof</Select.Option>
                                        <Select.Option value="address_proof">Address Proof</Select.Option>
                                        <Select.Option value="pan_card">PAN Card</Select.Option>
                                        <Select.Option value="passport">Passport</Select.Option>
                                        <Select.Option value="driving_license">Driving License</Select.Option>
                                        <Select.Option value="aadhar_card">Aadhar Card</Select.Option>
                                        <Select.Option value="bank_statement">Bank Statement</Select.Option>
                                        <Select.Option value="utility_bill">Utility Bill</Select.Option>
                                      </Select>
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} sm={12}>
                                    <Form.Item 
                                      {...restField} 
                                      name={[name, 'document_number']} 
                                      label="Document Number"
                                      rules={[{ required: true, message: 'Document number is required' }]}
                                    >
                                      <Input 
                                        className="bg-freelancer-bg-card text-text-light border-freelancer-border-DEFAULT"
                                        readOnly={isVerified}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} sm={12}>
                                    <Form.Item 
                                      {...restField} 
                                      name={[name, 'expiry_date']} 
                                      label="Expiry Date"
                                      rules={[{ required: true, message: 'Expiry date is required' }]}
                                    >
                                      <DatePicker 
                                        className="bg-freelancer-bg-card text-text-light border-freelancer-border-DEFAULT w-full"
                                        disabled={isVerified}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24}>
                                    <Form.Item 
                                      {...restField} 
                                      name={[name, 'verification_notes']} 
                                      label="Verification Notes"
                                    >
                                      <Input.TextArea 
                                        rows={2} 
                                        className="bg-freelancer-bg-card text-text-light border-freelancer-border-DEFAULT"
                                        readOnly={isVerified}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24}>
                                    <Form.Item 
                                      {...restField} 
                                      name={[name, 'document_file']} 
                                      label="Document File"
                                      rules={[{ required: true, message: 'Document file is required' }]}
                                      className="mb-2"
                                    >
                                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                        <Button 
                                          onClick={() => document.getElementById(`doc_file_${docId}`).click()}
                                          icon={<UploadOutlined />}
                                          disabled={isVerified}
                                        >
                                          Select File
                                        </Button>
                                        <input
                                          id={`doc_file_${docId}`}
                                          type="file"
                                          style={{ display: 'none' }}
                                          onChange={(e) => handleDocumentFileChange(e, docId)}
                                          accept="image/*,.pdf"
                                          disabled={isVerified}
                                        />
                                        <span className="text-sm text-freelancer-tertiary break-all">
                                          {currentDoc?.document_file_name || 
                                           (currentDoc?.document_file?.url ? 
                                              "Current file: " + currentDoc.document_file.url.split('/').pop() : 
                                              "No file selected")}
                                        </span>
                                        {currentDoc?.preview_url && (
                                          <img 
                                            src={currentDoc.preview_url} 
                                            alt="Document preview" 
                                            className="w-20 h-20 object-cover rounded"
                                          />
                                        )}
                                      </div>
                                      {isVerified && (
                                        <Tag color="success" className="mt-2 flex items-center w-fit gap-1">
                                          <CheckCircleOutlined />Verified
                                        </Tag>
                                      )}
                                    </Form.Item>
                                  </Col>
                                </Row>
                                
                                <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                                  {(currentDoc?.document_file?.url || currentDoc?.preview_url) && (
                                    <Button 
                                      type="primary"
                                      onClick={() => handleDocumentView(currentDoc)}
                                      icon={<EyeOutlined />}
                                    >
                                      View Document
                                    </Button>
                                  )}
                                  {!isVerified && (
                                    <Button 
                                      danger 
                                      onClick={() => handleDocumentDelete(name, currentDoc, remove)}
                                      icon={<DeleteOutlined />}
                                    >
                                      Delete Document
                                    </Button>
                                  )}
                                </div>
                              </Card>
                            );
                          })}
                          <Button 
                            type="dashed" 
                            onClick={() => {
                              const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                              add({ temp_id: tempId });
                            }} 
                            block 
                            icon={<PlusOutlined />}
                          >
                            Add Document
                          </Button>
                        </>
                      )}
                    </Form.List>

                  </motion.div>
                )}
              </Tabs.TabPane>

            </Tabs>
          </motion.div>

          {/* Navigation and Submit Buttons */}
          <motion.div 
            variants={itemVariants} 
            className={`flex justify-between items-center pt-6 sm:pt-8 ${
              isMobile ? 'sticky bottom-0 bg-freelancer-bg/95 backdrop-blur-md p-4 border-t border-white/10' : 'border-t border-white/10 pt-6'
            }`}
          >
            {/* Left Side - Navigation */}
            <div className="flex items-center gap-3">
              <Button 
                onClick={handlePrevTab}
                disabled={activeTab === 'personal'}
                icon={<ArrowLeftOutlined />}
                className="bg-freelancer-secondary/80 hover:bg-freelancer-secondary text-text-light border-none h-10 w-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous Tab"
              />
              
              <div className="hidden sm:flex items-center gap-2 text-sm text-freelancer-tertiary">
                <span className="font-medium text-text-secondary">Tab</span>
                <span className="bg-freelancer-primary px-2 py-1 rounded-md text-white text-xs font-semibold">
                  {['personal', 'professional', 'portfolio', 'certifications', 'banking'].indexOf(activeTab) + 1}/5
                </span>
              </div>
              
              <Button 
                onClick={handleNextTab}
                disabled={activeTab === 'banking'}
                icon={<ArrowLeftOutlined style={{ transform: 'rotate(180deg)' }} />}
                className="bg-freelancer-secondary/80 hover:bg-freelancer-secondary text-text-light border-none h-10 w-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next Tab"
              />
            </div>
            
            {/* Right Side - Actions */}
            <div className="flex items-center gap-3">
              {formChanged && (
                <Button 
                  onClick={() => {
                    form.setFieldsValue(originalValues);
                    setFormChanged(false);
                  }}
                  icon={<DeleteOutlined />}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 h-10 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2"
                  title="Discard Changes"
                >
                  <span className="hidden sm:inline">Discard</span>
                </Button>
              )}
              
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
                disabled={!formChanged || loading || saveSuccess}
                icon={loading ? <LoadingOutlined /> : (saveSuccess ? <CheckCircleOutlined /> : <SaveOutlined />)}
                className={`bg-gradient-to-r from-freelancer-accent to-freelancer-accent-hover hover:from-freelancer-accent-hover hover:to-freelancer-accent text-white border-none h-10 px-6 rounded-lg text-sm font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  saveSuccess ? '!bg-green-500 !from-green-500 !to-green-600' : ''
                }`}
                title={`Save ${activeTab} Changes`}
              >
                <span className="hidden sm:inline">
                  {loading ? 'Saving...' : (saveSuccess ? 'Saved!' : `Save ${activeTab}`)}
                </span>
                <span className="sm:hidden">
                  {loading ? 'Saving...' : (saveSuccess ? 'Saved!' : 'Save')}
                </span>
              </Button>
            </div>
          </motion.div>
        </Form>
      </motion.div>

      {/* Success Indicator */}
      {saveSuccess && <SuccessIndicator />}

      {/* Terms Modal */}
      <TermsAndConditionsModal />

      {/* Profile Picture Modal */}
      <ProfilePictureModal />

      {/* Custom styles */}
      <style jsx global>{`
        /* Form Controls - Responsive Styling */
        .ant-form-item-label > label {
          font-size: ${isMobile ? '0.875rem' : '1rem'} !important;
          padding-bottom: ${isMobile ? '4px' : '8px'} !important;
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .ant-input,
        .ant-input-textarea,
        .ant-select-selector,
        .ant-picker {
          padding: ${isMobile ? '6px 11px' : '8px 12px'} !important;
          font-size: ${isMobile ? '0.875rem' : '1rem'} !important;
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: white !important;
        }

        .ant-input:hover,
        .ant-input-textarea:hover,
        .ant-select-selector:hover,
        .ant-picker:hover {
          border-color: var(--freelancer-accent) !important;
        }

        .ant-input:focus,
        .ant-input-textarea:focus,
        .ant-select-selector:focus,
        .ant-picker:focus {
          border-color: var(--freelancer-accent) !important;
          box-shadow: 0 0 0 2px rgba(var(--freelancer-accent-rgb), 0.2) !important;
        }

        /* Enhanced Select Styling */
        .ant-select {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 6px !important;
        }

        .ant-select-selector {
          background: rgba(255, 255, 255, 0.05) !important;
          border: none !important;
          color: white !important;
          padding: ${isMobile ? '6px 11px' : '8px 12px'} !important;
          font-size: ${isMobile ? '0.875rem' : '1rem'} !important;
        }

        .ant-select-selection-placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
          font-size: ${isMobile ? '0.875rem' : '1rem'} !important;
        }

        .ant-select-selection-item {
          color: white !important;
          font-size: ${isMobile ? '0.875rem' : '1rem'} !important;
        }

        .ant-select-selection-search-input {
          color: white !important;
          font-size: ${isMobile ? '0.875rem' : '1rem'} !important;
        }

        .ant-select-focused .ant-select-selector {
          border-color: var(--freelancer-accent) !important;
          box-shadow: 0 0 0 2px rgba(var(--freelancer-accent-rgb), 0.2) !important;
        }

        .ant-select:hover .ant-select-selector {
          border-color: var(--freelancer-accent) !important;
        }

        /* Multi-select specific styling */
        .ant-select-multiple .ant-select-selection-item {
          background: var(--freelancer-accent) !important;
          border: 1px solid var(--freelancer-accent) !important;
          color: white !important;
          border-radius: 4px !important;
          margin: 2px 4px 2px 0 !important;
          padding: 2px 8px !important;
        }

        .ant-select-multiple .ant-select-selection-item-remove {
          color: white !important;
          margin-left: 4px !important;
        }

        .ant-select-multiple .ant-select-selection-item-remove:hover {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        /* Select Dropdown Styling */
        .ant-select-dropdown {
          background: var(--freelancer-tertiary) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
        }

        .ant-select-item {
          color: rgba(255, 255, 255, 0.8) !important;
          font-size: ${isMobile ? '0.875rem' : '1rem'} !important;
          padding: ${isMobile ? '8px 12px' : '10px 16px'} !important;
        }

        .ant-select-item:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          color: white !important;
        }

        .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
          background: var(--freelancer-accent) !important;
          color: white !important;
        }

        .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
          background: rgba(255, 255, 255, 0.05) !important;
          color: white !important;
        }

        /* Card Spacing - Responsive */
        .ant-card {
          margin-bottom: ${isMobile ? '12px' : '16px'} !important;
          padding: ${isMobile ? '12px' : '16px'} !important;
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .ant-card-body {
          padding: ${isMobile ? '12px' : '16px'} !important;
        }

        /* Tabs Styling */
        .custom-tabs .ant-tabs-nav {
          margin: 0 !important;
          padding: ${isMobile ? '12px 16px 0' : '16px 24px 0'} !important;
          background: transparent !important;
        }

        .custom-tabs .ant-tabs-tab {
          margin: 0 ${isMobile ? '4px' : '8px'} 0 0 !important;
          padding: ${isMobile ? '8px 16px' : '12px 24px'} !important;
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: ${isMobile ? '8px' : '12px'} ${isMobile ? '8px' : '12px'} 0 0 !important;
          transition: all 0.3s ease !important;
        }

        .custom-tabs .ant-tabs-tab:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        .custom-tabs .ant-tabs-tab-active {
          background: var(--freelancer-primary) !important;
          border-color: var(--freelancer-primary) !important;
        }

        /* Input Number Styling */
        .ant-input-number {
          width: 100% !important;
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .ant-input-number-input {
          color: white !important;
          background: transparent !important;
        }

        /* Button Styling */
        .ant-btn-primary {
          background: var(--freelancer-accent) !important;
          border-color: var(--freelancer-accent) !important;
        }

        .ant-btn-primary:hover {
          background: var(--freelancer-accent-hover) !important;
          border-color: var(--freelancer-accent-hover) !important;
        }

        /* DatePicker Styling */
        .ant-picker {
          background: var(--freelancer-bg-card) !important;
          border: 1px solid var(--freelancer-border-DEFAULT) !important;
        }

        .ant-picker-dropdown {
          background: var(--freelancer-tertiary) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .ant-picker-dropdown .ant-picker-panel {
          background: var(--freelancer-tertiary) !important;
        }

        .ant-picker-dropdown .ant-picker-cell {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .ant-picker-dropdown .ant-picker-cell-in-view {
          color: white !important;
        }

        .ant-picker-dropdown .ant-picker-cell-selected .ant-picker-cell-inner {
          background: var(--freelancer-primary) !important;
        }

        /* Form Item Spacing */
        .ant-form-item {
          margin-bottom: ${isMobile ? '12px' : '16px'} !important;
        }

        .ant-form-item-label {
          padding-bottom: ${isMobile ? '4px' : '8px'} !important;
        }

        /* Grid System */
        .ant-row {
          margin: ${isMobile ? '0 -8px' : '0 -12px'} !important;
        }

        .ant-col {
          padding: ${isMobile ? '0 8px' : '0 12px'} !important;
        }

        /* Switch Styling */
        .ant-switch {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        .ant-switch-checked {
          background: var(--freelancer-accent) !important;
        }

        /* Alert Styling */
        .ant-alert {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .ant-alert-success {
          background: rgba(82, 196, 26, 0.1) !important;
          border-color: rgba(82, 196, 26, 0.3) !important;
        }

        .ant-alert-info {
          background: rgba(24, 144, 255, 0.1) !important;
          border-color: rgba(24, 144, 255, 0.3) !important;
        }

        /* Tag Styling */
        .ant-tag {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .ant-tag-success {
          background: rgba(82, 196, 26, 0.1) !important;
          border-color: rgba(82, 196, 26, 0.3) !important;
          color: #52c41a !important;
        }

        /* Modal Styling */
        .ant-modal-content {
          background: var(--freelancer-tertiary) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .ant-modal-header {
          background: var(--freelancer-tertiary) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .ant-modal-title {
          color: white !important;
        }

        .ant-modal-body {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .ant-modal-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        /* Checkbox Styling */
        .ant-checkbox-wrapper {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .ant-checkbox-inner {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .ant-checkbox-checked .ant-checkbox-inner {
          background: var(--freelancer-accent) !important;
          border-color: var(--freelancer-accent) !important;
        }

        /* Responsive adjustments for mobile */
        @media (max-width: 767px) {
          .custom-tabs .ant-tabs-tab {
            font-size: 0.875rem !important;
            padding: 6px 12px !important;
          }
          
          .ant-card-body {
            padding: 12px !important;
          }
          
          .ant-form-item {
            margin-bottom: 12px !important;
          }
        }

        /* Enhanced hover effects */
        .ant-card:hover {
          border-color: rgba(255, 255, 255, 0.2) !important;
          transform: translateY(-1px) !important;
          transition: all 0.3s ease !important;
        }

        .ant-btn:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }

        /* Loading states */
        .ant-btn-loading {
          opacity: 0.7 !important;
          cursor: not-allowed !important;
        }

        /* Focus states for accessibility */
        .ant-input:focus,
        .ant-input-textarea:focus,
        .ant-select-focused .ant-select-selector,
        .ant-picker-focused {
          outline: 2px solid var(--freelancer-accent) !important;
          outline-offset: 2px !important;
        }

        /* Custom scrollbar for terms modal */
        .terms-content::-webkit-scrollbar {
          width: 6px;
        }

        .terms-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }

        .terms-content::-webkit-scrollbar-thumb {
          background: var(--freelancer-accent);
          border-radius: 3px;
        }

        .terms-content::-webkit-scrollbar-thumb:hover {
          background: var(--freelancer-accent-hover);
        }
      `}</style>
    </div>
  );
};

export default EditProfile;