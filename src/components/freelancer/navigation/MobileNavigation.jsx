import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, FaSearch, FaUser, FaChartLine, FaTimes, FaChevronUp, FaTrophy
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
  console.log(currentUserId)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const mobileNavItems = [
    {
      id: 'home',
      icon: FaHome,
      label: 'Home',
      path: '/freelancer/homepage',
      color: 'text-freelancer-accent'
    },
    {
      id: 'search',
      icon: FaSearch,
      label: 'Search',
      action: () => setSearchOpen(true),
      color: 'text-blue-400'
    },
    {
      id: 'obsp',
      icon: FaTrophy,
      label: 'OBSP',
      path: '/freelancer/obsp',
      color: 'text-yellow-400'
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

  // Enhanced Search Overlay
  const SearchOverlay = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-freelancer-primary/95 backdrop-blur-xl z-[200] flex flex-col"
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
            placeholder="Search projects, OBSPs..."
            className="w-full px-4 py-3 pl-12 rounded-xl bg-white/10 border border-white/20 focus:border-freelancer-accent focus:ring-2 focus:ring-freelancer-accent/20 text-white placeholder-white/50 transition-all"
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
              navigate('/freelancer/browse-projects');
              setSearchOpen(false);
            }}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <FaSearch className="text-freelancer-accent" />
            <span className="text-white text-sm">Browse Projects</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              navigate('/freelancer/obsp');
              setSearchOpen(false);
            }}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <FaTrophy className="text-freelancer-accent" />
            <span className="text-white text-sm">View OBSPs</span>
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
          className="absolute bottom-0 left-0 right-0 bg-freelancer-primary rounded-t-3xl border-t border-white/10"
          onClick={e => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 rounded-full bg-white/30" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-freelancer-accent/20 flex items-center justify-center">
                <MenuIcon className="text-freelancer-accent" />
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
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                
                return (
                  <motion.button
                    key={item.abcd}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      navigate(item.to);
                      setMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-xl transition-all
                      ${isActive 
                        ? 'bg-freelancer-accent/20 border border-freelancer-accent/30' 
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-freelancer-accent' : 'text-white/60'}`} />
                    <span className={`text-left ${isActive ? 'text-freelancer-accent font-medium' : 'text-white/80'}`}>
                      {item.text}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-freelancer-primary/95 backdrop-blur-xl border-t border-white/10 z-[100] h-safe-area">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavClick(item)}
                className={`
                  flex flex-col items-center gap-1 p-2 rounded-xl transition-all
                  ${active 
                    ? 'text-freelancer-accent' 
                    : 'text-white/60 hover:text-white/80'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${active ? item.color : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {searchOpen && <SearchOverlay />}
        {mobileMenuOpen && <MenuOverlay />}
      </AnimatePresence>

      {/* Add bottom padding to main content */}
      <style jsx global>{`
        .main-content {
          padding-bottom: 5rem !important;
        }
        
        @media (min-width: 768px) {
          .main-content {
            padding-bottom: 0 !important;
          }
        }
      `}</style>
    </>
  );
}; 