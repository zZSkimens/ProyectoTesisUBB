import { apiClient } from './client.js';
import type {
  Estudiante,
  MetricasDashboard,
  DetalleEstudianteResponse,
  ActividadResumen,
  ObservacionEstudiante,
  CentroAtencionData,
  CentroAtencionInput,
} from '../types/index.js';

export interface DashboardResponse {
  metricas: MetricasDashboard;
  estudiantes: Estudiante[];
}

export interface ListarEstudiantesResponse {
  estudiantes: Estudiante[];
}

export interface ListarActividadesResponse {
  actividades: ActividadResumen[];
}

export interface ObservacionesResponse {
  observaciones: ObservacionEstudiante[];
}

export interface HorarioConsultasResponse {
  centros: CentroAtencionData[];
  mensaje?: string;
}

export const tutoresApi = {
  async obtenerDashboard(): Promise<DashboardResponse> {
    return apiClient<DashboardResponse>('/tutores/dashboard');
  },

  async obtenerEstudiantes(filtros?: { busqueda?: string; estado?: string }): Promise<ListarEstudiantesResponse> {
    let query = '';
    const params = new URLSearchParams();

    if (filtros && filtros.busqueda) {
      params.append('busqueda', filtros.busqueda);
    }
    if (filtros && filtros.estado) {
      params.append('estado', filtros.estado);
    }

    const querystring = params.toString();
    if (querystring.length > 0) {
      query = `?${querystring}`;
    }

    return apiClient<ListarEstudiantesResponse>(`/tutores/estudiantes${query}`);
  },

  async crearEstudiante(data: {
    rut: string;
    nombre: string;
    email: string;
    carrera: string;
  }): Promise<{ mensaje: string; estudiante: Estudiante }> {
    return apiClient<{ mensaje: string; estudiante: Estudiante }>('/tutores/estudiantes', {
      body: data,
    });
  },

  async eliminarEstudiante(estudianteId: number | string): Promise<{ mensaje: string }> {
    return apiClient<{ mensaje: string }>(`/tutores/estudiantes/${estudianteId}`, {
      method: 'DELETE',
    });
  },

  async obtenerActividades(): Promise<ListarActividadesResponse> {
    return apiClient<ListarActividadesResponse>('/tutores/actividades');
  },

  async obtenerDetalleEstudiante(estudianteId: number | string): Promise<DetalleEstudianteResponse> {
    return apiClient<DetalleEstudianteResponse>(`/tutores/estudiantes/${estudianteId}`);
  },

  async obtenerObservaciones(estudianteId: number | string): Promise<ObservacionesResponse> {
    return apiClient<ObservacionesResponse>(`/tutores/estudiantes/${estudianteId}/observaciones`);
  },

  async crearObservacion(
    estudianteId: number | string,
    data: { tipo?: string; titulo: string; contenido: string; compromiso?: string }
  ): Promise<{ mensaje: string; observacion: ObservacionEstudiante }> {
    return apiClient<{ mensaje: string; observacion: ObservacionEstudiante }>(
      `/tutores/estudiantes/${estudianteId}/observaciones`,
      {
        body: data,
      }
    );
  },

  async obtenerHorarioConsultas(): Promise<HorarioConsultasResponse> {
    return apiClient<HorarioConsultasResponse>('/tutores/centros-atencion');
  },

  async actualizarHorarioConsultas(data: { centros: CentroAtencionInput[] }): Promise<HorarioConsultasResponse> {
    return apiClient<HorarioConsultasResponse>('/tutores/centros-atencion', {
      method: 'PUT',
      body: data,
    });
  },
};
