import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { theme } = useTheme();

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
      <div className="container mx-auto px-4 py-12 mt-16 flex justify-center items-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 mt-16 flex justify-center">
        <div className="alert alert-error max-w-md shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold">Unable to load profile</h3>
            <div className="text-xs">Please try again later</div>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="btn btn-sm btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      {/* Profile header */}
      <div className="card bg-base-100 shadow-lg overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-primary to-secondary relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center text-3xl font-bold border-4 border-base-100">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
          </div>
        </div>
        <div className="pt-14 pb-6 px-8">
          <h1 className="text-2xl font-bold text-base-content">{user.name}</h1>
          <p className="text-base-content/60 mt-1">{user.email}</p>
        </div>
      </div>

      {/* Profile content */}
      <div className="card bg-base-100 shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-base-content">Account Information</h2>
        
        <div className="grid gap-4">
          <div className="border-b pb-4 border-base-300">
            <p className="text-sm text-base-content/60">Name</p>
            <p className="text-base font-medium text-base-content">{user.name}</p>
          </div>
          
          <div className="border-b pb-4 border-base-300">
            <p className="text-sm text-base-content/60">Email</p>
            <p className="text-base font-medium text-base-content">{user.email}</p>
          </div>
          
          <div className="border-b pb-4 border-base-300">
            <p className="text-sm text-base-content/60">Account ID</p>
            <p className="text-base font-medium text-base-content">{user._id}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/home")}
            className="btn btn-primary"
          >
            Go to Chat
          </button>
          <button
            onClick={handleLogout}
            className="btn btn-outline btn-error"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 