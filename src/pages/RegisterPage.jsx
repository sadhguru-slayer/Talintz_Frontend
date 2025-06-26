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

      const response = await axios.post(
        `${getBaseURL()}/api/register/create_user/`,
        requestData
      );

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white">
      {/* Navigation */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-brand-primary
                     transition-colors group bg-white/10 shadow-md hover:shadow-lg
                     px-4 py-2.5 rounded-lg backdrop-blur-sm border border-white/20"
        >
          <ArrowLeftOutlined className="text-xs group-hover:transform group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Home</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex flex-col lg:flex-row relative !overflow-hidden">
         {/* Added abstract background shapes */}
         <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl -mr-48 -mt-48 animate-float"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-2xl -ml-40 -mb-40 animate-float-delayed"></div>
        </div>


        {/* Mobile Header (Updated styles for dark theme) */}
        <div className="lg:hidden w-full bg-gradient-to-b from-gray-800 to-gray-900
                        py-12 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/path/to/pattern.svg')] opacity-10"></div>
          <div className="relative z-10">
            <LogoCode width="60" height="60" className="mx-auto mb-6 text-white" />
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-white/90 text-sm max-w-xs mx-auto">
              Join our professional community today
            </p>
          </div>
        </div>

        {/* Desktop Left Panel (Updated styles for dark theme) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-primary to-brand-accent
                        items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/path/to/pattern.svg')] opacity-10"></div>
          <div className="relative z-10 max-w-lg text-white space-y-8">
            <LogoCode width="80" height="80" className="mb-8 text-white" />
            <h1 className="text-5xl font-bold leading-tight">
              Join Talintz Today
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Connect with opportunities and talent in one professional platform.
              Start your journey with us.
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 lg:p-12 relative z-10">
          <div className="w-full max-w-md">
             {/* Updated Card styles for dark theme */}
             <Card className="shadow-xl border border-white/10 overflow-hidden rounded-xl bg-white/5 backdrop-blur-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection with Error State (Adjusted styles for dark theme) */}
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
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleInputChange({ target: { name: 'role', value: 'freelancer' } });
                        setErrors(prev => ({ ...prev, role: undefined }));
                      }}
                      className={`
                        p-4 rounded-xl text-left
                        ${formData.role === 'freelancer'
                          ? 'bg-brand-primary text-white shadow-lg'
                          : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-brand-primary/30'}
                        ${errors.role ? 'border-red-700 shadow-red-900/20' : ''}
                        transition-all duration-200
                      `}
                    >
                      <span className="block font-medium">Work</span>
                      <span className="text-sm opacity-80">as a Freelancer</span>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleInputChange({ target: { name: 'role', value: 'client' } });
                        setErrors(prev => ({ ...prev, role: undefined }));
                      }}
                      className={`
                        p-4 rounded-xl text-left
                        ${formData.role === 'client'
                          ? 'bg-brand-primary text-white shadow-lg'
                          : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-brand-primary/30'}
                        ${errors.role ? 'border-red-700 shadow-red-900/20' : ''}
                        transition-all duration-200
                      `}
                    >
                      <span className="block font-medium">Hire</span>
                      <span className="text-sm opacity-80">Talent</span>
                    </motion.button>
                  </div>
                </div>

                {/* Email Input with real-time validation (Adjusted styles for dark theme) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className={`
                        w-full px-4 py-3 rounded-lg
                        border ${errors.email ? 'border-red-300' : isEmailValid ? 'border-green-500' : 'border-gray-700'}
                        focus:outline-none focus:ring-2
                        ${isEmailValid ? 'focus:ring-green-500/20 focus:border-green-500' : 'focus:ring-brand-primary/30 focus:border-brand-primary'}
                        text-white bg-gray-800
                        transition-all duration-200
                        placeholder-gray-500
                        ${(isCheckingEmail || isEmailValid) ? 'pr-10' : ''}
                      `}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isCheckingEmail ? (
                        <span className="w-5 h-5 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin block"></span>
                      ) : isEmailValid ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-green-500"
                        >
                          <CheckCircleFilled style={{ fontSize: '20px' }} />
                        </motion.div>
                      ) : null}
                    </div>
                  </div>
                  {errors.email ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex items-center gap-2 text-red-400"
                    >
                      <span className="text-xs">{errors.email}</span>
                      {errors.email.includes("already registered") && (
                        <button
                          type="button"
                          onClick={() => navigate('/login')}
                          className="text-xs font-medium text-brand-primary hover:text-brand-accent transition-colors"
                        >
                          Sign in instead
                        </button>
                      )}
                    </motion.div>
                  ) : isEmailValid ? (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-xs text-green-500"
                    >
                      Email is available
                    </motion.p>
                  ) : null}
                </div>

                {/* Password Input (Adjusted styles for dark theme) */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className={`
                        w-full px-3 py-2 rounded-lg pr-10
                        border ${errors.password ? 'border-red-300' : 'border-gray-700'}
                        focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary
                        text-white bg-gray-800
                        placeholder-gray-500
                      `}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  {/* Password Strength Indicator (Adjusted styles for dark theme) */}
                  <div className="mt-1 space-y-1">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 w-full rounded-full transition-colors ${
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
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-400">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password (Adjusted styles for dark theme) */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      className={`
                        w-full px-3 py-2 rounded-lg pr-10
                        border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-700'}
                        focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary
                        text-white bg-gray-800
                        placeholder-gray-500
                      `}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Student Option - Only show for freelancer role
                {formData.role === 'freelancer' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isStudent"
                      name="isStudent"
                      checked={formData.isStudent}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-600 text-brand-primary focus:ring-brand-primary/30 bg-gray-800 checked:bg-brand-primary"
                    />
                    <label htmlFor="isStudent" className="text-sm text-gray-300">
                      I am a student
                    </label>
                  </div>
                )}*/}

                {/* Submit Button (Kept existing styles) */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`
                    w-full py-3 px-4 rounded-xl
                    bg-brand-primary hover:bg-brand-primary/90
                    text-white font-medium text-base
                    transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                    shadow-lg hover:shadow-xl
                    mt-6
                  `}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white
                                     rounded-full animate-spin mr-2" />
                      Creating account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </motion.button>

                {/* Referral Code Display */}
                {formData.referralCode && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-sm text-green-400">
                      <span className="font-medium">Referral Code Applied:</span> {formData.referralCode}
                    </p>
                  </div>
                )}
              </form>
            </Card>

            {/* Sign In Link (Adjusted styles for dark theme) */}
            <p className="text-center text-sm text-gray-300 mt-6">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-medium text-brand-primary hover:text-brand-accent transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Modal for mobile (Adjusted styles for dark theme if visible) */}
      <Modal
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        centered
        className="rounded-2xl overflow-hidden dark-modal"
        style={{ padding: 0 }}
      >
        <div className="p-6 bg-gray-800 text-white">
          <h2 className="text-2xl font-bold text-brand-primary mb-4 text-center">
            Are you a student?
          </h2>
          <p className="text-gray-400 mb-8 text-center text-sm">
            Students get access to additional learning resources and mentorship opportunities
          </p>

          <div className="grid grid-cols-1 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                handleInputChange({ target: { name: 'isStudent', value: true } });
                handleModalClose();
              }}
              className={`p-4 rounded-xl border ${
                formData.isStudent
                  ? "border-brand-primary bg-brand-primary/20 text-brand-primary"
                  : "border-gray-700 bg-gray-800 text-gray-300 hover:border-brand-primary/20"
              } transition-all duration-200`}
            >
              <h3 className="text-lg font-semibold text-white mb-2">Yes, I'm a Student</h3>
              <p className="text-sm text-gray-400">Get access to TalentRise program and special resources</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                handleInputChange({ target: { name: 'isStudent', value: false } });
                handleModalClose();
              }}
              className={`p-4 rounded-xl border ${
                !formData.isStudent && formData.role === "Freelancer"
                  ? "border-brand-primary bg-brand-primary/20 text-brand-primary"
                  : "border-gray-700 bg-gray-800 text-gray-300 hover:border-brand-primary/20"
              } transition-all duration-200`}
            >
              <h3 className="text-lg font-semibold text-white mb-2">No, I'm a Professional</h3>
              <p className="text-sm text-gray-400">Continue as a regular freelancer</p>
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RegistrationForm;
