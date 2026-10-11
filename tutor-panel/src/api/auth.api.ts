import { apiClient } from './client.js';
import type { Usuario } from '../types/index.js';

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface PerfilResponse {
  usuario: Usuario;
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiClient<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  async obtenerPerfil(): Promise<PerfilResponse> {
    return apiClient<PerfilResponse>('/auth/perfil');
  },
};
