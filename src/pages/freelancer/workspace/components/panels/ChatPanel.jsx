import React, { useState } from 'react';
import { 
  SendOutlined, 
  PaperClipOutlined, 
  SmileOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  BellOutlined,
  CheckCircleOutlined,
  EditOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import { chatData } from '../config/data';

const ChatPanel = ({ maxHeight, isPanelMaximized }) => {
  const [message, setMessage] = useState('');

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessageContent = (message) => {
    switch (message.type) {
      case "text":
        return <p>{message.content}</p>;
      case "milestone":
        return (
          <div className="bg-blue-900/30 border-l-4 border-blue-400 px-3 py-2 rounded">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircleOutlined className="text-blue-400" />
              <span className="font-semibold text-blue-200">Milestone</span>
              <span className="text-xs text-white/50 ml-2">{message.milestone.status}</span>
            </div>
            <div className="text-white font-medium">{message.milestone.title}</div>
            <div className="text-xs text-white/60 flex items-center gap-1">
              <CalendarOutlined /> Due: {message.milestone.due}
            </div>
          </div>
        );
      case "revision":
        return (
          <div className="bg-yellow-900/30 border-l-4 border-yellow-400 px-3 py-2 rounded">
            <div className="flex items-center gap-2 mb-1">
              <EditOutlined className="text-yellow-400" />
              <span className="font-semibold text-yellow-200">Revision</span>
              <span className="text-xs text-white/50 ml-2">{message.revision.status}</span>
            </div>
            <div className="text-white font-medium">{message.revision.title}</div>
            <div className="text-xs text-white/60">{message.revision.details}</div>
          </div>
        );
      case "meeting":
        return (
          <div className="bg-green-900/30 border-l-4 border-green-400 px-3 py-2 rounded">
            <div className="flex items-center gap-2 mb-1">
              <CalendarOutlined className="text-green-400" />
              <span className="font-semibold text-green-200">Meeting</span>
            </div>
            <div className="text-white font-medium">{message.meeting.title}</div>
            <div className="text-xs text-white/60">
              {new Date(message.meeting.time).toLocaleString()}
            </div>
            <a href={message.meeting.link} target="_blank" rel="noopener noreferrer" className="text-xs text-green-300 underline">
              Join Meeting
            </a>
          </div>
        );
      case "reminder":
        return (
          <div className="bg-purple-900/30 border-l-4 border-purple-400 px-3 py-2 rounded">
            <div className="flex items-center gap-2 mb-1">
              <BellOutlined className="text-purple-400" />
              <span className="font-semibold text-purple-200">Reminder</span>
            </div>
            <div className="text-white font-medium">{message.reminder.text}</div>
            <div className="text-xs text-white/60">
              Due: {new Date(message.reminder.due).toLocaleString()}
            </div>
          </div>
        );
      default:
        return <p>{message.content}</p>;
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ maxHeight: maxHeight || '70vh' }}>

{/* Header */}
<div className="flex items-center justify-between px-4 py-3 border-b border-freelancer-border bg-freelancer-primary/40">
  <div className="flex items-center gap-2">
    <MessageOutlined className="text-freelancer-accent" />
    <h3 className="text-sm font-semibold text-white">Project Chat</h3>
  </div>
</div>
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {chatData.messages.map(message => (
          <div 
            key={message.id}
            className={`flex gap-2 ${message.userId === chatData.currentUser.id ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-full bg-freelancer-accent/20 flex-shrink-0 flex items-center justify-center text-white ${isPanelMaximized ? 'text-base' : 'text-xs'}`}>
              {message.userName[0]}
            </div>

            {/* Message Content */}
            <div className={`flex flex-col ${message.userId === chatData.currentUser.id ? 'items-end' : ''}`}>
              {/* User Info */}
              <div className="flex items-center gap-1 mb-0.5">
                <span className={`text-[10px] text-white/40 ${isPanelMaximized ? 'text-base' : 'text-xs'}`}>
                  {formatTime(message.timestamp)}
                </span>
                <span className={`text-[11px] font-sans text-white ${isPanelMaximized ? 'text-base' : 'text-xs'}`}>
                  {message.userName}
                </span>
                <span className={`text-[10px] text-freelancer-accent ${isPanelMaximized ? 'text-base' : 'text-xs'}`}>
                  {message.userRole}
                </span>
              </div>

              {/* Message Bubble */}
              <div className={`rounded-lg px-3 py-1 max-w-[80%] text-xs ${
                message.type === "text" 
                  ? message.userId === chatData.currentUser.id
                    ? 'bg-freelancer-accent text-white'
                    : 'bg-freelancer-primary/40 text-white/90'
                  : ''
              }`}>
                {renderMessageContent(message)}
                {message.attachments?.map(attachment => (
                  <div 
                    key={attachment.id}
                    className="mt-1 flex items-center gap-1 p-1 rounded bg-black/20"
                  >
                    <PaperClipOutlined className="text-white/60 text-xs" />
                    <span className="text-xs text-white/90">
                      {attachment.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="px-3 py-2 border-t border-freelancer-border bg-freelancer-primary/20">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-freelancer-primary/40 rounded-lg border border-freelancer-border">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-transparent border-none resize-none text-xs text-white placeholder-white/40 p-2 focus:outline-none"
              rows={1}
              style={{ minHeight: '32px' }}
            />
            <div className="flex items-center justify-between px-2 py-1 border-t border-freelancer-border">
              <div className="flex items-center gap-1">
                <button className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                  <PaperClipOutlined />
                </button>
                <button className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                  <SmileOutlined />
                </button>
              </div>
            </div>
          </div>
          <button 
            className="p-2 rounded-lg bg-freelancer-accent text-white hover:bg-freelancer-accent/90 transition-colors"
          >
            <SendOutlined />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;