import React, { useState, useEffect } from "react";
import { useSocket } from "../contexts/SocketContext";

const ChatList = ({ onChatSelect, selectedChatId, onAuthError }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  
  // Get socket context
  const { socket } = useSocket();

  const fetchChatRooms = async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setLoading(false);
        if (onAuthError) onAuthError();
        return;
      }
      
      const response = await fetch(`${API_URL}/api/chats/getchats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // This indicates an authentication issue - could be invalid token,
        // expired token, or deleted user
        const errorData = await response.json();
        console.log("Auth error:", errorData);
        
        if (errorData.code === 'USER_NOT_FOUND') {
          setError("Your account appears to have been deleted. Please register again.");
        } else if (errorData.code === 'TOKEN_EXPIRED') {
          setError("Your session has expired. Please log in again.");
        } else {
          setError("Authentication failed. Please log in again.");
        }
        
        // Clear stored credentials
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        
        setChatRooms([]);
        
        if (onAuthError) onAuthError();
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }

      const data = await response.json();
      
      // Filter out any invalid chat data
      const validChats = data.filter(chat => 
        chat && chat._id && 
        (chat.otherUser || (chat.sender && chat.recipient))
      );
      
      setChatRooms(validChats);
    } catch (error) {
      console.error("Failed to fetch chat rooms", error);
      if (error.message === "Failed to fetch") {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Failed to load chats. Please try again.");
      }
      setChatRooms([]);
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
    onChatSelect(room);
  };

  // Function to check if otherUser is a deleted user
  const isDeletedUser = (otherUser) => {
    return !otherUser || otherUser.name === 'Deleted User' || otherUser.email === 'account-deleted';
  };

  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="mx-4 mt-2 p-2 bg-red-100 text-red-800 rounded-md text-sm">
          <p>{error}</p>
          <button 
            onClick={fetchChatRooms}
            className="mt-2 text-xs font-medium text-red-800 hover:underline"
          >
            Try Again
          </button>
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
                } ${isDeletedUser(room.otherUser) ? "opacity-60" : ""}`}
                onClick={() => handleChatSelect(room)}
              >
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-blue-500 mr-3 ${
                  isDeletedUser(room.otherUser) ? "bg-gray-200" : "bg-blue-100"
                }`}>
                  <span className="font-semibold">
                    {room.otherUser?.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {room.otherUser?.name || "Unknown User"}
                    </h3>
                    {isDeletedUser(room.otherUser) && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                        Deleted
                      </span>
                    )}
                  </div>
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
