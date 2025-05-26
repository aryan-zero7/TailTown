// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './Common/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, currentUserData, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && currentUserData && !allowedRoles.includes(currentUserData.role)) {
    // User is logged in but doesn't have the required role
    // Redirect to a "not authorized" page or dashboard
    return <Navigate to="/dashboard" replace />; // Or an AccessDeniedPage
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;