import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// Store the API URL in a variable at the top
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const[error, setError] = useState("");
  const[loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

        
        // Save JWT token in localStorage
        localStorage.setItem("token", data.token);

        console.log("Token saved in localStorage:", localStorage.getItem("token")); // Debugging
        //alert("Login successful!");

        
        localStorage.setItem("userId", data._id); // Save userId here
        console.log("Login successful. userId stored:", data._id);
        
        setFormData({ email: "", password: "" }); // Clear form

        navigate("/home")
      } else {
        setError(data.message || "Invalid Email or Password");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError("Failed to login.");
    } finally {
      setLoading(false); // Set loading to false after login attempt
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center text-blue-600">Login</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <button
            type="submit"
            className={`btn w-full ${loading ? "btn-disabled" : "btn-primary"}`}
            disabled={loading} // Disable button when loading
          >
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>

        <div className="text-center">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="link link-secondary">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
