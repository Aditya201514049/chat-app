import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ChatList from "../components/chatList";
import Conversation from "../components/conversation";
import { useSocket } from "../contexts/SocketContext";

const HomePage2 = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Check if it's mobile
  const { isConnected, joinChatRoom } = useSocket();

  // Update `isMobile` on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle state from navigation
  useEffect(() => {
    if (location.state && location.state.selectedChat) {
      setSelectedChat(location.state.selectedChat);
    }
  }, [location]);

  // When connection status changes, rejoin chat room if needed
  useEffect(() => {
    if (isConnected && selectedChat?._id) {
      console.log("Connection changed, rejoining chat room:", selectedChat._id);
      joinChatRoom(selectedChat._id);
    }
  }, [isConnected, selectedChat, joinChatRoom]);

  // Handle chat selection
  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    
    // Make sure we join the chat room
    if (isConnected && chat?._id) {
      joinChatRoom(chat._id);
    }
  };

  return (
    <div className="fixed inset-0 pt-16 bg-gray-50">
      <div className="flex h-full overflow-hidden">
        {/* Chat list panel */}
        <div className={`${isMobile && selectedChat ? 'hidden' : 'flex'} w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 flex-col bg-white`}>
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-800">Conversations</h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ChatList onChatSelect={handleChatSelect} />
          </div>
        </div>

        {/* Conversation panel */}
        <div className={`${isMobile && !selectedChat ? 'hidden' : 'flex'} flex-col flex-1 bg-gray-50`}>
          {selectedChat ? (
            <Conversation 
              chatId={selectedChat._id} 
              onBack={() => setSelectedChat(null)} 
              chatName={selectedChat?.otherUser?.name || 'Chat'}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center p-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-800">No conversation selected</h3>
                <p className="text-gray-500 mt-2">Choose a conversation from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage2;





