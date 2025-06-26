import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';

import CHeader from '../../../components/client/CHeader';
import CSider from '../../../components/client/CSider';
import LoadingSpinner from '../../../components/LoadingComponent';

const ObspPurchaseList = React.lazy(() => import('./ObspPurchaseList'));
const ObspDetails = React.lazy(() => import('./ObspDetails'));

const OBSPLayout = ({ userId, role }) => {
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const mobileQuery = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    setIsMobile(mobileQuery);
    if (mobileQuery) {
      setSidebarCollapsed(true);
    }
  }, [mobileQuery]);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-client-primary via-client-secondary/10 to-client-bg-dark overflow-hidden">
      {/* Sidebar */}
      <CSider 
        userId={userId} 
        role={role} 
        collapsed={true}
        onToggle={handleSidebarToggle}
        currentPath={location.pathname}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col   ${
          isMobile ? 'ml-0' :'ml-16' 
        }`}>
        {/* Header */}
        <CHeader 
          userId={userId} 
          sidebarCollapsed={sidebarCollapsed}
          onSidebarToggle={handleSidebarToggle}
          currentPath={location.pathname}
        />

        {/* Page Content */}
        <div className={`flex-1 overflow-auto transition-all duration-300 `}>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route 
                path="/" 
                element={<ObspPurchaseList />} 
              />
              <Route 
                path="/list" 
                element={<ObspPurchaseList />} 
              />
              <Route 
                path="/details/:id" 
                element={<ObspDetails />} 
              />
            </Routes>
          </Suspense>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default OBSPLayout; 