// === Page d'édition d'une inscription ===

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getInscriptionById, updateInscription } from "../services/api";
import Breadcrumb from "./Breadcrumb";
import UserProfile from "./UserProfile";

// Fonction de comparaison profonde
function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== "object" || typeof b !== "object") return false;

  const keysA = Array.isArray(a) ? null : Object.keys(a);
  const keysB = Array.isArray(b) ? null : Object.keys(b);

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (keysA && keysB && keysA.length !== keysB.length) return false;

  if (keysA) {
    for (let key of keysA) {
      if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
    }
  }

  return true;
}

const EditInscription = () => {
  const [loading, setLoading] = useState(true);
  const [alerte, setAlerte] = useState(null);
  const [inscription, setInscription] = useState(null);

  const [evaluations, setEvaluations] = useState([]);
  const [noteRattrapage, setNoteRattrapage] = useState("");
  const [moyenneFinale, setMoyenneFinale] = useState("");
  const [sanction, setSanction] = useState("");
  const [appreciation, setAppreciation] = useState("");

  const [isModified, setIsModified] = useState(false);
  const [originalState, setOriginalState] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  const ajouterEvaluation = () => {
    setEvaluations((prev) => [
      ...prev,
      { id: Date.now(), intitule: "", pourcentage: "", note: "" },
    ]);
  };

  const supprimerEvaluation = (evalId) => {
    setEvaluations((prev) => prev.filter((e) => e.id !== evalId));
  };

  const modifierEvaluation = (evalId, field, value) => {
    if (field === "note") {
      const numValue = parseFloat(value);
      if (value === "" || (numValue >= 0 && numValue <= 20)) {
        setEvaluations((prev) =>
          prev.map((e) => (e.id === evalId ? { ...e, [field]: value } : e)),
        );
      }
    } else {
      setEvaluations((prev) =>
        prev.map((e) => (e.id === evalId ? { ...e, [field]: value } : e)),
      );
    }
  };

  const totalPourcentages = evaluations.reduce(
    (total, e) => total + (parseFloat(e.pourcentage) || 0),
    0,
  );

  const handleNoteRattrapageChange = (value) => {
    setNoteRattrapage(value);
  };

  const handleMoyenneFinaleChange = (value) => {
    setMoyenneFinale(value);
  };

  const handleSanctionChange = (value) => {
    setSanction(value);
  };

  const handleAppreciationChange = (value) => {
    setAppreciation(value);
  };

  // === FERME L'ALERTE AUTOMATIQUEMENT ===
  useEffect(() => {
    if (alerte) {
      const timer = setTimeout(() => {
        if (alerte.redirect) {
          navigate("/search-modify");
        }
        setAlerte(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alerte, navigate]);

  // === CHARGER L'INSCRIPTION AU MONTAGE ===
  useEffect(() => {
    const charger = async () => {
      if (!id) {
        setAlerte({ type: "danger", message: "ID manquant." });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getInscriptionById(id);
        setInscription(data);

        // === PRÉ-REMPLIR LES ÉTATS EN PARSANT LES DONNÉES ===
        const notes = data.notes || "";
        let evals = [];
        if (notes) {
          const items = notes.split(";");
          evals = items
            .map((item, idx) => {
              const match = item.match(/^(.+?)\((\d+)%\):(.+)$/);
              if (match) {
                return {
                  id: Date.now() + idx,
                  intitule: match[1].trim(),
                  pourcentage: match[2],
                  note: match[3],
                };
              }
              return null;
            })
            .filter(Boolean);
        }
        setEvaluations(evals);

        setNoteRattrapage(
          data.noteRattrapage != null ? String(data.noteRattrapage) : "",
        );
        setMoyenneFinale(
          data.moyenneFinale != null ? String(data.moyenneFinale) : "",
        );
        setSanction(data.sanction || "");
        setAppreciation(data.appreciations || "");

        setOriginalState({
          evaluations: evals,
          noteRattrapage:
            data.noteRattrapage != null ? String(data.noteRattrapage) : "",
          moyenneFinale:
            data.moyenneFinale != null ? String(data.moyenneFinale) : "",
          sanction: data.sanction || "",
          appreciation: data.appreciations || "",
        });
      } catch (error) {
        setAlerte({ type: "danger", message: error.message });
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, [id]);

  // === SOUMETTRE LA MODIFICATION ===
  const handleValider = async () => {
    if (evaluations.length > 0 && totalPourcentages !== 100) {
      setAlerte({
        type: "danger",
        message: "Le total des pourcentages doit faire 100%.",
      });
      return;
    }
    if (
      !moyenneFinale ||
      isNaN(parseFloat(moyenneFinale)) ||
      parseFloat(moyenneFinale) < 0 ||
      parseFloat(moyenneFinale) > 20
    ) {
      setAlerte({ type: "danger", message: "Moyenne finale invalide (0-20)." });
      return;
    }
    if (!sanction) {
      setAlerte({ type: "danger", message: "Sélectionnez une sanction." });
      return;
    }

    try {
      // Reconstruire le champ "notes"
      const notesTexte = evaluations
        .filter((e) => e.intitule && e.pourcentage && e.note)
        .map((e) => `${e.intitule}(${e.pourcentage}%):${e.note}`)
        .join(";");

      const dataToUpdate = {
        id,
        notes: notesTexte,
        noteRattrapage: noteRattrapage === "" ? null : noteRattrapage,
        moyenneFinale,
        sanction,
        appreciations: appreciation,
      };

      await updateInscription(dataToUpdate);
      setAlerte({
        type: "success",
        message: "Soumission réussie ! L'inscription a été mise à jour.",
        redirect: true,
      });
      // navigate('/search-modify'); // Redirige vers la recherche
    } catch (error) {
      setAlerte({ type: "danger", message: error.message });
    }
  };

  // Vérifier si l'état a réellement changé par rapport à l'original
  useEffect(() => {
    if (!originalState) {
      setIsModified(false);
      return;
    }

    const currentState = {
      evaluations,
      noteRattrapage,
      moyenneFinale,
      sanction,
      appreciation,
    };

    setIsModified(!deepEqual(currentState, originalState));
  }, [
    evaluations,
    noteRattrapage,
    moyenneFinale,
    sanction,
    appreciation,
    originalState,
  ]);

  // === DÉCONNEXION ===
  const handleLogout = () => {
    alert("Déconnexion");
  };

  // === AFFICHAGE EN CHARGEMENT ===
  if (loading) {
    return (
      <div className="container-fluid p-0">
        <Breadcrumb
          customPath={{
            path: "/edit-inscription",
            label: "Édition inscription",
          }}
          parentPaths={[
            "/search-modify",
            "/edit-session",
            "/session-inscriptions",
          ]}
        />
        <header
          className="top-bar bg-light-yellow"
          style={{
            padding: "15px 30px",
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "2px solid black",
          }}
        >
          <h2 className="mb-0">Édition inscription</h2>
          <button onClick={handleLogout} className="logout-btn-top">
            [→] Déconnexion
          </button>
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
        customPath={{ path: "/edit-inscription", label: "Édition inscription" }}
        parentPaths={[
          "/search-modify",
          "/edit-session",
          "/session-inscriptions",
        ]}
      />

      {/* === HEADER === */}
      <header
        className="top-bar bg-light-yellow"
        style={{
          padding: "15px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid black",
        }}
      >
        <h2 className="mb-0">Édition inscription</h2>
        <div className="top-bar-right">
          <button onClick={handleLogout} className="logout-btn-top">
            [→] Déconnexion
          </button>

          <UserProfile />
        </div>
      </header>

      {/* === CONTENU PRINCIPAL === */}
      <main className="container mt-4" style={{ maxWidth: "70%" }}>
        {/* === ALERTES === */}
        {alerte && (
          <div
            className={`alert alert-${alerte.type} alert-dismissible fade show`}
            style={{ width: "100%", textAlign: "center" }}
          >
            {alerte.message}
            <button
              type="button"
              className="btn-close"
              onClick={() => setAlerte(null)}
            />
          </div>
        )}

        {/* === SECTION 1 : INFOS COURS/SESSION (READONLY) === */}
        <div className="form-section">
          <h4 className="mb-3">Informations du cours et de la session</h4>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label>Intitulé du cours</label>
              <input
                className="form-control"
                value={inscription?.intituleCours || ""}
                disabled
              />
            </div>
            <div className="col-md-4 mb-3">
              <label>Année académique</label>
              <input
                className="form-control"
                value={inscription?.anneeAcademique || ""}
                disabled
              />
            </div>
            <div className="col-md-4 mb-3">
              <label>Semestre</label>
              <input
                className="form-control"
                value={inscription?.semestre || ""}
                disabled
              />
            </div>
            <div className="col-md-4 mb-3">
              <label>Code programme</label>
              <input
                className="form-control"
                value={inscription?.codeProgramme || ""}
                disabled
              />
            </div>
          </div>
        </div>

        <hr
          style={{
            border: "none",
            height: "1px",
            backgroundColor: "#000",
            margin: "24px 0",
          }}
        />

        {/* === SECTION 2 : SectionHistorique remasterisé === */}
        <div className="form-section">
          <h4 className="mb-3">Informations étudiant et résultats</h4>

          {/* Infos étudiant (readonly) */}
          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <label>Matricule</label>
              <input
                className="form-control"
                value={inscription?.matricule || ""}
                readOnly
              />
            </div>
            <div className="col-md-4 mb-3">
              <label>Nom</label>
              <input
                className="form-control"
                value={inscription?.nom || ""}
                readOnly
              />
            </div>
            <div className="col-md-4 mb-3">
              <label>Prénoms</label>
              <input
                className="form-control"
                value={inscription?.prenoms || ""}
                readOnly
              />
            </div>
          </div>

          {/* Évaluations */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6>Évaluations</h6>
              <div>Total des pourcentages : {totalPourcentages}%</div>
              <button
                className="btn btn-dark btn-sm"
                onClick={ajouterEvaluation}
              >
                Ajouter évaluation
              </button>
            </div>
            {evaluations.map((e, idx) => (
              <div key={e.id} className="card card-body mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6>Évaluation n°{idx + 1}</h6>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => supprimerEvaluation(e.id)}
                  >
                    ×
                  </button>
                </div>
                <div className="row g-3">
                  <div className="col-md-5">
                    <input
                      type="text"
                      placeholder="Ex: Devoir 1..."
                      className="form-control"
                      value={e.intitule}
                      onChange={(ev) =>
                        modifierEvaluation(e.id, "intitule", ev.target.value)
                      }
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
                      onChange={(ev) =>
                        modifierEvaluation(e.id, "pourcentage", ev.target.value)
                      }
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
                      onChange={(ev) =>
                        modifierEvaluation(e.id, "note", ev.target.value)
                      }
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
                  onChange={(e) => handleNoteRattrapageChange(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                Moyenne finale <span style={{ color: "red" }}>*</span>
                <input
                  type="number"
                  placeholder="Moyenne"
                  className="form-control"
                  value={moyenneFinale}
                  onChange={(e) => handleMoyenneFinaleChange(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                Sanction <span style={{ color: "red" }}>*</span>
                <select
                  className="form-select"
                  value={sanction}
                  onChange={(e) => handleSanctionChange(e.target.value)}
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
              onChange={(e) => handleAppreciationChange(e.target.value)}
            />
          </div>
        </div>

        {/* === BOUTONS === */}
        <div className="d-flex justify-content-between mt-4">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Annuler
          </button>
          <button
            className="btn btn-primary"
            onClick={handleValider}
            disabled={!isModified}
            style={{
              opacity: isModified ? 1 : 0.5,
              cursor: isModified ? "pointer" : "not-allowed",
            }}
          >
            Soumettre la modification
          </button>
        </div>

        {/* === ALERTE FLOTTANTE === */}
        {alerte && (
          <div
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              zIndex: 1050,
              minWidth: "250px",
            }}
            className={`alert alert-${alerte.type} alert-dismissible fade show`}
          >
            {alerte.message}
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                if (alerte && alerte.redirect) navigate("/search-modify");
                setAlerte(null);
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default EditInscription;
