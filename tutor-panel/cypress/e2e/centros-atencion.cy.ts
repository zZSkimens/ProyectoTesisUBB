/// <reference types="cypress" />

const tutorEmail = Cypress.expose('tutorEmail') as string;

let tokenSesion: string | null = null;
let centrosOriginales: Array<{
  numeroCentro: number;
  modalidad: string;
  oficina: string;
  horarioConsultas: string;
  canalContacto: string;
  urlContacto: string;
}> | null = null;

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

function guardarCentrosOriginales(): void {
  cy.then(() => {
    expect(tokenSesion, 'sesión autenticada para consultar centros').to.be.a('string').and.not.be.empty;
    return cy.request({
      url: '/api/tutores/centros-atencion',
      headers: { Authorization: `Bearer ${tokenSesion}` },
    });
  }).then((respuesta) => {
    expect(respuesta.status).to.equal(200);
    const centros = respuesta.body.centros as Array<Record<string, unknown>>;
    expect(centros, 'deben existir dos centros previamente guardados').to.have.length(2);
    expect(centros.every((centro) => centro.guardado === true), 'ambos centros deben estar guardados').to.equal(true);
    centrosOriginales = centros.map((centro) => ({
      numeroCentro: Number(centro.numeroCentro),
      modalidad: String(centro.modalidad),
      oficina: String(centro.oficina),
      horarioConsultas: String(centro.horarioConsultas),
      canalContacto: String(centro.canalContacto),
      urlContacto: String(centro.urlContacto),
    }));
  });
}

function abrirSeccion(nombre: string): void {
  cy.contains('button', nombre).click();
}

function centro(numero: 1 | 2): Cypress.Chainable<JQuery<HTMLFormElement>> {
  return cy.get('form.consultas-center-form').eq(numero - 1);
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
  centro(numero).find('select').eq(0).select(String(dias.length));
  centro(numero).find('input[type="checkbox"]').then(($checkboxes) => {
    const diasActuales = Array.from($checkboxes)
      .filter((checkbox) => (checkbox as HTMLInputElement).checked)
      .map((checkbox) => (checkbox.closest('label')?.textContent || '').trim());

    diasActuales
      .filter((dia) => !dias.includes(dia))
      .forEach((dia) => {
        centro(numero).contains('label', dia).find('input[type="checkbox"]').uncheck({ force: true });
      });

    dias
      .filter((dia) => !diasActuales.includes(dia))
      .forEach((dia) => {
        centro(numero).contains('label', dia).find('input[type="checkbox"]').check({ force: true });
      });
  });
  centro(numero).find('input[type="time"]').eq(0).clear().type(inicio);
  centro(numero).find('input[type="time"]').eq(1).clear().type(termino);
}

function guardarCentro(numero: 1 | 2): void {
  centro(numero).find('button[type="submit"]').click();
  cy.wait('@guardarCentro').its('response.statusCode').should('equal', 200);
}

describe('E2E: actualización de centros de atención', () => {
  beforeEach(() => {
    tokenSesion = null;
    centrosOriginales = null;
  });

  afterEach(() => {
    if (tokenSesion && centrosOriginales) {
      cy.request({
        method: 'PUT',
        url: '/api/tutores/centros-atencion',
        headers: { Authorization: `Bearer ${tokenSesion}` },
        body: { centros: centrosOriginales },
      }).its('status').should('equal', 200);
    }
  });

  it('inicia sesión, actualiza ambos centros dos veces y confirma los cambios tras recargar', () => {
    const sufijo = `${Date.now()}`;
    const urlMeet = `https://meet.google.com/e2e-inicial-${sufijo}`;
    const urlDiscord = `https://discord.gg/e2e-${sufijo}`;
    iniciarSesion();
    abrirSeccion('Horario de Consultas');
    cy.contains('h3', 'Horario de Atención para Consultas').should('be.visible');

    guardarCentrosOriginales();
    cy.intercept('PUT', '**/api/tutores/centros-atencion').as('guardarCentro');

    abrirCentroSiEstáCerrado(1);
    configurarDiasYHoras(1, ['Martes', 'Jueves'], '10:00', '12:00');
    centro(1).find('select').eq(1).select('presencial');
    centro(1).find('select').eq(2).select('AB');
    centro(1).find('select').eq(3).select('2');
    centro(1).find('select').eq(4).select('A202AB');
    guardarCentro(1);

    abrirCentroSiEstáCerrado(2);
    configurarDiasYHoras(2, ['Miércoles'], '14:00', '15:00');
    centro(2).find('select').eq(1).select('online');
    centro(2).find('select').eq(2).select('Meet');
    centro(2).find('input[type="url"]').clear().type(urlMeet);
    guardarCentro(2);
    cy.contains('.consultas-card-preview h5', 'Centro de atención 2').parent().within(() => {
      cy.contains('Meet').should('be.visible');
      cy.contains(urlMeet).should('be.visible');
      cy.contains('discord.gg').should('not.exist');
    });

    abrirCentroSiEstáCerrado(1);
    configurarDiasYHoras(1, ['Lunes'], '16:00', '17:00');
    centro(1).find('select').eq(1).select('online');
    centro(1).find('select').eq(2).select('Discord');
    centro(1).find('input[type="url"]').clear().type(urlDiscord);
    guardarCentro(1);

    abrirCentroSiEstáCerrado(2);
    configurarDiasYHoras(2, ['Viernes', 'Sábado'], '09:00', '10:00');
    centro(2).find('select').eq(1).select('presencial');
    centro(2).find('select').eq(2).select('AC');
    centro(2).find('select').eq(3).select('3');
    centro(2).find('select').eq(4).select('A308AC');
    guardarCentro(2);

    cy.reload();
    abrirSeccion('Horario de Consultas');
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
