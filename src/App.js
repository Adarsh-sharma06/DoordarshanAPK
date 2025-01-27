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
import { useAuth } from "./context/AuthContext"; // Use AuthContext

function App() {
  const { currentUser, userRole } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route
          path="/"
          element={currentUser ? (
            userRole === "Admin" ? (
              <Navigate to="/Admin/Dashboard" />
            ) : (
              <Navigate to="/Reporter/ReporterDashboard" />
            )
          ) : (
            <Login />
          )}
        />

        <Route path="/ForgotPassword" element={<ForgotPassword />} />

        {/* Admin Routes */}
        <Route
          path="/Admin/Dashboard"
          element={
            <ProtectedRoute allowedRole="Admin">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Admin/Dashboard/CreateUser"
          element={
            <ProtectedRoute allowedRole="Admin">
              <AddUserForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Admin/Tracker"
          element={
            <ProtectedRoute allowedRole="Admin">
              <Tracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Admin/Reports/Report"
          element={
            <ProtectedRoute allowedRole="Admin">
              <Report />
            </ProtectedRoute>
          }
        />

        {/* Reporter Routes */}
        <Route
          path="/Reporter/ReporterDashboard"
          element={
            <ProtectedRoute allowedRole="Reporter">
              <ReporterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Reporter/CarRequest"
          element={
            <ProtectedRoute allowedRole="Reporter">
              <CarRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Reporter/reports"
          element={
            <ProtectedRoute allowedRole="Reporter">
              <RReport />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
