import React, { useEffect, useState } from "react";

const ChatPage = () => {
  const [chatRooms, setChatRooms] = useState([]);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/chats/getchats", {
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

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Your Chat Rooms
        </h2>
        <div className="space-y-4">
          {chatRooms.length > 0 ? (
            chatRooms.map((room) => (
              <div
                key={room._id}
                className="card bg-white shadow-lg border border-gray-200 rounded-lg p-4 hover:shadow-xl hover:bg-gray-50 transition"
              >
                <div className="flex items-center">
                  <div className="avatar placeholder w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center mr-4">
                    <span className="text-lg font-bold">
                      {room.recipient.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-700">
                      Chat with: {room.recipient.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Started on:{" "}
                      {new Date(room.createdAt).toLocaleDateString()}
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
      </div>
    </div>
  );
};

export default ChatPage;
