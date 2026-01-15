<?php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'database.php';

try {
    $id = $_GET['id'] ?? null;

    if (!$id || !is_numeric($id)) {
        throw new Exception("ID d'inscription manquant ou invalide.");
    }

    $pdo = getDatabaseConnection('temp');

    $sql = "SELECT 
        id,
        matricule,
        nom,
        prenoms,
        intituleCours,
        codeProgramme,
        anneeAcademique,
        semestre,
        notes,
        noteRattrapage,
        moyenneFinale,
        appreciations,
        sanction
      FROM inscriptionsessioncours
      WHERE id = :id";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $id]);

    $inscription = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$inscription) {
        throw new Exception("Inscription non trouvée.");
    }

    echo json_encode([
        'success' => true,
        'data' => $inscription
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}