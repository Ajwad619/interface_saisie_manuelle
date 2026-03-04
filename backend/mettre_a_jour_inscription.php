<?php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'database.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);

    $id = $input['id'] ?? null;
    if (!$id || !is_numeric($id)) {
        throw new Exception("ID d'inscription manquant ou invalide.");
    }

    $champsAutorises = [
        'notes',
        'noteRattrapage',
        'moyenneFinale',
        'sanction',
        'appreciations'
    ];

    $updates = [];
    $params = [':id' => $id];

    foreach ($champsAutorises as $champ) {
        if (array_key_exists($champ, $input)) {
            $valeur = $input[$champ] === '' ? null : $input[$champ];
            $updates[] = "$champ = :$champ";
            $params[":$champ"] = $valeur;
        }
    }

    if (empty($updates)) {
        throw new Exception("Aucun champ valide à mettre à jour.");
    }

    $pdo = getDatabaseConnection('temp');

    $sql = "UPDATE inscriptionsessioncours SET " . implode(', ', $updates) . " WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode([
        'success' => true,
        'message' => 'Inscription mise à jour avec succès.'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}