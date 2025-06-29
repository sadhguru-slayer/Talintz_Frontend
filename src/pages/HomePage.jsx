import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import axios from 'axios';
import { verifyToken, refreshToken } from '../utils/auth';
import { FaShieldAlt, FaBolt, FaProjectDiagram, FaChartLine, FaUsers, FaClock, FaCode, FaGithub, FaSlack, FaTrello, FaJira, FaBuilding, FaGlobe, FaFigma, FaAws } from 'react-icons/fa';
import bgImage from '/herobg.png';
import CustomCursor from '../components/ui/CustomCursor';

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Keep the authentication logic intact
  useEffect(() => {
    const checkTokens = async () => {
      try {
        const token = Cookies.get('accessToken');
        const rToken = Cookies.get('refreshToken');

        if (!token || !rToken) {
          setLoading(false);
          return;
        }

        const isTokenValid = await verifyToken(token);

        if (!isTokenValid) {
          const newToken = await refreshToken(rToken);
          if (newToken) {
            Cookies.set('accessToken', newToken);
          } else {
            throw new Error('Token refresh failed');
          }
        }

        const response = await axios.get('https://talintzbackend-production.up.railway.app/api/profile/', {
          headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` },
        });

        const { is_profiled, role } = response.data.user;

        if (role === 'client') {
          navigate('/client/homepage');
        } else {
          navigate('/freelancer/homepage');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    checkTokens();
  }, [navigate]);

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };
  
  // Enhanced features data
  const features = [
    {
      icon: <FaShieldAlt className="w-6 h-6" />,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption and compliance with ISO 27001, SOC 2 Type II, and GDPR standards.'
    },
    {
      icon: <FaProjectDiagram className="w-6 h-6" />,
      title: 'Smart Project Hub',
      description: 'Centralized workspace with real-time collaboration, file sharing, and task management.'
    },
    
    {
      icon: <FaChartLine className="w-6 h-6" />,
      title: 'Advanced Analytics',
      description: 'Comprehensive reporting and analytics to track project progress and team performance.'
    }
  ];

  const integrations = [
  { 
    icon: <FaGithub className="w-8 h-8 text-[#6366F1]" />, 
    name: 'GitHub',
    description: 'Version control & code collaboration',
    bgColor: 'bg-[#6366F1]/10',
    borderColor: 'hover:border-[#6366F1]',
    iconColor: 'text-[#6366F1]'
  },
  { 
    icon: <FaFigma className="w-8 h-8 text-[#00D4AA]" />,
    name: 'Figma',
    description: 'Design & prototyping integration',
    bgColor: 'bg-[#00D4AA]/10',
    borderColor: 'hover:border-[#00D4AA]',
    iconColor: 'text-[#00D4AA]'
  },
  { 
    icon: <FaJira className="w-8 h-8 text-[#6366F1]" />, 
    name: 'Jira',
    description: 'Project tracking & management',
    bgColor: 'bg-[#6366F1]/10',
    borderColor: 'hover:border-[#6366F1]',
    iconColor: 'text-[#6366F1]'
  },
  { 
    icon: <FaAws className="w-8 h-8 text-[#00D4AA]" />,
    name: 'AWS',
    description: 'Cloud deployment & scaling',
    bgColor: 'bg-[#00D4AA]/10',
    borderColor: 'hover:border-[#00D4AA]',
    iconColor: 'text-[#00D4AA]'
  }
];

  // Testimonials data
  const testimonials = [
    {
      quote: "Talintz has transformed how we manage our remote teams. The AI insights are game-changing.",
      author: "Sarah Chen",
      role: "CTO at TechFlow",
      image: "https://randomuser.me/api/portraits/women/1.jpg"
    },
    {
      quote: "The most comprehensive project management solution we've used. Worth every penny.",
      author: "Michael Rodriguez",
      role: "Project Lead at InnovateCorp",
      image: "https://randomuser.me/api/portraits/men/2.jpg"
    }
  ];

  // Enhanced parallax effect with spring physics
  const { scrollY } = useScroll();
  
  // Create smooth spring-based transforms
  const springConfig = { stiffness: 100, damping: 30, mass: 0.2 };
  
  // Background parallax with spring physics
  const bgYSpring = useSpring(
    useTransform(scrollY, [0, 1000], ['0%', '15%']),
    springConfig
  );
  
  // Text parallax with different spring config for layered effect
  const textYSpring = useSpring(
    useTransform(scrollY, [0, 1000], [1,0.8]),
    { ...springConfig, stiffness: 120 }
  );

  // Opacity parallax for fade effect
  const opacitySpring = useSpring(
    useTransform(scrollY, [0, 400], [1, 0.2]),
    { ...springConfig, stiffness: 80 }
  );

  return (
    <div className="relative min-h-screen bg-brand-dark cursor-none">
      <CustomCursor />
      {/* Hero Section with Enhanced Parallax */}
      <div className="relative min-h-screen !overflow-hidden">
        {/* Background with enhanced parallax */}
        <motion.div 
          className="absolute inset-0"
          style={{ 
            y: bgYSpring,
            scale: useSpring(useTransform(scrollY, [0, 1000], [1, 1.05]), springConfig)
          }}
        >
          {/* Dark base layer */}
          <div className="absolute inset-0" />
        
          {/* Wave pattern from the image with enhanced mask */}
          <motion.div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: opacitySpring,
              maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
            }}
          />
          
          {/* Enhanced gradient overlay */}
          <motion.div 
            className="absolute inset-0"
            style={{ 
              background: `
                linear-gradient(
                  to bottom,
                  rgba(10, 10, 26, 0) 0%,
                  rgba(10, 10, 26, 0.2) 50%,
                  rgba(10, 10, 26, 0.8) 85%,
                  rgba(10, 10, 26, 1) 100%
                )
              `,
              opacity: opacitySpring
            }}
          />
        </motion.div>

        {/* Navigation */}
        <nav className="relative z-20 px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              <Link 
                to="/" 
                className="flex items-center gap-3 group"
              >
                <img 
                  src="/logo.jpg" 
                  alt="Talintz Logo" 
                  className="w-8 h-8 rounded-full object-cover border border-white/10"
                />
                <span className="text-2xl font-bold relative">
                  <span className="bg-gradient-to-r from-[#6366F1] to-[#00D4AA] bg-clip-text text-transparent">
                    Talintz
                  </span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#00D4AA] 
                    group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>
              
              <div className="flex items-center gap-6">
                <motion.button
                  onClick={handleLogin}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 text-white relative group overflow-hidden"
                >
                  <span className="relative z-10">Login</span>
                  <span className="absolute inset-0 w-0 bg-gradient-to-r from-[#6366F1]/10 to-[#00D4AA]/10 
                    group-hover:w-full transition-all duration-300"></span>
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#6366F1] to-[#00D4AA] 
                    group-hover:w-full transition-all duration-300"></span>
                </motion.button>

                <motion.button
                  onClick={handleGetStarted}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#6366F1] to-[#00D4AA] 
                    text-white rounded-lg font-medium relative overflow-hidden group
                    cursor-none hover:cursor-none"
                >
                  <span className="relative z-10">Get Started</span>
                  <motion.span
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                  />
                </motion.button>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Hero Content with enhanced parallax */}
        <motion.main 
          className="relative z-10 px-6 min-h-[calc(100vh-80px)] flex items-center justify-center"
          style={{ 
            y: textYSpring,
            scale: useSpring(useTransform(scrollY, [0, 1000], [1, 1.02]), springConfig)
          }}
        >
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{scale:textYSpring}}
              className="max-w-4xl mx-auto"
            >
          <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-3 py-1 mb-8 rounded-full 
                  border border-[#6366F1]/30 bg-[#6366F1]/10"
            >
                <span className="w-2 h-2 rounded-full bg-[#6366F1] mr-2"></span>
                <span className="text-sm text-[#6366F1]">Launching Soon</span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-8">
                The <span className="bg-gradient-to-r from-[#6366F1] to-[#00D4AA] bg-clip-text text-transparent">
                  Smarter Way
                </span> to
                <br />Collaborate on Projects
              </h1>
              <p className="text-xl text-white mb-12 leading-relaxed max-w-2xl mx-auto">
                Connect with top talent, manage projects efficiently, and grow your business 
                with our AI-powered collaboration platform.
              </p>
              
              <motion.button
                onClick={handleGetStarted}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-gradient-to-r from-[#6366F1] to-[#00D4AA] 
                  text-white rounded-lg font-medium shadow-lg shadow-[#6366F1]/25"
              >
                Get Started Free
              </motion.button>
            </motion.div>
          </div>
        </motion.main>
      </div>

      {/* Rest of the sections */}
      <div className="relative z-20 bg-brand-dark">
        {/* Enhanced Features Section */}
        <section className="relative z-10 py-24" id="features">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left side - Feature Description */}
              <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="space-y-8"
                >
                  <div className="inline-flex items-center px-3 py-1 rounded-full 
                    border border-[#6366F1]/30 bg-[#6366F1]/10">
                    <span className="w-2 h-2 rounded-full bg-[#6366F1] mr-2"></span>
                    <span className="text-sm text-[#6366F1]">Enterprise Ready</span>
              </div>
              
                  <h2 className="text-3xl sm:text-4xl font-semibold text-white">
                    Streamline Your Project
                    <span className="bg-gradient-to-r from-[#6366F1] to-[#00D4AA] 
                      bg-clip-text text-transparent"> Management</span>
                  </h2>
                  
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Built for modern teams, our platform combines powerful project management tools 
                    with intuitive collaboration features and AI-driven insights.
                  </p>

                  <div className="space-y-6">
                    {features.map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-4 p-4 rounded-xl 
                          bg-white/5 border border-white/10 hover:border-[#6366F1]/30 
                          transition-all duration-300"
                      >
                        <div className="w-12 h-12 rounded-lg bg-[#6366F1]/10 
                          flex items-center justify-center flex-shrink-0">
                          <div className="text-[#6366F1]">{feature.icon}</div>
                      </div>
                        <div>
                          <h3 className="text-white font-medium text-lg mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-gray-400 leading-relaxed">
                            {feature.description}
                          </p>
                    </div>
                      </motion.div>
                    ))}
                      </div>
              </motion.div>

              {/* Right side - Interactive Demo */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative rounded-xl overflow-hidden border border-white/10">
                  {/* Dashboard Preview */}
                  <div className="aspect-[4/3] bg-[#161B22] p-6 relative">
                    {/* Browser-like top bar */}
                    <div className="absolute top-0 left-0 right-0 h-8 bg-[#0D1117] 
                      flex items-center px-4 border-b border-white/10">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  
                    {/* Dashboard Content */}
                    <div className="mt-8 grid grid-cols-2 gap-4">
                      {/* Project Stats Card */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-[#1F2937] p-4 rounded-lg border border-white/10"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-white font-medium">Project Stats</h4>
                          <FaChartLine className="text-[#00D4AA]" />
                      </div>
                      <div className="space-y-2">
                          <div className="h-2 bg-[#00D4AA]/20 rounded-full">
                            <div className="h-full w-3/4 bg-[#00D4AA] rounded-full"></div>
                      </div>
                          <div className="h-2 bg-[#6366F1]/20 rounded-full">
                            <div className="h-full w-1/2 bg-[#6366F1] rounded-full"></div>
                    </div>
                  </div>
                      </motion.div>
                  
                      {/* Team Activity Card */}
            <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="bg-[#1F2937] p-4 rounded-lg border border-white/10"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-white font-medium">Team Activity</h4>
                          <FaUsers className="text-[#6366F1]" />
                      </div>
                        <div className="flex -space-x-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full bg-gradient-to-r 
                                from-[#6366F1] to-[#00D4AA] border-2 border-[#1F2937]"
                            ></div>
                          ))}
                    </div>
                  </motion.div>
                  
                      {/* Timeline Card */}
                <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="col-span-2 bg-[#1F2937] p-4 rounded-lg border border-white/10"
                    >
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-white font-medium">Project Timeline</h4>
                            <FaClock className="text-[#6366F1]" />
                      </div>
                          <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#00D4AA]"></div>
                                <div className="flex-1 h-1 bg-[#00D4AA]/20 rounded-full">
                                  <div className={`h-full w-${i * 2}/6 bg-[#00D4AA] rounded-full`}></div>
                </div>
                </div>
                          ))}
                    </div>
                      </motion.div>
                </div>
                
                    {/* Floating Elements */}
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
              }}
                      className="absolute -top-4 -right-4 w-24 h-24 bg-[#6366F1]/20 
                        rounded-full blur-xl"
                    />
            <motion.div 
                      animate={{
                        y: [0, 10, 0],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                  }}
                      className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#00D4AA]/20 
                        rounded-full blur-xl"
                    />
                  </div>
                    </div>
                
                
              </motion.div>
          </div>
          </div>
        </section>

        {/* How It Works - Minimal & Professional Design */}
        <section className="relative z-10 py-24 bg-[#0D1117]">
          <div className="max-w-7xl mx-auto px-6">
            {/* Section Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full 
                border border-[#00D4AA]/30 bg-[#00D4AA]/5 mb-6">
                <span className="text-sm text-[#00D4AA]">Simple Process</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
                Get Started in{" "}
                <span className="bg-gradient-to-r from-[#6366F1] to-[#00D4AA] bg-clip-text text-transparent">
                  Minutes
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Our streamlined onboarding process gets you from signup to success in three simple steps
              </p>
            </motion.div>

            {/* Steps Container */}
            <div className="relative">
              {/* Connecting Line */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-[#6366F1]/20 via-[#00D4AA]/20 to-[#6366F1]/20 
                transform -translate-y-1/2 hidden md:block"></div>

              <div className="grid md:grid-cols-3 gap-12 relative">
                {[
                  {
                    step: '01',
                    title: 'Create Account',
                    description: 'Quick signup with email or social login. No credit card required.',
                    icon: (
                      <div className="w-12 h-12 rounded-xl bg-[#6366F1]/10 flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#6366F1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )
                  },
                  {
                    step: '02',
                    title: 'Build Profile',
                    description: 'Customize your workspace and set preferences for optimal workflow.',
                    icon: (
                      <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#00D4AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                    )
                  },
                  {
                    step: '03',
                    title: 'Start Working',
                    description: 'Connect with clients or freelancers and begin collaborating instantly.',
                    icon: (
                      <div className="w-12 h-12 rounded-xl bg-[#6366F1]/10 flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#6366F1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    )
                  }
                ].map((item, index) => (
                <motion.div 
                    key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                    className="relative"
                  >
                    {/* Step Card */}
                    <div className="bg-[#161B22] rounded-xl p-6 border border-white/10 
                      hover:border-[#6366F1]/30 transition-all duration-300
                      group hover:bg-[#161B22]/80">
                      {/* Step Number */}
                      <div className="flex items-center gap-4 mb-6">
                        {item.icon}
                        <span className="text-sm font-medium text-gray-400 group-hover:text-[#6366F1] transition-colors">
                          Step {item.step}
                        </span>
                      </div>

                      {/* Content */}
                      <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-[#6366F1] transition-colors">
                        {item.title}
                    </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {item.description}
                    </p>

                      {/* Hover Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#6366F1]/5 to-[#00D4AA]/5 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                </div>

                    {/* Connection Dots for Desktop */}
                    <div className="hidden md:block absolute top-1/2 -translate-y-1/2 
                      w-3 h-3 rounded-full bg-[#6366F1] 
                      left-[calc(50%-6px)] z-10"></div>
              </motion.div>
                ))}
              </div>
            </div>
            
            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 text-center"
            >
                <motion.button
                onClick={handleGetStarted}
                whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-gradient-to-r from-[#6366F1] to-[#00D4AA] 
                  text-white rounded-lg font-medium shadow-lg hover:shadow-xl
                  transition-all duration-300"
                >
                Start Your Journey
                </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Statistics Section - Clean and Professional */}
        <section className="relative z-10 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-semibold text-white mb-6">
                Building the Future of <span className="bg-gradient-to-r from-[#6366F1] to-[#00D4AA] bg-clip-text text-transparent">Tech Collaboration</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                We're just getting started on our mission to revolutionize how tech and creative teams work together. Join us in shaping the future of project collaboration.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {integrations.map((tool) => (
                  <motion.div
                    key={tool.name}
                    whileHover={{ scale: 1.05 }}
                    className="bg-[#161B22] p-6 rounded-xl border border-white/10 hover:border-[#6366F1]/30 transition-all"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-4">
                        {tool.icon}
                      </div>
                      <h3 className="text-white font-medium mb-2">{tool.name}</h3>
                      <p className="text-gray-400 text-sm">{tool.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <span className="text-gray-400 text-sm">
                  More integrations coming soon...
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section - Premium Design */}
        <section className="relative z-10 py-32 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[#0A0A1A]"></div>
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.1, 0.15, 0.1]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-1/2 left-1/2 w-[200%] h-[200%] bg-gradient-radial from-[#6366F1]/10 to-transparent"
              style={{
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-6">
            <div className="relative bg-[#161B22]/80 backdrop-blur-lg rounded-3xl border border-white/10 overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#6366F1]/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#00D4AA]/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 py-20 px-8 sm:px-16 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="inline-flex items-center px-4 py-2 rounded-full border border-[#6366F1]/30 bg-[#6366F1]/10 mb-6">
                    <span className="w-2 h-2 rounded-full bg-[#6366F1] mr-2"></span>
                    <span className="text-sm text-[#6366F1]">Get Started Today</span>
                  </div>

                  <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                    Ready to <span className="bg-gradient-to-r from-[#6366F1] to-[#00D4AA] bg-clip-text text-transparent">transform</span> your workflow?
                </h2>
                
                <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
                  Join thousands of teams who have already revolutionized their project management with our platform.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
              onClick={handleGetStarted}
              whileHover={{ 
                    scale: 1.03,
                      boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
              }}
                  whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-gradient-to-r from-[#6366F1] to-[#00D4AA] 
                      text-white rounded-xl font-semibold text-lg shadow-lg
                      transition-all duration-300 relative overflow-hidden"
                >
                    <span className="relative z-10">Start Free Trial</span>
                    <motion.span
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 bg-gradient-to-r from-[#6366F1]/20 to-[#00D4AA]/20"
                    />
                </motion.button>
                
                <motion.button
                    whileHover={{ 
                      scale: 1.03,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)'
                    }}
                  whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 border border-white/10 text-white rounded-xl 
                      font-semibold text-lg hover:border-[#6366F1]/30 transition-all"
                >
                    Schedule Demo
                </motion.button>
              </div>

                <div className="mt-8 text-gray-400 text-sm">
                  No credit card required • 14-day free trial • Cancel anytime
                  </div>
                </motion.div>
                  </div>
                    </div>
                  </div>
        </section>

        {/* Modern Minimal Footer */}
        <footer className="relative z-10 border-t border-white/10 bg-[#0D1117] py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center">
              {/* Logo and Tagline */}
              <div className="flex flex-col items-center mb-12">
                <Link to="/" className="text-2xl font-bold text-white mb-4">
                  Talintz
                </Link>
                <p className="text-gray-400 text-center max-w-md">
                  The smarter way to collaborate on projects
                </p>
              </div>

              {/* Social Links - Minimal and Clean */}
              <div className="flex items-center justify-center gap-6 mb-12">
                {[
                  { 
                    name: "LinkedIn", 
                    icon: (
                      <svg className="w-5 h-5 text-gray-400 hover:text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    ),
                    url: "https://www.linkedin.com/in/talintz-offical-102147364/"
                  },
                  { 
                    name: "Instagram", 
                    icon: (
                      <svg className="w-5 h-5 text-gray-400 hover:text-[#E4405F]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    ),
                    url: "https://www.instagram.com/talintz"
                  },
                  { 
                    name: "Email", 
                    icon: (
                      <svg className="w-5 h-5 text-gray-400 hover:text-[#00D4AA]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z" />
                      </svg>
                    ),
                    url: "mailto:info@talintz.com"
                  }
                ].map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -2 }}
                    className="p-2 rounded-full hover:bg-white/5 transition-colors"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>

              {/* Minimal Copyright and Legal */}
              <div className="flex flex-col items-center gap-4 text-gray-400 text-sm">
                <div>© {new Date().getFullYear} Talintz. All rights reserved.</div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
