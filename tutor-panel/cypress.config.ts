import { defineConfig } from 'cypress';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import type { TutorE2E } from './cypress/support/tutor';

const ejecutar = promisify(execFile);
const backend = fileURLToPath(new URL('../backend/', import.meta.url));
const baseUrl = process.env.CYPRESS_BASE_URL || 'http://localhost:5173';
const url = new URL(baseUrl);
if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(url.hostname)) {
  throw new Error('Cypress requiere un servidor de pruebas local');
}

export default defineConfig({
  viewportWidth: 1366,
  viewportHeight: 768,
  e2e: {
    baseUrl,
    setupNodeEvents(on) {
      const tutoresCreados = new Map<number, string>();
      const ejecutarTutor = (...args: string[]) => ejecutar(process.execPath,
        ['--import', 'tsx', 'src/tests/tutorE2E.ts', ...args], { cwd: backend });

      async function quitarTutorE2E(id: number) {
        const email = tutoresCreados.get(id);
        if (email) {
          await ejecutarTutor('quitar', String(id), email);
          tutoresCreados.delete(id);
        }
        return null;
      }

      on('task', {
        async crearTutorE2E() {
          const { stdout } = await ejecutarTutor('crear');
          const tutor = JSON.parse(stdout) as TutorE2E;
          tutoresCreados.set(tutor.id, tutor.email);
          return tutor;
        },
        quitarTutorE2E,
      });
      on('after:run', async () => {
        for (const id of tutoresCreados.keys()) await quitarTutorE2E(id);
      });
    },
  },
});
