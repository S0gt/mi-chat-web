-- Crear tabla de reacciones
CREATE TABLE IF NOT EXISTS mensaje_reacciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mensaje_id INT NOT NULL,
    usuario_id INT NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    fecha_reaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_reaction (mensaje_id, usuario_id, emoji)
);
