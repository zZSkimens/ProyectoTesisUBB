import { useEffect, useState } from 'react';
import { tutoresApi } from '../api/tutores.api';
import type { ObservacionEstudiante } from '../types/index';

export function useBitacoraEstudiante(estudianteId: number | null) {
  const [observaciones, setObservaciones] = useState<ObservacionEstudiante[]>([]);
  const [estadoBitacora, setEstadoBitacora] = useState<'cargando' | 'lista' | 'error'>('cargando');
  const [intentoBitacora, setIntentoBitacora] = useState(0);

  useEffect(() => {
    if (!estudianteId) return;
    let vigente = true;

    tutoresApi.obtenerObservaciones(estudianteId)
      .then(({ observaciones: registros }) => {
        if (vigente) {
          if (!Array.isArray(registros)) {
            setEstadoBitacora('error');
            return;
          }
          setObservaciones(registros);
          setEstadoBitacora('lista');
        }
      })
      .catch(() => {
        if (vigente) setEstadoBitacora('error');
      });

    return () => { vigente = false; };
  }, [estudianteId, intentoBitacora]);

  const reintentarBitacora = () => {
    setEstadoBitacora('cargando');
    setIntentoBitacora((intento) => intento + 1);
  };

  const agregarObservacion = (observacion: ObservacionEstudiante) => {
    setObservaciones((registros) => [observacion, ...registros]);
  };

  return { observaciones, estadoBitacora, reintentarBitacora, agregarObservacion };
}
