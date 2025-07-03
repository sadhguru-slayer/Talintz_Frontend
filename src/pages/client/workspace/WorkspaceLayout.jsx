import React, { useState } from 'react';
import { Layout, Typography, Tooltip, Badge } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ProjectOutlined, AppstoreOutlined, DollarOutlined,
  CheckCircleOutlined, MessageOutlined, BellOutlined,
  FileSearchOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  RocketOutlined, WarningOutlined, FullscreenExitOutlined
} from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import CHeader from '../../../components/client/CHeader';
import CSider from '../../../components/client/CSider';
import LeftSider from './components/LeftSider';
import RightSider from './components/RightSider';
import OverviewContent from './components/content/OverviewContent';
import Milestones from './components/content/Milestones';
import Payments from './components/content/Payments';
import RightPanel from './components/RightPanel';
import ChatPanel from './components/panels/ChatPanel';

const { Text } = Typography;

const WorkspaceLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [isPanelMaximized, setIsPanelMaximized] = useState(false);
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

  const handleRightSiderClick = (panelType) => {
    setActivePanel(panelType);
  };

  return (
    <div className="flex h-full bg-client-primary workspace-layout">
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
                {isPanelMaximized ? (
                  <div className="h-full p-4 bg-client-primary">
                    {activePanel === 'chat' && <ChatPanel />}
                    {activePanel === 'revision' && <RevisionPanel />}
                    <button 
                      onClick={() => setIsPanelMaximized(false)}
                      className="absolute top-4 right-4 p-2 bg-client-accent rounded-lg"
                    >
                      <FullscreenExitOutlined />
                    </button>
                  </div>
                ) : (
                  <>
                    {activeSection === 'overview' && <OverviewContent />}
                    {activeSection === 'milestones' && <Milestones />}
                    {activeSection === 'payments' && <Payments />}
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Right Sider */}
        <RightSider 
          activePanelType={activePanel}
          onItemClick={handleRightSiderClick}
        />

        {/* Right Panel */}
        <RightPanel 
          isOpen={!!activePanel}
          activePanel={activePanel}
          onClose={() => setActivePanel(null)}
          onMaximize={setIsPanelMaximized}
        />
      </div>
    </div>
  );
};

export default WorkspaceLayout;