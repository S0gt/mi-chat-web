<?php
require 'config.php';

try {
    // Mostrar estructura de la tabla usuarios
    $stmt = $pdo->query("DESCRIBE usuarios");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Estructura de la tabla 'usuarios':\n";
    echo "Column\t\tType\t\tNull\tKey\tDefault\tExtra\n";
    echo "------\t\t----\t\t----\t---\t-------\t-----\n";
    
    foreach ($columns as $column) {
        echo $column['Field'] . "\t\t" . 
             $column['Type'] . "\t\t" . 
             $column['Null'] . "\t" . 
             $column['Key'] . "\t" . 
             $column['Default'] . "\t" . 
             $column['Extra'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
