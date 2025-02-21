
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Navbar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");
  const token = localStorage.getItem("token");

  const mobileDropdownRef = useRef(null);
  const desktopDropdownRef = useRef(null);

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
            setUserName(data.name);
            setUserEmail(data.email);
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }
      setLoading(false);
    };

    fetchUserInfo();
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    setActiveLink("");
    setIsMobileMenuOpen(false);
  };

  const handleLinkClick = (link) => {
    setActiveLink(link);
    setIsMobileMenuOpen(false);
  };

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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {!token ? (
            <>
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
              <div className="relative" ref={desktopDropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
            </>
          )}
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="md:hidden relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            className="text-white focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div
              ref={mobileDropdownRef}
              className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-40 border border-gray-700"
            >
              <div className="flex flex-col p-2 space-y-2">
                {!token ? (
                  <>
                    <Link
                      to="/register"
                      onClick={() => handleLinkClick("register")}
                      className="text-left px-4 py-2 hover:bg-gray-700 rounded-md text-white"
                    >
                      Register
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => handleLinkClick("login")}
                      className="text-left px-4 py-2 hover:bg-gray-700 rounded-md text-white"
                    >
                      Login
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/home"
                      onClick={() => handleLinkClick("home")}
                      className="text-left px-4 py-2 hover:bg-gray-700 rounded-md text-white"
                    >
                      Home
                    </Link>
                    <Link
                      to="/friends"
                      onClick={() => handleLinkClick("friends")}
                      className="text-left px-4 py-2 hover:bg-gray-700 rounded-md text-white"
                    >
                      Friends
                    </Link>
                    <div className="border-t border-gray-700 pt-2">
                      <div className="px-4 py-2">
                        <p className="font-bold text-white">{userName}</p>
                        <p className="text-sm text-gray-400">{userEmail}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 rounded-md text-red-400"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


