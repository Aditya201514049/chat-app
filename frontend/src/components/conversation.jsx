import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";

const Conversation = ({ chatId, onBack, chatName, hasJoinedRoom, onAuthError }) => {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const userId = localStorage.getItem("userId");
  
  // Get socket context
  const { socket, isConnected, joinChatRoom, startTyping, stopTyping } = useSocket();

  // Add a ref to track the current chat
  const currentChatIdRef = useRef(null);

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
          
      if (chatId !== msgChatId) {
        console.log(`Message for different chat (${msgChatId}), current chat: ${chatId}`);
        return;
      }
      
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
            return prevMessages; // No changes needed
          }
        }
        
        // CASE 2: This is a real message replacing a temp message
        if (newMessage.tempId) {
          // Loop through to find and replace temp message
          let tempFound = false;
          updatedMessages = prevMessages.map(msg => {
            if (msg._id === newMessage.tempId || 
                (msg.tempMessage && msg.content === newMessage.content && msg.sender === newMessage.sender)) {
              console.log(`Replacing temp message with real message ${newMessage._id}`);
              tempFound = true;
              return { 
                ...newMessage, 
                sender: msg.sender, 
                pending: false 
              };
            }
            return msg;
          });
          
          // If we found and replaced a temp message, return the updated array
          if (tempFound) {
            return updatedMessages;
          }
        }
        
        // CASE 3: Check for duplicate content with same timestamp (within 3 seconds)
        const isDuplicate = prevMessages.some(msg => {
          if (msg.content === newMessage.content && msg.sender === newMessage.sender) {
            const msgTime = new Date(msg.createdAt || msg.timestamp || Date.now()).getTime();
            const newMsgTime = new Date(newMessage.createdAt || newMessage.timestamp || Date.now()).getTime();
            const timeDiff = Math.abs(msgTime - newMsgTime);
            console.log(`Time difference between similar messages: ${timeDiff}ms`);
            return timeDiff < 3000;
          }
          return false;
        });
        
        if (isDuplicate) {
          console.log("Duplicate message detected, ignoring");
          return prevMessages;
        }
        
        // CASE 4: This is a completely new message, add it
        console.log("Adding new message:", newMessage.content);
        return [...prevMessages, { ...newMessage, pending: false }];
      });
      
      // Clear typing indicator
      setIsTyping(false);
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

    try {
      // Send message via HTTP
      console.log("Sending message via HTTP endpoint");
      
      const response = await fetch(`${API_URL}/api/chats/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          chatId, 
          content: messageToBeSent,
          tempId // Include tempId for correlation
        }),
      });

      // Handle auth errors
      if (response.status === 401) {
        const errorData = await response.json();
        console.log("Auth error when sending message:", errorData);
        
        // Mark the temporary message as failed
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === tempId ? 
            { ...msg, failed: true, pending: false } : 
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
        return;
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
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
      
      // Mark the temporary message as failed
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === tempId ? 
          { ...msg, failed: true, pending: false } : 
          msg
        )
      );
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
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-blue-500 ${chatName === 'Deleted User' ? 'bg-gray-200' : 'bg-blue-100'}`}>
                <span className="text-sm font-bold">{chatName?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div className="flex items-center">
                <h2 className="text-sm font-medium text-gray-900">{chatName}</h2>
                {chatName === 'Deleted User' && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                    Deleted
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Messages section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {error && (
              <div className="bg-red-100 text-red-800 p-3 rounded-md text-sm mb-4">
                {error}
              </div>
            )}

            {loading && messages.length === 0 ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {messages.length > 0 ? (
                  messages.map((message, index) => (
                    <div
                      key={message._id || index}
                      className={`flex ${
                        message.sender === userId ? "justify-end" : "justify-start"
                      } mb-2`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                          message.sender === userId
                            ? `bg-blue-${message.failed ? "100" : "600"} ${message.failed ? "text-red-500" : "text-white"} rounded-br-none`
                            : "bg-gray-200 text-gray-800 rounded-bl-none"
                        } ${message.pending ? "opacity-70" : ""}`}
                      >
                        <p className="break-words">{message.content}</p>
                        {message.pending && (
                          <div className="flex justify-end mt-1">
                            <div className="w-3 h-3 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                          </div>
                        )}
                        {message.failed && (
                          <div className="flex justify-end mt-1">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                // Create a retry function here
                                // You can copy the send logic and apply it to this specific message
                              }}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Failed - Retry
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm">No messages yet</p>
                  </div>
                )}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg rounded-bl-none">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Loading more indicator at the top when fetching older messages */}
                {loading && messages.length > 0 && (
                  <div className="flex justify-center py-2">
                    <div className="w-5 h-5 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message input */}
          <div className="border-t px-4 py-3 bg-white">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 py-2 px-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={messageContent}
                onChange={handleTyping}
              />
              <button
                type="submit"
                disabled={!messageContent.trim()}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  ></path>
                </svg>
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Conversation;



