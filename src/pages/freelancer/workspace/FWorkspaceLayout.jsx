import React, { useState, useEffect } from 'react';
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
import FHeader from '../../../components/freelancer/FHeader';
import FSider from '../../../components/freelancer/FSider';
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
import axios from '../../../config/axios'; // Adjust path as needed
import { getBaseURL } from "../../../config/axios";
const { Text } = Typography;

const FWorkspaceLayout = () => {
  const { workspaceId } = useParams();
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [isPanelMaximized, setIsPanelMaximized] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  
  const [workspaceType, setWorkspaceType] = useState(null);

  useEffect(() => {
    async function fetchWorkspaceType() {
      try {
        const res = await fetch(`${getBaseURL()}/api/workspace_type/${workspaceId}/`);
        setWorkspaceType(res.data.type);
      } catch (err) {
        setWorkspaceType(null);
      }
    }
    fetchWorkspaceType();
  }, [workspaceId]);
  

  if (isMobile) {
    return (
      <div className="flex items-center justify-center h-screen bg-freelancer-primary p-4">
        <Result
          status="warning"
          title="Workspace Unavailable on Mobile"
          subTitle="Please use a desktop browser to access your workspace."
          extra={
            <Button 
              type="primary" 
              href="/freelancer/dashboard" 
              className="bg-freelancer-accent"
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
    <div className="flex h-full max-h-screen bg-freelancer-primary workspace-layout">
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
          className={`flex-1 flex flex-col ${isPanelMaximized && activePanel === 'chat' ? '' : 'overflow-auto'} bg-freelancer-bg-DEFAULT`}
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
              <div className="bg-freelancer-bg-card">
                {isPanelMaximized ? (
                  <div className="h-full relative">
                    {activePanel === 'chat' && <Chat isPanelMaximized={isPanelMaximized}/>}
                    {activePanel === 'revision' && <Revision isPanelMaximized={isPanelMaximized}/>}
                    {activePanel === 'notifications' && <Notification isPanelMaximized={isPanelMaximized}/>}
                    <button 
                      onClick={() => {
                        setIsPanelMaximized(false);
                      }}
                      className="absolute top-4 right-4 p-2 w-10 h-10 bg-freelancer-accent rounded-[999px]"
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

export default FWorkspaceLayout;