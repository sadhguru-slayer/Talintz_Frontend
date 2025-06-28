import { useEffect, useRef } from "react";
import Cookies from "js-cookie";

export default function useUserSocket(userId, onConversationUpdate) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const token = Cookies.get("accessToken");
    const wsUrl = `wss://talintzbackend-production.up.railway.app/ws/user/${userId}/?token=${token}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("User WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "file_uploaded") {
        // Handle file upload notification
        onConversationUpdate?.({
          type: "file_uploaded",
          file_url: data.file_url,
          message_id: data.message_id,
          sender_id: data.sender_id,
          conversation_id: data.conversation_id,
        });
      } else if (data.type === "user_conversation_update") {
        // console.log("Came in")
        onConversationUpdate && onConversationUpdate(data);
      }
    };

    socket.onclose = () => {
      console.log("User WebSocket disconnected");
    };

    socketRef.current = socket;
    return () => {
      console.log("useUserSocket UNMOUNT", userId);
      socket.close();
    };
  }, [userId, onConversationUpdate]);
}
