import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../../service/firebase";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import "./Navbar.css";

const Navbar = ({ title, userEmail }) => {
  const [profileName, setProfileName] = useState("User");
  const [profileImg, setProfileImg] = useState("/images/default-profile.png");
  const navigate = useNavigate();

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
        navigate("/"); // Navigate to login page
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

  return (
    <nav className="navbar">
      {/* Left Section: Title */}
      <div className="navbar-left">
        <h1>{title}</h1>
      </div>

      {/* Center Section: Search */}
      <div className="navbar-center">
        {/* You can make the search bar toggleable with a button if needed */}
      </div>

      {/* Right Section: Profile */}
      <div className="navbar-right">
        <div className="profile">
          <img
            src={profileImg}
            alt="Profile"
            className="profile-img"
            onClick={handleProfileClick}
          />
          <span>{profileName}</span>
          <div className="dropdown">
            <button
              className="btn btn-sm btn-secondary dropdown-toggle optionMenu"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {/* Removed dropdown arrow */}
            </button>
            <ul className="dropdown-menu profile-dropdown">
              <li>
                <button className="dropdown-item" onClick={handleProfileClick}>
                  <i className="bi bi-people-fill"></i> View Profile
                </button>
              </li>
              <li>
                <button className="dropdown-item text-danger" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i> Logout
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
