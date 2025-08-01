<?php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

// Solo usuarios autenticados pueden ver la lista
if (!isset($_SESSION['usuario'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

try {
    $usuario_id = $_SESSION['usuario_id'] ?? null;
    if (!$usuario_id) {
        // Obtener el ID del usuario usando el nombre de usuario
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE usuario = ?");
        $stmt->execute([$_SESSION['usuario']]);
        $usuario_data = $stmt->fetch();
        if (!$usuario_data) {
            echo json_encode(['error' => 'Usuario no encontrado']);
            exit;
        }
        $usuario_id = $usuario_data['id'];
        $_SESSION['usuario_id'] = $usuario_id;
    }
    
    $result = [];
    
    // Obtener amigos individuales
    $stmt = $pdo->prepare("
        SELECT u.id, u.usuario, u.codigo, 'user' as tipo
        FROM amigos a
        JOIN usuarios u ON a.amigo_id = u.id
        WHERE a.usuario_id = ?
    ");
    $stmt->execute([$usuario_id]);
    $amigos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($amigos as $amigo) {
        $result[] = $amigo;
    }
    
    // Obtener grupos del usuario (solo si existen las tablas)
    try {
        $stmt = $pdo->prepare("
            SELECT g.id, g.nombre as usuario, g.id as codigo, 'group' as tipo,
                   COUNT(gm.usuario_id) as miembros_count
            FROM grupos g
            JOIN grupo_miembros gm ON g.id = gm.grupo_id
            WHERE g.id IN (
                SELECT grupo_id FROM grupo_miembros WHERE usuario_id = ?
            )
            GROUP BY g.id, g.nombre
            ORDER BY g.fecha_creacion DESC
        ");
        $stmt->execute([$usuario_id]);
        $grupos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($grupos as $grupo) {
            $grupo['usuario'] = $grupo['usuario'] . " (" . $grupo['miembros_count'] . " miembros)";
            $grupo['codigo'] = "GRUPO";
            $result[] = $grupo;
        }
    } catch (PDOException $e) {
        // Si las tablas de grupos no existen, simplemente ignoramos esta parte
        // y continuamos solo con los amigos
    }
    
    echo json_encode($result);
    
} catch (PDOException $e) {
    echo json_encode(['error' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>
