-- Script de actualización de base de datos para todas las mejoras
-- Ejecutar este script para agregar todas las nuevas funcionalidades

-- Actualizar tabla de mensajes para estados
ALTER TABLE mensajes ADD COLUMN estado ENUM('enviado', 'entregado', 'leido') DEFAULT 'enviado';
ALTER TABLE mensajes ADD COLUMN fecha_entregado TIMESTAMP NULL;
ALTER TABLE mensajes ADD COLUMN fecha_leido TIMESTAMP NULL;
ALTER TABLE mensajes ADD COLUMN editado BOOLEAN DEFAULT FALSE;
ALTER TABLE mensajes ADD COLUMN fecha_edicion TIMESTAMP NULL;
ALTER TABLE mensajes ADD COLUMN respondiendo_a INT NULL;
ALTER TABLE mensajes ADD COLUMN tipo_mensaje ENUM('texto', 'archivo', 'imagen', 'video', 'audio') DEFAULT 'texto';
ALTER TABLE mensajes ADD COLUMN archivo_url VARCHAR(500) NULL;
ALTER TABLE mensajes ADD COLUMN archivo_nombre VARCHAR(255) NULL;
ALTER TABLE mensajes ADD COLUMN archivo_tamaño INT NULL;

-- Tabla de reacciones a mensajes
CREATE TABLE IF NOT EXISTS mensaje_reacciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mensaje_id INT NOT NULL,
    usuario_id INT NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    fecha_reaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mensaje_id) REFERENCES mensajes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_reaction (mensaje_id, usuario_id, emoji)
);

-- Tabla de estados/historias temporales
CREATE TABLE IF NOT EXISTS estados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo ENUM('texto', 'imagen', 'video') DEFAULT 'texto',
    contenido TEXT,
    archivo_url VARCHAR(500),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 24 HOUR),
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de visualizaciones de estados
CREATE TABLE IF NOT EXISTS estado_vistas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estado_id INT NOT NULL,
    usuario_id INT NOT NULL,
    fecha_vista TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estado_id) REFERENCES estados(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_view (estado_id, usuario_id)
);

-- Tabla de presencia/última conexión
CREATE TABLE IF NOT EXISTS usuarios_presencia (
    usuario_id INT PRIMARY KEY,
    estado ENUM('online', 'offline', 'ausente') DEFAULT 'offline',
    ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    escribiendo_a INT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (escribiendo_a) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla de configuraciones de usuario
CREATE TABLE IF NOT EXISTS usuarios_config (
    usuario_id INT PRIMARY KEY,
    tema ENUM('claro', 'oscuro', 'auto') DEFAULT 'oscuro',
    notificaciones BOOLEAN DEFAULT TRUE,
    sonidos BOOLEAN DEFAULT TRUE,
    ultima_vez_visto ENUM('todos', 'contactos', 'nadie') DEFAULT 'todos',
    avatar_url VARCHAR(500),
    descripcion TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de usuarios bloqueados
CREATE TABLE IF NOT EXISTS usuarios_bloqueados (
    bloqueador_id INT NOT NULL,
    bloqueado_id INT NOT NULL,
    fecha_bloqueo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bloqueador_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (bloqueado_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    PRIMARY KEY (bloqueador_id, bloqueado_id)
);

-- Tabla de llamadas
CREATE TABLE IF NOT EXISTS llamadas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    caller_id INT NOT NULL,
    receiver_id INT NOT NULL,
    tipo ENUM('audio', 'video') NOT NULL,
    estado ENUM('llamando', 'contestada', 'rechazada', 'perdida', 'finalizada') DEFAULT 'llamando',
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP NULL,
    duracion INT DEFAULT 0,
    FOREIGN KEY (caller_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Actualizar tabla de grupos para avatares y descripciones
ALTER TABLE grupos ADD COLUMN descripcion TEXT;
ALTER TABLE grupos ADD COLUMN avatar_url VARCHAR(500);

-- Tabla de administradores de grupos
ALTER TABLE grupo_miembros ADD COLUMN es_admin BOOLEAN DEFAULT FALSE;

-- Tabla de mensajes destacados
CREATE TABLE IF NOT EXISTS mensajes_destacados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mensaje_id INT NOT NULL,
    usuario_id INT NOT NULL,
    fecha_destacado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mensaje_id) REFERENCES mensajes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_starred (mensaje_id, usuario_id)
);

-- Índices para optimización
CREATE INDEX idx_mensajes_estado ON mensajes(estado);
CREATE INDEX idx_mensajes_fecha ON mensajes(fecha);
CREATE INDEX idx_usuarios_presencia_estado ON usuarios_presencia(estado);
CREATE INDEX idx_estados_usuario ON estados(usuario_id);
CREATE INDEX idx_estados_activo ON estados(activo);

-- Insertar configuraciones por defecto para usuarios existentes
INSERT IGNORE INTO usuarios_config (usuario_id) 
SELECT id FROM usuarios;

INSERT IGNORE INTO usuarios_presencia (usuario_id) 
SELECT id FROM usuarios;
