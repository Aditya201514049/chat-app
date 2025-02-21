
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

// Store the API URL in a variable at the top
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Navbar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(""); // State to store the user's name
  const [userEmail, setUserEmail] = useState(""); // State to store the user's email
  const [loading, setLoading] = useState(true); // Loading state for user info fetching
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Desktop user dropdown state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile hamburger menu state
  const [activeLink, setActiveLink] = useState(""); // State to track the active link
  const token = localStorage.getItem("token"); // Check if token exists

  const mobileDropdownRef = useRef(null);
  const desktopDropdownRef = useRef(null);

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
            setUserEmail(data.email); // Set the user's email
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
    setActiveLink(""); // Reset active link on logout
    setIsMobileMenuOpen(false);
  };

  // Set active link when clicked
  const handleLinkClick = (link) => {
    setActiveLink(link);
    setIsMobileMenuOpen(false);
  };

  // Toggle the desktop dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown if clicking outside (desktop)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Loading state
  if (loading) {
    return (
      <nav className="fixed top-0 left-0 w-full bg-blue-600 text-white py-3 shadow-md z-50">
        <div className="container mx-auto flex justify-between items-center px-4">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 w-full bg-blue-600 text-white p-4 z-50">
      <div className="container mx-auto flex justify-between items-center px-4">
        <h1 className="text-2xl font-bold">Chat App</h1>

        {/* Desktop Navigation (visible on md and up) */}
        <div className="hidden md:flex items-center space-x-4">
          {!token ? (
            <>
              <Link to="/register">
                <button
                  onClick={() => handleLinkClick("register")}
                  className={`btn btn-secondary btn-sm hover:btn-accent ${
                    activeLink === "register" ? "bg-blue-700" : ""
                  }`}
                >
                  Register
                </button>
              </Link>
              <Link to="/login">
                <button
                  onClick={() => handleLinkClick("login")}
                  className={`btn btn-primary btn-sm hover:btn-accent ${
                    activeLink === "login" ? "bg-blue-700" : ""
                  }`}
                >
                  Login
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/home">
                <button
                  onClick={() => handleLinkClick("home")}
                  className={`btn btn-primary btn-sm hover:btn-accent ${
                    activeLink === "home" ? "bg-blue-700" : ""
                  }`}
                >
                  Home
                </button>
              </Link>

              <Link to="/friends">
                <button
                  onClick={() => handleLinkClick("friends")}
                  className={`btn btn-primary btn-sm hover:btn-accent ${
                    activeLink === "friends" ? "bg-blue-700" : ""
                  }`}
                >
                  Friends
                </button>
              </Link>

              {userName && (
                <div className="relative" ref={desktopDropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="text-sm font-medium hover:text-gray-300"
                  >
                    {userName}
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white text-black border rounded-lg shadow-lg">
                      <div className="p-2">
                        <p className="font-bold">{userName}</p>
                        <p className="text-sm">{userEmail}</p>
                      </div>
                      <div className="border-t">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-200"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Hamburger (visible on small screens) */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white focus:outline-none"
          >
            {isMobileMenuOpen ? (
              // Close (X) icon
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              // Hamburger icon
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-600 text-white px-4 pt-2 pb-4">
          {!token ? (
            <>
              <Link to="/register" onClick={() => handleLinkClick("register")}>
                <button className="block w-full text-left py-2">
                  Register
                </button>
              </Link>
              <Link to="/login" onClick={() => handleLinkClick("login")}>
                <button className="block w-full text-left py-2">Login</button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/home" onClick={() => handleLinkClick("home")}>
                <button className="block w-full text-left py-2">Home</button>
              </Link>
              <Link to="/friends" onClick={() => handleLinkClick("friends")}>
                <button className="block w-full text-left py-2">Friends</button>
              </Link>
              <div className="border-t border-blue-500 pt-2">
                <div className="py-1">
                  <p className="font-bold">{userName}</p>
                  <p className="text-sm">{userEmail}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-red-500"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;



