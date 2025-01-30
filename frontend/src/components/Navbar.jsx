
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// Store the API URL in a variable at the top
const API_URL = "http://localhost:5000";

const Navbar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(""); // State to store the user's name
  const [loading, setLoading] = useState(true); // Loading state to handle the asynchronous user info fetching
  const token = localStorage.getItem("token"); // Check if token exists

  // Fetch user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (token) {
        try {
          const response = await fetch(`${API_URL}/api/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUserName(data.name); // Set the user's name
          } else {
            console.error("Failed to fetch user info");
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }
      setLoading(false); // Set loading to false after fetching is complete
    };

    fetchUserInfo();
  }, [token]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    navigate("/login"); // Redirect to login page
  };

  // Loading spinner or loading state
  if (loading) {
    return (
      <nav className="fixed top-0 w-full bg-blue-600 text-white py-3 shadow-md z-50">
        <div className="container mx-auto flex justify-between items-center px-4">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 w-full bg-blue-600 text-white py-3 shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Chat App Heading */}
        <h1 className="text-2xl font-bold">
          Chat App
        </h1>

        {/* Navigation Links */}
        <div className="flex items-center space-x-4">
          {!token ? (
            <>
              {/* Before Login: Register and Login */}
              <Link to="/register">
                <button className="btn btn-secondary btn-sm hover:btn-accent">
                  Register
                </button>
              </Link>
              <Link to="/login">
                <button className="btn btn-primary btn-sm hover:btn-accent">
                  Login
                </button>
              </Link>
            </>
          ) : (
            <>
              {/* After Login: Navigation Links and Logout */}
              <Link to="/home">
                <button className="btn btn-primary btn-sm hover:btn-accent">
                  Home
                </button>
              </Link>

              <Link to="/friends">
                <button className="btn btn-primary btn-sm hover:btn-accent">
                  Friends
                </button>
              </Link>

              {userName && (
                <span className="text-sm font-medium">
                  {userName}
                </span>
              )}

              <button
                onClick={handleLogout}
                className="btn btn-error btn-sm hover:btn-warning"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
