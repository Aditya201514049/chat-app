import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
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
        <Link to="/" className="text-2xl font-bold">Chat App</Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {!token ? (
            <>
              <Link to="/register">
                <button className="px-4 py-1.5 bg-blue-500 hover:bg-blue-700 text-white rounded-md transition-colors">
                  Register
                </button>
              </Link>
              <Link to="/login">
                <button className="px-4 py-1.5 bg-white text-blue-600 hover:bg-gray-100 rounded-md transition-colors">
                  Login
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/home">
                <button className={`px-4 py-1.5 rounded-md transition-colors ${isActive('/home') ? 'bg-blue-700 text-white' : 'hover:bg-blue-700 text-white'}`}>
                  Home
                </button>
              </Link>
              <Link to="/friends">
                <button className={`px-4 py-1.5 rounded-md transition-colors ${isActive('/friends') ? 'bg-blue-700 text-white' : 'hover:bg-blue-700 text-white'}`}>
                  Friends
                </button>
              </Link>
              <div className="relative" ref={desktopDropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-blue-700"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center">
                    <span className="text-sm font-bold">{userName.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{userName}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-black border rounded-lg shadow-lg">
                    <div className="p-2 border-b">
                      <p className="font-bold">{userName}</p>
                      <p className="text-sm text-gray-500">{userEmail}</p>
                    </div>
                    <div>
                      <Link 
                        to="/profile"
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
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
                      className="text-left px-4 py-2 hover:bg-gray-700 rounded-md text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                    <Link
                      to="/login"
                      className="text-left px-4 py-2 hover:bg-gray-700 rounded-md text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/home"
                      className="text-left px-4 py-2 hover:bg-gray-700 rounded-md text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <Link
                      to="/friends"
                      className="text-left px-4 py-2 hover:bg-gray-700 rounded-md text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Friends
                    </Link>
                    <Link
                      to="/profile"
                      className="text-left px-4 py-2 hover:bg-gray-700 rounded-md text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
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


