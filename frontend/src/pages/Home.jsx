import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () =>{

    const navigate = useNavigate();

    useEffect(() => {
        // Retrieve token from localStorage
        const token = localStorage.getItem("token");
    
        if (!token) {
          // Redirect to login if no token found
          console.warn("No token found, redirecting to login...");
          navigate("/login");
        } else {
          console.log("Token found:", token);
          // You can now use the token for authenticated requests
        }
      }, [navigate]);

    return(
        <div>
            <h1>Welsome to the Home page</h1>
            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Impedit ipsum est animi delectus vel eveniet, quas provident voluptates repellat, magnam, eos facilis eligendi molestiae! Enim quasi accusantium dolor voluptatem velit.</p>
        </div>
    )
};
export default Home;