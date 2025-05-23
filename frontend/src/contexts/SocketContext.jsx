import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";

// Create context with a default value (null for socket, false for isConnected)
export const SocketContext = createContext({
  socket: null, 
  isConnected: false,
  joinChatRoom: () => {},
  sendMessage: () => false,
  startTyping: () => {},
  stopTyping: () => {}
});

export const useSocket = () => {
  return useContext(SocketContext);
};

const checkUserCredentials = () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  
  if (!token || !userId) {
    console.warn("No token or userId found, can't connect socket");
    return false;
  }
  
  return { token, userId };
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Setup socket connection
  useEffect(() => {
    // Get user data from localStorage
    const credentials = checkUserCredentials();
    
    if (!credentials) {
      // If no valid credentials, don't try to connect
      setSocket(null);
      setIsConnected(false);
      return;
    }
    
    const { token, userId } = credentials;
    
    console.log(`Initializing socket connection to: ${API_URL} for user: ${userId}`);

    // Initialize socket connection
    const newSocket = io(API_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
      auth: {
        token, // Send token for auth
        userId // Send userId for identification
      }
    });

    // Set socket state
    setSocket(newSocket);

    // Setup event listeners
    newSocket.on("connect", () => {
      console.log(`Socket connected with ID: ${newSocket.id} using transport: ${newSocket.io.engine.transport.name}`);
      setIsConnected(true);

      // Send user data for setup
      newSocket.emit("setup", { _id: userId });
    });

    newSocket.on("connected", () => {
      console.log("Socket setup completed successfully");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
      
      // Check if it's an authentication error
      if (error.message.includes('Authentication error') || error.message.includes('auth')) {
        console.warn("Socket authentication failed. Token may be invalid.");
      }
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    newSocket.on("disconnect", (reason) => {
      console.log(`Socket disconnected. Reason: ${reason}`);
      setIsConnected(false);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      
      // Re-setup user data
      newSocket.emit("setup", { _id: userId });
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("Socket reconnection error:", error);
    });

    // For debugging: log all events received
    const originalOnevent = newSocket.onevent;
    newSocket.onevent = function(packet) {
      const args = packet.data || [];
      console.log(`Socket event received: ${args[0]}`, args.slice(1));
      originalOnevent.call(this, packet);
    };

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up socket connection");
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [API_URL]);

  // Join a chat room
  const joinChatRoom = useCallback((chatId) => {
    if (!socket || !isConnected) {
      console.log(`Cannot join chat room: socket connected: ${isConnected}`);
      return false;
    }
    
    if (!chatId) {
      console.warn('Cannot join chat room: No chatId provided');
      return false;
    }
    
    // Convert to string if it's an object
    const roomId = typeof chatId === 'object' ? chatId._id.toString() : chatId.toString();
    
    console.log(`Joining chat room: ${roomId}`);
    socket.emit("join chat", roomId);
    
    // Verify successful join by emitting a status request
    setTimeout(() => {
      console.log(`Verifying join to chat room: ${roomId}`);
      socket.emit("check room status", roomId);
    }, 500);
    
    return true;
  }, [socket, isConnected]);

  // Send a message - now using the HTTP approach from conversation.jsx
  const sendMessage = useCallback((messageData) => {
    if (!socket || !isConnected) {
      console.log("Cannot send message, socket not connected");
      return false;
    }
    
    console.log("WARNING: Direct socket message sending is deprecated. Use HTTP endpoint instead.");
    // Still emit for backward compatibility, but API calls are preferred
    socket.emit("new message", messageData);
    return true;
  }, [socket, isConnected]);

  // Typing indicators
  const startTyping = useCallback((chatId) => {
    if (!socket || !isConnected || !chatId) return;
    
    socket.emit("typing", chatId);
  }, [socket, isConnected]);

  const stopTyping = useCallback((chatId) => {
    if (!socket || !isConnected || !chatId) return;
    
    socket.emit("stop typing", chatId);
  }, [socket, isConnected]);

  // Value to be provided to consumers
  const value = {
    socket,
    isConnected,
    joinChatRoom,
    sendMessage,
    startTyping,
    stopTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 