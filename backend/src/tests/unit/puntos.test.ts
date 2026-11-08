import { expect, it } from 'vitest';
import { resumirPuntos } from '../../utils/puntos.js';
import { calcularBarraPuntos } from '../../../../tutor-panel/src/utils/calcularBarraPuntos.js';

it('cuenta cada misión completada hasta su recompensa y limita el total a 3000', () => {
  const misiones = [{ id: 1, puntosRecompensa: 150 }, { id: 2, puntosRecompensa: 200 }];
  const progresos = [
    { misionId: 1, estado: 'completada', puntajeObtenido: 140 },
    { misionId: 1, estado: 'completada', puntajeObtenido: 180 },
    { misionId: 2, estado: 'en_progreso', puntajeObtenido: 200 },
    { misionId: 99, estado: 'completada', puntajeObtenido: 200 },
  ];

  expect(resumirPuntos(misiones, progresos).puntajeTotal).toBe(150);

  const catalogo = Array.from({ length: 16 }, (_, i) => ({ id: i + 1, puntosRecompensa: 200 }));
  const completadas = catalogo.map(({ id }) => ({ misionId: id, estado: 'completada', puntajeObtenido: 200 }));
  expect(resumirPuntos(catalogo, completadas.slice(0, 14)).puntajeTotal).toBe(2800);
  expect(resumirPuntos(catalogo, completadas).puntajeTotal).toBe(3000);
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
  { total: 2999, esperado: 2999 },
  { total: 3000, esperado: 3000 },
  { total: 3001, esperado: 3000 },
])('devuelve $esperado puntos cuando el estudiante ha ganado $total', ({ total, esperado }) => {
  expect(resumirPuntajeDeMisionesCompletadas(total).puntajeTotal).toBe(esperado);
});

it.each([
  { total: 1699, alcanzada: false },
  { total: 1700, alcanzada: true },
  { total: 1701, alcanzada: true },
])('muestra el estado de la meta con $total puntos ($alcanzada)', ({ total, alcanzada }) => {
  const resumen = resumirPuntajeDeMisionesCompletadas(total);
  expect(calcularBarraPuntos(resumen)).toMatchObject({ puntos: total, alcanzada });
});
