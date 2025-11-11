// === IMPORTATIONS ===
import React, { useState } from 'react'; // Ajout de useState
import SectionCours from './SectionCours';
import SectionSession from './SectionSession';
import SectionHistorique from './SectionHistorique';

// === COMPOSANT PRINCIPAL ===
function FormSaisie() {
  // === ÉTATS GLOBAUX POUR AFFICHER/MASQUER LES SECTIONS ===
  const [showSection2, setShowSection2] = useState(false);
  const [showSection3, setShowSection3] = useState(false);
  const [showSoumission, setShowSoumission] = useState(false); // Pour le bouton soumettre

  // AJOUT : État pour alerte globale, inspiré de index.php (alert-container)
  const [alerte, setAlerte] = useState(null);

  // AJOUT : État pour déclencher la soumission dans SectionHistorique
  const [triggerSoumission, setTriggerSoumission] = useState(false);

  // === FONCTIONS POUR LES TRANSITIONS ===
  // Après recherche réussie dans SectionCours
  const handleAfterSearch = () => {
    setShowSection2(true); // Affiche section2
  };

  // Après validation dans SectionSession
  const handleAfterValidation = () => {
    setShowSection2(false); // Masque section2
    setShowSection3(true); // Affiche section3
    setShowSoumission(true); // Affiche soumission
  };

  // AJOUT : Fonctions pour masquer les sections suivantes lors des réinitialisations
  const masquerSection2EtSuivantes = () => {
    setShowSection2(false);
    setShowSection3(false);
    setShowSoumission(false);
  };

  const masquerSection3EtSoumission = () => {
    setShowSection3(false);
    setShowSoumission(false);
  };

  const masquerSoumission = () => {
    setShowSoumission(false);
  };

  // Fonction pour soumettre le formulaire (appelée depuis SectionHistorique via onSoumettre)
  const handleSoumettre = async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => formData.append(key, data[key]));
      const response = await fetch('traitement_inscription.php', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (result.success) {
        setAlerte({ message: result.message, type: 'success' });
      } else {
        setAlerte({ message: result.message, type: 'danger' });
      }
    } catch (error) {
      setAlerte({ message: 'Erreur soumission.', type: 'danger' });
    }
  };

  // AJOUT : Fonction pour déclencher la soumission via l'état partagé
  const declencherSoumission = () => {
    setTriggerSoumission(true); // Déclenche handleSoumettre dans SectionHistorique
  };

  // === RENDU ===
  return (
    <div>
      {/* Conteneur alerte globale */}
      {alerte && (
        <div className={`alert alert-${alerte.type} alert-dismissible fade show`} role="alert">
          {alerte.message}
          <button type="button" className="btn-close" onClick={() => setAlerte(null)} />
        </div>
      )}

      <form>
        {/* Section 1 : Passe onReinitialiser pour masquer les suivantes */}
        <SectionCours onAfterSearch={handleAfterSearch} onReinitialiser={masquerSection2EtSuivantes} />

        {/* Section 2 : Passe onReinitialiser pour masquer les suivantes */}
        <div className={showSection2 ? '' : 'd-none'}>
          <SectionSession onAfterValidation={handleAfterValidation} onReinitialiser={masquerSection3EtSoumission} />
        </div>

        {/* Section 3 : Passe onReinitialiser pour masquer Soumission, et triggerSoumission pour déclencher la soumission */}
        <div className={showSection3 ? '' : 'd-none'}>
          <SectionHistorique onSoumettre={handleSoumettre} onReinitialiser={masquerSoumission} triggerSoumission={triggerSoumission} setTriggerSoumission={setTriggerSoumission} />
        </div>

        {/* Bouton soumettre : Déclenche la soumission via l'état partagé */}
        <div className={`text-center mb-5 ${showSoumission ? '' : 'd-none'}`}>
          <button type="button" className="btn btn-success btn-lg w-50" id="soumissionFinale" onClick={declencherSoumission}>
            Soumission finale
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormSaisie;