// === Page d'édition d'une inscription ===

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { getInscriptionById, updateInscription } from '../services/api';

const EditInscription = () => {
  const [loading, setLoading] = useState(true);
  const [alerte, setAlerte] = useState(null);
  const [inscription, setInscription] = useState(null);

  const [evaluations, setEvaluations] = useState([]);
  const [noteRattrapage, setNoteRattrapage] = useState('');
  const [moyenneFinale, setMoyenneFinale] = useState('');
  const [sanction, setSanction] = useState('');
  const [appreciation, setAppreciation] = useState('');

  const [isModified, setIsModified] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const id = params.get('id');

  const ajouterEvaluation = () => {
    setEvaluations(prev => [...prev, { id: Date.now(), intitule: '', pourcentage: '', note: '' }]);
    setIsModified(true);
  };

  const supprimerEvaluation = (evalId) => {
    setEvaluations(prev => prev.filter(e => e.id !== evalId));
    setIsModified(true);
  };

  const modifierEvaluation = (evalId, field, value) => {
    if (field === 'note') {
      const numValue = parseFloat(value);
      if (value === '' || (numValue >= 0 && numValue <= 20)) {
        setEvaluations(prev => 
          prev.map(e => e.id === evalId ? { ...e, [field]: value } : e)
        );
        setIsModified(true);
      }
    } else {
      setEvaluations(prev => 
        prev.map(e => e.id === evalId ? { ...e, [field]: value } : e)
      );
      setIsModified(true);
    }
  };

  const totalPourcentages = evaluations.reduce(
    (total, e) => total + (parseFloat(e.pourcentage) || 0),
    0
  );

  const handleNoteRattrapageChange = (value) => {
    setNoteRattrapage(value);
    setIsModified(true);
  };
  
  const handleMoyenneFinaleChange = (value) => {
    setMoyenneFinale(value);
    setIsModified(true);
  };
  
  const handleSanctionChange = (value) => {
    setSanction(value);
    setIsModified(true);
  };
  
  const handleAppreciationChange = (value) => {
    setAppreciation(value);
    setIsModified(true);
  };

  // === CHARGER L'INSCRIPTION AU MONTAGE ===
  useEffect(() => {
    const charger = async () => {
      if (!id) {
        setAlerte({ type: 'danger', message: 'ID manquant.' });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getInscriptionById(id);
        setInscription(data);

        // === PRÉ-REMPLIR LES ÉTATS EN PARSANT LES DONNÉES ===
        const notes = data.notes || '';
        let evals = [];
        if (notes) {
          const items = notes.split(';');
          evals = items.map((item, idx) => {
            const match = item.match(/^(.+?)\((\d+)%\):(.+)$/);
            if (match) {
              return {
                id: Date.now() + idx,
                intitule: match[1].trim(),
                pourcentage: match[2],
                note: match[3]
              };
            }
            return null;
          }).filter(Boolean);
        }
        setEvaluations(evals);

        setNoteRattrapage(data.noteRattrapage != null ? String(data.noteRattrapage) : '');
        setMoyenneFinale(data.moyenneFinale != null ? String(data.moyenneFinale) : '');
        setSanction(data.sanction || '');
        setAppreciation(data.appreciations || '');

      } catch (error) {
        setAlerte({ type: 'danger', message: error.message });
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, [id]);

  // === SOUMETTRE LA MODIFICATION ===
  const handleValider = async () => {
    if (evaluations.length > 0 && totalPourcentages !== 100) {
      setAlerte({ type: 'danger', message: 'Le total des pourcentages doit faire 100%.' });
      return;
    }
    if (!moyenneFinale || isNaN(parseFloat(moyenneFinale)) || parseFloat(moyenneFinale) < 0 || parseFloat(moyenneFinale) > 20) {
      setAlerte({ type: 'danger', message: 'Moyenne finale invalide (0-20).' });
      return;
    }
    if (!sanction) {
      setAlerte({ type: 'danger', message: 'Sélectionnez une sanction.' });
      return;
    }

    try {
      // Reconstruire le champ "notes"
      const notesTexte = evaluations
        .filter(e => e.intitule && e.pourcentage && e.note)
        .map(e => `${e.intitule}(${e.pourcentage}%):${e.note}`)
        .join(';');

      const dataToUpdate = {
        id,
        notes: notesTexte,
        noteRattrapage: noteRattrapage === '' ? null : noteRattrapage,
        moyenneFinale,
        sanction,
        appreciations: appreciation
      };

      await updateInscription(dataToUpdate);
      alert("Modification enregistrée !");
      navigate('/search-modify'); // Redirige vers la recherche

    } catch (error) {
      setAlerte({ type: 'danger', message: error.message });
    }
  };

  // === DÉCONNEXION ===
  const handleLogout = () => {
    alert("Déconnexion");
  };

  // === AFFICHAGE EN CHARGEMENT ===
  if (loading) {
    return (
      <div className="container-fluid p-0">
        <Breadcrumb customPath={{ path: '/edit-inscription', label: 'Édition inscription' }} parentPaths={['/search-modify', '/edit-session', '/session-inscriptions']} />
        <header className="top-bar bg-light-yellow" style={{ padding: '15px 30px', display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid black' }}>
          <h2 className="mb-0">Édition inscription</h2>
          <button onClick={handleLogout} className="logout-btn-top">[→] Déconnexion</button>
        </header>
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      {/* === BREADCRUMB === */}
      <Breadcrumb 
        customPath={{ path: '/edit-inscription', label: 'Édition inscription' }} 
        parentPaths={['/search-modify', '/edit-session', '/session-inscriptions']} 
      />

      {/* === HEADER === */}
      <header className="top-bar bg-light-yellow" style={{
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid black'
      }}>
        <h2 className="mb-0">Édition inscription</h2>
        <button onClick={handleLogout} className="logout-btn-top">[→] Déconnexion</button>
      </header>

      {/* === CONTENU PRINCIPAL === */}
      <main className="container mt-4" style={{ maxWidth: '70%' }}>
        
        {/* === ALERTES === */}
        {alerte && (
          <div className={`alert alert-${alerte.type} alert-dismissible fade show`} style={{ width: '100%', textAlign: 'center' }}>
            {alerte.message}
            <button type="button" className="btn-close" onClick={() => setAlerte(null)} />
          </div>
        )}

        {/* === SECTION 1 : INFOS COURS/SESSION (READONLY) === */}
        <div className="form-section">
          <h4 className="mb-3">Informations du cours et de la session</h4>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label>Intitulé du cours</label>
              <input className="form-control" value={inscription?.intituleCours || ''} readOnly />
            </div>
            <div className="col-md-4 mb-3">
              <label>Année académique</label>
              <input className="form-control" value={inscription?.anneeAcademique || ''} readOnly />
            </div>
            <div className="col-md-4 mb-3">
              <label>Semestre</label>
              <input className="form-control" value={inscription?.semestre || ''} readOnly />
            </div>
            <div className="col-md-4 mb-3">
              <label>Code programme</label>
              <input className="form-control" value={inscription?.codeProgramme || ''} readOnly />
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', height: '1px', backgroundColor: '#000', margin: '24px 0' }} />

        {/* === SECTION 2 : SectionHistorique remasterisé === */}
        <div className="form-section">
          <h4 className="mb-3">Informations étudiant et résultats</h4>

          {/* Infos étudiant (readonly) */}
          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <label>Matricule</label>
              <input className="form-control" value={inscription?.matricule || ''} readOnly />
            </div>
            <div className="col-md-4 mb-3">
              <label>Nom</label>
              <input className="form-control" value={inscription?.nom || ''} readOnly />
            </div>
            <div className="col-md-4 mb-3">
              <label>Prénoms</label>
              <input className="form-control" value={inscription?.prenoms || ''} readOnly />
            </div>
          </div>

          {/* Évaluations */}
          <div className="mb-4">
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
                      placeholder="Ex: Devoir 1..."
                      className="form-control"
                      value={e.intitule}
                      onChange={ev => modifierEvaluation(e.id, 'intitule', ev.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <input
                      type="number"
                      placeholder="Ex : 30"
                      min="0"
                      max="100"
                      className="form-control"
                      value={e.pourcentage}
                      onChange={ev => modifierEvaluation(e.id, 'pourcentage', ev.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="number"
                      placeholder="Note"
                      min="0"
                      max="20"
                      className="form-control"
                      value={e.note}
                      onChange={ev => modifierEvaluation(e.id, 'note', ev.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Résultats finaux */}
          <div>
            <h6>Résultats finaux</h6>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                Note rattrapage
                <input
                  type="number"
                  placeholder="Optionnel"
                  className="form-control"
                  value={noteRattrapage}
                  onChange={e => handleNoteRattrapageChange(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                Moyenne finale <span style={{ color: 'red' }}>*</span>
                <input
                  type="number"
                  placeholder="Moyenne"
                  className="form-control"
                  value={moyenneFinale}
                  onChange={e => handleMoyenneFinaleChange(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                Sanction <span style={{ color: 'red' }}>*</span>
                <select
                  className="form-select"
                  value={sanction}
                  onChange={e => handleSanctionChange(e.target.value)}
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
              rows="4"
              placeholder="Commentaires..."
              value={appreciation}
              onChange={e => handleAppreciationChange(e.target.value)}
            />
          </div>
        </div>

        {/* === BOUTONS === */}
        <div className="d-flex justify-content-between mt-4">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Annuler
          </button>
          <button className="btn btn-primary" onClick={handleValider} disabled={!isModified}>
            Valider la modification
          </button>
        </div>
      </main>
    </div>
  );
};

export default EditInscription;