import React, { useState, useCallback, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import Cookies from "js-cookie";
import CSider from "../../../components/client/CSider";
import FSider from "../../../components/freelancer/FSider";
import CHeader from "../../../components/client/CHeader";
import FHeader from "../../../components/freelancer/FHeader";
import ChatSider from "./ChatSider";
import ChatHeader from "./ChatHeader";
import ChatWindow from "./ChatWindow";
import useConversations from "./hooks/useConversations";
import useUserSocket from "./hooks/useUserSocket";
import "./styles/chat.css";
import { useLocation } from "react-router-dom";

const ChatSystem = ({userId, role}) => {
  const location = useLocation();

  const isClient = role === "client";
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial conversations
  useConversations(userId, role, setConversations, setLoading);

  // Listen for conversation_update events
  useUserSocket(userId, (update) => {
    // Normalize the event to match your conversation object structure
    const normalized = {
      ...update,
      id: update.conversation_id,
      };
    setConversations(prev => {
      const idx = prev.findIndex(c => c.id === normalized.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...normalized };
        return updated;
      } else {
        return [normalized, ...prev];
      }
    });
  });

  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [pinnedMessages, setPinnedMessages] = useState({});
  const [mobileView, setMobileView] = useState("sider");

  // Set selectedConversationId from navigation state if present
  useEffect(() => {
    if (location.state && location.state.conversation_id) {
      setSelectedConversationId(location.state.conversation_id);
    }
  }, [location.state]);

  // Find the selected conversation object
  const selectedConversation = conversations.find(
    (conv) => conv.id === selectedConversationId
  );

  const handlePinMessage = (conversationId, messageId) => {
    setPinnedMessages((prev) => {
      const pins = prev[conversationId] || [];
      if (pins.includes(messageId)) {
        // Unpin
        return {
          ...prev,
          [conversationId]: pins.filter((id) => id !== messageId),
        };
      } else {
        // Pin
        return {
          ...prev,
          [conversationId]: [...pins, messageId],
        };
      }
    });
  };

  const handleSelectConversation = (id) => {
    setSelectedConversationId(id);
    if (isMobile) setMobileView("chat");
  };

  const handleBack = () => {
    if (isMobile) setMobileView("sider");
  };

  const showSider = !isMobile || (isMobile && mobileView === "sider");
  const showChatWindow = !isMobile || (isMobile && mobileView === "chat");

  return (
    <div className="flex h-screen bg-gradient-to-br from-client-primary via-client-secondary/10 to-client-bg-dark">
      {/* Talintz Sider */}
      {isClient ? (
        <CSider userId={userId} role={role} dropdown={false} collapsed={true} />
      ) : (
        <FSider userId={userId} role={role} dropdown={false} collapsed={true} />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Talintz Header */}
        {isClient ? (
          <CHeader userId={userId} />
        ) : (
          <FHeader userId={userId} isAuthenticated={true} isEditable={false} role={role} />
        )}
        <div className={` ${isMobile ? 'ml-0 mb-16':'ml-14'} flex flex-1 overflow-hidden`}>
          {/* Chat Sider */}
          {showSider && (
            <ChatSider
              conversations={conversations}
              loading={loading}
              userId={userId}
              role={role}
              selectedConversationId={selectedConversationId}
              setSelectedConversationId={handleSelectConversation}
              isMobile={isMobile}
              onCloseSider={() => setMobileView("chat")}
            />
          )}
          {/* Main Chat Area */}
          {showChatWindow && (
            <div className={`flex-1 flex flex-col bg-white/5 backdrop-blur-xl  shadow-xl overflow-hidden ${isMobile ? 'm-0 rounded-none' : 'm-4 rounded-2xl'} `}>
              <ChatWindow
                conversation={selectedConversation}
                pinnedMessages={pinnedMessages}
                handlePinMessage={handlePinMessage}
                isMobile={isMobile}
                onBack={handleBack}
                userId={userId}
                role={role}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSystem;
