<?php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/utils.php';

/*ini_set('display_errors', 0); // important : rien n'est affiché
ini_set('log_errors', 1);
error_reporting(E_ALL);*/

session_start();

var_dump($_SESSION);
exit;

try {
    // -------------------------------------------------------------
    // 1) LIRE LE JSON ENVOYÉ PAR REACT VIA api.js
    // -------------------------------------------------------------
    $raw = file_get_contents("php://input");
    $postData = json_decode($raw, true);

    if (!$postData) {
        envoyerReponse("Erreur : données JSON invalides ou vides.", false);
    }

    // -------------------------------------------------------------
    // 2) EXTRAIRE LES DONNÉES
    // -------------------------------------------------------------
    $data = extraireDonnees($postData);

    // -------------------------------------------------------------
    // 3) VALIDATION DES CHAMPS REQUIS
    // -------------------------------------------------------------
    validerDonnees($data);

    // -------------------------------------------------------------
    // 4) VÉRIFIER QUE L’UTILISATEUR EST CONNECTÉ
    // -------------------------------------------------------------
    $ajoutePar = $_SESSION['user_id'] ?? null;

    if (!$ajoutePar) {
        envoyerReponse("Erreur : utilisateur non authentifié.", false);
    }

    // Connexion DB
    $pdo = getDatabaseConnection('temp');

    // -------------------------------------------------------------
    // 5) INSERER OU COMPARER LA SESSION DE COURS
    // -------------------------------------------------------------
    insererSessionCours($pdo, $data);

    // -------------------------------------------------------------
    // 6) VÉRIFIER SI L’INSCRIPTION EXISTE JÀ
    // -------------------------------------------------------------
    if (inscriptionExiste($pdo, $data)) {
        $existantes = recupererInscriptionExistante($pdo, $data);
        $champsDifferents = donneesDifferentes($existantes, $data);

        if (empty($champsDifferents)) {
            envoyerReponse("Aucune modification nécessaire : données déjà présentes.", false);
        }

        envoyerReponse(
            "⚠️ Conflit détecté : les champs " . implode(', ', $champsDifferents) .
            " ne correspondent pas avec l'inscription existante.",
            false
        );
    }

    // -------------------------------------------------------------
    // 7) INSÉRER L’INSCRIPTION
    // -------------------------------------------------------------
    insererInscriptionCours($pdo, $data, $ajoutePar);

    envoyerReponse("Inscription enregistrée avec succès.");

} catch (PDOException $e) {
    envoyerReponse("Erreur PDO : " . $e->getMessage(), false);
} catch (Exception $e) {
    envoyerReponse("Erreur serveur : " . $e->getMessage(), false);
}




// ============================================================================
//                 FONCTIONS UTILISÉES DANS LE SCRIPt
// ============================================================================

function extraireDonnees(array $post): array
{
    return [
        'matricule'        => $post['matricule'] ?? null,
        'nom'              => $post['nom'] ?? null,
        'prenoms'          => $post['prenoms'] ?? null,
        'sigleCours'       => $post['sigleCours'] ?? null,
        'intituleCours'    => $post['intituleCours'] ?? null,
        'idEnseignant'     => $post['idEnseignant'] ?? null,
        'creditCours'      => $post['creditCours'] ?? null,
        'codeProgramme'    => $post['codeProgramme'] ?? null,
        'anneeAcademique'  => $post['anneeAcademique'] ?? null,
        'semestre'         => $post['semestre'] ?? null,
        'notes'            => $post['notes'] ?? null,
        'noteRattrapage'   => $post['noteRattrapage'] !== '' ? $post['noteRattrapage'] : null,
        'moyenneFinale'    => $post['moyenneFinale'] !== '' ? $post['moyenneFinale'] : null,
        'appreciations'    => $post['appreciations'] ?? null,
        'sanction'         => $post['sanction'] ?? null,
        'dateInscription'  => date('Y-m-d'),
    ];
}


function validerDonnees(array $data): void
{
    $requis = ['intituleCours', 'codeProgramme', 'anneeAcademique', 'semestre', 'sanction'];

    foreach ($requis as $champ) {
        if (empty($data[$champ])) {
            envoyerReponse("Erreur : champ '$champ' manquant.", false);
        }
    }
}


function insererSessionCours(PDO $pdo, array $data): void
{
    $sqlCheck = "SELECT intituleCours, idEnseignant, creditCours 
                 FROM historiquesessioncours 
                 WHERE sigleCours = :sigleCours
                   AND codeProgramme = :codeProgramme
                   AND anneeAcademique = :anneeAcademique
                   AND semestre = :semestre
                 LIMIT 1";

    $stmt = $pdo->prepare($sqlCheck);
    $stmt->execute([
        ':sigleCours' => $data['sigleCours'],
        ':codeProgramme' => $data['codeProgramme'],
        ':anneeAcademique' => $data['anneeAcademique'],
        ':semestre' => $data['semestre'],
    ]);

    $existante = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existante) {
        $conflit = [];
        if ($existante['intituleCours'] !== $data['intituleCours']) {
            $conflit[] = "intitulé du cours";
        }
        if ($existante['idEnseignant'] !== $data['idEnseignant']) {
            $conflit[] = "enseignant";
        }
        if ((int)$existante['creditCours'] !== (int)$data['creditCours']) {
            $conflit[] = "crédit du cours";
        }

        if (!empty($conflit)) {
            envoyerReponse("⚠️ Conflit détecté dans l'historique de session de cours : " . implode(', ', $conflit) . " ne correspond(ent) pas.", false);
        }

        return; // rien à insérer
    }

    $sqlInsert = "INSERT INTO historiquesessioncours 
                  (sigleCours, intituleCours, idEnseignant, creditCours, codeProgramme, anneeAcademique, semestre)
                  VALUES
                  (:sigleCours, :intituleCours, :idEnseignant, :creditCours, :codeProgramme, :anneeAcademique, :semestre)";

    $stmt = $pdo->prepare($sqlInsert);
    $stmt->execute([
        ':sigleCours' => $data['sigleCours'],
        ':intituleCours' => $data['intituleCours'],
        ':idEnseignant' => $data['idEnseignant'],
        ':creditCours' => $data['creditCours'],
        ':codeProgramme' => $data['codeProgramme'],
        ':anneeAcademique' => $data['anneeAcademique'],
        ':semestre' => $data['semestre'],
    ]);
}


function inscriptionExiste(PDO $pdo, array $data): bool
{
    $sql = "SELECT 1 FROM inscriptionsessioncours 
            WHERE (matricule = :matricule OR (nom = :nom AND prenoms = :prenoms))
            AND intituleCours = :intituleCours
            AND codeProgramme = :codeProgramme
            AND anneeAcademique = :anneeAcademique
            AND semestre = :semestre
            LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':matricule' => $data['matricule'],
        ':nom' => $data['nom'],
        ':prenoms' => $data['prenoms'],
        ':intituleCours' => $data['intituleCours'],
        ':codeProgramme' => $data['codeProgramme'],
        ':anneeAcademique' => $data['anneeAcademique'],
        ':semestre' => $data['semestre'],
    ]);

    return (bool)$stmt->fetchColumn();
}


function recupererInscriptionExistante(PDO $pdo, array $data): array
{
    $sql = "SELECT notes, noteRattrapage, moyenneFinale, appreciations, sanction 
            FROM inscriptionsessioncours 
            WHERE (matricule = :matricule OR (nom = :nom AND prenoms = :prenoms))
            AND intituleCours = :intituleCours
            AND codeProgramme = :codeProgramme
            AND anneeAcademique = :anneeAcademique
            AND semestre = :semestre";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':matricule' => $data['matricule'],
        ':nom' => $data['nom'],
        ':prenoms' => $data['prenoms'],
        ':intituleCours' => $data['intituleCours'],
        ':codeProgramme' => $data['codeProgramme'],
        ':anneeAcademique' => $data['anneeAcademique'],
        ':semestre' => $data['semestre'],
    ]);

    return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
}


function donneesDifferentes(array $existantes, array $nouvelles): array
{
    $differences = [];

    if ($existantes['notes'] !== $nouvelles['notes']) {
        $differences[] = 'notes';
    }
    if ((float)$existantes['noteRattrapage'] !== (float)$nouvelles['noteRattrapage']) {
        $differences[] = 'note de rattrapage';
    }
    if ((float)$existantes['moyenneFinale'] !== (float)$nouvelles['moyenneFinale']) {
        $differences[] = 'moyenne finale';
    }
    if (trim((string)$existantes['appreciations']) !== trim((string)$nouvelles['appreciations'])) {
        $differences[] = 'appréciations';
    }
    if ((string)$existantes['sanction'] !== (string)$nouvelles['sanction']) {
        $differences[] = 'sanction';
    }

    return $differences;
}


function insererInscriptionCours(PDO $pdo, array $data, string $ajoutePar): void
{
    $sql = "INSERT INTO inscriptionsessioncours 
            (matricule, nom, prenoms, intituleCours, codeProgramme, anneeAcademique, semestre,
             notes, noteRattrapage, moyenneFinale, appreciations, sanction, dateInscription, ajoutePar)
            VALUES 
            (:matricule, :nom, :prenoms, :intituleCours, :codeProgramme, :anneeAcademique, :semestre,
             :notes, :noteRattrapage, :moyenneFinale, :appreciations, :sanction, :dateInscription, :ajoutePar)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':matricule'       => $data['matricule'],
        ':nom'             => $data['nom'],
        ':prenoms'         => $data['prenoms'],
        ':intituleCours'   => $data['intituleCours'],
        ':codeProgramme'   => $data['codeProgramme'],
        ':anneeAcademique' => $data['anneeAcademique'],
        ':semestre'        => $data['semestre'],
        ':notes'           => $data['notes'],
        ':noteRattrapage'  => $data['noteRattrapage'],
        ':moyenneFinale'   => $data['moyenneFinale'],
        ':appreciations'   => $data['appreciations'],
        ':sanction'        => $data['sanction'],
        ':dateInscription' => $data['dateInscription'],
        ':ajoutePar'       => $ajoutePar,
    ]);
}

?>
