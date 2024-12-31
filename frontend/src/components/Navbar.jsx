import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // Check if token exists

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
