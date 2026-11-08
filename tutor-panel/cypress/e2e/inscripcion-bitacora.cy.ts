/// <reference types="cypress" />

import { iniciarSesion, limpiarTutorE2E } from '../support/tutor';

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
  afterEach(limpiarTutorE2E);

  it('inscribe un estudiante, recupera la bitácora tras un fallo y conserva la observación', () => {
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
      expect(response?.body.estudiante.id).to.be.a('number');
    });

    let fallarConsulta = true;
    cy.intercept('GET', '**/api/tutores/estudiantes/*/observaciones', (solicitud) => {
      if (fallarConsulta) {
        solicitud.alias = 'bitacoraNoDisponible';
        solicitud.reply({ statusCode: 503, body: { error: 'Bitácora no disponible en esta consulta' } });
      } else {
        solicitud.alias = 'cargarBitacora';
        solicitud.continue();
      }
    });
    cy.contains('tr', nombre).should('be.visible').within(() => {
      cy.contains('button', 'Ver Ficha').click();
    });
    cy.wait('@bitacoraNoDisponible').its('response.statusCode').should('equal', 503);
    cy.contains('button', 'Bitácora de Observaciones').click();
    cy.contains('h2', 'Ficha de Progreso del Estudiante').should('be.visible');
    cy.contains('[role="alert"]', 'No se pudo cargar la bitácora').should('be.visible');
    cy.contains('No hay observaciones previas registradas').should('not.exist');

    cy.then(() => { fallarConsulta = false; });
    cy.contains('button', 'Reintentar').click();
    cy.wait('@cargarBitacora').its('response.statusCode').should('equal', 200);
    cy.contains('No hay observaciones previas registradas').should('be.visible');
    cy.contains('[role="alert"]', 'No se pudo cargar la bitácora').should('not.exist');

    cy.contains('h5', 'Registrar Nueva Observación o Compromiso').parent().within(() => {
      cy.contains('label', 'Tipo').parent().find('select').select('compromiso');
      cy.contains('label', 'Título / Motivo').parent().find('select').select('Compromiso académico');
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
