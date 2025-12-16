// === Composant de Route Protégée ===

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();
    // En cours de chargement, rien ne s'affiche
  if (loading) {
    return null;
  }
    // Si non authentifié → redirection vers la page de login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
    // Si rôle non autorisé → redirection selon le rôle
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'user') {
      return <Navigate to="/cours" replace />;
    } else {
      return <Navigate to="/admin-dashboard" replace />;
    }
  }
  
  return children;
}

export default ProtectedRoute;