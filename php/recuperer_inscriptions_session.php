<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:3000");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    exit(0);
}

require_once 'database.php';
$pdo = getDatabaseConnection('temp');

try {
    // Récupérer les paramètres
    $intitule = $_GET['intituleCours'] ?? null;
    $annee = $_GET['anneeAcademique'] ?? null;
    $semestre = $_GET['semestre'] ?? null;
    $codeProg = $_GET['codeProgramme'] ?? null;

    if (!$intitule || !$annee || !$semestre || !$codeProg) {
        throw new Exception("Paramètres manquants.");
    }

    $sql = "SELECT 
        id, matricule, nom, prenoms,
        notes, noteRattrapage, moyenneFinale,
        sanction, appreciations
      FROM inscriptionsessioncours
      WHERE 
        intituleCours = :intitule
        AND anneeAcademique = :annee
        AND semestre = :semestre
        AND codeProgramme = :codeProg
      ORDER BY nom, prenoms";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':intitule' => $intitule,
        ':annee' => $annee,
        ':semestre' => $semestre,
        ':codeProg' => $codeProg
    ]);

    $inscriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'data' => $inscriptions]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}