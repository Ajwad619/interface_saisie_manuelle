<?php
// rechercher_cours.php

    header("Access-Control-Allow-Origin: http://localhost:3000"); // ✅ origine exacte
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Credentials: true");

require_once __DIR__ . '/database.php';
header('Content-Type: application/json; charset=utf-8');

$sigle = $_GET['sigle'] ?? '';
$intitule = $_GET['intitule'] ?? '';

try {
    $pdo = getDatabaseConnection('prod');

    // Préparation de la requête SQL
    $sql = "SELECT sigle, intitule FROM cours WHERE 1=1";
    $params = [];

    if (!empty($sigle)) {
        $sql .= " AND sigle LIKE :sigle";
        $params[':sigle'] = '%' . $sigle . '%';
    }

    if (!empty($intitule)) {
        $sql .= " AND intitule LIKE :intitule";
        $params[':intitule'] = '%' . $intitule . '%';
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $coursBd = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur de connexion à la base de données.']);
    exit;
}

// Charger les cours du fichier JSON (affinés)
$coursJson = [];
$fichier = __DIR__ . '/data/cours.json';

if (file_exists($fichier)) {
    $jsonData = file_get_contents($fichier);
    $coursJson = json_decode($jsonData, true);
    if (!is_array($coursJson)) $coursJson = [];
}

// Filtrage des cours JSON selon les mêmes critères
function filtreCours($cours, $sigle, $intitule) {
    return array_filter($cours, function ($c) use ($sigle, $intitule) {
        $matchSigle = empty($sigle) || stripos($c['sigle'], $sigle) !== false;
        $matchIntitule = empty($intitule) || stripos($c['intitule'], $intitule) !== false;
        return $matchSigle && $matchIntitule;
    });
}

$coursJsonFiltres = filtreCours($coursJson, $sigle, $intitule);

// MODIFIÉ : Fusionner BD et JSON en marquant la source JSON
function fusionnerCours($bd, $json) {
    $result = $bd; // On commence avec les résultats de la base de données, inchangés.
    
    // On garde une trace des sigles déjà présents pour éviter les doublons.
    $siglesExistants = array_map(fn($c) => strtolower($c['sigle']), $bd);

     foreach ($json as $c) {
        if (!in_array(strtolower($c['sigle']), $siglesExistants)) {
            // MODIFIÉ : On ajoute le marqueur dans une balise span avec du style
            $c['intitule'] = $c['intitule'] . '  <span style="color: red; font-weight: bold;">**</span>';
            $result[] = $c;
        }
    }

    return $result;
}

$coursFinal = fusionnerCours($coursBd, $coursJsonFiltres);

echo json_encode(array_values($coursFinal), JSON_UNESCAPED_UNICODE);
