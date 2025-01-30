

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ChatList from "../components/chatList";
import Conversation from "../components/conversation";

const HomePage2 = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.selectedChat) {
      setSelectedChat(location.state.selectedChat);
    }
  }, [location]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Pane: Chat List */}
      <div className="w-1/3 bg-gray-150 text-gray-900 p-4 border-r border-gray-300 overflow-y-scroll shadow-md">
        <ChatList onChatSelect={(chat) => setSelectedChat(chat)} />
      </div>

      {/* Right Pane: Conversation */}
      <div className="w-2/3 p-4 bg-gray-150 text-gray-800 overflow-y-scroll shadow-md">
        {selectedChat ? (
          <Conversation chatId={selectedChat._id} />
        ) : (
          <p className="text-center text-gray-500">
            Select a chat to start a conversation.
          </p>
        )}
      </div>
    </div>
  );
};

export default HomePage2;
