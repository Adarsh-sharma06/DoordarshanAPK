import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../../service/firebase"; // Import auth
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { signOut } from "firebase/auth"; // Import signOut from Firebase
import "./Navbar.css";

const Navbar = ({ title, userEmail }) => {
  const [profileName, setProfileName] = useState("User");
  const [profileImg, setProfileImg] = useState("/images/default-profile.png");
  const navigate = useNavigate(); // Initialize navigate

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userEmail) return;

      try {
        const userDocRef = doc(db, "users", userEmail);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileName(userData.name || "User");
          setProfileImg(userData.profileImage || "/images/default-profile.png");
        } else {
          console.warn("No user data found for the provided email.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userEmail]);

  // Handle Logout functionality
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User logged out");
        
        // Redirect to the login page after logging out
        navigate("/");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  // Handle Profile click
  const handleProfileClick = () => {
    console.log("Profile clicked");
    navigate("/Profile"); // Navigate to the profile page
  };

  // Handle Settings click
  const handleSettingsClick = () => {
    console.log("Settings clicked");
    // You can add settings click logic here
  };

  return (
    <nav className="navbar">
      {/* Left Section: Title */}
      <div className="navbar-left">
        <h1>{title}</h1>
      </div>

      {/* Right Section: Profile */}
      <div className="navbar-right">
        <div className="profile">
          <img
            src={profileImg}
            alt="Profile"
            className="profile-img"
            onClick={handleProfileClick} // Navigate to profile page
          />
          <span>{profileName}</span>
          <div className="dropdown">
            <button
              className="btn btn-sm btn-secondary dropdown-toggle"
              type="button"
              id="profileMenu"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-three-dots-vertical"></i>
            </button>
            <ul className="dropdown-menu profile-dropdown " aria-labelledby="profileMenu">
              <li>
                <button className="dropdown-item" onClick={handleProfileClick}>
                  View Profile
                </button>
              </li>
             
              <li>
                <button className="dropdown-item text-danger" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  title: PropTypes.string.isRequired,
  userEmail: PropTypes.string.isRequired,
};

export default Navbar;
