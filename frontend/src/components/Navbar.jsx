import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-blue-500 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">Chat-app</h1>
        <div className="space-x-4">
          <Link
            to="/register"
            className="text-white py-2 px-4 rounded bg-blue-700 hover:bg-blue-800"
          >
            Register
          </Link>
          <Link
            to="/login"
            className="text-white py-2 px-4 rounded bg-blue-700 hover:bg-blue-800"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
