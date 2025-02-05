

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ChatList from "../components/chatList";
import Conversation from "../components/conversation";

const HomePage2 = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Check if it's mobile

  // Update `isMobile` on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (location.state && location.state.selectedChat) {
      setSelectedChat(location.state.selectedChat);
    }
  }, [location]);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] bg-gray-100">
      
      {!isMobile || !selectedChat ? (
        <div className="w-full md:w-1/3 bg-gray-150 text-gray-900 p-4 border-b md:border-b-0 md:border-r border-gray-300 overflow-y-auto shadow-md">
          <ChatList onChatSelect={(chat) => setSelectedChat(chat)} />
        </div>
      ) : null}

      
      <div className="w-full md:w-2/3 p-4 bg-gray-150 text-gray-800 overflow-y-auto shadow-md flex-1">
        {selectedChat && (
          <Conversation chatId={selectedChat._id} onBack={() => setSelectedChat(null)} />
        )}
        {!selectedChat && !isMobile && <p className="text-center text-gray-500">Select a chat to start messaging</p>}
      </div>
    </div>
  );
};

export default HomePage2;




