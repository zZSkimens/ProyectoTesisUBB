import { expect, it } from 'vitest';
import { resumirPuntos } from '../../utils/puntos.js';
import { calcularBarraPuntos } from '../../../../tutor-panel/src/utils/calcularBarraPuntos.js';

it('cuenta cada misión completada una vez y hasta el valor de su recompensa', () => {
  const misiones = [{ id: 1, puntosRecompensa: 150 }, { id: 2, puntosRecompensa: 200 }];
  const progresos = [
    { misionId: 1, estado: 'completada', puntajeObtenido: 140 },
    { misionId: 1, estado: 'completada', puntajeObtenido: 180 },
    { misionId: 2, estado: 'en_progreso', puntajeObtenido: 200 },
    { misionId: 99, estado: 'completada', puntajeObtenido: 200 },
  ];

  expect(resumirPuntos(misiones, progresos).puntajeTotal).toBe(150);
});

function resumirPuntajeDeMisionesCompletadas(total: number) {
  const misiones = Array.from({ length: Math.ceil(total / 200) }, (_, indice) => ({
    id: indice + 1, puntosRecompensa: 200,
  }));
  const progresos = misiones.map(({ id, puntosRecompensa }, indice) => ({
    misionId: id, estado: 'completada', puntajeObtenido: Math.min(puntosRecompensa, total - indice * 200),
  }));
  return resumirPuntos(misiones, progresos);
}

it.each([
  { total: 1999, esperado: 1999 },
  { total: 2000, esperado: 2000 },
  { total: 2001, esperado: 2000 },
])('devuelve $esperado puntos cuando el estudiante ha ganado $total', ({ total, esperado }) => {
  expect(resumirPuntajeDeMisionesCompletadas(total).puntajeTotal).toBe(esperado);
  expect(calcularBarraPuntos({ puntajeTotal: total }).puntos).toBe(esperado);
});

it.each([
  { total: 1399, alcanzada: false },
  { total: 1400, alcanzada: true },
  { total: 1401, alcanzada: true },
])('muestra el estado de la meta con $total puntos ($alcanzada)', ({ total, alcanzada }) => {
  const resumen = resumirPuntajeDeMisionesCompletadas(total);
  expect(resumen).toMatchObject({ maximoPuntos: 2000, umbralMetaPuntos: 1400 });
  const barraEsperada = { maximo: 2000, umbral: 1400, puntos: total, alcanzada };
  expect(calcularBarraPuntos(resumen)).toEqual(barraEsperada);
  expect(calcularBarraPuntos({ puntajeTotal: total })).toEqual(barraEsperada);
});
