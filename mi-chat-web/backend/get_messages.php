<?php
session_start();
require 'config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['usuario'])) {
    echo json_encode(['success' => false, 'error' => 'No autenticado']);
    exit;
}

// Obtener el parámetro del usuario (puede ser 'amigo' o 'usuario_id')
$amigoId = $_GET['amigo'] ?? $_GET['usuario_id'] ?? null;

if (!$amigoId) {
    echo json_encode(['success' => false, 'error' => 'ID de usuario requerido']);
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

    $since = isset($_GET['since']) ? intval($_GET['since']) : 0;

    // Construir consulta base
    $sql = "
        SELECT 
            m.id,
            m.de_id as emisor_id,
            m.para_id as receptor_id,
            m.texto as mensaje,
            m.fecha as fecha_envio,
            m.estado,
            u.usuario as emisor_nombre
        FROM mensajes m
        JOIN usuarios u ON m.de_id = u.id
        WHERE (m.de_id = ? AND m.para_id = ?) OR (m.de_id = ? AND m.para_id = ?)
    ";

    $params = [$yo['id'], $amigoId, $amigoId, $yo['id']];

    // Si se especifica 'since', solo obtener mensajes más recientes
    if ($since > 0) {
        $sql .= " AND m.id > ?";
        $params[] = $since;
    }

    $sql .= " ORDER BY m.fecha ASC";

    // Obtiene los mensajes entre ambos usuarios
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $mensajes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Marcar mensajes como leídos
    $updateStmt = $pdo->prepare("
        UPDATE mensajes 
        SET estado = 'leido', fecha_leido = NOW() 
        WHERE para_id = ? AND de_id = ? AND estado != 'leido'
    ");
    $updateStmt->execute([$yo['id'], $amigoId]);

    echo json_encode([
        'success' => true,
        'mensajes' => $mensajes,
        'timestamp' => time(),
        'count' => count($mensajes),
        'since' => $since
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Error de base de datos: ' . $e->getMessage()
    ]);
}
?>

// Si no se especifica 'since', devolver solo los mensajes (compatibilidad)
if ($since == 0) {
    echo json_encode($mensajes);
} else {
    echo json_encode($mensajes);
}
?>
