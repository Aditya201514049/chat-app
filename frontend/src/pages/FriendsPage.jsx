


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const FriendsPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
          alert("Error fetching users");
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
        alert("Error creating chat");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-blue-50">
      <h2 className="text-3xl font-extrabold text-purple-800 mb-6 text-center">
        Friends List
      </h2>
      {loading ? (
        <p className="text-center text-lg text-blue-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-2xl shadow-lg p-4 border-l-8 transition-transform transform hover:scale-105 hover:shadow-xl border-purple-400"
            >
              <div className="flex flex-col items-center">
                <img
                  src={user.avatar || "https://via.placeholder.com/150"}
                  alt={user.name}
                  className="rounded-full w-20 h-20 object-cover border-4 border-gray-300"
                />
                <h3 className="text-xl font-semibold text-gray-800 mt-3">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-600">Active Now</p>
                <button
                  onClick={() => handleCreateChat(user._id)}
                  className="btn btn-primary w-full mt-3"
                >
                  Start Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsPage;
