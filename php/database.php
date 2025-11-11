<?php
// config/database.php

$host     = '127.0.0.1';
$db_temp  = 'dataFilter';
$db_prod  = 'prod';
$user     = 'root';
$password = 'Root@123';

try {
    // Connexion PDO sans base sélectionnée par défaut
    $dsn = "mysql:host=$host;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    die("Erreur de connexion à la base de données : " . $e->getMessage());
}

/**
 * Fonction pour obtenir une connexion à la base souhaitée
 * @param string $dbName Nom de la base de données ('temp' ou 'prod')
 * @return PDO
 */
function getDatabaseConnection(string $dbName = 'temp'): PDO
{
    global $host, $user, $password, $db_temp, $db_prod;

    $database = $dbName === 'prod' ? $db_prod : $db_temp;

    $dsn = "mysql:host=$host;dbname=$database;charset=utf8mb4";
    try {
        $pdo = new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        die("Erreur de connexion à la base $database : " . $e->getMessage());
    }
}
