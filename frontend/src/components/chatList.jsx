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

  // Helper function to get a unique ID for each chat
  const getChatUniqueId = (chat) => {
    if (!chat || !chat._id) return null;
    return chat._id.toString();
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
        // Always check by ID to prevent duplicates
        const chatId = getChatUniqueId(chat);
        if (!chatId) return prevChats;
        
        // Remove any existing duplicates first
        const filteredChats = prevChats.filter(existingChat => 
          getChatUniqueId(existingChat) !== chatId
        );
        
        // Add the new chat at the beginning
        return [
          {...chat, updatedAt: new Date().toISOString()}, 
          ...filteredChats
        ];
      });
    };
    
    // Listen for chat updates (new messages, etc.)
    const handleChatUpdate = (updatedChat) => {
      console.log("Chat updated:", updatedChat);
      
      // First verify we have complete necessary data
      if (!updatedChat || !updatedChat._id) {
        console.error("Received invalid chat update:", updatedChat);
        return;
      }
      
      setChatRooms((prevChats) => {
        const chatId = getChatUniqueId(updatedChat);
        if (!chatId) return prevChats;
        
        // Remove any duplicates first
        const filteredChats = prevChats.filter(chat => 
          getChatUniqueId(chat) !== chatId
        );
        
        // Find if chat exists in our filtered list
        const existingChat = prevChats.find(chat => getChatUniqueId(chat) === chatId);
        
        // Prepare the updated chat
        const updatedChatObj = existingChat 
          ? {
              ...existingChat,
              // Only copy properties that exist in the update
              ...(updatedChat.sender && { sender: updatedChat.sender }),
              ...(updatedChat.recipient && { recipient: updatedChat.recipient }),
              ...(updatedChat.otherUser && { otherUser: updatedChat.otherUser }),
              updatedAt: new Date().toISOString()
            }
          : {
              ...updatedChat,
              updatedAt: new Date().toISOString()
            };
        
        // Add at the beginning and sort by date
        return [updatedChatObj, ...filteredChats].sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt);
          const dateB = new Date(b.updatedAt || b.createdAt);
          return dateB - dateA;
        });
      });
    };
    
    // Listen for message received events to update the chat list
    const handleMessageReceived = (message) => {
      if (!message || !message.chatId) return;
      
      console.log("Message received in chatList:", message);
      
      // Find the chat this message belongs to and move it to the top
      setChatRooms(prevChats => {
        // Handle different types of chatId (string or object)
        const chatId = typeof message.chatId === 'object' 
          ? message.chatId._id.toString() 
          : message.chatId.toString();
        
        // Remove any duplicates first
        const filteredChats = prevChats.filter(chat => 
          getChatUniqueId(chat) !== chatId
        );
        
        // Find the chat to update
        const chatToUpdate = prevChats.find(chat => getChatUniqueId(chat) === chatId);
        
        if (!chatToUpdate) {
          // If the chat doesn't exist in our list, we'll need to fetch all chats
          console.log("Chat not found in list, fetching chats");
          fetchChatRooms();
          return prevChats;
        }
        
        console.log("Updating chat position:", chatId);
        
        // Return with the updated chat at the top
        return [
          { ...chatToUpdate, updatedAt: new Date().toISOString() },
          ...filteredChats
        ];
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
            // Use a Set-based approach to remove any duplicate IDs
            [...new Map(chatRooms.map(room => [getChatUniqueId(room), room])).values()].map((room) => (
              <div
                key={getChatUniqueId(room)}
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
