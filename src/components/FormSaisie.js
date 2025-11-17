// === IMPORTATIONS ===
import React, { useState } from 'react';
import SectionCours from './SectionCours';
import SectionSession from './SectionSession';
import SectionHistorique from './SectionHistorique';

// === COMPOSANT PRINCIPAL ===
function FormSaisie() {
  const [showSection2, setShowSection2] = useState(false);
  const [showSection3, setShowSection3] = useState(false);
  const [showSoumission, setShowSoumission] = useState(false);

  const [alerte, setAlerte] = useState(null);

  const [triggerSoumission, setTriggerSoumission] = useState(false);

  // === TRANSITIONS ===
  const handleAfterSearch = () => setShowSection2(true);

  const handleAfterValidation = () => {
    setShowSection2(false);
    setShowSection3(true);
    setShowSoumission(true);
  };

  const masquerSection2EtSuivantes = () => {
    setShowSection2(false);
    setShowSection3(false);
    setShowSoumission(false);
  };

  const masquerSection3EtSoumission = () => {
    setShowSection3(false);
    setShowSoumission(false);
  };

  const masquerSoumission = () => setShowSoumission(false);

  // === SOUMISSION ===
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

    } catch {
      setAlerte({ message: 'Erreur soumission.', type: 'danger' });
    }
  };

  const declencherSoumission = () => setTriggerSoumission(true);

  // === RENDU ===
  return (
    <div className="container mt-4">

      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">

          {/* Alerte globale */}
          {alerte && (
            <div className={`alert alert-${alerte.type} alert-dismissible fade show`} role="alert">
              {alerte.message}
              <button
                type="button"
                className="btn-close"
                onClick={() => setAlerte(null)}
              />
            </div>
          )}

          <form>

            {/* SECTION 1 */}
            <SectionCours
              onAfterSearch={handleAfterSearch}
              onReinitialiser={masquerSection2EtSuivantes}
            />

            {/* SECTION 2 */}
            <div className={showSection2 ? '' : 'd-none'}>
              <SectionSession
                onAfterValidation={handleAfterValidation}
                onReinitialiser={masquerSection3EtSoumission}
              />
            </div>

            {/* SECTION 3 */}
            <div className={showSection3 ? '' : 'd-none'}>
              <SectionHistorique
                onSoumettre={handleSoumettre}
                onReinitialiser={masquerSoumission}
                triggerSoumission={triggerSoumission}
                setTriggerSoumission={setTriggerSoumission}
              />
            </div>

            {/* BOUTON FINAL */}
            <div className={`text-center mb-5 ${showSoumission ? '' : 'd-none'}`}>
              <button
                type="button"
                className="btn btn-success btn-lg w-50"
                id="soumissionFinale"
                onClick={declencherSoumission}
              >
                Soumission finale
              </button>
            </div>

          </form>

        </div>
      </div>

    </div>
  );
}

export default FormSaisie;
