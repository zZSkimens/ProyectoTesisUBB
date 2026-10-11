import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import type { Usuario, AuthContextType } from '../types/index';

const AuthContext = createContext<AuthContextType | null>(null);

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
        cerrarSesion();
      } finally {
        setCargando(false);
      }
    }

    verificarSesion();
  }, []);

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

  const cerrarSesion = () => {
    setUsuario(null);
    setToken(null);
    setError(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
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

export const useAuth = (): AuthContextType => {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return contexto;
};

export default AuthContext;
