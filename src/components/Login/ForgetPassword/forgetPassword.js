import React, { useState } from "react";
import { auth, sendPasswordResetEmail } from "../../../service/firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the necessary CSS for toast
import "./ForgotPassword.css"; // Create and link this CSS file for additional styling

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    toast.dismiss(); // Clear any previous toast messages

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error) {
      toast.error("Error sending password reset email. Please try again.");
    }
  };

  return (
    <div className="forgot-password-container">
      {/* Left Side */}
      <div className="left-side">
        <div className="logo-heading">
          <h2>Doordarshan</h2>
        </div>
        <img src="/images/DD2.png" alt="Logo" className="logo" />
      </div>

      {/* Right Side */}
      <div className="right-side">
        <div className="logo-heading-right">
          <h2>Forgot Password</h2>
        </div>
        <form onSubmit={handlePasswordReset}>
          {/* Email Field */}
          <div className="input-group">
            <i className="bi bi-envelope input-icon"></i>
            <input
              className="ms-2"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="middle mt-3">
          <button type="submit" className="reset-button mx-auto my-5">
            Send Reset Link
          </button>
          </div>
        </form>
      </div>

      {/* Toast container to display toast messages */}
      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;
