import type { Request, Response } from 'express';
import { tutoresService } from '../services/tutores.service.js';

function responderError(res: Response, error: unknown, operacion: string): void {
  console.error(`[ERROR] Fallo en ${operacion}:`, error);
  let statusCode = 500;
  let mensaje = 'Ocurrio un error interno en el servidor';

  if (error instanceof Error && error.message.includes('Ya existe')) {
    statusCode = 409;
    mensaje = error.message;
  } else if (error instanceof Error && error.message.includes('no encontrado')) {
    statusCode = 404;
    mensaje = error.message;
  }

  res.status(statusCode).json({ error: mensaje });
}

export const tutoresController = {
  async dashboard(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const metricas = await tutoresService.obtenerDashboard(req.usuario.id);
      res.json({ metricas });
    } catch (error) {
      responderError(res, error, 'dashboard de tutor');
    }
  },

  async listarEstudiantes(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { busqueda, estado } = req.query;
      const filtros: { busqueda?: string; estado?: string } = {};

      if (typeof busqueda === 'string') {
        filtros.busqueda = busqueda;
      }
      if (typeof estado === 'string') {
        filtros.estado = estado;
      }

      const estudiantes = await tutoresService.listarEstudiantes(req.usuario.id, filtros);
      res.json({ estudiantes });
    } catch (error) {
      responderError(res, error, 'listado de estudiantes');
    }
  },

  async crearEstudiante(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const nuevo = await tutoresService.crearEstudiante(req.usuario.id, req.body);
      res.status(201).json({
        mensaje: 'Estudiante novato registrado exitosamente',
        estudiante: nuevo,
      });
    } catch (error) {
      responderError(res, error, 'creacion de estudiante');
    }
  },

  async eliminarEstudiante(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      await tutoresService.eliminarEstudiante(req.usuario.id, Number(req.params.id));
      res.json({ mensaje: 'Estudiante eliminado correctamente' });
    } catch (error) {
      responderError(res, error, 'eliminacion de estudiante');
    }
  },

  async crearObservacion(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const observacion = await tutoresService.crearObservacion(
        req.usuario.id,
        Number(req.params.id),
        req.body
      );

      res.status(201).json({
        mensaje: 'Registro de tutoria guardado correctamente',
        observacion,
      });
    } catch (error) {
      responderError(res, error, 'creacion de observacion');
    }
  },

  async obtenerObservaciones(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const observaciones = await tutoresService.obtenerObservaciones(
        req.usuario.id,
        Number(req.params.id)
      );

      res.json({ observaciones });
    } catch (error) {
      responderError(res, error, 'consulta de observaciones');
    }
  },

  async obtenerHorarioConsultas(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const centros = await tutoresService.obtenerHorarioConsultas(req.usuario.id);
      res.json({ centros });
    } catch (error) {
      responderError(res, error, 'consulta de horario');
    }
  },

  async actualizarHorarioConsultas(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const centros = await tutoresService.actualizarHorarioConsultas(req.usuario.id, req.body);
      res.json({
        mensaje: 'Centros de atencion actualizados correctamente',
        centros,
      });
    } catch (error) {
      responderError(res, error, 'actualizacion de horario');
    }
  },

  async listarActividades(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const actividades = await tutoresService.obtenerResumenActividades(req.usuario.id);
      res.json({ actividades });
    } catch (error) {
      responderError(res, error, 'resumen de actividades');
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
    } catch (error) {
      responderError(res, error, 'detalle de estudiante');
    }
  },
};
