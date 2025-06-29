import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingComponent from '../components/LoadingComponent';
import { refreshToken, verifyToken } from "../utils/auth";
import Cookies from 'js-cookie';
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Modal, Card } from 'antd';
import { getBaseURL } from "../config/axios";
import LogoCode from '../logoCode';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { CheckCircleFilled } from '@ant-design/icons';
import { message } from 'antd';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract referral code from URL
  const urlParams = new URLSearchParams(location.search);
  const referralCode = urlParams.get('ref');
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    isStudent: false,
    referralCode: referralCode || ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);

  // Auth check effect
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const token = Cookies.get('accessToken');
        if (!token) {
          setLoading(false);
          return;
        }
        const isValid = await verifyToken(token);
        if (isValid) {
          const role = Cookies.get('role');
          navigate(role === 'client' ? '/client/homepage' : '/freelancer/homepage', { replace: true });
          return;
        }
        Cookies.remove('accessToken', { path: '/' });
        Cookies.remove('refreshToken', { path: '/' });
        Cookies.remove('role', { path: '/' });
        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  // Modify handleInputChange for email validation
  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear existing error for the field
    setErrors(prev => ({
      ...prev,
      [name]: undefined
    }));

    // Reset email valid state when email changes
    if (name === 'email') {
      setIsEmailValid(false);
    }

    // Check email existence when email field changes
    if (name === 'email') {
      // First check if email format is valid
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(value)) {
        setIsCheckingEmail(true);
        const exists = await checkEmailExists(value);
        setIsCheckingEmail(false);
        
        if (exists) {
          setErrors(prev => ({
            ...prev,
            email: "This email is already registered. Please use a different email or login."
          }));
          setIsEmailValid(false);
        } else {
          setIsEmailValid(true);
        }
      } else {
        setIsEmailValid(false);
      }
    }

    // Password strength check remains the same
    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Check role first - this is required before proceeding
    if (!formData.role) {
      newErrors.role = "Please select whether you want to Work or Hire";
      // Show error prominently
      setErrors(newErrors);
      // Scroll to role selection
      document.querySelector('.role-selection')?.scrollIntoView({ behavior: 'smooth' });
      return false;
    }
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const requestData = {
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        role: formData.isStudent ? "student" : formData.role.toLowerCase(),
        is_talentrise: formData.isStudent
      };

      // Add referral code if present
      if (formData.referralCode) {
        requestData.referral_code = formData.referralCode;
      }

      // const response = await axios.post(
      //   `${getBaseURL()}/api/register/create_user/`,
      //   requestData
      // );

      const reponse = null;

      if (response.data.access && response.data.refresh) {
        const cookieOptions = {
          secure: true,
          sameSite: 'Strict',
          path: '/'
        };

        Cookies.set("accessToken", response.data.access, cookieOptions);
        Cookies.set("refreshToken", response.data.refresh, cookieOptions);
        Cookies.set("role", response.data.role, cookieOptions);
        
        if (formData.isStudent) {
          Cookies.set("is_talentrise", "true", cookieOptions);
        }

        // Show success message if referred
        if (response.data.referral_info) {
          message.success(`Welcome! You were referred by ${response.data.referral_info.referred_by}`);
        }

        navigate(formData.role === 'client' ? '/client/homepage' : '/freelancer/homepage', { replace: true });
      }
    } catch (error) {
      setLoading(false);
      setErrors({
        api: error.response?.data?.error || "Registration failed. Please try again."
      });
    }
  };

  // Show modal for mobile devices
  const showRoleModal = () => {
    setIsModalVisible(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  // Modify the checkEmailExists function
  const checkEmailExists = async (email) => {
    try {
      const response = await axios.get(
        `${getBaseURL()}/api/register/check-email/?email=${encodeURIComponent(email)}`
      );
      return response.data.exists;
    } catch (error) {
      console.error('Email check failed:', error);
      return true; // Return true to be safe in case of error
    }
  };

  if (loading) {
    return <LoadingComponent text="Please wait..." />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A1A] text-white overflow-hidden">
      {/* Back Navigation */}
      <div className="absolute top-6 left-6 z-50">
        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 text-sm text-gray-300 
            bg-white/5 hover:bg-white/10 border border-white/10 
            px-4 py-2.5 rounded-xl backdrop-blur-sm transition-all duration-300"
        >
          <ArrowLeftOutlined className="text-xs" />
          <span className="font-medium">Back to Home</span>
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex flex-col lg:flex-row relative">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Dark base layer */}
          <div className="absolute inset-0 bg-[#0A0A1A]" />
          
          {/* Gradient background with animated overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.4, 0.3] }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0"
            style={{ 
              background: `
                linear-gradient(
                  135deg,
                  rgba(99, 102, 241, 0.1) 0%,
                  rgba(0, 212, 170, 0.1) 100%
                )
              `
            }}
          />

          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#6366F1]/10 rounded-full blur-3xl -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00D4AA]/10 rounded-full blur-2xl -ml-40 -mb-40" />
        </div>

        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-16">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <LogoCode width="80" height="80" className="text-white" />
              <h1 className="text-5xl font-bold leading-tight">
                Join the{" "}
                <span className="bg-gradient-to-r from-[#00D4AA] to-[#6366F1] bg-clip-text text-transparent">
                  Talintz
                </span>
                {" "}Community
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Connect with opportunities and talent in one professional platform.
                Start your journey with us today.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right Panel - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 lg:p-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <Card className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection */}
                <div className="space-y-3 role-selection">
                  <label className="block text-sm font-medium text-gray-300">
                    I want to...
                    {errors.role && (
                      <span className="text-red-400 ml-2 text-xs">
                        {errors.role}
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Work Button */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleInputChange({ target: { name: 'role', value: 'freelancer' } });
                        setErrors(prev => ({ ...prev, role: undefined }));
                      }}
                      className={`
                        p-4 rounded-xl text-left relative overflow-hidden
                        ${formData.role === 'freelancer'
                          ? 'bg-gradient-to-r from-[#6366F1] to-[#00D4AA] text-white shadow-glow-purple'
                          : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'}
                        transition-all duration-300
                      `}
                    >
                      <span className="block font-medium">Work</span>
                      <span className="text-sm opacity-80">as a Freelancer</span>
                    </motion.button>

                    {/* Hire Button */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleInputChange({ target: { name: 'role', value: 'client' } });
                        setErrors(prev => ({ ...prev, role: undefined }));
                      }}
                      className={`
                        p-4 rounded-xl text-left relative overflow-hidden
                        ${formData.role === 'client'
                          ? 'bg-gradient-to-r from-[#00D4AA] to-[#6366F1] text-white shadow-glow-teal'
                          : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'}
                        transition-all duration-300
                      `}
                    >
                      <span className="block font-medium">Hire</span>
                      <span className="text-sm opacity-80">Talent</span>
                    </motion.button>
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`
                        w-full px-4 py-3 rounded-xl
                        bg-white/5 border border-white/10
                        focus:border-[#6366F1] focus:ring-[#6366F1]/20 focus:ring-2
                        text-white placeholder-gray-500
                        transition-all duration-200
                      `}
                      placeholder="Enter your email"
                    />
                    {isCheckingEmail && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <span className="w-5 h-5 border-2 border-[#6366F1]/30 border-t-[#6366F1] rounded-full animate-spin"></span>
                      </div>
                    )}
                    {isEmailValid && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                      >
                        <CheckCircleFilled style={{ fontSize: '20px' }} />
                      </motion.div>
                    )}
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-400"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`
                        w-full px-4 py-3 rounded-xl
                        bg-white/5 border border-white/10
                        focus:border-[#6366F1] focus:ring-[#6366F1]/20 focus:ring-2
                        text-white placeholder-gray-500
                        transition-all duration-200
                      `}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {/* Password Strength Indicator */}
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 w-full rounded-full transition-colors duration-300 ${
                            i < passwordStrength
                              ? passwordStrength <= 2 ? 'bg-orange-500'
                                : passwordStrength === 3 ? 'bg-yellow-500'
                                : 'bg-green-500'
                              : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">
                      {passwordStrength === 0 && "Use 8+ characters with letters, numbers & symbols"}
                      {passwordStrength === 1 && "Password is weak"}
                      {passwordStrength === 2 && "Password is fair"}
                      {passwordStrength === 3 && "Password is good"}
                      {passwordStrength === 4 && "Password is strong"}
                    </p>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`
                        w-full px-4 py-3 rounded-xl
                        bg-white/5 border border-white/10
                        focus:border-[#6366F1] focus:ring-[#6366F1]/20 focus:ring-2
                        text-white placeholder-gray-500
                        transition-all duration-200
                      `}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p className="text-xs text-red-400">
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    w-full py-3 rounded-xl
                    bg-gradient-to-r from-[#6366F1] to-[#00D4AA]
                    text-white font-medium
                    shadow-lg hover:shadow-xl
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-300
                    mt-6
                  `}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </motion.button>

                {/* Referral Code Display */}
                {formData.referralCode && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <p className="text-sm text-green-400">
                      <span className="font-medium">Referral Code Applied:</span> {formData.referralCode}
                    </p>
                  </div>
                )}

                {/* Sign In Link */}
                <p className="text-center text-sm text-gray-300 mt-6">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="font-medium text-[#6366F1] hover:text-[#00D4AA] transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Keep the Modal component as is */}
      <Modal
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        centered
        className="rounded-2xl overflow-hidden dark-modal"
        style={{ padding: 0 }}
      >
        {/* ... Modal content remains the same ... */}
      </Modal>
    </div>
  );
};

export default RegistrationForm;
