import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useStore();
  const location = useLocation();

  if (!currentUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect to home or another page if role is not allowed
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
