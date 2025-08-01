<?php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

// Verificar autenticación
if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

// Obtener datos del POST
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['grupo_id']) || !isset($input['mensaje'])) {
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

$grupo_id = $input['grupo_id'];
$mensaje = trim($input['mensaje']);
$usuario_id = $_SESSION['usuario_id'];

if (empty($mensaje)) {
    echo json_encode(['error' => 'El mensaje no puede estar vacío']);
    exit;
}

try {
    // Verificar que el usuario sea miembro del grupo
    $stmt = $pdo->prepare("
        SELECT 1 FROM grupo_miembros 
        WHERE grupo_id = ? AND usuario_id = ?
    ");
    $stmt->execute([$grupo_id, $usuario_id]);
    
    if (!$stmt->fetch()) {
        echo json_encode(['error' => 'No tienes acceso a este grupo']);
        exit;
    }
    
    // Insertar el mensaje
    $stmt = $pdo->prepare("
        INSERT INTO grupo_mensajes (grupo_id, usuario_id, mensaje, fecha_envio) 
        VALUES (?, ?, ?, NOW())
    ");
    $stmt->execute([$grupo_id, $usuario_id, $mensaje]);
    
    echo json_encode(['success' => true]);
    
} catch (PDOException $e) {
    echo json_encode(['error' => 'Error al enviar mensaje: ' . $e->getMessage()]);
}
?>
