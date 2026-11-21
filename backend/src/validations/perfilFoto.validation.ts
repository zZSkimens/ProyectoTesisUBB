import { raw, type RequestHandler } from 'express';
import sharp from 'sharp';
import type { FotoPerfil, TipoFotoPerfil } from '../services/perfilFoto.service.js';

export const MAX_FOTO_PERFIL_BYTES = 5 * 1024 * 1024;

const tiposPermitidos = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const firmaPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const firmaJpeg = Buffer.from([0xff, 0xd8, 0xff]);

export const leerFotoPerfil = raw({
  type: tiposPermitidos,
  limit: MAX_FOTO_PERFIL_BYTES,
  inflate: false,
});

function detectarTipo(contenido: Buffer): TipoFotoPerfil | undefined {
  if (contenido.length >= 33 && contenido.subarray(0, 8).equals(firmaPng) &&
      contenido.toString('latin1', 12, 16) === 'IHDR') {
    return 'image/png';
  }
  if (contenido.length > 3 && contenido.subarray(0, 3).equals(firmaJpeg)) {
    return 'image/jpeg';
  }
  if (contenido.length >= 20 && contenido.toString('latin1', 0, 4) === 'RIFF' &&
      contenido.toString('latin1', 8, 12) === 'WEBP' &&
      ['VP8 ', 'VP8L', 'VP8X'].includes(contenido.toString('latin1', 12, 16))) {
    return 'image/webp';
  }
}

export const validarFotoPerfil: RequestHandler = async (req, res, next) => {
  const tipo = req.get('Content-Type')?.split(';', 1)[0].trim().toLowerCase();
  if (!tipo || !tiposPermitidos.includes(tipo)) {
    res.status(415).json({ error: 'El formato de la foto debe ser PNG, JPG o WEBP.' });
    return;
  }

  const contenido = req.body;
  if (!Buffer.isBuffer(contenido) || contenido.length === 0) {
    res.status(400).json({ error: 'Selecciona una imagen para guardar como foto de perfil.' });
    return;
  }

  const tipoMime = detectarTipo(contenido);
  if (!tipoMime) {
    res.status(400).json({ error: 'La imagen está dañada o incompleta.' });
    return;
  }
  if (tipoMime !== (tipo === 'image/jpg' ? 'image/jpeg' : tipo)) {
    res.status(415).json({ error: 'El archivo no coincide con el formato de imagen indicado.' });
    return;
  }

  try {
    // Calcular estadísticas obliga a decodificar los píxeles de toda la imagen.
    await sharp(contenido, { failOn: 'warning', animated: true }).stats();
  } catch {
    res.status(400).json({ error: 'La imagen está dañada o incompleta.' });
    return;
  }

  const foto: FotoPerfil = { tipoMime, contenido };
  res.locals.fotoPerfil = foto;
  next();
};
