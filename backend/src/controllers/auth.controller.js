import { authService } from '../services/auth.service.js';

export const authController = {
  
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const resultado = await authService.login(email, password);

      res.json({
        mensaje: 'Inicio de sesion exitoso',
        token: resultado.token,
        usuario: resultado.usuario,
      });
    } catch (error) {
      let statusCode = 400;
      if (error.message === 'Credenciales invalidas') {
        statusCode = 401;
      }
      res.status(statusCode).json({ error: error.message });
    }
  },

  async perfil(req, res) {
    try {
      const usuario = await authService.obtenerPerfil(req.usuario.id);
      res.json({ usuario });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
};
