import React, { useState, useRef } from "react";
import { SendOutlined, PaperClipOutlined, CloseOutlined, SmileOutlined } from "@ant-design/icons";
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import axios from "axios";
import Cookies from 'js-cookie'

const MAX_FILE_SIZE = 10 * 1024 * 1024 * 10; // 10MB
const uploadFile = async (file, onProgress, conversationId) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("conversation_id", conversationId);
  const token = Cookies.get('accessToken');

  try {
    const response = await axios.post("https://talintzbackend-production.up.railway.app/api/chat/messages/upload/", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    });
    console.log(response)
    return response;

  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};
const MessageInput = ({ conversation, onSend, replyingTo, onCancelReply }) => {
  const [value, setValue] = useState("");
  const [files, setFiles] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const fileInputRef = useRef();
  const inputRef = useRef();
  const socketRef = useRef();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!value.trim() && files.length === 0) return;

    if (files.length > 0) {
      setFiles([]);
      for (const file of files) {
        const tempId = `temp-file-${Date.now()}-${Math.random()}`;

        // Optimistically add the message
        onSend({
          id: tempId,
          text: value,
          file, // The actual File object for preview
          status: "uploading",
          progress: 0,
          isMe: true,
          timestamp: new Date().toISOString(),
          replyTo: replyingTo,
          reply_to_id: replyingTo?.id,
        });

        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("conversation_id", conversation.id);
          formData.append("temp_id", tempId);  // Pass temp_id to backend
          if (replyingTo?.id) formData.append("reply_to_id", replyingTo.id);

          const token = Cookies.get('accessToken');
          const res = await axios.post(
            "https://talintzbackend-production.up.railway.app/api/chat/messages/upload/",
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
              onUploadProgress: (progressEvent) => {
                // Update progress in the UI
                onSend({
                  id: tempId,
                  progress: Math.round((progressEvent.loaded * 100) / progressEvent.total),
                  status: "uploading",
                });
              },
            }
          );

          // Replace the optimistic message with the final one
          onSend({
            id: res.data.id,  // Use the actual ID from the backend
            temp_id: tempId,  // Include temp_id to identify the optimistic message
            text: value,
            fileUrl: res.data.file_url,
            status: "delivered",
            isMe: true,
            timestamp: new Date().toISOString(),
            replyTo: replyingTo,
            reply_to_id: replyingTo?.id,
          });
        } catch (error) {
          // Mark as failed
          onSend({
            id: tempId,
            status: "failed",
          });
        }
      }
      setValue("");
      onCancelReply();
      return;
    }

    // Handle text messages (unchanged)
    if (value.trim()) {
      onSend({
        id: `temp-${Date.now()}`,
        text: value,
        status: "sending",
        isMe: true,
        timestamp: new Date().toISOString(),
        replyTo: replyingTo,
        reply_to_id: replyingTo?.id,
      });
      setValue("");
      onCancelReply();
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter((file) => file.size <= MAX_FILE_SIZE);
    if (validFiles.length < selectedFiles.length) {
      alert("Some files were too large (max 10MB)");
    }
    setFiles((prev) => [...prev, ...validFiles]);
    e.target.value = null;
  };

  // Insert emoji at cursor position
  const handleEmojiSelect = (emoji) => {
    const emojiChar = emoji.native || emoji.colons || emoji;
    const input = inputRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    setValue((prev) => prev.slice(0, start) + emojiChar + prev.slice(end));
    setShowEmoji(false);
    // Move cursor after emoji
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + emojiChar.length, start + emojiChar.length);
    }, 0);
  };

  if (!conversation) return null;

  return (
    <form
      onSubmit={handleSend}
      className="flex flex-col gap-1 p-4 border-t border-white/10 bg-white/5"
    >
      {replyingTo && (
        
        <div className="flex items-center justify-between bg-white/5 rounded-t-lg p-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs text-client-accent">Replying to {replyingTo.isMe ? "You" : replyingTo.senderName}</span>
            <div className="text-xs !text-text-light max-w-xs">
              {replyingTo.text || (replyingTo.file ? "Media" : "File")}
            </div>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-text-muted hover:text-text-light"
          >
            <CloseOutlined />
          </button>
        </div>
      )}

      {/* File Previews */}
      {files.length > 0 && (
        <div className="flex gap-2 mb-1 max-h-24 overflow-y-auto px-1">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="relative flex flex-col items-center justify-center bg-white/10 rounded-md p-1"
              style={{ width: 56, height: 56, minWidth: 56, minHeight: 56 }}
            >
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="object-cover w-10 h-10 rounded"
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <span className="text-xs text-text-muted truncate w-full text-center">{file.name.split('.').pop().toUpperCase()}</span>
                  <span className="text-[10px] text-text-muted truncate w-full text-center">{file.name.length > 10 ? file.name.slice(0, 10) + "..." : file.name}</span>
                </div>
              )}
              <button
                type="button"
                className="absolute -top-1 -right-1 bg-white/80 rounded-full p-0.5 text-xs text-red-500 hover:bg-white"
                onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                title="Remove"
              >
                <CloseOutlined />
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Input Row */}
      <div className="flex items-center gap-2 relative">
        <button
          type="button"
          className="w-10 h-10 p-2 rounded-lg bg-white/10 text-client-accent hover:bg-white/20 transition"
          onClick={() => fileInputRef.current.click()}
          title="Attach file"
        >
          <PaperClipOutlined />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,application/pdf,.doc,.docx"
          multiple
        />
        {/* Emoji Button */}
        <button
          type="button"
          className="w-10 h-10 p-2 rounded-lg bg-white/10 text-client-accent hover:bg-white/20 transition"
          onClick={() => setShowEmoji((v) => !v)}
          title="Insert emoji"
        >
          <SmileOutlined />
        </button>
        {/* Emoji Picker Popover */}
        {showEmoji && (
          <div className="absolute bottom-12 left-0 z-50">
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              theme="light"
              previewPosition="none"
              searchPosition="none"
              style={{ borderRadius: 12, boxShadow: "0 4px 32px rgba(0,0,0,0.15)" }}
            />
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          className="flex-1 h-10 max-h-10 bg-transparent outline-none px-4 py-2 rounded-lg border border-white/10 text-text-light placeholder:text-text-muted"
          placeholder={`Message ${conversation.name}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          type="submit"
          className="w-10 h-10 p-2 rounded-lg bg-client-accent text-white hover:bg-client-accent/90 transition"
        >
          <SendOutlined />
        </button>
    </div>
    </form>
  );
};

export default MessageInput;
