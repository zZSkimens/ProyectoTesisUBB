export const manejadorErrores = (err, req, res, next) => {
  console.error('[ERROR NO CONTROLADO]:', err);

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Ocurrio un error interno en el servidor',
  });
};
