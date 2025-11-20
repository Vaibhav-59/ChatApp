import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../pages/store/auth.js';

// Wrap routes that require authentication
const ProtectedRoute = ({ children }) => {
  const authUser = useAuthStore((s) => s.authUser);
  const isCheckingAuth = useAuthStore((s) => s.isCheckingAuth);
  const location = useLocation();

  // While checking auth, don't redirect; render nothing (or spinner)
  if (isCheckingAuth) return null;

  if (!authUser) {
    // redirect to login and preserve the attempted path
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
