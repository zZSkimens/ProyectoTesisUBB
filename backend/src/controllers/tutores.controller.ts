import type { NextFunction, Request, Response } from 'express';
import { ErrorAplicacion } from '../utils/errorAplicacion.js';
import { actividadesTutorService } from '../services/actividadesTutor.service.js';
import { bitacoraService } from '../services/bitacora.service.js';
import { centrosAtencionService } from '../services/centrosAtencion.service.js';
import { dashboardTutorService } from '../services/dashboardTutor.service.js';
import { estudiantesService } from '../services/estudiantes.service.js';

export const tutoresController = {
  async dashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.usuario) {
        throw new ErrorAplicacion('SESION_INVALIDA', 'No autenticado');
      }
      const metricas = await dashboardTutorService.obtenerDashboard(req.usuario.id);
      res.json({ metricas });
    } catch (error) {
      next(error);
    }
  },

  async listarEstudiantes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.usuario) {
        throw new ErrorAplicacion('SESION_INVALIDA', 'No autenticado');
      }

      const { busqueda, estado } = req.query;
      const filtros: { busqueda?: string; estado?: string } = {};

      if (typeof busqueda === 'string') {
        filtros.busqueda = busqueda;
      }
      if (typeof estado === 'string') {
        filtros.estado = estado;
      }

      const estudiantes = await estudiantesService.listarEstudiantes(req.usuario.id, filtros);
      res.json({ estudiantes });
    } catch (error) {
      next(error);
    }
  },

  async crearEstudiante(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.usuario) {
        throw new ErrorAplicacion('SESION_INVALIDA', 'No autenticado');
      }

      const nuevo = await estudiantesService.crearEstudiante(req.usuario.id, req.body);
      res.status(201).json({
        mensaje: 'Estudiante novato registrado exitosamente',
        estudiante: nuevo,
      });
    } catch (error) {
      next(error);
    }
  },

  async eliminarEstudiante(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.usuario) {
        throw new ErrorAplicacion('SESION_INVALIDA', 'No autenticado');
      }

      await estudiantesService.eliminarEstudiante(req.usuario.id, Number(req.params.id));
      res.json({ mensaje: 'Estudiante eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  },

  async crearObservacion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.usuario) {
        throw new ErrorAplicacion('SESION_INVALIDA', 'No autenticado');
      }

      const observacion = await bitacoraService.crearObservacion(
        req.usuario.id,
        Number(req.params.id),
        req.body
      );

      res.status(201).json({
        mensaje: 'Registro de tutoria guardado correctamente',
        observacion,
      });
    } catch (error) {
      next(error);
    }
  },

  async obtenerObservaciones(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.usuario) {
        throw new ErrorAplicacion('SESION_INVALIDA', 'No autenticado');
      }

      const observaciones = await bitacoraService.obtenerObservaciones(
        req.usuario.id,
        Number(req.params.id)
      );

      res.json({ observaciones });
    } catch (error) {
      next(error);
    }
  },

  async obtenerHorarioConsultas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.usuario) {
        throw new ErrorAplicacion('SESION_INVALIDA', 'No autenticado');
      }

      const centros = await centrosAtencionService.obtenerHorarioConsultas(req.usuario.id);
      res.json({ centros });
    } catch (error) {
      next(error);
    }
  },

  async actualizarHorarioConsultas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.usuario) {
        throw new ErrorAplicacion('SESION_INVALIDA', 'No autenticado');
      }

      const centros = await centrosAtencionService.actualizarHorarioConsultas(req.usuario.id, req.body);
      res.json({
        mensaje: 'Centros de atencion actualizados correctamente',
        centros,
      });
    } catch (error) {
      next(error);
    }
  },

  async listarActividades(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.usuario) {
        throw new ErrorAplicacion('SESION_INVALIDA', 'No autenticado');
      }
      res.json(await actividadesTutorService.obtenerResumenActividades(req.usuario.id));
    } catch (error) {
      next(error);
    }
  },

  async detalleEstudiante(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.usuario) {
        throw new ErrorAplicacion('SESION_INVALIDA', 'No autenticado');
      }
      const detalle = await estudiantesService.obtenerDetalleEstudiante(
        req.usuario.id,
        Number(req.params.id)
      );

      res.json(detalle);
    } catch (error) {
      next(error);
    }
  },
};
