import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';

import FHeader from '../../../components/freelancer/FHeader';
import FSider from '../../../components/freelancer/FSider';
import ErrorBoundary from '../../../components/ErrorBoundary';
import LoadingComponent from '../../../components/LoadingComponent';

import ListOfObsps from './ListOfObsps';
import ObspDetails from './ObspDetails';

const OBSPLayout = ({ userId, role, isAuthenticated, isEditable }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const [state, setState] = useState({
    activeComponent: 'list',
    loading: true,
    individualLoading: false,
    error: null
  });

  useEffect(() => {
    // Determine active component based on current path
    const path = location.pathname;
    let activeComponent = 'list';
    
    if (path.includes('/details/')) {
      activeComponent = 'details';
    } else if (path.includes('/list')) {
      activeComponent = 'list';
    }
    
    setState(prev => ({
      ...prev,
      activeComponent,
      loading: false
    }));
  }, [location.pathname]);

  const handleMenuClick = async (component) => {
    try {
      setState(prev => ({ ...prev, individualLoading: true }));
      
      if (component === 'list') {
        navigate('/freelancer/obsp/list');
      } else if (component === 'details') {
        // This would typically navigate to a specific OBSP details page
        navigate('/freelancer/obsp/list');
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setState(prev => ({ 
        ...prev, 
        activeComponent: component,
        individualLoading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error.message, 
        individualLoading: false 
      }));
      toast.error('Failed to switch components. Please try again.');
    }
  };

  return (
    <motion.div 
      className="flex h-screen !bg-freelancer-primary"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <FSider 
        userId={userId}
        role={role}
        isAuthenticated={isAuthenticated}
        isEditable={isEditable}
        dropdown={true} 
        collapsed={true}
        handleMenuClick={handleMenuClick}
        abcds={state.activeComponent}
      />
      
      <div className={`flex-1 flex flex-col ${isMobile ? 'ml-0' : 'ml-16'}`}>
        <div className="sticky top-0 z-10 w-full">
          <FHeader 
            userId={userId}
            role={role}
            isAuthenticated={isAuthenticated}
            isEditable={isEditable}
          />
        </div>
        
        <div className="flex-1 min-h-screen  overflow-y-auto bg-freelancer-primary">
          
            <ErrorBoundary>
              <Suspense fallback={<LoadingComponent variant="dashboard" role="freelancer" className="bg-violet-200 animate-pulse" />}>
                <Routes>
                  <Route index element={<ListOfObsps />} />
                  <Route path="list" element={<ListOfObsps />} />
                  <Route path="details/:id" element={<ObspDetails />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          
        </div>
      </div>

      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </motion.div>
  );
};

export default OBSPLayout; 