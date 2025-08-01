<?php
$host = 'localhost:3307';
$db   = 'mi_chat'; // Nombre correcto de la base de datos
$user = 'root';            // Cambia esto por tu usuario de MySQL
$pass = '';                // Cambia esto por tu contraseña de MySQL
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo "Error de conexión a la base de datos: " . $e->getMessage();
    exit;
}
?>