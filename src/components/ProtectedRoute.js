import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRole }) {
  const { currentUser, userRole } = useAuth();

  // If the user is not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // If the user role doesn't match the allowedRole, redirect to home or any other fallback
  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
