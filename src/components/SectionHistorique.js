import React, { useState , useEffect } from 'react';

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
  const [alerte, setAlerte] = useState(null); // AJOUT : État alerte

  const totalPourcentages = evaluations.reduce((total, e) => total + (parseFloat(e.pourcentage) || 0), 0);

  // Recherche étudiant (connectée à API)
  const handleRechercherEtudiant = async () => {
    if (!rechercheMatricule && !rechercheNom && !recherchePrenoms) {
      setAlerte({ message: 'Veuillez remplir au moins un champ.', type: 'warning' });
      return;
    }
    try {
      const params = new URLSearchParams({ matricule: rechercheMatricule, nom: rechercheNom, prenoms: recherchePrenoms });
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

  // AJOUT : useEffect pour écouter triggerSoumission et déclencher handleSoumettre
  useEffect(() => {
    if (triggerSoumission) {
      handleSoumettre();  // Appelle la fonction de soumission
      setTriggerSoumission(false);  // Remet à false après
    }
  }, [triggerSoumission]);  // Dépend de triggerSoumission

  const handleReinitialiser = () => {
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
      matricule, nom, prenoms, noteRattrapage, moyenneFinale, sanction, appreciation,
      notes: evaluations.filter(e => e.intitule && e.pourcentage && e.note).map(e => `${e.intitule}(${e.pourcentage}%):${e.note}`).join(';')
    };
    if (onSoumettre) onSoumettre(data);
  };

  return (
    <div className="form-section" style={{ backgroundColor: '#fbf6ebff', padding: 30, borderRadius: 15, boxShadow: '0 5px 15px rgba(0,0,0,0.1)', marginBottom: 30 }}>
      <h4>Historique inscription étudiant</h4>

      {/* AJOUT : Affichage alerte */}
      {alerte && (
        <div className={`alert alert-${alerte.type} alert-dismissible fade show`} role="alert">
          {alerte.message}
          <button type="button" className="btn-close" onClick={() => setAlerte(null)} />
        </div>
      )}

      {/* Recherche */}
      <div style={{ marginBottom: 30 }}>
        <h6>Informations étudiant</h6>
        <div className="row">
          <div className="col-md-4 mb-3">
            <h6>Matricule</h6>
            <input className="form-control" placeholder="Ex: ETU2024001" value={rechercheMatricule} onChange={e => setRechercheMatricule(e.target.value)} />
          </div>
          <div className="col-md-4 mb-3">
            <h6>Nom</h6>
            <input className="form-control" placeholder="Nom de famille" value={rechercheNom} onChange={e => setRechercheNom(e.target.value)} />
          </div>
          <div className="col-md-4 mb-3">
            <h6>Prénoms</h6>
            <input className="form-control" placeholder="Prénoms de l'étudiant" value={recherchePrenoms} onChange={e => setRecherchePrenoms(e.target.value)} />
          </div>
          <div className="col-12 mt-4">
            <button className="btn btn-primary" onClick={handleRechercherEtudiant}>Rechercher</button>
            <button className="btn btn-secondary ms-2" onClick={handleReinitialiser}>Réinitialiser</button>
          </div>
        </div>
      </div>

      {/* Tableau */}
      {showTableEtudiants && (
        <table className="table table-striped mb-4">
          <thead className="table-dark">
            <tr><th>Matricule</th><th>Nom</th><th>Prénoms</th><th>Action</th></tr>
          </thead>
          <tbody>
            {resultatsEtudiants.length ? resultatsEtudiants.map((e, i) => (
              <tr key={i}>
                <td>{e.matricule}</td>
                <td>{e.nom}</td>
                <td>{e.prenoms}</td>
                <td><button className="btn btn-success btn-sm" onClick={() => handleChoisirEtudiant(e)}>Choisir</button></td>
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
            <input className="form-control" readOnly value={matricule} style={{ backgroundColor: '#e9ecef' }} />
          </div>
          <div className="col-md-4 mb-3">
            <input className="form-control" readOnly value={nom} style={{ backgroundColor: '#e9ecef' }} />
          </div>
          <div className="col-md-4 mb-3">
            <input className="form-control" readOnly value={prenoms} style={{ backgroundColor: '#e9ecef' }} />
          </div>
        </div>
      )}

      {/* Évaluations */}
      {showSectionEvaluations && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6>Évaluations</h6>
            <div>Total des pourcentages : {totalPourcentages}%</div>
            <button className="btn btn-dark btn-sm" onClick={ajouterEvaluation}>Ajouter évaluation</button>
          </div>
          {evaluations.map((e, idx) => (
            <div key={e.id} className="card p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6>Évaluation n°{idx + 1}</h6>
                <button className="btn btn-danger btn-sm" onClick={() => supprimerEvaluation(e.id)}>×</button>
              </div>
              <div className="row g-3">
                <div className="col-md-5">
                  <input type="text" placeholder="Ex: Devoir 1, Examen final..." className="form-control" value={e.intitule} onChange={ev => modifierEvaluation(e.id, 'intitule', ev.target.value)} />
                </div>
                <div className="col-md-3">
                  <input type="number" placeholder="Ex : 20, 40..." min={0} max={100} className="form-control" value={e.pourcentage} onChange={ev => modifierEvaluation(e.id, 'pourcentage', ev.target.value)} />
                </div>
                <div className="col-md-4">
                  <input type="number" placeholder="Note obtenue" min={0} max={20} className="form-control" value={e.note} onChange={ev => modifierEvaluation(e.id, 'note', ev.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Résultats finaux */}
      {showSectionResultats && (
        <>
          <hr style={{ marginBottom: 30, marginTop: 0 }} />
          <h6 style={{ marginBottom: 15 }}>Résultats finaux</h6>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <input type="number" placeholder="Note Rattrapage (optionnel)" min="0" max="20" step="0.01" className="form-control" value={noteRattrapage} onChange={e => setNoteRattrapage(e.target.value)} />
            </div>
            <div className="col-md-4">
              <input type="number" placeholder="Moyenne finale *" min="0" max="20" step="0.01" className="form-control" value={moyenneFinale} onChange={e => setMoyenneFinale(e.target.value)} />
            </div>
            <div className="col-md-4">
              <select className="form-select" value={sanction} onChange={e => setSanction(e.target.value)}>
                <option value="">-- Sélectionner une sanction --</option>
                <option value="inscrit">Inscrit</option>
                <option value="reussi">Réussi</option>
                <option value="echoue">Échoué</option>
                <option value="abandonne">Abandonné</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <textarea className="form-control" placeholder="(commentaires, observations...)" rows={4} value={appreciation} onChange={e => setAppreciation(e.target.value)} />
          </div>
        </>
      )}
    </div>
  );
}

export default SectionHistorique;
