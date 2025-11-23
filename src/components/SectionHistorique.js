// SectionHistorique.js
import React, { useState, useEffect, useCallback } from 'react';
import { rechercherEtudiants } from '../services/api';

function SectionHistorique({
  onSoumettre,
  triggerSoumission,
  setTriggerSoumission,
  onToggleSoumission,
  intituleCours,
  sigleCours,
  codeProgramme,
  anneeAcademique,
  creditCours,
  semestre,
  idEnseignant
}) {
  // === ÉTATS ===
  const [rechercheMatricule, setRechercheMatricule] = useState('');
  const [rechercheNom, setRechercheNom] = useState('');
  const [recherchePrenoms, setRecherchePrenoms] = useState('');
  const [resultatsEtudiants, setResultatsEtudiants] = useState([]);
  const [showTableEtudiants, setShowTableEtudiants] = useState(false);
  const [matricule, setMatricule] = useState('');
  const [nom, setNom] = useState('');
  const [prenoms, setPrenoms] = useState('');
  const [etudiantChoisi, setEtudiantChoisi] = useState(false);
  const [evaluations, setEvaluations] = useState([]);
  const [noteRattrapage, setNoteRattrapage] = useState('');
  const [moyenneFinale, setMoyenneFinale] = useState('');
  const [sanction, setSanction] = useState('');
  const [appreciation, setAppreciation] = useState('');
  const [showSectionEvaluations, setShowSectionEvaluations] = useState(false);
  const [showSectionResultats, setShowSectionResultats] = useState(false);
  const [alerte, setAlerte] = useState(null);

  console.log("DEBUG SectionHistorique props :", {
    intituleCours,
    sigleCours,
    codeProgramme,
    anneeAcademique,
    creditCours,
    semestre,
    idEnseignant
  });

  const totalPourcentages = evaluations.reduce(
    (total, e) => total + (parseFloat(e.pourcentage) || 0),
    0
  );

  // === RECHERCHE ÉTUDIANT ===
  const handleRechercherEtudiant = async () => {
    if (!rechercheMatricule && !rechercheNom && !recherchePrenoms) {
      setAlerte({ message: 'Veuillez remplir au moins un champ.', type: 'warning' });
      return;
    }

    try {
      const data = await rechercherEtudiants({
        matricule: rechercheMatricule,
        nom: rechercheNom,
        prenoms: recherchePrenoms
      });

      setResultatsEtudiants(data);
      setShowTableEtudiants(true);
    } catch (error) {
      setAlerte({ message: 'Erreur serveur.', type: 'danger' });
    }
  };

  const handleChoisirEtudiant = (etudiant) => {
    const mat = etudiant.matriculeD || etudiant.matriculeP || '';

    setRechercheMatricule(mat);
    setRechercheNom(etudiant.nom || '');
    setRecherchePrenoms(etudiant.prenoms || '');
    setMatricule(mat);
    setNom(etudiant.nom || '');
    setPrenoms(etudiant.prenoms || '');

    setEtudiantChoisi(true);
    setShowSectionEvaluations(true);
    setShowSectionResultats(true);
    setShowTableEtudiants(false);
  };

  // === RÉINITIALISATION ===
  const handleReinitialiserLocal = useCallback(() => {
    setRechercheMatricule('');
    setRechercheNom('');
    setRecherchePrenoms('');
    setMatricule('');
    setNom('');
    setPrenoms('');
    setEtudiantChoisi(false);
    setShowTableEtudiants(false);
    setEvaluations([]);
    setNoteRattrapage('');
    setMoyenneFinale('');
    setSanction('');
    setAppreciation('');
    setShowSectionEvaluations(false);
    setShowSectionResultats(false);
    setAlerte(null);

    if (typeof onToggleSoumission === 'function') onToggleSoumission(false);
  }, [onToggleSoumission]);

  // === ÉVALUATIONS ===
  const ajouterEvaluation = () => {
    setEvaluations(prev => [...prev, { id: Date.now(), intitule: '', pourcentage: '', note: '' }]);
  };

  const supprimerEvaluation = (id) => {
    setEvaluations(prev => prev.filter(e => e.id !== id));
  };

  const modifierEvaluation = (id, field, value) => {
    setEvaluations(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  // === SOUMISSION ===
  // on utilise useCallback pour que useEffect puisse référencer la fonction sans warning eslint
  const handleSoumettre = useCallback(async () => {
    setAlerte(null);

    // Vérification total des pourcentages 
    if (evaluations.length > 0 && totalPourcentages !== 100) {
      return setAlerte({
        message: "Le total des pourcentages doit faire 100%.",
        type: "danger",
      });
    }

    // validations minimales 
    if (!moyenneFinale || isNaN(parseFloat(moyenneFinale)) || parseFloat(moyenneFinale) < 0 || parseFloat(moyenneFinale) > 20) {
      setAlerte({ message: 'Moyenne finale invalide.', type: 'danger' });
      return { success: false, message: 'Moyenne finale invalide.' };
    }
    if (!sanction) {
      setAlerte({ message: 'Sélectionnez une sanction.', type: 'danger' });
      return { success: false, message: 'Sanction manquante.' };
    }

    // vérifier que les données de cours/session sont présentes 
    if (!intituleCours || !sigleCours || !codeProgramme || !anneeAcademique || !semestre) {
      setAlerte({ message: "Erreur : informations du cours/session manquantes.", type: 'danger' });
      return { success: false, message: "Données cours/session manquantes" };
    }

    const data = {
      matricule,
      nom,
      prenoms,
      intituleCours,
      sigleCours,
      codeProgramme,
      anneeAcademique,
      creditCours,
      idEnseignant,
      semestre,
      notes: evaluations
        .filter(e => e.intitule && e.pourcentage && e.note)
        .map(e => `${e.intitule}(${e.pourcentage}%):${e.note}`)
        .join(';'),
      noteRattrapage: noteRattrapage === '' ? null : noteRattrapage,
      moyenneFinale,
      appreciations: appreciation,
      sanction,
    };

    try {
      // Si parent fournit onSoumettre, on l'appelle (il fait le fetch côté FormSaisie).
      if (typeof onSoumettre === 'function') {
        const result = await onSoumettre(data);
        // onSoumettre doit renvoyer un objet { success: boolean, message: string } idéalement
        if (result && result.success) {
          setAlerte({ message: result.message || 'Soumission réussie.', type: 'success' });
          handleReinitialiserLocal();
          if (typeof onToggleSoumission === 'function') onToggleSoumission(false);
        } else {
          setAlerte({ message: (result && result.message) || 'Erreur lors de la soumission.', type: 'danger' });
        }
        return result;
      } else {
        // fallback : log et reset local
        console.log('Données prêtes à être envoyées :', data);
        setAlerte({ message: 'Données prêtes (mode mock).', type: 'info' });
        handleReinitialiserLocal();
        if (typeof onToggleSoumission === 'function') onToggleSoumission(false);
        return { success: true, message: 'mock success' };
      }
    } catch (err) {
      console.error(err);
      setAlerte({ message: 'Erreur serveur lors de la soumission.', type: 'danger' });
      return { success: false, message: err.message || 'Erreur' };
    }
  }, [
    matricule, nom, prenoms,
    intituleCours, sigleCours, codeProgramme, anneeAcademique, semestre, creditCours, idEnseignant,
    evaluations, noteRattrapage, moyenneFinale, appreciation, sanction,
    onSoumettre, handleReinitialiserLocal, onToggleSoumission
  ]);

  // déclenchement via triggerSoumission (bouton "Soumission finale" dans le parent)
  useEffect(() => {
    if (triggerSoumission) {

      (async () => {
        await handleSoumettre();
        // indiquer au parent que la requête a été consommée
        if (typeof setTriggerSoumission === 'function') setTriggerSoumission(false);
      })();
    }
  }, [triggerSoumission, handleSoumettre, setTriggerSoumission]);

  // afficher/cacher le bouton final selon état local (étudiant choisi + moyenne + sanction)
  useEffect(() => {
    if (typeof onToggleSoumission === 'function') {
      const eligible = Boolean(etudiantChoisi && moyenneFinale !== '' && sanction);
      onToggleSoumission(eligible);
    }
  }, [etudiantChoisi, moyenneFinale, sanction, onToggleSoumission]);

  // === RENDU ===
  return (
    <div className="form-section">
      <h4 className="mb-4">Historique inscription étudiant</h4>

      {alerte && (
        <div className={`alert alert-${alerte.type} alert-dismissible fade show`}>
          {alerte.message}
          <button type="button" className="btn-close" onClick={() => setAlerte(null)} />
        </div>
      )}

      {/* Recherche étudiant */}
      <div className="mb-4">
        <h6>Informations étudiant</h6>
        <div className="row">
          <div className="col-md-4 mb-3">
            <h6>Matricule</h6>
            <input
              className="form-control"
              placeholder="Ex: ETU2024001"
              value={rechercheMatricule}
              onChange={e => setRechercheMatricule(e.target.value)}
              readOnly={etudiantChoisi}
            />
          </div>
          <div className="col-md-4 mb-3">
            <h6>Nom</h6>
            <input
              className="form-control"
              placeholder="Nom de famille"
              value={rechercheNom}
              onChange={e => setRechercheNom(e.target.value)}
              readOnly={etudiantChoisi}
            />
          </div>
          <div className="col-md-4 mb-3">
            <h6>Prénoms</h6>
            <input
              className="form-control"
              placeholder="Prénoms de l'étudiant"
              value={recherchePrenoms}
              onChange={e => setRecherchePrenoms(e.target.value)}
              readOnly={etudiantChoisi}
            />
          </div>
          <div className="col-12 mt-3">
            <button className="btn btn-primary" onClick={handleRechercherEtudiant}>Rechercher</button>
            <button className="btn btn-secondary ms-2" onClick={handleReinitialiserLocal}>Réinitialiser</button>
          </div>
        </div>
      </div>

      {/* Tableau étudiants */}
      {showTableEtudiants && (
        <table className="table table-striped mb-4">
          <thead className="table-dark">
            <tr>
              <th>Matricule</th>
              <th>Nom</th>
              <th>Prénoms</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {resultatsEtudiants.length ? resultatsEtudiants.map((e, i) => (
              <tr key={i}>
                <td>{e.matriculeD || e.matriculeP} {e.matriculeD ? '(Définitif)' : '(Provisoire)'}</td>
                <td>{e.nom}</td>
                <td>{e.prenoms}</td>
                <td>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleChoisirEtudiant(e)}
                  >
                    Choisir
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="text-center">Aucun étudiant trouvé</td></tr>
            )}
          </tbody>
        </table>
      )}

      <hr style={{ border: 'none', height: '1px', backgroundColor: '#000', margin: '0 0 16px 0' }} />

      {/* Évaluations */}
      {showSectionEvaluations && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6>Évaluations</h6>
            <div>Total des pourcentages : {totalPourcentages}%</div>
            <button className="btn btn-dark btn-sm" onClick={ajouterEvaluation}>Ajouter évaluation</button>
          </div>
          {evaluations.map((e, idx) => (
            <div key={e.id} className="card card-body mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6>Évaluation n°{idx + 1}</h6>
                <button className="btn btn-danger btn-sm" onClick={() => supprimerEvaluation(e.id)}>×</button>
              </div>
              <div className="row g-3">
                <div className="col-md-5">
                  <input
                    type="text"
                    placeholder="Ex: Devoir 1, Examen final..."
                    className="form-control"
                    value={e.intitule}
                    onChange={ev => modifierEvaluation(e.id, 'intitule', ev.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="number"
                    placeholder="Ex : 20, 40..."
                    min={0}
                    max={100}
                    className="form-control"
                    value={e.pourcentage}
                    onChange={ev => modifierEvaluation(e.id, 'pourcentage', ev.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="number"
                    placeholder="Note obtenue"
                    min={0}
                    max={20}
                    className="form-control"
                    value={e.note}
                    onChange={ev => modifierEvaluation(e.id, 'note', ev.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Résultats finaux */}
      {showSectionResultats && (
        <div>
          <hr />
          <h6>Résultats finaux</h6>
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              Note rattrapage
              <input
                type="number"
                placeholder="Optionnel"
                className="form-control"
                value={noteRattrapage}
                onChange={e => setNoteRattrapage(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              Moyenne finale <span style={{ color: 'red' }}>*</span>
              <input
                type="number"
                placeholder="Moyenne de l'étudiant"
                className="form-control"
                value={moyenneFinale}
                onChange={e => setMoyenneFinale(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              Sanction <span style={{ color: 'red' }}>*</span>
              <select
                className="form-select"
                value={sanction}
                onChange={e => setSanction(e.target.value)}
              >
                <option value="">--Sélectionner--</option>
                <option value="inscrit">Inscrit</option>
                <option value="reussi">Réussi</option>
                <option value="echoue">Échoué</option>
                <option value="abandonne">Abandonné</option>
              </select>
            </div>
          </div>
          Appréciations
          <textarea
            className="form-control mb-3"
            rows={4}
            placeholder="Commentaires..."
            value={appreciation}
            onChange={e => setAppreciation(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

export default SectionHistorique;
