import { eq } from 'drizzle-orm';
import { db } from '../../db/connection.js';
import { fotosPerfil } from '../../db/schema.js';

export type TipoFotoPerfil = 'image/png' | 'image/jpeg' | 'image/webp';

export interface FotoPerfil {
  tipoMime: TipoFotoPerfil;
  contenido: Buffer;
}

function convertirADataUrl({ tipoMime, contenido }: Pick<typeof fotosPerfil.$inferSelect, 'tipoMime' | 'contenido'>): string {
  return `data:${tipoMime};base64,${contenido.toString('base64')}`;
}

export const perfilFotoService = {
  async obtener(usuarioId: number): Promise<string | null> {
    const [foto] = await db
      .select({ tipoMime: fotosPerfil.tipoMime, contenido: fotosPerfil.contenido })
      .from(fotosPerfil)
      .where(eq(fotosPerfil.usuarioId, usuarioId));

    return foto ? convertirADataUrl(foto) : null;
  },

  async guardar(usuarioId: number, foto: FotoPerfil): Promise<string> {
    await db.insert(fotosPerfil).values({ usuarioId, ...foto }).onConflictDoUpdate({
      target: fotosPerfil.usuarioId,
      set: foto,
    });

    return convertirADataUrl(foto);
  },

  async eliminar(usuarioId: number): Promise<void> {
    await db.delete(fotosPerfil).where(eq(fotosPerfil.usuarioId, usuarioId));
  },
};
