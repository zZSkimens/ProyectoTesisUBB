export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'tutor' | 'admin' | string;
  activo: boolean;
  createdAt?: string;
}

export interface Mision {
  id: number;
  titulo: string;
  descripcion: string;
  nivelDificultad: string;
  puntosRecompensa: number;
}

export interface ProgresoEstudiante {
  id: number;
  estudianteId: number;
  misionId: number;
  estado: 'completada' | 'en_progreso' | 'pendiente';
  puntajeObtenido: number;
  intentos: number;
  fechaCompletado?: string | null;
  mision?: Mision;
}

export interface Estudiante {
  id: number;
  rut: string;
  nombre: string;
  email: string;
  carrera: string;
  anioIngreso?: number;
  añoIngreso?: number;
  tutorId?: number;
  misionesCompletadas?: number;
  totalMisiones?: number;
  porcentajeAvance?: number;
  estadoAtencion?: string;
  puntosTotales?: number;
  ultimoAcceso?: string | null;
  progresos?: ProgresoEstudiante[];
  promedioProgreso?: number;
  estado?: string;
}

export interface MetricasDashboard {
  totalEstudiantes: number;
  totalMisiones?: number;
  promedioAvanceGrupal?: number;
  estudiantesEnRiesgo?: number;
  estudiantesAlDia?: number;
  misionesCompletadas?: number;
  promedioPuntos?: number;
  estudiantesActivos?: number;
}

export interface MisionDetalleEstudiante {
  misionId: number;
  modulo?: string;
  titulo: string;
  descripcion: string;
  estado: 'completada' | 'en_progreso' | 'pendiente' | string;
  fechaCompletado?: string | null;
  puntajeObtenido: number;
  puntosMaximos: number;
  intentos: number;
}

export interface DetalleEstudianteResponse {
  estudiante: Estudiante;
  misiones: MisionDetalleEstudiante[];
}

export interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
  error: string | null;
  estaAutenticado: boolean;
  esTutor: boolean;
  esAdmin: boolean;
  iniciarSesion: (email: string, password: string) => Promise<Usuario>;
  cerrarSesion: () => void;
}
