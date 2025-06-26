import React from "react";

const ChatSkeleton = () => (
  <section className="chat-window flex-1 flex flex-col animate-pulse">
    {/* Header Skeleton */}
    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/5 min-h-[64px]">
      <div className="w-10 h-10 rounded-full bg-white/20" />
      <div className="flex-1">
        <div className="h-4 w-32 bg-white/20 rounded mb-2" />
        <div className="h-3 w-20 bg-white/10 rounded" />
      </div>
    </div>
    {/* Messages Skeleton */}
    <div className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
      {[...Array(5)].map((_, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"} items-end`}>
          {i % 2 !== 0 && <div className="w-8 h-8 rounded-full bg-white/20 mr-2" />}
          <div className="max-w-xs md:max-w-md">
            <div className="h-4 w-40 bg-white/20 rounded mb-2" />
            <div className="h-3 w-16 bg-white/10 rounded" />
          </div>
        </div>
      ))}
    </div>
    {/* Input Skeleton */}
    <div className="flex items-center gap-2 p-4 border-t border-white/10 bg-white/5">
      <div className="flex-1 h-10 bg-white/20 rounded-lg" />
      <div className="w-10 h-10 bg-white/20 rounded-lg" />
    </div>
  </section>
);

export default ChatSkeleton;
