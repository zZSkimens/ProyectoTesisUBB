import { defineConfig } from 'cypress';

// Credenciales de la cuenta de tutor creada por el seed del backend.
const tutorDePrueba = {
  email: 'rodrigo.fuentes2401@alumnos.ubiobio.cl',
  password: 'tutor123',
};

export default defineConfig({
  viewportWidth: 1366,
  viewportHeight: 768,
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:5173',
  },
  expose: {
    tutorEmail: tutorDePrueba.email,
  },
  env: {
    tutorPassword: tutorDePrueba.password,
  },
});
