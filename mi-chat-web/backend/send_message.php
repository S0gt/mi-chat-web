<?php
session_start();
require 'config.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($_SESSION['usuario'])) {
    echo json_encode(['success' => false, 'error' => 'No autenticado']);
    exit;
}
$para = $data['para'] ?? '';
$texto = $data['texto'] ?? '';

if (!$para || !$texto) {
    echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
    exit;
}

try {
    // Busca el usuario actual
    $stmt = $pdo->prepare("SELECT id, usuario FROM usuarios WHERE usuario = ?");
    $stmt->execute([$_SESSION['usuario']]);
    $yo = $stmt->fetch();

    if (!$yo) {
        echo json_encode(['success' => false, 'error' => 'Usuario no encontrado']);
        exit;
    }

    // Verificar que el receptor existe
    $stmt = $pdo->prepare("SELECT id, usuario FROM usuarios WHERE id = ?");
    $stmt->execute([$para]);
    $receptor = $stmt->fetch();

    if (!$receptor) {
        echo json_encode(['success' => false, 'error' => 'Usuario receptor no encontrado']);
        exit;
    }

    // Guarda el mensaje con estado
    $stmt = $pdo->prepare("INSERT INTO mensajes (de_id, para_id, texto, fecha, estado, fecha_entregado) VALUES (?, ?, ?, NOW(), 'entregado', NOW())");
    $stmt->execute([$yo['id'], $para, $texto]);

    $mensaje_id = $pdo->lastInsertId();

    // Preparar datos para el WebSocket
    $mensajeWS = [
        'tipo' => 'mensaje',
        'id' => $mensaje_id,
        'emisor_id' => $yo['id'],
        'emisor_nombre' => $yo['usuario'],
        'receptor_id' => $para,
        'mensaje' => $texto,
        'fecha_envio' => date('Y-m-d H:i:s'),
        'estado' => 'entregado'
    ];

    // Log para debugging
    error_log("Mensaje enviado: " . json_encode($mensajeWS));

    echo json_encode([
        'success' => true, 
        'mensaje_id' => $mensaje_id,
        'estado' => 'entregado',
        'fecha' => date('Y-m-d H:i:s'),
        'emisor' => $yo['usuario'],
        'receptor' => $receptor['usuario']
    ]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>
