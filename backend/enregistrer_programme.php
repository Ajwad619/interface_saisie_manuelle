<?php
// === HEADERS CORS ===
header("Access-Control-Allow-Origin: http://localhost:3000"); // ton front
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

// === Gérer la requête OPTIONS pour le preflight ===
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/utils.php';
$fichier = __DIR__ . '/data/programmes.json';

// === Lire le JSON POST ===
$input = file_get_contents('php://input');
$data = json_decode($input, true);

$code = trim($data['code'] ?? '');
$titre = trim($data['titre'] ?? '');
$niveau = trim($data['niveau'] ?? '');

// Validation
if ($code === '' || $titre === '' || $niveau === '') {
    http_response_code(400);
    envoyerReponse('Tous les champs (code, titre, niveau) sont obligatoires.', false);
    exit;
}

// Lire le JSON existant en sécurité
$programmes = [];
if (file_exists($fichier)) {
    $contenu = file_get_contents($fichier);
    $programmes = json_decode($contenu, true);
    if (!is_array($programmes)) $programmes = [];
}

// Vérifier doublon code (sans casse)
foreach ($programmes as $prog) {
    if (strcasecmp($prog['code'], $code) === 0) {
        http_response_code(409);
        envoyerReponse('Le code du programme existe déjà.', false);
        exit;
    }
}

// Ajouter nouveau programme
$programmes[] = [
    'code' => $code,
    'titre' => $titre,
    'niveau' => $niveau,
];

// Sauvegarder dans fichier JSON
if (file_put_contents($fichier, json_encode($programmes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false) {
    http_response_code(500);
    envoyerReponse('Erreur lors de l\'écriture du fichier.', false);
    exit;
}

// Succès
envoyerReponse('Programme ajouté avec succès.', true, ['nouveauProgramme' => end($programmes)]);
