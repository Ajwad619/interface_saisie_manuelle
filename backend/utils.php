<?php

function envoyerReponse(string $message, bool $success = true, array $dataSupplementaire = []): void
{
    header("Access-Control-Allow-Origin: http://localhost:3000"); // ✅ origine exacte
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Credentials: true");
    $reponse = array_merge([
        'success' => $success,
        'message' => $message
    ], $dataSupplementaire);
    echo json_encode($reponse, JSON_UNESCAPED_UNICODE);
    exit;
}