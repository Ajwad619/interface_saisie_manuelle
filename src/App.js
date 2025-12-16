import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import FormSaisie from './components/FormSaisie';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute'; 

function App() {
  return (
      <Routes>

        {/* Page de connexion */}
        <Route path="/" element={<Login />} />

        {/* Les différentes routes protégées */}
        <Route
          path="/cours"
          element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <FormSaisie />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/search-modify"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>Page de recherche (à créer)</div>
            </ProtectedRoute>
          }
        />

      </Routes>
  );
}

export default App;

