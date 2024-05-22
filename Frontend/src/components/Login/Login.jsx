import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../Footer/Footer";
import "./Login.scss";

const Login = ({ onLogin }) => {
    const navigate = useNavigate(); // Initialize the navigate function
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
  
    const handleLogin = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5401/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
    
        if (response.ok) {
          // Login successful
          const data = await response.json();
          console.log(data);
          const accessToken = data.access_token;
          localStorage.setItem("access_token", accessToken);
    
          const roleResponse = await fetch("http://127.0.0.1:5401/api/get-role", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
            },
          });
    
          if (roleResponse.ok) {
            const roleData = await roleResponse.json();
            console.log(roleData);
            localStorage.setItem("user_role", roleData.role);
            
          } else {
            console.error("Failed to fetch user's role");
          }
    
          // Use navigate to redirect to the home page
          navigate("/home/account");
          window.location.reload()
        } else {
          setError("Invalid email or password");
        }
      } catch (error) {
        console.error("Error logging in:", error);
        setError("Error logging in. Please try again later.");
      }
    };
  

  return (
    <div className="login-container">
      <div className="login-sub-container">
        <div className="left">
          <img src="assets/images/banner.svg" alt="Banner" />
        </div>
        <div className="right">
          <div className="login-card">
            <img
              src="https://pl-app.iiit.ac.in/rcts/phcp/assets/images/user_profile.svg"
              alt="user"
            />
            <div className="form-control">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <div className="error">{error}</div>}
              <div className="action-buttons">
                <button onClick={handleLogin}>LOG IN</button>
                <button onClick={() => navigate("/signup")}>SIGN UP</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
