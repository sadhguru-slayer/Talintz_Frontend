import React, { useState } from 'react';
import { Layout, Typography, Tooltip, Badge, Result, Button } from 'antd';
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
import Chat from './components/content/Chat';
import Revision from './components/content/Revision';
import Notification from './components/content/Notification';
import Settings from './components/content/Settings';

const { Text } = Typography;

const CWorkspaceLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [isPanelMaximized, setIsPanelMaximized] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  
  if (isMobile) {
    return (
      <div className="flex items-center justify-center h-screen bg-client-primary p-4">
        <Result
          status="warning"
          title="Workspace Unavailable on Mobile"
          subTitle="Please use a desktop browser for the best experience."
          extra={
            <Button 
              type="primary" 
              href="/client/dashboard" 
              className="bg-client-accent"
            >
              Return to Dashboard
            </Button>
          }
        />
      </div>
    );
  }

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
    setIsPanelMaximized(false);
    setActivePanel(panelType);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setIsPanelMaximized(false);
    setActivePanel(null);
  };

  return (
    <div className="flex h-full max-h-screen bg-client-primary workspace-layout">
      <div className="flex-1 flex overflow-hidden">
        {/* Replaced Left Workspace Sider with new component */}
        <LeftSider 
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          activeSection={activeSection}
          setActiveSection={handleSectionChange}
        />

        {/* Center Content */}
        <motion.div
          className={`flex-1 flex flex-col ${isPanelMaximized && activePanel === 'chat' ? '' : 'overflow-auto'} bg-client-bg-DEFAULT`}
          initial={{ marginLeft: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ maxHeight: '800px' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              
            >
              <div className="">
                {isPanelMaximized ? (
                  <div className="h-full relative">
                    {activePanel === 'chat' && <Chat isPanelMaximized={isPanelMaximized}/>}
                    {activePanel === 'revision' && <Revision isPanelMaximized={isPanelMaximized}/>}
                    {activePanel === 'notifications' && <Notification isPanelMaximized={isPanelMaximized}/>}
                    <button 
                      onClick={() => {
                        setIsPanelMaximized(false);
                      }}
                      className="absolute top-4 right-4 p-2 w-10 h-10 bg-client-accent rounded-[999px]"
                      title="Minimize"
                    >
                      <FullscreenExitOutlined />
                    </button>
                  </div>
                ) : (
                  <>
                    {activeSection === 'overview' && <OverviewContent />}
                    {activeSection === 'milestones' && <Milestones />}
                    {activeSection === 'payments' && <Payments />}
                    {activeSection === 'settings' && <Settings />}
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
          isPanelMaximized={isPanelMaximized}
        />
      </div>
    </div>
  );
};

export default CWorkspaceLayout;