import { useEffect, useRef, useState } from 'react';
import { authApi } from '../api/auth.api';
import type { FotoPerfil } from '../types/index';

interface SesionFoto {
  token: string;
  controlador: AbortController;
  guardando: boolean;
}

interface EstadoFoto {
  token: string;
  foto: string | null;
  error: string | null;
  guardando: boolean;
}

export function useFotoPerfil(token: string | null): FotoPerfil {
  const [estado, setEstado] = useState<EstadoFoto | null>(null);
  const sesionActual = useRef<SesionFoto | null>(null);
  const fotoActual = estado?.token === token ? estado : null;

  useEffect(() => {
    if (!token) return;

    const controlador = new AbortController();
    const { signal } = controlador;
    sesionActual.current = { token, controlador, guardando: false };

    authApi.obtenerFotoPerfil(signal)
      .then(({ foto }) => {
        if (!signal.aborted) setEstado({ token, foto, error: null, guardando: false });
      })
      .catch(() => {
        if (!signal.aborted) {
          setEstado({ token, foto: null, error: 'No se pudo cargar la foto de perfil. Recarga la página para volver a intentarlo.', guardando: false });
        }
      });

    return () => controlador.abort();
  }, [token]);

  const actualizar = async (peticion: (signal: AbortSignal) => Promise<{ foto: string | null }>) => {
    const sesion = sesionActual.current;
    if (!sesion || sesion.token !== token || !fotoActual || sesion.guardando || sesion.controlador.signal.aborted) {
      throw new Error('La foto de perfil no está disponible para cambios en este momento.');
    }

    const { signal } = sesion.controlador;
    sesion.guardando = true;
    setEstado({ ...fotoActual, guardando: true });

    try {
      const { foto } = await peticion(signal);
      if (!signal.aborted) setEstado({ token: sesion.token, foto, error: null, guardando: false });
    } catch (error) {
      if (!signal.aborted) setEstado(fotoActual);
      throw error;
    } finally {
      sesion.guardando = false;
    }
  };

  return {
    foto: fotoActual?.foto ?? null,
    error: fotoActual?.error ?? null,
    cargando: token !== null && fotoActual === null,
    guardando: fotoActual?.guardando ?? false,
    guardar: (archivo) => actualizar((signal) => authApi.guardarFotoPerfil(archivo, signal)),
    eliminar: () => actualizar(authApi.eliminarFotoPerfil),
  };
}
