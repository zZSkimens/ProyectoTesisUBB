export function correoEstudiantilValido(email: unknown): boolean {
  return typeof email === 'string' && /^[^\s@]+@alumnos\.ubiobio\.cl$/i.test(email.trim());
}

export function horarioConsultasValido(horario: unknown): boolean {
  if (typeof horario !== 'string' || horario.trim().length < 3) return false;
  const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const diasIncluidos = diasSemana.filter((dia) => horario.toLowerCase().includes(dia));
  return diasIncluidos.length >= 1 && diasIncluidos.length <= 2;
}

const configuracionSalas: Record<string, { pisos: number[]; salasPorPiso: number }> = {
  AA: { pisos: [1], salasPorPiso: 8 },
  AB: { pisos: [1, 2, 3], salasPorPiso: 2 },
  AC: { pisos: [1, 2, 3], salasPorPiso: 8 },
  AD: { pisos: [2, 3], salasPorPiso: 2 },
};

type CentroAtencion = {
  modalidad: unknown;
  oficina: unknown;
  horarioConsultas: unknown;
  canalContacto: unknown;
  urlContacto: unknown;
};

export function validarCentroAtencion(centro: unknown, numero: number): string | null {
  if (!centro || typeof centro !== 'object' || Array.isArray(centro)) {
    return `El centro ${numero} debe ser un objeto`;
  }
  const datos = centro as CentroAtencion;
  if (datos.modalidad !== 'presencial' && datos.modalidad !== 'online') {
    return `La modalidad del centro ${numero} no es valida`;
  }

  for (const campo of ['oficina', 'horarioConsultas', 'canalContacto', 'urlContacto'] as const) {
    if (typeof datos[campo] !== 'string') return `El campo ${campo} del centro ${numero} debe ser texto`;
  }

  const oficina = (datos.oficina as string).trim();
  const horario = (datos.horarioConsultas as string).trim();
  const canal = (datos.canalContacto as string).trim();
  const urlContacto = (datos.urlContacto as string).trim();

  if (horario.length < 3) return `Debe indicar un horario para el centro ${numero}`;
  if (!horarioConsultasValido(horario)) {
    return 'Cada centro debe tener disponibilidad entre 1 y 2 días por semana';
  }

  if (datos.modalidad === 'presencial') {
    const codigoSala = /^A([1-3])(\d{2})(AA|AB|AC|AD)$/.exec(oficina);
    if (!codigoSala) return `La sala del centro ${numero} no es valida`;

    const piso = Number(codigoSala[1]);
    const numeroSala = Number(codigoSala[2]);
    const configuracion = configuracionSalas[codigoSala[3]];
    if (!configuracion.pisos.includes(piso) || numeroSala < 1 || numeroSala > configuracion.salasPorPiso) {
      return `La sala del centro ${numero} no esta disponible`;
    }
    if (canal.length > 0 || urlContacto.length > 0) {
      return 'Un centro presencial no puede tener canal ni URL online';
    }
  }

  if (datos.modalidad === 'online') {
    if (oficina.length > 0) return 'Un centro online no puede tener una sala presencial';
    if (canal !== 'Discord' && canal !== 'Meet') return `La plataforma online del centro ${numero} no es valida`;
    if (urlContacto.length > 0) {
      try {
        const url = new URL(urlContacto);
        if (url.protocol !== 'https:' && url.protocol !== 'http:') {
          return 'La URL de contacto debe comenzar con http o https';
        }
      } catch {
        return `La URL del centro ${numero} no es valida`;
      }
    }
  }

  return null;
}
