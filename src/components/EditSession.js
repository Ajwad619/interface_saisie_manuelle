// === Page de détails d'une session ===

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Breadcrumb from './Breadcrumb';
import UserProfile from './UserProfile';

function EditSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // Récupérer les données de la session
  const session = location.state?.session;

  // Rediriger si aucune donnée
  useEffect(() => {
    if (!session) {
      alert("Aucune session sélectionnée.");
      navigate('/search-modify');
    }
  }, [session, navigate]);

  // Gestion déconnexion
  const handleLogout = () => {
    if (window.confirm('Déconnexion ?')) {
      logout();
      navigate('/');
    }
  };

  // Actions
  const handleTransfert = () => {
    navigate('/transfer-session', { state: { session } });
  };

  const handleVoirInscriptions = () => {
    navigate('/session-inscriptions', { state: { session } });
  };

  if (!session) return <div>Chargement...</div>;

  return (
    <div style={{
      backgroundColor: '#F5F5F5',
      minHeight: '10 optin-height',
      padding: 0
    }}>
      
      {/* BREADCRUMB */}
      <Breadcrumb 
        customPath={{ path: '/edit-session', label: 'Détails de la session' }} 
        parentPaths={['/search-modify']}  
      />

      {/* BARRE DE NAVIGATION */}
      <header className="top-bar">
        <h2>Détails de la Session</h2>
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

      <main style={{
        padding: '30px', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '30px',
          color: '#343a40'
        }}>
          Session : {session.sigleCours} (Année {session.anneeAcademique} - Semestre {session.semestre})
        </h1>

        {/* SECTION INFORMATIONS COURS */}
        <div className="search-section" style={{ width: '100%', maxWidth: '70%' }}>
          <h3 style={{ marginBottom: '20px' }}>Informations Cours</h3>
          <div className="search-form-grid grid-2">
            <div>
              <label className="search-form-label">Sigle du cours</label>
              <input
                type="text"
                className="form-control"
                value={session.sigleCours || ''}
                readOnly
              />
            </div>
            <div>
              <label className="search-form-label">Intitulé du cours</label>
              <input
                type="text"
                className="form-control"
                value={session.intituleCours || ''}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* SECTION INFORMATIONS SESSION */}
        <div className="search-section" style={{ width: '100%', maxWidth: '70%', marginTop: '20px' }}>
          <h3 style={{ marginBottom: '20px' }}>Informations Session de Cours</h3>
          <div className="search-form-grid grid-2">
            <div>
              <label className="search-form-label">Année académique</label>
              <input
                type="text"
                className="form-control"
                value={session.anneeAcademique || ''}
                disabled
              />
            </div>
            <div>
              <label className="search-form-label">Semestre</label>
              <input
                type="text"
                className="form-control"
                value={session.semestre || ''}
                disabled
              />
            </div>
            <div>
              <label className="search-form-label">Crédit du cours</label>
              <input
                type="text"
                className="form-control"
                value={session.creditCours || ''}
                disabled
              />
            </div>
            <div>
              <label className="search-form-label">Code Programme</label>
              <input
                type="text"
                className="form-control"
                value={session.codeProgramme || ''}
                disabled
              />
            </div>
            <div>
              <label className="search-form-label">Identifiant de l'enseignant</label>
              <input
                type="text"
                className="form-control"
                value={session.idEnseignant || ''}
                disabled
              />
            </div>
          </div>
        </div>

        {/* BOUTONS */}
        <div style={{
          width: '100%',
          maxWidth: '70%',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '15px', 
          marginTop: '30px'
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              backgroundColor: 'transparent',
              border: '2px solid #0066FF',
              color: '#0066FF',
              padding: '8px 10px',
              borderRadius: '6px',
              minWidth: '44px',
              height: '40px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            aria-label="Retour"
          >
            ←
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleTransfert}
            style={{ flex: 1, backgroundColor: '#0066FF' }}
          >
            Transférer le cours
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleVoirInscriptions}
            style={{ flex: 1, backgroundColor: '#6C757D' }}
          >
            Voir les inscriptions de cette session
          </button>
        </div>
      </main>
    </div>
  );
}

export default EditSession;