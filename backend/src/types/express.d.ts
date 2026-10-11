export interface UsuarioPayload {
  id: number;
  email: string;
  rol: string;
  nombre?: string;
  [key: string]: any;
}

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioPayload;
    }
  }
}
