<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Insertion sessions de cours</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
    <link href="public/css/style.css" rel="stylesheet">
</head>
<div id="alert-container" style="position: fixed; bottom: 20px; right: 20px; z-index: 1050; max-width: 400px;">
</div>

<body>
    <?php
    // index.php (ou le fichier principal de ta page)
    
    $programmes = [];
    $jsonFile = 'data/programmes.json';

    if (file_exists($jsonFile)) {
        $jsonData = file_get_contents($jsonFile);
        $programmes = json_decode($jsonData, true);
    }
    ?>
    <div id="login-section" class="col-md-4 offset-md-4">
        <div class="card p-4 shadow-sm">
            <h4 class="text-center mb-4">Authentification</h4>
            <form id="loginForm">
                <div class="mb-3">
                    <label for="login" class="form-label">Login</label>
                    <input type="text" name="login" id="login" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Mot de passe</label>
                    <input type="password" name="password" id="password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary w-100">Se connecter</button>
            </form>
        </div>
    </div>
    <div id="main-form-section" class="d-none">

        <div class="container">

            <h1 class="title">Interface pour l’insertion manuelle des sessions de cours</h1>

            <form method="POST" action="traitement_inscription.php" id="form-session-cours">

                <!-- Section 1 : Informations cours -->
                <div class="form-section" id="section1">
                    <h4 class="fw-bold">Informations cours</h4>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="sigleCours" class="form-label">Sigle de cours</label>
                            <input type="text" id="sigleCours" class="form-control" name="sigleCours" />
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="intituleCours" class="form-label">Intitulé cours</label>
                            <input type="text" id="intituleCours" class="form-control" name="intituleCours" />
                        </div>
                        <div class="col-md-3 mt-4">
                            <button type="button" class="btn btn-primary" id="rechercherCours">Rechercher cours</button>
                            <button type="button" class="btn btn-secondary"
                                id="btn-reinitialiser-section1">Réinitialiser</button>
                        </div>
                        <div class="col-12 mt-4">
                            <table class="table table-bordered table-striped table-hover d-none" id="resultTable">
                                <thead class="table-dark">
                                    <tr>
                                        <th>Sigle</th>
                                        <th>Intitulé</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody id="resultats"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Section 2 : Détails académiques -->
                <div class="form-section d-none" id="section2">
                    <h4 class="fw-bold">Informations session de cours</h4>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="anneeAcademique" class="form-label required-field">Année académique</label>
                            <input type="text" id="anneeAcademique" class="form-control" name="anneeAcademique"
                                placeholder="Ex: 22-23" required />
                            <div class="invalid-feedback">
                                L'année académique doit être au format XX-YY et les années doivent être consécutives.
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="semestre" class="form-label required-field">Semestre</label>
                            <select class="form-select" id="semestre" name="semestre" required>
                                <option value="" selected disabled>-- Sélectionner un semestre --</option>
                                <?php for ($i = 1; $i <= 7; $i++): ?>
                                    <option value="<?= $i ?>">Semestre <?= $i ?></option>
                                <?php endfor; ?>
                            </select>
                            <div class="invalid-feedback">
                                Veuillez sélectionner un semestre.
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="creditCours" class="form-label required-field">Crédit du cours</label>
                            <input type="number" id="creditCours" class="form-control" name="creditCours"
                                placeholder="0-15" required />
                            <!-- AJOUT : Le message d'erreur qui était manquant -->
                            <div class="invalid-feedback">
                                Le crédit doit être un nombre entier entre 0 et 15.
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="codeProgramme" class="form-label required-field">Code Programme</label>
                            <select class="form-select" id="codeProgramme" name="codeProgramme" required>
                                <option value="" selected disabled>-- Sélectionner un programme --</option>
                                <div class="invalid-feedback">
                                    Veuillez sélectionner un programme.
                                </div>
                                <?php if (!empty($programmes)): ?>
                                    <?php foreach ($programmes as $programme): ?>
                                        <option value="<?= htmlspecialchars($programme['code']) ?>">
                                            ( <?= htmlspecialchars($programme['code']) ?>)
                                            <?= htmlspecialchars($programme['titre']) ?>
                                        </option>
                                    <?php endforeach; ?>
                                <?php else: ?>
                                    <option value="" disabled>Aucun programme disponible</option>
                                <?php endif; ?>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="idEnseignant" class="form-label">Identifiant de l'enseignant</label>
                            <input type="text" class="form-control" id="idEnseignant" name="idEnseignant" />
                        </div>
                        <div class="col-md-6 mb-3 d-flex align-items-end">
                            <button type="button" id="btn-afficher-formulaire" class="btn btn-outline-primary w-100">
                                + Créer un nouveau programme
                            </button>
                        </div>
                    </div>

                    <!-- Mini-formulaire de création, caché initialement -->
                    <div id="mini-form-creation" class="card card-body bg-light d-none">
                        <h5 class="card-title">Nouveau Programme</h5>
                        <div class="mb-2">
                            <label for="nouveau-code" class="form-label">Code du Programme</label>
                            <input type="text" id="nouveau-code" class="form-control" placeholder="Ex: MINFO1" />
                        </div>
                        <div class="mb-2">
                            <label for="nouveau-titre" class="form-label">Titre Complet</label>
                            <input type="text" id="nouveau-titre" class="form-control"
                                placeholder="Ex: Master en Informatique" />
                        </div>
                        <div class="mb-3">
                            <label for="nouveau-niveau" class="form-label">Niveau d'Étude</label>
                            <input type="text" id="nouveau-niveau" class="form-control" placeholder="Ex: Master" />
                        </div>
                        <div class="d-flex justify-content-end">
                            <button type="button" id="btn-annuler-creation"
                                class="btn btn-secondary me-2">Annuler</button>
                            <button type="button" id="btn-sauvegarder-creation"
                                class="btn btn-success">Sauvegarder</button>
                        </div>
                    </div>

                    <div class="d-flex gap-2 mt-4">
                        <button type="button" class="btn btn-primary d-none" id="validerSessionCours">Continuer</button>
                        <button type="button" class="btn btn-secondary"
                            id="btn-reinitialiser-section2">Réinitialiser</button>
                    </div>
                </div>

                <!-- Section 3 : Historique inscription étudiant -->
                <div class="form-section d-none " id="section3">
                    <h4 class="fw-bold">Historique inscription étudiant</h4>

                    <!-- Partie 1 : Infos étudiant -->
                    <div class="mb-4">
                        <h5>Informations étudiant</h5>
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Matricule</label>
                                <input type="text" class="form-control" name="matricule" id="matricule"
                                    placeholder="Ex: ETU2024001" required>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Nom</label>
                                <input type="text" class="form-control" name="nom" id="nom" placeholder="Nom de famille"
                                    required>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Prénoms</label>
                                <input type="text" class="form-control" name="prenoms" id="prenoms"
                                    placeholder="Prénoms de l'étudiant" required>
                            </div>
                        </div>
                        <div class="mb-3 d-flex justify-content-start">
                            <button type="button" class="btn btn-primary" id="btnRechercherEtudiant">
                                <i class="fas fa-search"></i> Rechercher étudiant
                            </button>
                        </div>

                        <!-- Conteneur tableau recherche -->
                        <div class="table-responsive mb-3" id="table-resultats-etudiants"></div>
                    </div>



                    <!-- Partie 2 : Évaluations -->
                    <div class="mb-4 d-none" id="sous-section-evaluations">
                        <hr>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="mb-0">Évaluations</h5>
                            <div>
                                <span class="me-3" id="total-ponderation-container">
                                    Total des pourcentages: <b id="total-ponderation">0</b> %
                                </span>
                                <button type="button" class="btn btn-dark btn-sm" id="add-evaluation-btn">
                                    <i class="fas fa-plus"></i> Ajouter évaluation
                                </button>
                            </div>
                        </div>
                        <!-- Conteneur pour les évaluations dynamiques -->
                        <div id="evaluations-container"></div>
                        <hr>
                    </div>


                    <!-- Partie 3 : Résultats finaux -->
                    <div class="d-none" id="sous-section-resultats">
                        <h5>Résultats finaux</h5>
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Note Rattrapage</label>
                                <input type="number" class="form-control" id="noteRattrapage" name="noteRattrapage"
                                    min="0" max="20" step="0.25" placeholder="(optionnel)">
                            </div>

                            <div class="col-md-4 mb-3">
                                <label class="form-label required-field">Moyenne finale</label>
                                <input type="number" class="form-control" id="moyenneFinale" name="moyenneFinale"
                                    placeholder="Saisie manuelle ou calculée" step="0.01">
                            </div>

                            <div class="col-md-4 mb-3">
                                <label class="form-label required-field">Sanction</label>
                                <select class="form-select" id="sanction" name="sanction">
                                    <option value="" selected>-- Sélectionner une sanction --</option>
                                    <option value="inscrit">Inscrit</option>
                                    <option value="reussi">Réussi</option>
                                    <option value="echoue">Échoué</option>
                                    <option value="abandonne">Abandonné</option>
                                </select>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12 mb-3">
                                <label class="form-label">Appréciation</label>
                                <textarea class="form-control" id="appreciation" name="appreciations" rows="3"
                                    placeholder="Commentaires, observations..."></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="mb-3 d-flex justify-content-end">
                        <button type="button" class="btn btn-secondary" id="btnReinitialiserSection3">
                            <i class="fas fa-undo"></i> Réinitialiser
                        </button>
                    </div>

                </div>

                <div class="d-flex justify-content-end mt-4">
                    <button type="button" class="btn btn-success d-none w-50" id="submitFinal" form="form-session-cours"
                        disabled>
                        <i class="fas fa-check"></i> Soumission finale
                    </button>
                </div>

            </form>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="public/js/etudiant.js"></script>
    <script src="public/js/cours.js"></script>
    <script src="public/js/programme.js"></script>
</body>

<script>
    document.getElementById('loginForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const formData = new FormData(this);

        try {
            const response = await fetch('auth.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                showAlert('Connexion réussie !', 'success');
                document.getElementById('login-section').classList.add('d-none');
                document.getElementById('main-form-section').classList.remove('d-none');
            } else {
                showAlert(result.message || 'Login ou mot de passe incorrect', 'danger');
            }
        } catch (error) {
            showAlert('Erreur réseau ou serveur: ' + error.message, 'danger');
            console.log('Erreur:', error.message);
        }
    });

    document.addEventListener("DOMContentLoaded", () => {
        document.getElementById("form-session-cours").addEventListener("submit", function (event) {
            event.preventDefault();
            console.log("Soumission interceptée");
        });
    });

    function reinitialiserFormulaire() {
        const formulaire = document.getElementById('form-session-cours');
        formulaire.reset();
        // let champsHorsFormulaire = [
        //     'noteRattrapage',
        //     'moyenneFinale',
        //     'sanction',
        //     'appreciation',
        //     'matricule',
        //     'nom',
        //     'prenoms'
        // ];
        // champsHorsFormulaire.forEach(id => {
        //     const champ = document.getElementById(id);
        //     champ.value = null;
        //     champ.removeAttribute("readonly");
        //     champ.removeAttribute("disabled");
        //     champ.style.backgroundColor = ""; // ou une couleur de base si définie par défaut
        // });

        document.getElementById("section2").classList.add("d-none");
        document.getElementById("section3").classList.add("d-none");
        document.getElementById("submitFinal").classList.add("d-none");
    }


    document.addEventListener('DOMContentLoaded', function () {
        const boutonFinal = document.getElementById('submitFinal');
        const formulaire = document.getElementById('form-session-cours');
        reinitialiserFormulaire();
        // document.getElementById("moyenneFinale").addEventListener("input", gererAffichageBoutonSoumission);
        // document.getElementById("sanction").addEventListener("change", gererAffichageBoutonSoumission);
        // const form = document.getElementById("monFormulaire");

        formulaire.addEventListener("input", gererAffichageBoutonSoumission);
        formulaire.addEventListener("change", gererAffichageBoutonSoumission);

        formulaire.addEventListener("click", (event) => {
            if (event.target.tagName === "BUTTON") {
                gererAffichageBoutonSoumission();
            }
        });

        boutonFinal.addEventListener('click', function () {
            const formData = new FormData(formulaire);
            const notesString = buildNotesString();
            if (notesString === null) {
                event.preventDefault();
                return;
            }
            formData.set('notes', notesString);
            // formData.set('noteRattrapage', document.getElementById('noteRattrapage').value);
            // formData.set('moyenneFinale', document.getElementById('moyenneFinale').value);
            // formData.set('sanction', document.getElementById('sanction').value);
            // formData.set('appreciations', document.getElementById('appreciation').value);
            // formData.set('matricule', document.getElementById('matricule').value);
            // formData.set('nom', document.getElementById('nom').value);
            // formData.set('prenoms', document.getElementById('prenoms').value);
            // DEBUG : Afficher les données du formulaire dans la console
            // for (let [key, value] of formData.entries()) {
            //     console.log(`${key}: ${value}`);
            // }
            // --- Requête fetch POST ---
            fetch(formulaire.action, {
                method: formulaire.method,
                body: formData
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Erreur HTTP : " + response.status);
                    }
                    return response.json(); // attend un JSON
                })
                .then(result => {
                    console.log("Réponse serveur :", result);

                    if (result.success) {
                        showAlert(result.message, "success");
                        reinitialiserSection3ApresSoumission();
                    } else {
                        showAlert(result.message, "warning");
                    }
                })
                .catch(error => {
                    console.error("Erreur JS ou réseau :", error);
                    showAlert("Une erreur est survenue : " + error.message, "danger");
                });
        });
    });

    function reinitialiserSection3ApresSoumission() {
        const inputsNote = document.querySelectorAll('input[name="note[]"]');

        inputsNote.forEach((input) => {
            input.value = ""; // Vide la valeur saisie
        });
        const section3 = document.getElementById("section3");
        const inputMatricule = section3.querySelector('input[name="matricule"]');
        const inputNom = section3.querySelector('input[name="nom"]');
        const inputPrenoms = section3.querySelector('input[name="prenoms"]');
        const btnRechercherEtudiant = document.getElementById("btnRechercherEtudiant");
        const sousSectionResultats = document.getElementById("sous-section-resultats");
        inputMatricule.value = "";
        inputNom.value = "";
        inputPrenoms.value = "";
        inputMatricule.readOnly = false; //
        inputNom.readOnly = false;
        inputPrenoms.readOnly = false;
        inputMatricule.style.backgroundColor = "#fff"; // Couleur grise de Bootstrap pour les disabled
        inputNom.style.backgroundColor = "#fff";
        inputPrenoms.style = "#fff";

        // Tu peux aussi vider les champs calculés s’il y en a :
        document.getElementById('noteRattrapage').value = "";
        document.getElementById('moyenneFinale').value = "";
        document.getElementById('sanction').value = "";
        document.getElementById('appreciation').value = "";

        // Et éventuellement masquer le bouton de soumission
        document.getElementById('submitFinal').classList.add('d-none');
        document.getElementById('submitFinal').disabled = true;
        if (sousSectionResultats) sousSectionResultats.classList.add("d-none");
        btnRechercherEtudiant.classList.remove("d-none");
    }

    function gererAffichageBoutonSoumission() {
        const section2Visible = !document.getElementById("section2").classList.contains("d-none");
        const section3Visible = !document.getElementById("section3").classList.contains("d-none");


        const moyenneFinale = document.getElementById("moyenneFinale").value?.trim();
        const sanction = document.getElementById("sanction").value?.trim();
        const submitBtn = document.getElementById("submitFinal");

        const tousRemplis = moyenneFinale !== "" && moyenneFinale !== null &&
            sanction !== "" && sanction !== null;

        if (section2Visible && section3Visible && tousRemplis) {
            submitBtn.classList.remove("d-none");
            submitBtn.disabled = false;
        } else {
            submitBtn.classList.add("d-none");
            submitBtn.disabled = true;
        }
    }

    function buildNotesString() {
        const notesParts = [];
        let erreurTrouvee = false;
        let sommePonderation = 0;
        let evaluationRemplie = false;

        document.querySelectorAll('.evaluation-block').forEach((block, index) => {
            const intitule = block.querySelector('input[name="intitule[]"]').value.trim();
            const ponderation = block.querySelector('input[name="ponderation[]"]').value.trim();
            const note = block.querySelector('input[name="note[]"]').value.trim();

            const auMoinsUnRempli = intitule || ponderation || note;
            const tousRemplis = intitule && ponderation && note;

            if (auMoinsUnRempli) {
                evaluationRemplie = true;

                if (!tousRemplis) {
                    showAlert(`Veuillez compléter tous les champs pour l'évaluation n°${index + 1}`, "danger");
                    erreurTrouvee = true;
                    return;
                }

                const ponderationNum = parseFloat(ponderation);
                const noteNum = parseFloat(note);

                if (isNaN(ponderationNum) || ponderationNum < 0 || ponderationNum > 100) {
                    showAlert(`La pondération de l'évaluation n°${index + 1} doit être un nombre entre 0 et 100.`, "danger");
                    erreurTrouvee = true;
                    return;
                }

                if (isNaN(noteNum) || noteNum < 0 || noteNum > 20) {
                    showAlert(`La note de l'évaluation n°${index + 1} doit être un nombre entre 0 et 20.`, "danger");
                    erreurTrouvee = true;
                    return;
                }

                sommePonderation += ponderationNum;
                notesParts.push(`${intitule}(${ponderationNum}%):${noteNum}`);
            }
        });

        if (!evaluationRemplie) {
            return ''; // Aucune évaluation, donc pas de validation nécessaire
        }

        if (erreurTrouvee) {
            return null;
        }

        if (Math.abs(sommePonderation - 100) > 0.01) {
            showAlert(`La somme des pondérations est de ${sommePonderation}%. Elle doit être exactement égale à 100%.`, "danger");
            return null;
        }

        return notesParts.join(';');
    }

    function showAlert(message, type = "info", duration = 6000) {
        const alertContainer = document.getElementById("alert-container");
        if (!alertContainer) return;

        const alertDiv = document.createElement("div");
        alertDiv.className = `alert alert-${type} alert-dismissible fade show shadow`;
        alertDiv.style.fontSize = "1.1rem";             // texte plus grand
        alertDiv.style.padding = "1.20rem 1.5rem";       // padding plus généreux
        alertDiv.style.marginBottom = "1rem";            // espacement entre alertes
        alertDiv.style.maxWidth = "500px";               // boîte plus large
        alertDiv.style.boxShadow = "0 0.5rem 1rem rgba(0,0,0,0.15)"; // ombre douce

        alertDiv.innerHTML = `
        <strong class="me-2">${message}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

        alertContainer.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.classList.remove("show");
            alertDiv.classList.add("fade");
            setTimeout(() => alertDiv.remove(), 300);
        }, duration);
    }


</script>


</html>