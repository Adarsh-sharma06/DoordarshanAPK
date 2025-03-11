import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, signInWithEmailAndPassword, doc, getDoc } from "../../service/firebase"; // Import Firebase services
import { toast, ToastContainer } from "react-toastify"; // Correctly import toast and ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import the necessary CSS for toast
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    toast.dismiss(); // Clear any previous toast messages

    try {
      // Sign in user using Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("User logged in:", user); // Debug: Check user object

      // Fetch user data from Firestore using user.uid (not email)
      const userDocRef = doc(db, "users", user.email); // Using user.uid instead of user.email
      const userDocSnap = await getDoc(userDocRef);

      // console.log("User document snapshot:", userDocSnap.exists()); // Debug: Check if document exists

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const role = userData.role; // Assuming each user has a "role" field
        console.log("User data:", userData); // Debug: Check user data

        // Redirect based on the user's role
        if (role === "Admin") {
          navigate("/Admin/Dashboard");
        } else if (role === "Driver") {
          navigate("/DriverDashboard");
        } else if (role === "Reporter") {
          navigate("/Reporter/ReporterDashboard"); // Fixed typo in route
        } else {
          toast.error("Unknown role");
        }
      } else {
        toast.error("User not found in Firestore");
      }
    } catch (error) {
      console.error("Error during login:", error); // Debug: Log the error
      toast.error("Invalid credentials");
      setPassword(""); // Clear password on failure
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
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
          <h2>Login</h2>
        </div>
        <form onSubmit={handleLogin}>
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
          {/* Password Field */}
          <div className="input-group my-5">
            <i className="bi bi-lock input-icon"></i>
            <input
              className="ms-2"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <i
              className={`bi password-toggle ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
              onClick={togglePasswordVisibility}
            ></i>
          </div>
          {/* Remember Me and Forgot Password */}
          <div className="options">
            <label>
              <input
                className="ms-2"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember Me
            </label>

            <a href="/ForgotPassword" className="forgot-password my-3">
              Forgot Password?
            </a>

          </div>
          <button className="Login-button mx-auto my-5">Login</button>

          <button className="google-button mx-auto mt-5">
            <i className="bi bi-google"></i> Login with Google
          </button>
        </form>
      </div>

      {/* Toast container to display toast messages */}
      <ToastContainer />
    </div>
  );
}

export default Login;
