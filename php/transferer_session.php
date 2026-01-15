<?php

// Headers CORS pour les requêtes
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:3000");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Max-Age: 86400");
    exit(0);
}

require_once 'database.php';

try {
    $pdo = getDatabaseConnection('temp');

    // === LIRE LES DONNÉES ENTRANTES ===
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['sessionOriginale']) || !isset($input['nouvelleSession'])) {
        throw new Exception("Données manquantes.");
    }

    $originale = $input['sessionOriginale'];
    $nouvelle = $input['nouvelleSession'];

    // Vérifier les champs obligatoires
    $required = [
        'intituleCours',   
        'anneeAcademique', 
        'semestre',        
        'codeProgramme',   
        'creditCours'      
    ];
    
    foreach ($required as $field) {
        if (!isset($nouvelle[$field]) || $nouvelle[$field] === '' || $nouvelle[$field] === null) {
            throw new Exception("Champ requis manquant ou vide : $field");
        }
    }

    // === DÉMARRER UNE TRANSACTION ===
    $pdo->beginTransaction();

    // === VÉRIFIER LES DOUBLONS ===
    $sqlCheck = "SELECT COUNT(*) FROM historiquesessioncours 
                 WHERE sigleCours = :sigle 
                 AND anneeAcademique = :annee 
                 AND semestre = :semestre
                 AND codeProgramme = :codeProg
                 AND creditCours = :credit
                 AND idEnseignant = :idEns";

    $stmt = $pdo->prepare($sqlCheck);
    $stmt->execute([
        ':sigle' => $nouvelle['sigleCours'] ?? null,
        ':annee' => $nouvelle['anneeAcademique'],
        ':semestre' => $nouvelle['semestre'],
        ':codeProg' => $nouvelle['codeProgramme'],
        ':credit' => (int) $nouvelle['creditCours'],
        ':idEns' => $nouvelle['idEnseignant'] ?? null
    ]);

    if ($stmt->fetchColumn() > 0) {
        throw new Exception("SESSION_EXISTE");
    }

    // === CRÉER LA NOUVELLE SESSION ===
    $sqlInsert = "INSERT INTO historiquesessioncours (
        sigleCours, intituleCours, anneeAcademique, semestre, 
        codeProgramme, creditCours, idEnseignant
    ) VALUES (
        :sigle, :intitule, :annee, :semestre, 
        :codeProg, :credit, :idEns
    )";

    $stmt = $pdo->prepare($sqlInsert);
    $stmt->execute([
        ':sigle' => $nouvelle['sigleCours'] ?? null,         
        ':intitule' => $nouvelle['intituleCours'],           
        ':annee' => $nouvelle['anneeAcademique'],            
        ':semestre' => $nouvelle['semestre'],                
        ':codeProg' => $nouvelle['codeProgramme'],           
        ':credit' => (int) $nouvelle['creditCours'],         
        ':idEns' => $nouvelle['idEnseignant'] ?? null        
    ]);

    $nouvelleSessionId = $pdo->lastInsertId();

    // === COPIER LES INSCRIPTIONS ===
    $sqlCopy = "INSERT INTO inscriptionsessioncours (
        matricule, nom, prenoms,
        intituleCours, codeProgramme,
        anneeAcademique, semestre,
        notes, noteRattrapage, moyenneFinale, appreciations,
        sanction, dateInscription, dateInsertion, ajoutePar
    )
    SELECT
        matricule, nom, prenoms,
        :newIntitule, :newCodeProg,
        :newAnnee, :newSemestre,
        notes, noteRattrapage, moyenneFinale, appreciations,
        sanction, dateInscription, CURRENT_TIMESTAMP, ajoutePar
    FROM inscriptionsessioncours
    WHERE 
        intituleCours = :oldIntitule
        AND anneeAcademique = :oldAnnee
        AND semestre = :oldSemestre
        AND codeProgramme = :oldCodeProg";
    
    $stmt = $pdo->prepare($sqlCopy);
    $stmt->execute([
        ':newIntitule' => $nouvelle['intituleCours'],
        ':newCodeProg' => $nouvelle['codeProgramme'],
        ':newAnnee' => $nouvelle['anneeAcademique'],
        ':newSemestre' => $nouvelle['semestre'],
        ':oldIntitule' => $originale['intituleCours'],
        ':oldAnnee' => $originale['anneeAcademique'],
        ':oldSemestre' => $originale['semestre'],
        ':oldCodeProg' => $originale['codeProgramme']
    ]);

    $nbInscriptions = $stmt->rowCount();

    // === SUPPRIMER L’ANCIENNE SESSION ===
    $sqlDeleteSession = "DELETE FROM historiquesessioncours 
        WHERE 
            sigleCours <=> :oldSigle 
            AND intituleCours = :oldIntitule
            AND anneeAcademique = :oldAnnee 
            AND semestre = :oldSemestre
            AND codeProgramme = :oldCodeProg
            AND creditCours = :oldCredit";

    $stmt = $pdo->prepare($sqlDeleteSession);
    $stmt->execute([
        ':oldSigle' => $originale['sigleCours'] ?? null,
        ':oldIntitule' => $originale['intituleCours'],
        ':oldAnnee' => $originale['anneeAcademique'],
        ':oldSemestre' => $originale['semestre'],
        ':oldCodeProg' => $originale['codeProgramme'],
        ':oldCredit' => (int) $originale['creditCours']
    ]);
    // === 6. COMMIT LA TRANSACTION ===
    $pdo->commit();

    // === 7. RÉPONSE DE SUCCÈS ===
    echo json_encode([
        'success' => true,
        'message' => "Transfert réussi : $nbInscriptions inscriptions migrées.",
        'nouvelleSessionId' => $nouvelleSessionId
    ]);

} catch (Exception $e) {
    // Annuler en cas d’erreur
    if ($pdo) {
        $pdo->rollback();
    }
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}