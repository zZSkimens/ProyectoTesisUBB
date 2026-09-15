import { apiClient } from './client.js';

export const tutoresApi = {
  
  async obtenerDashboard() {
    return apiClient('/tutores/dashboard');
  },

  async obtenerEstudiantes() {
    return apiClient('/tutores/estudiantes');
  },

  async obtenerDetalleEstudiante(estudianteId) {
    return apiClient(`/tutores/estudiantes/${estudianteId}`);
  },
};
