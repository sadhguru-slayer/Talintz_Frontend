import React from "react";
import { Drawer } from "antd";

const ChatDetailsSider = ({ open, onClose, conversation, files, getContainer }) => {
  if (!conversation) return null;
  return (
    <Drawer
      title="Conversation Details"
      placement="right"
      onClose={onClose}
      open={open}
      width={340}
      className="chat-details-sider bg-white/10 backdrop-blur-xl border-l border-white/10 shadow-xl"
      bodyStyle={{ padding: 0, height: "100%", display: "flex", flexDirection: "column" }}
      style={{ height: "100%" }}
      getContainer={getContainer}
      mask={false}
    >
      <div className="flex flex-col h-full">
        {/* User/Conversation Info */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={conversation.avatar}
              alt={conversation.name}
              className="w-12 h-12 rounded-full object-cover border border-white/20 shadow"
            />
            <div>
              <div className="font-bold text-client-accent text-lg">{conversation.name}</div>
              <div className="text-xs text-text-muted">
                {conversation.lastActive ? `Last active ${conversation.lastActive}` : 'Online'}
              </div>
            </div>
          </div>
          {/* Add more user info here if needed */}
        </div>

        {/* Shared Files */}
        <div className="p-4 flex-1 min-h-0">
          <div className="font-semibold text-sm mb-2 text-text-muted">Shared Files</div>
          <div className="space-y-2 max-h-full overflow-y-auto">
            {files && files.length > 0 ? (
              files.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white/10 rounded px-2 py-1 text-xs">
                  <span className="truncate flex-1">{file.name}</span>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-client-accent underline"
                    download
                  >
                    Download
                  </a>
                </div>
              ))
            ) : (
              <div className="text-xs text-text-muted">No files shared yet.</div>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default ChatDetailsSider;
