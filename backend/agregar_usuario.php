<?php
session_start();
require 'config.php';

header('Content-Type: application/json');

// Solo acepta peticiones POST con JSON
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

if (!isset($_SESSION['usuario'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autenticado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$usuario = $data['usuario'] ?? '';
$codigo = $data['codigo'] ?? '';

if (!$usuario || !$codigo) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan datos']);
    exit;
}

// Busca el usuario actual
$stmt = $pdo->prepare("SELECT id FROM usuarios WHERE usuario = ?");
$stmt->execute([$_SESSION['usuario']]);
$userActual = $stmt->fetch();

if (!$userActual) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuario actual no encontrado']);
    exit;
}

// Busca el amigo por nombre y código
$stmt = $pdo->prepare("SELECT id FROM usuarios WHERE usuario = ? AND codigo = ?");
$stmt->execute([$usuario, $codigo]);
$amigo = $stmt->fetch();

if (!$amigo) {
    http_response_code(404);
    echo json_encode(['error' => 'Usuario o código incorrecto']);
    exit;
}

// Verifica si ya son amigos
$stmt = $pdo->prepare("SELECT * FROM amigos WHERE usuario_id = ? AND amigo_id = ?");
$stmt->execute([$userActual['id'], $amigo['id']]);
if ($stmt->fetch()) {
    echo json_encode(['error' => 'Ya es tu amigo']);
    exit;
}

// Inserta la relación de amistad (bidireccional)
$stmt = $pdo->prepare("INSERT INTO amigos (usuario_id, amigo_id) VALUES (?, ?), (?, ?)");
$stmt->execute([$userActual['id'], $amigo['id'], $amigo['id'], $userActual['id']]);

echo json_encode(['success' => true]);
?>