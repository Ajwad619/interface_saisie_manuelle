// === IMPORTATIONS ===
import React, { useState, useEffect } from 'react';
import { enregistrerProgramme } from '../services/api';
import { getProgramme } from '../services/api';

// Fonction utilitaire pour valider l'année académique
function validerAnnee(annee) {
  // Exemple de format '22-23', '21-22' etc.
  const regex = /^(\d{2})-(\d{2})$/;
  return regex.test(annee);
}

// Fonction utilitaire pour valider le nom enseignant (lettres et espaces uniquement)
function validerNomEnseignant(nom) {
  const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/u;
  return regex.test(nom);
}

// === COMPOSANT SECTION SESSION ===
function SectionSession({ onAfterValidation , onReinitialiser }) {
  // === ÉTATS AVEC useState ===
  const [anneeAcademique, setAnneeAcademique] = useState('');  
  const [semestre, setSemestre] = useState(''); 
  const [creditCours, setCreditCours] = useState(''); 
  const [codeProgramme, setCodeProgramme] = useState(''); 
  const [idEnseignant, setIdEnseignant] = useState('');
  const [programmes, setProgrammes] = useState([]);  
  const [showMiniForm, setShowMiniForm] = useState(false); 
  const [nouveauCode, setNouveauCode] = useState('');  
  const [nouveauTitre, setNouveauTitre] = useState('');
  const [nouveauNiveau, setNouveauNiveau] = useState('');
  const [sessionVerouillee, setSessionVerouillee] = useState(false);
  const [sessionRemplie, setSessionRemplie] = useState(false);

  // États pour les erreurs
  const [erreurs, setErreurs] = useState({});

  // AJOUT : État pour les alertes
  const [alerte, setAlerte] = useState(null);

  // === CHARGER LES PROGRAMMES AU DÉMARRAGE ===
  useEffect(() => {
   getProgramme()
     .then(data => setProgrammes(data))
     .catch(err => console.error(err));
  } , []);



  // === FONCTIONS POUR LES BOUTONS ===
  const handleAfficherMiniForm = () => {
    setShowMiniForm(true);
  };

  const handleAnnulerCreation = () => {
    setShowMiniForm(false);
    setNouveauCode('');
    setNouveauTitre('');
    setNouveauNiveau('');
  };

  // Sauvegarder le nouveau programme
  const handleSauvegarderCreation = async () => {
    if (!nouveauCode || !nouveauTitre || !nouveauNiveau) {
      setAlerte({ message: 'Tous les champs sont requis.', type: 'warning' });
      return;
    }

    try {
      const data = await enregistrerProgramme({
        code: nouveauCode,
        titre: nouveauTitre,
        niveau: nouveauNiveau
      });

      if (data.success) {
        // Ajouter le nouveau programme localement
        setProgrammes(prev => [...prev, data.nouveauProgramme]);
        setShowMiniForm(false);
        setAlerte({ message: 'Programme ajouté avec succès !', type: 'success' });
      } else {
        setAlerte({ message: data.message, type: 'danger' });
      }

    } catch (error) {
      console.error(error);
      setAlerte({ message: "Erreur de communication avec le serveur.", type: 'danger' });
    }
  };


  // Validation complète
  const handleValider = () => {
    const nouvellesErreurs = {};

    if (!validerAnnee(anneeAcademique.trim())) {
      nouvellesErreurs.anneeAcademique = "Format d'année incorrect, attendu ex: 22-23";
    }

    if (!semestre || !(parseInt(semestre) >= 1 && parseInt(semestre) <= 7)) {
      nouvellesErreurs.semestre = "Veuillez sélectionner un semestre valide (1 à 7)";
    }

    const creditInt = parseInt(creditCours);
    if (isNaN(creditInt) || creditInt < 0 || creditInt > 15) {
      nouvellesErreurs.creditCours = "Crédit du cours doit être un nombre entre 0 et 15";
    }

    if (!codeProgramme) {
      nouvellesErreurs.codeProgramme = "Veuillez sélectionner un code programme";
    }

    if (idEnseignant.trim() && !validerNomEnseignant(idEnseignant.trim())) {
      nouvellesErreurs.idEnseignant = "Le nom de l'enseignant ne peut contenir que des lettres et espaces";
    }

    setErreurs(nouvellesErreurs);

    if (Object.keys(nouvellesErreurs).length === 0) {
      if (onAfterValidation) onAfterValidation({
        anneeAcademique,
        semestre,
        creditCours,
        codeProgramme,
        idEnseignant: idEnseignant.trim() === "" ? null : idEnseignant.trim(),
      });
    }

    setSessionVerouillee(true);
    setSessionRemplie(true);
  };

  //Réinitialiser
  const handleReinitialiser = () => {
    setAnneeAcademique('');
    setSemestre('');
    setCreditCours('');
    setCodeProgramme('');
    setIdEnseignant('');
    setShowMiniForm(false);
    setNouveauCode('');
    setNouveauTitre('');
    setNouveauNiveau('');
    setErreurs({});
    setAlerte(null);
    setSessionVerouillee(false);
    if (onReinitialiser) onReinitialiser(); 
    setSessionRemplie(false);
  };

  // Surbrillance rouge
  const classInput = (field) =>
    erreurs[field] ? "form-control is-invalid animate-shake" : "form-control";

  // === RENDU ===
  return (
    <div className="form-section">
      <h4>Informations session de cours</h4>

      {/* Alerte */}
      {alerte && (
        <div className={`alert alert-${alerte.type} alert-dismissible fade show`} role="alert">
          {alerte.message}
          <button type="button" className="btn-close" onClick={() => setAlerte(null)} />
        </div>
      )}

      <div className="row">
        {/* Année académique */}
        <div className="col-md-6 mb-3">
          <label className="form-label">
            Annee academique <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="anneeAcademique"
            className={classInput("anneeAcademique")}
            value={anneeAcademique}
            onChange={(e) => setAnneeAcademique(e.target.value)}
            disabled={sessionVerouillee}
            placeholder="ex : 23-24"
            required
          />
          {erreurs.anneeAcademique && (
            <div className="invalid-feedback">{erreurs.anneeAcademique}</div>
          )}
        </div>

        {/* Semestre */}
        <div className="col-md-6 mb-3">
          <label className="form-label">
            Semestre <span style={{ color: 'red' }}>*</span>
          </label>
          <select
            className={classInput("semestre")}
            id="semestre"
            value={semestre}
            onChange={(e) => setSemestre(e.target.value)}
            disabled={sessionVerouillee}
            required
          >
            <option value="">-- Sélectionner --</option>
            {Array.from({ length: 7 }, (_, i) => i + 1).map(i => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
          {erreurs.semestre && <div className="invalid-feedback">{erreurs.semestre}</div>}
        </div>

        {/* Crédits */}
        <div className="col-md-6 mb-3">
          <label className="form-label">
            Credit du cours <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="number"
            id="creditCours"
            className={classInput("creditCours")}
            value={creditCours}
            onChange={(e) => setCreditCours(e.target.value)}
            disabled={sessionVerouillee}
            min="0"
            max="15"
            required
          />
          {erreurs.creditCours && <div className="invalid-feedback">{erreurs.creditCours}</div>}
        </div>

        {/* Code programme */}
        <div className="col-md-6 mb-3">
          <label className="form-label">
            Code Programme <span style={{ color: 'red' }}>*</span>
          </label>
          <select
            className={classInput("codeProgramme")}
            id="codeProgramme"
            value={codeProgramme}
            onChange={(e) => setCodeProgramme(e.target.value)}
            disabled={sessionVerouillee}
            required
          >
            <option value="">-- Sélectionner --</option>
            {programmes.map((prog, index) => (
              <option key={index} value={prog.code}>
                {prog.code} - {prog.titre}
              </option>
            ))}
          </select>
          {erreurs.codeProgramme && <div className="invalid-feedback">{erreurs.codeProgramme}</div>}
        </div>

        {/* Enseignant */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Identifiant de l'enseignant (optionnel)</label>
          <input
            type="text"
            className={classInput("idEnseignant")}
            value={idEnseignant}
            onChange={(e) => setIdEnseignant(e.target.value)}
            readOnly={sessionVerouillee}
          />
          {erreurs.idEnseignant && <div className="invalid-feedback">{erreurs.idEnseignant}</div>}
        </div>

        {/* Mini formulaire création programme */}
        <div className="col-md-6 mb-3 d-flex align-items-end">
          <button
            type="button"
            id="btn-afficher-formulaire"
            className="btn btn-outline-primary w-100"
            onClick={handleAfficherMiniForm}
          >
            + Créer un nouveau programme
          </button>
        </div>

        {showMiniForm && (
          <div id="mini-form-creation" className="card card-body bg-light">
            <h5 className="card-title">Nouveau Programme</h5>
            <form id="form-creation-programme">
              <div className="mb-2">
                <label className="form-label">Code du Programme</label>
                <input
                  type="text"
                  id="nouveau-code"
                  className="form-control"
                  value={nouveauCode}
                  onChange={(e) => setNouveauCode(e.target.value)}
                  required
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Titre Complet</label>
                <input
                  type="text"
                  id="nouveau-titre"
                  className="form-control"
                  value={nouveauTitre}
                  onChange={(e) => setNouveauTitre(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Niveau d'Étude</label>
                <input
                  type="text"
                  id="nouveau-niveau"
                  className="form-control"
                  value={nouveauNiveau}
                  onChange={(e) => setNouveauNiveau(e.target.value)}
                  required
                />
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  id="btn-annuler-creation"
                  className="btn btn-secondary me-2"
                  onClick={handleAnnulerCreation}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  id="btn-sauvegarder-creation"
                  className="btn btn-success"
                  onClick={handleSauvegarderCreation}
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Boutons finaux */}
        <div className="col-md-6 mt-4">
          {!sessionVerouillee && !sessionRemplie && (<button
            type="button"
            id="validerSessionCours"
            className="btn btn-primary"
            onClick={handleValider}
          >
            Continuer
          </button>)}
          <button
            type="button"
            className="btn btn-secondary ms-3 align-items-center"
            onClick={() => {
              handleReinitialiser();
            }}
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Animation erreurs */}
      <style>{`
        .animate-shake {
          animation: shake 0.3s;
          border-color: red !important;
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
      `}</style>

    </div>
  );
}

export default SectionSession;
