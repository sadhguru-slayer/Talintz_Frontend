import React, { useState, useEffect } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import LoadingComponent from '../components/LoadingComponent';
import { verifyToken } from '../utils/auth';
import Cookies from 'js-cookie';
import { FiEye, FiEyeOff } from "react-icons/fi";
import { authAPI } from '../config/axios';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Card } from 'antd';
import LogoCode from '../logoCode';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState({ username: false, password: false });
  const [formTouched, setFormTouched] = useState(false);
  const [alternativeIdentifier, setAlternativeIdentifier] = useState(null);

  // Single authentication check on component mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const accessToken = Cookies.get('accessToken');
        const refreshToken = Cookies.get('refreshToken');
        const role = Cookies.get('role');

        // If no tokens, allow login
        if (!accessToken || !refreshToken) {
          setLoading(false);
          return;
        }

        // Clear out any stale session data from local storage
        localStorage.clear();
        sessionStorage.clear();

        // Verify token and redirect if valid
        const isValid = await verifyToken(accessToken);
        if (isValid) {
          // Get return URL from location state or default based on role
          const returnUrl = location.state?.from || (role === 'client' ? '/client/homepage' : '/freelancer/homepage');
          navigate(returnUrl, { replace: true });
          return;
        }

        // If token invalid, clear cookies and allow login
        Cookies.remove('accessToken', { path: '/' });
        Cookies.remove('refreshToken', { path: '/' });
        Cookies.remove('role', { path: '/' });
        Cookies.remove('userId', { path: '/' });
        Cookies.remove('is_talentrise', { path: '/' });
        
        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        
        // Clear cookies on error
        Cookies.remove('accessToken', { path: '/' });
        Cookies.remove('refreshToken', { path: '/' });
        Cookies.remove('role', { path: '/' });
        Cookies.remove('userId', { path: '/' });
        Cookies.remove('is_talentrise', { path: '/' });
        
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, location]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setFormTouched(true);
    
    // Update typing state for animation
    if (name === 'username' || name === 'password') {
      setIsTyping(prev => ({
        ...prev,
        [name]: true
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.identifier.trim()) {
      newErrors.identifier = "Email or username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (formTouched) {
      validateForm();
    }
  }, [formData, formTouched]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Clear any stale data
      localStorage.clear();
      sessionStorage.clear();
      
      const response = await authAPI.login({
        identifier: formData.identifier,
        password: formData.password,
        remember_me: formData.rememberMe
      });

      // Handle successful login
      const { access, refresh, role, is_talentrise } = response.data;

      const cookieOptions = {
        secure: true,
        sameSite: 'Strict',
        path: '/',
        expires: formData.rememberMe ? 7 : undefined
      };

      Cookies.set("accessToken", access, cookieOptions);
      Cookies.set("refreshToken", refresh, cookieOptions);
      Cookies.set("role", role, cookieOptions);

      if (is_talentrise) {
        Cookies.set("is_talentrise", "true", cookieOptions);
      }

      // Redirect based on role with replace=true to prevent back navigation
      const redirectPath = role === 'client' ? '/client/homepage' : '/freelancer/homepage';
      navigate(redirectPath, { replace: true });

    } catch (error) {
      setLoading(false);
      const errorData = error.response?.data;
      
      if (errorData?.suggestion) {
        switch (errorData.suggestion) {
          case 'email':
            // User exists but used username, suggest using email
            setAlternativeIdentifier({
              type: 'email',
              message: 'Try logging in with your email instead'
            });
            break;
          case 'username':
            // User exists but used email, suggest using username
            setAlternativeIdentifier({
              type: 'username',
              message: 'Try logging in with your username instead'
            });
            break;
          case 'register':
            // User doesn't exist, suggest registration
            setAlternativeIdentifier({
              type: 'register',
              message: 'No account found. Would you like to create one?'
            });
            break;
          default:
            setAlternativeIdentifier(null);
        }
      }

      setErrors({
        api: errorData?.error || "Login failed. Please try again."
      });
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
          
          {/* Wave pattern from the image - similar to homepage */}
          <div className="absolute inset-0 opacity-70">
            <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/10 to-[#00D4AA]/10" />
          </div>
          
          {/* Animated gradient overlay */}
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
                Welcome Back to{" "}
                <span className="bg-gradient-to-r from-[#00D4AA] to-[#6366F1] bg-clip-text text-transparent">
                  Talintz
                </span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Connect with top talent and opportunities in one professional platform.
                Your next big opportunity awaits.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 lg:p-16 relative z-10 mt-16 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <Card className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
                  <p className="text-gray-400">
                    Access your Talintz account
                  </p>
                </div>

                {/* Error Message */}
                {errors.api && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl"
                  >
                    <p className="text-red-400 text-sm">{errors.api}</p>
                    {alternativeIdentifier && (
                      <p className="text-sm text-gray-400 mt-1">
                        {alternativeIdentifier.message}
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Identifier Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Email or Username
                  </label>
                  <input
                    name="identifier"
                    type="text"
                    value={formData.identifier}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10
                      focus:border-[#6366F1] focus:ring-[#6366F1]/20 focus:ring-2
                      text-white placeholder-gray-500 transition-all duration-200"
                    placeholder="Enter your email or username"
                  />
                  {errors.identifier && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-red-400 mt-1"
                    >
                      {errors.identifier}
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
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10
                        focus:border-[#6366F1] focus:ring-[#6366F1]/20 focus:ring-2
                        text-white placeholder-gray-500 transition-all duration-200"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 
                        hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p className="text-xs text-red-400 mt-1">
                      {errors.password}
                    </motion.p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border-white/10 bg-white/5 
                        checked:bg-[#6366F1] checked:border-[#6366F1] 
                        focus:ring-[#6366F1]/20 transition-all duration-200"
                    />
                    <span className="ml-2 text-sm text-gray-300">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-sm font-medium text-[#6366F1] hover:text-[#00D4AA] 
                      transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#00D4AA]
                    text-white font-medium shadow-lg hover:shadow-[#6366F1]/25
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-300 mt-6"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white 
                        rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </motion.button>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#0A0A1A] text-gray-400">or</span>
                  </div>
                </div>

                {/* Sign Up Link */}
                <p className="text-center text-gray-300">
                  New to Talintz?{" "}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="font-medium text-[#6366F1] hover:text-[#00D4AA] 
                      transition-colors"
                  >
                    Create an account
                  </button>
                </p>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
