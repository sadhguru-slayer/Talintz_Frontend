import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, FaPlus, FaSearch, FaUser, FaBell, FaProjectDiagram, 
  FaChartLine, FaWallet, FaTimes, FaChevronUp, FaTrophy
} from 'react-icons/fa';

export const MobileNavigation = ({ 
  links, 
  dashboardLinks, 
  profileLinks,
  userId,
  currentUserId,
  activeSection,
  activeProfileComponent 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const idToUse = currentUserId || userId;

  // Enhanced mobile navigation items - Replaced search with OBSP
  const mobileNavItems = [
    {
      id: 'home',
      icon: FaHome,
      label: 'Home',
      path: '/client/homepage',
      color: 'text-client-accent'
    },
    {
      id: 'obsp',
      icon: FaTrophy,
      label: 'OBSP',
      path: '/client/obsp/list',
      color: 'text-yellow-400'
    },
    {
      id: 'post',
      icon: FaPlus,
      label: 'Post',
      path: '/client/post-project',
      color: 'text-green-400',
      isMain: true
    },
    {
      id: 'dashboard',
      icon: FaChartLine,
      label: 'Dashboard',
      action: () => {
        setActiveMenu('dashboard');
        setMobileMenuOpen(true);
      },
      color: 'text-purple-400'
    },
    {
      id: 'profile',
      icon: FaUser,
      label: 'Profile',
      action: () => {
        setActiveMenu('profile');
        setMobileMenuOpen(true);
      },
      color: 'text-orange-400'
    }
  ];

  const handleNavClick = (item) => {
    // Always use currentUserId for profile links
    if (item.path && item.path.includes('/profile/') && currentUserId) {
      const match = item.path.match(/\/(client|freelancer)\/profile\/\d+\/(.+)/);
      if (match) {
        const newPath = `/client/profile/${currentUserId}/${match[2]}`;
        navigate(newPath, { replace: true });
        return;
      }
    }
    // For all other links, use the default navigation
    if (item.path) {
      navigate(item.path);
    } else if (item.action) {
      item.action();
    }
  };

  const isActive = (item) => {
    if (item.path) {
      return location.pathname === item.path || location.pathname.includes(item.id);
    }
    return false;
  };

  // Enhanced Search Overlay (kept for potential future use)
  const SearchOverlay = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-client-primary/95 backdrop-blur-xl z-[200] flex flex-col"
    >
      {/* Search Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-white">Search</h2>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setSearchOpen(false)}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <FaTimes className="text-white text-sm" />
        </motion.button>
      </div>

      {/* Search Input */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search projects, freelancers..."
            className="w-full px-4 py-3 pl-12 rounded-xl bg-white/10 border border-white/20 focus:border-client-accent focus:ring-2 focus:ring-client-accent/20 text-white placeholder-white/50 transition-all"
            autoFocus
          />
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <h3 className="text-white/70 text-sm font-medium mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              navigate('/client/browse-freelancers');
              setSearchOpen(false);
            }}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <FaUser className="text-client-accent" />
            <span className="text-white text-sm">Find Talent</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              navigate('/client/dashboard/projects');
              setSearchOpen(false);
            }}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <FaProjectDiagram className="text-client-accent" />
            <span className="text-white text-sm">My Projects</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  // Enhanced Menu Overlay
  const MenuOverlay = () => {
    if (!mobileMenuOpen) return null;

    const menuItems = activeMenu === 'dashboard' ? dashboardLinks : profileLinks;
    const menuTitle = activeMenu === 'dashboard' ? 'Dashboard' : 'Profile';
    const menuIcon = activeMenu === 'dashboard' ? FaChartLine : FaUser;
    const MenuIcon = menuIcon;
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150]"
        onClick={() => setMobileMenuOpen(false)}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ 
            type: 'spring', 
            damping: 30,
            stiffness: 300
          }}
          className="absolute bottom-0 left-0 right-0 bg-client-primary rounded-t-3xl border-t border-white/10"
          onClick={e => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 rounded-full bg-white/30" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-client-accent/20 flex items-center justify-center">
                <MenuIcon className="text-client-accent" />
              </div>
              <h2 className="text-xl font-bold text-white">{menuTitle}</h2>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <FaChevronUp className="text-white/60 text-sm" />
            </motion.button>
          </div>

          {/* Menu Items */}
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // Always use currentUserId for profile links
                    if (item.path && item.path.includes('/profile/') && currentUserId) {
                      const match = item.path.match(/\/(client|freelancer)\/profile\/\d+\/(.+)/);
                      if (match) {
                        const newPath = `/client/profile/${currentUserId}/${match[2]}`;
                        navigate(newPath, { replace: true });
                        setMobileMenuOpen(false);
                        return;
                      }
                    }
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200
                    ${(activeMenu === 'dashboard' ? 
                      location.pathname.includes(item.id) : 
                      activeProfileComponent === item.id)
                      ? 'bg-client-accent/20 text-client-accent border border-client-accent/30'
                      : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-transparent hover:border-white/10'}
                  `}
                >
                  <item.icon className="text-lg" />
                  <div className="text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-60">{item.tooltip}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Safe Area */}
          <div className="h-safe-area-inset-bottom bg-client-primary" />
        </motion.div>
      </motion.div>
    );
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-[100] bg-client-primary/95 backdrop-blur-xl border-t border-white/10 shadow-2xl"
      >
        <div className="flex items-center justify-around px-2 py-2 max-w-screen-xl mx-auto">
          {mobileNavItems.map((item) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleNavClick(item)}
              className={`
                relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200
                ${item.isMain 
                  ? 'bg-client-accent shadow-lg shadow-client-accent/30 scale-110' 
                  : isActive(item)
                    ? 'bg-white/10 text-client-accent'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }
              `}
            >
              {/* Active Indicator */}
              {isActive(item) && !item.isMain && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 w-1 h-1 rounded-full bg-client-accent"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <item.icon 
                className={`
                  text-lg mb-1 transition-colors
                  ${item.isMain ? 'text-white' : ''}
                `} 
              />
              <span 
                className={`
                  text-[10px] font-medium transition-colors
                  ${item.isMain ? 'text-white' : ''}
                `}
              >
                {item.label}
              </span>

              {/* Notification Badge for specific items */}
              {item.id === 'dashboard' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-[8px] font-bold">3</span>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
        
        {/* Safe Area */}
        <div className="h-safe-area-inset-bottom bg-client-primary/95" />
      </motion.div>

      {/* Overlays */}
      <AnimatePresence>
        {searchOpen && <SearchOverlay />}
        {mobileMenuOpen && <MenuOverlay />}
      </AnimatePresence>
    </>
  );
}; 