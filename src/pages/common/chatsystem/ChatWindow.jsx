import React, { useEffect, useState, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatSkeleton from "./ChatSkeleton";
import useMessages from "./hooks/useMessages";
import { PushpinOutlined, UpOutlined, DownOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import ChatDetailsSider from "./ChatDetailsSider";
import useChatSocket from "./hooks/useChatSocket";
import Cookies from "js-cookie";
import axios from "axios";
import { motion, AnimatePresence } from 'framer-motion';


const MIN_SKELETON_TIME = 250; // ms

const ChatWindow = ({ conversation, pinnedMessages, handlePinMessage, isMobile, onBack,userId, role }) => {
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showPins, setShowPins] = useState(true);
  const lastConvId = useRef(null);
  const timerRef = useRef(null);
  const { messages: initialMessages, loading: apiLoading } = useMessages(conversation?.id, userId, role);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const chatWindowRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);

  const handleIncomingMessage = (msg) => {
    if (msg.type === "message_deleted") {
      setMessages((prev) => prev.filter((m) => m.id !== msg.message_id));
      return;
    }


    if (msg.type === "file_uploaded") {
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== msg.tempId && m.id !== msg.id);
        return [
          ...filtered,
          {
            id: msg.id,
            text: msg.text || "",
            name: msg.name || "",
            fileUrl: msg.fileUrl,
            sender: {
              id: msg.senderId,
              username: msg.sender?.username || "Unknown",
              avatar: msg.avatar || msg.sender?.avatar || "https://ui-avatars.com/api/?name=Unknown",
            },
            senderId: msg.senderId,
            isMe: msg.senderId === Number(userId),
            status: "delivered",
            timestamp: msg.timestamp,
            type: "file_uploaded",
            conversation_id: msg.conversation_id,
            replyTo: msg.replyTo,
          },
        ];
      });
      return;
    }

    // Handle other message types (unchanged)
    if (msg.sender?.id === userId || msg.sender_id === userId) {
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== msg.temp_id);
        return [
          ...filtered,
          {
            ...msg,
            text: msg.content,
            isMe: true,
            status: "delivered",
            senderId: msg.sender?.id || msg.sender_id,
            timestamp: msg.created_at,
            replyTo: msg.reply_to,
          },
        ];
      });
    } else {
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== msg.id);
        return [
          ...filtered,
          {
            id: msg.id,
            text: msg.content,
            sender: {
              id: msg.sender?.id || msg.sender_id,
              username: msg.sender?.username || "Unknown",
              avatar: msg.avatar || msg.sender?.avatar || "https://ui-avatars.com/api/?name=Unknown",
            },
            senderId: msg.sender?.id || msg.sender_id,
            isMe: false,
            status: "delivered",
            timestamp: msg.created_at,
            replyTo: msg.reply_to,
          },
        ];
      });
    }
  };

  const { sendMessage, sendSeen } = useChatSocket(conversation?.id, handleIncomingMessage, userId);
  // console.log(sendSeen,sendMessage)
  const handleSendMessage = (message) => {
    // Optimistically update the UI
    setMessages((prev) => {
      const existingIndex = prev.findIndex((m) => m.id === message.id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...message };
        return updated;
      }
      return [...prev, message];
    });

    // Send the message via WebSocket
    if (message.status === "sending" || message.status === "delivered") {
      sendMessage(
        message.text,
        message.fileUrl || null,
        message.id,
        message.reply_to_id
      );
    }
  };

  useEffect(() => {
    if (!conversation) return;

    // Only show skeleton if the conversation ID has changed AND api is loading
    if (lastConvId.current !== conversation.id && apiLoading) {
      setShowSkeleton(true);

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        setShowSkeleton(false);
        lastConvId.current = conversation.id;
      }, MIN_SKELETON_TIME);
    } else if (!apiLoading) {
      // If API is not loading, ensure skeleton is hidden
      setShowSkeleton(false);
      lastConvId.current = conversation.id;
    }
  }, [conversation?.id, apiLoading]);

  useEffect(() => {
    if (apiLoading) {
      setLoading(true);
    } else {
      setMessages(initialMessages);
      setLoading(false);
    }
  }, [apiLoading, initialMessages, conversation?.id]);

  const alreadySentSeen = useRef(new Set()); // To avoid duplicate sends

  useEffect(() => {
    if (!messages || !userId || !sendSeen) return;

    const toBeSeen = messages
      .filter(
        (msg) =>
          msg.senderId !== Number(userId) &&
          msg.status === "delivered" &&
          !alreadySentSeen.current.has(msg.id)
      )
      .map((msg) => msg.id);

    if (toBeSeen.length > 0) {
      sendSeen(toBeSeen);
      toBeSeen.forEach((id) => alreadySentSeen.current.add(id));
    }
  }, [messages, userId, sendSeen]);

  // Handler for setting reply
  const handleReply = (message) => {
    console.log("Replying to message:", message.id); // Debug log
    setReplyingTo(message);
  };

  // Handler for canceling reply
  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleDeleteForMe = async (messageId) => {
    try {
      const token = Cookies.get("accessToken");
      await axios.post(
        `http://127.0.0.1:8000/api/chat/messages/${messageId}/delete_for_me/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Optimistically update UI
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      console.error("Delete for me failed:", err);
    }
  };

  const handleDeleteForEveryone = async (messageId) => {
    try {
      // Optimistically remove the message from the UI
      setMessages(prev => prev.filter(msg => msg.id !== messageId));

      const token = Cookies.get("accessToken");
      await axios.post(
        `http://127.0.0.1:8000/api/chat/messages/${messageId}/delete_for_everyone/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Delete for everyone failed:", err);
      // Optionally revert the UI change if the request fails
      // (not implemented here for simplicity)
    }
  };

  if (!conversation) {
    return (
      <section className="chat-window flex-1 flex items-center justify-center text-text-muted">
        <span>Select a chat to start messaging</span>
      </section>
    );
  }

  if (showSkeleton) {
    return <ChatSkeleton />;
  }

  // Always treat pinnedIds as an array
  const rawPinned = pinnedMessages[conversation.id];
  const pinnedIds = Array.isArray(rawPinned)
    ? rawPinned
    : rawPinned
      ? [rawPinned]
      : [];
  const pinnedMsgs = messages.filter((m) => pinnedIds.includes(m.id));

  // Handler for clicking a pin
  const handlePinClick = (msgId) => {
    setHighlightedMessageId(msgId);
    // Remove highlight after 1.5s
    setTimeout(() => setHighlightedMessageId(null), 1500);
  };


  return (
    <section
      ref={chatWindowRef}
      className="chat-window flex-1 flex flex-col h-full min-h-0 relative"
    >
      <ChatHeader
        conversation={conversation}
        onShowDetails={() => setShowDetails(true)}
        isMobile={isMobile}
        onBack={onBack}
      />
      <ChatDetailsSider
        open={showDetails}
        onClose={() => setShowDetails(false)}
        conversation={conversation}
        files={files}
        getContainer={() => chatWindowRef.current}
      />
      {/* Pinned Messages Section */}
      {pinnedMsgs.length > 0 && (
        <div className="bg-client-accent/10 border-b border-client-accent px-4 py-1">
          <button
            className="flex items-center gap-2 text-client-accent font-semibold text-xs focus:outline-none"
            onClick={() => setShowPins((v) => !v)}
          >
            <PushpinOutlined />
            Pinned
            {showPins ? <UpOutlined /> : <DownOutlined />}
            <span className="ml-1 text-[10px] text-client-accent/60">
              {pinnedMsgs.length}
            </span>
          </button>
          {showPins && (
            <div className="mt-1 max-h-20 overflow-y-auto space-y-1">
              {pinnedMsgs.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-center gap-2 bg-white/10 rounded px-2 py-1 text-xs cursor-pointer"
                  onClick={() => handlePinClick(msg.id)}
                  title="Jump to message"
                >
                  <span className="flex-1 text-text-light/80 truncate">
                    {msg.text}
                  </span>
                  <button
                    className="text-[10px] text-red-500 hover:underline"
                    onClick={e => {
                      e.stopPropagation();
                      handlePinMessage(conversation.id, msg.id);
                    }}
                  >
                    Unpin
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Message List */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <MessageList
          conversation={conversation}
          pinnedMessages={pinnedMessages}
          onPinMessage={handlePinMessage}
          highlightedMessageId={highlightedMessageId}
          userId={userId}
          role={role}
          messages={messages}
          loading={loading}
          onReply={handleReply}
          onDeleteForMe={handleDeleteForMe}
          onDeleteForEveryone={handleDeleteForEveryone}
        />
      </div>
      <MessageInput
        conversation={conversation}
        onSend={handleSendMessage}
        replyingTo={replyingTo}
        onCancelReply={handleCancelReply}
      />
      
    </section>
  );
};

export default ChatWindow;
