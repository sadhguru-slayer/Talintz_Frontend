import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';

export const SidebarLink = ({ 
  link, 
  isCollapsed, 
  showText, 
  currentPath, 
  iconClass,
  darkTheme = false 
}) => {
  const navigate = useNavigate();
  const isActive = currentPath === link.to || 
    (link.to !== '/' && currentPath.startsWith(link.to));

  const handleClick = () => {
    if (link.onClick) {
      link.onClick();
    } else {
      navigate(link.to);
    }
  };

  // Create the icon component
  const Icon = link.icon;

  return (
    <Tooltip 
      title={isCollapsed ? link.text : ''} 
      placement="right"
      overlayClassName={darkTheme ? 'dark-tooltip' : ''}
    >
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleClick}
        className={`
          w-full flex items-center gap-3 p-3 rounded-lg
          transition-all duration-200 cursor-pointer group
          ${isCollapsed ? 'justify-center' : 'justify-start'}
          ${isActive 
            ? 'bg-freelancer-accent/15 border border-freelancer-accent/30 text-white' 
            : 'hover:bg-white/8 border border-transparent hover:border-white/10 text-white/70 hover:text-white'
          }
        `}
      >
        <div className={`
          w-5 h-5 flex items-center justify-center
          ${isActive ? 'text-freelancer-accent' : 'text-white/70 group-hover:text-white'}
          transition-colors duration-200
        `}>
          <Icon className={iconClass} />
        </div>
        
        {!isCollapsed && showText && (
          <span className={`
            text-sm font-medium transition-all duration-200
            ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}
          `}>
            {link.text}
          </span>
        )}

        {isActive && !isCollapsed && (
          <div className="ml-auto w-1.5 h-1.5 bg-freelancer-accent rounded-full" />
        )}
      </motion.button>
    </Tooltip>
  );
}; 