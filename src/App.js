import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./Styles/global.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Login from "./components/Login/Login";
import ForgotPassword from "./components/Login/ForgetPassword/forgetPassword";
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
import { getFirestore, doc, getDoc } from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  const db = getFirestore();

  // Check for user authentication status on app load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const role = await fetchUserRole(currentUser.email); // Use UID for better security
        setUser(currentUser);
        setUserRole(role);
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false); // Stop loading when auth check completes
    });

    return unsubscribe; // Cleanup listener
  }, []);

  // Fetch user role from Firestore
  const fetchUserRole = async (email) => {
    try {
      const userDocRef = doc(db, "users", email); // Secure: Use UID instead of email as Firestore key
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const { role } = userDoc.data();
        if (!role) throw new Error("User role not defined in Firestore");
        return role;
      } else {
        throw new Error("User document not found");
      }
    } catch (error) {
      console.error("Error fetching user role:", error.message);
      return null;
    }
  };

  // Render loader while authentication state is being checked
  if (loading) {
    return (
      <div className="loading-container text-center mt-5">
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

        <Route
          path="/ForgotPassword"
          element={<ForgotPassword />}
        />

        {/* Admin Routes */}
        <Route
          path="/Admin/Dashboard"
          element={
            <ProtectedRoute user={user} role={userRole} allowedRole="Admin">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Admin/Dashboard/CreateUser"
          element={
            <ProtectedRoute user={user} role={userRole} allowedRole="Admin">
              <AddUserForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Admin/Tracker"
          element={
            <ProtectedRoute user={user} role={userRole} allowedRole="Admin">
              <Tracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Admin/Reports/Report"
          element={
            <ProtectedRoute user={user} role={userRole} allowedRole="Admin">
              <Report />
            </ProtectedRoute>
          }
        />

        {/* Reporter Routes */}
        <Route
          path="/Reporter/ReporterDashboard"
          element={
            <ProtectedRoute user={user} role={userRole} allowedRole="Reporter">
              <ReporterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Reporter/CarRequest"
          element={
            <ProtectedRoute user={user} role={userRole} allowedRole="Reporter">
              <CarRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Profile"
          element={
            <ProtectedRoute user={user} role={userRole}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Reporter/reports"
          element={
            <ProtectedRoute user={user} role={userRole} allowedRole="Reporter">
              <RReport />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
