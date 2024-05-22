import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../Footer/Footer";
import './Signup.scss';

const Signup = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [organization, setOrganization] = useState("");
    const [role, setRole] = useState("");
    const [logo, setLogo] = useState(null); // State to store the uploaded logo file
    const [error, setError] = useState("");

    const handleSignUpSubmit = async () => {
        if (!email || !password || !confirmPassword || !organization || !role) {
            setError("All fields are required");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("password", password);
            formData.append("organization", organization);
            formData.append("role", role)

            // Convert logo file to base64 before appending to form data
            if (logo) {
                const base64Logo = await convertFileToBase64(logo);
                formData.append("logo", base64Logo);
            }

            const response = await fetch("http://127.0.0.1:5401/api/signup", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                navigate("/login");
            } else {
                setError(data.error || "Error signing up. Please try again later.");
            }
        } catch (error) {
            setError("Error signing up. Please try again later.");
        }
    };

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    return (
        <div className="login-container">
            <div className="login-sub-container">
                <div className="left">
                    <img src="assets/images/banner.svg" alt="Banner" />
                </div>
                <div className="right">
                    <div className="login-card">
                        <img src="/assets/images/user_profile.svg" alt="user" />
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
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Organization"
                                value={organization}
                                onChange={(e) => setOrganization(e.target.value)}
                                required
                            />
                            <label htmlFor="logo" style={{ paddingRight: '150px', display: 'block' }}>Organization Logo:</label>
                            <input
                                type="file"
                                id="logo"
                                accept="image/*"
                                style={{ display: 'inline-block', verticalAlign: 'middle' }}
                                onChange={(e) => setLogo(e.target.files[0])}
                                required
                            />
                            {error && <div className="error">{error}</div>}
                            <div className="action-buttons">
                                <button onClick={() => navigate("/login")}>LOG IN</button>
                                <button onClick={handleSignUpSubmit}>SIGN UP</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Signup;
