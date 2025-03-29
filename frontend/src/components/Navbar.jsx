import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../contexts/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
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
      <nav className="fixed top-0 left-0 w-full z-50" style={{ backgroundColor: 'var(--color-bg-navbar)', color: 'var(--color-text-navbar)' }}>
        <div className="container mx-auto flex justify-between items-center px-4 py-3">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 transition-colors" style={{ backgroundColor: 'var(--color-bg-navbar)', color: 'var(--color-text-navbar)' }}>
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        <Link to="/" className="text-2xl font-bold">Chat App</Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {!token ? (
            <>
              <Link to="/register">
                <button style={{ backgroundColor: 'var(--color-button-primary)', color: 'var(--color-text-navbar)' }} className="px-4 py-1.5 rounded-md transition-colors hover:opacity-90">
                  Register
                </button>
              </Link>
              <Link to="/login">
                <button style={{ backgroundColor: 'white', color: 'var(--color-bg-navbar)' }} className="px-4 py-1.5 rounded-md transition-colors hover:opacity-90">
                  Login
                </button>
              </Link>
              <ThemeToggle />
            </>
          ) : (
            <>
              <Link to="/home">
                <button 
                  className="px-4 py-1.5 rounded-md transition-colors" 
                  style={{ 
                    backgroundColor: isActive('/home') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    color: 'var(--color-text-navbar)'
                  }}
                >
                  Home
                </button>
              </Link>
              <Link to="/friends">
                <button 
                  className="px-4 py-1.5 rounded-md transition-colors" 
                  style={{ 
                    backgroundColor: isActive('/friends') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    color: 'var(--color-text-navbar)'
                  }}
                >
                  Friends
                </button>
              </Link>
              
              <ThemeToggle />
              
              <div className="relative" ref={desktopDropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-opacity-20 hover:bg-white/20 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                    <span className="text-sm font-bold">{userName.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{userName}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: 'var(--color-bg-dropdown)', borderColor: 'var(--color-border-dropdown)', color: 'var(--color-text-primary)' }}>
                    <div className="p-3 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
                      <p className="font-bold">{userName}</p>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{userEmail}</p>
                    </div>
                    <div>
                      <Link 
                        to="/profile"
                        className="block w-full text-left px-4 py-2 text-sm transition-colors hover:bg-opacity-10 hover:bg-gray-500"
                        onClick={() => setIsDropdownOpen(false)}
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-opacity-10 hover:bg-gray-500"
                        style={{ color: 'var(--color-text-error)' }}
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

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            className="p-1 rounded-md hover:bg-opacity-20 hover:bg-white/20 transition-colors"
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
              className="absolute right-0 top-full mt-1 w-48 rounded-lg shadow-lg overflow-hidden z-40"
              style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-light)' }}
            >
              <div className="flex flex-col p-2 space-y-1">
                {!token ? (
                  <>
                    <Link
                      to="/register"
                      className="text-left px-4 py-2 rounded-md transition-colors hover:bg-opacity-10 hover:bg-gray-500"
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Register
                    </Link>
                    <Link
                      to="/login"
                      className="text-left px-4 py-2 rounded-md transition-colors hover:bg-opacity-10 hover:bg-gray-500"
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Login
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/home"
                      className="text-left px-4 py-2 rounded-md transition-colors hover:bg-opacity-10 hover:bg-gray-500"
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{ 
                        backgroundColor: isActive('/home') ? 'var(--color-bg-highlight)' : 'transparent', 
                        color: 'var(--color-text-primary)' 
                      }}
                    >
                      Home
                    </Link>
                    <Link
                      to="/friends"
                      className="text-left px-4 py-2 rounded-md transition-colors hover:bg-opacity-10 hover:bg-gray-500"
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{ 
                        backgroundColor: isActive('/friends') ? 'var(--color-bg-highlight)' : 'transparent', 
                        color: 'var(--color-text-primary)' 
                      }}
                    >
                      Friends
                    </Link>
                    <Link
                      to="/profile"
                      className="text-left px-4 py-2 rounded-md transition-colors hover:bg-opacity-10 hover:bg-gray-500"
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{ 
                        backgroundColor: isActive('/profile') ? 'var(--color-bg-highlight)' : 'transparent', 
                        color: 'var(--color-text-primary)' 
                      }}
                    >
                      Profile
                    </Link>
                    <div className="border-t pt-2 mt-1" style={{ borderColor: 'var(--color-border-light)' }}>
                      <div className="px-4 py-2">
                        <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{userName}</p>
                        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{userEmail}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm rounded-md hover:bg-opacity-10 hover:bg-gray-500"
                        style={{ color: 'var(--color-text-error)' }}
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


