<?php
session_start();
if (!isset($_SESSION['usuario'])) {
    die("Acceso denegado. <a href='login.php'>Inicia sesión</a>");
}
?>