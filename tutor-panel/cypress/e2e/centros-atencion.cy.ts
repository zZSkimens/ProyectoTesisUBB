/// <reference types="cypress" />

import { iniciarSesion, limpiarTutorE2E } from '../support/tutor';

function prepararCentros(token: string) {
  return cy.request({
    method: 'PUT',
    url: '/api/tutores/centros-atencion',
    headers: { Authorization: `Bearer ${token}` },
    body: { centros: [
      { numeroCentro: 1, modalidad: 'presencial', oficina: 'A101AA', horarioConsultas: 'Martes de 09:00 a 10:00 hrs', canalContacto: '', urlContacto: '' },
      { numeroCentro: 2, modalidad: 'presencial', oficina: 'A102AA', horarioConsultas: 'Jueves de 09:00 a 10:00 hrs', canalContacto: '', urlContacto: '' },
    ] },
  }).its('status').should('equal', 200);
}

function abrirSeccion(nombre: string): void {
  cy.contains('button', nombre).click();
}

function centro(numero: 1 | 2) {
  return cy.contains('form.consultas-center-form h5', `Centro de atención ${numero}`).closest('form');
}

function campo(numero: 1 | 2, etiqueta: string) {
  return centro(numero).contains('label', etiqueta).parent();
}

function abrirCentroSiEstáCerrado(numero: 1 | 2): void {
  centro(numero).find('.consultas-mobile-toggle').then(($boton) => {
    if ($boton.is(':visible') && $boton.attr('aria-expanded') !== 'true') {
      cy.wrap($boton).click();
    }
  });
}

function configurarDiasYHoras(
  numero: 1 | 2,
  dias: string[],
  inicio: string,
  termino: string
): void {
  campo(numero, '¿Cuántos días por semana?').find('select').select(String(dias.length));
  centro(numero).find('input[type="checkbox"]').then(($checkboxes) => {
    const diasActuales = Array.from($checkboxes)
      .filter((checkbox) => (checkbox as HTMLInputElement).checked)
      .map((checkbox) => (checkbox.closest('label')?.textContent || '').trim());

    diasActuales
      .filter((dia) => !dias.includes(dia))
      .forEach((dia) => {
        centro(numero).contains('label', dia).find('input[type="checkbox"]').uncheck();
      });

    dias
      .filter((dia) => !diasActuales.includes(dia))
      .forEach((dia) => {
        centro(numero).contains('label', dia).find('input[type="checkbox"]').check();
      });
  });
  campo(numero, 'Hora de inicio').find('input[type="time"]').clear().type(inicio);
  campo(numero, 'Hora de término').find('input[type="time"]').clear().type(termino);
}

function guardarCentro(numero: 1 | 2): void {
  centro(numero).find('button[type="submit"]').click();
  cy.wait('@guardarCentro').its('response.statusCode').should('equal', 200);
}

describe('E2E: actualización de centros de atención', () => {
  afterEach(limpiarTutorE2E);

  it('inicia sesión, actualiza ambos centros dos veces y confirma los cambios tras recargar', () => {
    const sufijo = `${Date.now()}`;
    const urlMeet = `https://meet.google.com/e2e-inicial-${sufijo}`;
    const urlDiscord = `https://discord.gg/e2e-${sufijo}`;
    iniciarSesion().then(prepararCentros);
    cy.intercept('GET', '**/api/tutores/centros-atencion').as('cargarCentros');
    abrirSeccion('Horario de Consultas');
    cy.wait('@cargarCentros').its('response.statusCode').should('equal', 200);
    cy.contains('h3', 'Horario de Atención para Consultas').should('be.visible');

    cy.intercept('PUT', '**/api/tutores/centros-atencion').as('guardarCentro');

    abrirCentroSiEstáCerrado(1);
    configurarDiasYHoras(1, ['Martes', 'Jueves'], '10:00', '12:00');
    campo(1, 'Sala de atención').find('select').eq(0).select('AB');
    campo(1, 'Sala de atención').find('select').eq(1).select('2');
    campo(1, 'Sala de atención').find('select').eq(2).select('A202AB');
    guardarCentro(1);

    abrirCentroSiEstáCerrado(2);
    configurarDiasYHoras(2, ['Miércoles'], '14:00', '15:00');
    campo(2, 'Modalidad').find('select').select('online');
    campo(2, 'Plataforma online').find('select').select('Meet');
    centro(2).find('input[type="url"]').clear().type(urlMeet);
    guardarCentro(2);
    cy.contains('.consultas-card-preview h5', 'Centro de atención 2').parent().within(() => {
      cy.contains('Meet').should('be.visible');
      cy.contains(urlMeet).should('be.visible');
      cy.contains('discord.gg').should('not.exist');
    });

    abrirCentroSiEstáCerrado(1);
    configurarDiasYHoras(1, ['Lunes'], '16:00', '17:00');
    campo(1, 'Modalidad').find('select').select('online');
    campo(1, 'Plataforma online').find('select').select('Discord');
    centro(1).find('input[type="url"]').clear().type(urlDiscord);
    guardarCentro(1);

    abrirCentroSiEstáCerrado(2);
    configurarDiasYHoras(2, ['Viernes', 'Sábado'], '09:00', '10:00');
    campo(2, 'Modalidad').find('select').select('presencial');
    campo(2, 'Sala de atención').find('select').eq(0).select('AC');
    campo(2, 'Sala de atención').find('select').eq(1).select('3');
    campo(2, 'Sala de atención').find('select').eq(2).select('A308AC');
    guardarCentro(2);

    cy.reload();
    abrirSeccion('Horario de Consultas');
    cy.wait('@cargarCentros').its('response.statusCode').should('equal', 200);
    cy.contains('h3', 'Horario de Atención para Consultas').should('be.visible');
    cy.contains('.consultas-card-preview h5', 'Centro de atención 1').parent().within(() => {
      cy.contains('Lunes de 16:00 a 17:00 hrs').should('be.visible');
      cy.contains('Discord').should('be.visible');
      cy.contains(urlDiscord).should('be.visible');
      cy.contains('meet.google.com').should('not.exist');
    });
    cy.contains('.consultas-card-preview h5', 'Centro de atención 2').parent().within(() => {
      cy.contains('Viernes, Sábado de 09:00 a 10:00 hrs').should('be.visible');
      cy.contains('Sala A308AC').should('be.visible');
    });
  });
});
