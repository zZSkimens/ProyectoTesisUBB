import { expect, it } from 'vitest';
import { resumirProgreso } from '../../utils/progreso.js';

it('calcula el avance con misiones activas únicas y distingue a quien no tiene asignaciones', () => {
  const progresos = [
    { misionId: 1, estado: 'completada', puntajeObtenido: 150 },
    { misionId: 1, estado: 'completada', puntajeObtenido: 150 },
    { misionId: 1, estado: 'en_progreso', puntajeObtenido: 20 },
    { misionId: 2, estado: 'en_progreso', puntajeObtenido: 0 },
    { misionId: 3, estado: 'completada', puntajeObtenido: 100 },
  ];

  expect(resumirProgreso([1, 2], progresos)).toMatchObject({
    completadas: 1,
    enProgreso: 1,
    porcentajeAvance: 50,
  });
  expect(resumirProgreso([], progresos)).toMatchObject({
    completadas: 0,
    porcentajeAvance: 0,
    estadoAtencion: 'Sin misiones asignadas',
  });
});

it.each([
  { porcentaje: 34, estadoAtencion: 'En riesgo' },
  { porcentaje: 35, estadoAtencion: 'En progreso' },
  { porcentaje: 49, estadoAtencion: 'En progreso' },
  { porcentaje: 50, estadoAtencion: 'Al dia' },
])('clasifica un avance de $porcentaje % como $estadoAtencion', ({ porcentaje, estadoAtencion }) => {
  const activas = Array.from({ length: 100 }, (_, indice) => indice + 1);
  const progresos = activas.slice(0, porcentaje).map((misionId) => ({
    misionId, estado: 'completada', puntajeObtenido: 100,
  }));

  expect(resumirProgreso(activas, progresos)).toMatchObject({ porcentajeAvance: porcentaje, estadoAtencion });
});
