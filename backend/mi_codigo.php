<?php
session_start();
require 'config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['usuario'])) {
    echo json_encode(['codigo' => null, 'usuario' => null, 'avatar' => null]);
    exit;
}

$stmt = $pdo->prepare("SELECT usuario, codigo, avatar FROM usuarios WHERE usuario = ?");
$stmt->execute([$_SESSION['usuario']]);
$row = $stmt->fetch();

echo json_encode([
    'usuario' => $row ? $row['usuario'] : null,
    'codigo' => $row ? $row['codigo'] : null,
    'avatar' => $row ? $row['avatar'] : null
]);
?>