-- Tablas necesarias para el sistema de grupos

-- Tabla de grupos
CREATE TABLE IF NOT EXISTS grupos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT DEFAULT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    creador_id INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creador_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de miembros de grupos
CREATE TABLE IF NOT EXISTS grupo_miembros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grupo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    fecha_union TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    es_admin BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_member (grupo_id, usuario_id)
);

-- Tabla de mensajes de grupos
CREATE TABLE IF NOT EXISTS grupo_mensajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grupo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    mensaje TEXT NOT NULL,
    tipo_mensaje ENUM('texto', 'archivo', 'imagen') DEFAULT 'texto',
    archivo_url VARCHAR(500) DEFAULT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    editado BOOLEAN DEFAULT FALSE,
    fecha_edicion TIMESTAMP NULL,
    FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Índices para mejor rendimiento
CREATE INDEX idx_grupo_miembros_grupo ON grupo_miembros(grupo_id);
CREATE INDEX idx_grupo_miembros_usuario ON grupo_miembros(usuario_id);
CREATE INDEX idx_grupo_mensajes_grupo ON grupo_mensajes(grupo_id);
CREATE INDEX idx_grupo_mensajes_fecha ON grupo_mensajes(fecha_envio);
