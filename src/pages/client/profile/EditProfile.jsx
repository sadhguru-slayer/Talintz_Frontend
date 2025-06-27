import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import './EditProfile.css'
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
  Checkbox
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
  DeleteOutlined
} from "@ant-design/icons"; 
import { LuBuilding2 } from "react-icons/lu";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import moment from "moment";
import api from "../../../config/axios";
import { useMediaQuery } from 'react-responsive';
const customStyles = {
  tabActiveColor: 'var(--client-primary)',
  tabHoverColor: 'var(--client-secondary)',
  tabBgColor: 'var(--client-bg)',
};

const EditProfile = () => {
  const { userId, role, isAuthenticated, isEditable, currentUserId } = useOutletContext();
  
  
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [clientInfo, setClientInfo] = useState({
    // Basic Information
    name: "",
    email: "",
    bio: "",
    description: "",
    dob: null,
    gender: "",
    profile_picture: null,
    cover_photo: null,

    // Contact Information
    primary_email: "",
    secondary_email: "",
    phone_number: "",
    alternate_phone: "",

    // Address Information
    addresses: [],

    // Bank Information
    bank_details: {
      id: null,
      bank_name: '',
      account_number: '',
      ifsc_code: '',
      account_holder_name: '',
      branch_name: '',
      swift_code: '',
      primary: false,
      verified: false
    },

    // Company Information
    company: {
      id: null,
      name: "",
      registration_number: "",
      registration_date: null,
      company_type: "",
      industry: "",
      website: "",
      gst_number: "",
      pan_number: "",
      annual_turnover: "",
      employee_count: "",
    },
    
    // Business Preferences
    preferred_payment_method: "",
    project_preferences: {},
    budget_range: "",

    // Verification Status
    email_verified: false,
    phone_verified: false,
    identity_verified: false,
    id_verified: false,

    // Profile Status
    profile_status: "incomplete",
    account_tier: "basic",

    // Legal Information
    terms_accepted: false,
    privacy_policy_accepted: false,

    verification_documents: [],
  });

  const [showingProfilePicture, setShowingProfilePicture] = useState(null);
  const [file, setFile] = useState(null);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [acceptingTerms, setAcceptingTerms] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [documentFiles, setDocumentFiles] = useState({});

  // Add responsive breakpoints
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  useEffect(() => {
    const fetchProfileDetails = async () => {
      const accessToken = Cookies.get("accessToken");
      try {
        const response = await api.get(`/api/client/get_profile_data`, {
          params: { userId: userId },
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = response.data.profile;
        console.log("Data",data)
        setClientInfo({
          // Basic Information
          name: data.name,
          email: data.email,
          bio: data.bio || "",
          description: data.description || "",
          dob: data.dob ? moment(data.dob) : null,
          gender: data.gender || "",
          profile_picture: data.profile_picture,
          cover_photo: data.cover_photo,

          // Contact Information
          primary_email: data.contact_info?.primary_email || "",
          secondary_email: data.contact_info?.secondary_email || "",
          phone_number: data.contact_info?.phone_number || "",
          alternate_phone: data.contact_info?.alternate_phone || "",

          // Location Information
          location: data.location?.full_address || "",
          addresses: data.addresses || [],

          // Company Information
          company: {
            id: data.company_details?.id || null,
            name: data.company_details?.name || "",
            registration_number: data.company_details?.registration_number || "",
            registration_date: data.company_details?.registration_date ? moment(data.company_details.registration_date) : null,
            company_type: data.company_details?.company_type || "",
            industry: data.company_details?.industry || "",
            website: data.company_details?.website || "",
            gst_number: data.company_details?.gst_number || "",
            pan_number: data.company_details?.pan_number || "",
            annual_turnover: data.company_details?.annual_turnover || "",
            employee_count: data.company_details?.employee_count || "",
          },

          // Business Preferences
          preferred_payment_method: data.business_preferences?.preferred_payment_method || "",
          project_preferences: data.business_preferences?.project_preferences || {},
          budget_range: data.business_preferences?.budget_range || "",

          // Verification Status
          email_verified: data.verification_status?.email_verified || false,
          phone_verified: data.verification_status?.phone_verified || false,
          identity_verified: data.verification_status?.identity_verified || false,
          id_verified: data.verification_status?.identity_verified || false,

          // Profile Status
          profile_status: data.profile_status || "incomplete",
          account_tier: data.account_tier || "basic",

          // Legal Information
          terms_accepted: data.legal_status?.terms_accepted || false,
          privacy_policy_accepted: data.legal_status?.privacy_policy_accepted || false,

          verification_documents: data.verification_documents ? 
            data.verification_documents.map(doc => ({
              ...doc,
              expiry_date: doc.expiry_date ? moment(doc.expiry_date) : null,
              document_file: doc.document_file ? { 
                url: doc.document_file,
                name: doc.document_file.split('/').pop() 
              } : null
            })) : [],

          bank_details: {
            id: data.bank_details?.id,
            bank_name: data.bank_details?.bank_name || '',
            account_number: data.bank_details?.account_number || '',
            ifsc_code: data.bank_details?.ifsc_code || '',
            account_holder_name: data.bank_details?.account_holder_name || '',
            branch_name: data.bank_details?.branch_name || '',
            swift_code: data.bank_details?.swift_code || '',
            primary: data.bank_details?.primary || false,
            verified: data.bank_details?.verified || false
          },
        });

        // Set form values including bank details
        form.setFieldsValue({
          name: data.name,
          email: data.email,
          bio: data.bio,
          description: data.description,
          dob: data.dob ? moment(data.dob) : null,
          gender: data.gender,
          primary_email: data.contact_info?.primary_email,
          secondary_email: data.contact_info?.secondary_email,
          phone_number: data.contact_info?.phone_number,
          alternate_phone: data.contact_info?.alternate_phone,
          addresses: data.addresses || [],
          company: {
            name: data.company_details?.name,
            registration_number: data.company_details?.registration_number,
            registration_date: data.company_details?.registration_date ? moment(data.company_details.registration_date) : null,
            company_type: data.company_details?.company_type,
            industry: data.company_details?.industry,
            website: data.company_details?.website,
            gst_number: data.company_details?.gst_number,
            pan_number: data.company_details?.pan_number,
            annual_turnover: data.company_details?.annual_turnover,
            employee_count: data.company_details?.employee_count,
          },
          preferred_payment_method: data.business_preferences?.preferred_payment_method,
          budget_range: data.business_preferences?.budget_range,
          bank_details: {
            id: data.bank_details?.id,
            bank_name: data.bank_details?.bank_name || '',
            account_number: data.bank_details?.account_number || '',
            ifsc_code: data.bank_details?.ifsc_code || '',
            account_holder_name: data.bank_details?.account_holder_name || '',
            branch_name: data.bank_details?.branch_name || '',
            swift_code: data.bank_details?.swift_code || '',
            primary: data.bank_details?.primary || false,
            verified: data.bank_details?.verified || false
          },
          verification_documents: data.verification_documents ? 
            data.verification_documents.map(doc => ({
              ...doc,
              expiry_date: doc.expiry_date ? moment(doc.expiry_date) : null,
              document_file: doc.document_file ? { 
                url: doc.document_file,
                name: doc.document_file.split('/').pop() 
              } : null
            })) : []
        });

        // Update formData to include terms_accepted
        setClientInfo(prevData => ({
          ...prevData,
          terms_accepted: data.legal_status?.terms_accepted || false
        }));

      } catch (error) {
        console.error("Error fetching profile data:", error);
        message.error("Failed to load profile data");
      }
    };
    fetchProfileDetails();
  }, [userId, form]);

  useEffect(() => {
    if (clientInfo.name) {
      form.setFieldsValue(clientInfo);
    }
  }, [clientInfo, form]);

  useEffect(() => {
    setIsCheckboxChecked(clientInfo.terms_accepted);
  }, [clientInfo.terms_accepted]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log(file)
    if (file) {
      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
        message.error('Only image files are allowed!');
        return;
      }
      setFile(file);
      setShowingProfilePicture(URL.createObjectURL(file));
    }
  };

  const handleDocumentFileChange = (e, docId) => {
    const file = e.target.files[0];
    if (file) {
        // Check if the file is an image or PDF
        if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
            message.error('Only image and PDF files are allowed!');
            return;
        }
        
        // Store the file in state
        setDocumentFiles(prev => ({
            ...prev,
            [docId]: file
        }));
        
        // Get current documents from form
        const docs = form.getFieldValue('verification_documents') || [];
        
        // Update the specific document with file info (but not the actual file)
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
        
        // Update form with new documents array
        form.setFieldsValue({ verification_documents: updatedDocs });
        message.success(`File "${file.name}" attached successfully`);
    }
  };

  const handleFormSubmit = async (values) => {
    // Validate all sections
    const validationErrors = [];
    
    // Validate verification documents
    if (!validateVerificationDocuments(values.verification_documents)) {
        validationErrors.push("All verification documents must be completely filled or removed");
    }
    
    // Validate bank details
    if (!validateBankDetails(values.bank_details)) {
        validationErrors.push("All bank details must be completely filled or removed");
    }
    
    // Validate company details
    if (!validateCompanyDetails(values.company)) {
        validationErrors.push("All company details must be completely filled or removed");
    }
    
    // Validate addresses
    if (!validateAddresses(values.addresses)) {
        validationErrors.push("All addresses must be completely filled or removed");
    }
    
    // If there are validation errors, show them and stop submission
    if (validationErrors.length > 0) {
        message.error(
            <div>
                <p>Please fix the following issues:</p>
                <ul>
                    {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            </div>
        );
        return;
    }

    const accessToken = Cookies.get("accessToken");
    
    // Check if bank details are being updated or added
    const isBankDetailsUpdated = values.bank_details && (
        values.bank_details.bank_name ||
        values.bank_details.account_number ||
        values.bank_details.ifsc_code ||
        values.bank_details.account_holder_name ||
        values.bank_details.branch_name ||
        values.bank_details.swift_code
    );

    // Check if bank details are different from original data
    const isBankDetailsChanged = isBankDetailsUpdated && (
        values.bank_details.bank_name !== clientInfo.bank_details?.bank_name ||
        values.bank_details.account_number !== clientInfo.bank_details?.account_number ||
        values.bank_details.ifsc_code !== clientInfo.bank_details?.ifsc_code ||
        values.bank_details.account_holder_name !== clientInfo.bank_details?.account_holder_name ||
        values.bank_details.branch_name !== clientInfo.bank_details?.branch_name ||
        values.bank_details.swift_code !== clientInfo.bank_details?.swift_code
    );

    // If bank details are being updated and terms aren't accepted, show error
    if (isBankDetailsChanged && !clientInfo.terms_accepted && !isCheckboxChecked) {
        message.error('You must accept the terms and conditions to update bank details');
        return;
    }

    // Proceed with form submission
    const formData = new FormData();

    // Basic Information
    formData.append("bio", values.bio || "");
    formData.append("description", values.description || "");
    
    // Fix DOB handling
    if (values.dob) {
        console.log('DOB value in form:', values.dob); // Debug log
        if (values.dob.$isDayjsObject) {  // Check for Day.js object
            console.log('DOB is Day.js object'); // Debug log
            const formattedDate = values.dob.format("YYYY-MM-DD");
            console.log('Formatted DOB:', formattedDate); // Debug log
            formData.append("dob", formattedDate);
        } else if (moment.isMoment(values.dob)) {
            console.log('DOB is moment object'); // Debug log
            if (values.dob.isValid()) {
                const formattedDate = values.dob.format("YYYY-MM-DD");
                console.log('Formatted DOB:', formattedDate); // Debug log
                formData.append("dob", formattedDate);
            }
        } else if (typeof values.dob === 'string') {
            console.log('DOB is string:', values.dob); // Debug log
            formData.append("dob", values.dob);
        } else if (values.dob instanceof Date) {
            console.log('DOB is Date object'); // Debug log
            formData.append("dob", moment(values.dob).format("YYYY-MM-DD"));
        }
    } else {
        console.log('No DOB value'); // Debug log
    }
    
    formData.append("gender", values.gender || "");

    // Contact Information
    formData.append("primary_email", values.primary_email || "");
    formData.append("secondary_email", values.secondary_email || "");
    formData.append("phone_number", values.phone_number || "");
    formData.append("alternate_phone", values.alternate_phone || "");

    // Fix addresses format - include IDs
    if (values.addresses && values.addresses.length > 0) {
        const validAddresses = values.addresses.filter(addr => 
            addr.street_address && addr.city && addr.state && addr.country && addr.postal_code
        ).map(addr => ({
            id: addr.id || null,  // Include the address ID, default to null if not present
            street_address: addr.street_address,
            city: addr.city,
            state: addr.state,
            country: addr.country,
            postal_code: addr.postal_code,
            address_type: addr.address_type || 'registered',
            is_primary: Boolean(addr.is_primary) || false
        }));
        
        if (validAddresses.length > 0) {
            // Remove the extra array wrapper
            formData.append("addresses", JSON.stringify(validAddresses));
        }
    }

    // Fix company data handling
    if (values.company) {
        const companyData = {
            id: clientInfo.company.id,
            name: values.company.name || '',
            registration_number: values.company.registration_number || '',
            // Fix registration date handling
            registration_date: values.company.registration_date && 
                             moment.isMoment(values.company.registration_date) && 
                             values.company.registration_date.isValid() ?
                             values.company.registration_date.format("YYYY-MM-DD") : null,
            company_type: values.company.company_type || '',
            industry: values.company.industry || '',
            website: values.company.website || '',
            gst_number: values.company.gst_number || '',
            pan_number: values.company.pan_number || '',
            annual_turnover: values.company.annual_turnover || null,
            employee_count: values.company.employee_count || null
        };

        // Only append company data if at least one field has a value
        const hasValue = Object.values(companyData).some(value => 
            value !== null && value !== '' && value !== undefined
        );
        
        if (hasValue) {
            // Ensure registration_date is not null if other fields are present
            if (!companyData.registration_date && 
                (companyData.name || companyData.registration_number || companyData.company_type)) {
                companyData.registration_date = moment().format("YYYY-MM-DD"); // Set to current date as default
            }
            
            console.log("Sending company data:", companyData);
            formData.append("company", JSON.stringify(companyData));
        }
    }

    // Format business preferences
    const businessPrefs = {
        preferred_payment_method: values.preferred_payment_method || "",
        budget_range: values.budget_range || "",
        project_preferences: values.project_preferences || {}
    };
    formData.append("business_preferences", JSON.stringify(businessPrefs));

    // Only include bank details if they have actual values and are not verified
    if (values.bank_details && !clientInfo.bank_details?.verified) {
        const bankDetails = {
            bank_name: values.bank_details.bank_name,
            account_number: values.bank_details.account_number,
            ifsc_code: values.bank_details.ifsc_code,
            account_holder_name: values.bank_details.account_holder_name,
            branch_name: values.bank_details.branch_name || '',
            swift_code: values.bank_details.swift_code || '',
            primary: Boolean(values.bank_details.primary)
        };
        
        // Only append bank details if at least one field has a value
        const hasBankDetails = Object.values(bankDetails).some(value => 
            value !== null && value !== '' && value !== undefined && value !== false
        );
        
        if (hasBankDetails) {
            if (values.bank_details.id) {
                bankDetails.id = values.bank_details.id;
            }
            console.log('Sending bank details:', bankDetails);
            formData.append("bank_details", JSON.stringify(bankDetails));
        }
    }

    // Handle verification documents
    if (values.verification_documents?.length > 0) {
        // First, add all the files to FormData
        values.verification_documents.forEach((doc) => {
            const docId = doc.id || doc.temp_id;
            const file = documentFiles[docId];
            if (file instanceof File) {
                const fileKey = `document_file_${docId}`;
                console.log(`Appending file ${fileKey}:`, file);
                formData.append(fileKey, file);
            }
        });

        // Then, create the document data without the file
        const validDocuments = values.verification_documents
            .filter(doc => doc.document_type && doc.document_number)
            .map((doc, index) => {
                const docData = {
                    ...(doc.id ? { id: doc.id } : {}),
                    document_type: doc.document_type,
                    document_number: doc.document_number,
                    expiry_date: doc.expiry_date ? doc.expiry_date.format("YYYY-MM-DD") : null,
                    verification_notes: doc.verification_notes || '',
                };
                
                if (!doc.id) {
                    docData.temp_id = doc.temp_id || `temp_${Date.now()}_${index}`;
                }
                return docData;
            });
        
        // Add the documents data
        formData.append("verification_documents", JSON.stringify(validDocuments));
        
        // Debug logging
        console.log("FormData contents for verification documents:");
        for (let pair of formData.entries()) {
            if (pair[0].startsWith('document_file_') || pair[0] === 'verification_documents') {
                console.log(pair[0], pair[1]);
            }
        }
    }

    // Profile Picture
    if (file) {
      formData.append("profile_picture", file);
    }

    try {
        console.log("Submitting form data...");
        
        // Log FormData contents for debugging
        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]);
        }
        
        const response = await axios.put(
            "https://talintzbackend-production.up.railway.app/api/client/update_profile/",
            formData,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        message.success("Profile updated successfully!");
        navigate(`/client/profile/${userId}/view_profile`);
    } catch (error) {
        console.error("Error updating profile:", error.response?.data || error);
        message.error(error.response?.data?.error || "Failed to update profile");
    }
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

  // Add this function to handle terms acceptance
  const handleTermsAcceptance = async () => {
    if (!termsAccepted) {
      message.error('You must accept the terms to continue');
      return;
    }
    
    setAcceptingTerms(true);
    try {
      const accessToken = Cookies.get("accessToken");
      await axios.put(
        'https://talintzbackend-production.up.railway.app/api/client/update_terms_acceptance',
        { terms_accepted: true },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      setAcceptingTerms(false);
      setTermsModalVisible(false);
      
      // Update local state
      setClientInfo(prev => ({
        ...prev,
        terms_accepted: true
      }));
      
      message.success('Terms accepted successfully');
    } catch (error) {
      console.error('Error accepting terms:', error);
      message.error('Failed to accept terms. Please try again.');
      setAcceptingTerms(false);
    }
  };

  // Add this function to check terms before editing sensitive sections
  const checkTermsBeforeEdit = (section) => {
    if (!clientInfo.terms_accepted) {
      setEditingSection(section);
      setTermsModalVisible(true);
      return false;
    }
    return true;
  };

  // Modify bank details click handler
  const handleBankDetailsClick = () => {
    if (checkTermsBeforeEdit('bank')) {
      setActivePanelKey('bank');
    }
  };

  // Modify verification documents click handler
  const handleDocumentsClick = () => {
    if (checkTermsBeforeEdit('documents')) {
      setActivePanelKey('documents');
    }
  };

  // Update the TermsSection component
  const TermsSection = () => {
    if (clientInfo.terms_accepted) {
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
      <div className="bg-client-bg-card p-6 rounded-lg border-2 border-client-primary mb-6">
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
              className="bg-client-primary hover:bg-client-secondary"
            >
              View Terms and Conditions
            </Button>
            
          </div>
        </div>
      </div>
    );
  };

  // Modify the Submit Button to show different text based on bank details
  const SubmitButton = () => {
    const bankDetails = form.getFieldValue('bank_details');
    const isBankDetailsPresent = bankDetails && (
      bankDetails.bank_name ||
      bankDetails.account_number ||
      bankDetails.ifsc_code ||
      bankDetails.account_holder_name
    );

    const needsTerms = isBankDetailsPresent && !clientInfo.terms_accepted && !isCheckboxChecked;

    return (
      <Button
        icon={<SaveOutlined />}
        htmlType="submit"
        className="bg-client-primary hover:bg-client-secondary text-text-light border-none px-8 h-12 rounded-lg text-base flex items-center gap-2 shadow-lg"
      >
        {needsTerms ? 'Accept Terms to Save Bank Details' : 'Save Changes'}
      </Button>
    );
  };

  // Add this validation function at the top of your component
  const validateVerificationDocuments = (documents) => {
    if (!documents || documents.length === 0) return true; // Empty is allowed
    
    return documents.every(doc => {
      const hasAllRequiredFields = 
        doc.document_type && 
        doc.document_number && 
        doc.expiry_date && 
        doc.document_file;
      
      return hasAllRequiredFields;
    });
  };

  // Add this validation function for bank details
  const validateBankDetails = (bankDetails) => {
    if (!bankDetails) return true; // Empty is allowed
    
    const requiredFields = [
      'bank_name',
      'account_number',
      'ifsc_code',
      'account_holder_name'
    ];
    
    const hasAllFields = requiredFields.every(field => bankDetails[field]);
    const hasNoFields = requiredFields.every(field => !bankDetails[field]);
    
    return hasAllFields || hasNoFields; // Either all filled or all empty
  };

  // Add this validation function for company details
  const validateCompanyDetails = (company) => {
    if (!company) return true; // Empty is allowed
    
    const requiredFields = [
      'name',
      'registration_number',
      'registration_date',
      'company_type',
      'industry'
    ];
    
    const hasAllFields = requiredFields.every(field => company[field]);
    const hasNoFields = requiredFields.every(field => !company[field]);
    
    return hasAllFields || hasNoFields;
  };

  // Add this validation function for addresses
  const validateAddresses = (addresses) => {
    if (!addresses || addresses.length === 0) return true; // Empty is allowed
    
    return addresses.every(addr => {
      const requiredFields = [
        'street_address',
        'city',
        'state',
        'country',
        'postal_code'
      ];
      
      const hasAllFields = requiredFields.every(field => addr[field]);
      const hasNoFields = requiredFields.every(field => !addr[field]);
      
      return hasAllFields || hasNoFields;
    });
  };

  const handleDocumentView = (document) => {
    if (document.document_file?.url) {
      window.open(`https://talintzbackend-production.up.railway.app${document.document_file.url}`, '_blank');
    } else if (document.preview_url) {
      window.open(document.preview_url, '_blank');
    }
  };

  const handleDocumentDelete = async (name, currentDoc, remove) => {
    // Check if the document has any filled fields
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
        onOk: async () => {
          if (currentDoc.id) {
            // If it's an existing document, delete from backend
            try {
              const accessToken = Cookies.get("accessToken");
              const response = await axios.delete(
                `https://talintzbackend-production.up.railway.app/api/client/delete_document/${currentDoc.id}/`,
                { 
                  headers: { 
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                  } 
                }
              );
              
              if (response.status === 200) {
                message.success('Document deleted successfully');
                // Remove from form
                remove(name);
              } else {
                throw new Error('Failed to delete document');
              }
            } catch (error) {
              console.error('Error deleting document:', error);
              message.error(error.response?.data?.error || 'Failed to delete document');
              return;
            }
          } else {
            // If it's a new document, just remove it from the form
            remove(name);
          }
        }
      });
    } else {
      // If it's a new document with no filled fields, just remove it
      remove(name);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-client-bg min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mx-auto space-y-4 ${
          isMobile ? 'p-2' : 
          isTablet ? 'p-4 max-w-[900px]' : 
          'p-6 max-w-[1200px]'
        }`}
      >
        {/* Header Section - More compact on mobile */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br from-client-primary via-client-primary/95 to-client-bg-dark"
        >
          <div className="relative py-2 px-3 sm:py-3 sm:px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Edit Profile</h2>
                <p className="text-sm sm:text-base text-client-tertiary">Update your professional information</p>
              </div>
              <motion.div whileHover={{ scale: 1.02 }}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate(`/client/profile/${userId}/view_profile`)}
                  className="bg-client-accent hover:bg-client-accent/90 text-text-light border-none h-8 sm:h-10 text-sm sm:text-base"
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
          layout="vertical"
          className="space-y-4 sm:space-y-6"
        >
          {/* Profile Picture Section - Optimized for mobile */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-client-bg-card rounded-lg shadow-md overflow-hidden"
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
                        (clientInfo.profile_picture ? `https://talintzbackend-production.up.railway.app${clientInfo.profile_picture}` : "https://www.w3schools.com/howto/img_avatar.png")
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
                        className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 rounded-full bg-client-primary text-text-light border-none hover:bg-client-secondary shadow-lg flex items-center justify-center"
                        style={{
                          width: isMobile ? '32px' : '40px',
                          height: isMobile ? '32px' : '40px'
                        }}
                        onClick={() => document.getElementById('fileInput').click()}
                      />
                    </Tooltip>
                  </motion.div>
                  <input
                    id="fileInput"
                    type="file"
                    className="hidden"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </div>
                <p className="text-xs sm:text-sm text-text-secondary text-center">Click the edit button to update your profile picture</p>
              </div>
            </div>
          </motion.div>

          {/* Tabs Section - Responsive padding and spacing */}
          <motion.div 
            variants={containerVariants}
            className="rounded-lg sm:rounded-xl shadow-lg overflow-hidden bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl border border-white/10"
          >
            <Tabs 
              defaultActiveKey="personal" 
              className="custom-tabs"
              type={isMobile ? "line" : "card"}
              tabBarStyle={{
                margin: 0,
                padding: isMobile ? '12px 16px 0' : '16px 24px 0',
                background: 'transparent',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {[
                {
                  key: 'personal',
                  label: (
                    <span className="flex items-center gap-2 text-base">
                      <UserOutlined className="text-lg" />
                      Personal Info
                    </span>
                  ),
                  children: (
                    <motion.div 
                      variants={itemVariants} 
                      className="p-6 md:p-8 space-y-6"
                    >
                      <Card className="mb-4 bg-gradient-to-br from-freelancer-secondary/40 to-freelancer-bg-dark/30 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                        <Row gutter={24}>
                          <Col span={24} md={12}>
                            <Form.Item label="Name" name="name" initialValue={clientInfo.name}>
                              <Input 
                                className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10 hover:border-freelancer-accent focus:border-freelancer-accent"
                                placeholder="Enter your name"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={24} md={12}>
                            <Form.Item label="Primary Email" name="primary_email" rules={[{ type: 'email' }]}>
                              <Input 
                                disabled
                                className="bg-client-primary backdrop-blur-sm text-text-light border-white/10 hover:border-client-accent focus:border-client-accent"
                                placeholder="Enter your primary email"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={24} md={12}>
                            <Form.Item label="Phone Number" name="phone_number">
                              <Input 
                                disabled
                                className="bg-client-primary backdrop-blur-sm text-text-light border-white/10 hover:border-client-accent focus:border-client-accent"
                                placeholder="Enter your phone number"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={24} md={12}>
                            <Form.Item label="Gender" name="gender">
                              <Select 
                                className=" backdrop-blur-sm text-text-light border-white/10 hover:border-client-accent focus:border-client-accent"
                                placeholder="Select your gender"
                              >
                                <Select.Option value="male">Male</Select.Option>
                                <Select.Option value="female">Female</Select.Option>
                                <Select.Option value="other">Other</Select.Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col  span={24} md={12}>
                            <Form.Item  label="Date of Birth" name="dob">
                              <DatePicker 
                                className="bg-freelancer-bg-card text-text-light border-freelancer-border-DEFAULT hover:border-freelancer-accent focus:border-freelancer-accent w-full"
                                placeholder="Select your date of birth"
                                format="YYYY-MM-DD"
                                popupClassName="custom-datepicker-dropdown"
                                getPopupContainer={(trigger) => trigger.parentElement}
                                style={{ width: '100%' }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>

                      <Card className="mb-4 bg-gradient-to-br from-freelancer-secondary/40 to-freelancer-bg-dark/30 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                        <Row gutter={24}>
                          <Col span={24}>
                            <Form.Item label="Bio" name="bio">
                              <Input.TextArea 
                                className="bg-client-primary backdrop-blur-sm text-text-light border-white/10 hover:border-client-accent focus:border-client-accent"
                                placeholder="Enter your bio"
                                rows={3}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={24}>
                            <Form.Item label="Description" name="description">
                              <Input.TextArea 
                                className="bg-client-primary backdrop-blur-sm text-text-light border-white/10 hover:border-client-accent focus:border-client-accent"
                                placeholder="Enter your description"
                                rows={4}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    </motion.div>
                  ),
                },
                {
                  key: 'address',
                  label: (
                    <span className="flex items-center gap-2 text-base">
                      <EnvironmentOutlined className="text-lg" />
                      Address
                    </span>
                  ),
                  children: (
                    <motion.div 
                      variants={itemVariants} 
                      className="p-6 md:p-8 space-y-6"
                    >
                      <Form.List name="addresses">
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name, ...restField }) => (
                              <Card key={key} className="mb-4">
                                <Row gutter={24}>
                                  <Col span={24}>
                                    <Form.Item {...restField} name={[name, 'id']} hidden>
                                      <Input type="hidden" />
                                    </Form.Item>
                                    <Form.Item {...restField} name={[name, 'street_address']} label="Street Address">
                                      <Input 
                                        className="bg-client-bg-card text-text-light border-client-border-DEFAULT hover:border-client-accent focus:border-client-accent"
                                        placeholder="Enter your street address"
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <Form.Item {...restField} name={[name, 'city']} label="City">
                                      <Input 
                                        className="bg-client-bg-card text-text-light border-client-border-DEFAULT hover:border-client-accent focus:border-client-accent"
                                        placeholder="Enter your city"
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <Form.Item {...restField} name={[name, 'state']} label="State">
                                      <Input 
                                        className="bg-client-bg-card text-text-light border-client-border-DEFAULT hover:border-client-accent focus:border-client-accent"
                                        placeholder="Enter your state"
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <Form.Item {...restField} name={[name, 'country']} label="Country">
                                      <Input 
                                        className="bg-client-bg-card text-text-light border-client-border-DEFAULT hover:border-client-accent focus:border-client-accent"
                                        placeholder="Enter your country"
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <Form.Item {...restField} name={[name, 'postal_code']} label="Postal Code">
                                      <Input 
                                        className="bg-client-bg-card text-text-light border-client-border-DEFAULT hover:border-client-accent focus:border-client-accent"
                                        placeholder="Enter your postal code"
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <Form.Item {...restField} name={[name, 'address_type']} label="Address Type">
                                      <Select 
                                        className="bg-client-bg-card text-text-light border-client-border-DEFAULT hover:border-client-accent focus:border-client-accent"
                                        placeholder="Select your address type"
                                      >
                                        <Select.Option value="registered">Registered</Select.Option>
                                        <Select.Option value="billing">Billing</Select.Option>
                                        <Select.Option value="shipping">Shipping</Select.Option>
                                      </Select>
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <Form.Item {...restField} name={[name, 'is_primary']} valuePropName="checked">
                                      <Switch checkedChildren="Primary" unCheckedChildren="Not Primary" />
                                    </Form.Item>
                                  </Col>
                                </Row>
                                <Button danger onClick={() => remove(name)}>Delete Address</Button>
                              </Card>
                            ))}
                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                              Add Address
                            </Button>
                          </>
                        )}
                      </Form.List>
                    </motion.div>
                  ),
                },
                {
                  key: 'company',
                  label: (
                    <span className="flex items-center gap-2 text-base">
                      <LuBuilding2 className="text-lg" />
                      Company
                    </span>
                  ),
                  children: (
                    <motion.div 
                      variants={itemVariants} 
                      className="p-6 md:p-8 space-y-6"
                    >
                      <Card className="mb-4 bg-gradient-to-br from-freelancer-secondary/40 to-freelancer-bg-dark/30 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                        <Row gutter={24}>
                          <Col span={24} md={12}>
                            <Form.Item label="Company Name" name={['company', 'name']}>
                              <Input 
                                className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10 hover:border-freelancer-accent focus:border-freelancer-accent"
                                placeholder="Enter your company name"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={24} md={12}>
                            <Form.Item label="Registration Number" name={['company', 'registration_number']}>
                              <Input 
                                className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10 hover:border-freelancer-accent focus:border-freelancer-accent"
                                placeholder="Enter your registration number"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={24} md={12}>
                            <Form.Item label="Registration Date" name={['company', 'registration_date']}>
                              <DatePicker 
                                className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10 hover:border-freelancer-accent focus:border-freelancer-accent w-full"
                                placeholder="Select your registration date"
                                popupClassName="custom-datepicker-dropdown"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={24} md={12}>
                            <Form.Item label="Company Type" name={['company', 'company_type']}>
                              <Input 
                                className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10 hover:border-freelancer-accent focus:border-freelancer-accent"
                                placeholder="Enter your company type"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={24} md={12}>
                            <Form.Item label="Industry" name={['company', 'industry']}>
                              <Input 
                                className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10 hover:border-freelancer-accent focus:border-freelancer-accent"
                                placeholder="Enter your industry"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={24} md={12}>
                            <Form.Item label="Website" name={['company', 'website']}>
                              <Input 
                                className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10 hover:border-freelancer-accent focus:border-freelancer-accent"
                                placeholder="Enter your company website"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>

                      <Card className="mb-4 bg-gradient-to-br from-freelancer-secondary/40 to-freelancer-bg-dark/30 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                        <Row gutter={24}>
                          <Col span={24} md={12}>
                            <Form.Item label="GST Number" name={['company', 'gst_number']}>
                              <Input 
                                className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10 hover:border-freelancer-accent focus:border-freelancer-accent"
                                placeholder="Enter your GST number"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={24} md={12}>
                            <Form.Item label="PAN Number" name={['company', 'pan_number']}>
                              <Input 
                                className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10 hover:border-freelancer-accent focus:border-freelancer-accent"
                                placeholder="Enter your PAN number"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={24} md={12}>
                            <Form.Item label="Annual Turnover" name={['company', 'annual_turnover']}>
                              <InputNumber 
                                className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10 hover:border-freelancer-accent focus:border-freelancer-accent w-full"
                                placeholder="Enter your annual turnover"
                                controls={false}
                                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/₹\s?|(,*)/g, '')}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={24} md={12}>
                            <Form.Item label="Employee Count" name={['company', 'employee_count']}>
                              <InputNumber 
                                className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10 hover:border-freelancer-accent focus:border-freelancer-accent w-full text-center"
                                placeholder="Enter your employee count"
                                controls={false}
                                min={0}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    </motion.div>
                  ),
                },
                {
                  key: 'banking',
                  label: (
                    <span className="flex items-center gap-2 text-base">
                      <BankOutlined className="text-lg" />
                      Bank & Docs
                    </span>
                  ),
                  children: (
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
                            {clientInfo.bank_details?.verified && (
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
                                className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10 hover:border-freelancer-accent focus:border-freelancer-accent"
                                readOnly={clientInfo.bank_details?.verified}
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} md={12}>
                            <Form.Item 
                              name={['bank_details', 'account_number']} 
                              label="Account Number"
                            >
                              <Input 
                                className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10 hover:border-freelancer-accent focus:border-freelancer-accent"
                                readOnly={clientInfo.bank_details?.verified}
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} md={12}>
                            <Form.Item 
                              name={['bank_details', 'ifsc_code']} 
                              label="IFSC Code"
                            >
                              <Input 
                                className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10 hover:border-freelancer-accent focus:border-freelancer-accent"
                                readOnly={clientInfo.bank_details?.verified}
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} md={12}>
                            <Form.Item 
                              name={['bank_details', 'account_holder_name']} 
                              label="Account Holder Name"
                            >
                              <Input 
                                className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10 hover:border-freelancer-accent focus:border-freelancer-accent"
                                readOnly={clientInfo.bank_details?.verified}
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} md={12}>
                            <Form.Item 
                              name={['bank_details', 'branch_name']} 
                              label="Branch Name"
                            >
                              <Input 
                                className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10 hover:border-freelancer-accent focus:border-freelancer-accent"
                                readOnly={clientInfo.bank_details?.verified}
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} md={12}>
                            <Form.Item 
                              name={['bank_details', 'swift_code']} 
                              label="SWIFT Code"
                            >
                              <Input 
                                className="bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10 hover:border-freelancer-accent focus:border-freelancer-accent"
                                readOnly={clientInfo.bank_details?.verified}
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
                                disabled={clientInfo.bank_details?.verified}
                              />
                            </Form.Item>
                          </Col>
                          {clientInfo.bank_details?.verified && (
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
                                      <Form.Item {...restField} name={[name, 'temp_id']} hidden>
                                        <Input type="hidden" />
                                      </Form.Item>
                                      <Form.Item 
                                        {...restField} 
                                        name={[name, 'document_type']} 
                                        label="Document Type"
                                        rules={[{ required: true, message: 'Document type is required' }]}
                                      >
                                        <Select 
                                          className="bg-freelancer-bg-card text-text-light border-freelancer-border-DEFAULT hover:border-freelancer-accent focus:border-freelancer-accent"
                                          disabled={isVerified}
                                        >
                                          <Select.Option value="id_proof">ID Proof</Select.Option>
                                          <Select.Option value="address_proof">Address Proof</Select.Option>
                                          <Select.Option value="pan_card">PAN Card</Select.Option>
                                          <Select.Option value="gst_certificate">GST Certificate</Select.Option>
                                          <Select.Option value="company_registration">Company Registration</Select.Option>
                                          <Select.Option value="bank_statement">Bank Statement</Select.Option>
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
                                          className="bg-freelancer-bg-card text-text-light border-freelancer-border-DEFAULT hover:border-freelancer-accent focus:border-freelancer-accent"
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
                                          className="bg-freelancer-bg-card text-text-light border-freelancer-border-DEFAULT hover:border-freelancer-accent focus:border-freelancer-accent w-full"
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
                                          className="bg-freelancer-bg-card text-text-light border-freelancer-border-DEFAULT hover:border-freelancer-accent focus:border-freelancer-accent"
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
                                          <span className="text-sm text-client-tertiary break-all">
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
                  ),
                },
              ].map(tab => (
                <Tabs.TabPane key={tab.key} tab={tab.label}>
                  {tab.children}
                </Tabs.TabPane>
              ))}
            </Tabs>
          </motion.div>

          {/* Submit Button - Responsive positioning */}
          <motion.div 
            variants={itemVariants} 
            className={`flex justify-end pt-4 sm:pt-6 ${
              isMobile ? 'sticky bottom-0 bg-client-bg/80 backdrop-blur-sm p-2' : ''
            }`}
          >
            <SubmitButton />
          </motion.div>
        </Form>
      </motion.div>

      {/* Terms Modal */}
      <TermsAndConditionsModal />

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

        /* Select Dropdown Styling */
        .ant-select-dropdown {
          background: var(--freelancer-tertiary) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .ant-select-item {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
          background: var(--freelancer-accent) !important;
          color: white !important;
        }

        .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
          background: rgba(255, 255, 255, 0.05) !important;
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
      `}</style>
    </div>
  );
};

export default EditProfile;
