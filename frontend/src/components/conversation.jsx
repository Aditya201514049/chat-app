

import { useState, useEffect, useRef } from "react";

const API_URL = "http://localhost:5000";

const Conversation = ({ chatId, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_URL}/api/chats/messages/${chatId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMessages(data);
          setError("");
        } else {
          setError("Failed to load messages. Please try again.");
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("An error occurred while fetching messages.");
      }
    };

    if (chatId) fetchMessages();
  }, [chatId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;

    setIsSending(true);
    const token = localStorage.getItem("token");

    if (!token) return alert("Please log in first");

    try {
      const response = await fetch(`${API_URL}/api/chats/message`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId, content: messageContent }),
      });

      const newMessage = await response.json();

      if (response.ok) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setMessageContent("");
        setError("");
      } else {
        setError("Error sending message.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("An error occurred while sending the message.");
    }

    setIsSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isSending) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!chatId) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-purple-200">
        <div className="p-6 bg-base-300 rounded-lg shadow-lg text-center">
          <p className="text-lg font-semibold text-gray-700">
            Select a chat to start a conversation.
          </p>
        </div>
      </div>
    );
  }

  const userId = localStorage.getItem("userId");

  return (
    <div className="flex flex-col h-full bg-base-200 rounded-lg shadow-xl">
      
      {window.innerWidth < 768 && (
        <div className="sticky top-0 z-20 bg-white shadow-md p-2">
          <button onClick={onBack} className="text-blue-500 font-semibold">
            ← Back to Chats
          </button>
        </div>
      )}

      
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-base-300 rounded-t-lg">
        {error && <p className="text-center text-red-500">{error}</p>}

        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.sender === userId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-3 rounded-lg shadow-md max-w-[75%] ${
                  message.sender === userId
                    ? "bg-secondary text-secondary-content"
                    : "bg-accent text-accent-content"
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

      
      <div className="sticky bottom-0 p-4 border-t border-base-300 bg-gray-100 rounded-b-lg">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 p-2 border border-black-300 rounded-md bg-base-200 text-base-content placeholder-base-400 focus:ring-2 focus:ring-secondary"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSendMessage}
            disabled={isSending}
            className="p-2 px-4 bg-primary text-white rounded-md hover:bg-primary-focus transition-all"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Conversation;



