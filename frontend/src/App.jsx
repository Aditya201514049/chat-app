import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import RegisterForm from "./pages/RegisterForm";
import LoginForm from "./pages/LoginForm";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FriendsPage from "./pages/FriendsPage";
import HomePage2 from "./pages/HomePage2";
import ProfilePage from "./pages/ProfilePage";
import AboutPage from "./pages/AboutPage";
import FAQPage from "./pages/FAQPage";
import ContactPage from "./pages/ContactPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import HelpPage from "./pages/HelpPage";
import FeedbackPage from "./pages/FeedbackPage";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { SocketProvider } from "./contexts/SocketContext";

// Protected route for authenticated users only
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token");
  const location = useLocation();
  
  if (!isAuthenticated) {
    // Redirect to login page, but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

// Route that's only accessible to non-authenticated users
const PublicOnlyRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token");
  
  if (isAuthenticated) {
    // If user is already logged in, redirect to home
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

// Wrapper component that uses location
const AppContent = () => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("token"); // Check authentication
  const { theme } = useTheme(); // Get current theme from context
  
  // Determine if we're on a chat page (to handle layout differently)
  const isChatPage = (pathname) => {
    return pathname === "/home" || (pathname === "/" && isAuthenticated);
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ 
      backgroundColor: 'var(--color-bg-primary)',
      color: 'var(--color-text-primary)'
    }}>
      <Navbar />

      {/* Main content with conditional padding */}
      <div className={`flex-1 ${isChatPage(location.pathname) ? "mt-16" : "mt-20"}`}>
        <Routes>
          {/* Public routes (only accessible when logged out) */}
          <Route 
            path="/login" 
            element={
              <PublicOnlyRoute>
                <LoginForm />
              </PublicOnlyRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicOnlyRoute>
                <RegisterForm />
              </PublicOnlyRoute>
            } 
          />
          
          {/* Protected routes (only accessible when logged in) */}
          <Route 
            path="/friends" 
            element={
              <ProtectedRoute>
                <FriendsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <HomePage2 />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Public information pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          
          {/* Root path - redirects based on auth status */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
              <Navigate to="/home" replace /> : 
              <Navigate to="/register" replace />
            } 
          />
          
          {/* Catch-all route for 404 */}
          <Route 
            path="*" 
            element={
              isAuthenticated ? 
              <Navigate to="/home" replace /> : 
              <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </div>

      {/* Footer conditionally shown */}
      {!isChatPage(location.pathname) && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
