import { useState } from 'react';
import { misionesApi } from '../api/misiones.api';
import type { AccionAsignacion } from '../types';

interface ConfirmacionAsignacion {
  id: number;
  accion: 'desactivar' | 'quitar';
}

export function useAsignacionesMisiones(onAsignacionCambiada: (id: number, accion: AccionAsignacion) => void) {
  const [confirmacion, setConfirmacion] = useState<ConfirmacionAsignacion | null>(null);
  const [actualizandoId, setActualizandoId] = useState<number | null>(null);
  const [errorAsignacion, setErrorAsignacion] = useState<{ id: number; mensaje: string } | null>(null);

  function prepararConfirmacion(id: number, accion: ConfirmacionAsignacion['accion']) {
    setErrorAsignacion(null);
    setConfirmacion({ id, accion });
  }

  function cancelarConfirmacion() {
    setConfirmacion(null);
  }

  async function actualizarAsignacion(id: number, accion: AccionAsignacion) {
    if (actualizandoId !== null) return;
    setActualizandoId(id);
    setErrorAsignacion(null);

    try {
      if (accion === 'quitar') {
        await misionesApi.quitarDeLista(id);
      } else {
        await misionesApi.actualizarActivacion(id, accion === 'reactivar');
      }

      cancelarConfirmacion();
      onAsignacionCambiada(id, accion);
    } catch (error) {
      setErrorAsignacion({
        id,
        mensaje: error instanceof Error ? error.message : 'No se pudo actualizar la misión',
      });
    } finally {
      setActualizandoId(null);
    }
  }

  return {
    confirmacion,
    actualizandoId,
    errorAsignacion,
    prepararConfirmacion,
    cancelarConfirmacion,
    actualizarAsignacion,
  };
}
