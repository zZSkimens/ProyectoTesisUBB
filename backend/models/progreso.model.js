import { pool } from "../config/configDb.js";

export const crear = async (rut, mision, tiempo) => {
  const query = 'INSERT INTO progreso_misiones (rut_estudiante, nombre_mision, tiempo_empleado) VALUES ($1, $2, $3) RETURNING *';
const result = await pool.query(query, [rut, mision, tiempo || 0]);
return result.rows[0];
};

export const buscarTodos = async () => {
  const query = 'SELECT * FROM progreso_misiones ORDER BY fecha_registro DESC';
const result = await pool.query(query);
return result.rows;
};