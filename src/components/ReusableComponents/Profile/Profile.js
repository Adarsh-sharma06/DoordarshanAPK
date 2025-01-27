// Profile.js
import React, { useState, useEffect } from "react";
import { db, doc, getDoc, updateDoc } from "../../../service/firebase";
import { getAuth } from "firebase/auth";
import { storage } from "../../../service/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Tabs, Tab } from "react-bootstrap";
import Navbar from "../../ReusableComponents/Navbar/Navbar"; // Import Navbar
import Sidebar from "../../ReusableComponents/Sidebar/Sidebar"; // Import Sidebar
import "./Profile.css"; // Import the custom CSS file

const Profile = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [profileName, setProfileName] = useState("");
  const [profileImg, setProfileImg] = useState("");
  const [newProfileImg, setNewProfileImg] = useState(null);
  const [loading, setLoading] = useState(true);

  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [joinedDate, setJoinedDate] = useState("");

  // States for password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [activeTab, setActiveTab] = useState("profile");

  const menuSections = [
    {
      heading: "Main Menu",
      items: [
        { name: "Dashboard", link: "/Admin/Dashboard", icon: "bi bi-speedometer2" },
      ],
    },
  
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.email);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfileName(userData.name || "User");
            setProfileImg(userData.profileImage || "/images/default-profile.png");
            setMobileNumber(userData.phone || "Not Available");
            setEmail(userData.email || "Not Available");
            setRole(userData.role || "User");
            setJoinedDate(new Date(userData.joinedDate).toLocaleDateString() || "N/A");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleNameChange = (e) => setProfileName(e.target.value);
  const handleFileChange = (e) => setNewProfileImg(e.target.files[0]);
  
  const handleProfileUpdate = async () => {
    if (!profileName || !currentUser) return;

    setLoading(true);
    try {
      const userDocRef = doc(db, "users", currentUser.email);
      await updateDoc(userDocRef, { name: profileName });

      if (newProfileImg) {
        const imageRef = ref(storage, `profileImages/${currentUser.email}`);
        const uploadTask = uploadBytesResumable(imageRef, newProfileImg);

        uploadTask.on(
          "state_changed",
          null,
          (error) => console.error("Upload error:", error),
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await updateDoc(userDocRef, { profileImage: downloadURL });
            setProfileImg(downloadURL);
          }
        );
      }

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    alert("Password updated successfully!");
  };

  if (loading) return <div className="text-center">Loading...</div>;

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar
        menuSections={menuSections}
        showLogout={true}
      />
      {/* Main Content */}
      <div className="main-content flex-grow-1">
        {/* Navbar */}
        <Navbar title="Profile" userEmail={currentUser?.email || "Guest"} />

        {/* Profile Page */}
        <div className="profile-page container">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            id="profile-tabs"
            className="mb-4"
          >
            <Tab eventKey="profile" title="Profile">
              <div className="profile-info text-center mt-4">
                <div className="profile-img-container mb-4">
                  <img
                    src={profileImg}
                    alt="Profile"
                    className="profile-img rounded-circle"
                  />
                </div>
                <div className="profile-details-card">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label><strong>Name:</strong></label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={handleNameChange}
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label><strong>Mobile Number:</strong></label>
                      <input
                        type="text"
                        value={mobileNumber}
                        readOnly
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label><strong>Email:</strong></label>
                      <input
                        type="text"
                        value={email}
                        readOnly
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label><strong>Role:</strong></label>
                      <input
                        type="text"
                        value={role}
                        readOnly
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label><strong>Joined Date:</strong></label>
                      <input
                        type="text"
                        value={joinedDate}
                        readOnly
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label><strong>Change Profile Picture:</strong></label>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="form-control-file"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleProfileUpdate}
                    className="btn btn-primary mt-4 px-5 py-2"
                  >
                    Update Profile
                  </button>
                </div>
              </div>
            </Tab>

            <Tab eventKey="password" title="Change Password">
              <div className="password-change mt-4">
                <label><strong>Current Password:</strong></label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="form-control"
                />
                <br />
                <label><strong>New Password:</strong></label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-control"
                />
                <br />
                <label><strong>Confirm New Password:</strong></label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-control"
                />
                <br />
                <button
                  onClick={handlePasswordChange}
                  className="btn btn-warning mt-4 px-5 py-2"
                >
                  Change Password
                </button>
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
