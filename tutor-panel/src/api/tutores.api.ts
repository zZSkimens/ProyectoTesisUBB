import { apiClient } from './client.js';
import type { Estudiante, MetricasDashboard, DetalleEstudianteResponse, ActividadResumen } from '../types/index.js';

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

export const tutoresApi = {
  async obtenerDashboard(): Promise<DashboardResponse> {
    return apiClient<DashboardResponse>('/tutores/dashboard');
  },

  async obtenerEstudiantes(): Promise<ListarEstudiantesResponse> {
    return apiClient<ListarEstudiantesResponse>('/tutores/estudiantes');
  },

  async obtenerActividades(): Promise<ListarActividadesResponse> {
    return apiClient<ListarActividadesResponse>('/tutores/actividades');
  },

  async obtenerDetalleEstudiante(estudianteId: number | string): Promise<DetalleEstudianteResponse> {
    return apiClient<DetalleEstudianteResponse>(`/tutores/estudiantes/${estudianteId}`);
  },
};
