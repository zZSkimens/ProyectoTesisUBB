import type { CentroAtencionData, CentroAtencionInput } from '../types/index';

export const configuracionSalas: Record<string, { pisos: number[]; salasPorPiso: number }> = {
  AA: { pisos: [1], salasPorPiso: 8 },
  AB: { pisos: [1, 2, 3], salasPorPiso: 2 },
  AC: { pisos: [1, 2, 3], salasPorPiso: 8 },
  AD: { pisos: [2, 3], salasPorPiso: 2 },
};

export const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export interface CentroAtencionFormulario extends CentroAtencionInput {
  edificioSala: string;
  pisoSala: number;
  diasPorSemana: number;
  diasSeleccionados: string[];
  horaInicio: string;
  horaFin: string;
  guardado: boolean;
}

const analizarHorario = (horario: string) => {
  const horarioNormalizado = horario.toLowerCase();
  let diasSeleccionados = diasSemana.filter((dia) => horarioNormalizado.includes(dia.toLowerCase()));
  if (diasSeleccionados.length > 2) {
    diasSeleccionados = diasSeleccionados.slice(0, 2);
  }
  const coincidenciaHoras = /(\d{1,2}:\d{2})\s+a\s+(\d{1,2}:\d{2})/i.exec(horario);
  let horaInicio = '';
  let horaFin = '';
  if (coincidenciaHoras) {
    horaInicio = coincidenciaHoras[1].padStart(5, '0');
    horaFin = coincidenciaHoras[2].padStart(5, '0');
  }

  let diasPorSemana = diasSeleccionados.length;
  if (diasPorSemana === 0) {
    diasPorSemana = 1;
  }

  return { diasPorSemana, diasSeleccionados, horaInicio, horaFin };
};

export const formatearHorario = (centro: CentroAtencionFormulario): string => {
  const diasOrdenados = diasSemana.filter((dia) => centro.diasSeleccionados.includes(dia));
  if (diasOrdenados.length === 0 || !centro.horaInicio || !centro.horaFin) {
    return 'Pendiente de definición';
  }
  return diasOrdenados.join(', ') + ' de ' + centro.horaInicio + ' a ' + centro.horaFin + ' hrs';
};

export const crearCentroVacio = (numeroCentro: number): CentroAtencionFormulario => {
  let horarioConsultas = '';
  let oficina = '';
  if (numeroCentro === 1) {
    horarioConsultas = 'Martes y Jueves de 15:00 a 17:00 hrs';
    oficina = 'A101AA';
  }

  return {
    numeroCentro,
    modalidad: 'presencial',
    oficina,
    horarioConsultas,
    canalContacto: '',
    urlContacto: '',
    guardado: false,
    edificioSala: 'AA',
    pisoSala: 1,
    ...analizarHorario(horarioConsultas),
  };
};

export const convertirCentroFormulario = (centro: CentroAtencionData): CentroAtencionFormulario => {
  let edificioSala = 'AA';
  let pisoSala = 1;
  let canalContacto = centro.canalContacto;
  if (centro.modalidad === 'online' && canalContacto.length === 0) {
    canalContacto = 'Discord';
  }
  const coincidencia = centro.oficina.match(/A([1-3])\d{2}(AA|AB|AC|AD)/);
  if (coincidencia) {
    edificioSala = coincidencia[2];
    pisoSala = Number(coincidencia[1]);
  }

  return {
    numeroCentro: centro.numeroCentro,
    modalidad: centro.modalidad,
    oficina: centro.oficina,
    horarioConsultas: centro.horarioConsultas,
    canalContacto,
    urlContacto: centro.urlContacto,
    guardado: centro.guardado === true,
    edificioSala,
    pisoSala,
    ...analizarHorario(centro.horarioConsultas),
  };
};

export const centroEstaConfigurado = (centro: CentroAtencionFormulario): boolean => {
  if (centro.diasSeleccionados.length === 0 || !centro.horaInicio || !centro.horaFin) {
    return false;
  }
  if (centro.modalidad === 'presencial' && centro.oficina.length > 0) {
    return true;
  }
  if (centro.modalidad === 'online' && centro.canalContacto.length > 0) {
    return true;
  }
  return false;
};
