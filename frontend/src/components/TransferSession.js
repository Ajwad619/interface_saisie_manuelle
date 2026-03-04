// === Page de transfert de session ===

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Breadcrumb from './Breadcrumb';
import SectionCours from './SectionCours';
import SectionSession from './SectionSession';
import { transfererSession } from '../services/api';
import UserProfile from './UserProfile';


function TransferSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const originalSession = location.state?.session;

  useEffect(() => {
    if (!originalSession) {
      alert("Session d'origine manquante.");
      navigate('/search-modify');
    }
  }, [originalSession, navigate]); 

  const handleLogout = () => {
    if (window.confirm('Déconnexion ?')) {
      logout();
      navigate('/');
    }
  }; 

  const [newCours, setNewCours] = useState(null);
  const [newSession, setNewSession] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false); 
  const [sessionValidee, setSessionValidee] = useState(false);
  const [alerte, setAlerte] = useState(null);

  // Dans useEffect de validation
  useEffect(() => {
    if (!originalSession || !newCours || !newSession) {
      setIsFormValid(false);
      return;
    }

    const coursValid = newCours.sigleCours && newCours.intituleCours;
    const sessionValid = 
      newSession.anneeAcademique &&
      newSession.semestre &&
      newSession.codeProgramme &&
      newSession.creditCours !== '';

    if (!coursValid || !sessionValid) {
      setIsFormValid(false);
      return;
    }

    const coursChanged =
      newCours.sigleCours !== originalSession.sigleCours ||
      newCours.intituleCours !== originalSession.intituleCours;

    const sessionChanged =
      newSession.anneeAcademique !== originalSession.anneeAcademique ||
      newSession.semestre !== originalSession.semestre ||
      newSession.codeProgramme !== originalSession.codeProgramme ||
      Number(newSession.creditCours) !== Number(originalSession.creditCours) ||
      newSession.idEnseignant !== originalSession.idEnseignant || false;

    setIsFormValid(coursChanged || sessionChanged);
  }, [newCours, newSession, originalSession]);

  // === FERME L'ALERTE AUTOMATIQUEMENT ===
    useEffect(() => {
      if (alerte) {
        const timer = setTimeout(() => {
          if (alerte.redirect) {
            navigate('/search-modify');
          }
          setAlerte(null);
        }, 3000); 
        return () => clearTimeout(timer);
      }
    }, [alerte, navigate]);

  // === ACTION TRANSFERT ===
  const handleTransfer = async () => {
    try {
      const data = {
        sessionOriginale: originalSession,
        nouvelleSession: {
          sigleCours: newCours.sigleCours,
          intituleCours: newCours.intituleCours,
          anneeAcademique: newSession.anneeAcademique,
          semestre: newSession.semestre,
          codeProgramme: newSession.codeProgramme,
          creditCours: newSession.creditCours,
          idEnseignant: newSession.idEnseignant
        }
      };

      await transfererSession(data);
      setAlerte({ type: "success", message: "Transfert réussi !", redirect: true });
      
    } catch (error) {
      console.error("Erreur transfert:", error);
      let message = "Une erreur inconnue est survenue.";
      if (error.message === "SESSION_EXISTE") {
        message = "⚠️ Une session identique existe déjà...";
      }
      setAlerte({ type: "danger", message });
    }
  };

  if (!originalSession) {
    return <div style={{ padding: '20px' }}>Vérification de la session...</div>;
  }

  return (
    <div style={{ backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
      <Breadcrumb
        customPath={{ path: '/transfer-session', label: 'Transférer le cours' }}
        parentPaths={['/search-modify', '/edit-session']}
      />

      <header className="top-bar">
        <h2>Transférer le Cours</h2>
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
        justifyContent: 'center'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '75%',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px' 
        }}>

          {/* Cours actuel */}
          <div className="search-section">
            <h3>Cours actuel</h3>
            <p style={{ color: '#666' }}>
              {originalSession.sigleCours} – {originalSession.intituleCours}
            </p>
          </div>

          {/* SECTION COURS */}
          <SectionCours
            onAfterValidation={setNewCours}
            selectedCours={originalSession}
          />

          {/* SECTION SESSION */}
            <SectionSession
              onAfterValidation={(data) => {
                setNewSession(data);
                setSessionValidee(true); 
              }}
              sessionVerouillee={sessionValidee} 
              initialData={!sessionValidee ? {
                anneeAcademique: originalSession.anneeAcademique || '',
                semestre: String(originalSession.semestre || ''),
                codeProgramme: originalSession.codeProgramme || '',
                creditCours: String(originalSession.creditCours || ''),
                idEnseignant: originalSession.idEnseignant || ''  
              } : null}
            />

          {/* BOUTON TRANSFERT */}
          <div style={{ display: 'flex',  gap: '15px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                backgroundColor: 'transparent',
                border: '2px solid #0066FF',
                color: '#0066FF',
                padding: '8px 10px', 
                borderRadius: '6px',
                minWidth: '44px',
                height: '44px', 
                display: 'inline-flex', 
                alignItems: 'center',
                cursor: 'pointer'
              }}
              aria-label="Retour"
            >
            ←
          </button>
            <button
              onClick={handleTransfer}
              disabled={!isFormValid}
              style={{
                backgroundColor: isFormValid ? '#0066FF' : '#6c757d',
                color: 'white',
                padding: '10px 200px',
                border: 'none',
                borderRadius: '4px',
                cursor: isFormValid ? 'pointer' : 'not-allowed'
              }}
            >
              Transférer
            </button>
          </div>

        </div>

        {/* === ALERTE FLOTTANTE === */}
        {alerte && (
          <div style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 1050,
              minWidth: '250px'
            }} className={`alert alert-${alerte.type} alert-dismissible fade show`}>
              {alerte.message}
              <button type="button" className="btn-close" onClick={() => { if (alerte && alerte.redirect) navigate('/search-modify'); setAlerte(null); }} />
            </div>
      )}
      </main>
    </div>
  );
}

export default TransferSession;
