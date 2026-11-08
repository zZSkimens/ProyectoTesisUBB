export const MAXIMO_PUNTOS = 3000;
export const UMBRAL_META_INDUCCION = 1700;

export function resumirPuntos(
  misiones: { id: number; puntosRecompensa: number }[],
  progresos: { misionId: number; estado: string; puntajeObtenido: number }[],
) {
  const recompensas = new Map(misiones.map((m) => [m.id, m.puntosRecompensa]));
  const ganados = new Map<number, number>();
  for (const progreso of progresos) {
    const recompensa = recompensas.get(progreso.misionId);
    if (recompensa === undefined || progreso.estado !== 'completada') continue;
    const puntos = Math.max(0, Math.min(progreso.puntajeObtenido, recompensa));
    ganados.set(progreso.misionId, Math.max(ganados.get(progreso.misionId) ?? 0, puntos));
  }
  return {
    puntajeTotal: Math.min(MAXIMO_PUNTOS, [...ganados.values()].reduce((suma, puntos) => suma + puntos, 0)),
    maximoPuntos: MAXIMO_PUNTOS,
    umbralMetaPuntos: UMBRAL_META_INDUCCION,
  };
}
