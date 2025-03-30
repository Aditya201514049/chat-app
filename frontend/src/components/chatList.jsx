import React, { useState, useEffect } from "react";
import { useSocket } from "../contexts/SocketContext";

const ChatList = ({ onChatSelect, selectedChatId, onAuthError }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const userId = localStorage.getItem("userId");
  
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
    
    // Initialize unread counts from localStorage if available
    try {
      const savedUnreadCounts = localStorage.getItem('unreadCounts');
      console.log("Loading saved unread counts:", savedUnreadCounts);
      
      if (savedUnreadCounts) {
        const parsedCounts = JSON.parse(savedUnreadCounts);
        console.log("Parsed unread counts:", parsedCounts);
        setUnreadCounts(parsedCounts);
      } else {
        console.log("No saved unread counts found");
        localStorage.setItem('unreadCounts', JSON.stringify({}));
      }
      
      // Initialize processed message IDs from localStorage
      let processedIds = [];
      try {
        const savedProcessedIds = localStorage.getItem('processedMessageIds');
        if (savedProcessedIds) {
          processedIds = JSON.parse(savedProcessedIds);
        }
      } catch (e) {
        console.error("Error parsing saved processed message IDs:", e);
      }
      
      // If processedIds doesn't exist or isn't an array, reset it
      if (!Array.isArray(processedIds)) {
        processedIds = [];
        localStorage.setItem('processedMessageIds', JSON.stringify(processedIds));
      }
    } catch (e) {
      console.error("Error initializing unread counts:", e);
      // Reset if there's an error
      localStorage.setItem('unreadCounts', JSON.stringify({}));
      localStorage.setItem('processedMessageIds', JSON.stringify([]));
    }
  }, []);
  
  // Save unread counts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('unreadCounts', JSON.stringify(unreadCounts));
  }, [unreadCounts]);
  
  // Reset unread count when a chat is selected
  useEffect(() => {
    if (selectedChatId) {
      console.log(`selectedChatId changed to ${selectedChatId}, clearing unread count`);
      
      setUnreadCounts(prev => {
        if (!prev[selectedChatId]) {
          return prev; // No change needed
        }
        
        const newCounts = { ...prev };
        delete newCounts[selectedChatId];
        
        // Save to localStorage
        localStorage.setItem('unreadCounts', JSON.stringify(newCounts));
        
        return newCounts;
      });
    }
  }, [selectedChatId]);
  
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
      
      // Get the chat ID
      const chatId = getChatUniqueId(updatedChat);
      if (!chatId) return;
      
      // Check if this update contains a new message and it's not from the current user
      if (updatedChat.lastMessageId && updatedChat.lastMessage) {
        // Skip message counting here - this is now handled in handleMessageReceived
        // to avoid double counting
        console.log(`Chat update contains message ${updatedChat.lastMessageId}, already handled by message event`);
      }
      
      setChatRooms((prevChats) => {
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
              ...(updatedChat.lastMessage && { lastMessage: updatedChat.lastMessage }),
              updatedAt: updatedChat.updatedAt || new Date().toISOString()
            }
          : {
              ...updatedChat,
              updatedAt: updatedChat.updatedAt || new Date().toISOString()
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
      
      // Handle different types of chatId (string or object)
      const chatId = typeof message.chatId === 'object' 
        ? message.chatId._id.toString() 
        : message.chatId.toString();
      
      console.log(`Processing message for chat ${chatId}, current user: ${userId}, selected chat: ${selectedChatId}`);
      
      // Increment unread count if this message is from another user and not the selected chat
      if (message.sender !== userId && chatId !== selectedChatId) {
        console.log(`Message from another user (${message.sender}) and not in selected chat (${selectedChatId})`);
        
        // Check if we've already processed this message ID to prevent double counting
        let processedMessageIds = [];
        try {
          const savedIds = localStorage.getItem('processedMessageIds');
          processedMessageIds = savedIds ? JSON.parse(savedIds) : [];
          if (!Array.isArray(processedMessageIds)) {
            processedMessageIds = [];
          }
        } catch (e) {
          console.error("Error parsing processed message IDs:", e);
          processedMessageIds = [];
        }
        
        console.log("Current processed message IDs:", processedMessageIds);
        
        if (message._id && !processedMessageIds.includes(message._id)) {
          console.log(`New message ${message._id} - incrementing counter`);
          
          // Add this message to processed list
          processedMessageIds.push(message._id);
          // Keep only the last 100 messages to prevent the list from growing too large
          while (processedMessageIds.length > 100) {
            processedMessageIds.shift();
          }
          localStorage.setItem('processedMessageIds', JSON.stringify(processedMessageIds));
          
          // Increment the counter
          setUnreadCounts(prev => {
            const newCounts = {
              ...prev,
              [chatId]: (prev[chatId] || 0) + 1
            };
            
            console.log(`Updated unread counts:`, newCounts);
            // Save to localStorage
            localStorage.setItem('unreadCounts', JSON.stringify(newCounts));
            
            return newCounts;
          });
        } else if (!message._id) {
          console.log(`Message has no ID - still incrementing counter`);
          
          // If message has no ID (rare case), we still count it but can't track it
          setUnreadCounts(prev => {
            const newCounts = {
              ...prev,
              [chatId]: (prev[chatId] || 0) + 1
            };
            
            console.log(`Updated unread counts:`, newCounts);
            // Save to localStorage
            localStorage.setItem('unreadCounts', JSON.stringify(newCounts));
            
            return newCounts;
          });
        } else {
          console.log(`Already processed message ${message._id} - skipping`);
        }
      } else {
        console.log(`Message is either from current user (${userId === message.sender}) or in selected chat (${chatId === selectedChatId}) - not incrementing counter`);
      }
      
      // Find the chat this message belongs to and move it to the top
      setChatRooms(prevChats => {
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
        
        // Update the chat with latest message preview
        const updatedChat = {
          ...chatToUpdate,
          lastMessage: message.content,
          updatedAt: new Date().toISOString()
        };
        
        // Return with the updated chat at the top
        return [
          updatedChat,
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
  }, [socket, userId, selectedChatId]);

  const handleChatSelect = (room) => {
    const chatId = getChatUniqueId(room);
    
    console.log(`Selecting chat ${chatId}, current unread counts:`, unreadCounts);
    
    if (unreadCounts[chatId]) {
      console.log(`Clearing unread count for chat ${chatId}`);
      
      // Clear unread count for this chat
      setUnreadCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[chatId];
        
        // Save to localStorage
        localStorage.setItem('unreadCounts', JSON.stringify(newCounts));
        
        return newCounts;
      });
    }
    
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
            [...new Map(chatRooms.map(room => [getChatUniqueId(room), room])).values()].map((room) => {
              const chatId = getChatUniqueId(room);
              const unreadCount = unreadCounts[chatId] || 0;
              
              return (
                <div
                  key={chatId}
                  className={`p-3 border-b border-gray-100 flex items-center cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedChatId === room._id
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  } ${isDeletedUser(room.otherUser) ? "opacity-60" : ""}`}
                  onClick={() => handleChatSelect(room)}
                >
                  <div className={`relative flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-blue-500 mr-3 ${
                    isDeletedUser(room.otherUser) ? "bg-gray-200" : "bg-blue-100"
                  }`}>
                    <span className="font-semibold">
                      {room.otherUser?.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                    
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
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
                      
                      {unreadCount > 0 && (
                        <span className="ml-1 text-xs text-white bg-blue-500 rounded-full px-2 py-0.5 font-bold">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500 truncate max-w-[70%]">
                        {room.lastMessage || room.otherUser?.email || "No messages yet"}
                      </p>
                      {room.updatedAt && (
                        <span className="text-xs text-gray-400">
                          {new Date(room.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
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
