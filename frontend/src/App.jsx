import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import RegisterForm from "./pages/RegisterForm";
import LoginForm from "./pages/LoginForm";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FriendsPage from "./pages/FriendsPage";
import HomePage2 from "./pages/HomePage2";
import ProfilePage from "./pages/ProfilePage";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SocketProvider } from "./contexts/SocketContext";

// Wrapper component that uses location
const AppContent = () => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("token"); // Check authentication
  
  // Determine if we're on a chat page (to handle layout differently)
  const isChatPage = (pathname) => {
    return pathname === "/home" || (pathname === "/" && isAuthenticated);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      {/* Main content with conditional padding */}
      <div className={`flex-1 ${isChatPage(location.pathname) ? "mt-16" : "mt-20"}`}>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/home" element={<HomePage2 />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/" element={isAuthenticated ? <HomePage2 /> : <RegisterForm />} />
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
