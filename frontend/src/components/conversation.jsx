import { useState, useEffect, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Conversation = ({ chatId, onBack, chatName }) => {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
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
    const userId = localStorage.getItem("userId");

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
        setMessages((prevMessages) => [...prevMessages, {...newMessage, sender: userId}]);
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
    if (e.key === "Enter" && !e.shiftKey && !isSending) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!chatId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6">
          <p className="text-lg text-gray-500">
            Select a conversation to start chatting
          </p>
        </div>
      </div>
    );
  }

  const userId = localStorage.getItem("userId");

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center">
        {window.innerWidth < 768 && (
          <button onClick={onBack} className="mr-3 text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">
            <span className="text-sm font-bold">{chatName?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-900">{chatName}</h2>
          </div>
        </div>
      </div>

      {/* Messages section */}
      <div 
        ref={messageContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50"
      >
        {loading ? (
          <div className="flex flex-col space-y-3">
            <div className="animate-pulse flex">
              <div className="bg-gray-200 h-10 w-32 rounded-lg"></div>
            </div>
            <div className="animate-pulse flex justify-end">
              <div className="bg-gray-200 h-10 w-40 rounded-lg"></div>
            </div>
            <div className="animate-pulse flex">
              <div className="bg-gray-200 h-10 w-36 rounded-lg"></div>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-100 text-red-700 p-2 rounded text-sm text-center">
                {error}
              </div>
            )}

            {messages.length > 0 ? (
              messages.map((message, index) => (
                <div
                  key={message._id || index}
                  className={`flex ${message.sender === userId ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`py-2 px-3 rounded-lg max-w-[75%] ${
                      message.sender === userId
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-800 border border-gray-200"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No messages yet</p>
                <p className="text-gray-400 text-xs mt-1">Start the conversation!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message input */}
      <div className="px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center">
          <input
            type="text"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSendMessage}
            disabled={isSending || !messageContent.trim()}
            className={`ml-2 rounded-full w-10 h-10 flex items-center justify-center transition-colors ${
              messageContent.trim() && !isSending
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            {isSending ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Conversation;



