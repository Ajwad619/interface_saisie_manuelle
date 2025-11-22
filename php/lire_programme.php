<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json");

$fichier = __DIR__ . '/data/programmes.json';

if (!file_exists($fichier)) {
    echo json_encode([]);
    exit();
}

$json = file_get_contents($fichier);
$programmes = json_decode($json, true);
echo json_encode($programmes);
