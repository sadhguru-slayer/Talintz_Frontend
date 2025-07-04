import React, { useState } from 'react';
import { 
  ProjectOutlined, AppstoreOutlined, DollarOutlined,
  CheckCircleOutlined, FileOutlined, TeamOutlined,
  MessageOutlined, SettingOutlined, BarChartOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, Badge } from 'antd';
import { useMediaQuery } from 'react-responsive';

const LeftSider = ({ collapsed, setCollapsed, activeSection, setActiveSection }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  
  // Navigation items with icons and badges
  const navItems = [
    {
      key: 'overview',
      icon: <BarChartOutlined />,
      label: 'Overview',
      badge: null,
    },
    {
      key: 'milestones',
      icon: <AppstoreOutlined />,
      label: 'Milestones',
      badge: 2,
    },
    {
      key: 'payments',
      icon: <DollarOutlined />,
      label: 'Payments',
      badge: null,
    },
    
  ];

  return (
    <motion.div 
      className="flex flex-col h-full bg-client-secondary z-10 relative"
      initial={{ width: 200 }}
      animate={{ width: collapsed ? 50 : 200 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Navigation Items */}
      <div className="py-2 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <Tooltip
            key={item.key}
            title={collapsed ? item.label : ''}
            placement="right"
            overlayClassName="whitespace-nowrap"
            overlayStyle={{ 
              maxWidth: 'none',
              background: 'var(--client-secondary)',
              color: 'white',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            <motion.div
              whileHover={{ x: 3 }}
              onClick={() => setActiveSection(item.key)}
              className={`
                flex items-center ${collapsed ? 'justify-center' : 'px-3'} py-2 mx-1 cursor-pointer rounded-lg
                text-white/80 hover:text-white transition-all
                ${activeSection === item.key ? 
                  'bg-client-accent/10' : 
                  'hover:bg-white/5'
                }
              `}
            >
              <Badge 
                count={item.badge} 
                offset={[-6, 4]}
                style={{ 
                  backgroundColor: activeSection === item.key ? 'var(--client-accent)' : 'var(--client-secondary)',
                  boxShadow: `0 0 0 2px var(--client-secondary)`
                }}
              >
                <div 
                  className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0
                    ${activeSection === item.key ? 
                      'bg-client-accent/20 text-client-accent' : 
                      'bg-white/10 text-white/60'
                    }
                  `}
                >
                  {item.icon}
                </div>
              </Badge>
              
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: collapsed ? 0 : 1 }}
                  transition={{ duration: 0.2 }}
                  className="ml-2 flex-1"
                >
                  <div className="font-medium text-sm text-white">{item.label}</div>
                </motion.div>
              )}
            </motion.div>
          </Tooltip>
        ))}
      </div>

      {/* Settings Button */}
      <div className="mt-auto p-2 border-t border-client-border">
        <Tooltip
          title={collapsed ? "Settings" : ""}
          placement="right"
          overlayClassName="whitespace-nowrap"
        >
          <motion.div
            whileHover={{ x: 3 }}
            onClick={() => setActiveSection('settings')}
            className={`
              flex items-center ${collapsed ? 'justify-center' : 'px-3'} py-2 mx-1 cursor-pointer rounded-lg
              text-white/80 hover:text-white transition-all
              hover:bg-white/5
              ${activeSection === 'settings' ? 'bg-client-accent/10' : ''}
            `}
          >
            <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 bg-white/10 text-white/60">
              <SettingOutlined />
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: collapsed ? 0 : 1 }}
                transition={{ duration: 0.2 }}
                className="ml-2"
              >
                <div className="font-medium text-sm text-white">Settings</div>
              </motion.div>
            )}
          </motion.div>
        </Tooltip>
      </div>

      {/* New Middle Edge Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-1/2 -right-3 transform -translate-y-1/2
                   w-6 h-6 rounded-full bg-client-secondary
                   flex items-center justify-center
                   text-white/60 hover:text-white
                   shadow-lg border border-client-border
                   z-50 transition-colors"
      >
        <div className="flex items-center justify-center w-full h-full">
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
            className={`transform transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
          >
            <path 
              d="M15 18l-6-6 6-6" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </motion.button>
    </motion.div>
  );
};

export default LeftSider;
