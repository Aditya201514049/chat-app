import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterForm from './pages/RegisterForm';
import LoginForm from './pages/LoginForm';
import Navbar from './components/Navbar';
import FriendsPage from './pages/FriendsPage';
import HomePage2 from './pages/HomePage2';

function App() {

  const isAuthenticated = localStorage.getItem('token'); // Check authentication
  return (
    <Router>
      <Navbar />
      <div className="mt-8">
        <Routes>
          {/* Set the home page as the Register Form */}
          
          
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/" element={<RegisterForm />} />
          <Route path="/second-home" element={<HomePage2 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
