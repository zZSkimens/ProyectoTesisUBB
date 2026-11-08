import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import type { Usuario, AuthContextType } from '../types/index';
import { AuthContext } from './AuthContext';

export interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const usuarioGuardado = sessionStorage.getItem('usuario');
    if (usuarioGuardado) {
      try {
        return JSON.parse(usuarioGuardado) as Usuario;
      } catch {
        return null;
      }
    } else {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    const tokenGuardado = sessionStorage.getItem('token');
    if (tokenGuardado) {
      return tokenGuardado;
    } else {
      return null;
    }
  });

  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const limpiarSesion = useCallback(() => {
    setUsuario(null);
    setToken(null);
    setError(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }, []);

  useEffect(() => {
    async function verificarSesion() {
      const tokenGuardado = sessionStorage.getItem('token');

      if (!tokenGuardado) {
        setCargando(false);
        return;
      }

      try {
        const data = await authApi.obtenerPerfil();
        setUsuario(data.usuario);
        sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
      } catch (err: any) {
        console.warn('[AUTH] Sesion expirada o invalida:', err.message);
        limpiarSesion();
      } finally {
        setCargando(false);
      }
    }

    verificarSesion();
  }, [limpiarSesion]);

  const iniciarSesion = async (email: string, password: string): Promise<Usuario> => {
    setError(null);
    try {
      const data = await authApi.login(email, password);

      setToken(data.token);
      setUsuario(data.usuario);

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('usuario', JSON.stringify(data.usuario));

      return data.usuario;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const cerrarSesion = async () => {
    try {
      await authApi.cerrarSesion();
      limpiarSesion();
    } catch {
      setError('No se pudo cerrar la sesion en el servidor. Intenta nuevamente.');
      window.alert('No se pudo cerrar la sesion en el servidor. Intenta nuevamente.');
    }
  };

  let estaAutenticado = false;
  if (token && usuario) {
    estaAutenticado = true;
  }

  let esTutor = false;
  if (usuario && usuario.rol === 'tutor') {
    esTutor = true;
  }

  let esAdmin = false;
  if (usuario && usuario.rol === 'admin') {
    esAdmin = true;
  }

  const valor: AuthContextType = {
    usuario,
    token,
    cargando,
    error,
    estaAutenticado,
    esTutor,
    esAdmin,
    iniciarSesion,
    cerrarSesion,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
};

