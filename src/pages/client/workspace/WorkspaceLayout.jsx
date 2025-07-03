import React, { useState } from 'react';
import { Layout, Typography, Tooltip, Badge } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ProjectOutlined, AppstoreOutlined, DollarOutlined,
  CheckCircleOutlined, MessageOutlined, BellOutlined,
  FileSearchOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  RocketOutlined, WarningOutlined
} from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import CHeader from '../../../components/client/CHeader';
import CSider from '../../../components/client/CSider';
import LeftSider from './components/LeftSider';

const { Sider, Content } = Layout;
const { Text } = Typography;

const WorkspaceLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  
  // Right Sider Items
  const rightNavItems = [
    {
      key: 'chat',
      icon: <MessageOutlined />,
      label: 'Project Chat',
      badge: 3, // Unread messages
      onClick: () => setIsChatExpanded(!isChatExpanded)
    },
    {
      key: 'revision',
      icon: <WarningOutlined />,
      label: 'Raise Revision',
      badge: null
    },
    {
      key: 'notifications',
      icon: <BellOutlined />,
      label: 'Status Updates',
      badge: 1 // New notifications
    },
    {
      key: 'quickAccess',
      icon: <RocketOutlined />,
      label: 'Quick Access',
      badge: null
    }
  ];

  return (
    <div className="flex h-full bg-client-primary">
      <div className="flex-1 flex overflow-hidden">
        {/* Replaced Left Workspace Sider with new component */}
        <LeftSider 
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        {/* Center Content */}
        <motion.div
          className="flex-1 flex flex-col overflow-auto bg-client-bg-DEFAULT"
          initial={{ marginLeft: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <div className="bg-client-secondary/40 backdrop-blur-2xl rounded-xl border border-client-border p-6 shadow-lg">
                {activeSection} content goes here
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Right Fixed Sider */}
        <motion.div
          className="flex flex-col h-full bg-client-secondary border-l border-client-border z-10"
          initial={{ width: 80 }}
          animate={{ width: 80 }}
        >
          <div className="py-4 flex flex-col items-center space-y-4">
            {rightNavItems.map(item => (
              <Tooltip
                key={item.key}
                title={item.label}
                placement="left"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={item.onClick}
                  className="w-12 h-12 flex items-center justify-center rounded-full
                           text-white/60 hover:text-white hover:bg-client-accent/10
                           cursor-pointer transition-all"
                >
                  <Badge count={item.badge} offset={[-5, 5]}>
                    {item.icon}
                  </Badge>
                </motion.div>
              </Tooltip>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WorkspaceLayout;