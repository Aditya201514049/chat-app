

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegisterForm from "./pages/RegisterForm";
import LoginForm from "./pages/LoginForm";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FriendsPage from "./pages/FriendsPage";
import HomePage2 from "./pages/HomePage2";

function App() {
  const isAuthenticated = localStorage.getItem("token"); // Check authentication

  return (
    <Router>
      {/* Use flex and min-h-screen on the outermost div */}
      <div className="flex flex-col min-h-screen">
        <Navbar />

        {/* Main content */}
        <div className="flex-1 mt-20">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/home" element={<HomePage2 />} />
            <Route path="/" element={isAuthenticated ? <HomePage2 /> : <RegisterForm />} />
          </Routes>
        </div>

        {/* Footer stays at the bottom */}
        <Footer />
      </div>
    </Router>
  );
}


export default App;
