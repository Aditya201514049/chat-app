
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegisterForm from "./pages/RegisterForm";
import LoginForm from "./pages/LoginForm";
import Navbar from "./components/Navbar";
import FriendsPage from "./pages/FriendsPage";
import HomePage2 from "./pages/HomePage2";

function App() {
  const isAuthenticated = localStorage.getItem("token"); // Check authentication

  return (
    <Router>
      {/* Fixed Navbar */}
      <Navbar />
      {/* Content Section with padding to avoid overlap */}
      <div className="mt-[64px]">
        <Routes>
          {/* Define routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/home" element={<HomePage2 />} />
          
          {/* Dynamic route based on authentication */}
          <Route
            path="/"
            element={isAuthenticated ? <HomePage2 /> : <RegisterForm />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
