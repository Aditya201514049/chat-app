import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const Conversation = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [socket, setSocket] = useState(null); // Socket.io state
  const messagesEndRef = useRef(null);

  // Fetch messages when chatId changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/chats/messages/${chatId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMessages(data);
          setError(""); // Clear errors on success
        } else {
          setError("Failed to load messages. Please try again.");
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("An error occurred while fetching messages.");
      }
    };

    if (chatId) fetchMessages(); // Fetch messages only if chatId is available
  }, [chatId]);

  // Set up Socket.io connection
  useEffect(() => {
    if (!chatId) return; // Don't connect if no chat is selected

    const socketConnection = io("http://localhost:5000"); // Connect to Socket.io server

    socketConnection.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    setSocket(socketConnection);

    return () => {
      if (socketConnection) {
        socketConnection.disconnect(); // Disconnect socket on cleanup
      }
    };
  }, [chatId]);

  // Scroll to the latest message when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!messageContent.trim()) return;

    setIsSending(true);
    const token = localStorage.getItem("token");

    if (!token) return alert("Please log in first");

    const message = {
      chatId,
      content: messageContent,
      sender: localStorage.getItem("userId"), // Assuming userId is stored in localStorage
    };

    // Send message via Socket.io
    if (socket) {
      socket.emit("sendMessage", message);
    }

    // Clear input after sending
    setMessageContent("");
    setError(""); // Clear errors on success
    setIsSending(false);
  };

  // Handle Enter key press for sending a message
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isSending) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render fallback if no chat is selected
  if (!chatId) {
    return (
      <div className="p-4">
        <p className="text-center text-gray-500">
          No chat selected. Please select a chat to start messaging.
        </p>
      </div>
    );
  }

  const userId = localStorage.getItem("userId");

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-lg shadow-md">
      {/* Messages Section */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {error && <p className="text-center text-red-500">{error}</p>}

        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                message.sender === userId
                  ? "justify-end" // Align sent messages to the right
                  : "justify-start" // Align received messages to the left
              }`}
            >
              <div
                className={`p-3 rounded-lg shadow-md max-w-[75%] ${
                  message.sender === userId
                    ? "bg-blue-500 text-white" // Sent message styling
                    : "bg-green-200 text-gray-800" // Received message styling
                }`}
              >
                <p>{message.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No messages yet.</p>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="sticky bottom-0 p-4 border-t border-gray-300 bg-gray-100">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={handleKeyDown} // Add Enter key press handling
            className="flex-1 p-2 border border-gray-300 rounded-md"
            placeholder="Type a message"
          />
          <button
            onClick={handleSendMessage}
            disabled={isSending}
            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
