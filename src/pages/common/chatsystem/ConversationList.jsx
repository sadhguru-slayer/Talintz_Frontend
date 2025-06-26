import React from "react";
import useConversations from "./hooks/useConversations";
import ConversationItem from "./ConversationItem";
import { Spin } from "antd";

const ConversationList = ({
  conversations = [],
  loading = false,
  search = "",
  selectedConversationId,
  setSelectedConversationId,
}) => {
  const filtered = conversations.filter((c) =>
    (c.name || "").toLowerCase().includes((search || "").toLowerCase())
  );
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin />
      </div>
    );
  }

  return (
    <div className="space-y-1 px-2 py-2">
      {filtered.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isSelected={selectedConversationId === conv.id}
          onClick={() => setSelectedConversationId(conv.id)}
        />
      ))}
    </div>
  );
};

export default ConversationList;
