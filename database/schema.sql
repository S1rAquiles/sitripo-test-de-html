-- Esquema para el sistema de ayudas
-- Ejecutar con un usuario con privilegios suficientes en MySQL
-- Crea la base de datos, tablas y relaciones básicas

CREATE DATABASE IF NOT EXISTS sistemas_ayudas
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE sistemas_ayudas;

-- Tabla de usuarios (estudiantes y administradores)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('estudiante','admin') NOT NULL DEFAULT 'estudiante',
  cedula VARCHAR(32) NULL,
  telefono VARCHAR(32) NULL,
  direccion VARCHAR(255) NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de ayudas (convocatorias)
CREATE TABLE IF NOT EXISTS ayudas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(160) NOT NULL,
  descripcion TEXT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  activa TINYINT(1) NOT NULL DEFAULT 1,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (activa),
  INDEX (fecha_inicio),
  INDEX (fecha_fin)
);

-- Tabla de solicitudes
CREATE TABLE IF NOT EXISTS solicitudes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  ayuda_id INT UNSIGNED NOT NULL,
  estatus ENUM('Pendiente','Cita','Aprobado','Rechazado') NOT NULL DEFAULT 'Pendiente',
  fecha_solicitud TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_cita DATETIME NULL,
  observaciones TEXT NULL,
  -- Para guardar rutas de archivos subidos (JSON con arreglo de strings)
  archivos_json JSON NULL,
  -- Copia de algunos datos del formulario para auditoría rápida
  datos_formulario JSON NULL,
  INDEX (estatus),
  INDEX (fecha_solicitud),
  CONSTRAINT fk_solicitudes_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_solicitudes_ayuda
    FOREIGN KEY (ayuda_id) REFERENCES ayudas(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Vistas útiles para el panel
CREATE OR REPLACE VIEW v_solicitudes_resumen AS
SELECT 
  s.id,
  s.estatus,
  s.fecha_solicitud,
  s.fecha_cita,
  u.nombre AS estudiante,
  u.email,
  u.cedula,
  a.titulo AS ayuda
FROM solicitudes s
JOIN usuarios u ON u.id = s.usuario_id
JOIN ayudas a ON a.id = s.ayuda_id;

-- Usuario admin de ejemplo (cambiar password_hash por uno real con bcrypt)
-- INSERT INTO usuarios(nombre, email, password_hash, rol)
-- VALUES ('Administrador', 'admin@universidad.edu', '$2b$10$hash_bcrypt_aqui', 'admin');

-- Ayuda de ejemplo
-- INSERT INTO ayudas(titulo, descripcion, fecha_inicio, fecha_fin, activa)
-- VALUES ('Beca de Transporte', 'Apoyo mensual para transporte', '2026-03-01', '2026-12-31', 1);

