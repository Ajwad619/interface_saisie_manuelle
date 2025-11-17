<?php
    header("Access-Control-Allow-Origin: http://localhost:3000"); // ✅ origine exacte
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Credentials: true");
    
require_once __DIR__ . '/database.php';
header('Content-Type: application/json');

try {
    $pdo = getDatabaseConnection('temp');

    $nom = isset($_GET['nom']) ? trim($_GET['nom']) : '';
    $prenoms = isset($_GET['prenoms']) ? trim($_GET['prenoms']) : '';
    $matricule = isset($_GET['matricule']) ? trim($_GET['matricule']) : '';

    $conditions = [];
    $params = [];

    if ($nom !== '') {
        $conditions[] = "nom LIKE :nom";
        $params[':nom'] = "%" . $nom . "%";
    }

    if ($prenoms !== '') {
        $conditions[] = "prenoms LIKE :prenoms";
        $params[':prenoms'] = "%" . $prenoms . "%";
    }

    if ($matricule !== '') {
        $conditions[] = "matriculeD LIKE :matricule";
        $params[':matricule'] = "%" . $matricule . "%";
    }

    if (empty($conditions)) {
        echo json_encode([]);
        exit;
    }

    // Crée la requête combinée avec UNION
    $queries = [];

    if (isset($params[':nom'])) {
        $queries[] = "SELECT DISTINCT matriculeD, matriculeP, nom, prenoms, dateNaissance FROM matricules WHERE nom LIKE :nom";
    }
    if (isset($params[':prenoms'])) {
        $queries[] = "SELECT DISTINCT matriculeD, matriculeP, nom, prenoms, dateNaissance FROM matricules WHERE prenoms LIKE :prenoms";
    }
    if (isset($params[':matricule'])) {
        $queries[] = "SELECT DISTINCT matriculeD, matriculeP, nom, prenoms, dateNaissance FROM matricules WHERE matriculeD LIKE :matricule";
    }

    $sql = implode(" UNION ", $queries) . " LIMIT 20";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $resultats = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($resultats);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur serveur : ' . $e->getMessage()]);
}
