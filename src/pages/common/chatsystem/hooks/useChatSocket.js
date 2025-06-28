import { useEffect, useRef } from "react";
import Cookies from "js-cookie";

export default function useChatSocket(conversationId, onMessage, currentUserId) {
  const socketRef = useRef(null);
  const messageQueueRef = useRef([]);
  const isConnectingRef = useRef(false);
  const token = Cookies.get("accessToken");

  const connectWebSocket = () => {
    if (isConnectingRef.current || !conversationId) return;

    isConnectingRef.current = true;
    const wsUrl = `wss://talintzbackend-production.up.railway.app/ws/chat/${conversationId}/?token=${token}`;

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected");
      isConnectingRef.current = false;
      // Send queued messages
      messageQueueRef.current.forEach(msg => socket.send(msg));
      messageQueueRef.current = [];
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);

      if (data.type === "file_uploaded") {
        const newMessage = {
          id: data.sender_id === currentUserId ? data.message_id || data.temp_id : data.id,
          text: data.content || "",
          name: data.name || "",
          fileUrl: data.file_url,
          tempId: data.temp_id,
          senderId: data.sender_id || data.sender?.id,
          sender: {
            id: data.sender_id || data.sender?.id,
            username: data.sender?.username || "Unknown",
            avatar: data.avatar || data.sender?.avatar || "https://ui-avatars.com/api/?name=Unknown",
          },
          isMe: data.sender_id === currentUserId || data.sender?.id === currentUserId,
          status: "delivered",
          timestamp: data.created_at || new Date().toISOString(),
          type: "file_uploaded",
          conversation_id: data.conversation_id,
          replyTo: data.reply_to,
        };

        onMessage?.(newMessage);
      } else if (data.type === "seen") {
        onMessage?.({
          type: "seen",
          message_id: data.message_id,
          user_id: data.user_id,
        });
      } else if (data.type === "message_deleted") {
        onMessage?.({
          type: "message_deleted",
          message_id: data.message_id,
          deleted_for_everyone: data.deleted_for_everyone,
        });
      } else {
        onMessage?.({
          ...data,
          sender: {
            id: data.sender_id || data.sender?.id,
            username: data.sender?.username || "Unknown",
            avatar: data.avatar || data.sender?.avatar || "https://ui-avatars.com/api/?name=Unknown",
          },
          replyTo: data.reply_to,
        });
      }
    };

    socket.onclose = (event) => {
      console.log("WebSocket disconnected, reconnecting...");
      isConnectingRef.current = false;
      // Reconnect after a delay
      setTimeout(connectWebSocket, 3000); // Reconnect after 3 seconds
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      // Reconnect on error
      setTimeout(connectWebSocket, 3000);
    };

    socketRef.current = socket;
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [conversationId, onMessage, currentUserId, token]);

  const sendMessage = (message, files, tempId, replyToId) => {
    console.log("Sending payload:", { message, files, tempId, replyToId }); // Debug log
    const payload = JSON.stringify({
      message,
      files,
      temp_id: tempId,
      reply_to_id: replyToId,
    });
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(payload);
    } else {
      console.log("WebSocket not open. Queuing message.");
      messageQueueRef.current.push(payload);
    }
  };

  const sendSeen = (messageIds) => {
    if (!messageIds?.length) return;
    const payload = JSON.stringify({ type: "seen", message_ids: messageIds });
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(payload);
    } else {
      console.log("WebSocket not open. Queuing 'seen' event.");
      messageQueueRef.current.push(payload);
    }
  };

  return { sendMessage, sendSeen };
}
