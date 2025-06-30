import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import CHeader from "../../components/client/CHeader";
import CSider from "../../components/client/CSider";
import IndividualLoadingComponent from "../../components/IndividualLoadingComponent";
import Cookies from "js-cookie";
import axios from "axios";
import api,{getBaseURL} from '../../config/axios';

import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { verifyToken, refreshToken as refreshTokenFunction } from '../../utils/auth';
import NotAuthProfile from './profile/NotAuthProfile';
import OtherProfile from "./profile/OtherProfile";
import FreelancerOtherProfile from '../freelancer/profile/OtherProfile'; // import if not already
import ReferralTab from "../../components/ReferralTab";

const CProfile = ({ userId, role, isAuthenticated, isEditable }) => {

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  userId = parseInt(userId);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const [individualLoading, setIndividualLoading] = useState(false);
  const [activeProfileComponent, setActiveProfileComponent] = useState("");
  const [activeComponent, setActiveComponent] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [otherProfileRole, setOtherProfileRole] = useState(null);
  // Extract the current profile section from the URL
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    const validSections = ["view_profile", "edit_profile", "reviews_ratings", "collaborations"];
    if (validSections.includes(lastPart)) {
      setActiveProfileComponent(lastPart);
    } else {
      setActiveProfileComponent("view_profile");
    }

  }, [location.pathname]);
  useEffect(() => {
    const fetchCurrentUser = async () => {  // Add async here
      try {
        const profileResponse = await api.get(`${getBaseURL()}/api/profile/`, {
          headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` },
        });
        setCurrentUserId(profileResponse.data.user.id)
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
  
    fetchCurrentUser();
  },  [currentUserId, userId,]);
  
  useEffect(() => {
    if (userId) {
      const fetchAndCheckRole = async () => {
        try {
          const response = await api.get(`${getBaseURL()}/api/profile/${userId}/`);
          const actualRole = response.data.user.role;
          setOtherProfileRole(actualRole);

          const urlRole = location.pathname.split('/')[1];
          if (actualRole && urlRole && actualRole !== urlRole) {
            // Only append the path after userId
            const restOfPath = location.pathname.split('/').slice(4).join('/');
            let newPath = `/${actualRole}/profile/${userId}`;
            if (restOfPath) {
              newPath += `/${restOfPath}`;
            }
            navigate(newPath, { replace: true });
          }
        } catch (error) {
          setOtherProfileRole(null);
        }
      };
      fetchAndCheckRole();
    }
  }, [userId, location.pathname]);


  // Helper: force redirect to current user's profile if trying to navigate away from another user's profile
  const forceToCurrentUserProfile = (target = "view_profile") => {
    if (currentUserId) {
      // You can change the path as needed (dashboard, etc.)
      navigate(`/client/profile/${currentUserId}/${target}`, { replace: true });
    }
  };

  // Intercept all navigation attempts from the sider/profile menu
  const handleMenuClick = (component) => {
    if (currentUserId && currentUserId !== userId) {
      forceToCurrentUserProfile("dashboard");
      return;
    }
    if (location.pathname !== "/client/dashboard") {
      navigate("/client/dashboard", { state: { component } });
    } else {
      setActiveComponent(component);
    }

    setIndividualLoading(true);
    setTimeout(() => {
      setIndividualLoading(false);
    }, 500);
  };

  const handleProfileMenu = (profileComponent) => {
    console.log(profileComponent)
    if (currentUserId && currentUserId !== userId) {
      forceToCurrentUserProfile(profileComponent);
      return;
    }
    const profilePath = location.pathname.split('/').slice(0, 3).join('/');
    
    navigate(`${profilePath}/${profileComponent}`);
    setIndividualLoading(true);
    setTimeout(() => {
      setIndividualLoading(false);
    }, 500);
  };

  useEffect(() => {
    if (
      currentUserId &&
      userId &&
      currentUserId !== userId
    ) {
      // Only allow .../view_profile, but don't change the role in the URL
      if (!location.pathname.endsWith('/view_profile')) {
        const base = location.pathname.split('/').slice(0, 4).join('/');
        navigate(`${base}/view_profile`, { replace: true });
      }
    }
  }, [currentUserId, userId, location.pathname, navigate]);

  if (individualLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-client-primary">
        <IndividualLoadingComponent />
      </div>
    );
  }

  // Not authenticated - Show minimal header
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-client-primary">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/5 to-blue-600/5 pointer-events-none" />
          <CHeader 
            isAuthenticated={isAuthenticated} 
            isEditable={isEditable}
            userId={userId}
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto p-8"
        >
          <NotAuthProfile userId={userId} role={role} isEditable={false} />

          <div className="mt-8 text-center text-sm text-gray-400">
            <p>Want to see more? 
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="ml-2 text-client-accent hover:text-client-accent/80 font-medium"
              >
                Sign in to connect
              </motion.button>
            </p>
          </div>
        </motion.div>

        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-client-accent/10 to-blue-500/10 rounded-full filter blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-l from-client-accent/10 to-blue-500/10 rounded-full filter blur-[100px]" />
        </div>
      </div>
    );
  }
  // Authenticated but not editable - Show NotAuthProfile with full header
  if (isAuthenticated && !isEditable) {
    if (otherProfileRole === 'freelancer') {
      return (
        <div className="flex h-screen bg-client-primary">
          <CSider
            userId={userId}
            currentUserId={currentUserId}
            role={role}
            dropdown={true}
            collapsed={true}
            handleMenuClick={handleMenuClick}
            abcds={activeComponent}
            handleProfileMenu={handleProfileMenu}
            activeProfileComponent={activeProfileComponent}
          />
          <div className={`flex-1 flex flex-col overflow-x-hidden ${isMobile ? 'ml-0' : 'ml-14'}`}>
            <CHeader 
              isAuthenticated={isAuthenticated} 
              isEditable={isEditable}
              userId={userId}
            />
            <div className="flex-1 overflow-auto bg-client-primary/50 flex justify-center w-full p-4">
              <FreelancerOtherProfile userId={userId} role="freelancer" currentUserId={currentUserId} currentRole="client" isEditable={false} />
            </div>
          </div>
        </div>
      );
    }
    // Default: show client OtherProfile
    return (
      <div className="flex h-screen bg-client-primary">
        <CSider
          userId={userId}
          currentUserId={currentUserId}
          role={role}
          dropdown={true}
          collapsed={true}
          handleMenuClick={handleMenuClick}
          abcds={activeComponent}
          handleProfileMenu={handleProfileMenu}
          activeProfileComponent={activeProfileComponent}
        />
        <div className={`flex-1 flex flex-col overflow-x-hidden ${isMobile ? 'ml-0' : 'ml-14'}`}>
          <CHeader 
            isAuthenticated={isAuthenticated} 
            isEditable={isEditable}
            userId={userId}
          />
          <div className="flex-1 overflow-auto bg-client-primary/50 flex justify-center w-full p-4">
            <OtherProfile userId={userId} role="client" isEditable={false} />
          </div>
        </div>
      </div>
    );
  }

  // Authenticated and editable - Show full profile
  return (
    <div className="flex h-screen bg-client-primary">
      <CSider
        userId={userId}
        currentUserId={currentUserId}
        role={role}
        dropdown={true}
        collapsed={true}
        handleMenuClick={handleMenuClick}
        abcds={activeComponent}
        handleProfileMenu={handleProfileMenu}
        activeProfileComponent={activeProfileComponent}
      />
      <div className="flex-1 flex flex-col overflow-x-hidden">
        <CHeader 
          isAuthenticated={isAuthenticated} 
          isEditable={isEditable}
          userId={userId}
        />
        <div className={`flex-1 flex-col overflow-auto bg-client-primary/50 flex justify-center min-h-fit min-w-fit pb-16 ${isMobile ? 'ml-0' : 'ml-14'}`}>
        <div className="px-6 py-2">
        <ReferralTab
        role="client"
          placement="profile"
          userStats={{
            referralCount: 0,
            totalEarnings: 0,
            referralCode: null
          }}
          />    
          </div>
        <Outlet context={{ 
            userId, 
            role,
            isAuthenticated,
            isEditable,
            currentUserId
          }} />
        </div>
      </div>
    </div>
  );
};

export default CProfile;
