import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";

const Conversation = ({ chatId, onBack, chatName }) => {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const userId = localStorage.getItem("userId");
  
  // Get socket context
  const { socket, isConnected, joinChatRoom, sendMessage, startTyping, stopTyping } = useSocket();

  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/chats/messages/${chatId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError("Failed to load messages. Please try again.");
      console.error("Error fetching messages:", err);
      setError("An error occurred while fetching messages.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages when chat changes
  useEffect(() => {
    if (chatId) fetchMessages();
  }, [chatId]);
  
  // Join the chat room when chat changes
  useEffect(() => {
    if (chatId && isConnected) {
      joinChatRoom(chatId);
    }
  }, [chatId, isConnected, joinChatRoom]);
  
  // Listen for new messages
  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (newMessage) => {
      console.log("New message received:", newMessage);
      
      // Check if the message is already in our list (to prevent duplicates)
      setMessages((prevMessages) => {
        const isExisting = prevMessages.some(msg => 
          msg._id === newMessage._id
        );
        
        if (!isExisting) {
          return [...prevMessages, newMessage];
        }
        return prevMessages;
      });
      
      // Clear typing indicator when a message is received
      setIsTyping(false);
    };
    
    // Listen for typing indicators
    const handleTyping = () => {
      setIsTyping(true);
    };
    
    const handleStopTyping = () => {
      setIsTyping(false);
    };
    
    // Set up listeners
    socket.on("message received", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stop typing", handleStopTyping);
    
    // Clean up listeners
    return () => {
      socket.off("message received", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stop typing", handleStopTyping);
    };
  }, [socket]);

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

    // Create a temporary message to display immediately
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      sender: userId,
      content: messageContent,
      chatId: chatId,
      createdAt: new Date().toISOString(),
      tempMessage: true
    };
    
    // Add the temporary message to the UI immediately
    setMessages(prevMessages => [...prevMessages, tempMessage]);
    
    // Clear the input field right away for better UX
    const messageToBeSent = messageContent;
    setMessageContent("");

    try {
      const response = await fetch(`${API_URL}/api/chats/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ chatId, content: messageToBeSent }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const newMessage = await response.json();
      
      // Replace the temp message with the real one from the server
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === tempMessage._id ? 
          { ...newMessage, sender: userId } : 
          msg
        )
      );
      
      // Also emit the message via socket for more reliable delivery
      if (socket && isConnected) {
        // Send a simpler object with just the necessary information
        sendMessage({
          ...newMessage,
          sender: userId,
          chatId: chatId // Send just the ID, not a complex object
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
      
      // Remove the temporary message on error
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg._id !== tempMessage._id)
      );
    }
  };
  
  // Handle typing indicator
  const handleTyping = (e) => {
    setMessageContent(e.target.value);
    
    // Don't send typing events for empty messages
    if (!e.target.value.trim()) {
      stopTyping(chatId);
      return;
    }
    
    // Send typing indicator
    startTyping(chatId);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    // Set timeout to stop typing indicator after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(chatId);
    }, 3000);
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
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-500">
                <span className="text-sm font-bold">{chatName?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-900">{chatName}</h2>
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

            {loading ? (
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
                      }`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                          message.sender === userId
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-gray-200 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
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



