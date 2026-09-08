export const validarDatos = (req, res, next) => {
const { rut_estudiante, nombre_mision } = req.body;
if (!rut_estudiante || !nombre_mision) {
    return res.status(400).json({ error: "RUT y nombre de misión son obligatorios." });
}
next(); 
};