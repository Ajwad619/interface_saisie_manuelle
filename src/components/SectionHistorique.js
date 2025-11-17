import React, { useState, useEffect } from 'react';

function SectionHistorique({ onSoumettre, onReinitialiser, triggerSoumission, setTriggerSoumission }) {
  // États
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

  const totalPourcentages = evaluations.reduce((total, e) => total + (parseFloat(e.pourcentage) || 0), 0);

  // Recherche étudiant API
  const handleRechercherEtudiant = async () => {
    if (!rechercheMatricule && !rechercheNom && !recherchePrenoms) {
      setAlerte({ message: 'Veuillez remplir au moins un champ.', type: 'warning' });
      return;
    }
    try {
      const params = new URLSearchParams({
        matricule: rechercheMatricule,
        nom: rechercheNom,
        prenoms: recherchePrenoms
      });
      const response = await fetch(`/rechercher_etudiants.php?${params}`);
      const data = await response.json();
      setResultatsEtudiants(data);
      setShowTableEtudiants(true);
    } catch (error) {
      setAlerte({ message: 'Erreur serveur.', type: 'danger' });
    }
  };

  const handleChoisirEtudiant = (etudiant) => {
    setMatricule(etudiant.matricule);
    setNom(etudiant.nom);
    setPrenoms(etudiant.prenoms);
    setShowTableEtudiants(false);
    setEtudiantChoisi(true);
    setShowSectionEvaluations(true);
    setShowSectionResultats(true);
  };

  useEffect(() => {
    if (triggerSoumission) {
      handleSoumettre();
      setTriggerSoumission(false);
    }
  }, [triggerSoumission]);

  const handleReinitialiserLocal = () => {
    setRechercheMatricule('');
    setRechercheNom('');
    setRecherchePrenoms('');
    setResultatsEtudiants([]);
    setShowTableEtudiants(false);
    setMatricule('');
    setNom('');
    setPrenoms('');
    setEtudiantChoisi(false);
    setEvaluations([]);
    setNoteRattrapage('');
    setMoyenneFinale('');
    setSanction('');
    setAppreciation('');
    setShowSectionEvaluations(false);
    setShowSectionResultats(false);
    setAlerte(null);
    if (onReinitialiser) onReinitialiser();
  };

  const ajouterEvaluation = () => {
    setEvaluations([...evaluations, { id: Date.now(), intitule: '', pourcentage: '', note: '' }]);
  };

  const supprimerEvaluation = (id) => {
    setEvaluations(evaluations.filter(e => e.id !== id));
  };

  const modifierEvaluation = (id, field, value) => {
    setEvaluations(evaluations.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleSoumettre = () => {
    setAlerte(null);

    if (totalPourcentages !== 100) {
      setAlerte({ message: 'Le total des pourcentages doit être exactement 100%.', type: 'danger' });
      return;
    }
    if (!moyenneFinale || isNaN(parseFloat(moyenneFinale)) || parseFloat(moyenneFinale) < 0 || parseFloat(moyenneFinale) > 20) {
      setAlerte({ message: 'Moyenne finale invalide.', type: 'danger' });
      return;
    }
    if (!sanction) {
      setAlerte({ message: 'Sélectionnez une sanction.', type: 'danger' });
      return;
    }

    const data = {
      matricule,
      nom,
      prenoms,
      noteRattrapage,
      moyenneFinale,
      sanction,
      appreciation,
      notes: evaluations
        .filter(e => e.intitule && e.pourcentage && e.note)
        .map(e => `${e.intitule}(${e.pourcentage}%):${e.note}`)
        .join(';')
    };

    if (onSoumettre) onSoumettre(data);
  };

  return (
    <div className="page-section">
      <div className="page-card">

        <h4 className="mb-4">Historique inscription étudiant</h4>

        {alerte && (
          <div className={`alert alert-${alerte.type} alert-dismissible fade show`}>
            {alerte.message}
            <button type="button" className="btn-close" onClick={() => setAlerte(null)} />
          </div>
        )}

        {/* Recherche */}
        <div className="mb-4">
          <h6>Informations étudiant</h6>
          <div className="row">
            <div className="col-md-4 mb-3">
              <input className="form-control" placeholder="Matricule" value={rechercheMatricule} onChange={e => setRechercheMatricule(e.target.value)} />
            </div>
            <div className="col-md-4 mb-3">
              <input className="form-control" placeholder="Nom" value={rechercheNom} onChange={e => setRechercheNom(e.target.value)} />
            </div>
            <div className="col-md-4 mb-3">
              <input className="form-control" placeholder="Prénoms" value={recherchePrenoms} onChange={e => setRecherchePrenoms(e.target.value)} />
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
                  <td>{e.matricule}</td>
                  <td>{e.nom}</td>
                  <td>{e.prenoms}</td>
                  <td>
                    <button className="btn btn-success btn-sm" onClick={() => handleChoisirEtudiant(e)}>Choisir</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="text-center">Aucun étudiant trouvé</td></tr>
              )}
            </tbody>
          </table>
        )}

        {/* Infos étudiant */}
        {(matricule || nom || prenoms) && (
          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <input className="form-control" readOnly value={matricule} />
            </div>
            <div className="col-md-4 mb-3">
              <input className="form-control" readOnly value={nom} />
            </div>
            <div className="col-md-4 mb-3">
              <input className="form-control" readOnly value={prenoms} />
            </div>
          </div>
        )}

        {/* Évaluations */}
        {showSectionEvaluations && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6>Évaluations</h6>
              <span>Total : {totalPourcentages}%</span>
              <button className="btn btn-dark btn-sm" onClick={ajouterEvaluation}>Ajouter</button>
            </div>

            {evaluations.map((e, idx) => (
              <div key={e.id} className="card card-body mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6>Évaluation {idx + 1}</h6>
                  <button className="btn btn-danger btn-sm" onClick={() => supprimerEvaluation(e.id)}>×</button>
                </div>

                <div className="row g-3">
                  <div className="col-md-5">
                    <input className="form-control" placeholder="Intitulé" value={e.intitule} onChange={ev => modifierEvaluation(e.id, 'intitule', ev.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <input type="number" className="form-control" placeholder="%" min="0" max="100" value={e.pourcentage} onChange={ev => modifierEvaluation(e.id, 'pourcentage', ev.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <input type="number" className="form-control" placeholder="Note" min="0" max="20" value={e.note} onChange={ev => modifierEvaluation(e.id, 'note', ev.target.value)} />
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
                <input type="number" placeholder="Note rattrapage" className="form-control" value={noteRattrapage} onChange={e => setNoteRattrapage(e.target.value)} />
              </div>
              <div className="col-md-4">
                <input type="number" placeholder="Moyenne finale" className="form-control" value={moyenneFinale} onChange={e => setMoyenneFinale(e.target.value)} />
              </div>
              <div className="col-md-4">
                <select className="form-select" value={sanction} onChange={e => setSanction(e.target.value)}>
                  <option value="">-- sanction --</option>
                  <option value="inscrit">Inscrit</option>
                  <option value="reussi">Réussi</option>
                  <option value="echoue">Échoué</option>
                  <option value="abandonne">Abandonné</option>
                </select>
              </div>
            </div>

            <textarea className="form-control mb-3" rows="4" placeholder="Commentaire" value={appreciation} onChange={e => setAppreciation(e.target.value)} />
          </div>
        )}

      </div>
    </div>
  );
}

export default SectionHistorique;
