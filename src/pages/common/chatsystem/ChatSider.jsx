import React, { useState } from "react";
import ConversationList from "./ConversationList";
import Cookies from "js-cookie";
import { PlusOutlined, SearchOutlined, CloseOutlined } from "@ant-design/icons";
import { Select } from "antd";

const ChatSider = ({
  conversations,
  loading,
  selectedConversationId,
  setSelectedConversationId,
  isMobile,
  onCloseSider,
}) => {
  const [search, setSearch] = useState("");
  const role = Cookies.get("role");
  const isClient = role === "client";

  // Color classes
  const bgClass = isClient ? "bg-client-bg-card" : "bg-freelancer-bg-card";
  const borderClass = isClient ? "border-client-border-DEFAULT" : "border-freelancer-border-DEFAULT";
  const textClass = isClient ? "text-client-text-primary" : "text-freelancer-text-primary";
  const accentClass = isClient ? "bg-client-accent" : "bg-freelancer-accent";
  const accentGradient = isClient
    ? "from-client-accent/20 to-client-primary/10"
    : "from-freelancer-accent/20 to-freelancer-primary/10";

    const unreadCount = 3; // Replace with dynamic value if available

    const filterOptions = [
      { label: "All", value: "all" },
      {
        label: (
          <span>
            Unread
            {unreadCount > 0 && (
              <span className="ml-2 inline-block px-2 py-0.5 rounded-full bg-status-warning text-white text-[10px] font-semibold align-middle">
                {unreadCount}
              </span>
            )}
          </span>
        ),
        value: "unread",
      },
      { label: "Groups", value: "groups" },
      { label: "Direct", value: "direct" },
    ];

  const [filter, setFilter] = useState("all");

  return (
    <aside className={`
      chat-sider w-80 max-w-xs min-w-[18rem] h-full
      bg-white/5 backdrop-blur-sm border-r border-white/10
      flex flex-col shadow-card
      relative
    `}>
      {/* Subtle Accent Orb */}
      <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-xl z-0 bg-gradient-to-br ${accentGradient} opacity-20 pointer-events-none`} />

      {/* Header */}
      <div className="relative z-10 px-4 py-3 border-b border-white/10 flex items-center">
        <span className={`text-lg font-bold cred-font ${textClass}`}>Chats</span>
        <div className="flex-1" />
        {/* Close button for mobile, only if a conversation is selected */}
        {isMobile && selectedConversationId && (
          <button
            className="p-2 rounded-full hover:bg-white/20 transition"
            onClick={() => onCloseSider && onCloseSider()}
            title="Close"
          >
            <CloseOutlined className="text-client-accent" />
          </button>
        )}
        <Select
          value={filter}
          onChange={setFilter}
          options={filterOptions}
          size="small"
          bordered={false}
          className={`
            chat-filter-select custom-select
            ${textClass}
            h-8 flex items-center
          `}
          dropdownClassName="custom-dropdown"
          style={{
            color: "inherit",
            border: "none",
            boxShadow: "none",
            minWidth: 90,
            height: 32,
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
            fontWeight: 500,
            background: "rgba(255,255,255,0.08)",
          }}
          popupClassName="chat-filter-dropdown"
          dropdownMatchSelectWidth={false}
        />
      </div>

      {/* Search Bar */}
      <div className="relative z-10 px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center bg-white/10 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-client-accent transition">
          <SearchOutlined className="text-ui-disabled mr-2" />
          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
        <ConversationList
          conversations={conversations}
          loading={loading}
          search={search}
          selectedConversationId={selectedConversationId}
          setSelectedConversationId={setSelectedConversationId}
        />
      </div>

  </aside>
);
};

export default ChatSider;
