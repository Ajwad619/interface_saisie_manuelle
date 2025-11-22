import React, { useState } from 'react';
import { rechercherCours } from '../services/api';
import { ajouterCours } from '../services/api';

// === Petite alerte réutilisable ===
function Alerte({ message, type, onClose }) {
  React.useEffect(() => {
    const timer = setTimeout(() => onClose(), 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`alert alert-${type} alert-dismissible fade show`} role="alert">
      {message}
      <button type="button" className="btn-close" onClick={onClose}></button>
    </div>
  );
}

function SectionCours({ onAfterSearch, onReinitialiser }) {
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

  const handleChoisir = (sigle, intitule) => {
    setSigleCours(sigle);
    setIntituleCours(intitule);
    setShowTable(false);
    setCoursChoisi(true);

    if (onAfterSearch) onAfterSearch({
      intituleCours: intitule,
      sigleCours: sigle,
    });
  };


  const handleAjouterCours = async () => {
    if (!sigleCours.trim() || !intituleCours.trim()) {
      setAlerte({ message: 'Sigle et intitulé requis pour ajouter.', type: 'warning' });
      return;
    }

    try {
      const result = await ajouterCours({
        sigle: sigleCours,
        intitule: intituleCours
      });

      if (result.success) {
        setAlerte({ message: 'Cours ajouté !', type: 'success' });
        setCoursChoisi(true);
        if (onAfterSearch) onAfterSearch();
      } else {
        setAlerte({ message: result.message, type: 'danger' });
      }

    } catch (error) {
      setAlerte({ message: 'Erreur lors de l’ajout du cours.', type: 'danger' });
      console.error(error);
    }
  };  


  return (
    <div className="form-section mt-4">

      <h4 className="mb-4">Informations cours</h4>

      {alerte && (
        <Alerte
          message={alerte.message}
          type={alerte.type}
          onClose={() => setAlerte(null)}
        />
      )}

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Sigle de cours</label>
          <input
            type="text"
            className="form-control"
            value={sigleCours}
            onChange={(e) => setSigleCours(e.target.value)}
            readOnly={coursChoisi}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Intitulé cours</label>
          <input
            type="text"
            className="form-control"
            value={intituleCours}
            onChange={(e) => setIntituleCours(e.target.value)}
            readOnly={coursChoisi}
          />
        </div>

        <div className="col-md-12 text-start mt-3">
          <button type="button" className="btn btn-primary mx-2" onClick={handleRechercher}>
            Rechercher
          </button>
          <button type="button" className="btn btn-secondary mx-2" onClick={handleReinitialiser}>
            Réinitialiser
          </button>
        </div>

        {/* TABLE DES RÉSULTATS */}
        <div className="col-12 mt-4">
          <table className={`table table-bordered table-striped table-hover ${showTable ? '' : 'd-none'}`}>
            <thead className="table-dark">
              <tr>
                <th>Sigle</th>
                <th>Intitulé</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {resultats.length === 0 ? (
                <tr>
                  <td className="text-center text-danger">Aucun résultat trouvé</td>
                  <td></td>
                  <td className="text-center">
                    <button className="btn btn-primary" onClick={handleAjouterCours}>
                      Ajouter un cours
                    </button>
                  </td>
                </tr>
              ) : (
                resultats.map((cours, index) => (
                  <tr key={index}>
                    <td>{cours.sigle}</td>
                    <td dangerouslySetInnerHTML={{ __html: cours.intitule }} />
                    <td>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() =>
                          handleChoisir(
                            cours.sigle,
                            cours.intitule.replace(/\s\*\*$/, '').trim()
                          )
                        }
                      >
                        Sélectionner
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
