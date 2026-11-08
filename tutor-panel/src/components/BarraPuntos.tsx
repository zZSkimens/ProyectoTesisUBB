import type { Estudiante } from '../types';

export function BarraPuntos({ estudiante }: { estudiante: Estudiante }) {
  const maximo = estudiante.maximoPuntos ?? 3000;
  const umbral = estudiante.umbralMetaPuntos ?? 1700;
  const puntos = Math.max(0, Math.min(estudiante.puntajeTotal ?? 0, maximo));
  const alcanzada = puntos >= umbral;
  return <div className={`student-points${alcanzada ? ' student-points-complete' : ''}`}>
    <div className="student-points-label"><strong>{puntos} / {maximo} pts</strong></div>
    <div className="student-points-track" role="progressbar" aria-label={`Puntos de inducción de ${estudiante.nombre}`} aria-valuemin={0} aria-valuemax={maximo} aria-valuenow={puntos} aria-valuetext={`${puntos} de ${maximo} puntos. ${alcanzada ? 'Meta de inducción alcanzada' : `Meta desde ${umbral} puntos`}`}>
      <div className="student-points-fill" style={{ width: `${puntos / maximo * 100}%` }} />
      <span className="student-points-marker" style={{ left: `${umbral / maximo * 100}%` }} aria-hidden="true" />
    </div>
    <span className="student-points-status">{alcanzada ? 'Meta de inducción alcanzada' : `Meta: ${umbral} pts · Faltan ${umbral - puntos}`}</span>
  </div>;
}
