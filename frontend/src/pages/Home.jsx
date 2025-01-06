import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatRoom from "../components/chatRoom";

// Placeholder for the Conversation component until it's built
const Conversation = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <h2 className="text-gray-500">Select a user to start a conversation</h2>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve token from localStorage
    const token = localStorage.getItem("token");

    if (!token) {
      // Redirect to login if no token found
      console.warn("No token found, redirecting to login...");
      navigate("/login");
    } else {
      console.log("Token found:", token);
      // You can now use the token for authenticated requests
    }
  }, [navigate]);

  return (
    <div className="flex h-screen">
      {/* Chat Room - 30% width */}
      <div className="w-1/3 bg-gray-200 p-4">
        <ChatRoom />
      </div>

      {/* Conversation - 70% width (Placeholder) */}
      <div className="w-2/3 bg-white p-4">
        <Conversation />
      </div>
    </div>
  );
};

export default Home;
