import React, { useEffect, useState } from 'react'
import ChatPanel from '../panels/ChatPanel'

const Chat = () => {
  const [maxHeight, setMaxHeight] = useState(null);

  useEffect(() => {
    const updateHeight = () => {
      const workspace = document.querySelector('.workspace-layout');
      if (workspace) {
        setMaxHeight(workspace.clientHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <div className="flex flex-col h-full bg-freelancer-bg-card border border-freelancer-border shadow-card">
      <ChatPanel maxHeight={maxHeight || '70vh'} />
    </div>
  )
}

export default Chat
