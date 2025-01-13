import React, {useEffect, useState} from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(""); // State to store the user's name
  const token = localStorage.getItem("token"); // Check if token exists

    // Fetch user info
    useEffect(() => {
      const fetchUserInfo = async () => {
        if (token) {
          try {
            const response = await fetch("http://localhost:5000/api/users/me", {
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
      };
  
      fetchUserInfo();
    }, [token]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    navigate("/login"); // Redirect to login page
  };

  return (
    <nav className="bg-blue-600 text-white py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Chat App Heading */}
        <h1 className="text-2xl font-bold">
          <Link to="/" className="hover:underline">
            Chat App
          </Link>
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
              {/* After Login: Logout */}

              

              <Link to="/second-home">
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
