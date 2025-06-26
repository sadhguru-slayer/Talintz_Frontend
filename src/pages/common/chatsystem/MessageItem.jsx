import React, { useState, useEffect } from 'react';
import { PushpinOutlined, MoreOutlined, DeleteOutlined, ExclamationCircleOutlined, PaperClipOutlined, DownloadOutlined, CloseOutlined } from "@ant-design/icons";
import { Dropdown, Menu, Modal } from "antd";
import { FaReply } from "react-icons/fa";
import { motion } from 'framer-motion';

const StatusIndicator = ({ status }) => {
  // 'sent' status has no icon for a cleaner look
  if (!status || status === 'sent') {
    return null;
  }

  switch (status) {
    case "failed":
      return <ExclamationCircleOutlined className="text-red-500" title="Failed to send" />;
    case "delivered":
      return <span className="w-1.5 h-1.5 rounded-full bg-gray-400 block" title="Delivered"></span>;
    case "seen":
      return <span className="w-1.5 h-1.5 rounded-full bg-client-accent block" title="Seen"></span>;
    default:
      return null;
  }
};

const MessageItem = ({
  message,
  isMe,
  avatar,
  name,
  isPinned,
  onPin,
  onDeleteForMe,
  onDeleteForEveryone,
  highlight,
  onReply,
  onReplyClick,
}) => {
  // Early return if required fields are missing
  if (!message?.id || (!message?.text && !message?.file && !message?.fileUrl)) {
    return null;
  }

  // Use fallbacks for missing fields
  const senderName = message.sender?.username || "Unknown";
  const avatarFallback = message.sender?.avatar || "https://ui-avatars.com/api/?name=Unknown";

  const [displayTime, setDisplayTime] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const tapTimer = React.useRef(null);

  useEffect(() => {
    if (message.timestamp) {
      const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      setDisplayTime(formattedTime);
    }
  }, [message.timestamp]);

  const handlePreview = (imageSrc) => {
    setPreviewImage(imageSrc);
    setIsPreviewVisible(true);
  };

  const handleCancel = () => {
    setIsPreviewVisible(false);
  };

  // Handle double-tap for reply
  const handleDoubleTap = () => {
    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
      tapTimer.current = null;
      onReply(message);
    } else {
      tapTimer.current = setTimeout(() => {
        tapTimer.current = null;
      }, 300);
    }
  };

  // Handle clicking the reply preview
  const handleReplyPreviewClick = () => {
    if (message.replyTo?.id && onReplyClick) {
      onReplyClick(message.replyTo.id);
    }
  };

  // Determine if this is a file-only message
  const isFileOnly = (message.file || message.fileUrl) && !message.text;

  // Accent and neutral colors (only apply accent if not file-only)
  const messageBg = isFileOnly 
    ? "bg-transparent" 
    : isMe ? "bg-client-accent text-white" : "bg-white/80 text-text-primary";
  
  const align = isMe ? "justify-end" : "justify-start";
  const borderRadius = isMe
    ? "rounded-t-xl rounded-bl-xl"
    : "rounded-t-xl rounded-br-xl";
  const margin = isMe ? "ml-12" : "mr-12";

  // Updated dropdown menu with delete options
  const menu = (
    <Menu>
      <Menu.Item
        key="reply"
        onClick={() => onReply(message)}
        icon={<FaReply />}
      >
        Reply
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="deleteForMe"
        onClick={() => onDeleteForMe(message.id)}
        className="text-red-500"
        icon={<DeleteOutlined />}
      >
        Delete for Me
      </Menu.Item>
      {isMe && (
        <Menu.Item
          key="deleteForEveryone"
          onClick={() => onDeleteForEveryone(message.id)}
          className="text-red-600 font-semibold"
          icon={<DeleteOutlined />}
        >
          Delete for Everyone
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isMe ? "justify-end" : "justify-start"} items-end relative group`}
      onDoubleClick={handleDoubleTap}
    >
      
      {!isMe && (
        <img
          src={avatar}
          alt={senderName}
          className="w-8 h-8 rounded-full mr-2 shadow"
        />
      )}

      {/* Main message container */}
      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}>
        {/* Reply preview */}
        
        {message.replyTo && (
          <div 
            className={`w-full mb-1 p-2 rounded-lg ${isMe ? "bg-client-accent/10" : "bg-white/10"} border ${isMe ? "border-client-accent/20" : "border-white/10"} cursor-pointer`}
            onClick={handleReplyPreviewClick}
          >
            <div className="text-xs text-client-accent">
              Replying to {message.replyTo.isMe ? "You" : message.replyTo.senderName || "User"}
            </div>
            {/* Render replied message content or file */}
            {message.replyTo.fileUrl ? (
              <div className="mt-1 flex items-center gap-2">
                {message.replyTo.fileUrl.endsWith(".jpg") || message.replyTo.fileUrl.endsWith(".png") ? (
                  <img
                    src={message.replyTo.fileUrl}
                    alt="Media preview"
                    className="w-10 h-10 rounded object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded">
                    <PaperClipOutlined className="text-lg" />
                  </div>
                )}
                <div className="text-sm truncate !text-text-muted">
                  {message.replyTo.text || message.replyTo.content || ""}
                </div>
              </div>
            ) : (
              <div className="text-sm truncate">
                {message.replyTo.text || "File"}
              </div>
            )}
          </div>
        )}

        {/* Message content */}
        <div className="flex gap-1 items-center w-full">
          {isMe && !(message.file || message.fileUrl) && (
            <Dropdown overlay={menu} trigger={['click']} placement="bottomLeft" arrow>
              <button
                type="button"
                className="p-2 w-8 h-8 flex items-center transition text-text-light opacity-0 group-hover:opacity-100 z-10 hover:bg-white/30 rounded-[999px]"
                tabIndex={0}
                aria-label="More actions"
              >
                <MoreOutlined rotate={90} />
              </button>
            </Dropdown>
          )}

          {message.text && (
            <div className={`
              px-4 py-2 
              ${isMe ? "bg-client-accent text-white" : "bg-white/80 text-text-primary"}
              ${isMe ? "rounded-t-xl rounded-bl-xl" : "rounded-t-xl rounded-br-xl"}
              shadow-sm transition
              ${highlight ? "ring-2 ring-client-accent bg-yellow-100/60 animate-pulse" : ""}
              max-w-full
            `}>
              <span className="block break-words">{message.text}</span>
            </div>
          )}
            
          {!isMe && !(message.file || message.fileUrl) && (
            <Dropdown overlay={menu} trigger={['click']} placement="bottomRight" arrow>
              <button
                type="button"
                className="p-2 w-8 h-8 flex items-center transition text-text-light opacity-0 group-hover:opacity-100 z-10 hover:bg-white/30 rounded-[999px]"
                tabIndex={0}
                aria-label="More actions"
              >
                <MoreOutlined rotate={90} />
              </button>
            </Dropdown>
          )}
        </div>


        {/* File attachments */}
        {(message.file || message.fileUrl) && (
          <div className="flex items-center gap-1 w-full">
            {isMe && (
              <Dropdown overlay={menu} trigger={['click']} placement="bottomLeft" arrow>
                <button
                  type="button"
                  className="p-2 w-8 h-8 flex items-center transition text-text-light opacity-0 group-hover:opacity-100 z-10 hover:bg-white/30 rounded-[999px]"
                  tabIndex={0}
                  aria-label="More actions"
                >
                  <MoreOutlined rotate={90} />
                </button>
              </Dropdown>
            )}

            <div className={`mt-2 ${isMe ? "bg-client-accent/10" : "bg-white/10"} p-3 rounded-lg border ${isMe ? "border-client-accent/20" : "border-white/10"} w-full`}>
              {/* Show progress indicator if uploading */}
              
              {message.status === "uploading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg">
                
                  <div className="w-8 h-8 border-4 border-client-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
              )}

              {/* Show file preview */}
              {message.file && !message.fileUrl ? (
                <>
                  {message.file.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(message.file)}
                      alt="Preview"
                      className="max-w-[300px] max-h-[300px] w-auto h-auto rounded-lg mb-2 cursor-pointer object-contain"
                      onClick={() => handlePreview(URL.createObjectURL(message.file))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                      <PaperClipOutlined className="text-lg" />
                      <span className="text-sm truncate">{message.file.name}</span>
                  {message.status === "uploading" && (
                        <div className="ml-2 w-4 h-4 border-2 border-client-accent border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                  )}
                </>
              ) : message.fileUrl && (
                <div className="relative flex items-center gap-2 w-full">
                  <a
                    href={message.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                    onClick={(e) => {
                      if (message.fileUrl.endsWith(".jpg") || message.fileUrl.endsWith(".png")) {
                        e.preventDefault();
                        handlePreview(message.fileUrl);
                      }
                    }}
                  >
                  {message.fileUrl.endsWith(".jpg") || message.fileUrl.endsWith(".png") ? (
                    <img
                      src={message.fileUrl}
                      alt="Uploaded"
                        className="max-w-[300px] max-h-[300px] w-auto h-auto rounded-lg cursor-pointer object-contain"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition">
                      <PaperClipOutlined className="text-lg" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {message.name || message.file?.name || "Download file"}
                        </div>
                        <div className="text-xs text-text-muted">
                          {message.file?.size ? formatFileSize(message.file.size) : "File"}
                        </div>
                      </div>
                      <DownloadOutlined className="text-blue-500" />
                    </div>
                  )}
                </a>
                </div>
              )}
                
            </div>
            {!isMe  && (
              <Dropdown overlay={menu} trigger={['click']} placement="bottomRight" arrow>
                <button
                  type="button"
                  className="p-2 w-8 h-8 flex items-center transition text-text-light opacity-0 group-hover:opacity-100 z-10 hover:bg-white/30 rounded-[999px]"
                  tabIndex={0}
                  aria-label="More actions"
                >
                  <MoreOutlined rotate={90} />
                </button>
              </Dropdown>
            )}
            </div>
          )}
            
        {/* Timestamp and status */}
        <div className={`flex items-center gap-1.5 mt-1 ${isMe ? "justify-end" : "justify-start"} text-xs text-text-muted`}>
          <span>{displayTime}</span>
          {isMe && <StatusIndicator status={message.status} />}
        </div>
      </div>
    </motion.div>
  );
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export default MessageItem;
