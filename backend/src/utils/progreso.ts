interface Progreso {
  misionId: number;
  estado: string;
  puntajeObtenido: number;
}

export function resumirProgreso(idsActivos: number[], progresos: Progreso[]) {
  const ids = new Set(idsActivos);
  const completadas = new Set<number>();
  const iniciadas = new Set<number>();
  const puntos = new Map<number, number>();
  for (const progreso of progresos) {
    if (!ids.has(progreso.misionId)) continue;
    if (progreso.estado === 'completada') completadas.add(progreso.misionId);
    if (progreso.estado === 'en_progreso') iniciadas.add(progreso.misionId);
    puntos.set(progreso.misionId, Math.max(puntos.get(progreso.misionId) ?? 0, progreso.puntajeObtenido));
  }
  const porcentajeAvance = ids.size ? Math.round(completadas.size / ids.size * 100) : 0;
  const estadoAtencion = !ids.size ? 'Sin misiones asignadas' :
    porcentajeAvance < 35 ? 'En riesgo' : porcentajeAvance < 50 ? 'En progreso' : 'Al dia';
  return {
    completadas: completadas.size,
    enProgreso: [...iniciadas].filter((id) => !completadas.has(id)).length,
    puntajeTotal: [...puntos.values()].reduce((suma, valor) => suma + valor, 0),
    porcentajeAvance, estadoAtencion,
  };
}
