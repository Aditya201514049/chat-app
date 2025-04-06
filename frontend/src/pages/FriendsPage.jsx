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
    <div className="container mx-auto px-4 py-4 mt-0">
      {/* Search input */}
      <div className="form-control w-full mx-auto mb-8">
        <div className="flex items-center w-full max-w-4xl mx-auto gap-2">

          <input
            type="text"
            placeholder="Search people..."
            className="input input-bordered w-full focus:outline-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              color: 'var(--color-text-primary)', // Ensure text is visible in dark mode
              backgroundColor: 'var(--color-bg-input)', // Match the input background
              borderColor: 'var(--color-border-input)', // Match the border color
            }}
          />
          <button className="btn btn-square bg-primary text-primary-content border-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Toast notification for chat created/navigating to existing chat */}
      {showChatCreated && createdChatInfo && (
        <div className="toast toast-end z-50">
          <div className="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-bold">
                {createdChatInfo.isNew ? "Chat Created!" : "Opening Chat"}
              </h3>
              <div className="text-xs">
                {createdChatInfo.isNew
                  ? `New chat with ${createdChatInfo.name} created. Redirecting...`
                  : `You already have a chat with ${createdChatInfo.name}. Opening...`}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="card shadow-md animate-pulse" style={{ backgroundColor: 'var(--color-bg-card)' }}>
              <div className="card-body">
                <div className="flex items-center space-x-4">
                  <div className="skeleton rounded-full h-12 w-12"></div>
                  <div className="flex-1">
                    <div className="skeleton h-4 w-3/4 mb-2"></div>
                    <div className="skeleton h-3 w-1/2"></div>
                  </div>
                </div>
                <div className="skeleton h-10 w-full mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="avatar placeholder mb-4">
                <div className="bg-neutral-focus text-neutral-content rounded-full w-24">
                  <span className="text-3xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-medium text-base-content">No users found</h3>
              <p className="mt-1 text-sm text-base-content/60">
                {searchTerm ? `No results for "${searchTerm}"` : "There are no other users available right now"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="card hover:shadow-xl transition-all duration-300 shadow-md overflow-hidden"
                  style={{ backgroundColor: 'var(--color-bg-card)' }}
                >
                  <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
                  <div className="card-body">
                    <div className="flex items-center gap-4">
                      <div className="avatar placeholder">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center" style={{ color: "white" }}>
                          <span className="text-lg font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                          {user.name}
                        </h3>
                        <p className="text-sm truncate" style={{ color: 'var(--color-text-secondary)' }}>
                          {user.email || "No email available"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCreateChat(user._id, user.name)}
                      disabled={user.isLoading}
                      className={`btn mt-4 ${existingChats[user._id]
                          ? "btn-secondary"
                          : "btn-primary"
                        } ${user.isLoading ? "loading" : ""}`}
                      style={{ color: 'white' }}
                    >
                      {user.isLoading ? (
                        "Connecting..."
                      ) : existingChats[user._id] ? (
                        <span className="flex items-center">
                          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Open Chat
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Create Chat
                        </span>
                      )}
                    </button>
                  </div>
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
