/*
import { useState, useEffect, useRef } from 'react';

const Conversation = ({ chat }) => {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    console.log("Conversation received chat:", chat);

    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/chats/messages/${chat._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMessages(data);
          setError('');
        } else {
          setError('Failed to load messages. Please try again.');
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('An error occurred while fetching messages.');
      }
    };

    if (chat) fetchMessages();
  }, [chat]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;

    setIsSending(true);
    const token = localStorage.getItem('token');
    if (!token) return alert('Please log in first');

    try {
      const response = await fetch('http://localhost:5000/api/chats/message', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId: chat._id, content: messageContent }),
      });

      const newMessage = await response.json();

      if (response.ok) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setMessageContent('');
      } else {
        alert('Error sending message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!chat) {
    return (
      <div className="p-4">
        <p className="text-center text-gray-500">No chat selected. Please select a chat to start messaging.</p>
      </div>
    );
  }

  const participantName =
    chat?.sender?._id === localStorage.getItem('userId')
      ? chat?.recipient?.name || 'Unknown Recipient'
      : chat?.sender?.name || 'Unknown Sender';

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md max-h-screen overflow-auto">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Chat with {participantName}</h3>
      {error && (
        <div className="text-red-500 text-center mb-4">
          <p>{error}</p>
          <button onClick={() => fetchMessages()} className="text-blue-500 underline">
            Retry
          </button>
        </div>
      )}
      <div className="messages overflow-auto max-h-96">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`message p-3 mb-2 rounded-md shadow-sm ${
              message.sender._id === localStorage.getItem('userId') ? 'bg-blue-100 self-end' : 'bg-gray-100'
            }`}
          >
            <p>
              <strong>{message.sender.name}:</strong> {message.content}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
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
          disabled={isSending}
          className={`ml-2 px-4 py-2 rounded-lg ${isSending ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default Conversation;
*/
import { useState, useEffect, useRef } from 'react';

const Conversation = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    console.log("Conversation received chat:", chatId);
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/chats/messages/${chatId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMessages(data);
          setError(''); // Clear error if data is successfully fetched
        } else {
          setError('Failed to load messages. Please try again.');
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('An error occurred while fetching messages.');
      }
    };

    if (chatId) fetchMessages(); // Only fetch messages if chatId is available
  }, [chatId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;
    setIsSending(true);
    const token = localStorage.getItem('token');
    if (!token) return alert('Please log in first');

    try {
      const response = await fetch('http://localhost:5000/api/chats/message', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId, content: messageContent }),
      });

      const newMessage = await response.json();

      if (response.ok) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setMessageContent('');
        setError(''); // Clear error if message is successfully sent
      } else {
        setError('Error sending message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('An error occurred while sending the message.');
    }
    setIsSending(false);
  };

  if (!chatId) {
    return (
      <div className="p-4">
        <p className="text-center text-gray-500">No chat selected. Please select a chat to start messaging.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md max-h-screen overflow-auto">
      <div className="space-y-4">
        {/* Error Message */}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* Messages */}
        <div className="space-y-4">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div key={message._id} className="p-2 bg-white rounded-lg shadow-md">
                <p>{message.content}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No messages yet.</p>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            className="p-2 border border-gray-300 rounded-md w-full"
            placeholder="Type a message"
          />
          <button
            onClick={handleSendMessage}
            disabled={isSending}
            className="p-2 bg-blue-500 text-white rounded-md"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
