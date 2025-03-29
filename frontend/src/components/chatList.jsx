import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ChatList = ({ onChatSelect }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChatRooms = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, []);

  const handleChatSelect = (room) => {
    setSelectedChatId(room._id);
    onChatSelect(room);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {chatRooms.length > 0 ? (
        chatRooms.map((room) => (
          <div
            key={room._id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedChatId === room._id
                ? "bg-blue-50"
                : "hover:bg-gray-50"
            }`}
            onClick={() => handleChatSelect(room)}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-lg font-bold">
                  {room.otherUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {room.otherUser.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Started on: {new Date(room.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="p-4 text-center">
          <p className="text-gray-500">No conversations yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Your chats will appear here
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatList;
