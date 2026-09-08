CREATE TABLE progreso_misiones (
    id SERIAL PRIMARY KEY,
    rut_estudiante VARCHAR(12) NOT NULL,
    nombre_mision VARCHAR(100) NOT NULL,
    tiempo_empleado INT DEFAULT 0,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);