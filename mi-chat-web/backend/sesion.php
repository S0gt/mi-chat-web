<?php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

if (isset($_SESSION['usuario'])) {
    // Si no tenemos el usuario_id en la sesión, lo obtenemos de la base de datos
    if (!isset($_SESSION['usuario_id'])) {
        try {
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE usuario = ?");
            $stmt->execute([$_SESSION['usuario']]);
            $userData = $stmt->fetch();
            if ($userData) {
                $_SESSION['usuario_id'] = $userData['id'];
            }
        } catch (PDOException $e) {
            // Si hay error, simplemente continuamos sin el ID
        }
    }
    
    echo json_encode([
        'logueado' => true,
        'usuario_id' => $_SESSION['usuario_id'] ?? null,
        'usuario' => $_SESSION['usuario']
    ]);
} else {
    echo json_encode(['logueado' => false]);
}
?>