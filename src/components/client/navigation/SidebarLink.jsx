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
  darkTheme = false,
  onClick,
  currentUserId,
  userId
}) => {
  const navigate = useNavigate();
  const isActive = currentPath === link.path || 
    (link.path !== '/' && currentPath.startsWith(link.path));

  const handleClick = () => {
    console.log(currentUserId,userId)
    if (currentUserId && userId && currentUserId !== userId) {
      const match = link.path.match(/\/client\/profile\/\d+\/(.+)/);
      if (match) {
        const newPath = `/client/profile/${currentUserId}/${match[1]}`;
        navigate(newPath, { replace: true });
        return;
      }
      navigate(link.path, { replace: true });
      return;
    }

    if (onClick) {
      onClick();
    } else if (link.onClick) {
      link.onClick();
    } else {
      navigate(link.path);
    }
  };

  // Render the icon component
  const IconComponent = link.icon;

  return (
    <Tooltip 
      title={isCollapsed ? link.label : ''} 
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
            ? 'bg-client-accent/15 border border-client-accent/30 text-white' 
            : 'hover:bg-white/8 border border-transparent hover:border-white/10 text-white/70 hover:text-white'
          }
        `}
      >
        <div className={`
          w-5 h-5 flex items-center justify-center
          ${isActive ? 'text-client-accent' : 'text-white/70 group-hover:text-white'}
          transition-colors duration-200
        `}>
          <IconComponent />
        </div>
        
        {!isCollapsed && showText && (
          <span className={`
            text-sm font-medium transition-all duration-200
            ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}
          `}>
            {link.label}
          </span>
        )}

        {isActive && !isCollapsed && (
          <div className="ml-auto w-1.5 h-1.5 bg-client-accent rounded-full" />
        )}
      </motion.button>
    </Tooltip>
  );
}; 