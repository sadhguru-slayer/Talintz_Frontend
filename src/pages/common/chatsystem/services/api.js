import axios from "axios";
import Cookies from "js-cookie";

const API_BASE = "http://127.0.0.1:8000/api"; // adjust if your API base is different

export async function createConversationAndSendMessage(currentUserId, userId, text) {
  const token = Cookies.get("accessToken");
  const res = await axios.post(
    `${API_BASE}/chat/create_conversation_and_send_message/`,
    {
      user2_id: userId,
      text,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data; // { conversation, message }
}

// You can also add other chat-related API functions here
export default {
  createConversationAndSendMessage,
  // ...other functions
};
