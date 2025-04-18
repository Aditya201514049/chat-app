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
    const handleClickOrTouchOutside = (event) => {
      // Handle desktop dropdown
      if (
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
      
      // Handle mobile dropdown - need to check if clicked/touched element is not the toggle button
      const toggleButton = document.querySelector('[data-mobile-toggle="true"]');
      const isToggleButtonClick = toggleButton && (
        toggleButton === event.target || 
        toggleButton.contains(event.target)
      );
      
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target) &&
        !isToggleButtonClick
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    // Add multiple event listeners for different device types
    document.addEventListener("mousedown", handleClickOrTouchOutside);
    document.addEventListener("touchstart", handleClickOrTouchOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOrTouchOutside);
      document.removeEventListener("touchstart", handleClickOrTouchOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Custom styles to override DaisyUI defaults
  const navLinkStyles = {
    active: "bg-white !text-primary font-bold !important", // Use !important to override any other styles
    default: "text-primary-content hover:bg-primary-focus/30"
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prevState => !prevState);
  };

  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setIsDropdownOpen(prevState => !prevState);
  };

  if (loading) {
    return (
      <div className="navbar bg-gradient-to-r from-primary/90 to-primary fixed top-0 left-0 w-full z-50 shadow-md">
        <div className="navbar-start">
          <span className="text-xl font-bold text-primary-content">Chat App</span>
        </div>
        <div className="navbar-end">
          <span className="loading loading-spinner loading-sm text-primary-content"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="navbar bg-gradient-to-r from-primary/90 to-primary fixed top-0 left-0 w-full z-50 shadow-md">
      <div className="navbar-start">
        <div className="dropdown">
          <div 
            tabIndex={0} 
            role="button" 
            className="btn btn-ghost text-primary-content lg:hidden"
            data-mobile-toggle="true"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            )}
          </div>
          <ul 
            tabIndex={0} 
            className={`menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow rounded-box w-52 ${isMobileMenuOpen ? 'block' : 'hidden'}`}
            ref={mobileDropdownRef}
            style={{ 
              backgroundColor: 'var(--color-bg-dropdown)',
              borderColor: 'var(--color-border-dropdown)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            {token ? (
              <>
                <li>
                  <Link 
                    to="/home" 
                    style={{ 
                      color: isActive('/home') ? 'var(--color-button-primary)' : 'var(--color-text-primary)',
                      fontWeight: isActive('/home') ? 'bold' : 'normal'
                    }}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/friends" 
                    style={{ 
                      color: isActive('/friends') ? 'var(--color-button-primary)' : 'var(--color-text-primary)',
                      fontWeight: isActive('/friends') ? 'bold' : 'normal'
                    }}
                  >
                    Friends
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/profile"
                    style={{ 
                      color: isActive('/profile') ? 'var(--color-button-primary)' : 'var(--color-text-primary)',
                      fontWeight: isActive('/profile') ? 'bold' : 'normal'
                    }}
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <a onClick={handleLogout} style={{ color: 'var(--color-text-error)' }}>Logout</a>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link 
                    to="/login" 
                    style={{ 
                      color: isActive('/login') ? 'var(--color-button-primary)' : 'var(--color-text-primary)',
                      fontWeight: isActive('/login') ? 'bold' : 'normal'
                    }}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    style={{ 
                      color: isActive('/register') ? 'var(--color-button-primary)' : 'var(--color-text-primary)',
                      fontWeight: isActive('/register') ? 'bold' : 'normal'
                    }}
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost text-xl text-primary-content">Chat App</Link>
      </div>
      
      {/* Desktop navigation links */}
      <div className="navbar-center hidden lg:flex">
        {token ? (
          <ul className="menu menu-horizontal px-1">
            <li className="mx-1">
              <Link
                to="/home"
                style={{ 
                  backgroundColor: isActive('/home') ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
                  color: isActive('/home') ? 'var(--color-button-primary)' : 'var(--color-text-navbar)'
                }}
                className="font-medium hover:bg-primary-focus/30"
              >
                Home
              </Link>
            </li>
            <li className="mx-1">
              <Link
                to="/friends"
                style={{ 
                  backgroundColor: isActive('/friends') ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
                  color: isActive('/friends') ? 'var(--color-button-primary)' : 'var(--color-text-navbar)'
                }}
                className="font-medium hover:bg-primary-focus/30"
              >
                Friends
              </Link>
            </li>
          </ul>
        ) : null}
      </div>
      
      <div className="navbar-end">
        <ThemeToggle />
        
        {!token ? (
          <div className="flex items-center gap-2 ml-2">
            <Link 
              to="/login" 
              className="btn btn-sm btn-ghost hover:bg-primary-focus/50"
              style={{ 
                color: 'var(--color-text-navbar)',
                backgroundColor: isActive('/login') ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
              }}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="btn btn-sm" 
              style={{ 
                backgroundColor: isActive('/register') ? 'rgba(255, 255, 255, 0.9)' : 'var(--color-bg-elevated)',
                color: isActive('/register') ? 'var(--color-button-primary)' : 'var(--color-text-primary)'
              }}
            >
              Register
            </Link>
          </div>
        ) : (
          <div className="dropdown dropdown-end ml-2" ref={desktopDropdownRef}>
            <div 
              tabIndex={0} 
              role="button" 
              className="btn btn-ghost btn-circle avatar placeholder"
              onClick={toggleProfileDropdown}
            >
              <div className="rounded-full w-10" style={{ 
                backgroundColor: 'var(--color-bg-elevated)',
                color: 'var(--color-button-primary)'
              }}>
                <span>{userName.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <ul tabIndex={0} className={`menu dropdown-content menu-sm z-[1] p-2 shadow bg-base-100 rounded-box w-52 mt-4 ${isDropdownOpen ? 'block' : 'hidden'}`} style={{ 
              backgroundColor: 'var(--color-bg-dropdown)',
              borderColor: 'var(--color-border-dropdown)',
              boxShadow: 'var(--shadow-md)'
            }}>
              <li className="p-2 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
                <div className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{userName}</div>
                <div className="text-xs opacity-60" style={{ color: 'var(--color-text-tertiary)' }}>{userEmail}</div>
              </li>
              <li>
                <Link
                  to="/profile"
                  style={{ 
                    backgroundColor: isActive('/profile') ? 'var(--color-bg-highlight)' : '',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </Link>
              </li>
              <li>
                <a onClick={handleLogout} style={{ color: 'var(--color-text-error)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </a>
              </li>
            </ul>
            </div>
          )}
        </div>
      </div>
  );
};

export default Navbar;


