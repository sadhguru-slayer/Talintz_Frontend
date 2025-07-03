import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloseOutlined, 
  MinusOutlined, 
  ExpandOutlined,
  DragOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons';
import ChatPanel from './panels/ChatPanel';

const RightPanel = ({ isOpen, onClose, activePanel, onMaximize }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const workspaceRef = useRef(null);

  // Function to ensure panel stays within bounds when maximizing
  const adjustPositionWithinBounds = () => {
    if (!dragRef.current || !workspaceRef.current) return;

    const workspace = workspaceRef.current.getBoundingClientRect();
    const panel = dragRef.current.getBoundingClientRect();
    const maxHeight = isMinimized ? 40 : 500; // Panel height when maximized
    
    let newX = position.x;
    let newY = position.y;

    // Adjust horizontal position if needed
    if (panel.right > workspace.right - 40) {
      newX = workspace.width - panel.width - 40;
    }
    if (panel.left < 0) {
      newX = 0;
    }

    // Adjust vertical position if needed
    if (panel.bottom > workspace.bottom - 64) {
      newY = workspace.height - maxHeight - 64;
    }
    if (panel.top < 0) {
      newY = 0;
    }

    setPosition({ x: newX, y: newY });
  };

  // Update workspace ref when mounted
  useEffect(() => {
    workspaceRef.current = document.querySelector('.workspace-layout');
  }, []);

  // Adjust position when minimizing/maximizing
  useEffect(() => {
    adjustPositionWithinBounds();
  }, [isMinimized]);

  const handleMinimizeToggle = (e) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  const handleMaximizeToggle = (e) => {
    e.stopPropagation();
    setIsMaximized(!isMaximized);
    onMaximize?.(!isMaximized);
  };

  const getPanelContent = () => {
    switch (activePanel) {
      case 'chat':
        return <ChatPanel />;
      case 'revision':
        return <RevisionPanel />;
      case 'notifications':
        return <NotificationsPanel />;
      case 'quickAccess':
        return <QuickAccessPanel />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && !isMaximized && (
        <Draggable
          nodeRef={dragRef}
          handle=".panel-handle"
          position={position}
          onStop={(e, data) => {
            setPosition({ x: data.x, y: data.y });
          }}
          bounds={{
            left: 0,
            top: 0,
            right: workspaceRef.current ? workspaceRef.current.clientWidth - 384 : 0,
            bottom: workspaceRef.current ? workspaceRef.current.clientHeight - (isMinimized ? 40 : 500) : 0
          }}
        >
          <motion.div
            ref={dragRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              zIndex: 50,
              touchAction: 'none'
            }}
          >
            <div
              className={`
                w-96 bg-client-secondary/95 backdrop-blur-sm
                border border-client-border rounded-xl shadow-2xl
                ${isMinimized ? 'h-10' : 'h-[500px]'}
                transition-all duration-200 ease-in-out
              `}
            >
              {/* Header - Draggable Handle */}
              <div 
                className="panel-handle flex items-center justify-between px-3 py-2 
                         border-b border-client-border bg-client-primary/40 
                         rounded-t-xl select-none"
              >
                {/* Left side - Title and drag indicator */}
                <div className="flex items-center gap-2">
                  <DragOutlined className="text-white/40 cursor-move" />
                  <h2 className="text-sm font-medium text-white">
                    {activePanel === 'chat' && 'Project Chat'}
                    {activePanel === 'revision' && 'Raise Revision'}
                    {activePanel === 'notifications' && 'Notifications'}
                    {activePanel === 'quickAccess' && 'Quick Access'}
                  </h2>
                </div>

                {/* Right side - Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMaximizeToggle}
                    className="flex items-center justify-center w-6 h-6
                             rounded hover:bg-white/10 text-white/60 
                             hover:text-white transition-colors"
                    title="Maximize"
                  >
                    <FullscreenOutlined />
                  </button>
                  <button
                    onClick={handleMinimizeToggle}
                    className="flex items-center justify-center w-6 h-6
                             rounded hover:bg-white/10 text-white/60 
                             hover:text-white transition-colors"
                    title={isMinimized ? "Expand" : "Minimize"}
                  >
                    {isMinimized ? <ExpandOutlined /> : <MinusOutlined />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    className="flex items-center justify-center w-6 h-6
                             rounded hover:bg-white/10 text-white/60 
                             hover:text-white transition-colors
                             hover:bg-red-500/20 hover:text-red-500"
                    title="Close"
                  >
                    <CloseOutlined />
                  </button>
                </div>
              </div>

              {/* Content */}
              {!isMinimized && (
                <div className="p-4 h-[calc(100%-2.5rem)] overflow-y-auto">
                  {getPanelContent()}
                </div>
              )}
            </div>
          </motion.div>
        </Draggable>
      )}
    </AnimatePresence>
  );
};


const RevisionPanel = () => (
  <div className="space-y-4">
    <div className="bg-client-primary/40 rounded-lg p-4">
      <h3 className="text-white font-medium mb-2">Raise a Revision Request</h3>
      <textarea 
        className="w-full bg-client-primary/40 border border-client-border 
                   rounded-lg p-3 text-white resize-none"
        rows={4}
        placeholder="Describe the changes needed..."
      />
      <button className="mt-2 px-4 py-2 bg-client-accent text-white rounded-lg">
        Submit Request
      </button>
    </div>
  </div>
);

const NotificationsPanel = () => (
  <div className="space-y-2">
    {/* Notifications list */}
    <div className="text-white">Notifications content...</div>
  </div>
);

const QuickAccessPanel = () => (
  <div className="space-y-4">
    {/* Quick access links/actions */}
    <div className="text-white">Quick access content...</div>
  </div>
);

export default RightPanel;
