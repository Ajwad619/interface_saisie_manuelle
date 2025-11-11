// === IMPORTATIONS ===
// React et useState pour créer le composant et gérer les boîtes
import React, { useState, useEffect } from 'react';
// enregistrerProgramme pour sauvegarder un nouveau programme.
import { enregistrerProgramme } from '../services/api';

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
  // Chaque champ a sa boîte pour se souvenir de la valeur donc un useState pour chaque
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

  // États pour les erreurs
  const [erreurs, setErreurs] = useState({});

  // AJOUT : État pour les alertes, inspiré de programme.js (alertes pour erreurs de sauvegarde)
  const [alerte, setAlerte] = useState(null);

  // === CHARGER LES PROGRAMMES AU DÉMARRAGE ===
  // useEffect : comme un robot qui fait une tâche automatique au départ.
  useEffect(() => {
    // on charge programmes.json .
    fetch('/data/programmes.json')
      .then(response => response.json())
      .then(data => setProgrammes(data))  // Mettre dans la boîte programmes
      .catch(console.error);
  }, []);  // [] signifie "une seule fois au démarrage"

  // === FONCTIONS POUR LES BOUTONS ===
  // Afficher le mini-formulaire pour créer un programme.
  const handleAfficherMiniForm = () => {
    setShowMiniForm(true);  // Changer la boîte showMiniForm à vrai
  };

  // Annuler la création : cacher et vider.
  const handleAnnulerCreation = () => {
    setShowMiniForm(false);
    setNouveauCode('');
    setNouveauTitre('');
    setNouveauNiveau('');
  };

  // Sauvegarder le nouveau programme.
  const handleSauvegarderCreation = async () => {
    if (!nouveauCode || !nouveauTitre || !nouveauNiveau) {
      setAlerte({ message: 'Tous champs requis.', type: 'warning' });
      return;
    }
    try {
      const result = await enregistrerProgramme({ code: nouveauCode, titre: nouveauTitre, niveau: nouveauNiveau });
      if (result.success) {
        setProgrammes([...programmes, result.nouveauProgramme]); // AJOUT : Mise à jour dynamique de la liste programmes, comme dans programme.js
        setShowMiniForm(false);
        setAlerte({ message: 'Programme ajouté !', type: 'success' });
      } else {
        setAlerte({ message: result.message, type: 'danger' });
      }
    } catch (error) {
      setAlerte({ message: 'Erreur sauvegarde.', type: 'danger' });
    }
  };

  // Validation complète au clic sur Valider
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
    // S'il n'y a pas d'erreurs, procéder
    if (Object.keys(nouvellesErreurs).length === 0) {
      if (onAfterValidation) onAfterValidation();
    }
  };

  // Fonction de style dynamique pour surbrillance rouge et animation
  const classInput = (field) => erreurs[field] ? "form-control is-invalid animate-shake" : "form-control";

  // === RENDU DU COMPOSANT ===
  return (
    <div className="form-section">
      <h4>Informations session de cours</h4>

      {/* AJOUT : Affichage de l'alerte pour erreurs de sauvegarde programme, comme dans programme.js */}
      {alerte && (
        <div className={`alert alert-${alerte.type} alert-dismissible fade show`} role="alert">
          {alerte.message}
          <button type="button" className="btn-close" onClick={() => setAlerte(null)} />
        </div>
      )}

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Annee academique < span style={{ color: 'red' }}>*</span></label>
          <input
            type="text"
            id="anneeAcademique" 
            className={classInput("anneeAcademique")}
            value={anneeAcademique}
            onChange={(e) => setAnneeAcademique(e.target.value)}
            placeholder='ex : 23-24'
            required
          />
          {erreurs.anneeAcademique && <div className="invalid-feedback">{erreurs.anneeAcademique}</div>}
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Semestre <span style={{ color: 'red' }}>*</span></label>
          <select
            className={classInput("semestre")}
            id="semestre"
            value={semestre}
            onChange={(e) => setSemestre(e.target.value)}
            required
          >
            <option disabled>-- Sélectionner --</option>
            {Array.from({ length: 7 }, (_, i) => i + 1).map(i => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
          {erreurs.semestre && <div className="invalid-feedback">{erreurs.semestre}</div>}
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Credit du cours <span style={{ color: 'red' }}>*</span></label>
          <input
            type="text"
            id="creditCours"
            className={classInput("creditCours")}
            value={creditCours}
            onChange={(e) => setCreditCours(e.target.value)}
            min="0" max="15" step="1"
            required
          />
          {erreurs.creditCours && <div className="invalid-feedback">{erreurs.creditCours}</div>}
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Code Programme <span style={{ color: 'red' }}>*</span></label>
          <select
            className={classInput("codeProgramme")}
            id="codeProgramme"
            value={codeProgramme}
            onChange={(e) => setCodeProgramme(e.target.value)}
            required
          >
            <option disabled>-- Sélectionner --</option>
            {programmes.map((prog, index) => (
              <option key={index} value={prog.code}>{prog.code} - {prog.titre}</option>
            ))}
          </select>
          {erreurs.codeProgramme && <div className="invalid-feedback">{erreurs.codeProgramme}</div>}
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Identifiant de l'enseignant (optionnel)</label>
          <input
            type="text"
            className={classInput("idEnseignant")}
            value={idEnseignant}
            onChange={(e) => setIdEnseignant(e.target.value)}
          />
          {erreurs.idEnseignant && <div className="invalid-feedback">{erreurs.idEnseignant}</div>}
        </div>

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

        <div className="col-md-6 mt-4">
          <button
            type="button"
            id="validerSessionCours"
            className="btn btn-primary"
            onClick={handleValider}
          >
            Continuer
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-3 align-items-center"
            onClick={() => {
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
              if (onReinitialiser) onReinitialiser();
            }}
          >
            Réinitialiser
          </button>
        </div>
      </div>

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