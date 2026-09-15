
export const validarIdEstudiante = (req, res, next) => {
  const { id } = req.params;
  const idNumero = Number(id);

  if (!Number.isInteger(idNumero) || idNumero <= 0) {
    return res.status(400).json({ error: 'El ID de estudiante debe ser un numero entero positivo' });
  }

  req.params.id = idNumero;
  next();
};
