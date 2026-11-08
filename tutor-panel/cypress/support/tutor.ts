export interface TutorE2E {
  id: number;
  email: string;
  password: string;
}

let tutorTemporalId: number | null = null;

export function iniciarSesion(): Cypress.Chainable<string> {
  return cy.request('/api/status').its('status').should('equal', 200)
    .then(() => cy.task<TutorE2E>('crearTutorE2E', null, { log: false }))
    .then(({ id, email, password }) => {
      tutorTemporalId = id;
      cy.visit('/');
      cy.get('input[placeholder="ejemplo@alumnos.ubiobio.cl"]').type(email);
      cy.get('input[type="password"]').type(password, { log: false });
      cy.contains('button', 'Ingresar al Panel').click();
      cy.contains('button', 'Nómina de Estudiantes', { timeout: 15_000 }).should('be.visible');
      return cy.window().then((ventana) => {
        const token = ventana.sessionStorage.getItem('token');
        if (!token) throw new Error('El panel no inició la sesión del tutor de pruebas');
        return token;
      });
    });
}

export function limpiarTutorE2E() {
  if (tutorTemporalId === null) return;
  return cy.task('quitarTutorE2E', tutorTemporalId, { log: false }).then(() => {
    tutorTemporalId = null;
  });
}
