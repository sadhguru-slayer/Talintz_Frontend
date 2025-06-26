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
    <div className="min-h-screen  bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white">
      {/* Navigation - Made more visible on mobile */}
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

        {/* Left Panel - Branding (Updated styles for dark theme) */}
        <div className="lg:hidden w-full bg-gradient-to-b from-gray-800 to-gray-900 
                        py-12 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/path/to/pattern.svg')] opacity-10"></div>
          <div className="relative z-10">
            <LogoCode width="60" height="60" className="mx-auto mb-6 text-white" />
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/90 text-sm max-w-xs mx-auto">
              Your gateway to professional opportunities
            </p>
          </div>
        </div>

        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-primary to-brand-accent 
                        items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/path/to/pattern.svg')] opacity-10"></div>
          <div className="relative z-10 max-w-lg text-white space-y-8">
            <LogoCode width="80" height="80" className="mb-8 text-white" />
            <h1 className="text-5xl font-bold leading-tight">
              Welcome Back to Talintz
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Connect with top talent and opportunities in one professional platform.
              Your next big opportunity awaits.
            </p>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 lg:p-12 relative z-10">
          <div className="w-full max-w-md">
            <Card className="shadow-xl border border-white/10 overflow-hidden rounded-xl bg-white/5 backdrop-blur-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white">Sign In</h2>
                  <p className="text-sm text-gray-300 mt-2">
                    Access your Talintz account
                  </p>
                </div>

                {errors.api && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-700/30 border-l-4 border-red-400 p-4 rounded-lg text-red-300"
                  >
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-red-300">{errors.api}</p>
                      {alternativeIdentifier && (
                        <div className="flex items-center gap-2 mt-1">
                          {alternativeIdentifier.type === 'register' ? (
                            <button
                              type="button"
                              onClick={() => navigate('/register')}
                              className="text-sm font-medium text-brand-primary hover:text-brand-accent transition-colors"
                            >
                              Create an account
                            </button>
                          ) : (
                            <p className="text-sm text-gray-400">
                              {alternativeIdentifier.message}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Identifier Input */}
                <div className="space-y-1">
                  <label htmlFor="identifier" className="block text-sm font-medium text-gray-300">
                    Email or Username
                  </label>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    autoComplete="email"
                    className={`
                      w-full px-4 py-3 rounded-xl
                      border ${errors.identifier ? 'border-red-300' : 'border-gray-700'}
                      focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary
                      text-white bg-gray-800
                      transition-all duration-200
                      placeholder-gray-500
                    `}
                    placeholder="Enter your email or username"
                    value={formData.identifier}
                    onChange={(e) => {
                      handleInputChange(e);
                      setAlternativeIdentifier(null);
                    }}
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
                <div className="space-y-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className={`
                        w-full px-4 py-3 rounded-xl
                        border ${errors.password ? 'border-red-300' : 'border-gray-700'}
                        focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary
                        text-white bg-gray-800
                        transition-all duration-200
                        placeholder-gray-500
                      `}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 
                                hover:text-gray-300 focus:outline-none"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-red-400 mt-1"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </div>

                {/* Utilities */}
                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-600 text-brand-primary 
                               focus:ring-brand-primary/30 bg-gray-800 checked:bg-brand-primary"
                    />
                    <span className="ml-2 text-sm text-gray-300">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-sm font-medium text-brand-primary hover:text-brand-accent 
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
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </motion.button>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-800 text-gray-400">or</span>
                  </div>
                </div>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-gray-300">
                  New to Talintz?{" "}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="font-medium text-brand-primary hover:text-brand-accent 
                             transition-colors"
                  >
                    Create an account
                  </button>
                </p>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
