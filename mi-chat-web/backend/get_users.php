<?php
session_start();
require_once 'config.php';

// Solo usuarios autenticados pueden ver la lista
if (!isset($_SESSION['usuario'])) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT u.id, u.usuario, u.codigo
        FROM amigos a
        JOIN usuarios u ON a.amigo_id = u.id
        WHERE a.usuario_id = (
            SELECT id FROM usuarios WHERE usuario = ?
        )
    ");
    $stmt->execute([$_SESSION['usuario']]);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'usuarios' => $users
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener usuarios: ' . $e->getMessage()
    ]);
}
?>