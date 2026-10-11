export function normalizarRut(rut: string): string {
  return rut.replace(/[.\s-]/g, '').toUpperCase();
}

export function formatearRut(rut: string): string {
  const rutNormalizado = normalizarRut(rut);
  const cuerpo = rutNormalizado.slice(0, -1);
  const digitoVerificador = rutNormalizado.slice(-1);
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${cuerpoFormateado}-${digitoVerificador}`;
}

export function rutChilenoValido(rut: string): boolean {
  const rutNormalizado = normalizarRut(rut);

  if (!/^\d{7,8}[0-9K]$/.test(rutNormalizado)) {
    return false;
  }

  const cuerpo = rutNormalizado.slice(0, -1);
  const digitoIngresado = rutNormalizado.slice(-1);
  const cuerpoNumerico = Number(cuerpo);

  if (cuerpoNumerico < 1000000) {
    return false;
  }

  let suma = 0;
  let multiplicador = 2;

  for (let indice = cuerpo.length - 1; indice >= 0; indice--) {
    suma += Number(cuerpo[indice]) * multiplicador;
    multiplicador += 1;

    if (multiplicador > 7) {
      multiplicador = 2;
    }
  }

  const resto = suma % 11;
  const resultado = 11 - resto;
  let digitoEsperado = String(resultado);

  if (resultado === 11) {
    digitoEsperado = '0';
  } else if (resultado === 10) {
    digitoEsperado = 'K';
  }

  return digitoIngresado === digitoEsperado;
}
