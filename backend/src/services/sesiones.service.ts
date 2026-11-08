import { createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '../../db/connection.js';
import { tokensRevocados } from '../../db/schema.js';

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export const sesionesService = {
  async estaRevocado(token: string): Promise<boolean> {
    const [registro] = await db.select({ hash: tokensRevocados.hash })
      .from(tokensRevocados).where(eq(tokensRevocados.hash, hashToken(token))).limit(1);
    return Boolean(registro);
  },
  async revocar(token: string, expiracion: number): Promise<void> {
    await db.insert(tokensRevocados).values({
      hash: hashToken(token),
      expiraEn: new Date(expiracion * 1000),
    }).onConflictDoNothing();
  },
};
