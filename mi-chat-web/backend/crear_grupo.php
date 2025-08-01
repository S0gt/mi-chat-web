<?php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

// Verificar si el usuario está logueado
if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

// Obtener datos del POST
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['nombre']) || !isset($input['miembros']) || !is_array($input['miembros'])) {
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

$nombre_grupo = trim($input['nombre']);
$miembros = $input['miembros'];
$creador_id = $_SESSION['usuario_id'];

if (empty($nombre_grupo)) {
    echo json_encode(['error' => 'El nombre del grupo es requerido']);
    exit;
}

if (count($miembros) < 1) {
    echo json_encode(['error' => 'Debe seleccionar al menos un miembro']);
    exit;
}

try {
    // Verificar que todos los miembros sean amigos del usuario actual
    $placeholders = str_repeat('?,', count($miembros) - 1) . '?';
    $stmt = $pdo->prepare("
        SELECT usuario_id 
        FROM amigos 
        WHERE (usuario_id = ? AND amigo_id IN ($placeholders)) 
           OR (amigo_id = ? AND usuario_id IN ($placeholders))
    ");
    
    $params = array_merge([$creador_id], $miembros, [$creador_id], $miembros);
    $stmt->execute($params);
    $amigos_validos = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Verificar que todos los miembros seleccionados sean amigos
    foreach ($miembros as $miembro_id) {
        if (!in_array($miembro_id, $amigos_validos)) {
            echo json_encode(['error' => 'Solo puedes agregar a tus amigos al grupo']);
            exit;
        }
    }
    
    $pdo->beginTransaction();
    
    // Crear el grupo
    $stmt = $pdo->prepare("INSERT INTO grupos (nombre, creador_id, fecha_creacion) VALUES (?, ?, NOW())");
    $stmt->execute([$nombre_grupo, $creador_id]);
    $grupo_id = $pdo->lastInsertId();
    
    // Agregar el creador como miembro del grupo
    $stmt = $pdo->prepare("INSERT INTO grupo_miembros (grupo_id, usuario_id, fecha_union) VALUES (?, ?, NOW())");
    $stmt->execute([$grupo_id, $creador_id]);
    
    // Agregar los miembros seleccionados al grupo
    foreach ($miembros as $miembro_id) {
        $stmt->execute([$grupo_id, $miembro_id]);
    }
    
    $pdo->commit();
    
    echo json_encode(['success' => true, 'grupo_id' => $grupo_id]);
    
} catch (PDOException $e) {
    $pdo->rollBack();
    echo json_encode(['error' => 'Error al crear el grupo: ' . $e->getMessage()]);
}
?>
