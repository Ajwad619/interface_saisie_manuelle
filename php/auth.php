<?php

session_set_cookie_params([
    'samesite' => 'None',
    'secure' => false 
]);

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/utils.php';

// --- Log de base ---
error_log("Auth.php appelé depuis IP: " . $_SERVER['REMOTE_ADDR']);
error_log("Méthode HTTP: " . $_SERVER['REQUEST_METHOD']);
error_log("Session actuelle: " . json_encode($_SESSION));

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
        error_log("Validation échouée : login ou password manquant");
        envoyerReponse("Veuillez renseigner le login et le mot de passe.", false);
    }
    error_log("Validation OK pour login: " . $data['login']);
}

/**
 * Vérifie l'authentification
 */
function verifierAuthentification(PDO $pdo, array $data): void {
    // === Récupérer identifiant, motdepasse ET role ===
    $sql = "SELECT identifiant, motdepasse, role FROM utilisateurs WHERE BINARY identifiant = :login LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':login' => $data['login']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        error_log("Utilisateur non trouvé : " . $data['login']);
        envoyerReponse("Identifiant ou mot de passe incorrect.", false);
    }

    // === Vérifier mot de passe (en clair pour l'instant) ===
    if ($data['password'] === $user['motdepasse']) {
        // === Stocker dans la session : identifiant + rôle ===
        $_SESSION['user_id'] = $user['identifiant'];
        $_SESSION['role'] = $user['role']; // ← NOUVEAU

        error_log("Connexion réussie pour : " . $user['identifiant'] . " (rôle: " . $user['role'] . ")");

        // === Renvoyer rôle + identifiant dans la réponse ===
        envoyerReponse(
            "Connexion réussie, bienvenue " . htmlspecialchars($user['identifiant']) . " !",
            true,
            [
                'role' => $user['role'],
                'identifiant' => $user['identifiant']
            ]
        );
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
