import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          console.error("Failed to fetch user data");
          if (response.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <p className="text-red-600">Unable to load user profile. Please try again later.</p>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Profile header */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 bg-blue-700 rounded-full border-4 border-white flex items-center justify-center text-white text-3xl font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
          </div>
        </div>
        <div className="pt-14 pb-6 px-8">
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-600 mt-1">{user.email}</p>
        </div>
      </div>

      {/* Profile content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h2>
        
        <div className="grid gap-4">
          <div className="border-b border-gray-100 pb-4">
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-base font-medium text-gray-900">{user.name}</p>
          </div>
          
          <div className="border-b border-gray-100 pb-4">
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-base font-medium text-gray-900">{user.email}</p>
          </div>
          
          <div className="border-b border-gray-100 pb-4">
            <p className="text-sm text-gray-500">Account ID</p>
            <p className="text-base font-medium text-gray-900">{user._id}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/home")}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Go to Chat
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 