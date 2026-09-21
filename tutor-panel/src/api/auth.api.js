import { apiClient } from './client.js';

export const authApi = {
  
  async login(email, password) {
    return apiClient('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  async obtenerPerfil() {
    return apiClient('/auth/perfil');
  },
};
