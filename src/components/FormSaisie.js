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

  // === FERME L'ALERTE AUTOMATIQUEMENT APRÈS 2s ===
  useEffect(() => {
    if (alerte) {
      const timer = setTimeout(() => setAlerte(null), 2000);
      return () => clearTimeout(timer); // cleanup si alerte change avant 2s
    }
  }, [alerte]);

  // === TRANSITIONS ENTRE LES SECTIONS ===
  const handleAfterSearch = (coursData) => {
    // coursData = { intituleCours, sigleCours, codeProgramme }
    if (coursData) {
      setIntituleCours(coursData.intituleCours);
      setSigleCours(coursData.sigleCours);
    }
    setShowSection2(true);
  };

  const handleAfterValidation = (sessionData) => {
    // sessionData = { anneeAcademique, semestre }
    if (sessionData) {
      setAnneeAcademique(sessionData.anneeAcademique);
      setSemestre(sessionData.semestre);
      setCodeProgramme(sessionData.codeProgramme || '');
    }
    setShowSection2(true);
    setShowSection3(true);
    setShowSoumission(false);
  };

  // === SOUMISSION DES DONNÉES FINALES ===

  const handleSoumettre = async (data) => {
    try {
      const result = await enregistrerInscription(data);

      return result;
    } catch (err) {
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
              setCodeProgramme('');
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
                setAnneeAcademique('');
                setSemestre('');
              }}
            />
          </div>

          {/* === SECTION HISTORIQUE === */}
          <div className={showSection3 ? '' : 'd-none'}>
            <SectionHistorique
              onSoumettre={enregistrerInscription}
              triggerSoumission={triggerSoumission}
              setTriggerSoumission={setTriggerSoumission}
              onToggleSoumission={setShowSoumission}
              intituleCours={intituleCours}
              sigleCours={sigleCours}
              codeProgramme={codeProgramme}
              anneeAcademique={anneeAcademique}
              semestre={semestre}
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

      {/* === ALERTE FLOTTANTE BAS DROITE === */}
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
