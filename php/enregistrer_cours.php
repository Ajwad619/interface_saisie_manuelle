<?php
// Fichier : enregistrer_cours.php
require_once __DIR__ . '/utils.php';
header('Content-Type: application/json');

// Emplacement du fichier JSON
$fichier = __DIR__ . '/data/cours.json';

// Récupérer les données JSON envoyées en POST
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['sigle']) || !isset($data['intitule'])) {
    http_response_code(400);
    envoyerReponse("Données invalides", false);
}

$sigle = trim($data['sigle']);
$intitule = trim($data['intitule']);

if ($sigle === '' || $intitule === '') {
    http_response_code(400);
    envoyerReponse("Sigle et intitulé sont obligatoires", false);
}

// Lire le fichier JSON existant
if (file_exists($fichier)) {
    $json = file_get_contents($fichier);
    $cours = json_decode($json, true);
    if (!is_array($cours)) {
        $cours = [];
    }
} else {
    $cours = [];
}

// Vérifier si le sigle existe déjà (insensible à la casse)
foreach ($cours as $c) {
    if (strcasecmp($c['sigle'], $sigle) === 0) {
        http_response_code(409);
        envoyerReponse("Le sigle existe déjà", false);
    }
}

// Ajouter le nouveau cours
$nouveauCours = ['sigle' => $sigle, 'intitule' => $intitule];
$cours[] = $nouveauCours;

// Sauvegarder dans le fichier JSON
if (file_put_contents($fichier, json_encode($cours, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false) {
    http_response_code(500);
    envoyerReponse("Erreur lors de l'écriture du fichier", false);
}

// Succès
envoyerReponse("Cours ajouté avec succès", true, ['cours' => $nouveauCours]);
