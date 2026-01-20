// === CONTEXTE D'AUTHENTIFICATION ===

import React, { createContext, useContext, useEffect, useState } from 'react';

// on crée le contexte
const AuthContext = createContext();

// Pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

// Fournisseur du contexte
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true); // Pour éviter le flash de contenu
  const [identifiant, setIdentifiant] = useState(null);

  // Vérifier la session au chargement
  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    const storedId = localStorage.getItem('userIdentifiant');

    if (storedRole && storedId) {
      setIsAuthenticated(true);
      setRole(storedRole);
      setIdentifiant(storedId);
    } else {
      setIsAuthenticated(false);
      setRole(null);
      setIdentifiant(null);
    }
    setLoading(false);
  }, []);

  // Fonction de connexion
  const login = (role, identifiant) => {
    localStorage.setItem('userRole', role);
    localStorage.setItem('userIdentifiant', identifiant);
    setIsAuthenticated(true);
    setRole(role);
    setIdentifiant(identifiant);
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userIdentifiant');
    setIsAuthenticated(false);
    setRole(null);
    setIdentifiant(null);
  };

  // Valeur fournie au contexte
  const value = {
    isAuthenticated,
    role,
    identifiant,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};