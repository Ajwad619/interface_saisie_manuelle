<?php

// ==== Configuration CORS ====
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origin === 'http://localhost:3000') {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
} else {
    // optionnel : refuser toute autre origine
    header("HTTP/1.1 403 Forbidden");
    exit(json_encode(["success" => false, "message" => "CORS non autorisé."]));
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/utils.php';

error_log("Auth.php appelé depuis IP: " . $_SERVER['REMOTE_ADDR']);

// --- Mode développement : bypass de l'authentification ---
if (in_array($_SERVER['REMOTE_ADDR'], ['127.0.0.1', '::1'])) {
    if (!isset($_SESSION['user_id'])) {
        $_SESSION['user_id'] = 'admin'; // utilisateur fictif
    }
    // Permet à l’interface React d’accéder aux API sans blocage
    // et évite toute exécution du code d’authentification
    envoyerReponse("Mode développement : connexion simulée", true);
    exit;  // AJOUT : Arrête l'exécution du script ici pour éviter les erreurs suivantes
}

try {
    $pdo = getDatabaseConnection('temp');
    $data = extraireDonneesConnexion($_POST);
    validerDonneesConnexion($data);
    verifierAuthentification($pdo, $data);
} catch (PDOException $e) {
    envoyerReponse("Erreur PDO : " . $e->getMessage(), false);
} catch (Exception $e) {
    envoyerReponse("Erreur : " . $e->getMessage(), false);
}

/**
 * Récupère les données postées depuis le formulaire
 */
function extraireDonneesConnexion(array $post): array
{
    return [
        'login' => $post['login'] ?? null,
        'password' => $post['password'] ?? null,
    ];
}

/**
 * Vérifie que les champs requis sont remplis
 */
function validerDonneesConnexion(array $data): void
{
    if (empty($data['login']) || empty($data['password'])) {
        envoyerReponse("Veuillez renseigner le login et le mot de passe.", false);
    }
}

/**
 * Vérifie l'authentification
 */
function verifierAuthentification(PDO $pdo, array $data): void
{
    $sql = "SELECT identifiant FROM utilisateurs WHERE BINARY identifiant = :login LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':login' => $data['login']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        envoyerReponse("Identifiant ou mot de passe incorrect.", false);
    }

    // mot de passe attendu (en clair)
    $motDePasseAttendu = decoderMot($data['login']);

   if ($data['password'] === $user['motdepasse']) {
        // succès → tu peux ici initialiser une session si besoin
        $_SESSION['user_id'] = $data['login'];
        envoyerReponse("Connexion réussie, bienvenue " . htmlspecialchars($data['login']) . " !", true);
    } else {
        envoyerReponse("Identifiant ou mot de passe incorrect.", false);
    }
}

/**
 * Convertit un mot en une séquence numérique basée sur les lettres
 * Exemple : HELLO → 8-5-12-12-15
 */
function decoderMot(string $mot): string
{
    $mot = strtoupper($mot);
    $alphabet = range('A', 'Z');
    $map = array_flip($alphabet);
    $result = [];

    for ($i = 0; $i < strlen($mot); $i++) {
        $lettre = $mot[$i];
        if (isset($map[$lettre])) {
            $result[] = $map[$lettre] + 1; // A = 1
        }
    }

    return implode('', $result);
}
