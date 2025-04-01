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

  // Component for rendering individual chat items
  const ChatItem = ({ room, isSelected, handleSelect }) => {
    const otherUser = room.otherUser || {};
    const lastMessageText = room.lastMessage || "Start a conversation";
    const lastMessageDate = room.updatedAt ? new Date(room.updatedAt) : new Date();
    const timeString = formatTimeOrDate(lastMessageDate);
    const unreadCount = unreadCounts[getChatUniqueId(room)] || 0;
    const isDeleted = isDeletedUser(otherUser);
              
              return (
                <div
        onClick={() => handleSelect(room)}
        className={`card cursor-pointer transition-all hover:bg-base-200/70 ${
          isSelected ? 'bg-primary/10 border-l-4 border-primary shadow-md' : 'bg-base-100 hover:shadow-md shadow-sm'
        } mb-3 overflow-hidden`}
      >
        <div className="card-body p-3">
                    <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="avatar placeholder">
                <div className={`w-12 h-12 rounded-full ${
                  isDeleted 
                    ? 'bg-neutral/20 text-neutral-content' 
                    : 'bg-gradient-to-br from-primary to-secondary text-primary-content'
                } flex items-center justify-center`}>
                  <span className="text-lg font-bold">
                    {otherUser.name ? otherUser.name.charAt(0).toUpperCase() : "?"}
                          </span>
                      </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base-content truncate">
                  {isDeleted ? "Deleted User" : otherUser.name || "Unknown User"}
                </h3>
                <p className="text-sm text-base-content/70 truncate">
                  {lastMessageText}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between h-full">
              <span className="text-xs text-base-content/60 mb-1">
                {timeString}
              </span>
              {unreadCount > 0 && (
                <div className="badge badge-primary badge-sm">{unreadCount}</div>
              )}
            </div>
              </div>
            </div>
          </div>
              );
  };

  const formatTimeOrDate = (date) => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    // Same day
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } 
    // Yesterday
    else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } 
    // This week (show day name)
    else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } 
    // Older (show date)
    else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="h-full flex flex-col bg-base-100/50">
      {/* Error display */}
      {error && (
        <div className="alert alert-error m-3 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center flex-grow p-8">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      ) : chatRooms.length === 0 ? (
        <div className="flex flex-col justify-center items-center flex-grow p-8 text-center">
          <div className="mb-4 text-6xl opacity-30 bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">💬</div>
          <h3 className="text-lg font-semibold mb-2">No chats yet</h3>
          <p className="text-base-content/70">
            Start a conversation with a friend to begin chatting
              </p>
            </div>
      ) : (
        <div className="p-3 overflow-y-auto flex-grow">
          {chatRooms.map((room) => (
            <ChatItem
              key={getChatUniqueId(room)}
              room={room}
              isSelected={selectedChatId === getChatUniqueId(room)}
              handleSelect={handleChatSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList;
