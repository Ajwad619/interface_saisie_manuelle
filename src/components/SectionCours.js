import React, { useState } from 'react';
import { rechercherCours } from '../services/api';

// Fonction pour afficher une alerte temporaire (remplace alert classique)
function Alerte({ message, type, onClose }) {
  React.useEffect(() => {
    const timer = setTimeout(() => onClose(), 4000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className={`alert alert-${type} alert-dismissible fade show`} role="alert">
      {message}
      <button type="button" className="btn-close" onClick={onClose} aria-label="Fermer"></button>
    </div>
  );
}

function SectionCours({onAfterSearch , onReinitialiser}) {
  const [sigleCours, setSigleCours] = useState('');
  const [intituleCours, setIntituleCours] = useState('');
  const [showTable, setShowTable] = useState(false);
  const [resultats, setResultats] = useState([]);
  const [alerte, setAlerte] = useState(null);
  const [coursChoisi, setCoursChoisi] = useState(false);

   const [rechercheLancee, setRechercheLancee] = useState(false);

  const handleRechercher = async () => {
    if (!sigleCours.trim() && !intituleCours.trim()) {
      setAlerte({ message: 'Veuillez remplir au moins un champ de recherche.', type: 'warning' });
      return;
    }
    try {
      const data = await rechercherCours({ sigle: sigleCours, intitule: intituleCours });
      if (data.length === 0) {
        setAlerte({ message: 'Aucun résultat trouvé.', type: 'info' });
      }
      setResultats(data);
      setShowTable(true);
      setRechercheLancee(true);
    } catch (error) {
      setAlerte({ message: "Erreur de communication avec le serveur.", type: 'danger' });
      console.error(error);
    }
  };

  const handleReinitialiser = () => {
    setSigleCours('');
    setIntituleCours('');
    setShowTable(false);
    setResultats([]);
    setCoursChoisi(false);
    setRechercheLancee(false);
    if (onReinitialiser) onReinitialiser();
  };

  // === Fonction appelée quand on clique sur "Choisir" un résultat ===
  const handleChoisir = (sigle, intitule) => {
    setSigleCours(sigle);
    setIntituleCours(intitule);
    setShowTable(false);
    setCoursChoisi(true);
    if (onAfterSearch) onAfterSearch(); // Afficher la section Session
  };

  // Gestion de l'ajout de cours si aucun résultat (bouton "Ajouter" dans tbody si length === 0)
  const handleAjouterCours = async () => {
    if (!sigleCours.trim() || !intituleCours.trim()) {
      setAlerte({ message: 'Sigle et intitulé requis pour ajouter.', type: 'warning' });
      return;
    }
    try {
      const response = await fetch('/enregistrer_cours.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sigle: sigleCours, intitule: intituleCours }),
      });
      const result = await response.json();
      if (result.success) {
        setAlerte({ message: 'Cours ajouté !', type: 'success' });
        setCoursChoisi(true);
        if (onAfterSearch) onAfterSearch();
      } else {
        setAlerte({ message: result.message, type: 'danger' });
      }
    } catch (error) {
      setAlerte({ message: 'Erreur ajout.', type: 'danger' });
    }
  };

  return (
    <div className="form-section">
      <h4>Informations cours</h4>

      {/* Affichage de l'alerte si présent */}
      {alerte && <Alerte message={alerte.message} type={alerte.type} onClose={() => setAlerte(null)} />}

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Sigle de cours</label>
          <input type="text" className="form-control" value={sigleCours} onChange={(e) => setSigleCours(e.target.value)}
          readOnly={coursChoisi} />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Intitule cours</label>
          <input type="text" className="form-control" value={intituleCours} onChange={(e) => setIntituleCours(e.target.value)}
          readOnly={coursChoisi} />
        </div>
        <div className="col-md-3 mt-4">
          <button type="button" className="btn btn-primary text-center mt-4 mx-2" onClick={handleRechercher}>Rechercher</button>
          <button type="button" className="btn btn-secondary text-center mt-4 mx-2" onClick={handleReinitialiser}>Réinitialiser</button>
        </div>
        <div className="col-12 mt-4">
          <table className={`table table-bordered table-striped table-hover ${showTable ? '' : 'd-none'}`}>
            <thead className="table-dark">
              <tr><th>Sigle</th><th>Intitule</th><th>Action</th></tr>
            </thead>
            <tbody>
              {resultats.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center text-danger">
                    Aucun résultat trouvé
                    {/* Bouton "Ajouter un cours" si aucun résultat, comme dans cours.js */}
                    <button className="btn btn-primary ms-2" onClick={handleAjouterCours}>Ajouter un cours</button>
                  </td>
                </tr>
              ) : (
                resultats.map((cours, index) => (
                  <tr key={index}>
                    <td>{cours.sigle}</td>
                    {/*Utilisation de dangerouslySetInnerHTML pour afficher les ** des cours JSON, comme dans cours.js */}
                    <td dangerouslySetInnerHTML={{ __html: cours.intitule }} />
                    <td>
                      <button className="btn btn-success btn-sm" onClick={() => handleChoisir(cours.sigle, cours.intitule.replace(/\s\*\*$/, '').trim())}>
                        Selectionner
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SectionCours;