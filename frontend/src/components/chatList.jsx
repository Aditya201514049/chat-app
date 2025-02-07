
import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ChatList = ({ onChatSelect }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

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
          setChatRooms(data);
        } else {
          console.error("Failed to fetch chat rooms");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchChatRooms();
  }, []);

  const handleChatSelect = (room) => {
    setSelectedChatId(room._id);
    onChatSelect(room);
  };

  return (
    <div className="min-h-screen p-4 bg-base-200">
      <h2 className="text-xl font-semibold text-primary mb-4">Chats</h2>
      {chatRooms.length > 0 ? (
        chatRooms.map((room) => (
          <div
            key={room._id}
            className={`card card-bordered shadow-md p-4 cursor-pointer transition ${
              selectedChatId === room._id
                ? "bg-primary text-primary-content border-primary"
                : "bg-base-100 hover:shadow-lg border-base-300"
            }`}
            onClick={() => handleChatSelect(room)}
          >
            <div className="flex items-center">
              <div className="avatar placeholder w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center mr-4">
                <span className="text-lg font-bold">
                  {room.otherUser.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  {room.otherUser.name}
                </h3>
                <p
                  className="text-sm"
                  style={{
                    color: selectedChatId === room._id ? "#fff" : "#6B7280",
                  }}
                >
                  Started on: {new Date(room.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No chat rooms found. Start chatting now!</p>
      )}
    </div>
  );
};

export default ChatList;
