<?php

// CORS pour dev
// --- CORS : doit être avant toute sortie ---


// OPTIONS pré-vol
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/utils.php';

// --- Log de base ---
error_log("Auth.php appelé depuis IP: " . $_SERVER['REMOTE_ADDR']);
error_log("Méthode HTTP: " . $_SERVER['REQUEST_METHOD']);
error_log("Session actuelle: " . json_encode($_SESSION));

// --- Mode développement ---
if (in_array($_SERVER['REMOTE_ADDR'], ['127.0.0.1', '::1'])) {
    if (!isset($_SESSION['user_id'])) {
        $_SESSION['user_id'] = 'admin';
        error_log("Mode dev : session initialisée avec user_id=admin");
    }
    envoyerReponse("Mode développement : connexion simulée", true);
    exit;
}

try {
    $pdo = getDatabaseConnection('temp');
    error_log("Connexion à la DB OK");

    $data = extraireDonneesConnexion($_POST);
    error_log("Données reçues : " . json_encode($data));

    validerDonneesConnexion($data);
    verifierAuthentification($pdo, $data);

} catch (PDOException $e) {
    error_log("Erreur PDO : " . $e->getMessage());
    envoyerReponse("Erreur PDO : " . $e->getMessage(), false);
} catch (Exception $e) {
    error_log("Erreur : " . $e->getMessage());
    envoyerReponse("Erreur : " . $e->getMessage(), false);
}

/**
 * Récupère les données postées depuis le formulaire
 */
function extraireDonneesConnexion(array $post): array
{
    $data = [
        'login' => $post['login'] ?? null,
        'password' => $post['password'] ?? null,
    ];
    error_log("Extraction des données : " . json_encode($data));
    return $data;
}

/**
 * Vérifie que les champs requis sont remplis
 */
function validerDonneesConnexion(array $data): void
{
    if (empty($data['login']) || empty($data['password'])) {
        error_log("Validation échouée : login ou password manquant");
        envoyerReponse("Veuillez renseigner le login et le mot de passe.", false);
    }
    error_log("Validation OK pour login: " . $data['login']);
}

/**
 * Vérifie l'authentification
 */
function verifierAuthentification(PDO $pdo, array $data): void
{
    $sql = "SELECT identifiant, motdepasse FROM utilisateurs WHERE BINARY identifiant = :login LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':login' => $data['login']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        error_log("Utilisateur non trouvé : " . $data['login']);
        envoyerReponse("Identifiant ou mot de passe incorrect.", false);
    }
    error_log("Utilisateur trouvé : " . json_encode($user));

    if ($data['password'] === $user['motdepasse']) {
        $_SESSION['user_id'] = $data['login'];
        error_log("Connexion réussie pour : " . $data['login']);
        envoyerReponse("Connexion réussie, bienvenue " . htmlspecialchars($data['login']) . " !", true);
    } else {
        error_log("Mot de passe incorrect pour : " . $data['login']);
        envoyerReponse("Identifiant ou mot de passe incorrect.", false);
    }
}

/**
 * Convertit un mot en une séquence numérique basée sur les lettres
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
            $result[] = $map[$lettre] + 1;
        }
    }

    $decoded = implode('', $result);
    error_log("Décodage du mot '$mot' => '$decoded'");
    return $decoded;
}
