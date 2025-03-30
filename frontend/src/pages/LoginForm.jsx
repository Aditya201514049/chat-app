import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

// Store the API URL in a variable at the top
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LoginForm = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the page they were trying to access before being redirected to login
  const from = location.state?.from?.pathname || "/home";
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data._id);
        setFormData({ email: "", password: "" });
        
        // Redirect them back to the page they were trying to access
        navigate(from, { replace: true });
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
      <div 
        className="w-full max-w-md p-8 space-y-6 rounded-xl shadow-lg transition-all duration-300"
        style={{ 
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border-light)'
        }}
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Welcome Back</h2>
          <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>Sign in to continue</p>
        </div>

        {error && (
          <div className="py-3 px-4 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-text-error)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium mb-2" 
              style={{ color: 'var(--color-text-primary)' }}
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3" style={{ color: 'var(--color-text-tertiary)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 w-full p-3 rounded-lg transition-all border focus:ring focus:outline-none"
                style={{ 
                  backgroundColor: 'var(--color-bg-input)',
                  color: 'var(--color-text-input)',
                  borderColor: 'var(--color-border-input)',
                }}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label 
                htmlFor="password" 
                className="block text-sm font-medium" 
                style={{ color: 'var(--color-text-primary)' }}
              >
                Password
              </label>
              <a 
                href="#" 
                className="text-xs font-medium hover:underline transition-all"
                style={{ color: 'var(--color-button-primary)' }}
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3" style={{ color: 'var(--color-text-tertiary)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 w-full p-3 rounded-lg transition-all border focus:ring focus:outline-none"
                style={{ 
                  backgroundColor: 'var(--color-bg-input)',
                  color: 'var(--color-text-input)',
                  borderColor: 'var(--color-border-input)',
                }}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 transition-all"
              style={{ 
                borderColor: 'var(--color-border-input)',
                accentColor: 'var(--color-button-primary)'
              }}
            />
            <label 
              htmlFor="remember-me" 
              className="ml-2 block text-sm" 
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Keep me signed in
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 flex justify-center items-center"
            style={{ 
              backgroundColor: loading ? 'var(--color-button-secondary)' : 'var(--color-button-primary)',
              color: 'var(--color-text-message-mine)',
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : "Sign in"}
          </button>
        </form>

        <div className="text-center pt-4">
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Don't have an account?{" "}
            <Link 
              to="/register" 
              className="font-medium hover:underline transition-all"
              style={{ color: 'var(--color-button-primary)' }}
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
