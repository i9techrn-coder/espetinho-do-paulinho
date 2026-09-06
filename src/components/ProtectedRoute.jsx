import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useStore();
  const location = useLocation();
  const { tenantSlug } = useParams();

  if (!currentUser) {
    // Redireciona para o login da loja (com o slug correto)
    return <Navigate to={`/${tenantSlug}/login`} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={`/${tenantSlug}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
