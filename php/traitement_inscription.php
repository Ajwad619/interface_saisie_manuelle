<?php

    header("Access-Control-Allow-Origin: http://localhost:3000"); // ✅ origine exacte
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Credentials: true");
    
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/utils.php';
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
session_start();
try {
    $pdo = getDatabaseConnection('temp');
    $data = extraireDonnees($_POST);
    validerDonnees($data);
    $ajoutePar = $_SESSION['user_id'];
    if (!isset($ajoutePar)) {
        envoyerReponse("Erreur : utilisateur non authentifié.", false);
    }
    insererSessionCours($pdo, $data);

    // if (inscriptionExiste($pdo, $data)) {
    //     $existantes = recupererInscriptionExistante($pdo, $data);
    //     if (donneesIdentiques($existantes, $data)) {
    //         envoyerReponse("Aucune modification nécessaire : données déjà présentes.", false);
    //     }
    //     envoyerReponse("⚠️ Conflit détecté : des données différentes existent déjà pour l'inscription au cours de cet étudiant.", false);
    // }
    if (inscriptionExiste($pdo, $data)) {
        $existantes = recupererInscriptionExistante($pdo, $data);
        $champsDifferents = donneesDifferentes($existantes, $data);

        if (empty($champsDifferents)) {
            envoyerReponse("Aucune modification nécessaire : données déjà présentes.", false);
        }

        envoyerReponse("⚠️ Conflit détecté : les champs " . implode(', ', $champsDifferents) . " ne correspondent pas avec l'inscription existante.", false);
    }


    insererInscriptionCours($pdo, $data, $ajoutePar);
    envoyerReponse("Inscription enregistrée avec succès.");
} catch (PDOException $e) {
    envoyerReponse("Erreur PDO : " . $e->getMessage(), false);
} catch (Exception $e) {
    envoyerReponse("Erreur serveur : " . $e->getMessage(), false);
}

function extraireDonnees(array $post): array
{
    return [
        'matricule' => $post['matricule'] ?? null,
        'nom' => $post['nom'] ?? null,
        'prenoms' => $post['prenoms'] ?? null,
        'sigleCours' => $post['sigleCours'] ?? null,
        'intituleCours' => $post['intituleCours'] ?? null,
        'idEnseignant' => $post['idEnseignant'] ?? null,
        'creditCours' => $post['creditCours'] ?? null,
        'codeProgramme' => $post['codeProgramme'] ?? null,
        'anneeAcademique' => $post['anneeAcademique'] ?? null,
        'semestre' => $post['semestre'] ?? null,
        'notes' => $post['notes'] ?? null,
        'noteRattrapage' => isset($post['noteRattrapage']) && $post['noteRattrapage'] !== '' ? $post['noteRattrapage'] : null,
        'moyenneFinale' => isset($post['moyenneFinale']) && $post['moyenneFinale'] !== '' ? $post['moyenneFinale'] : null,
        'appreciations' => $post['appreciations'] ?? null,
        'sanction' => $post['sanction'] ?? null,
        'dateInscription' => date('Y-m-d'),
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
        // Comparer les champs critiques
        $conflit = false;
        $detailsConflit = [];

        if ($existante['intituleCours'] !== $data['intituleCours']) {
            $conflit = true;
            $detailsConflit[] = "intitulé du cours";
        }
        if ($existante['idEnseignant'] !== $data['idEnseignant']) {
            $conflit = true;
            $detailsConflit[] = "enseignant";
        }
        if ((int) $existante['creditCours'] !== (int) $data['creditCours']) {
            $conflit = true;
            $detailsConflit[] = "crédit du cours";
        }

        if ($conflit) {
            envoyerReponse("⚠️ Conflit détecté dans l'historique de session de cours : " . implode(', ', $detailsConflit) . " ne correspond(ent) pas.", false);
        }

        // Sinon, pas de conflit => on ne fait rien (déjà présent)
        return;
    }

    // Insertion car aucune ligne existante
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

    return (bool) $stmt->fetchColumn();
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

// function donneesIdentiques(array $existantes, array $nouvelles): bool
// {
//     $comparaisons = [
//         'notes' => $existantes['notes'] === $nouvelles['notes'],
//         'noteRattrapage' => $existantes['noteRattrapage'] === $nouvelles['noteRattrapage'],
//         'moyenneFinale' => (float) $existantes['moyenneFinale'] === (float) $nouvelles['moyenneFinale'],
//         'appreciations' => trim((string) $existantes['appreciations']) === trim((string) $nouvelles['appreciations']),
//         'sanction' => (string) $existantes['sanction'] === (string) $nouvelles['sanction'],
//     ];

//     foreach ($comparaisons as $champ => $identique) {
//         error_log("Comparaison $champ : existant = " . var_export($existantes[$champ], true) .
//             " | nouveau = " . var_export($nouvelles[$champ], true) .
//             " | identiques = " . ($identique ? "oui" : "non"));
//     }

//     return !in_array(false, $comparaisons, true);
// }

function donneesDifferentes(array $existantes, array $nouvelles): array
{
    $differences = [];

    if ($existantes['notes'] !== $nouvelles['notes']) {
        $differences[] = 'notes';
    }

    if ((float) $existantes['noteRattrapage'] !== (float) $nouvelles['noteRattrapage']) {
        $differences[] = 'note de rattrapage';
    }

    if ((float) $existantes['moyenneFinale'] !== (float) $nouvelles['moyenneFinale']) {
        $differences[] = 'moyenne finale';
    }

    if (trim((string) $existantes['appreciations']) !== trim((string) $nouvelles['appreciations'])) {
        $differences[] = 'appréciations';
    }

    if ((string) $existantes['sanction'] !== (string) $nouvelles['sanction']) {
        $differences[] = 'sanction';
    }

    foreach (['notes', 'noteRattrapage', 'moyenneFinale', 'appreciations', 'sanction'] as $champ) {
        error_log("Comparaison $champ : existant = " . var_export($existantes[$champ], true) .
            " | nouveau = " . var_export($nouvelles[$champ], true) .
            " | identiques = " . (!in_array($champ, $differences) ? "oui" : "non"));
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

    $pdo->prepare($sql)->execute([
        ':matricule' => $data['matricule'],
        ':nom' => $data['nom'],
        ':prenoms' => $data['prenoms'],
        ':intituleCours' => $data['intituleCours'],
        ':codeProgramme' => $data['codeProgramme'],
        ':anneeAcademique' => $data['anneeAcademique'],
        ':semestre' => $data['semestre'],
        ':notes' => $data['notes'],
        ':noteRattrapage' => $data['noteRattrapage'],
        ':moyenneFinale' => $data['moyenneFinale'],
        ':appreciations' => $data['appreciations'],
        ':sanction' => $data['sanction'],
        ':dateInscription' => $data['dateInscription'],
        ':ajoutePar' => $ajoutePar
    ]);
}
