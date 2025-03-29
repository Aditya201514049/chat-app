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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-32 rounded-lg mb-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}></div>
          <div className="h-8 rounded w-1/4 mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}></div>
          <div className="h-4 rounded w-1/2 mb-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}></div>
          <div className="h-48 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-error)' }}>
          <p>Unable to load user profile. Please try again later.</p>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 rounded-md transition-colors"
          style={{ 
            backgroundColor: 'var(--color-button-primary)', 
            color: 'white'
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Profile header */}
      <div className="rounded-lg shadow-sm overflow-hidden mb-6" style={{ backgroundColor: 'var(--color-bg-card)' }}>
        <div className="h-32 relative" style={{ 
          background: `linear-gradient(to right, var(--color-bg-gradient-start), var(--color-bg-gradient-end))` 
        }}>
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center text-white text-3xl font-bold" 
              style={{ 
                backgroundColor: 'var(--color-bg-avatar)',
                borderColor: 'var(--color-bg-card)'
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
          </div>
        </div>
        <div className="pt-14 pb-6 px-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{user.name}</h1>
          <p style={{ color: 'var(--color-text-tertiary)' }} className="mt-1">{user.email}</p>
        </div>
      </div>

      {/* Profile content */}
      <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--color-bg-card)' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Account Information</h2>
        
        <div className="grid gap-4">
          <div className="border-b pb-4" style={{ borderColor: 'var(--color-border-light)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Name</p>
            <p className="text-base font-medium" style={{ color: 'var(--color-text-primary)' }}>{user.name}</p>
          </div>
          
          <div className="border-b pb-4" style={{ borderColor: 'var(--color-border-light)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Email</p>
            <p className="text-base font-medium" style={{ color: 'var(--color-text-primary)' }}>{user.email}</p>
          </div>
          
          <div className="border-b pb-4" style={{ borderColor: 'var(--color-border-light)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Account ID</p>
            <p className="text-base font-medium" style={{ color: 'var(--color-text-primary)' }}>{user._id}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/home")}
            className="px-4 py-2 rounded-md transition-colors"
            style={{ 
              backgroundColor: 'var(--color-button-secondary)', 
              color: 'var(--color-text-primary)'
            }}
          >
            Go to Chat
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-md transition-colors"
            style={{ 
              backgroundColor: 'var(--color-button-danger)', 
              color: 'white'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 