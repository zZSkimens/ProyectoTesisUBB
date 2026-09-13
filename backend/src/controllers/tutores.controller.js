import { tutoresService } from '../services/tutores.service.js';

export const tutoresController = {
  async dashboard(req, res) {
    try {
      const metricas = await tutoresService.obtenerDashboard(req.usuario.id);
      res.json({ metricas });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async listarEstudiantes(req, res) {
    try {
      const estudiantes = await tutoresService.listarEstudiantes(req.usuario.id);
      res.json({ estudiantes });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async detalleEstudiante(req, res) {
    try {
      const detalle = await tutoresService.obtenerDetalleEstudiante(
        req.usuario.id,
        req.params.id
      );

      res.json(detalle);
    } catch (error) {
      const statusCode = error.message.includes('no encontrado') ? 404 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  },
};
