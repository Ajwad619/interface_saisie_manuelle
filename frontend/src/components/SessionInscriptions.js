// === Page des inscriptions d'une session ===
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { deleteInscription, getInscriptionsSession } from "../services/api";
import Breadcrumb from "./Breadcrumb";
import UserProfile from "./UserProfile";

const SessionInscriptions = () => {
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerte, setAlerte] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { session } = location.state || {};

  useEffect(() => {
    const charger = async () => {
      if (!session) {
        setAlerte({
          type: "danger",
          message: "Données de session manquantes.",
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getInscriptionsSession({
          intituleCours: session.intituleCours,
          anneeAcademique: session.anneeAcademique,
          semestre: session.semestre,
          codeProgramme: session.codeProgramme,
        });
        setInscriptions(data);
      } catch (error) {
        setAlerte({ type: "danger", message: error.message });
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, [session]);

  const handleLogout = () => {
    alert("Déconnexion");
  };

  const handleDelete = async (id, matricule) => {
    if (
      !window.confirm(
        `Supprimer l'inscription de ${matricule || "cet étudiant"} ?`,
      )
    )
      return;
    try {
      await deleteInscription(id);
      const data = await getInscriptionsSession({
        intituleCours: session.intituleCours,
        anneeAcademique: session.anneeAcademique,
        semestre: session.semestre,
        codeProgramme: session.codeProgramme,
      });
      setInscriptions(data);
      setAlerte({ type: "success", message: "Inscription supprimée." });
      setTimeout(() => setAlerte(null), 2000);
    } catch (error) {
      setAlerte({ type: "danger", message: error.message });
    }
  };

  if (loading && !alerte) {
    return (
      <div className="container-fluid p-0">
        <Breadcrumb
          customPath={{
            path: "/session-inscriptions",
            label: "Inscriptions de la session",
          }}
          parentPaths={["/search-modify", "/edit-session"]}
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
          <h2 className="mb-0">Inscriptions de la session</h2>
          <div className="top-bar-right">
            <button onClick={handleLogout} className="logout-btn-top">
              [→] Déconnexion
            </button>

            <UserProfile />
          </div>
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
      <Breadcrumb
        customPath={{
          path: "/session-inscriptions",
          label: "Inscriptions de la session",
        }}
        parentPaths={["/search-modify", "/edit-session"]}
      />

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
        <h2 className="mb-0">Inscriptions de la session</h2>
        <div className="top-bar-right">
          <button onClick={handleLogout} className="logout-btn-top">
            [→] Déconnexion
          </button>

          <UserProfile />
        </div>
      </header>

      <main className="container mt-4" style={{ maxWidth: "80%" }}>
        <h1
          className="text-center mb-3"
          style={{ fontSize: "24px", fontWeight: "bold", color: "#343a40" }}
        >
          • {session?.intituleCours} • {session?.anneeAcademique} • Semestre{" "}
          {session?.semestre} • {session?.codeProgramme}
        </h1>

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

        {inscriptions.length === 0 && !loading ? (
          <div className="alert alert-info text-center">
            Aucune inscription trouvée pour cette session.
          </div>
        ) : (
          <div className="table-responsive">
            <table
              className="table table-bordered"
              style={{ border: "2px solid black", backgroundColor: "white" }}
            >
              <thead className="bg-dark text-white">
                <tr>
                  <th>Matricule</th>
                  <th>Nom</th>
                  <th>Prénoms</th>
                  <th>Moyenne</th>
                  <th>Sanction</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inscriptions.map((insc) => (
                  <tr key={insc.id} style={{ border: "1px solid black" }}>
                    <td>{insc.matricule || "—"}</td>
                    <td>{insc.nom || "—"}</td>
                    <td>{insc.prenoms || "—"}</td>
                    <td>
                      {insc.moyenneFinale != null ? insc.moyenneFinale : "—"}
                    </td>
                    <td>{insc.sanction || "—"}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() =>
                          navigate(`/edit-inscription?id=${insc.id}`)
                        }
                      >
                        Choisir
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(insc.id, insc.matricule)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-end mt-3">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Retour aux détails
          </button>
        </div>
      </main>
    </div>
  );
};

export default SessionInscriptions;
