<?php
header('Content-Type: application/json');
require_once __DIR__ . '/utils.php';
$fichier = __DIR__ . '/data/programmes.json';

// Récupération sécurisée des données POST
$code = trim($_POST['code'] ?? '');
$titre = trim($_POST['titre'] ?? '');
$niveau = trim($_POST['niveau'] ?? '');

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
    if (!is_array($programmes)) {
        // Fichier JSON corrompu ou vide => réinitialiser
        $programmes = [];
    }
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

envoyerReponse('Programme ajouté avec succès.', true);
