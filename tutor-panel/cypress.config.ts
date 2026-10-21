import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:5173',
  },
  env: {
    tutorEmail: process.env.CYPRESS_TUTOR_EMAIL,
    tutorPassword: process.env.CYPRESS_TUTOR_PASSWORD,
  },
});
