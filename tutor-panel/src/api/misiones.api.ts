import { apiClient } from './client';

export const LUGARES_MISION = ['Biblioteca', 'Casino', 'FACE', 'Apoyo estudiantil', 'DDE'] as const;
export const MODULOS_MISION = ['Descubre la UBB', 'Caja de herramientas'] as const;
export interface BorradorInput {
  titulo: string;
  objetivo: string;
  descripcion: string;
  lugar: typeof LUGARES_MISION[number];
  modulo: string;
  puntosRecompensa: number;
  orden: number;
}
export interface BorradorMision extends BorradorInput {
  id: number;
  codigo: string;
  estadoPublicacion: 'borrador';
  actualizadoEn: string;
}
export const misionesApi = {
  actualizarActivacion: (id: number, activa: boolean) => apiClient<{ mensaje: string }>(
    `/misiones/${id}/${activa ? 'reactivar' : 'desactivar'}`,
    { method: 'PATCH' },
  ),
  quitarDeLista: (id: number) => apiClient<{ mensaje: string }>(`/misiones/${id}/asignacion`, {
    method: 'DELETE',
  }),
  listar: () => apiClient<{ misiones: BorradorMision[] }>('/misiones/borradores'),
  publicar: (id: number, condicionCumplimiento: string) => apiClient<{ mensaje: string }>(
    `/misiones/borradores/${id}/publicar`,
    { method: 'POST', body: { condicionCumplimiento } },
  ),
  guardar: (datos: BorradorInput, id?: number) => apiClient<{ mision: BorradorMision }>(
    `/misiones/borradores${id === undefined ? '' : `/${id}`}`,
    { method: id === undefined ? 'POST' : 'PUT', body: datos },
  ),
};
