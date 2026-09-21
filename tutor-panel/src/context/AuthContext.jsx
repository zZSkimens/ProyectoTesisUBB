import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth.api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  const [usuario, setUsuario] = useState(() => {
    const usuarioGuardado = sessionStorage.getItem('usuario');
    if (usuarioGuardado) {
      try {
        return JSON.parse(usuarioGuardado);
      } catch (error) {
        return null;
      }
    } else {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    const tokenGuardado = sessionStorage.getItem('token');
    if (tokenGuardado) {
      return tokenGuardado;
    } else {
      return null;
    }
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

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
      } catch (err) {
        console.warn('[AUTH] Sesion expirada o invalida:', err.message);
        cerrarSesion();
      } finally {
        setCargando(false);
      }
    }

    verificarSesion();
  }, []);

  const iniciarSesion = async (email, password) => {
    setError(null);
    try {
      const data = await authApi.login(email, password);

      setToken(data.token);
      setUsuario(data.usuario);

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('usuario', JSON.stringify(data.usuario));

      return data.usuario;
    } catch (err) {
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

  const valor = {
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

export const useAuth = () => {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return contexto;
};

export default AuthContext;
