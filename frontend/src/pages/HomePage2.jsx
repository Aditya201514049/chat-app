/*

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // useLocation for accessing passed state
import ChatList from "../components/chatList";
import Conversation from '../components/conversation';

const HomePage2 = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const location = useLocation(); // To access passed state (selectedChat)

  useEffect(() => {
    if (location.state && location.state.selectedChat) {
      setSelectedChat(location.state.selectedChat); // Set the chat passed from FriendsPage
    }
  }, [location]);

  return (
    <div className="flex min-h-screen">
      
      <div className="w-1/3 bg-gray-100 p-4 border-r border-gray-200">
        <ChatList onChatSelect={(chat) => setSelectedChat(chat)} />
      </div>

      
      <div className="w-2/3 p-4">
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
*/

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // useLocation for accessing passed state
import ChatList from "../components/chatList";
import Conversation from "../components/conversation";

const HomePage2 = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const location = useLocation(); // To access passed state (selectedChat)

  useEffect(() => {
    if (location.state && location.state.selectedChat) {
      setSelectedChat(location.state.selectedChat); // Set the chat passed from FriendsPage
    }
  }, [location]);

  return (
    <div className="flex h-screen">
      {/* Left Pane: Chat List */}
      <div className="w-1/3 bg-gray-100 p-4 border-r border-gray-200 overflow-y-scroll">
        <ChatList onChatSelect={(chat) => setSelectedChat(chat)} />
      </div>

      {/* Right Pane: Conversation */}
      <div className="w-2/3 p-4 overflow-y-scroll">
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
