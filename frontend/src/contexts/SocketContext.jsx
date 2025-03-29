import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Setup socket connection
  useEffect(() => {
    // Get user data from localStorage
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) return;

    console.log("Initializing socket connection to:", API_URL);

    // Initialize socket connection
    const newSocket = io(API_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    // Set socket state
    setSocket(newSocket);

    // Setup event listeners
    newSocket.on("connect", () => {
      console.log("Socket connected with ID:", newSocket.id);
      setIsConnected(true);

      // Send user data for setup
      newSocket.emit("setup", { _id: userId });
    });

    newSocket.on("connected", () => {
      console.log("Socket setup completed");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected. Reason:", reason);
      setIsConnected(false);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      
      // Re-setup user data
      newSocket.emit("setup", { _id: userId });
    });

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
    if (!socket || !isConnected || !chatId) return;
    
    console.log(`Joining chat room: ${chatId}`);
    socket.emit("join chat", chatId);
  }, [socket, isConnected]);

  // Send a message
  const sendMessage = useCallback((messageData) => {
    if (!socket || !isConnected) return;
    
    console.log("Emitting new message via socket:", messageData);
    socket.emit("new message", messageData);
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

export default SocketContext; 