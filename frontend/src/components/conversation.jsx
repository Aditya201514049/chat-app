import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";

const Conversation = ({ chatId, onBack, chatName, hasJoinedRoom, onAuthError, onChatIdChanged }) => {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const userId = localStorage.getItem("userId");
  
  // Get socket context
  const { socket, isConnected, joinChatRoom, startTyping, stopTyping } = useSocket();

  // Add a ref to track the current chat
  const currentChatIdRef = useRef(null);

  // Fetch the chat data
  const fetchChatData = async (id) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        if (onAuthError) onAuthError();
        return null;
      }
      
      console.log(`Fetching chat data for: ${id}`);
      const response = await fetch(`${API_URL}/api/chats/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        console.error("Authentication error while fetching chat data");
        if (onAuthError) onAuthError();
        return null;
      }
      
      if (!response.ok) {
        console.error(`Error fetching chat data: ${response.status}`);
        return null;
      }
      
      const chatData = await response.json();
      console.log("Fetched chat data:", chatData);
      setActiveChat(chatData);
      return chatData;
    } catch (error) {
      console.error("Error fetching chat data:", error);
      return null;
    }
  };

  // Fetch chat data when chatId changes
  useEffect(() => {
    if (chatId) {
      fetchChatData(chatId);
    }
  }, [chatId]);

  const fetchMessages = async () => {
    setError("");
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        if (onAuthError) onAuthError();
        return [];
      }
      
      console.log(`Fetching messages for chat: ${chatId}`);
      const response = await fetch(`${API_URL}/api/chats/messages/${chatId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // This indicates an authentication issue
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
        
        if (onAuthError) onAuthError();
        return [];
      }

      if (!response.ok) {
        if (response.status === 404) {
          setError("Chat not found. It may have been deleted.");
        } else {
          throw new Error("Failed to fetch messages");
        }
        return [];
      }

      const data = await response.json();
      console.log(`Fetched ${data.length} messages for chat: ${chatId}`);
      
      // Update messages but don't replace any pending messages
      setMessages(prevMessages => {
        // Filter out pending messages for this chat
        const pendingMessages = prevMessages.filter(
          msg => msg.chatId === chatId && msg.pending
        );
        
        // If we have pending messages, keep them and add new ones
        if (pendingMessages.length > 0) {
          // Get messages from the server that aren't duplicates of our pending ones
          const newMessages = data.filter(serverMsg => 
            !pendingMessages.some(pendingMsg => 
              pendingMsg.content === serverMsg.content && 
              pendingMsg.sender === serverMsg.sender
            )
          );
          
          // Combine both, with pending messages at the end
          return [...newMessages, ...pendingMessages];
        }
        
        // Otherwise just use the data from the server
        return data;
      });
      
      setInitialFetchComplete(true);
      return data; // Return the messages for potential future use
    } catch (err) {
      console.error("Error fetching messages:", err);
      if (err.message === "Failed to fetch") {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Failed to load messages. Please try again.");
      }
      setInitialFetchComplete(true);
      // Re-throw so the promise rejection is passed to the caller
      throw err;
    }
  };

  // Update when activeChat changes (e.g., after fetching data)
  useEffect(() => {
    if (activeChat) {
      console.log("Active chat updated:", activeChat);
      
      // If we're getting the information later from the Friends page selection
      // Make sure we update the HomePage2 selectedChat state
      if (window.updateSelectedChat && typeof window.updateSelectedChat === 'function') {
        window.updateSelectedChat(activeChat);
      }
    }
  }, [activeChat]);

  // Fetch messages when chat changes
  useEffect(() => {
    if (!chatId) return;
    
    // Only fetch if this is a different chat than we already have
    if (currentChatIdRef.current !== chatId || !initialFetchComplete) {
      currentChatIdRef.current = chatId;
      
      // Used a ref to track initial loading to avoid infinite loops
      const shouldShowLoading = messages.filter(m => m.chatId === chatId).length === 0;
      
      if (shouldShowLoading) {
        setLoading(true);
      }
      
      fetchMessages()
        .then(() => {
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [chatId, initialFetchComplete]); // Only depend on chatId and initialFetchComplete
  
  // Join the chat room when chat changes or connection status changes
  useEffect(() => {
    if (chatId && isConnected) {
      console.log(`Chat ID changed or connection status changed. Joining room: ${chatId}`);
      joinChatRoom(chatId);
    }
  }, [chatId, isConnected, joinChatRoom]);

  // Re-fetch messages if we have joined the room and initial fetch was not complete
  useEffect(() => {
    if (hasJoinedRoom && chatId && !initialFetchComplete) {
      console.log(`Room joined, forcing message refresh for ${chatId}`);
      fetchMessages()
        .then(() => {
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [hasJoinedRoom, chatId, initialFetchComplete]);
  
  // Listen for new messages
  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (newMessage) => {
      console.log("New message received via socket:", newMessage);
      
      // Ensure message has chatId property
      if (!newMessage.chatId) {
        console.error("Received message without chatId:", newMessage);
        return;
      }
      
      // Check if this message is for the current chat
      const msgChatId = typeof newMessage.chatId === 'object' 
          ? newMessage.chatId._id 
          : newMessage.chatId;
      
      // Debug: log comparison values to help diagnose issues
      console.log(`Comparing message chatId: ${msgChatId} with current chatId: ${chatId}`);
      
      // Handle special case: message with a changed chatId (chat was recreated)
      if (newMessage.originalChatId && newMessage.originalChatId === chatId && newMessage.newChatId) {
        console.log(`Chat ID has changed from ${chatId} to ${newMessage.newChatId}`);
        
        // Update the chat ID reference
        if (onChatIdChanged) {
          onChatIdChanged(newMessage.newChatId);
        } else {
          // If no handler is provided, we can refresh the page or show a message
          setError("Chat has been updated. Please refresh the chat list.");
        }
        
        // Add message to the current display but with the new chat ID
        setMessages((prevMessages) => {
          // Check for duplicate message
          const isDuplicate = prevMessages.some(
            m => m._id === newMessage._id || 
              (m.tempId && m.tempId === newMessage.tempId)
          );
          
          if (isDuplicate) {
            console.log(`Duplicate message detected, not adding: ${newMessage._id}`);
            return prevMessages;
          }
          
          return [...prevMessages, {...newMessage, chatId: chatId}];
        });
        
        return;
      }
      
      // Normal case: message for current chat
      if (chatId === msgChatId) {
        setMessages((prevMessages) => {
          // Track if we need to add this message
          let shouldAddMessage = true;
          
          // Create a new messages array to avoid modifying the previous one directly
          let updatedMessages = [...prevMessages];
          
          // CASE 1: Message with same ID already exists
          if (newMessage._id) {
            const messageWithSameId = prevMessages.find(m => m._id === newMessage._id);
            if (messageWithSameId) {
              console.log(`Message with ID ${newMessage._id} already exists, ignoring`);
              return prevMessages;
            }
          }
          
          // CASE 2: Message with matching tempId (replacing a pending message)
          if (newMessage.tempId) {
            const indexOfTempMessage = prevMessages.findIndex(m => m._id === newMessage.tempId);
            if (indexOfTempMessage >= 0) {
              console.log(`Replacing temp message ${newMessage.tempId} with server message ${newMessage._id}`);
              // Replace the temporary message with the real one
              updatedMessages[indexOfTempMessage] = {
                ...newMessage,
                pending: false
              };
              shouldAddMessage = false;
            }
          }
          
          // Add the message if it's not a duplicate or replacing a temp message
          if (shouldAddMessage) {
            console.log(`Adding new message ${newMessage._id || 'without ID'} to UI`);
            updatedMessages.push(newMessage);
          }
          
          return updatedMessages;
        });
      }
    };
    
    // Listen for typing indicators
    const handleTyping = (chatRoomId) => {
      console.log(`Typing indicator received for chat: ${chatRoomId}`);
      // Only update typing status if it's for our current chat
      if (chatRoomId === chatId) {
        setIsTyping(true);
      }
    };
    
    const handleStopTyping = () => {
      setIsTyping(false);
    };
    
    // Debugging: Log which events we're listening for
    console.log(`Setting up message listeners for chat ${chatId}, socket connected: ${Boolean(socket)}`);
    
    // Set up listeners
    socket.on("message received", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stop typing", handleStopTyping);
    
    // Clean up listeners
    return () => {
      console.log(`Cleaning up message listeners for chat ${chatId}`);
      socket.off("message received", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stop typing", handleStopTyping);
    };
  }, [socket, chatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    // Stop typing indicator
    stopTyping(chatId);
    
    // Clear any existing typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Check authentication before proceeding
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      if (onAuthError) onAuthError();
      return;
    }

    // Generate a unique temp ID that we'll use for tracking
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Save the content we're about to send
    const messageToBeSent = messageContent.trim();
    
    // Create a temporary message to display immediately
    const tempMessage = {
      _id: tempId,
      sender: userId,
      content: messageToBeSent,
      chatId: chatId,
      createdAt: new Date().toISOString(),
      tempMessage: true,
      pending: true
    };
    
    // Add the temporary message to the UI immediately
    setMessages(prevMessages => [...prevMessages, tempMessage]);
    
    // Clear the input field right away for better UX
    setMessageContent("");

    // Function to actually send the message - separated for retry functionality
    const sendMessageRequest = async () => {
      try {
        // Send message via HTTP
        console.log("Sending message via HTTP endpoint");
        
        // If we have chat data, include the recipient ID to help with recovery
        const recipientId = activeChat?.otherUser?._id;
        
        // Create a more detailed request body with fallback information
        const requestBody = { 
          chatId, 
          content: messageToBeSent,
          tempId // Include tempId for correlation
        };
        
        // Only add recipientId if we have it
        if (recipientId) {
          requestBody.recipientId = recipientId;
        }
        
        console.log("Sending message with payload:", requestBody);
        
        const response = await fetch(`${API_URL}/api/chats/message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        // Handle auth errors
        if (response.status === 401) {
          const errorData = await response.json();
          console.log("Auth error when sending message:", errorData);
          
          // Mark the temporary message as failed with retry option
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg._id === tempId ? 
              { ...msg, failed: true, pending: false, canRetry: true, error: "Authentication failed" } : 
              msg
            )
          );
          
          // Show appropriate error
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
          
          if (onAuthError) onAuthError();
          return false;
        }

        // Handle chat not found error
        if (response.status === 404) {
          const errorData = await response.json();
          console.log("Chat not found when sending message:", errorData);
          
          // Mark the temporary message as failed with retry option
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg._id === tempId ? 
              { ...msg, failed: true, pending: false, canRetry: true, error: "Chat not found" } : 
              msg
            )
          );
          
          setError("This chat no longer exists. Please refresh the page.");
          return false;
        }

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const newMessage = await response.json();
        console.log("Message sent successfully, server returned:", newMessage._id);
        
        // Check if socket already handled replacing the temp message
        setMessages(prevMessages => {
          // If the temp message is still there (socket hasn't replaced it),
          // replace it with the real message now
          const tempMessageExists = prevMessages.some(m => m._id === tempId);
          const newMessageExists = prevMessages.some(m => m._id === newMessage._id);
          
          if (tempMessageExists && !newMessageExists) {
            console.log("HTTP response: Replacing temp message with real message");
            return prevMessages.map(msg => 
              msg._id === tempId ? 
              { ...newMessage, sender: userId, pending: false } : 
              msg
            );
          }
          
          return prevMessages;
        });
        
        return true;
      } catch (error) {
        console.error("Error sending message:", error);
        
        // Mark the temporary message as failed with retry option
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === tempId ? 
            { ...msg, failed: true, pending: false, canRetry: true, error: "Network error" } : 
            msg
          )
        );
        
        setError("Failed to send message. Please check your connection and try again.");
        return false;
      }
    };

    // Try to send the message
    sendMessageRequest();
  };
  
  // Function to retry sending a failed message
  const handleRetryMessage = async (failedMessage) => {
    if (!failedMessage || !failedMessage.content) return;
    
    // Mark message as pending again
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg._id === failedMessage._id ? 
        { ...msg, pending: true, failed: false, canRetry: false, error: null } : 
        msg
      )
    );
    
    // Clear any previous error
    setError("");
    
    // Check authentication before proceeding
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      
      // Mark the message as failed again
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === failedMessage._id ? 
          { ...msg, failed: true, pending: false, canRetry: true, error: "Authentication required" } : 
          msg
        )
      );
      
      if (onAuthError) onAuthError();
      return;
    }
    
    try {
      // Send message via HTTP
      console.log("Retrying message via HTTP endpoint");
      
      // Create a more detailed request body with fallback information
      const requestBody = { 
        chatId, 
        content: failedMessage.content,
        tempId: failedMessage._id // Use the same tempId for correlation
      };
      
      // Only add recipientId if we have it
      if (activeChat?.otherUser?._id) {
        requestBody.recipientId = activeChat.otherUser._id;
      }
      
      console.log("Retrying with payload:", requestBody);
      
      const response = await fetch(`${API_URL}/api/chats/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to retry message. Status: ${response.status}, Error: ${errorText}`);
        
        // Mark the message as failed again
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === failedMessage._id ? 
            { ...msg, failed: true, pending: false, canRetry: true, error: `Server error (${response.status})` } : 
            msg
          )
        );
        
        setError(`Failed to send message. Server returned: ${response.status}`);
        return;
      }
      
      const newMessage = await response.json();
      console.log("Message retry successful, server returned:", newMessage._id);
      
      // Replace the failed message with the successful one
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === failedMessage._id ? 
          { ...newMessage, sender: userId, pending: false } : 
          msg
        )
      );
      
    } catch (error) {
      console.error("Error retrying message:", error);
      
      // Mark the message as failed again
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === failedMessage._id ? 
          { ...msg, failed: true, pending: false, canRetry: true, error: "Network error" } : 
          msg
        )
      );
      
      setError("Failed to send message. Please check your connection and try again.");
    }
  };

  // Handle typing indicator
  const handleTyping = (e) => {
    // Only trigger typing events if the input changes (not for backspace when empty, etc.)
    if (e.target.value.trim() !== '' && e.target.value !== messageContent) {
      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      
      // Send typing event to socket
      if (chatId) {
        console.log(`Emitting typing event for chat: ${chatId}`);
        startTyping(chatId);
      }
      
      // Set timeout to automatically stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (chatId) {
          console.log(`Emitting stop typing event for chat: ${chatId}`);
          stopTyping(chatId);
        }
        typingTimeoutRef.current = null;
      }, 3000);
    }
    
    // Update message content (both empty and non-empty)
    setMessageContent(e.target.value);
    
    // If the input is now empty, stop typing indicator
    if (e.target.value.trim() === '') {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      
      if (chatId) {
        console.log(`Input empty, stopping typing for chat: ${chatId}`);
        stopTyping(chatId);
      }
    }
  };

  // Format timestamp for messages
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get a friendly date header for message groups
  const getMessageDateString = (timestamp) => {
    if (!timestamp) return "";
    
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString([], { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Group messages by date for better UI organization
  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentDate = null;
    let currentMessages = [];
    
    messages.forEach(message => {
      const messageDate = new Date(message.createdAt || Date.now());
      const dateString = messageDate.toDateString();
      
      if (dateString !== currentDate) {
        if (currentMessages.length > 0) {
          groups.push({
            date: currentDate,
            formattedDate: getMessageDateString(currentMessages[0].createdAt),
            messages: currentMessages
          });
        }
        currentDate = dateString;
        currentMessages = [message];
      } else {
        currentMessages.push(message);
      }
    });
    
    if (currentMessages.length > 0) {
      groups.push({
        date: currentDate,
        formattedDate: getMessageDateString(currentMessages[0].createdAt),
        messages: currentMessages
      });
    }
    
    return groups;
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const messageGroups = groupMessagesByDate(messages.filter(msg => msg.chatId === chatId));
  const otherUser = activeChat?.otherUser || {};

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="bg-gradient-to-r from-primary/80 to-primary p-4 flex items-center shadow-md">
        <button 
          onClick={onBack} 
          className="btn btn-circle btn-ghost btn-sm mr-2 text-primary-content hover:bg-primary-focus/50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        
        <div className="avatar placeholder mr-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center">
            <span className="text-base font-bold">
              {otherUser.name ? otherUser.name.charAt(0).toUpperCase() : "?"}
            </span>
          </div>
        </div>
        
        {isTyping && (
          <div className="text-xs text-primary-content flex items-center">
            <span className="mr-1">typing</span>
            <span className="loading loading-dots loading-xs"></span>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="alert alert-error mx-4 my-2 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      {/* Messages area */}
      <div className="flex-grow overflow-y-auto p-4 bg-gradient-to-b from-base-100 to-base-200/50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="loading loading-spinner loading-lg text-primary"></div>
          </div>
        ) : (
          <>
            {messageGroups.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full text-center">
                <div className="mb-4 text-6xl opacity-30 bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">💬</div>
                <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                <p className="text-base-content/70">
                  Send a message to start the conversation
                </p>
              </div>
            ) : (
              messageGroups.map((group, groupIndex) => (
                <div key={group.date} className="mb-6">
                  {/* Date separator */}
                  <div className="divider text-xs text-base-content/60 before:bg-primary/20 after:bg-primary/20">
                    {group.formattedDate}
                  </div>
                  
                  {/* Messages in this group */}
                  {group.messages.map((message, index) => {
                    const isCurrentUser = message.sender === userId;
                    const showAvatar = 
                      !isCurrentUser && 
                      (index === 0 || group.messages[index - 1].sender !== message.sender);
                    
                    return (
                      <div 
                        key={message._id || `temp-${index}`} 
                        className={`chat ${isCurrentUser ? 'chat-end' : 'chat-start'} mb-2`}
                      >
                        {showAvatar && !isCurrentUser && (
                          <div className="chat-image avatar placeholder">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent text-primary-content flex items-center justify-center">
                              <span className="text-base font-bold">
                                {otherUser.name ? otherUser.name.charAt(0).toUpperCase() : "?"}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <div className={`chat-bubble shadow-sm ${
                          isCurrentUser 
                            ? message.error 
                              ? 'chat-bubble-error' 
                              : message.pending 
                                ? 'bg-primary/60 text-primary-content' 
                                : 'bg-gradient-to-r from-primary to-primary-focus text-primary-content' 
                            : 'bg-base-300 text-base-content'
                        }`}>
                          {message.content}
                          
                          {message.error && (
                            <button 
                              onClick={() => handleRetryMessage(message)}
                              className="text-xs underline ml-2"
                            >
                              Retry
                            </button>
                          )}
                        </div>
                        
                        <div className="chat-footer opacity-70 text-xs flex gap-1">
                          {formatMessageTime(message.createdAt)}
                          {message.pending && (
                            <span className="flex items-center">
                              <span className="mr-1">sending</span>
                              <span className="loading loading-dots loading-xs"></span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Message input */}
      <div className="p-3 bg-base-200 shadow-inner">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={messageContent}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="input input-bordered flex-grow bg-base-100 focus:border-primary"
            disabled={loading}
          />
          <button 
            type="submit" 
            className="btn btn-circle bg-gradient-to-r from-primary to-primary-focus text-primary-content hover:bg-primary-focus border-none"
            disabled={!messageContent.trim() || loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Conversation;



