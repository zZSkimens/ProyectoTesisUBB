import { apiClient } from './client.js';
import type { Usuario } from '../types/index.js';

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface PerfilResponse {
  usuario: Usuario;
}

interface FotoPerfilResponse {
  foto: string | null;
}

export const authApi = {
  async cerrarSesion(): Promise<void> {
    await apiClient('/auth/logout', { method: 'POST' });
  },
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiClient<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  async obtenerPerfil(): Promise<PerfilResponse> {
    return apiClient<PerfilResponse>('/auth/perfil');
  },
  obtenerFotoPerfil(signal: AbortSignal): Promise<FotoPerfilResponse> {
    return apiClient<FotoPerfilResponse>('/auth/perfil/foto', { signal });
  },
  guardarFotoPerfil(archivo: File, signal: AbortSignal): Promise<FotoPerfilResponse> {
    const formato = archivo.type.toLowerCase();
    return apiClient<FotoPerfilResponse>('/auth/perfil/foto', {
      method: 'PUT',
      headers: { 'Content-Type': formato === 'image/jpg' ? 'image/jpeg' : formato },
      cuerpoCrudo: archivo,
      signal,
    });
  },
  eliminarFotoPerfil(signal: AbortSignal): Promise<FotoPerfilResponse> {
    return apiClient<FotoPerfilResponse>('/auth/perfil/foto', { method: 'DELETE', signal });
  },
};
