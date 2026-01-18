// === Composant principal du formulaire de saisie d'inscriptions ===

// === IMPORTATIONS ===
import React, { useState, useEffect,  useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';
import { useAuth } from '../context/AuthContext';
import SectionCours from './SectionCours';
import SectionSession from './SectionSession';
import SectionHistorique from './SectionHistorique';
import { enregistrerInscription } from '../services/api';

// === COMPOSANT PRINCIPAL ===
function FormSaisie() {
  // === ÉTATS GÉNÉRAUX ===
  const [showSection2, setShowSection2] = useState(false); // Section Session
  const [showSection3, setShowSection3] = useState(false); // Section Historique
  const [showSoumission, setShowSoumission] = useState(false); // bouton Soumission finale
  const [alerte, setAlerte] = useState(null);
  const [triggerSoumission, setTriggerSoumission] = useState(false);
  const [sessionVerouillee, setSessionVerouillee] = useState(false);
  const historiqueRef = useRef(null);
  const sessionRef = useRef(null);
  const coursRef = useRef(null);

  // === ÉTATS POUR TRANSMETTRE LES DONNÉES À SectionHistorique ===
  const [intituleCours, setIntituleCours] = useState('');
  const [sigleCours, setSigleCours] = useState('');
  const [codeProgramme, setCodeProgramme] = useState('');
  const [anneeAcademique, setAnneeAcademique] = useState('');
  const [semestre, setSemestre] = useState('');
  const [creditCours, setCreditCours] = useState(0);
  const [idEnseignant, setIdEnseignant] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { role } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
      navigate('/');
    }
  };

  // === FERME L'ALERTE AUTOMATIQUEMENT ===
  useEffect(() => {
    if (alerte) {
      const timer = setTimeout(() => setAlerte(null), 3500);
      return () => clearTimeout(timer); 
    }
  }, [alerte]);


  // === TRANSITIONS ENTRE LES SECTIONS ===
  const handleAfterSearch = (selectedCours) => {
    if (selectedCours) {
      setIntituleCours(selectedCours.intituleCours);
      setSigleCours(selectedCours.sigleCours);
    }
    setShowSection2(true);
  };

  const handleResetHistorique = () => {
    if (historiqueRef.current) {
      historiqueRef.current.handleReinitialiserLocal();
    }

    setShowSection3(false);
    setShowSoumission(false);
  }

  const handleResetSession = () => {
    handleResetHistorique();

    setAnneeAcademique('');
    setSemestre('');
    setCodeProgramme('');
    setCreditCours(0);
    setIdEnseignant('');
    setSessionVerouillee(false);
    setTriggerSoumission(false);
  }

  const handleResetCours = () => {
    if (historiqueRef.current) {
        historiqueRef.current.handleReinitialiserLocal();
    }

    if (sessionRef.current) {
        sessionRef.current.handleReinitialiserLocal();
    }
    
    setShowSection2(false);
    setShowSection3(false);
    setShowSoumission(false);
};


  const handleAfterValidation = (sessionData) => {
    if (sessionData) {
      setAnneeAcademique(sessionData.anneeAcademique);
      setSemestre(sessionData.semestre);
      setCodeProgramme(sessionData.codeProgramme || '');
      setCreditCours(sessionData.creditCours);
      setIdEnseignant(sessionData.idEnseignant);
    }
    setSessionVerouillee(true);
    setShowSection2(true);
    setShowSection3(true);
    setShowSoumission(false);
  };

  // === SOUMISSION DES DONNÉES FINALES ===

  const handleSoumettre = async (data) => {
    try {
      const result = await enregistrerInscription(data);
      if (result.success) {
        setAlerte({ type: "success", message: result.message || "Soumission réussie !" });
      } else {
        setAlerte({ type: "danger", message: result.message || "Erreur lors de la soumission." });
      }

      return result;
    } catch (err) {
      setAlerte({ type: "danger", message: "Erreur réseau lors de la soumission." });
      return { success: false, message: "Erreur réseau." };
    }
  } ;


  const declencherSoumission = () => setTriggerSoumission(true);

  // === RENDU ===
  return (
    <div className="container mt-12 mb-5" style ={{ maxWidth: '100%' }}>
       {/* BREADCRUMB */}
        <Breadcrumb />

      {/* === BARRE DE NAVIGATION EN HAUT === */}
      <header className="top-bar">
        <h2>Insertion de Données</h2>
        <button
          onClick={handleLogout}
          className="logout-btn-top"
        >
          [→] Déconnexion
        </button>
      </header>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">

          {/* === SECTION COURS === */}
          <SectionCours
            ref={coursRef}
            onAfterValidation={handleAfterSearch}
            onReinitialiser={handleResetCours}
          />


          {/* === SECTION SESSION === */}
          <div className={showSection2 ? '' : 'd-none'}>
            <SectionSession
              ref={sessionRef}
              onAfterValidation={handleAfterValidation}
              onReinitialiser={() => {
                handleResetSession();
              }}
              sessionVerouillee={sessionVerouillee}
            />
          </div>

          {/* === SECTION HISTORIQUE === */}
          <div className={showSection3 ? '' : 'd-none'}>
            <SectionHistorique
              ref={historiqueRef}
              onSoumettre={handleSoumettre}
              triggerSoumission={triggerSoumission}
              setTriggerSoumission={setTriggerSoumission}
              onToggleSoumission={setShowSoumission}
              intituleCours={intituleCours}
              sigleCours={sigleCours}
              codeProgramme={codeProgramme}
              anneeAcademique={anneeAcademique}
              semestre={semestre}
              creditCours={creditCours}
              idEnseignant={idEnseignant}
              onReinitialiser={() => {
                handleResetHistorique();
              }}
            />
          </div>

          {/* === BOUTON SOUMISSION FINALE === */}
          {showSoumission && (
            <div className="text-center mb-5">
              <button
                type="button"
                className="btn btn-success btn-lg w-50"
                onClick={declencherSoumission}
              >
                Soumission finale
              </button>
            </div>
          )}

         {role === 'admin' && (
          <div className="d-flex justify-content-center mt-4">
              <button 
                className="btn btn-secondary" 
                onClick={() => navigate('/')}
              >
                Revenir à l'accueil
              </button>
            </div>
          )}

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
          <button type="button" className="btn-close" onClick={() => setAlerte(null)} />
        </div>
      )}

    </div>
  );
}

export default FormSaisie;
