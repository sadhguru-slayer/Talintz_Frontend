import { useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";

// Dummy data for now
const DUMMY_CONVERSATIONS = [
  {
    id: 1,
    name: "John Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
    lastMessage: "Hey, how's the project going?",
    unread: 2,
    lastActive: "2m ago",
  },
  {
    id: 2,
    name: "Jane Smith",
    avatar: "https://i.pravatar.cc/150?img=2",
    lastMessage: "Sent the files!",
    unread: 0,
    lastActive: "10m ago",
  },
  {
    id: 3,
    name: "Team Alpha",
    avatar: "https://i.pravatar.cc/150?img=3",
    lastMessage: "Let's schedule a call.",
    unread: 5,
    lastActive: "1h ago",
    isGroup: true,
  },
];

export default function useConversations(userId, role, setConversations, setLoading) {
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("accessToken");
        const response = await axios.get("https://talintzbackend-production.up.railway.app/api/chat/conversations/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setConversations(response.data);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [userId, role, setConversations, setLoading]);

  const handleConversationUpdate = useCallback((data) => {
    setConversations((prev) => {
      const updated = {
        id: data.conversation_id,
        name: data.name || "Unknown",
        avatar: data.avatar || "https://ui-avatars.com/api/?name=Unknown",
        lastMessage: {
          id: data.last_message?.id,
          content: data.last_message?.content || data.last_message?.content_creator || "",
          created_at: data.last_message?.created_at,
          sender: data.last_message?.sender,
        },
        unread: data.unread ?? 0,
        lastActive: data.timestamp,
        isGroup: data.is_group,
        participants: data.participants,
      };
      const idx = prev.findIndex((c) => c.id === data.conversation_id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...updated };
        return copy;
      } else {
        return [updated, ...prev];
      }
    });
  }, [setConversations]);
}
