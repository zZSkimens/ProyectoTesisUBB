export type CodigoErrorAplicacion =
  | 'CREDENCIALES_INVALIDAS'
  | 'CUENTA_DESHABILITADA'
  | 'SESION_INVALIDA'
  | 'USUARIO_NO_ENCONTRADO'
  | 'ESTUDIANTE_NO_ENCONTRADO'
  | 'ESTUDIANTE_DUPLICADO';

export class ErrorAplicacion extends Error {
  constructor(public readonly codigo: CodigoErrorAplicacion, mensaje: string) {
    super(mensaje);
    this.name = 'ErrorAplicacion';
  }
}
