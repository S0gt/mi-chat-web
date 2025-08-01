<?php
require_once 'config.php';
require_once 'sesion.php';

header('Content-Type: application/json');

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$metodo = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

try {
    switch ($metodo) {
        case 'POST':
            iniciarLlamada($input);
            break;
        case 'PUT':
            actualizarLlamada($input);
            break;
        case 'GET':
            obtenerLlamadas();
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método no permitido']);
    }
} catch (Exception $e) {
    error_log("Error en llamadas.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor']);
}

function iniciarLlamada($data) {
    global $pdo;
    
    $usuario_id = $_SESSION['usuario_id'];
    $destinatario_id = $data['destinatario_id'] ?? null;
    $tipo = $data['tipo'] ?? 'audio'; // audio o video
    
    if (!$destinatario_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Destinatario requerido']);
        return;
    }
    
    // Verificar que el destinatario existe y es amigo
    $stmt = $pdo->prepare("
        SELECT u.id, u.usuario 
        FROM usuarios u 
        INNER JOIN amigos a ON (
            (a.usuario_id = ? AND a.amigo_id = u.id) OR 
            (a.usuario_id = u.id AND a.amigo_id = ?)
        )
        WHERE u.id = ? AND a.estado = 'aceptado'
    ");
    $stmt->execute([$usuario_id, $usuario_id, $destinatario_id]);
    $destinatario = $stmt->fetch();
    
    if (!$destinatario) {
        http_response_code(404);
        echo json_encode(['error' => 'Usuario no encontrado o no es tu amigo']);
        return;
    }
    
    // Crear registro de llamada
    $stmt = $pdo->prepare("
        INSERT INTO llamadas (iniciador_id, receptor_id, tipo, estado, fecha_inicio) 
        VALUES (?, ?, ?, 'iniciando', NOW())
    ");
    $stmt->execute([$usuario_id, $destinatario_id, $tipo]);
    
    $llamada_id = $pdo->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'llamada_id' => $llamada_id,
        'destinatario' => $destinatario['usuario'],
        'tipo' => $tipo
    ]);
}

function actualizarLlamada($data) {
    global $pdo;
    
    $usuario_id = $_SESSION['usuario_id'];
    $llamada_id = $data['llamada_id'] ?? null;
    $estado = $data['estado'] ?? null;
    
    if (!$llamada_id || !$estado) {
        http_response_code(400);
        echo json_encode(['error' => 'Datos incompletos']);
        return;
    }
    
    // Verificar que el usuario participa en la llamada
    $stmt = $pdo->prepare("
        SELECT * FROM llamadas 
        WHERE id = ? AND (iniciador_id = ? OR receptor_id = ?)
    ");
    $stmt->execute([$llamada_id, $usuario_id, $usuario_id]);
    $llamada = $stmt->fetch();
    
    if (!$llamada) {
        http_response_code(404);
        echo json_encode(['error' => 'Llamada no encontrada']);
        return;
    }
    
    $campos_actualizar = ['estado = ?'];
    $valores = [$estado];
    
    // Estados posibles: iniciando, sonando, conectado, finalizado, rechazado
    switch ($estado) {
        case 'conectado':
            $campos_actualizar[] = 'fecha_conexion = NOW()';
            break;
        case 'finalizado':
        case 'rechazado':
            $campos_actualizar[] = 'fecha_fin = NOW()';
            if ($llamada['fecha_conexion']) {
                // Calcular duración si hubo conexión
                $campos_actualizar[] = 'duracion = TIMESTAMPDIFF(SECOND, fecha_conexion, NOW())';
            }
            break;
    }
    
    $valores[] = $llamada_id;
    
    $sql = "UPDATE llamadas SET " . implode(', ', $campos_actualizar) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($valores);
    
    echo json_encode([
        'success' => true,
        'estado' => $estado
    ]);
}

function obtenerLlamadas() {
    global $pdo;
    
    $usuario_id = $_SESSION['usuario_id'];
    $limite = $_GET['limite'] ?? 50;
    
    $stmt = $pdo->prepare("
        SELECT 
            l.*,
            u1.usuario as iniciador,
            u2.usuario as receptor,
            CASE 
                WHEN l.iniciador_id = ? THEN u2.usuario
                ELSE u1.usuario
            END as contacto,
            CASE 
                WHEN l.iniciador_id = ? THEN 'saliente'
                ELSE 'entrante'
            END as direccion
        FROM llamadas l
        INNER JOIN usuarios u1 ON l.iniciador_id = u1.id
        INNER JOIN usuarios u2 ON l.receptor_id = u2.id
        WHERE l.iniciador_id = ? OR l.receptor_id = ?
        ORDER BY l.fecha_inicio DESC
        LIMIT ?
    ");
    
    $stmt->execute([
        $usuario_id, $usuario_id, 
        $usuario_id, $usuario_id, 
        $limite
    ]);
    
    $llamadas = $stmt->fetchAll();
    
    echo json_encode($llamadas);
}
?>
