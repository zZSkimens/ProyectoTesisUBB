import type { Request, Response } from 'express';
import { tutoresService } from '../services/tutores.service.js';

export const tutoresController = {
  async dashboard(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const metricas = await tutoresService.obtenerDashboard(req.usuario.id);
      res.json({ metricas });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async listarEstudiantes(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const estudiantes = await tutoresService.listarEstudiantes(req.usuario.id);
      res.json({ estudiantes });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async detalleEstudiante(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const detalle = await tutoresService.obtenerDetalleEstudiante(
        req.usuario.id,
        Number(req.params.id)
      );

      res.json(detalle);
    } catch (error: any) {
      let statusCode = 500;
      if (error.message.includes('no encontrado')) {
        statusCode = 404;
      }
      res.status(statusCode).json({ error: error.message });
    }
  },
};
