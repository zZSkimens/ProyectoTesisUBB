import { useCallback, useEffect, useRef, useState } from 'react';
import { tutoresApi } from '../api/tutores.api';
import type { AccionAsignacion, ActividadResumen, Estudiante, MetricasDashboard, MisionDesactivada } from '../types/index';

export function useDatosDashboard() {
  const [metricas, setMetricas] = useState<MetricasDashboard | null>(null);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [actividades, setActividades] = useState<ActividadResumen[]>([]);
  const [misionesDesactivadas, setMisionesDesactivadas] = useState<MisionDesactivada[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const solicitudActual = useRef(0);
  const invalidarSolicitudes = useCallback(() => {
    solicitudActual.current++;
  }, []);

  const recibirDatos = useCallback(async (solicitudId: number) => {
    try {
      const [resDashboard, resEstudiantes, resActividades] = await Promise.all([
        tutoresApi.obtenerDashboard(),
        tutoresApi.obtenerEstudiantes(),
        tutoresApi.obtenerActividades(),
        new Promise((resolve) => setTimeout(resolve, 400)),
      ]);

      if (solicitudId !== solicitudActual.current) return;
      setMetricas(resDashboard.metricas);
      setEstudiantes(resEstudiantes.estudiantes);
      setActividades(resActividades.actividades);
      setMisionesDesactivadas(resActividades.misionesDesactivadas ?? []);
    } catch (err: any) {
      if (solicitudId !== solicitudActual.current) return;
      setError(err.message || 'Error al cargar la información del panel');
    } finally {
      if (solicitudId === solicitudActual.current) setCargando(false);
    }
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    await recibirDatos(++solicitudActual.current);
  };

  useEffect(() => {
    void recibirDatos(++solicitudActual.current);
    return () => {
      // Las respuestas pendientes dejan de ser validas al salir de esta vista.
      invalidarSolicitudes();
    };
  }, [recibirDatos, invalidarSolicitudes]);

  const actualizarActividades = (id: number, accion: AccionAsignacion) => {
    if (accion === 'desactivar') {
      setActividades((actuales) => actuales.filter((actividad) => actividad.id !== id));
    } else {
      setMisionesDesactivadas((actuales) => actuales.filter((mision) => mision.id !== id));
    }
    void cargarDatos();
  };

  return { metricas, estudiantes, actividades, misionesDesactivadas, cargando, error, cargarDatos, actualizarActividades };
}
