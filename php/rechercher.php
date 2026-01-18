<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Autoriser les requêtes POST avec JSON
$_POST = json_decode(file_get_contents('php://input'), true) ?: [];

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/utils.php'; // pour pouvoir utiliser envoyerReponse()

try {
    $pdo = getDatabaseConnection('temp');

    // Récupérer les données envoyées par React
    $criteria = $_POST['criteria'] ?? [];
    $type = $_POST['type'] ?? 'sessions'; // on vérifie : 'sessions' ou 'inscriptions'

    // Fonction pour échapper les chaînes (sécurité)
    function secureLike($value) {
        if ($value === null || $value === '') {
            return "''";
        }
        $escaped = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $value);
        return "'%" . $escaped . "%'";
    }

    if ($type === 'sessions') {
        // === RECHERCHE DE SESSIONS ===
        $sql = "SELECT DISTINCT 
                    sigleCours, 
                    intituleCours, 
                    anneeAcademique, 
                    semestre, 
                    codeProgramme, 
                    creditCours, 
                    idEnseignant
                FROM historiquesessioncours
                WHERE 1=1";

        // Ajouter les conditions selon les critères
        if (!empty($criteria['sigleCours'])) {
            $sql .= " AND sigleCours LIKE " . secureLike($criteria['sigleCours']);
        }
        if (!empty($criteria['intituleCours'])) {
            $sql .= " AND intituleCours LIKE " . secureLike($criteria['intituleCours']);
        }
        if (!empty($criteria['anneeAcademique'])) {
            $sql .= " AND anneeAcademique = " . $pdo->quote($criteria['anneeAcademique']);
        }
        if (!empty($criteria['semestre']) && $criteria['semestre'] !== 'Tous les semestres') {
            $semestreNum = str_replace('Semestre ', '', $criteria['semestre']);
            $sql .= " AND semestre = " . $pdo->quote($semestreNum);
        }
        if (!empty($criteria['codeProgramme'])) {
            $sql .= " AND codeProgramme = " . $pdo->quote($criteria['codeProgramme']);
        }
        if (!empty($criteria['creditCours'])) {
            $sql .= " AND creditCours = " . (int)$criteria['creditCours'];
        }
        if (!empty($criteria['idEnseignant'])) {
            $sql .= " AND idEnseignant LIKE " . secureLike($criteria['idEnseignant']);
        }

        $sql .= " ORDER BY anneeAcademique DESC, semestre ASC LIMIT 50";
        $stmt = $pdo->query($sql);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    } else {
        // === RECHERCHE D'INSCRIPTIONS ===
        $sql = "SELECT 
                    id,
                    matricule,
                    nom,
                    prenoms,
                    intituleCours,
                    anneeAcademique,
                    semestre,
                    codeProgramme,
                    moyenneFinale,
                    sanction,
                    appreciations
                FROM inscriptionsessioncours
                WHERE 1=1";

        // Filtres Étudiant
        if (!empty($criteria['matricule'])) {
            $sql .= " AND matricule LIKE " . secureLike($criteria['matricule']);
        }
        if (!empty($criteria['nom'])) {
            $sql .= " AND nom LIKE " . secureLike($criteria['nom']);
        }
        if (!empty($criteria['prenoms'])) {
            $sql .= " AND prenoms LIKE " . secureLike($criteria['prenoms']);
        }

        // Filtres Session (optionnels)
        if (!empty($criteria['sigleCours'])) {
            $sql .= " AND sigleCours LIKE " . secureLike($criteria['sigleCours']);
        }
        if (!empty($criteria['intituleCours'])) {
            $sql .= " AND intituleCours LIKE " . secureLike($criteria['intituleCours']);
        }
        if (!empty($criteria['anneeAcademique'])) {
            $sql .= " AND anneeAcademique = " . $pdo->quote($criteria['anneeAcademique']);
        }
        if (!empty($criteria['semestre']) && $criteria['semestre'] !== 'Tous les semestres') {
            $semestreNum = str_replace('Semestre ', '', $criteria['semestre']);
            $sql .= " AND semestre = " . $pdo->quote($semestreNum);
        }
        if (!empty($criteria['codeProgramme'])) {
            $sql .= " AND codeProgramme = " . $pdo->quote($criteria['codeProgramme']);
        }

        $sql .= " ORDER BY nom, prenoms LIMIT 50";
        $stmt = $pdo->query($sql);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Envoyer les résultats
    echo json_encode([
        'success' => true,
        'results' => $results,
        'type' => $type,
        'count' => count($results)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur : ' . $e->getMessage()
    ]);
}