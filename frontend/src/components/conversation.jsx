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

  return (
    <div className="flex flex-col h-full">
      {!chatId ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <img
            src="https://img.icons8.com/fluent/96/000000/chat.png"
            alt="Chat"
            className="w-24 h-24 mb-4 opacity-50"
          />
          <h3 className="text-xl font-semibold text-gray-800">
            Select a conversation to start chatting
          </h3>
        </div>
      ) : (
        <>
          {/* Chat header */}
          <div className="flex items-center justify-between px-4 py-3 border-b shadow-sm bg-white">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="md:hidden p-1 rounded-full hover:bg-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                  <span className="font-semibold">
                    {chatName?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
                <div className="ml-3">
                  <h2 className="text-lg font-semibold text-gray-800 max-w-[150px] truncate">
                    {chatName || "Chat"}
                  </h2>
                  {isConnected ? (
                    <p className="text-xs text-green-600">Connected</p>
                  ) : (
                    <p className="text-xs text-red-500">Disconnected</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Messages section */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {loading && messages.length === 0 ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mt-6"></div>
              </div>
            ) : (
              <>
                {/* Show loading indicator for older messages at the top */}
                {loading && messages.length > 0 && (
                  <div className="flex justify-center mb-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                )}
                {error && (
                  <div className="bg-red-100 text-red-800 p-3 rounded-md text-sm mb-4">
                    {error}
                  </div>
                )}
                {messages
                  .filter((msg) => msg.chatId === chatId)
                  .map((message, index) => (
                    <div
                      key={message._id || index}
                      className={`flex mb-3 ${
                        message.sender === userId
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`rounded-lg px-4 py-2 max-w-[80%] break-words relative ${
                          message.sender === userId
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-800 border border-gray-200"
                        } ${message.pending ? "opacity-60" : ""}`}
                      >
                        {message.content}
                        
                        {/* Show message status indicators */}
                        <div className="text-right">
                          {message.pending && (
                            <span className="text-xs opacity-75">
                              Sending...
                            </span>
                          )}
                          {message.failed && (
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-red-300 mt-1">
                                {message.error || "Failed to send"}
                              </span>
                              {message.canRetry && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRetryMessage(message);
                                  }}
                                  className="text-xs text-red-300 hover:text-red-100 hover:underline mt-1"
                                >
                                  Retry
                                </button>
                              )}
                            </div>
                          )}
                          {!message.pending && !message.failed && (
                            <span className="text-xs opacity-75">
                              {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Typing indicator */}
          {isTyping && (
            <div className="px-4 py-2 text-gray-500 text-xs italic">
              Someone is typing...
            </div>
          )}

          {/* Message input form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t">
            <div className="flex items-center">
              <input
                type="text"
                value={messageContent}
                onChange={handleTyping}
                placeholder="Type a message..."
                className="flex-1 py-2 px-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <button
                type="submit"
                disabled={!messageContent.trim()}
                className={`px-4 py-2 rounded-r-md ${
                  messageContent.trim()
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default Conversation;



