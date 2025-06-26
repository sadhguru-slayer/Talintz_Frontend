import React, { useEffect, useState, useCallback, useMemo } from "react";
import CSider from "../../components/client/CSider";
import { useLocation, useNavigate } from "react-router-dom";
import CHeader from "../../components/client/CHeader";
import IndividualLoadingComponent from "../../components/IndividualLoadingComponent";
import { IoMdAdd } from "react-icons/io";
import { Editor } from "primereact/editor";
import Select from "react-select";

import axios from "axios";
import { message, Modal, Switch, Button } from 'antd';
import Cookies from 'js-cookie';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useMediaQuery } from 'react-responsive';
import ProjectReview from '../client/ProjectPostComponents/ProjectReview';
import FreelancerSuggestions from '../client/ProjectPostComponents/FreelancerSuggestions';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { getCurrentToken, setupAxiosInterceptors } from '../../utils/auth';
import api from '../../config/axios';
import { useRazorpayWallet } from '../../hooks/useRazorpayWallet';
const { startWalletDeposit } = useRazorpayWallet();

// Enhanced custom styles for the editor
const editorStyles = `
  .p-editor {
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 16px !important;
    overflow: hidden !important;
    background: transparent !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
  }
  
  .p-editor-toolbar {
    background: rgba(255, 255, 255, 0.05) !important;
    border: none !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 0 !important;
    padding: 12px 16px !important;
    min-height: 56px !important;
    display: flex !important;
    align-items: center !important;
    backdrop-filter: blur(8px) !important;
  }
  
  .p-editor-toolbar .p-toolbar-group-left,
  .p-editor-toolbar .p-toolbar-group-right {
    background: transparent !important;
    border: none !important;
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
  }
  
  .p-editor-toolbar .ql-formats {
    margin-right: 12px !important;
  }
  
  .p-editor-toolbar button,
  .p-editor-toolbar .ql-picker {
    background: rgba(255, 255, 255, 0.08) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    color: rgba(255, 255, 255, 0.8) !important;
    border-radius: 8px !important;
    margin: 0 3px !important;
    padding: 8px 10px !important;
    min-width: 36px !important;
    height: 36px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    backdrop-filter: blur(4px) !important;
  }
  
  .p-editor-toolbar button:hover,
  .p-editor-toolbar .ql-picker:hover {
    background: rgba(255, 255, 255, 0.15) !important;
    border-color: rgba(0, 212, 170, 0.6) !important;
    color: white !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 4px 12px rgba(0, 212, 170, 0.2) !important;
  }
  
  .p-editor-toolbar button.ql-active,
  .p-editor-toolbar .ql-picker.ql-expanded {
    background: rgba(0, 212, 170, 0.25) !important;
    border-color: rgba(0, 212, 170, 0.6) !important;
    color: #00D4AA !important;
    box-shadow: 0 0 0 2px rgba(0, 212, 170, 0.2) !important;
  }
  
  .p-editor-toolbar .ql-picker-label {
    color: rgba(255, 255, 255, 0.8) !important;
    border: none !important;
    padding: 0 !important;
  }
  
  .p-editor-toolbar .ql-picker-options {
    background: rgba(37, 42, 58, 0.98) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 12px !important;
    backdrop-filter: blur(12px) !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
  }
  
  .p-editor-toolbar .ql-picker-item {
    color: white !important;
    padding: 10px 16px !important;
    transition: all 0.2s ease !important;
  }
  
  .p-editor-toolbar .ql-picker-item:hover {
    background: rgba(0, 212, 170, 0.2) !important;
    color: #00D4AA !important;
  }
  
  .p-editor-content {
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
  }
  
  .p-editor-content .ql-editor {
    background: transparent !important;
    color: white !important;
    border: none !important;
    font-size: 16px !important;
    line-height: 1.7 !important;
    padding: 20px !important;
    min-height: 180px !important;
  }
  
  .p-editor-content .ql-editor.ql-blank::before {
    color: rgba(255, 255, 255, 0.4) !important;
    font-style: normal !important;
    content: 'Describe your project requirements, goals, and any specific details...' !important;
  }
  
  .p-editor-content .ql-editor p {
    color: white !important;
    margin-bottom: 10px !important;
  }
  
  .p-editor-content .ql-editor h1,
  .p-editor-content .ql-editor h2,
  .p-editor-content .ql-editor h3 {
    color: white !important;
    margin-bottom: 16px !important;
  }
  
  .p-editor-content .ql-editor ul,
  .p-editor-content .ql-editor ol {
    color: white !important;
    padding-left: 24px !important;
  }
  
  .p-editor-content .ql-editor li {
    color: white !important;
    margin-bottom: 6px !important;
  }
  
  .p-editor-content .ql-editor a {
    color: #00D4AA !important;
    text-decoration: underline !important;
  }
  
  .p-editor-content .ql-editor strong {
    color: white !important;
    font-weight: 600 !important;
  }
  
  .p-editor-content .ql-editor em {
    color: rgba(255, 255, 255, 0.9) !important;
  }
`;

// Enhanced input styles
const inputStyles = `
  .enhanced-input {
    width: 100%;
    padding: 16px 20px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .enhanced-input:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(0, 212, 170, 0.6);
    box-shadow: 0 0 0 4px rgba(0, 212, 170, 0.15), 0 8px 32px rgba(0, 212, 170, 0.1);
    transform: translateY(-1px);
  }

  .enhanced-input:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  .enhanced-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
    font-weight: 400;
  }

  .input-container {
    position: relative;
    margin-bottom: 24px;
  }

  .input-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 8px;
    transition: all 0.3s ease;
  }

  .input-label.required::after {
    content: ' *';
    color: #ff4757;
    font-weight: 700;
  }

  .input-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.6);
    font-size: 18px;
    transition: all 0.3s ease;
    pointer-events: none;
  }

  .input-with-icon {
    padding-left: 48px;
  }

  .enhanced-input:focus + .input-icon {
    color: #00D4AA;
  }

  .floating-label {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.6);
    font-size: 16px;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
    background: transparent;
    padding: 0 8px;
  }

  .floating-label.focused,
  .floating-label.has-value {
    top: 0;
    font-size: 12px;
    color: #00D4AA;
    background: rgba(37, 42, 58, 0.95);
    transform: translateY(-50%);
  }

  .floating-input {
    padding-top: 20px;
    padding-bottom: 12px;
  }

  .enhanced-button {
    padding: 14px 28px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(8px);
  }

  .enhanced-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  .enhanced-button:hover::before {
    left: 100%;
  }

  .enhanced-button.primary {
    background: linear-gradient(135deg, #00D4AA 0%, #00B894 100%);
    color: white;
    box-shadow: 0 4px 20px rgba(0, 212, 170, 0.3);
  }

  .enhanced-button.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 212, 170, 0.4);
  }

  .enhanced-button.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .enhanced-button.secondary:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  .enhanced-button.success {
    background: linear-gradient(135deg, #00B894 0%, #00A085 100%);
    color: white;
    box-shadow: 0 4px 20px rgba(0, 184, 148, 0.3);
  }

  .enhanced-button.success:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 184, 148, 0.4);
  }

  .form-section {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 20px;
    padding: 32px;
    margin-bottom: 24px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .form-section-title {
    font-size: 20px;
    font-weight: 700;
    color: white;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .form-section-title::before {
    content: '';
    width: 4px;
    height: 24px;
    background: linear-gradient(135deg, #00D4AA, #00B894);
    border-radius: 2px;
  }

  .progress-indicator {
    position: relative;
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
    margin: 32px 0;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #00D4AA, #00B894);
    border-radius: 3px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }

  .progress-bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .step-indicator {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }

  .step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 2;
  }

  .step-circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 18px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    backdrop-filter: blur(8px);
  }

  .step-circle.active {
    background: linear-gradient(135deg, #00D4AA, #00B894);
    color: white;
    box-shadow: 0 4px 20px rgba(0, 212, 170, 0.4);
    transform: scale(1.1);
  }

  .step-circle.completed {
    background: linear-gradient(135deg, #00B894, #00A085);
    color: white;
    box-shadow: 0 4px 20px rgba(0, 184, 148, 0.3);
  }

  .step-circle.pending {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.6);
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .step-label {
    margin-top: 8px;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    text-align: center;
    transition: all 0.3s ease;
  }

  .step-circle.active + .step-label {
    color: #00D4AA;
  }

  .step-circle.completed + .step-label {
    color: #00B894;
  }
`;

const formatDate = (date) => {
  if (!date) return '';
  const d = dayjs(date);
  return d.format('YYYY-MM-DD');
};

const parseDate = (dateString) => {
  if (!dateString) {
    console.error("Date string is empty or undefined");
    return null;
  }

  const formattedDateString = `${dateString}T00:00:00Z`;
  const date = new Date(formattedDateString);

  if (isNaN(date.getTime())) {
    console.error("Invalid date format:", formattedDateString);
    return null;
  }

  return date;
};

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
today.setHours(0, 0, 0, 0);

message.config({
  top: 60,
  duration: 3,
  maxCount: 3,
});

// Setup axios interceptors for this component
setupAxiosInterceptors();

const ProjectPost = ({userId, role}) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [show, setShow] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [postProject, setPostProject] = useState(false);
  const [domain, setDomain] = useState([]);
  const [skills, setSkills] = useState([]);
  const [errorsResolved, setErrorResolved] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletHoldBalance, setWalletHoldBalance] = useState(0);
  const [totalRequiredAmount, setTotalRequiredAmount] = useState(0);
  const [proceedAsDraft, setProceedAsDraft] = useState(false);
  const [showLowFundsModal, setShowLowFundsModal] = useState(false);
  const [projectMilestoneShow, setProjectMilestoneShow] = useState({});
  const [milestoneErrors, setMilestoneErrors] = useState({});
  const [showProjectMilestones, setShowProjectMilestones] = useState(false);
  const [projectData, setProjectData] = useState(null);
  const [showProjectOverview, setShowProjectOverview] = useState(false);
  const [showPaymentWarningModal, setShowPaymentWarningModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    budget: 0,
    deadline: formatDate(tomorrow),
    domain: "",
    skills_required: [],
    payment_strategy: "automatic",
    milestones: [],
    total_auto_payment: 0,
    pricing_strategy: "fixed",
    hourly_rate: 0,
    estimated_hours: 0,
    max_hours: 0,
    // New fields for hourly project milestone management
    allow_hour_flexibility: true,
    require_milestone_approval: true,
    emergency_hours: 0
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Enhanced auth headers with automatic token refresh
  const getAuthHeaders = useCallback(() => {
    const accessToken = getCurrentToken();
    return {
      Authorization: `Bearer ${accessToken}`,
    };
  }, []);

  // Memoize form change handler to prevent re-creation on every render
  const formOnchange = useCallback((e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Memoize domain change handler
  const domainChange = useCallback(async (selectedOption) => {
    setSelectedDomain(selectedOption);
    setFormValues(prev => ({
      ...prev,
      domain: selectedOption?.value || "",
      skills_required: [] // Reset skills when domain changes
    }));

    // Only fetch skills if a domain is selected
    if (selectedOption) {
      try {
        const response = await api.get(
          `/api/skills/${selectedOption.value}`,
          { headers: getAuthHeaders() }
        );

        if (Array.isArray(response.data)) {
          const skillOptions = response.data.map((skill) => ({
            value: skill.id,
            label: skill.name,
            domain_id: skill.category
          }));
          setSkills(skillOptions);
          setFilteredOptions(skillOptions);
        } else {
          console.error("Expected an array but got:", response.data);
          message.error("Failed to load skills properly");
        }
      } catch (error) {
        console.error("Error fetching skills:", error);
        message.error("Failed to load skills for selected domain");
        setSkills([]);
        setFilteredOptions([]);
      }
    } else {
      // Clear skills and filtered options if no domain is selected
      setSkills([]);
      setFilteredOptions([]);
    }
  }, [getAuthHeaders]);

  // Memoize skill change handler
  const handleSkillChange = useCallback((selectedOptions) => {
    setFormValues(prev => ({
      ...prev,
      skills_required: selectedOptions.map(option => ({
        value: option.value,
        label: option.label
      }))
    }));
  }, []);

  // Memoize deadline change handler
  const handleDeadlineChange = useCallback((date) => {
    if (!date || !dayjs(date).isValid()) {
      console.error("Invalid date value:", date);
      return;
    }

    const formattedDate = formatDate(date);
    setFormValues((prevValues) => ({
      ...prevValues,
      deadline: formattedDate,
    }));
  }, []);

  // Enhanced milestone change handler for hourly projects
  const handleProjectMilestoneChange = useCallback((index, field, value) => {
    const updatedMilestones = [...formValues.milestones];
    
    if (field === 'is_automated') {
      updatedMilestones[index].milestone_type = value ? 'hybrid' : 'progress';
      
      // Reset amount if auto-payment is disabled
      if (!value) {
        updatedMilestones[index].amount = 0;
      }
      
      if (value) {
        // Calculate escrow amount for hourly projects
        let escrowAmount = 0;
    if (formValues.pricing_strategy === 'hourly') {
          // Escrow maximum possible amount (max_hours * hourly_rate)
          escrowAmount = (updatedMilestones[index].max_hours || 0) * (formValues.hourly_rate || 0);
    } else {
          // Fixed price: escrow the fixed amount
          escrowAmount = Number(updatedMilestones[index].amount || 0);
        }
        
        const automatedTotal = formValues.milestones.reduce((sum, m, i) => {
          if (i !== index && m.is_automated) {
            if (formValues.pricing_strategy === 'hourly') {
              return sum + ((m.max_hours || 0) * (formValues.hourly_rate || 0));
      } else {
              return sum + Number(m.amount || 0);
            }
          }
          return sum;
        }, 0) + escrowAmount;

        if (automatedTotal > (walletBalance - walletHoldBalance)) {
          message.warning('Insufficient wallet balance for automated payments');
          return;
      }
      }
    }

    // Handle hourly project specific fields
    if (formValues.pricing_strategy === 'hourly') {
      if (field === 'estimated_hours') {
        const hours = Number(value) || 0;
        const maxHours = Number(updatedMilestones[index].max_hours) || 0;
        
        if (hours > maxHours && maxHours > 0) {
          message.warning('Estimated hours cannot exceed maximum hours for this milestone');
          return;
        }
        
        // Check total estimated hours across all milestones
        const totalEstimatedHours = formValues.milestones.reduce((sum, m, i) => 
          i !== index ? sum + Number(m.estimated_hours || 0) : sum, 
          0
        ) + hours;

        if (totalEstimatedHours > formValues.max_hours) {
          message.warning(`Total estimated hours (${totalEstimatedHours}) would exceed maximum project hours (${formValues.max_hours})`);
          return;
        }
      }
      
      if (field === 'max_hours') {
        const maxHrs = Number(value) || 0;
        const estimatedHours = Number(updatedMilestones[index].estimated_hours) || 0;
        
        if (maxHrs < estimatedHours) {
          message.warning('Maximum hours cannot be less than estimated hours for this milestone');
          return;
        }
        
        // Check total max hours across all milestones
        const totalMaxHours = formValues.milestones.reduce((sum, m, i) => 
          i !== index ? sum + Number(m.max_hours || 0) : sum, 
          0
        ) + maxHrs;

        if (totalMaxHours > formValues.max_hours) {
          message.warning(`Total maximum hours (${totalMaxHours}) would exceed project maximum (${formValues.max_hours})`);
          return;
        }
        
        // Update escrow amount if auto-payment is enabled
        if (updatedMilestones[index].is_automated) {
          const newEscrowAmount = maxHrs * (formValues.hourly_rate || 0);
          const currentEscrowTotal = formValues.milestones.reduce((sum, m, i) => {
            if (i !== index && m.is_automated) {
              return sum + ((m.max_hours || 0) * (formValues.hourly_rate || 0));
            }
            return sum;
          }, 0) + newEscrowAmount;
          
          if (currentEscrowTotal > (walletBalance - walletHoldBalance)) {
            message.warning('Insufficient wallet balance for the updated escrow amount');
            return;
          }
        }
      }
    }

    if (field === 'amount' && updatedMilestones[index].is_automated) {
      const numValue = Number(value);
      const totalBudget = Number(formValues.budget);
      const currentTotal = formValues.milestones.reduce((sum, m, i) => 
        i !== index && m.is_automated ? sum + Number(m.amount || 0) : sum, 
        0
      );

      if (numValue + currentTotal > totalBudget) {
        message.warning('This amount would exceed the total project budget');
        return;
      }
    }
    
    updatedMilestones[index][field] = value;
    setFormValues(prev => ({
      ...prev,
      milestones: updatedMilestones
    }));
  }, [formValues.milestones, formValues.budget, formValues.pricing_strategy, formValues.max_hours, formValues.hourly_rate, walletBalance, walletHoldBalance]);

  // Enhanced add milestone handler for hourly projects
  const handleAddProjectMilestone = useCallback(() => {
    const newMilestone = {
          title: "",
      milestone_type: formValues.pricing_strategy === 'hourly' ? 'hourly' : 'hybrid',
          amount: 0,
      due_date: formValues.pricing_strategy === 'hourly' ? null : "",
      is_automated: formValues.pricing_strategy === 'fixed', // Default to false for hourly
      // New fields for hourly projects
      estimated_hours: 0,
      max_hours: 0,
      priority_level: 'medium',
      quality_requirements: "",
      deliverables: ""
    };
    
    setFormValues(prev => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone]
    }));
  }, [formValues.pricing_strategy]);

  // Enhanced calculateTotalAutomatedPayments for hourly projects
  const calculateTotalAutomatedPayments = useCallback(() => {
    let total = 0;
    formValues.milestones.forEach(milestone => {
      if (milestone.is_automated) {
        if (formValues.pricing_strategy === 'hourly') {
          // For hourly projects, escrow maximum possible amount
          total += (milestone.max_hours || 0) * (formValues.hourly_rate || 0);
        } else {
          // For fixed price projects, escrow the fixed amount
        total += Number(milestone.amount || 0);
        }
      }
    });
    return total;
  }, [formValues.milestones, formValues.pricing_strategy, formValues.hourly_rate]);

  const checkPaymentWarnings = useCallback(() => {
    const totalAutomatedPayments = calculateTotalAutomatedPayments();
    const availableBalance = walletBalance - walletHoldBalance;

    if (totalAutomatedPayments > availableBalance) {
      setShowPaymentWarningModal(true);
      return true;
    }
    return false;
  }, [calculateTotalAutomatedPayments, walletBalance, walletHoldBalance]);

  // Memoize step change handler
  const handleStepChange = useCallback((step) => {
    if (step > currentStep) {
      if (step === 3) {
        const areProjectMilestonesValid = validateProjectMilestones();
        const areBudgetsValid = validateBudgetAndMilestones();
        
        // Only validate dates for fixed price projects
        const areDatesValid = formValues.pricing_strategy === 'fixed' ? validateMilestoneDates() : true;
        
        if (!areProjectMilestonesValid || !areBudgetsValid || !areDatesValid) {
          message.error("Please fix all validation errors before proceeding to review");
          return;
        }
      }
      setCurrentStep(step);
    } else {
      setCurrentStep(step);
    }
  }, [currentStep, formValues.pricing_strategy]);

  // Memoize validation functions
  const validateProjectMilestones = useCallback(() => {
    let totalMilestoneBudget = 0;
    let newMilestoneErrors = {};
    let isValid = true;
    const projectDeadline = parseDate(formValues.deadline);
    
    formValues.milestones.forEach((milestone, index) => {
      let errors = [];
      
      // Validate title (required for both pricing strategies)
      if (!milestone.title || !milestone.title.trim()) {
        errors.push("Milestone title is required");
        isValid = false;
      }
      
      // Validate fields based on pricing strategy
      if (formValues.pricing_strategy === 'fixed') {
        // Fixed price specific validations
      if (!milestone.due_date) {
          errors.push("Due date is required for fixed price projects");
        isValid = false;
      } else {
        const milestoneDate = parseDate(milestone.due_date);
        if (milestoneDate > projectDeadline) {
          errors.push("Must be before project deadline");
          isValid = false;
        }
      }
      
        // Validate payment fields for fixed price projects
        if (milestone.is_automated && (milestone.milestone_type === 'payment' || milestone.milestone_type === 'hybrid')) {
          if (!milestone.amount || Number(milestone.amount) <= 0) {
            errors.push("Amount must be greater than 0 for automated payments");
          isValid = false;
        }
        totalMilestoneBudget += Number(milestone.amount || 0);
        }
      } else if (formValues.pricing_strategy === 'hourly') {
        // Hourly project specific validations
        if (!milestone.max_hours || Number(milestone.max_hours) <= 0) {
          errors.push("Maximum hours must be greater than 0");
          isValid = false;
        }
        if (!milestone.estimated_hours || Number(milestone.estimated_hours) <= 0) {
          errors.push("Estimated hours must be greater than 0");
          isValid = false;
        }
        if (Number(milestone.max_hours) < Number(milestone.estimated_hours)) {
          errors.push("Maximum hours cannot be less than estimated hours");
          isValid = false;
        }
      }

      if (errors.length > 0) {
        newMilestoneErrors[index] = errors;
      }
    });

    setMilestoneErrors(newMilestoneErrors);
    return isValid;
  }, [formValues.milestones, formValues.deadline, formValues.pricing_strategy]);

  // Enhanced validation for hourly projects
  const validateBudgetAndMilestones = useCallback(() => {
    if (formValues.pricing_strategy === 'fixed') {
      // Existing fixed price validation
    let totalMilestoneBudget = 0;
    let totalAutomatedBudget = 0;
    const availableBalance = walletBalance - walletHoldBalance;
    
    formValues.milestones.forEach(milestone => {
      if (milestone.milestone_type === 'payment' || milestone.milestone_type === 'hybrid') {
        totalMilestoneBudget += Number(milestone.amount || 0);
        if (milestone.is_automated) {
          totalAutomatedBudget += Number(milestone.amount || 0);
        }
      }
    });

    if (totalMilestoneBudget > Number(formValues.budget)) {
      message.error('Total milestone payments cannot exceed project budget');
      return false;
    }

    } else if (formValues.pricing_strategy === 'hourly') {
      // New hourly validation
      let totalEscrowAmount = 0;
      const availableBalance = walletBalance - walletHoldBalance;
      
      formValues.milestones.forEach(milestone => {
        if (milestone.is_automated) {
          // Escrow maximum possible amount for each automated milestone
          const escrowAmount = (milestone.max_hours || 0) * (formValues.hourly_rate || 0);
          totalEscrowAmount += escrowAmount;
        }
      });

      if (totalEscrowAmount > availableBalance) {
        message.error(`Total escrow amount (₹${totalEscrowAmount.toLocaleString()}) cannot exceed available wallet balance (₹${availableBalance.toLocaleString()})`);
        return false;
      }
    }

    return true;
  }, [formValues.milestones, formValues.budget, formValues.pricing_strategy, formValues.hourly_rate, walletBalance, walletHoldBalance]);

  const validateMilestoneDates = useCallback(() => {
    // Only validate dates for fixed price projects
    if (formValues.pricing_strategy !== 'fixed') {
      return true;
    }

    const projectDeadline = new Date(formValues.deadline);
    let isValid = true;
    let lastDate = null;

    formValues.milestones.forEach((milestone, index) => {
      if (!milestone.due_date) {
        return; // Skip if no due date
      }

      const milestoneDate = new Date(milestone.due_date);

      if (milestoneDate > projectDeadline) {
        message.error(`Milestone ${index + 1} due date cannot be after project deadline`);
        isValid = false;
      }

      if (lastDate && milestoneDate < lastDate) {
        message.error(`Milestone ${index + 1} must be after previous milestone`);
        isValid = false;
      }

      lastDate = milestoneDate;
    });

    return isValid;
  }, [formValues.milestones, formValues.deadline, formValues.pricing_strategy]);

  // Move fetchWalletBalance BEFORE formSubmit
  const fetchWalletBalance = useCallback(async () => {
    try {
      const response = await api.get("/api/finance/wallet/balance/");
      console.log(response)
      if (response.data) {
        setWalletBalance(response.data.balance || 0);
        setWalletHoldBalance(response.data.hold_balance || 0);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      
      if (error.response?.status === 401) {
        message.error("Session expired. Please refresh the page.");
      } else {
        message.error("Failed to load wallet balance");
      }
    }
  }, []);

  // Enhanced form submit with proper data type conversion
  const formSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Validate pricing strategy data
    if (formValues.pricing_strategy === 'hourly') {
      if (!formValues.hourly_rate || formValues.hourly_rate <= 0) {
        message.error('Please enter a valid hourly rate');
        return;
      }
      if (!formValues.estimated_hours || formValues.estimated_hours <= 0) {
        message.error('Please enter estimated hours');
        return;
      }
      if (!formValues.max_hours || formValues.max_hours <= 0) {
        message.error('Please enter maximum hours');
        return;
      }
      if (formValues.max_hours < formValues.estimated_hours) {
        message.error('Maximum hours cannot be less than estimated hours');
        return;
      }
    }

    if (!validateBudgetAndMilestones()) {
      return;
    }

    // Only validate dates for fixed price projects
    if (formValues.pricing_strategy === 'fixed' && !validateMilestoneDates()) {
      return;
    }

    const areProjectMilestonesValid = validateProjectMilestones();

    if (!areProjectMilestonesValid) {
      message.error("Please fix the validation errors before submitting.");
      return;
    }

    const totalRequired = calculateTotalAutomatedPayments();
    setTotalRequiredAmount(totalRequired);

    const hasPaymentWarnings = checkPaymentWarnings();
    if (hasPaymentWarnings && !proceedAsDraft) {
      setShowLowFundsModal(true);
      return;
    }

    try {
      const payload = {
        ...formValues,
        status: proceedAsDraft ? 'draft' : 'pending',
        skills_required: formValues.skills_required,
        total_auto_payment: totalRequired,
        milestones: formValues.milestones.map(m => ({
            ...m,
          // Ensure proper data types for backend
          amount: Number(m.amount) || 0,
          estimated_hours: Number(m.estimated_hours) || 0,
          max_hours: Number(m.max_hours) || 0,
          is_automated: Boolean(m.is_automated)
        })),
        // Include pricing strategy data with proper types
        pricing_strategy: formValues.pricing_strategy,
        hourly_rate: formValues.pricing_strategy === 'hourly' ? Number(formValues.hourly_rate) : 0,
        estimated_hours: formValues.pricing_strategy === 'hourly' ? Number(formValues.estimated_hours) : 0,
        max_hours: formValues.pricing_strategy === 'hourly' ? Number(formValues.max_hours) : 0,
        // Convert other numeric fields
        budget: Number(formValues.budget) || 0,
        emergency_hours: Number(formValues.emergency_hours) || 0
      };

      // Use the enhanced api instance with automatic token refresh
      const response = await api.post(
        "/api/post_project/",
        payload
      );
      
      if (response.status >= 200 && response.status < 300) {
        setShowSuccessModal(true);
        setProjectData(response.data.project);
        
        // Refresh wallet balance after successful project posting
        fetchWalletBalance();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        message.error("Session expired. Please refresh the page.");
      } else if (error.response?.status === 400) {
        message.error("Please check your project details and try again.");
      } else {
        message.error("Failed to post project. Please try again.");
      }
    }
  }, [formValues, proceedAsDraft, validateBudgetAndMilestones, validateMilestoneDates, validateProjectMilestones, calculateTotalAutomatedPayments, checkPaymentWarnings, fetchWalletBalance]);

  // Memoize the Enhanced Input Component
  const EnhancedInput = useCallback(({ 
    label, 
    required = false, 
    icon = null, 
    placeholder, 
    value, 
    onChange, 
    type = "text",
    name,
    onWheel,
    className = "",
    ...props 
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    
    return (
      <div className="input-container">
        <label className={`input-label ${required ? 'required' : ''}`}>
          {label}
        </label>
        <div className="relative">
          {icon && (
            <span className="input-icon">
              {icon}
            </span>
          )}
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onWheel={onWheel}
            placeholder={placeholder}
            className={`enhanced-input ${icon ? 'input-with-icon' : ''} ${className}`}
            {...props}
          />
        </div>
      </div>
    );
  }, []);

  // Memoize the Enhanced Button Component
  const EnhancedButton = useCallback(({ 
    children, 
    variant = "primary", 
    onClick, 
    type = "button",
    className = "",
    disabled = false,
    ...props 
  }) => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`enhanced-button ${variant} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      {...props}
    >
      {children}
    </button>
  ), []);

  // Memoize the Form Section Component
  const FormSection = useCallback(({ title, icon, children, className = "" }) => (
    <div className={`form-section ${className}`}>
      <h3 className="form-section-title">
        {icon && <span>{icon}</span>}
        {title}
      </h3>
      {children}
    </div>
  ), []);

  // Memoize the Progress Steps Component
  const ProgressSteps = useCallback(({ currentStep, totalSteps, steps }) => (
    <div className="step-indicator">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        const isPending = stepNumber > currentStep;

    return (
          <div key={stepNumber} className="step-item">
            <div 
              className={`step-circle ${
                isActive ? 'active' : isCompleted ? 'completed' : 'pending'
              }`}
            >
              {isCompleted ? (
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                stepNumber
              )}
          </div>
            <span className="step-label">{step}</span>
      </div>
    );
      })}
    </div>
  ), []);

  // Memoize the milestone card renderer
  const renderMilestoneCard = useCallback((milestone, index) => (
    <div
      key={index}
      id={`milestone-${index}`}
      className="milestone-card bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-client-accent flex items-center justify-center">
              <span className="text-sm text-white font-medium">{index + 1}</span>
            </span>
            <h4 className="text-sm font-medium text-white">Milestone Details</h4>
          </span>
          <button
            type="button"
            onClick={() => {
              const updatedMilestones = [...formValues.milestones];
              updatedMilestones.splice(index, 1);
              setFormValues(prev => ({ ...prev, milestones: updatedMilestones }));
            }}
            className="text-status-error hover:text-status-error/90 transition-colors duration-200"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Milestone Title
              <span className="text-red-400 ml-1">*</span>
            </label>
            <input
              type="text"
              placeholder={formValues.pricing_strategy === 'hourly' ? "e.g., Design Phase Complete" : "e.g., Design Phase Complete"}
              value={milestone.title}
              onChange={(e) => handleProjectMilestoneChange(index, 'title', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:bg-white/10 focus:border-client-accent/50 focus:ring-2 focus:ring-client-accent/20 transition-all duration-300 text-white placeholder-white/40 backdrop-blur-sm"
            />
          </div>

          {/* Only show due date for fixed price projects */}
          {formValues.pricing_strategy === 'fixed' && (
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Due Date
              <span className="text-red-400 ml-1">*</span>
            </label>
            <div className="relative w-full">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={milestone.due_date ? dayjs(milestone.due_date) : null}
                  onChange={(newValue) => {
                    handleProjectMilestoneChange(
                      index,
                      'due_date',
                      newValue ? formatDate(newValue.toDate()) : ''
                    );
                  }}
                  minDate={dayjs(today)}
                  maxDate={dayjs(formValues.deadline)}
                  format="MMMM D, YYYY"
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      minHeight: '48px',
                      backdropFilter: 'blur(8px)',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(0, 212, 170, 0.6)',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(0, 212, 170, 0.6)',
                        boxShadow: '0 0 0 4px rgba(0, 212, 170, 0.15)',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                      padding: '14px 16px',
                      fontSize: '16px',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'rgba(255, 255, 255, 0.6)',
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>
          )}

          {/* Hourly project specific fields - REORDERED: Max Hours first, then Estimated Hours */}
          {formValues.pricing_strategy === 'hourly' && (
            <>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Max Hours
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g., 15"
                  value={milestone.max_hours || ''}
                  onChange={(e) => handleProjectMilestoneChange(index, 'max_hours', e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:bg-white/10 focus:border-client-accent/50 focus:ring-2 focus:ring-client-accent/20 transition-all duration-300 text-white placeholder-white/40 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Estimated Hours
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g., 10"
                  value={milestone.estimated_hours || ''}
                  onChange={(e) => handleProjectMilestoneChange(index, 'estimated_hours', e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:bg-white/10 focus:border-client-accent/50 focus:ring-2 focus:ring-client-accent/20 transition-all duration-300 text-white placeholder-white/40 backdrop-blur-sm"
                />
              </div>

              {/* Hourly Auto-Payment Toggle */}
              <div className="flex items-center">
                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <input
                    type="checkbox"
                    checked={milestone.is_automated}
                    onChange={(e) => handleProjectMilestoneChange(index, 'is_automated', e.target.checked)}
                    className="w-4 h-4 text-client-accent border-white/30 rounded focus:ring-client-accent/50 bg-white/10"
                  />
                  <span className="text-sm text-white/80">
                    Auto-pay on completion (escrow max amount)
                  </span>
                </label>
              </div>

              {/* Priority Level */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Priority Level
                </label>
                <select
                  value={milestone.priority_level || 'medium'}
                  onChange={(e) => handleProjectMilestoneChange(index, 'priority_level', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:bg-white/10 focus:border-client-accent/50 focus:ring-2 focus:ring-client-accent/20 transition-all duration-300 text-white backdrop-blur-sm"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </>
          )}

          {/* Fixed price project fields */}
          {formValues.pricing_strategy === 'fixed' && (
            <>
          <div className="flex items-center">
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <input
                type="checkbox"
                checked={milestone.is_automated}
                onChange={(e) => handleProjectMilestoneChange(index, 'is_automated', e.target.checked)}
                className="w-4 h-4 text-client-accent border-white/30 rounded focus:ring-client-accent/50 bg-white/10"
              />
              <span className="text-sm text-white/80">
                Auto-process payment on completion
              </span>
            </label>
          </div>

          {milestone.is_automated && (
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Amount (₹)
                <span className="text-red-400 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="e.g., 15000"
                  value={milestone.amount}
                  onChange={(e) => handleProjectMilestoneChange(index, 'amount', e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:bg-white/10 focus:border-client-accent/50 focus:ring-2 focus:ring-client-accent/20 transition-all duration-300 text-white placeholder-white/40 backdrop-blur-sm"
                  required={milestone.is_automated}
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 text-lg">₹</span>
              </div>
            </div>
              )}
            </>
          )}
        </div>

        {/* Quality requirements and deliverables for hourly projects */}
        {formValues.pricing_strategy === 'hourly' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Quality Requirements
              </label>
              <textarea
                placeholder="e.g., Code must pass all tests, design must be responsive"
                value={milestone.quality_requirements || ''}
                onChange={(e) => handleProjectMilestoneChange(index, 'quality_requirements', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:bg-white/10 focus:border-client-accent/50 focus:ring-2 focus:ring-client-accent/20 transition-all duration-300 text-white placeholder-white/40 backdrop-blur-sm"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Deliverables
              </label>
              <textarea
                placeholder="e.g., Working prototype, design mockups, documentation"
                value={milestone.deliverables || ''}
                onChange={(e) => handleProjectMilestoneChange(index, 'deliverables', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:bg-white/10 focus:border-client-accent/50 focus:ring-2 focus:ring-client-accent/20 transition-all duration-300 text-white placeholder-white/40 backdrop-blur-sm"
                rows="3"
              />
            </div>
          </div>
        )}

        {/* Enhanced Budget Summary for Hourly Projects */}
        {formValues.pricing_strategy === 'hourly' && milestone.estimated_hours > 0 && (
          <div className="p-3 bg-client-accent/10 rounded-lg border border-client-accent/20">
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-secondary">Estimated Cost:</span>
              <span className="text-client-accent font-semibold">
                ₹{((formValues.hourly_rate || 0) * (milestone.estimated_hours || 0)).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-text-secondary">Maximum Cost:</span>
              <span className="text-client-accent font-semibold">
                ₹{((formValues.hourly_rate || 0) * (milestone.max_hours || 0)).toLocaleString()}
              </span>
            </div>
            {milestone.is_automated && (
              <div className="flex justify-between items-center text-sm mt-1 pt-1 border-t border-client-accent/20">
                <span className="text-text-secondary">Escrow Amount:</span>
                <span className="text-client-accent font-semibold">
                  ₹{((formValues.hourly_rate || 0) * (milestone.max_hours || 0)).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        {milestoneErrors[index] && (
          <div className="p-3 rounded-md mt-4">
            {milestoneErrors[index].map((error, i) => (
              <p key={i} className="text-sm text-status-error">{error}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  ), [formValues.milestones, formValues.deadline, formValues.pricing_strategy, formValues.hourly_rate, milestoneErrors, handleProjectMilestoneChange]);

  // Memoize the description change handler
  const handleDescriptionChange = useCallback((e) => {
    setFormValues(prev => ({
      ...prev,
      description: e.htmlValue,
    }));
  }, []);

  // Memoize the add project click handler
  const handleAddProjectClick = useCallback(() => {
    setPostProject(true);
  }, []);

  // Memoize the modal confirm handler
  const handleModalConfirm = useCallback(() => {
    setShowSuccessModal(false);
    setPostProject(false);
    setShowProjectOverview(true);
    
    // Reset form values including pricing strategy
    setFormValues({
      title: "",
      description: "",
      budget: 0,
      deadline: formatDate(tomorrow),
      domain: "",
      skills_required: [],
      payment_strategy: "automatic",
      milestones: [],
      total_auto_payment: 0,
      // Reset pricing strategy fields
      pricing_strategy: "fixed",
      hourly_rate: 0,
      estimated_hours: 0,
      max_hours: 0,
      // New fields for hourly project milestone management
      allow_hour_flexibility: true,
      require_milestone_approval: true,
      emergency_hours: 0
    });

    setSelectedDomain(null);
    setFilteredOptions([]);
    setCurrentStep(1);
    setShowProjectMilestones(false);
    setMilestoneErrors({});
    setProceedAsDraft(false);
    setErrorResolved(true);
    setProjectMilestoneShow({});

    // Refresh wallet balance after successful project posting
    fetchWalletBalance();

    message.success({
      content: "Project posted successfully! Create another project or return to dashboard.",
      duration: 5,
    });
  }, [fetchWalletBalance]);

  // Memoize the menu click handlers
  const handleMenuClick = useCallback((component) => {
    if (location.pathname !== "/client/dashboard") {
      navigate("/client/dashboard", { state: { component } });
    } 

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [location.pathname, navigate]);

  const handleProfileMenu = useCallback((profileComponent) => {
    const profilePath = location.pathname.split('/').slice(0, 3).join('/');
    
    navigate(`${profilePath}/${profileComponent}`);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [location.pathname, navigate]);

  // Enhanced domain fetching with better error handling
  const fetchDomains = useCallback(async () => {
    try {
      const response = await api.get("/api/categories/");

      if (Array.isArray(response.data)) {
        const domainOptions = response.data.map((category) => ({
          value: category.id,
          label: category.name,
        }));
        setDomain(domainOptions);
      } else {
        console.error("Expected an array but got:", response.data);
        message.error("Failed to load domains properly");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      
      if (error.response?.status === 401) {
        message.error("Session expired. Please refresh the page.");
      } else {
        message.error("Failed to load domains");
      }
    }
  }, []);

  // Add this useEffect to call fetchDomains and fetchWalletBalance on component mount
  useEffect(() => {
    fetchDomains();
    fetchWalletBalance();
  }, [fetchDomains, fetchWalletBalance]);

  // Add wallet balance refresh after successful project posting
  useEffect(() => {
    if (postProject) {
      fetchWalletBalance();
    }
  }, [postProject, fetchWalletBalance]);

  // Add wallet balance refresh when milestones are toggled
  useEffect(() => {
    if (showProjectMilestones) {
      fetchWalletBalance();
    }
  }, [showProjectMilestones, fetchWalletBalance]);

  // Custom Radio Button Component for Pricing Strategy (simplified)
  const PricingStrategyRadio = ({ value, label, description, icon, checked, onChange, price }) => (
    <div 
      className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
        checked 
          ? 'border-client-accent bg-client-accent/10 shadow-lg' 
          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
      }`}
      onClick={() => onChange(value)}
    >
      <div className="flex items-start gap-4">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
          checked ? 'border-client-accent bg-client-accent' : 'border-white/30'
        }`}>
          {checked && <div className="w-2 h-2 rounded-full bg-white"></div>}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{icon}</span>
            <span className="font-semibold text-text-light text-lg">{label}</span>
            {price && (
              <div className="ml-auto px-3 py-1 bg-client-accent/20 border border-client-accent/30 rounded-md">
                <span className="text-client-accent font-semibold text-sm">₹{price.toLocaleString()}</span>
              </div>
            )}
          </div>
          <div className="text-sm text-text-secondary">{description}</div>
        </div>
      </div>
    </div>
  );
  
  const requiredAmount = totalRequiredAmount - (walletBalance - walletHoldBalance);

  const handleAddFunds = (amount) => {
    startWalletDeposit(
      amount,
      () => {
        message.success("Funds added successfully!");
        fetchWalletBalance(); // Refresh wallet balance
        setShowLowFundsModal(false);
      },
      (errMsg) => message.error(errMsg)
    );
  };

  return (
    <>
      <style>{editorStyles}</style>
      <style>{inputStyles}</style>
      <div className="flex h-screen bg-client-primary">
      <CSider
        userId={userId}
        role={role}
        dropdown={true}
        collapsed={true}
        handleMenuClick={handleMenuClick}
        handleProfileMenu={handleProfileMenu}
      />
  
      <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'ml-0 pb-16' : 'ml-16'}`}>
        <CHeader userId={userId} sidebarCollapsed={true} />
        
          <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {loading ? (
            <IndividualLoadingComponent />
          ) : (
            <div className="max-w-6xl mx-auto">
            {!postProject ? (
              <>
                {showProjectOverview ? (
                  <FreelancerSuggestions project={projectData} />
                ) : (
                  <div 
                    className="relative overflow-hidden rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition-all duration-300 border border-white/10 hover:border-client-accent/30"
                    onClick={handleAddProjectClick}
                  >
                    {/* Background gradient layers */}
                    <div className="absolute inset-0 bg-gradient-to-br from-client-primary via-client-primary/80 to-client-bg-dark"></div>
                    <div className="absolute inset-0 bg-client-gradient-soft opacity-30"></div>
                    
                    {/* Decorative blur elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-client-accent/10 rounded-full blur-3xl -mr-48 -mt-48 animate-float"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-accent/8 rounded-full blur-2xl -ml-40 -mb-40 animate-float-delayed"></div>

                    {/* Content */}
                    <div className="relative z-10 p-6 md:p-8">
                      <div className="flex flex-col items-center gap-4 md:gap-6">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gradient-to-br from-client-accent/20 to-client-accent/10 flex items-center justify-center transform hover:rotate-12 transition-transform duration-300 border border-client-accent/20 backdrop-blur-sm">
                          <IoMdAdd className="text-client-accent text-3xl md:text-4xl" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-semibold text-white text-center">
                          Create a New Project
                        </h2>
                        <p className="text-white/70 text-sm md:text-base text-center max-w-lg">
                          Start your journey by creating a project and find the perfect freelancer to bring your vision to life
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
                ) : (
                <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-2xl shadow-md border border-white/10">
                    <div className="border-b border-white/10 p-4 md:p-6 lg:p-8">
                      <div className="flex items-center justify-between mb-6">
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white">
                        Create New Project
                      </h1>
                    </div>

                      {/* Enhanced Progress Steps */}
                      <ProgressSteps 
                        currentStep={currentStep} 
                        totalSteps={3} 
                        steps={["Project Details", "Budget & Timeline", "Review"]} 
                      />
                    </div>

                    {/* Form Content */}
                    <form onSubmit={formSubmit} className="p-4 md:p-6 lg:p-8 space-y-6">
                    {/* Step 1: Project Details */}
                      <div className={`transition-all duration-300 ${currentStep === 1 ? 'block' : 'hidden'}`}>
                        <FormSection title="Project Information" icon="📋">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <EnhancedInput
                              label="Project Title"
                              required={true}
                            name="title"
                            value={formValues.title}
                            onChange={formOnchange}
                              placeholder="e.g., E-commerce Website Development"
                              icon="🚀"
                            />
                            
                            <div className="lg:col-span-2">
                              <label className="input-label required">Project Description</label>
                          <div className="bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                          <Editor
                            value={formValues.description}
                                  onTextChange={handleDescriptionChange}
                            style={{ 
                              height: "220px",
                              backgroundColor: "transparent"
                            }}
                            placeholder="Describe your project requirements, goals, and any specific details..."
                            modules={{
                              toolbar: [
                                [{ 'header': [1, 2, 3, false] }],
                                ['bold', 'italic', 'underline'],
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                ['link'],
                                ['clean']
                              ]
                            }}
                          />
                          </div>
                        </div>
                          </div>
                        </FormSection>

                        <FormSection title="Domain & Skills" icon="🎯">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                              <label className="input-label required">Project Domain</label>
                          <Select
                            options={domain}
                            value={selectedDomain}
                            onChange={domainChange}
                            className="react-select-container"
                            classNamePrefix="react-select"
                              placeholder="Choose your project domain"
                              isSearchable
                              isClearable
                              styles={{
                                control: (base, state) => ({
                                  ...base,
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  borderColor: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    minHeight: '56px',
                                    boxShadow: state.isFocused ? '0 0 0 4px rgba(0, 212, 170, 0.15)' : 'none',
                                    backdropFilter: 'blur(8px)',
                                    border: '2px solid',
                                  '&:hover': {
                                      borderColor: 'rgba(0, 212, 170, 0.6)',
                                      backgroundColor: 'rgba(255, 255, 255, 0.08)'
                                  }
                                }),
                                singleValue: (base) => ({
                                  ...base,
                                  color: 'white',
                                    fontSize: '16px',
                                    fontWeight: '500'
                                }),
                                placeholder: (base) => ({
                                  ...base,
                                  color: 'rgba(255, 255, 255, 0.4)',
                                  fontSize: '16px'
                                }),
                                menu: (base) => ({
                                  ...base,
                                    backgroundColor: 'rgba(37, 42, 58, 0.98)',
                                    border: '2px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    backdropFilter: 'blur(12px)',
                                    overflow: 'hidden',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                                }),
                                option: (base, state) => ({
                                  ...base,
                                  backgroundColor: state.isFocused ? 'rgba(0, 212, 170, 0.2)' : 'transparent',
                                  color: 'white',
                                    padding: '14px 18px',
                                    fontSize: '15px',
                                    fontWeight: '500'
                                }),
                                input: (base) => ({
                                  ...base,
                                  color: 'white'
                                })
                              }}
                          />
                        </div>

                            <div>
                              <label className="input-label required">Required Skills</label>
                            <Select
                              isMulti
                              options={filteredOptions}
                              value={formValues.skills_required}
                              onChange={handleSkillChange}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              placeholder="Add skills needed for this project"
                              isSearchable
                              isDisabled={!selectedDomain}
                              noOptionsMessage={() => 
                                !selectedDomain 
                                  ? "Please select a domain first" 
                                  : "No skills available for this domain"
                              }
                              styles={{
                                control: (base, state) => ({
                                  ...base,
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  borderColor: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    minHeight: '56px',
                                    boxShadow: state.isFocused ? '0 0 0 4px rgba(0, 212, 170, 0.15)' : 'none',
                                    backdropFilter: 'blur(8px)',
                                    border: '2px solid',
                                  '&:hover': {
                                      borderColor: 'rgba(0, 212, 170, 0.6)',
                                      backgroundColor: 'rgba(255, 255, 255, 0.08)'
                                  }
                                }),
                                multiValue: (base) => ({
                                  ...base,
                                  backgroundColor: 'rgba(0, 212, 170, 0.2)',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(0, 212, 170, 0.3)',
                                    padding: '2px 8px'
                                }),
                                multiValueLabel: (base) => ({
                                  ...base,
                                  color: '#00D4AA',
                                  fontSize: '14px',
                                    fontWeight: '600'
                                }),
                                multiValueRemove: (base) => ({
                                  ...base,
                                  color: '#00D4AA',
                                  '&:hover': {
                                    backgroundColor: 'rgba(0, 212, 170, 0.3)',
                                    color: 'white'
                                  }
                                }),
                                placeholder: (base) => ({
                                  ...base,
                                  color: 'rgba(255, 255, 255, 0.4)',
                                  fontSize: '16px'
                                }),
                                menu: (base) => ({
                                  ...base,
                                    backgroundColor: 'rgba(37, 42, 58, 0.98)',
                                    border: '2px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    backdropFilter: 'blur(12px)',
                                    overflow: 'hidden',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                                }),
                                option: (base, state) => ({
                                  ...base,
                                  backgroundColor: state.isFocused ? 'rgba(0, 212, 170, 0.2)' : 'transparent',
                                  color: 'white',
                                    padding: '14px 18px',
                                    fontSize: '15px',
                                    fontWeight: '500'
                                }),
                                input: (base) => ({
                                  ...base,
                                  color: 'white'
                                })
                              }}
                            />
                          </div>
                          </div>
                        </FormSection>

                        <div className="flex justify-end mt-8">
                          <EnhancedButton
                            variant="primary"
                            onClick={() => handleStepChange(2)}
                            className="px-8 py-4"
                          >
                            Next: Budget & Timeline →
                          </EnhancedButton>
                      </div>
                    </div>

                      {/* Step 2: Budget & Timeline */}
                      <div className={`transition-all duration-300 ${currentStep === 2 ? 'block' : 'hidden'}`}>
                        <FormSection title="Pricing Strategy" icon="💰">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <PricingStrategyRadio
                                value="fixed"
                                label="Fixed Price"
                                description="Set a fixed budget for the entire project. Perfect for well-defined projects with clear scope."
                                icon="💎"
                                checked={formValues.pricing_strategy === 'fixed'}
                                onChange={(value) => {
                                  setFormValues(prev => ({
                                    ...prev,
                                    pricing_strategy: value,
                                    hourly_rate: 0,
                                    estimated_hours: 0,
                                    max_hours: 0,
                                    budget: 0
                                  }));
                                }}
                              />
                              
                              <PricingStrategyRadio
                                value="hourly"
                                label="Hourly Rate"
                                description="Pay based on actual time worked. Ideal for projects with evolving requirements."
                                icon="⏰"
                                checked={formValues.pricing_strategy === 'hourly'}
                                onChange={(value) => {
                                  setFormValues(prev => ({
                                    ...prev,
                                    pricing_strategy: value,
                                    budget: 0
                                  }));
                                }}
                              />
                            </div>
                            
                            {/* Hourly pricing details - moved outside the radio component */}
                            {formValues.pricing_strategy === 'hourly' && (
                              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">Hourly Rate</label>
                                    <div className="relative">
                                      <input
                                        type="number"
                                        value={formValues.hourly_rate || ''}
                                        onChange={(e) => {
                                          const rate = Number(e.target.value) || 0;
                                          setFormValues(prev => ({
                                            ...prev,
                                            hourly_rate: rate,
                                            budget: rate * (prev.max_hours || 0)
                                          }));
                                        }}
                                        placeholder="e.g., 500"
                                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:bg-white/10 focus:border-client-accent/50 focus:ring-2 focus:ring-client-accent/20 transition-all duration-300 text-white placeholder-white/40 backdrop-blur-sm text-sm"
                                      />
                                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 text-sm">₹</span>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">Estimated Hours</label>
                                    <input
                                      type="number"
                                      value={formValues.estimated_hours || ''}
                                      onChange={(e) => {
                                        const hours = Number(e.target.value) || 0;
                                        setFormValues(prev => ({
                                          ...prev,
                                          estimated_hours: hours,
                                          max_hours: Math.max(hours, prev.max_hours || 0)
                                        }));
                                      }}
                                      placeholder="e.g., 40"
                                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:bg-white/10 focus:border-client-accent/50 focus:ring-2 focus:ring-client-accent/20 transition-all duration-300 text-white placeholder-white/40 backdrop-blur-sm text-sm"
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">Max Hours</label>
                                    <input
                                      type="number"
                                      value={formValues.max_hours || ''}
                                      onChange={(e) => {
                                        const maxHrs = Number(e.target.value) || 0;
                                        setFormValues(prev => ({
                                          ...prev,
                                          max_hours: maxHrs,
                                          budget: (prev.hourly_rate || 0) * maxHrs
                                        }));
                                      }}
                                      placeholder="e.g., 60"
                                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:bg-white/10 focus:border-client-accent/50 focus:ring-2 focus:ring-client-accent/20 transition-all duration-300 text-white placeholder-white/40 backdrop-blur-sm text-sm"
                                    />
                                  </div>
                                </div>
                                
                                {formValues.hourly_rate > 0 && formValues.max_hours > 0 && (
                                  <div className="mt-3 p-3 bg-client-accent/10 rounded-lg border border-client-accent/20">
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="text-text-secondary">Estimated Cost:</span>
                                      <span className="text-client-accent font-semibold">₹{((formValues.hourly_rate || 0) * (formValues.estimated_hours || 0)).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm mt-1">
                                      <span className="text-text-secondary">Maximum Cost:</span>
                                      <span className="text-client-accent font-semibold">₹{((formValues.hourly_rate || 0) * (formValues.max_hours || 0)).toLocaleString()}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </FormSection>

                        <FormSection title="Budget & Timeline" icon="📅">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {formValues.pricing_strategy === 'fixed' ? (
                            <EnhancedInput
                              label="Project Budget"
                              required={true}
                              type="number"
                              name="budget"
                              value={formValues.budget}
                              onChange={formOnchange}
                              onWheel={(e) => e.target.blur()}
                                placeholder="e.g., 50000"
                              icon="₹"
                              className="text-lg"
                            />
                            ) : (
                              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <label className="text-sm font-medium text-white/90">Project Budget</label>
                                    <p className="text-xs text-white/60 mt-1">Calculated from hourly rate × max hours</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-client-accent font-bold text-2xl">
                                      ₹{formValues.budget.toLocaleString()}
                                    </div>
                                    <div className="text-text-secondary text-sm">
                                      Max: ₹{((formValues.hourly_rate || 0) * (formValues.max_hours || 0)).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                          <div>
                              <label className="input-label required">Project Deadline</label>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                                value={dayjs(formValues.deadline)}
                                onChange={(newValue) => {
                                  handleDeadlineChange(newValue.toDate());
                                }}
                                minDate={dayjs(today)}
                                maxDate={dayjs('2030-01-01')}
                                format="MMMM D, YYYY"
                                sx={{
                                  width: '100%',
                                  '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                      borderRadius: '16px',
                                      minHeight: '56px',
                                      backdropFilter: 'blur(8px)',
                                      border: '2px solid rgba(255, 255, 255, 0.1)',
                                    '& fieldset': {
                                        border: 'none',
                                      },
                                      '&:hover': {
                                        borderColor: 'rgba(0, 212, 170, 0.6)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                      },
                                      '&.Mui-focused': {
                                        borderColor: 'rgba(0, 212, 170, 0.6)',
                                        boxShadow: '0 0 0 4px rgba(0, 212, 170, 0.15)',
                                    },
                                  },
                                  '& .MuiInputBase-input': {
                                    color: 'white',
                                      padding: '16px 20px',
                                    fontSize: '16px',
                                      fontWeight: '500',
                                  },
                                  '& .MuiSvgIcon-root': {
                                    color: 'rgba(255, 255, 255, 0.6)',
                                  },
                                }}
                              />
                            </LocalizationProvider>
                        </div>
                          </div>
                        </FormSection>

                        <FormSection title="Project Milestones" icon="🎯">
                          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                              <div>
                                <label className="text-sm font-medium text-white/90">
                                Add Project Milestones
                              </label>
                              <p className="text-xs text-white/60 mt-1">
                                {formValues.pricing_strategy === 'hourly' 
                                  ? 'Break your project into manageable phases with time tracking'
                                  : 'Break your project into manageable phases'
                                }
                              </p>
                              </div>
                            <Switch
                              checked={showProjectMilestones}
                              onChange={setShowProjectMilestones}
                              className={`${
                                showProjectMilestones ? 'bg-client-accent' : 'bg-white/20'
                              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300`}
                            >
                              <span className="sr-only">Enable project milestones</span>
                              <span
                                className={`${
                                  showProjectMilestones ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm`}
                              />
                            </Switch>
                        </div>

                          {/* Hourly project configuration options */}
                          {formValues.pricing_strategy === 'hourly' && showProjectMilestones && (
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10 mt-4">
                              <h4 className="text-sm font-medium text-white/90 mb-3">Hourly Project Settings</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="checkbox"
                                    id="allow_hour_flexibility"
                                    checked={formValues.allow_hour_flexibility}
                                    onChange={(e) => setFormValues(prev => ({
                                      ...prev,
                                      allow_hour_flexibility: e.target.checked
                                    }))}
                                    className="w-4 h-4 text-client-accent border-white/30 rounded focus:ring-client-accent/50 bg-white/10"
                                  />
                                  <label htmlFor="allow_hour_flexibility" className="text-sm text-white/80">
                                    Allow hour flexibility between milestones
                                  </label>
                                </div>

                                <div className="flex items-center space-x-3">
                                  <input
                                    type="checkbox"
                                    id="require_milestone_approval"
                                    checked={formValues.require_milestone_approval}
                                    onChange={(e) => setFormValues(prev => ({
                                      ...prev,
                                      require_milestone_approval: e.target.checked
                                    }))}
                                    className="w-4 h-4 text-client-accent border-white/30 rounded focus:ring-client-accent/50 bg-white/10"
                                  />
                                  <label htmlFor="require_milestone_approval" className="text-sm text-white/80">
                                    Require milestone approval
                                  </label>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-text-secondary mb-1">Emergency Hours</label>
                                  <input
                                    type="number"
                                    placeholder="e.g., 5"
                                    value={formValues.emergency_hours || ''}
                                    onChange={(e) => setFormValues(prev => ({
                                      ...prev,
                                      emergency_hours: Number(e.target.value) || 0
                                    }))}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:bg-white/10 focus:border-client-accent/50 focus:ring-2 focus:ring-client-accent/20 transition-all duration-300 text-white placeholder-white/40 backdrop-blur-sm text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                        {showProjectMilestones && (
                          <div className="space-y-4">
                            {formValues.milestones.map((milestone, index) => renderMilestoneCard(milestone, index))}
                            <button
                              type="button"
                              onClick={handleAddProjectMilestone}
                                className="w-full py-4 border-2 border-dashed border-white/20 rounded-xl text-white/70 hover:border-client-accent/50 hover:text-client-accent hover:bg-white/5 transition-all duration-300 backdrop-blur-sm"
                            >
                              <IoMdAdd className="inline-block mr-2 text-lg" />
                              Add Milestone
                            </button>
                          </div>
                        )}
                        </FormSection>
                        
                        <div className="flex justify-between gap-4 mt-8">
                          <EnhancedButton
                            variant="secondary"
                            onClick={() => handleStepChange(1)}
                            className="px-6 py-4"
                          >
                            ← Back
                          </EnhancedButton>
                          <EnhancedButton
                            variant="primary"
                              onClick={() => handleStepChange(3)}
                            className="px-8 py-4"
                          >
                              Next: Review →
                          </EnhancedButton>
                      </div>
                    </div>

                      {/* Step 3: Review */}
                      <div className={`transition-all duration-300 ${currentStep === 3 ? 'block' : 'hidden'}`}>
                        <FormSection title="Review & Submit" icon="✅">
                        <div className="space-y-6">
                          <ProjectReview project={formValues} isCollaborative={false} />
                          
                          <div className="flex justify-between gap-4 mt-8">
                              <EnhancedButton
                                variant="secondary"
                              onClick={() => handleStepChange(2)}
                                className="px-6 py-4"
                            >
                              ← Back
                              </EnhancedButton>
                              <EnhancedButton
                                variant="success"
                              type="submit"
                                className="px-8 py-4"
                            >
                              🚀 Post Project
                              </EnhancedButton>
                          </div>
                        </div>
                        </FormSection>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        title={
            <div className="text-lg font-semibold text-text-primary pb-3 border-b border-ui-border">
            Project Posted Successfully
          </div>
        }
        open={showSuccessModal}
        onOk={handleModalConfirm}
        onCancel={handleModalConfirm}
        okText="Okay"
        className="custom-modal"
        centered
        maskClosable={false}
        closeIcon={
          <span className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        }
      >
        <div className="py-4">
          <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-status-success bg-opacity-10 flex items-center justify-center">
                <svg className="w-6 h-6 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
                <p className="text-text-secondary">
                Your project has been posted successfully! You can view and manage it from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        title={
            <div className="text-lg font-semibold text-gray-900 pb-3 border-b border-ui-border">
            Payment Conflict Warning
          </div>
        }
        open={showPaymentWarningModal}
        onOk={() => setShowPaymentWarningModal(false)}
        onCancel={() => setShowPaymentWarningModal(false)}
        okText="Understood"
        cancelText="Close"
        className="custom-modal"
        centered
        maskClosable={false}
      >
        <div className="py-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-700">
                  Your available balance (₹{walletBalance - walletHoldBalance}) is insufficient for the automated payments (₹{totalRequiredAmount}) in this project. Please either reduce the automated payments or add more funds to your wallet.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        title={
            <div className="text-lg font-semibold text-gray-900 pb-3 border-b border-ui-border">
            Insufficient Wallet Balance
          </div>
        }
        open={showLowFundsModal}
        onOk={() => {
          setProceedAsDraft(true);
          setShowLowFundsModal(false);
          formSubmit({ preventDefault: () => {} });
        }}
        onCancel={() => {
          setShowLowFundsModal(false);
          setProceedAsDraft(false);
        }}
        okText="Save as Draft"
        cancelText="Edit Project"
        className="custom-modal"
        centered
        maskClosable={false}
        footer={[
          <Button
            key="addFunds"
            type="primary"
            onClick={() => handleAddFunds(requiredAmount)}
          >
            Add ₹{requiredAmount} to Wallet
          </Button>,
          <Button
            key="edit"
            onClick={() => {
              setShowLowFundsModal(false);
              setProceedAsDraft(false);
            }}
          >
            Edit Project
          </Button>,
          <Button
            key="draft"
            onClick={() => {
              setProceedAsDraft(true);
              setShowLowFundsModal(false);
              formSubmit({ preventDefault: () => {} });
            }}
          >
            Save as Draft
          </Button>,
        ]}
      >
        <div className="py-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-3">
              <p className="text-gray-700">
                Your wallet balance (₹{walletBalance}) {
                  walletHoldBalance > 0 ? `(₹${walletHoldBalance} is on hold) which will be deducted from your balance making it ₹${walletBalance - walletHoldBalance})` : ''
                } is insufficient for the automated payments (₹{totalRequiredAmount}) in this project.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">You have two options:</h4>
                <ul className="list-disc pl-5 text-gray-600 space-y-2">
                  <li>
                    <span className="font-medium">Save as Draft:</span> The project will be saved in draft status until you add sufficient funds to your wallet.
                  </li>
                  <li>
                    <span className="font-medium">Edit Project:</span> Modify or remove automated payments to match your current wallet balance.
                  </li>
                </ul>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Current automated payments include:
                <ul className="list-disc pl-5 mt-2">
                  {formValues.milestones.some(m => m.is_automated && ['payment', 'hybrid'].includes(m.milestone_type)) && (
                    <li>Project milestone payments</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
    </>
  );
};

export default React.memo(ProjectPost);
