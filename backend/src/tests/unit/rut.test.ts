import { describe, expect, it } from 'vitest';
import { formatearRut, normalizarRut, rutValido } from '../../utils/rut.js';

describe('validación de RUT', () => {
  it('acepta un RUT válido con puntos y guion', () => {
    expect(rutValido('21.111.222-0')).toBe(true);
  });

  it('rechaza un dígito verificador incorrecto', () => {
    expect(rutValido('21.111.222-3')).toBe(false);
  });

  it('normaliza y formatea el RUT', () => {
    expect(normalizarRut('21.111.222-0')).toBe('211112220');
    expect(formatearRut('211112220')).toBe('21.111.222-0');
  });
});
