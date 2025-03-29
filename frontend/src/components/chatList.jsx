import React, { useState, useEffect } from "react";
import { useSocket } from "../contexts/SocketContext";

const ChatList = ({ onChatSelect }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  
  // Get socket context
  const { socket } = useSocket();

  const fetchChatRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/chats/getchats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }

      const data = await response.json();
      setChatRooms(data);
      setError("");
    } catch (error) {
      console.error("Failed to fetch chat rooms", error);
      setError("Failed to load chats. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch of chat rooms
  useEffect(() => {
    fetchChatRooms();
  }, []);
  
  // Set up socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;
    
    // Listen for new chats
    const handleNewChat = (chat) => {
      console.log("New chat received:", chat);
      setChatRooms((prevChats) => {
        // Check if chat already exists to prevent duplicates
        const exists = prevChats.some(existingChat => existingChat._id === chat._id);
        if (exists) {
          // If chat exists, don't add it again
          return prevChats;
        }
        return [chat, ...prevChats];
      });
    };
    
    // Listen for chat updates (new messages, etc.)
    const handleChatUpdate = (updatedChat) => {
      console.log("Chat updated:", updatedChat);
      setChatRooms((prevChats) => {
        // Check if the chat exists in our list
        const chatExists = prevChats.some(c => c._id === updatedChat._id);
        
        if (!chatExists) {
          // If it's a new chat, add it to the list
          return [updatedChat, ...prevChats];
        }
        
        // Update the existing chat
        return prevChats.map(chat => {
          if (chat._id === updatedChat._id) {
            return { 
              ...chat, 
              ...updatedChat, 
              updatedAt: new Date() 
            };
          }
          return chat;
        // Sort chats by most recent activity
        }).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      });
    };
    
    // Listen for message received events to update the chat list
    const handleMessageReceived = (message) => {
      if (!message || !message.chatId) return;
      
      console.log("Message received in chatList:", message);
      
      // Find the chat this message belongs to and move it to the top
      setChatRooms(prevChats => {
        // Handle different types of chatId (string or object)
        const chatId = typeof message.chatId === 'object' ? message.chatId._id : message.chatId;
        
        // First check if we have this chat
        const chatExists = prevChats.some(c => c._id === chatId);
        if (!chatExists) {
          // If the chat doesn't exist in our list, we'll need to fetch it
          console.log("Chat not found in list, fetching chats");
          fetchChatRooms();
          return prevChats;
        }
        
        console.log("Updating chat position:", chatId);
        
        // Update the existing chat to move it to the top
        return prevChats.map(chat => {
          if (chat._id === chatId) {
            return { 
              ...chat, 
              updatedAt: new Date().toISOString() // Ensure date is in string format
            };
          }
          return chat;
        }).sort((a, b) => {
          // Parse dates for comparison
          const dateA = new Date(a.updatedAt || a.createdAt);
          const dateB = new Date(b.updatedAt || b.createdAt);
          return dateB - dateA;
        });
      });
    };
    
    // Set up listeners
    socket.on("new chat", handleNewChat);
    socket.on("chat updated", handleChatUpdate);
    socket.on("message received", handleMessageReceived);
    
    // Clean up listeners
    return () => {
      socket.off("new chat", handleNewChat);
      socket.off("chat updated", handleChatUpdate);
      socket.off("message received", handleMessageReceived);
    };
  }, [socket]);

  const handleChatSelect = (room) => {
    setSelectedChatId(room._id);
    onChatSelect(room);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-lg">Conversations</h2>
      </div>

      {error && (
        <div className="mx-4 mt-2 p-2 bg-red-100 text-red-800 rounded-md text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {chatRooms.length > 0 ? (
            chatRooms.map((room) => (
              <div
                key={room._id}
                className={`p-3 border-b border-gray-100 flex items-center cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChatId === room._id
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : ""
                }`}
                onClick={() => handleChatSelect(room)}
              >
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                  <span className="font-semibold">
                    {room.otherUser?.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {room.otherUser?.name || "Unknown User"}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {room.otherUser?.email || "No email"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500 text-sm">
                Your chats will appear here
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Find friends to start chatting
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatList;
