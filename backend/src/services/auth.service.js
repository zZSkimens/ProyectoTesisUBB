import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../../db/connection.js';
import { usuarios } from '../../db/schema.js';
import { config } from '../config/env.js';

export const authService = {
  
  async login(email, password) {
    
    const [usuario] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email.toLowerCase().trim()))
      .limit(1);

    if (!usuario) {
      throw new Error('Credenciales invalidas');
    }

    if (!usuario.activo) {
      throw new Error('Esta cuenta ha sido deshabilitada');
    }

    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValida) {
      throw new Error('Credenciales invalidas');
    }

    const payload = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: '24h', 
    });

    return {
      token,
      usuario: payload,
    };
  },

  async obtenerPerfil(usuarioId) {
    const [usuario] = await db
      .select({
        id: usuarios.id,
        nombre: usuarios.nombre,
        email: usuarios.email,
        rol: usuarios.rol,
        activo: usuarios.activo,
        creadoEn: usuarios.creadoEn,
      })
      .from(usuarios)
      .where(eq(usuarios.id, usuarioId))
      .limit(1);

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    return usuario;
  },
};
