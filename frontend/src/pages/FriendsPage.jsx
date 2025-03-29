import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const FriendsPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { theme } = useTheme();

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

  const handleCreateChat = async (recipientId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/chats/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipientId }),
      });

      const chat = await response.json();

      if (response.ok) {
        navigate("/home", { state: { selectedChat: chat } });
      } else {
        console.error("Error creating chat");
      }
    } catch (error) {
      console.error("Error:", error);
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
                    onClick={() => handleCreateChat(user._id)}
                    className="mt-4 w-full py-2 px-4 border-0 rounded-md shadow-sm text-sm font-medium transition-colors"
                    style={{ 
                      backgroundColor: 'var(--color-button-primary)',
                      color: 'var(--color-text-message-mine)',
                    }}
                  >
                    Message
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
