// === Page d'accueil admin ===

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';
import { useAuth } from '../context/AuthContext';
import UserProfile from './UserProfile';

function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Gérer la déconnexion
  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
      navigate('/');
    }
  };

  // Redirections
  const goToInsertion = () => navigate('/cours');
  const goToSearchModify = () => navigate('/search-modify');

  return (
    <>
      {/* BREADCRUMB */}
      <Breadcrumb />

      {/* === BARRE DE NAVIGATION EN HAUT === */}
      <header className="top-bar">
        <h2>Tableau de Bord Admin</h2>
        <div className="top-bar-right">
          <button
            onClick={handleLogout}
            className="logout-btn-top"
          >
            [→] Déconnexion
          </button>

          <UserProfile />
        </div>
      </header>

    <div className="main-content">

      {/* === CONTENU PRINCIPAL === */}
      <main>
        <h1 className="page-title">Que voulez-vous faire ?</h1>
        <p style={{ textAlign: 'center', marginBottom: '60px', color: '#666' }}>
          Choisissez une action ci-dessous
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '40px',
          flexWrap: 'wrap'
        }}>

          {/* CARTE 1 : Insérer des données */}
          <div
            className="action-card"
            onClick={goToInsertion}
          >
            <div className="icon">➕</div>
            <h3>Insérer des données</h3>
            <p>Ajouter de nouvelles sessions de cours et inscriptions d'étudiants</p>
            <button className="btn-primary">Commencer</button>
          </div>

          {/* CARTE 2 : Rechercher et Modifier */}
          <div
            className="action-card"
            onClick={goToSearchModify}
          >
            <div className="icon">🔍</div>
            <h3>Rechercher & Modifier</h3>
            <p>Chercher et modifier des données existantes dans la base de données</p>
            <button className="btn-primary">Commencer</button>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}

export default AdminDashboard;