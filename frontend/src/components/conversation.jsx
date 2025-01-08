import { useState, useEffect } from 'react';

const Conversation = ({ chat, onSendMessage }) => {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  
  useEffect(() => {
    if (chat) {
      // Fetch messages for the selected chat
      const fetchMessages = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/chats/messages/${chat._id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setMessages(data);
          } else {
            alert('Failed to load messages');
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchMessages();
    }
  }, [chat]);

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) return alert('Please log in first');

    try {
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chat._id,
          content: messageContent,
        }),
      });

      const newMessage = await response.json();

      if (response.ok) {
        setMessages([...messages, newMessage]);
        setMessageContent('');
      } else {
        alert('Error sending message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md max-h-screen overflow-auto">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Chat with {chat?.recipient?.name || chat?.sender?.name}</h3>

      <div className="messages overflow-auto max-h-96">
        {messages.map((message) => (
          <div key={message._id} className="message p-3 mb-2 bg-white rounded-md shadow-sm">
            <p><strong>{message.sender.name}:</strong> {message.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center">
        <input
          type="text"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          className="p-2 bg-gray-200 rounded-lg w-full"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSendMessage}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Conversation;
