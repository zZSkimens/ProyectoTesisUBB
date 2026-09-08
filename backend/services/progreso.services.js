import * as ProgresoModel from "../models/progreso.model.js";

export const guardarProgreso = async (datos) => {
const { rut_estudiante, nombre_mision, tiempo_empleado } = datos;
return await ProgresoModel.crear(rut_estudiante, nombre_mision, tiempo_empleado);
};

export const obtenerTodoElProgreso = async () => {
return await ProgresoModel.buscarTodos();
};