<?php
session_start();
require 'config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['usuario'])) {
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

if (!isset($_FILES['avatar'])) {
    echo json_encode(['success' => false, 'error' => 'No se recibió archivo']);
    exit;
}

$archivo = $_FILES['avatar'];
$ext = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
$permitidas = ['jpg', 'jpeg', 'png', 'gif'];
if (!in_array($ext, $permitidas)) {
    echo json_encode(['success' => false, 'error' => 'Formato no permitido']);
    exit;
}

$nombre = uniqid() . '.' . $ext;
$ruta = '../uploads/avatars/' . $nombre;
if (!is_dir('../uploads/avatars')) mkdir('../uploads/avatars', 0777, true);

if (move_uploaded_file($archivo['tmp_name'], $ruta)) {
    $stmt = $pdo->prepare("UPDATE usuarios SET avatar = ? WHERE usuario = ?");
    $stmt->execute([$nombre, $_SESSION['usuario']]);
    echo json_encode(['success' => true, 'avatar' => $nombre]);
} else {
    echo json_encode(['success' => false, 'error' => 'Error al guardar el archivo']);
}
?>