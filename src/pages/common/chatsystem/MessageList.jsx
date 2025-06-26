import React, { useRef, useEffect, useState } from "react";
import MessageItem from "./MessageItem";
import { ArrowDownOutlined } from "@ant-design/icons";

const MessageList = ({
  conversation,
  pinnedMessages,
  onPinMessage = () => {},
  highlightedMessageId,
  userId,
  role,
  messages = [],
  loading = false,
  onReply,
  onDeleteForMe,
  onDeleteForEveryone,
}) => {

  const messageRefs = useRef({});
  const listRef = useRef(null);
  const [highlightedMessage, setHighlightedMessage] = useState(null);
  const [processedMessages, setProcessedMessages] = useState([]);

  // Deduplicate messages and store in state
  useEffect(() => {
    const uniqueMessages = [];
    const seenIds = new Set();
    
    messages.forEach(msg => {
      if (msg && msg.id && !seenIds.has(msg.id)) {
        seenIds.add(msg.id);
        uniqueMessages.push(msg);
      }
    });
    
    setProcessedMessages(uniqueMessages);
  }, [messages]);

  // Keep scrolled to bottom at all times
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [processedMessages]);

  // Handle reply click: scroll to the replied message and highlight it
  const handleReplyClick = (replyToId) => {
    const repliedMessageRef = messageRefs.current[replyToId];
    if (repliedMessageRef) {
      // Scroll to the replied message
      repliedMessageRef.scrollIntoView({ behavior: "smooth", block: "center" });

      // Highlight the message for 2 seconds
      setHighlightedMessage(replyToId);
      const highlightTimeout = setTimeout(() => {
        setHighlightedMessage(null);
      }, 2000);

      return () => clearTimeout(highlightTimeout);
    }
  };

  if (!conversation) return null;

  return (
    <div className="relative flex-1 overflow-y-auto h-full">
      <div
        ref={listRef}
        className="h-full px-4 py-6 space-y-2 bg-transparent custom-scrollbar"
        style={{ overflowY: 'auto' }}
      >
        {loading ? (
          <div className="text-center text-text-muted">Loading...</div>
        ) : (
          processedMessages.map((msg) => (
            <div key={msg.id} ref={(el) => (messageRefs.current[msg.id] = el)}>
              <MessageItem
                message={{ ...msg, sender: msg.isMe ? "me" : msg.sender }}
                isMe={msg.isMe}
                avatar={!msg.isMe ? msg.avatar || conversation.avatar : undefined}
                name={!msg.isMe ? msg.senderName || msg.sender : "You"}
                isPinned={(pinnedMessages[conversation.id] || []).includes(msg.id)}
                onPin={() => onPinMessage(conversation.id, msg.id)}
                onDeleteForMe={() => onDeleteForMe(msg.id)}
                onDeleteForEveryone={() => onDeleteForEveryone(msg.id)}
                highlight={highlightedMessage === msg.id || highlightedMessageId === msg.id}
                onReply={onReply}
                onReplyClick={handleReplyClick}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MessageList;
