/// <reference types="cypress" />

const tutorEmail = Cypress.expose('tutorEmail') as string;

let estudianteCreadoId: number | null = null;
let tokenSesion: string | null = null;

function iniciarSesion(): void {
  expect(tutorEmail, 'correo de la cuenta tutor definida para Cypress').to.be.a('string').and.not.be.empty;

  cy.env(['tutorPassword']).then(({ tutorPassword }) => {
    expect(tutorPassword, 'contraseña de la cuenta tutor definida para Cypress').to.be.a('string').and.not.be.empty;

    cy.request('/api/status').its('status').should('equal', 200);

    cy.visit('/');
    cy.get('input[placeholder="ejemplo@alumnos.ubiobio.cl"]').type(tutorEmail);
    cy.get('input[type="password"]').type(tutorPassword, { log: false });
    cy.contains('button', 'Ingresar al Panel').click();
    cy.contains('button', 'Nómina de Estudiantes', { timeout: 15000 }).should('be.visible');
    cy.window().then((ventana) => {
      tokenSesion = ventana.sessionStorage.getItem('token');
      expect(tokenSesion, 'sesión autenticada').to.be.a('string').and.not.be.empty;
    });
  });
}

function crearRutValidoUnico(): string {
  const cuerpo = String(20_000_000 + Math.floor(Math.random() * 9_000_000));
  let suma = 0;
  let multiplicador = 2;
  for (let indice = cuerpo.length - 1; indice >= 0; indice--) {
    suma += Number(cuerpo[indice]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resultado = 11 - (suma % 11);
  const digito = resultado === 11 ? '0' : resultado === 10 ? 'K' : String(resultado);
  return `${cuerpo.slice(0, 2)}.${cuerpo.slice(2, 5)}.${cuerpo.slice(5)}-${digito}`;
}

function abrirSeccion(nombre: string): void {
  cy.contains('button', nombre).click();
}

describe('E2E: inscripción de estudiante y bitácora', () => {
  beforeEach(() => {
    estudianteCreadoId = null;
    tokenSesion = null;
  });

  afterEach(() => {
    if (tokenSesion && estudianteCreadoId !== null) {
      cy.request({
        method: 'DELETE',
        url: `/api/tutores/estudiantes/${estudianteCreadoId}`,
        headers: { Authorization: `Bearer ${tokenSesion}` },
        failOnStatusCode: false,
      });
    }
  });

  it('inicia sesión, inscribe un estudiante y registra una observación en su bitácora', () => {
    const sufijo = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const nombre = `E2E${sufijo} Prueba`;
    const email = `e2e${sufijo}.prueba2601@alumnos.ubiobio.cl`;
    const rut = crearRutValidoUnico();

    iniciarSesion();
    abrirSeccion('Nómina de Estudiantes');
    cy.contains('button', 'Inscribir Estudiante').click();
    cy.get('input[placeholder="Ej: 21.999.888-7"]').type(rut);
    cy.get('input[placeholder="Ej: Camila Andrea Soto Bravo"]').type(nombre);
    cy.get('input[placeholder="Ej: camila.soto2601@alumnos.ubiobio.cl"]').should('have.value', email);

    cy.intercept('POST', '**/api/tutores/estudiantes').as('crearEstudiante');
    cy.contains('button', 'Registrar Estudiante').click();
    cy.wait('@crearEstudiante').then(({ response }) => {
      expect(response?.statusCode).to.equal(201);
      estudianteCreadoId = response?.body.estudiante.id;
      expect(estudianteCreadoId).to.be.a('number');
    });

    cy.contains('tr', nombre).should('be.visible').within(() => {
      cy.contains('button', 'Ver Ficha').click();
    });
    cy.contains('button', 'Bitácora de Observaciones').click();
    cy.contains('h5', 'Registrar Nueva Observación o Compromiso').parent().within(() => {
      cy.get('select').eq(1).select('compromiso');
      cy.get('select').eq(0).select('Compromiso académico');
      cy.get('textarea').type('Registro E2E para comprobar la bitácora del estudiante.');
      cy.get('input[placeholder="Ej: Realizar la misión DDE antes del próximo taller"]')
        .type('Completar una actividad antes de la próxima tutoría.');
      cy.intercept('POST', '**/api/tutores/estudiantes/*/observaciones').as('crearObservacion');
      cy.contains('button', 'Guardar Observación').click();
    });
    cy.wait('@crearObservacion').its('response.statusCode').should('equal', 201);
    cy.contains('Registro E2E para comprobar la bitácora del estudiante.').should('be.visible');

    cy.reload();
    abrirSeccion('Nómina de Estudiantes');
    cy.contains('tr', nombre).should('be.visible').within(() => {
      cy.contains('button', 'Ver Ficha').click();
    });
    cy.contains('button', 'Bitácora de Observaciones').click();
    cy.contains('Registro E2E para comprobar la bitácora del estudiante.').should('be.visible');
  });
});
