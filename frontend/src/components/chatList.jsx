
import React, { useEffect, useState } from "react";
// Store the API URL in a variable at the top
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ChatList = ({ onChatSelect }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null); // State to track the selected chat

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await fetch(`${API_URL}/api/chats/getchats`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setChatRooms(data); // Save chats in state
        } else {
          console.error("Failed to fetch chat rooms");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchChatRooms(); // Fetch chats when the component loads
  }, []);

  const handleChatSelect = (room) => {
    setSelectedChatId(room._id); // Set the selected chat ID
    onChatSelect(room); // Notify parent about the selected chat
  };

  return (
    <div className="space-y-4">
      {chatRooms.length > 0 ? (
        chatRooms.map((room) => (
          <div
            key={room._id}
            className={`card shadow-lg border rounded-lg p-4 cursor-pointer transition ${
              selectedChatId === room._id
                ? "bg-blue-100 border-blue-400" // Highlight the selected chat
                : "bg-white border-gray-200 hover:shadow-xl hover:bg-gray-50"
            }`}
            onClick={() => handleChatSelect(room)}
          >
            <div className="flex items-center">
              <div className="avatar placeholder w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center mr-4">
                <span className="text-lg font-bold">
                  {room.otherUser.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-700">
                   {room.otherUser.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Started on: {new Date(room.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">
          No chat rooms found. Start chatting now!
        </p>
      )}
    </div>
  );
};

export default ChatList;
