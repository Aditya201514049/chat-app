
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatRoom from '../components/chatRoom';
import Conversation from '../components/conversation';

const HomePage = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve token from localStorage
    const token = localStorage.getItem("token");

    if (!token) {
      // Redirect to login if no token found
      console.warn("No token found, redirecting to login...");
      navigate("/login");
    } else {
      console.log("Token found in Homepage:", token);
      // You can now use the token for authenticated requests
    }
  }, [navigate]);

  return (
    <div className="flex flex-col lg:flex-row p-4">
      <div className="chat-room w-full lg:w-1/3 mb-4 lg:mb-0">
        <ChatRoom onSelectChat={handleSelectChat} />
      </div>
      <div className="conversation w-full lg:w-2/3">
        {selectedChat ? (
          <Conversation chat={selectedChat} />
        ) : (
          <div className="text-center text-gray-600">Select a chat to start conversation</div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
