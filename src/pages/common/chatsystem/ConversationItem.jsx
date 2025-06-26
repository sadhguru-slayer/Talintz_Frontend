import React from 'react'
import Cookies from 'js-cookie'

const ConversationItem = ({ conversation, isSelected, onClick }) => {
  const role = Cookies.get("role");
  const isClient = role === "client";
  const activeBg = isClient ? "hover:bg-client-secondary/40" : "hover:bg-freelancer-secondary/40";
  const unreadBg = isClient ? "bg-client-accent" : "bg-freelancer-accent";
console.log(conversation)
  return (
    <div
      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition
        ${isSelected ? "bg-client-accent/10" : "hover:bg-white/10"}
      `}
      onClick={onClick}
    >
      <img
        src={conversation.avatar}
        alt={conversation.name}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate text-text-light">{conversation.name}</div>
        <div className="text-xs text-text-muted truncate">
          {conversation.lastMessage?.content || ""}
        </div>
      </div>
      {conversation.unread > 0 && (
        <span className={`text-xs rounded-full px-2 py-0.5 ml-2 ${unreadBg} text-white`}>
          {conversation.unread}
        </span>
      )}
    </div>
  )
}

export default ConversationItem
