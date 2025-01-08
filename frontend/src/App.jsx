import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterForm from './pages/RegisterForm';
import LoginForm from './pages/LoginForm';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ChatPage from './pages/ChatPage';

function App() {

  const isAuthenticated = localStorage.getItem('token'); // Check authentication
  return (
    <Router>
      <Navbar />
      <div className="mt-8">
        <Routes>
          {/* Set the home page as the Register Form */}
          <Route path="/Home" element={ <Home/>} />
          <Route path="/ChatPage" element={ <ChatPage/>} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/" element={<RegisterForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
