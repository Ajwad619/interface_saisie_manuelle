<?php

function envoyerReponse(string $message, bool $success = true, array $dataSupplementaire = []): void {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    $reponse = array_merge([
        'success' => $success,
        'message' => $message
    ], $dataSupplementaire);
    echo json_encode($reponse, JSON_UNESCAPED_UNICODE);
    exit;
}