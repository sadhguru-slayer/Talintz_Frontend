// Usemessages
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

// Dummy messages for each conversation
const DUMMY_MESSAGES = {
  1: [
    { id: 1, sender: "me", text: "Hey John, how's the project going?", time: "09:00" },
    { id: 2, sender: "John Doe", text: "Great! Just finished the UI.", time: "09:01" },
    { id: 3, sender: "me", text: "Awesome, send the files when ready.", time: "09:02" },
    { id: 4, sender: "John Doe", text: "Great! Just finished the UI.", time: "09:01" },
    { id: 5, sender: "me", text: "Awesome, send the files when ready.", time: "09:02" },
    { id: 6, sender: "me", text: "Awesome, send the files when ready.", time: "09:02" },
  ],
  2: [
    { id: 1, sender: "Jane Smith", text: "Sent the files!", time: "10:00" },
    { id: 2, sender: "me", text: "Received, thanks Jane!", time: "10:01" },
    { id: 3, sender: "Jane Smith", text: "Let me know if you need changes.", time: "10:02" },
  ],
  3: [
    { id: 1, sender: "Team Alpha", text: "Let's schedule a call.", time: "Yesterday" },
    { id: 2, sender: "me", text: "How about 3pm today?", time: "Yesterday" },
    { id: 3, sender: "Team Alpha", text: "Works for us!", time: "Yesterday" },
  ],
};
export default function useMessages(conversationId, userId, role) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    if (!conversationId || conversationId.toString().startsWith("temp-")) {
      setMessages([]);
      setLoading(false);
      return;
    }
    // console.log(conversationId)
    const fetchMessages = async () => {
      setLoading(true);
      // console.log(conversationId)
      try {
        const token = Cookies.get("accessToken");
        const response = await axios.get(
          `http://127.0.0.1:8000/api/chat/conversations/${conversationId}/messages/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response?.data || !Array.isArray(response.data)) {
          console.error("Invalid response format:", response);
          setMessages([]);
          return;
        }

        const mapped = response.data
          .filter(msg => msg && (msg.content || msg.file))
          .map((msg) => {
            // Handle file URL construction
            // console.log(msg)
            let fileUrl = null;
            if (msg.file) {
              fileUrl = msg.file.startsWith("http") 
                ? msg.file 
                : `http://127.0.0.1:8000${msg.file}`;
            }

            return {
              id: msg.id,
              sender: msg.sender?.username || msg.sender,
              senderId: msg.sender?.id || null,
              senderName: msg.sender?.first_name
                ? `${msg.sender.first_name} ${msg.sender.last_name}`.trim()
                : msg.sender?.username || msg.sender,
              text: msg.content,
              time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              avatar: msg.sender?.avatar || null,
              status: msg.status,
              fileUrl: fileUrl,
              file: msg.file ? { name: msg.file.split('/').pop() } : null, // Add file object for UI
              isMe: msg.sender?.id === Number(userId),
              replyTo: msg.reply_to ? {
                id: msg.reply_to.id,
                text: msg.reply_to.content,
                fileUrl: msg.reply_to.file 
                  ? (msg.reply_to.file.startsWith("http") 
                    ? msg.reply_to.file 
                    : `http://127.0.0.1:8000${msg.reply_to.file}`)
                  : null,
                senderName: msg.reply_to.sender?.first_name
                  ? `${msg.reply_to.sender.first_name} ${msg.reply_to.sender.last_name}`.trim()
                  : msg.reply_to.sender?.username || msg.reply_to.sender,
                isMe: msg.reply_to.sender?.id === Number(userId),
              } : null,
            };
          });
          // console.log(mapped)
        setMessages(mapped);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId, userId]);

  return { messages, loading };
}