import React, { useState, useEffect } from 'react';
import { VideoCameraOutlined, PhoneOutlined, MoreOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';

const ChatHeader = ({ conversation, onShowDetails, isMobile, onBack }) => {
  const [isAvatarLoading, setIsAvatarLoading] = useState(true);
  const [lastActive, setLastActive] = useState('Online');

  useEffect(() => {
    if (conversation?.lastActive) {
      const timeAgo = formatTimeAgo(conversation.lastActive);
      setLastActive(`Last active ${timeAgo}`);
    } else {
      setLastActive('Online');
    }
  }, [conversation?.lastActive]);

  const handleAvatarLoad = () => {
    setIsAvatarLoading(false);
  };

  if (!conversation) return null;

  return (
    <div className="
      flex items-center justify-between
      px-4 py-3
      border-b border-white/10
      bg-white/5
      min-h-[64px]
    ">
      {/* Left: Back Arrow (mobile), Avatar and Name */}
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            className="mr-2 p-2 rounded-full bg-white/80 hover:bg-white/90 shadow"
            onClick={onBack}
            title="Back to chats"
          >
            <ArrowLeftOutlined className="text-client-accent" />
          </button>
        )}
        <div className="relative">
          {isAvatarLoading && (
            <Skeleton.Avatar
              active
              size={40}
              className="absolute top-0 left-0"
            />
          )}
          <img
            src={conversation.avatar}
            alt={conversation.name}
            className={`w-10 h-10 rounded-full object-cover border border-white/20 shadow ${isAvatarLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={handleAvatarLoad}
          />
        </div>
        <div>
          <div className="font-bold text-client-accent text-base">{conversation.name}</div>
          <div className="text-xs text-text-muted">
            {lastActive}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* <button
          className="p-2 w-8 h-8 rounded-full flex items-center bg-white/10 hover:bg-white/20 text-client-accent transition"
          title="Video Call"
        >
          <VideoCameraOutlined />
        </button>
        <button
          className="p-2 w-8 h-8 rounded-full flex items-center bg-white/10 hover:bg-white/20 text-client-accent transition"
          title="Audio Call"
        >
          <PhoneOutlined />
        </button> */}
        <button
          className="p-2 w-8 h-8 rounded-full flex items-center bg-white/10 hover:bg-white/20 text-client-accent transition"
          title="More"
          onClick={onShowDetails}
        >
          <MoreOutlined />
        </button>
      </div>
    </div>
  );
};

// Helper function to format time ago
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const lastActive = new Date(timestamp);
  const diffInSeconds = Math.floor((now - lastActive) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export default ChatHeader;