import React, { useState, useEffect } from "react";
import { TextField, Button, MenuItem, Box, Typography } from "@mui/material";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../../../../service/firebase"; // Adjust the path as needed
import Sidebar from "../../../ReusableComponents/Sidebar/Sidebar"; // Adjust the path as needed
import Navbar from "../../../ReusableComponents/Navbar/Navbar"; // Adjust the path as needed
import { onAuthStateChanged } from "firebase/auth"; // To track auth state

const AddUserForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Reporter", // Default role
    profileImage: "", // Profile image URL
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userEmail, setUserEmail] = useState(""); // State to track logged-in user's email

  // Track the logged-in user's email
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error message on input change
    setSuccess(""); // Clear success message on input change
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, role, profileImage, password, confirmPassword } = formData;

    // Validate input
    if (!name || !email || !phone || !profileImage || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      setSuccess("");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setSuccess("");
      return;
    }

    try {
      // Create user in Firebase Authentication
      await createUserWithEmailAndPassword(auth, email, password);

      // Save user data to Firebase Firestore using email as document ID
      await setDoc(doc(db, "users", email), {
        name,
        email,
        phone,
        role,
        profileImage,
        joinedDate: new Date().toISOString(),
      });

      // If successful, show a success message
      setSuccess("User created successfully!");
      setError("");

      // Clear form data
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "Reporter",
        profileImage: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Error creating user: ", err);

      if (err.code === "auth/email-already-in-use") {
        setError("The email address is already in use.");
      } else if (err.code === "resource-exhausted") {
        setError("Quota exceeded. Please try again later.");
      } else {
        setError("Error creating user. Please try again.");
      }

      setSuccess("");
    }
  };

  // Sidebar menu sections
  const menuSections = [
    {
      heading: "Main Menu",
      items: [
        { name: "Dashboard", link: "/Admin/Dashboard", icon: "bi bi-speedometer2" },
        { name: "Tracker", link: "/Admin/Tracker", icon: "bi bi-map" },
        { name: "Reports", link: "/Admin/Reports/Report", icon: "bi bi-bar-chart" },
      ],
    },
    {
      heading: "Administration",
      items: [
        { name: "Create Users", link: "/Admin/Dashboard/CreateUser", icon: "bi bi-people" },
      ],
    },
  ];

  return (
    <div className="Reports-container">
      {/* Sidebar */}
      <Sidebar logoText="Doordarshan" menuSections={menuSections} showLogout={true} />

      {/* Main Content */}
      <div className="Reports-content">
        <Navbar title="Add User" userEmail={userEmail} />

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            maxWidth: 400,
            mx: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            backgroundColor: "#f9f9f9",
            borderRadius: 2,
            boxShadow: 1,
            marginTop: "30px",
          }}
        >
          <Typography variant="h5" textAlign="center" gutterBottom>
            Add User
          </Typography>

          {/* Error and Success Messages */}
          {error && (
            <Typography color="error" textAlign="center">
              {error}
            </Typography>
          )}
          {success && (
            <Typography color="primary" textAlign="center">
              {success}
            </Typography>
          )}

          {/* Form Fields */}
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            type="email"
          />
          <TextField
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            type="tel"
          />
          <TextField
            label="Role"
            name="role"
            select
            value={formData.role}
            onChange={handleChange}
            required
          >
            <MenuItem value="Reporter">Reporter</MenuItem>
            <MenuItem value="Driver">Driver</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
          </TextField>
          <TextField
            label="Profile Image URL"
            name="profileImage"
            value={formData.profileImage}
            onChange={handleChange}
            required
            type="url"
          />
          <TextField
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            type="password"
          />
          <TextField
            label="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            type="password"
          />

          {/* Submit Button */}
          <Button variant="contained" type="submit" color="primary">
            Create User
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default AddUserForm;
