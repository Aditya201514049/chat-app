import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useSocket } from "../contexts/SocketContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const FriendsPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [existingChats, setExistingChats] = useState({});
  const [showChatCreated, setShowChatCreated] = useState(false);
  const [createdChatInfo, setCreatedChatInfo] = useState(null);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { joinChatRoom, isConnected } = useSocket();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/users/profiles`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          console.error("Error fetching users");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch existing chats to know which users already have chats
  useEffect(() => {
    const fetchExistingChats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/chats/getchats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const chats = await response.json();
          
          // Create a map of user IDs to chat IDs
          const chatMap = {};
          chats.forEach(chat => {
            // For each participant that isn't the current user
            chat.participants.forEach(participant => {
              if (participant._id !== localStorage.getItem("userId")) {
                chatMap[participant._id] = chat._id;
              }
            });
          });
          
          setExistingChats(chatMap);
        }
      } catch (error) {
        console.error("Error fetching existing chats:", error);
      }
    };

    fetchExistingChats();
  }, []);

  const handleCreateChat = async (recipientId, recipientName) => {
    try {
      const token = localStorage.getItem("token");
      
      // If chat already exists, navigate to it
      if (existingChats[recipientId]) {
        // Pre-join the chat room before navigation if connected
        if (isConnected) {
          console.log(`Joining existing chat room ${existingChats[recipientId]}`);
          joinChatRoom(existingChats[recipientId]);
          
          // Small delay to ensure the room is joined before navigation
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // Show a notification that we're navigating to an existing chat
        setCreatedChatInfo({
          name: recipientName,
          isNew: false
        });
        setShowChatCreated(true);
        
        // Navigate after a short delay to allow the user to see the notification
        setTimeout(() => {
          navigate("/home", { 
            state: { 
              selectedChatId: existingChats[recipientId],
              fromFriendsPage: true 
            } 
          });
        }, 1500);
        
        return;
      }
      
      // Show loading indicator for this specific user
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === recipientId 
            ? { ...user, isLoading: true } 
            : user
        )
      );
      
      const response = await fetch(`${API_URL}/api/chats/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipientId }),
      });

      if (!response.ok) {
        throw new Error("Error creating chat");
      }
      
      const chat = await response.json();

      // Update our existing chats map
      setExistingChats(prev => ({
        ...prev,
        [recipientId]: chat._id
      }));

      // Remove loading state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === recipientId 
            ? { ...user, isLoading: false } 
            : user
        )
      );

      // Pre-join the chat room before navigation if connected
      if (isConnected && chat._id) {
        console.log(`Pre-joining chat room ${chat._id} before navigation`);
        joinChatRoom(chat._id);
        
        // Small delay to ensure the room is joined before navigation
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Show a notification that the chat was created
      setCreatedChatInfo({
        name: recipientName,
        isNew: true
      });
      setShowChatCreated(true);
      
      // Navigate after a short delay to allow the user to see the notification
      setTimeout(() => {
        navigate("/home", { 
          state: { 
            selectedChatId: chat._id,
            fromFriendsPage: true 
          } 
        });
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      
      // Remove loading state on error
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === recipientId 
            ? { ...user, isLoading: false } 
            : user
        )
      );
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>People</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Find friends and start a conversation</p>
      </div>
      
      {/* Search input */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5" style={{ color: 'var(--color-text-tertiary)' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search people..."
          className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          style={{ 
            backgroundColor: 'var(--color-bg-input)',
            color: 'var(--color-text-input)',
            borderColor: 'var(--color-border-input)'
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Toast notification for chat created/navigating to existing chat */}
      {showChatCreated && createdChatInfo && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-green-100 dark:bg-green-800 border-l-4 border-green-500 text-green-700 dark:text-green-100 p-4 rounded shadow-lg" role="alert">
            <div className="flex">
              <div className="py-1">
                <svg className="h-6 w-6 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">
                  {createdChatInfo.isNew 
                    ? "Chat Created!" 
                    : "Opening Existing Chat"}
                </p>
                <p className="text-sm">
                  {createdChatInfo.isNew 
                    ? `New chat with ${createdChatInfo.name} created. Redirecting...` 
                    : `You already have a chat with ${createdChatInfo.name}. Opening...`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="rounded-lg shadow p-4 animate-pulse" style={{ backgroundColor: 'var(--color-bg-card)' }}>
              <div className="flex items-center space-x-4">
                <div className="rounded-full h-12 w-12" style={{ backgroundColor: 'var(--color-bg-secondary)' }}></div>
                <div className="flex-1">
                  <div className="h-4 rounded w-3/4 mb-2" style={{ backgroundColor: 'var(--color-bg-secondary)' }}></div>
                  <div className="h-3 rounded w-1/2" style={{ backgroundColor: 'var(--color-bg-secondary)' }}></div>
                </div>
              </div>
              <div className="mt-4 h-8 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)' }}></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <svg className="w-12 h-12" style={{ color: 'var(--color-text-tertiary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>No users found</h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                {searchTerm ? `No results for "${searchTerm}"` : "There are no other users available right now"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="rounded-lg shadow transition-all hover:shadow-md p-4"
                  style={{ backgroundColor: 'var(--color-bg-card)' }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" 
                      style={{ 
                        backgroundColor: 'var(--color-bg-avatar)',
                        color: 'var(--color-text-navbar)'
                      }}
                    >
                      <span className="text-lg font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {user.name}
                      </h3>
                      <p className="text-sm truncate" style={{ color: 'var(--color-text-tertiary)' }}>
                        {user.email || "No email available"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCreateChat(user._id, user.name)}
                    disabled={user.isLoading}
                    className={`mt-4 w-full py-2 px-4 border-0 rounded-md shadow-sm text-sm font-medium transition-colors ${
                      existingChats[user._id] ? "bg-opacity-80" : ""
                    }`}
                    style={{ 
                      backgroundColor: existingChats[user._id] 
                        ? 'var(--color-button-secondary)' 
                        : 'var(--color-button-primary)',
                      color: 'var(--color-text-message-mine)',
                      opacity: user.isLoading ? 0.7 : 1
                    }}
                  >
                    {user.isLoading ? (
                      <div className="flex justify-center items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Connecting...
                      </div>
                    ) : existingChats[user._id] ? (
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Open Chat
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Chat
                      </div>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FriendsPage;
