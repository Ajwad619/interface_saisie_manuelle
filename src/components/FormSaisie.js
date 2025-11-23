// === IMPORTATIONS ===
import React, { useState, useEffect } from 'react';
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

  // === ÉTATS POUR TRANSMETTRE LES DONNÉES À SectionHistorique ===
  const [intituleCours, setIntituleCours] = useState('');
  const [sigleCours, setSigleCours] = useState('');
  const [codeProgramme, setCodeProgramme] = useState('');
  const [anneeAcademique, setAnneeAcademique] = useState('');
  const [semestre, setSemestre] = useState('');
  const [creditCours, setCreditCours] = useState(0);
  const [idEnseignant, setIdEnseignant] = useState('');

  // === FERME L'ALERTE AUTOMATIQUEMENT ===
  useEffect(() => {
    if (alerte) {
      const timer = setTimeout(() => setAlerte(null), 3500);
      return () => clearTimeout(timer); 
    }
  }, [alerte]);

  // === TRANSITIONS ENTRE LES SECTIONS ===
  const handleAfterSearch = (coursData) => {
    if (coursData) {
      setIntituleCours(coursData.intituleCours);
      setSigleCours(coursData.sigleCours);
    }
    setShowSection2(true);
  };

  const handleAfterValidation = (sessionData) => {
    if (sessionData) {
      setAnneeAcademique(sessionData.anneeAcademique);
      setSemestre(sessionData.semestre);
      setCodeProgramme(sessionData.codeProgramme || '');
      setCreditCours(sessionData.creditCours);
      setIdEnseignant(sessionData.idEnseignant);
    }
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
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">

          {/* === ALERTE GLOBALE === */}
          {alerte && (
            <div className={`alert alert-${alerte.type} alert-dismissible fade show`} role="alert">
              {alerte.message}
              <button type="button" className="btn-close" onClick={() => setAlerte(null)} />
            </div>
          )}

          {/* === SECTION COURS === */}
          <SectionCours
            onAfterSearch={handleAfterSearch}
            onReinitialiser={() => {
              setShowSection2(false);
              setShowSection3(false);
              setShowSoumission(false);
              // Reset cours
              setIntituleCours('');
              setSigleCours('');
            }}
          />

          {/* === SECTION SESSION === */}
          <div className={showSection2 ? '' : 'd-none'}>
            <SectionSession
              onAfterValidation={handleAfterValidation}
              onReinitialiser={() => {
                setShowSection3(false);
                setShowSoumission(false);
                // Reset session
                setCodeProgramme('');
                setAnneeAcademique('');
                setSemestre('');
                setCreditCours(0);
                setIdEnseignant('');
              }}
            />
          </div>

          {/* === SECTION HISTORIQUE === */}
          <div className={showSection3 ? '' : 'd-none'}>
            <SectionHistorique
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
