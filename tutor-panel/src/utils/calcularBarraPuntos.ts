import type { Estudiante } from '../types/index.js';

export function calcularBarraPuntos(estudiante: Pick<Estudiante, 'puntajeTotal' | 'maximoPuntos' | 'umbralMetaPuntos'>) {
  const maximo = estudiante.maximoPuntos ?? 3000;
  const umbral = estudiante.umbralMetaPuntos ?? 1700;
  const puntos = Math.max(0, Math.min(estudiante.puntajeTotal ?? 0, maximo));
  return { maximo, umbral, puntos, alcanzada: puntos >= umbral };
}
