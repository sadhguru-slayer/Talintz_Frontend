import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from 'antd';
import { FaChartBar, FaUserCircle } from 'react-icons/fa';
import { SidebarLink } from './SidebarLink';

export const DropdownSection = ({
  title,
  icon: Icon,
  isOpen,
  isCollapsed,
  links,
  currentPath,
  onToggle,
  iconClass,
  darkTheme = false,
  currentUserId,
  userId
}) => {
  const getSectionIcon = () => {
    switch (title.toLowerCase()) {
      case 'dashboard':
        return FaChartBar;
      case 'profile':
        return FaUserCircle;
      default:
        return null;
    }
  };

  const SectionIcon = getSectionIcon();

  return (
    <div className="space-y-1">
      <Tooltip 
        title={isCollapsed ? title : ''} 
        placement="right"
        overlayClassName={darkTheme ? 'dark-tooltip' : ''}
      >
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onToggle}
          className={`
            w-full flex items-center gap-3 p-3 rounded-lg
            transition-all duration-200 cursor-pointer group
            border border-white/10 hover:border-white/20
            bg-white/5 hover:bg-white/8
            ${isCollapsed ? 'justify-center' : 'justify-between'}
          `}
        >
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center text-white/70 group-hover:text-white transition-colors duration-200">
              {SectionIcon && <SectionIcon />}
            </div>
            {!isCollapsed && (
              <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors duration-200">
                {title}
              </span>
            )}
          </div>
          
          {!isCollapsed && (
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-white/50 group-hover:text-white/70 transition-colors duration-200"
            >
              <Icon className="w-3 h-3" />
            </motion.div>
          )}
        </motion.button>
      </Tooltip>

      <AnimatePresence>
        {isOpen && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-2 space-y-1">
              {links.map((link) => (
                <SidebarLink 
                  key={link.id}
                  link={link}
                  isCollapsed={false}
                  showText={true}
                  currentPath={currentPath}
                  iconClass={iconClass}
                  darkTheme={darkTheme}
                  currentUserId={currentUserId}
                  userId={userId}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 