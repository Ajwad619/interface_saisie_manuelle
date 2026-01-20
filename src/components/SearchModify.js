// === Page de recherche d'une session ou d'une inscription ===

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Breadcrumb from './Breadcrumb'; 
import debounce from 'lodash.debounce';
import { rechercherDonnees, getAnneesAcademiques, getCodesProgramme, deleteInscription } from '../services/api'; 
import UserProfile from './UserProfile';

function SearchModify() {
  // === HOOKS DE NAVIGATION ET AUTH ===
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // === GESTION DE LA DÉCONNEXION ===
  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
      navigate('/');
    }
  };

  // === ÉTAT DE BASE POUR LA RECHERCHE ===
  const [searchCriteria, setSearchCriteria] = useState({
    // Section 1 : Informations Session de Cours
    sigleCours: '',
    intituleCours: '',
    anneeAcademique: '',
    semestre: 'Tous les semestres', 
    codeProgramme: '',
    creditCours: '',
    idEnseignant: '',
    
    // Section 2 : Informations Étudiant
    matricule: '',
    nom: '',
    prenoms: ''
  });

  // === ÉTAT DES RÉSULTATS ===
  const [searchResults, setSearchResults] = useState([]); 
  const [searchType, setSearchType] = useState('');        // 'sessions' ou 'inscriptions'
  const [loading, setLoading] = useState(false);            

  // == ETATS POUR LES OPTIONS DYNAMIQUES ==
  const [anneesAcademiques, setAnneesAcademiques] = useState([]); // ← nouvelles années
  const [codesProgramme, setCodesProgramme] = useState([]);      // ← nouveaux codes
  const [loadingOptions, setLoadingOptions] = useState(true);    // ← chargement initial
  const [alerte, setAlerte] = useState(null);

  // === FONCTION DE RECHERCHE DÉBOUNCÉE (pause de 0.3s) ===
  const debouncedSearch = React.useRef(
    debounce(async (criteria) => {
      // Vérifier si au moins un champ est rempli
      const hasAnyField = Object.values(criteria).some(
        value => value !== '' && value !== 'Tous les semestres'
      );
  
      if (!hasAnyField) {
        setSearchResults([]);
        setSearchType('');
        return;
      }
  
      // Déterminer le type de recherche
      const hasStudentInfo = 
        criteria.matricule.trim() !== '' || 
        criteria.nom.trim() !== '' || 
        criteria.prenoms.trim() !== '';
      
      const type = hasStudentInfo ? 'inscriptions' : 'sessions';
      setSearchType(type);
      setLoading(true);
  
      try {
        // Appeler l'API
        const response = await rechercherDonnees(criteria, type);
      
        if (response.success) {
          setSearchResults(response.results || []);
        } else {
          setSearchResults([]);
          console.error('Erreur recherche:', response.message);
        }
      } catch (error) {
        console.error('Erreur réseau:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300)
  ).current;

  // === GESTION DES CHANGEMENTS DANS LE FORMULAIRE ===
  const handleInputChange = (field, value) => {
    setSearchCriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // === EFFET DE RECHERCHE AUTOMATIQUE ===
  useEffect(() => {
    debouncedSearch(searchCriteria);
    
    // Nettoyage du debounce à la destruction du composant
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchCriteria, debouncedSearch]);

  // === CHARGER LES OPTIONS AU CHARGEMENT DE LA PAGE ===
  const chargerOptions = async () => {
  try {
      // Récupérer les années académiques
      const anneesData = await getAnneesAcademiques();
      const codesData = await getCodesProgramme();

      console.log("Données reçues (années):", anneesData);
      console.log("Données reçues (codes):", codesData);
      
      if (anneesData.success) {
        setAnneesAcademiques(anneesData.annees || []);
      } else {
        console.error('Erreur chargement années:', anneesData.message);
      }
      
      if (codesData.success) {
        setCodesProgramme(codesData.codes || []);
      } else {
        console.error('Erreur chargement codes:', codesData.message);
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    chargerOptions();
  }, []);

  // Si une alerte est passée via navigate state, l'afficher puis la retirer
  useEffect(() => {
    if (location.state && location.state.alerte) {
      setAlerte(location.state.alerte);
      // Effacer le state de navigation pour ne pas ré-afficher l'alerte au retour
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (alerte) {
      const t = setTimeout(() => setAlerte(null), 3500);
      return () => clearTimeout(t);
    }
  }, [alerte]);

  // === GESTION DU CLIQUE SUR "CHOISIR" ===
  const handleChoisirSession = (session) => {
    console.log("Session choisie :", session);
    navigate('/edit-session', { state: { session } });
  };
  
  const handleChoisirInscription = (inscription) => {
    console.log("Inscription choisie :", inscription);
    navigate(`/edit-inscription?id=${inscription.id}`);
  };

  // === GESTION DE LA SUPPRESSION D'UNE INSCRIPTION ===
  const handleSupprimerInscription = async (id, matricule) => {
    if (!window.confirm(`Supprimer l'inscription de ${matricule} ?`)) return;
    
    try {
      await deleteInscription(id); // ← Tu dois importer deleteInscription
      // Recharger la recherche
      debouncedSearch(searchCriteria);
    } catch (error) {
      alert('Erreur : ' + error.message);
    }
  };
  
  // === RENDU DE LA PAGE ===
  return (
    <div style={{
      backgroundColor: '#F5F5F5', 
      minHeight: '100vh',        
      padding: 0,
      margin: 0
    }}>
      
      {/* === BREADCRUMB === */}
      <Breadcrumb />

      {/* === BARRE DE NAVIGATION === */}
      <header className="top-bar">
        <h2>Rechercher et Modifier</h2>
        <div className="top-bar-right">
          <button
            onClick={handleLogout}
            className="logout-btn-top"
          >
            [→] Déconnexion
          </button>

          <UserProfile />
        </div>
      </header>

      {/* === CONTENU PRINCIPAL === */}
        <main style={{
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>

        {/* Alerte reçue via navigation */}
        {alerte && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1050,
            minWidth: '250px'
          }} className={`alert alert-${alerte.type} alert-dismissible fade show`} role="alert">
            {alerte.message}
            <button type="button" className="btn-close" onClick={() => setAlerte(null)} />
          </div>
        )}
        
        {loadingOptions ? (
          <div className="text-center my-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement des options...</span>
            </div>
          </div>
        ) : (
          <>
        
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '30px',
          color: '#343a40'
        }}>
          Informations de recherche
        </h1>


        {/* === FORMULAIRE DE RECHERCHE === */}
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto' 
        }}>
        
          {/* SECTION 1 : Informations Session de Cours */}
          <div className="search-section">
            <h3>Informations Session de Cours</h3>
                <div className="search-form-grid">

                  {/* Sigle du cours */}
                  <div>
                    <label className="search-form-label">Sigle du cours</label>
                    <input
                      type="text"
                      className="form-control"
                      value={searchCriteria.sigleCours}
                      onChange={(e) => handleInputChange('sigleCours', e.target.value)}
                      placeholder="Ex: 2ANG2128"
                    />
                  </div>
                  
                  {/* Intitulé du cours */}
                  <div>
                    <label className="search-form-label">Intitulé du cours</label>
                    <input
                      type="text"
                      className="form-control"
                      value={searchCriteria.intituleCours}
                      onChange={(e) => handleInputChange('intituleCours', e.target.value)}
                      placeholder="Ex: Anglais Expression Orale"
                    />
                  </div>
                </div>
            
            <div className="search-form-grid grid-2">
                
                {/* Année académique */}
                <div>
                  <label className="search-form-label">Année académique</label>
                  <select
                    className="form-control"
                    value={searchCriteria.anneeAcademique}
                    onChange={(e) => handleInputChange('anneeAcademique', e.target.value)}
                  >
                    <option value="">-- Sélectionner --</option>
                    {anneesAcademiques.map(annee => (
                      <option key={annee} value={annee}>{annee}</option>
                    ))}
                  </select>
                </div>
                  
                {/* Semestre */}
                <div>
                  <label className="search-form-label">Semestre</label>
                  <select
                    className="form-control"
                    value={searchCriteria.semestre}
                    onChange={(e) => handleInputChange('semestre', e.target.value)}
                  >
                    <option>Tous les semestres</option>
                    <option>Semestre 1</option>
                    <option>Semestre 2</option>
                    <option>Semestre 3</option>
                    <option>Semestre 4</option>
                    <option>Semestre 5</option>
                    <option>Semestre 6</option>
                    <option>Semestre 7</option>
                  </select>
                </div>
                  
                {/* Crédit du cours */}
                <div>
                  <label className="search-form-label">Crédit du cours</label>
                  <input
                    type="number"
                    className="form-control"
                    value={searchCriteria.creditCours}
                    onChange={(e) => handleInputChange('creditCours', e.target.value)}
                    min="1"
                    max="15"
                    placeholder="Ex: 2"
                  />
                </div>
                  
                {/* Code Programme */}
                <div>
                  <label className="search-form-label">Code Programme</label>
                  <select
                    className="form-control"
                    value={searchCriteria.codeProgramme}
                    onChange={(e) => handleInputChange('codeProgramme', e.target.value)}
                  >
                    <option value="">-- Sélectionner --</option>
                    {codesProgramme.map(code => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                </div>
                  
                {/* Identifiant de l'enseignant */}
                <div>
                  <label className="search-form-label">Identifiant de l'enseignant</label>
                  <input
                    type="text"
                    className="form-control"
                    value={searchCriteria.idEnseignant}
                    onChange={(e) => handleInputChange('idEnseignant', e.target.value)}
                    placeholder="Ex: ENG001"
                  />
                </div>
            </div>
          </div>
                
          {/* SECTION 2 : Informations Étudiant */}
          <div className="search-section">
            <h3>Informations Étudiant (optionnel)</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
              Laisser vides ces champs pour ne voir que les sessions de cours. Les remplir pour voir des inscriptions précises d'étudiants.
            </p>
                
            <div className="search-form-grid">
              {/* Matricule */}
              <div>
                <label className="search-form-label">Matricule</label>
                <input
                  type="text"
                  className="form-control"
                  value={searchCriteria.matricule}
                  onChange={(e) => handleInputChange('matricule', e.target.value)}
                  placeholder="Ex: UAC2025001"
                />
              </div>
                
              {/* Nom */}
              <div>
                <label className="search-form-label">Nom</label>
                <input
                  type="text"
                  className="form-control"
                  value={searchCriteria.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  placeholder="Nom de famille"
                />
              </div>
                
              {/* Prénoms */}
              <div>
                <label className="search-form-label">Prénoms</label>
                <input
                  type="text"
                  className="form-control"
                  value={searchCriteria.prenoms}
                  onChange={(e) => handleInputChange('prenoms', e.target.value)}
                  placeholder="Prénoms de l'étudiant"
                />
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center mt-4">
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              Revenir à l'accueil
            </button>
          </div>


        <hr style={{ border: 'none', height: '1px', backgroundColor: '#000', margin: '24px 0' }} />
        </div>


        {/* === RÉSULTATS === */}
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '20px auto 0'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '30px',
            color: '#343a40'
          }}>
           Résultats de la recherche
          </h1>
          {loading && (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p>Recherche en cours...</p>
            </div>
          )}
          {!loading && searchResults.length === 0 && (
            <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              {Object.values(searchCriteria).some(v => v && v !== 'Tous les semestres')
                ? "Aucun résultat trouvé pour votre recherche"
                : "Remplissez au moins un champ pour lancer la recherche"
              }
            </div>
          )}

          {/* === COMPTER LES RÉSULTATS === */}
          {!loading && searchResults.length > 0 && (
            <div style={{
              textAlign: 'center',
              color: '#666', // gris comme "Aucun résultat"
              fontSize: '14px',
              marginBottom: '10px'
            }}>
              {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
            </div>
          )}

          {!loading && searchResults.length > 0 && (
            <div>
              {searchType === 'sessions' ? (
                <table className="table table-striped" style={{ width: '115%', margin: '0 -7.5%' }}>
                  <thead>
                    <tr>
                      <th>Sigle</th>
                      <th>Intitulé</th>
                      <th>Année</th>
                      <th>Semestre</th>
                      <th>Code Prog</th>
                      <th>Crédit</th>
                      <th>Enseignant</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((session, index) => (
                      <tr key={index}>
                        <td>{session.sigleCours}</td>
                        <td>{session.intituleCours}</td>
                        <td>{session.anneeAcademique}</td>
                        <td>{session.semestre}</td>
                        <td>{session.codeProgramme}</td>
                        <td>{session.creditCours}</td>
                        <td>{session.idEnseignant}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleChoisirSession(session)}
                          >
                            Choisir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="table table-striped" style={{ width: '115%', margin: '0 -7.5%' }}>
                  <thead>
                    <tr>
                      <th>Matricule</th>
                      <th>Nom</th>
                      <th>Prénoms</th>
                      <th>Cours</th>
                      <th>Année</th>
                      <th>Semestre</th>
                      <th>Code Prog</th>
                      <th>Moyenne</th>
                      <th>Sanction</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((inscription, index) => (
                      <tr key={index}>
                        <td>{inscription.matricule}</td>
                        <td>{inscription.nom}</td>
                        <td>{inscription.prenoms}</td>
                        <td>{inscription.intituleCours}</td>
                        <td>{inscription.anneeAcademique}</td>
                        <td>{inscription.semestre}</td>
                        <td>{inscription.codeProgramme}</td>
                        <td>{inscription.moyenneFinale}</td>
                        <td>{inscription.sanction}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => handleChoisirInscription(inscription)}
                          >
                            Choisir
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleSupprimerInscription(inscription.id, inscription.matricule)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
        </>
        )}
      </main>
    </div>
  );
}

export default SearchModify;