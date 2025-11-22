<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/database.php';
header('Content-Type: application/json');

try {
    $pdo = getDatabaseConnection('temp');

    $nom = trim($_GET['nom'] ?? '');
    $prenoms = trim($_GET['prenoms'] ?? '');
    $matricule = trim($_GET['matricule'] ?? '');// Réponse automatique au préflight CORS

    // Rien à rechercher
    if ($nom === '' && $prenoms === '' && $matricule === '') {
        echo json_encode([]);
        exit;
    }

    // Construction dynamique d'une seule requête
    $conditions = [];
    $params = [];

    if ($nom !== '') {
        $conditions[] = "nom LIKE :nom";
        $params[':nom'] = "%$nom%";
    }

    if ($prenoms !== '') {
        $conditions[] = "prenoms LIKE :prenoms";
        $params[':prenoms'] = "%$prenoms%";
    }

    if ($matricule !== '') {
        $conditions[] = "matriculeD LIKE :matricule";
        $params[':matricule'] = "%$matricule%";
    }

    $sql = "
        SELECT DISTINCT matriculeD, matriculeP, nom, prenoms, dateNaissance
        FROM matricules
        WHERE " . implode(" AND ", $conditions) . "
        LIMIT 20
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur serveur : ' . $e->getMessage()]);
}
