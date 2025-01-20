
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Store the API URL in a variable at the top
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Define 4 subtle background colors
const subtleColors = [
  "#E0F7FA", // Light Cyan
  "#F1F8E9", // Light Green
  "#FFF3E0", // Light Orange
  "#E8EAF6", // Light Indigo
];

const FriendsPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_URL}/api/users/profiles`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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
      const response = await fetch("http://localhost:5000/api/chats/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipientId }),
      });

      const chat = await response.json();

      if (response.ok) {
        // Redirect to HomePage with selected chat
        navigate("/home", { state: { selectedChat: chat } });
      } else {
        alert("Error creating chat");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Function to randomly pick a color for the card
  const getRandomColor = (index) => {
    const colorIndex = index % subtleColors.length;
    return subtleColors[colorIndex];
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-semibold text-center mb-8">Friends</h2>
      {loading ? (
        <p className="text-center text-lg">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {users.map((user, index) => (
            <div
              key={user._id}
              className="card shadow-lg rounded-lg overflow-hidden transition-transform duration-300 ease-in-out transform hover:scale-105"
              style={{ backgroundColor: getRandomColor(index) }} // Apply different color for each card
            >
              <figure className="flex justify-center items-center p-4">
                <img
                  src={user.avatar || "https://via.placeholder.com/150"}
                  alt={user.name}
                  className="rounded-full w-24 h-24 object-cover"
                />
              </figure>
              <div className="card-body text-center">
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-sm text-gray-500 mb-4">Active Now</p>
                <button
                  onClick={() => handleCreateChat(user._id)}
                  className="btn btn-primary w-full"
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
