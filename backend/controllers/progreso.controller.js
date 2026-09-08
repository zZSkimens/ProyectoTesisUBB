import * as ProgresoService from "../services/progreso.service.js";

export const registrar = async (req, res) => {
try {
    const datos = await ProgresoService.guardarProgreso(req.body);
    res.status(201).json({ mensaje: "Éxito", datos });
} catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar" });
}
};

export const obtenerLista = async (req, res) => {
try {
    const datos = await ProgresoService.obtenerTodoElProgreso();
    res.status(200).json(datos);
} catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener datos" });
}
};