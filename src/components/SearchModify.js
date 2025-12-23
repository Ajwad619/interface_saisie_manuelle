// === PAGE DE RECHERCHE ET MODIFICATION ===

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Breadcrumb from './Breadcrumb'; 

function SearchModify() {
  // === HOOKS DE NAVIGATION ET AUTH ===
  const navigate = useNavigate();
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
  const [searchResults, setSearchResults] = useState([]); // résultats de la recherche
  const [searchType, setSearchType] = useState('');        // 'sessions' ou 'inscriptions'
  const [loading, setLoading] = useState(false);            // indicateur de chargement

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
        <button
          onClick={handleLogout}
          className="logout-btn-top"
        >
          [→] Déconnexion
        </button>
      </header>

      {/* === CONTENU PRINCIPAL === */}
      <main style={{
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '30px',
          color: '#343a40'
        }}>
          Rechercher et Modifier les données
        </h1>
        {/* === FORMULAIRE DE RECHERCHE === */}
        <div style={{
          width: '100%',
          maxWidth: '1200px'
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
                      onChange={(e) => setSearchCriteria({
                        ...searchCriteria,
                        sigleCours: e.target.value
                      })}
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
                      onChange={(e) => setSearchCriteria({
                        ...searchCriteria,
                        intituleCours: e.target.value
                      })}
                      placeholder="Ex: Anglais Expression Orale"
                    />
                  </div>
                </div>
            
            <div className="search-form-grid grid-2">
                
                {/* Année académique */}
                <div>
                  <label className="search-form-label">Année académique</label>
                  <input
                    type="text"
                    className="form-control"
                    value={searchCriteria.anneeAcademique}
                    onChange={(e) => setSearchCriteria({
                      ...searchCriteria,
                      anneeAcademique: e.target.value
                    })}
                    placeholder="Ex: 21-22"
                  />
                </div>
                  
                {/* Semestre */}
                <div>
                  <label className="search-form-label">Semestre</label>
                  <select
                    className="form-control"
                    value={searchCriteria.semestre}
                    onChange={(e) => setSearchCriteria({
                      ...searchCriteria,
                      semestre: e.target.value
                    })}
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
                    onChange={(e) => setSearchCriteria({
                      ...searchCriteria,
                      creditCours: e.target.value
                    })}
                    min="1"
                    max="10"
                    placeholder="Ex: 2"
                  />
                </div>
                  
                {/* Code Programme */}
                <div>
                  <label className="search-form-label">Code Programme</label>
                  <input
                    type="text"
                    className="form-control"
                    value={searchCriteria.codeProgramme}
                    onChange={(e) => setSearchCriteria({
                      ...searchCriteria,
                      codeProgramme: e.target.value
                    })}
                    placeholder="Ex: DOC-TIC"
                  />
                </div>
                  
                {/* Identifiant de l'enseignant */}
                <div>
                  <label className="search-form-label">Identifiant de l'enseignant</label>
                  <input
                    type="text"
                    className="form-control"
                    value={searchCriteria.idEnseignant}
                    onChange={(e) => setSearchCriteria({
                      ...searchCriteria,
                      idEnseignant: e.target.value
                    })}
                    placeholder="Ex: ENG001"
                  />
                </div>
            </div>
          </div>
                
          {/* SECTION 2 : Informations Étudiant */}
          <div className="search-section">
            <h3>Informations Étudiant</h3>
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
                  onChange={(e) => setSearchCriteria({
                    ...searchCriteria,
                    matricule: e.target.value
                  })}
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
                  onChange={(e) => setSearchCriteria({
                    ...searchCriteria,
                    nom: e.target.value
                  })}
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
                  onChange={(e) => setSearchCriteria({
                    ...searchCriteria,
                    prenoms: e.target.value
                  })}
                  placeholder="Prénoms de l'étudiant"
                />
              </div>
            </div>
          </div>
        </div>

        {/* === RÉSULTATS === */}
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          marginTop: '20px'
        }}>
          <p>Résultats (à venir)</p>
        </div>
      </main>
    </div>
  );
}

export default SearchModify;