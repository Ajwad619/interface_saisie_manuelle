import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import FormSaisie from './components/FormSaisie';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute'; 
import SearchModify from './components/SearchModify';
import EditSession from './components/EditSession';
import TransferSession from './components/TransferSession';
import SessionInscriptions from './components/SessionInscriptions';
import EditInscription from './components/EditInscription';

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
              <SearchModify />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-session"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EditSession />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transfer-session"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TransferSession />
            </ProtectedRoute>
          }
        />

        <Route
          path="/session-inscriptions"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SessionInscriptions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-inscription"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EditInscription />
            </ProtectedRoute>
          }
        />

      </Routes>
  );
}

export default App;

