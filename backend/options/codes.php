<?php
header ("Access-Control-Allow-Origin: http://localhost:3000");
header ("Access-Control-Allow-Credentials: true");
header ("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../database.php';

try {
    $pdo = getDatabaseConnection('temp');

    $sql = "SELECT DISTINCT codeProgramme 
            FROM historiquesessioncours 
            WHERE codeProgramme IS NOT NULL 
            AND codeProgramme != ''
            ORDER BY codeProgramme DESC";

    // Exécuter la requête avec pdo et la stocker dans $stmt
    $stmt = $pdo->query($sql);

    // Récupérer tous les résultats de stmt sous forme de tableau avec fetchAll 
    // pdo::FETCH_COLUMN pour obtenir une seule colonne et on stocke dans $annees
    $codes = $stmt->fetchAll(PDO::FETCH_COLUMN); 

    // Envoyer annees en json en cas de succès
    echo json_encode([
        'success' => true,
        'codes' => $codes
    ]);

} catch (Exception $e) {
    // En cas d'erreur, envoyer un message d'erreur
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur serveur : ' . $e->getMessage()
    ]);
}