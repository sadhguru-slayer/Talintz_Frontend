import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import axios from 'axios';
import { verifyToken, refreshToken } from '../utils/auth';
import { FaShieldAlt, FaBolt, FaProjectDiagram } from 'react-icons/fa';
import bgImage from '/herobg.png';

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
  
  // 👉 Minimal feature data
  const features = [
    {
      icon: <FaShieldAlt className="w-6 h-6" />,
      title: 'Secure Workflow',
      description: 'Enterprise-grade encryption keeps your projects and files protected.'
    },
    {
      icon: <FaProjectDiagram className="w-6 h-6" />,
      title: 'Smart Project Hub',
      description: 'Organise tasks, files and chat in one intuitive workspace.'
    },
    {
      icon: <FaBolt className="w-6 h-6" />,
      title: 'AI Insights',
      description: 'Nova AI highlights risks and suggests optimisations in real time.'
    }
  ];

  return (
    <div className="relative min-h-screen bg-brand-dark overflow-hidden">
      {/* Hero Section with Background Image */}
      <div className="relative min-h-screen">
        {/* Background with wave pattern - ONLY for hero */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Dark base layer */}
          <div className="absolute inset-0 bg-brand-dark/90" />
        
          {/* Wave pattern from the image - ONLY in hero */}
          <div 
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          
          {/* Animated gradient overlay */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.5, 0.4] }}
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
                  rgba(109, 40, 217, 0.2) 0%,
                  rgba(37, 99, 235, 0.2) 100%
                )
              `
              }}
        />
        </div>

        {/* Navigation */}
        <nav className="relative z-20 px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              <Link to="/" className="text-2xl font-bold text-white">
                Talintz
              </Link>
              <div className="flex items-center gap-8">
                <div className="hidden md:flex items-center gap-8">
                  <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                  <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
                  <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLogin}
                    className="px-5 py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    Login
                  </button>
                  <motion.button
                    onClick={handleGetStarted}
                    whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                    className="px-5 py-2 bg-brand-purple text-white rounded-lg font-medium 
                      hover:bg-brand-purple-dark transition-colors"
                  >
                    Get Started
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <main className="relative z-10 px-6 min-h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="max-w-7xl mx-auto text-center">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
          <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-3 py-1 mb-8 rounded-full 
                  border border-brand-purple/30 bg-brand-purple/10"
              >
                <span className="w-2 h-2 rounded-full bg-brand-purple mr-2"></span>
                <span className="text-sm text-brand-purple-light">Launching Soon</span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-8">
                The <span className="bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
                  Smarter Way
                </span> to
                <br />Collaborate on Projects
              </h1>
              <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto">
                Connect with top talent, manage projects efficiently, and grow your business 
                with our AI-powered collaboration platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={handleGetStarted}
                  whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-gradient-to-r from-brand-purple to-brand-blue 
                    text-white rounded-lg font-medium shadow-lg shadow-brand-purple/25"
                >
                  Get Started Free
              </motion.button>
              <motion.button
                  whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 border border-brand-purple/30 text-white rounded-lg 
                    font-medium hover:bg-brand-purple/10 transition-all"
                >
                  Learn More
              </motion.button>
              </div>
            </motion.div>
          </div>
        </main>
            </div>
            
      {/* Rest of the sections with GitHub-inspired design */}
      <div className="relative bg-[#0A0A1A]">
        {/* Features Section - Inspired by GitHub's feature showcase */}
        <section className="relative z-10 py-24" id="features">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left side - Feature Description */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-6">
                  Streamline Your Project Management
                </h2>
                <p className="text-gray-400 text-lg mb-8">
                  Built for modern teams, our platform combines powerful project management tools with intuitive collaboration features.
                </p>
                <div className="space-y-6">
                  {features.map((feature) => (
                    <div key={feature.title} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <div className="text-[#6366F1]">{feature.icon}</div>
                    </div>
                      <div>
                        <h3 className="text-white font-medium mb-1">{feature.title}</h3>
                        <p className="text-gray-400">{feature.description}</p>
                  </div>
                    </div>
                  ))}
                </div>
              </motion.div>
                
              {/* Right side - Interactive Demo/Screenshot */}
          <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative rounded-xl overflow-hidden border border-white/10">
                  {/* Replace with your actual app screenshot or demo */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#0A0A1A] to-[#1A1A2E] p-6">
                    <div className="absolute inset-0 bg-grid-white/5"></div>
                    {/* Add your app demo/screenshot here */}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
          
        {/* How It Works - Modern Step-by-Step Guide */}
        <section className="relative z-10 py-24 bg-[#0D1117]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
                Get Started in Minutes
              </h2>
              <p className="text-gray-400 text-lg">
                Three simple steps to transform your project management
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Create Your Profile',
                  description: 'Sign up and build your professional profile in minutes',
                  icon: '👤'
                },
                {
                  step: '02',
                  title: 'Connect & Collaborate',
                  description: 'Find the perfect match for your project needs',
                  icon: '🤝'
                },
                {
                  step: '03',
                  title: 'Achieve Together',
                  description: 'Work efficiently and celebrate successful project completion',
                  icon: '🚀'
                }
              ].map((item, index) => (
          <motion.div 
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative bg-[#161B22] rounded-lg p-6 border border-white/10"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-2xl">{item.icon}</div>
                    <div className="text-sm font-medium text-[#00D4AA]">Step {item.step}</div>
        </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
            </motion.div>
            ))}
          </div>
          </div>
        </section>

        {/* Statistics Section - Clean and Professional */}
        <section className="relative z-10 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { number: '10K+', label: 'Active Users' },
                { number: '5K+', label: 'Projects Completed' },
                { number: '95%', label: 'Success Rate' },
                { number: '24/7', label: 'Support' }
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
            ))}
          </div>
        </div>
        </section>

        {/* Trust Section - Similar to GitHub's social proof */}
        <section className="relative z-10 py-24 bg-[#0D1117]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-semibold text-white mb-8">
                Trusted by leading companies worldwide
            </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-75">
                {/* Replace with actual company logos */}
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-white/5 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Clean and Impactful */}
        <section className="relative z-10 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-[#161B22] rounded-2xl p-12 relative overflow-hidden">
              <div className="relative z-10 max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-semibold text-white mb-6">
                  Ready to transform your project workflow?
                </h2>
                <p className="text-gray-400 text-lg mb-8">
                  Join thousands of teams already using our platform to accelerate their projects.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
              onClick={handleGetStarted}
                    whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                    className="px-8 py-3 bg-[#6366F1] text-white rounded-lg font-medium"
                >
                    Get started free
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                    className="px-8 py-3 border border-white/10 text-white rounded-lg font-medium
                      hover:bg-white/5"
                >
                    Contact sales
                </motion.button>
                </div>
                    </div>
                  </div>
                    </div>
        </section>
                  
        {/* Footer - Clean and Organized */}
        <footer className="relative z-10 border-t border-white/10 bg-[#0D1117] py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12">
                    <div>
                <h3 className="text-white font-semibold mb-4">Product</h3>
                <div className="space-y-3">
                  <a href="#" className="block text-gray-400 hover:text-white">Features</a>
                  <a href="#" className="block text-gray-400 hover:text-white">Security</a>
                  <a href="#" className="block text-gray-400 hover:text-white">Team</a>
                  <a href="#" className="block text-gray-400 hover:text-white">Enterprise</a>
                </div>
              </div>
              {/* Add more footer columns as needed */}
            </div>
            <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-gray-400">
                © 2024 Talintz. All rights reserved.
          </div>
              <div className="flex gap-6">
                <a href="#" className="text-gray-400 hover:text-white">Terms</a>
                <a href="#" className="text-gray-400 hover:text-white">Privacy</a>
                <a href="#" className="text-gray-400 hover:text-white">Status</a>
              </div>
          </div>
          </div>
        </footer>
        </div>
    </div>
  );
};

export default HomePage;
