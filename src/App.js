import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./Styles/global.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Login from "./components/Login/Login";
import Tracker from "./components/Admin/TrackerPage/Tracker";
import Dashboard from "./components/Admin/Dashboard/Dashboard";
import Report from "./components/Admin/Reports/Report";
import AddUserForm from "./components/Admin/Dashboard/CreateUser/AddUserForm";
import ReporterDashboard from "./components/Reporter/ReporterDashboard";
import CarRequest from "./components/Reporter/CarRequest/CarRequest";
import RReport from "./components/Reporter/reports/report";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./components/ReusableComponents/Profile/Profile";
import { auth } from "./service/firebase";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // Track user role (Admin/Reporter)

  // Check for user authentication status on app load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Fetch user role from database
        const role = await fetchUserRole(currentUser.email); // Replace with your role-fetching logic
        setUserRole(role);
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false); // Stop loading when auth check completes
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  // Mock function to fetch user role
  const fetchUserRole = async (email) => {
    // Replace this with actual logic to fetch role from your Firebase database
    // For example, querying the "users" collection to find the role field
    if (email === "admin@example.com") return "Admin";
    if (email === "reporter@example.com") return "Reporter";
    return null;
  };

  // If still loading, show a loader
  if (loading) {
    return (
      <div className="loading-container" style={{ textAlign: "center", marginTop: "100px" }}>
        <h3>Loading...</h3>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route
          path="/"
          element={
            user ? (
              userRole === "Admin" ? (
                <Navigate to="/Admin/Dashboard" />
              ) : (
                <Navigate to="/Reporter/ReporterDashboard" />
              )
            ) : (
              <Login />
            )
          }
        />

        {/* Admin Routes */}
        <Route
          path="/Admin/Dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Admin/Dashboard/CreateUser"
          element={
            <ProtectedRoute user={user}>
              <AddUserForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Admin/Tracker"
          element={
            <ProtectedRoute user={user}>
              <Tracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Admin/Reports/Report"
          element={
            <ProtectedRoute user={user}>
              <Report />
            </ProtectedRoute>
          }
        />

        {/* Reporter Routes */}
        <Route
          path="/Reporter/ReporterDashboard"
          element={
            <ProtectedRoute user={user}>
              <ReporterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Reporter/CarRequest"
          element={
            <ProtectedRoute user={user}>
              <CarRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Profile"
          element={
            <ProtectedRoute user={user}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Reporter/reports"
          element={
            <ProtectedRoute user={user}>
              <RReport />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
