<?php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

// Verificar autenticación
if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

if (!isset($_GET['grupo'])) {
    echo json_encode(['error' => 'ID de grupo requerido']);
    exit;
}

$grupo_id = $_GET['grupo'];
$usuario_id = $_SESSION['usuario_id'];

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
    
    // Obtener mensajes del grupo
    $stmt = $pdo->prepare("
        SELECT gm.id, gm.mensaje, gm.fecha_envio, gm.usuario_id,
               u.usuario, u.codigo
        FROM grupo_mensajes gm
        JOIN usuarios u ON gm.usuario_id = u.id
        WHERE gm.grupo_id = ?
        ORDER BY gm.fecha_envio ASC
        LIMIT 100
    ");
    $stmt->execute([$grupo_id]);
    $mensajes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($mensajes);
    
} catch (PDOException $e) {
    echo json_encode(['error' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>
