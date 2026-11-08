import { describe, expect, it } from 'vitest';
import { correoEstudiantilValido, horarioConsultasValido, validarCentroAtencion } from '../../utils/validacionesTutor.js';

describe('validación de correo estudiantil', () => {
  it('acepta el dominio institucional aunque tenga espacios o mayúsculas', () => {
    expect(correoEstudiantilValido('  Alumno.Nombre@ALUMNOS.UBIOBIO.CL  ')).toBe(true);
  });

  it('rechaza correos de otros dominios y valores que no sean texto', () => {
    expect(correoEstudiantilValido('alumno@gmail.com')).toBe(false);
    expect(correoEstudiantilValido(null)).toBe(false);
  });
});

describe('validación de horario de consultas', () => {
  it('acepta disponibilidad de uno o dos días', () => {
    expect(horarioConsultasValido('Martes de 15:00 a 17:00')).toBe(true);
    expect(horarioConsultasValido('Martes y jueves de 15:00 a 17:00')).toBe(true);
  });

  it('rechaza horarios sin día, con más de dos días o demasiado cortos', () => {
    expect(horarioConsultasValido('15:00 a 17:00')).toBe(false);
    expect(horarioConsultasValido('Lunes, martes y miércoles')).toBe(false);
    expect(horarioConsultasValido('')).toBe(false);
  });
});

describe('validación de centros de atención', () => {
  it('acepta un centro presencial con sala disponible', () => {
    expect(validarCentroAtencion({
      modalidad: 'presencial', oficina: 'A101AA', horarioConsultas: 'Jueves de 15:00 a 17:00',
      canalContacto: '', urlContacto: '',
    }, 1)).toBeNull();
  });

  it('rechaza una sala que no existe en el edificio seleccionado', () => {
    expect(validarCentroAtencion({
      modalidad: 'presencial', oficina: 'A109AA', horarioConsultas: 'Jueves de 15:00 a 17:00',
      canalContacto: '', urlContacto: '',
    }, 1)).toBe('La sala del centro 1 no esta disponible');
  });

  it('acepta un centro online con Discord y una URL https', () => {
    expect(validarCentroAtencion({
      modalidad: 'online', oficina: '', horarioConsultas: 'Miércoles de 20:00 a 20:45',
      canalContacto: 'Discord', urlContacto: 'https://discord.gg/ejemplo',
    }, 2)).toBeNull();
  });

  it('rechaza la modalidad online con canal inválido o sala presencial', () => {
    const base = { modalidad: 'online', oficina: '', horarioConsultas: 'Miércoles de 20:00 a 20:45', urlContacto: '' };
    expect(validarCentroAtencion({ ...base, canalContacto: 'Zoom' }, 2)).toBe('La plataforma online del centro 2 no es valida');
    expect(validarCentroAtencion({ ...base, oficina: 'A101AA', canalContacto: 'Meet' }, 2)).toBe('Un centro online no puede tener una sala presencial');
  });
});
