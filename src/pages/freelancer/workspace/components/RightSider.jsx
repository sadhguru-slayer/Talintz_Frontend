import React from 'react';
import { Tooltip, Badge } from 'antd';
import { motion } from 'framer-motion';
import {
  MessageOutlined,
  BellOutlined,
  WarningOutlined,
  RocketOutlined
} from '@ant-design/icons';

const RightSider = ({ activePanelType, onItemClick }) => {
  // Right Sider Items
  const rightNavItems = [
    {
      key: 'chat',
      icon: <MessageOutlined />,
      label: 'Project Chat',
      badge: 3,
    },
    {
      key: 'revision',
      icon: <WarningOutlined />,
      label: 'Revision',
      badge: null
    },
    {
      key: 'notifications',
      icon: <BellOutlined />,
      label: 'Status Updates',
      badge: 1
    },
    
  ];

  return (
    <motion.div
      className="flex flex-col h-full bg-freelancer-bg-grey border-l border-freelancer-border z-10"
      initial={{ width: 40 }}
      animate={{ width: 40 }}
    >
      <div className="py-2 flex flex-col items-center space-y-1 overflow-y-auto">
        {rightNavItems.map(item => (
          <Tooltip
            key={item.key}
            title={item.label}
            placement="left"
            overlayClassName="whitespace-nowrap"
            overlayStyle={{ 
              maxWidth: 'none',
              background: 'var(--freelancer-primary)',
              color: 'white',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            <motion.div
              whileHover={{ x: -3 }}
              onClick={() => onItemClick(item.key)}
              className={`
                flex items-center justify-center w-full py-2 cursor-pointer rounded-lg
                text-white/80 hover:text-white transition-all
                ${activePanelType === item.key ? 'bg-freelancer-accent/10' : 'hover:bg-white/5'}
              `}
            >
              <Badge 
                count={item.badge} 
                offset={[-6, 4]}
                style={{ 
                  backgroundColor: item.key === 'chat' && activePanelType === 'chat' ? 'var(--freelancer-accent)' : 'var(--freelancer-primary)',
                  boxShadow: `0 0 0 2px var(--freelancer-primary)`
                }}
              >
                <div 
                  className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0
                    ${item.key === 'chat' && activePanelType === 'chat' ? 
                      'bg-freelancer-accent/20 text-freelancer-accent' : 
                      'bg-white/10 text-white/60'
                    }
                  `}
                >
                  {item.icon}
                </div>
              </Badge>
            </motion.div>
          </Tooltip>
        ))}
      </div>
    </motion.div>
  );
};

export default RightSider;
