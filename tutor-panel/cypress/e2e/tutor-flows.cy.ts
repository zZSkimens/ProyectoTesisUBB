const cypressEnv = Cypress.config().env as Record<string, unknown>;
const tutorEmail = typeof cypressEnv.tutorEmail === 'string' ? cypressEnv.tutorEmail : undefined;
const tutorPassword = typeof cypressEnv.tutorPassword === 'string' ? cypressEnv.tutorPassword : undefined;

let estudianteCreadoId: number | null = null;
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
  expect(tutorEmail, 'TEST_TUTOR_EMAIL en backend/.env.test').to.be.a('string').and.not.be.empty;
  expect(tutorPassword, 'TEST_TUTOR_PASSWORD en backend/.env.test').to.be.a('string').and.not.be.empty;

  cy.request('/api/status').its('status').should('equal', 200);

  cy.visit('/');
  cy.get('input[placeholder="ejemplo@alumnos.ubiobio.cl"]').type(tutorEmail!);
  cy.get('input[type="password"]').type(tutorPassword!, { log: false });
  cy.contains('button', 'Ingresar al Panel').click();
  cy.contains('button', 'Nómina de Estudiantes', { timeout: 15000 }).should('be.visible');
  cy.window().then((ventana) => {
    tokenSesion = ventana.sessionStorage.getItem('token');
    expect(tokenSesion, 'sesión autenticada').to.be.a('string').and.not.be.empty;
  });
}

function guardarCentrosOriginales(): void {
  expect(tokenSesion, 'sesión autenticada para consultar centros').to.be.a('string').and.not.be.empty;
  cy.request({
    url: '/api/tutores/centros-atencion',
    headers: { Authorization: `Bearer ${tokenSesion}` },
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

function centro(numero: 1 | 2): Cypress.Chainable<JQuery<HTMLFormElement>> {
  return cy.get('form.consultas-center-form').eq(numero - 1);
}

function configurarDiasYHoras(
  formulario: Cypress.Chainable<JQuery<HTMLFormElement>>,
  dias: string[],
  inicio: string,
  termino: string
): void {
  formulario.find('select').eq(0).select(String(dias.length));
  formulario.find('input[type="checkbox"]').each(($checkbox) => {
    if (($checkbox[0] as HTMLInputElement).checked) {
      cy.wrap($checkbox).uncheck({ force: true });
    }
  });
  dias.forEach((dia) => formulario.contains('label', dia).find('input[type="checkbox"]').check({ force: true }));
  formulario.find('input[type="time"]').eq(0).clear().type(inicio);
  formulario.find('input[type="time"]').eq(1).clear().type(termino);
}

function guardarCentro(formulario: Cypress.Chainable<JQuery<HTMLFormElement>>): void {
  cy.intercept('PUT', '**/api/tutores/centros-atencion').as('guardarCentro');
  formulario.find('button[type="submit"]').click();
  cy.wait('@guardarCentro').its('response.statusCode').should('equal', 200);
}

describe('Flujos E2E del panel del tutor', () => {
  beforeEach(() => {
    estudianteCreadoId = null;
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

  it('inicia sesión, actualiza ambos centros dos veces y confirma los cambios tras recargar', () => {
    const sufijo = `${Date.now()}`;
    iniciarSesion();
    abrirSeccion('Horario de Consultas');
    cy.contains('h3', 'Horario de Atención para Consultas').should('be.visible');

    let formulario = centro(1);
    guardarCentrosOriginales();

    configurarDiasYHoras(formulario, ['Martes', 'Jueves'], '10:00', '12:00');
    formulario.find('select').eq(1).select('presencial');
    formulario.find('select').eq(2).select('AB');
    formulario.find('select').eq(3).select('2');
    formulario.find('select').eq(4).select('A202AB');
    guardarCentro(formulario);

    formulario = centro(2);
    configurarDiasYHoras(formulario, ['Miércoles'], '14:00', '15:00');
    formulario.find('select').eq(1).select('online');
    formulario.find('select').eq(2).select('Meet');
    formulario.find('input[type="url"]').type(`https://meet.google.com/e2e-inicial-${sufijo}`);
    guardarCentro(formulario);

    formulario = centro(1);
    configurarDiasYHoras(formulario, ['Lunes'], '16:00', '17:00');
    formulario.find('select').eq(1).select('online');
    formulario.find('select').eq(2).select('Discord');
    formulario.find('input[type="url"]').type(`https://discord.gg/e2e-${sufijo}`);
    guardarCentro(formulario);

    formulario = centro(2);
    configurarDiasYHoras(formulario, ['Viernes', 'Sábado'], '09:00', '10:00');
    formulario.find('select').eq(1).select('presencial');
    formulario.find('select').eq(2).select('AC');
    formulario.find('select').eq(3).select('3');
    formulario.find('select').eq(4).select('A308AC');
    guardarCentro(formulario);

    cy.reload();
    abrirSeccion('Horario de Consultas');
    cy.contains('h3', 'Horario de Atención para Consultas').should('be.visible');
    cy.get('.consultas-card-preview').within(() => {
      cy.contains('h5', 'Centro de atención 1').should('be.visible');
      cy.contains('h5', 'Centro de atención 2').should('be.visible');
      cy.contains('Lunes de 16:00 a 17:00 hrs').should('be.visible');
      cy.contains('Discord').should('be.visible');
      cy.contains(`https://discord.gg/e2e-${sufijo}`).should('be.visible');
      cy.contains('Viernes, Sábado de 09:00 a 10:00 hrs').should('be.visible');
      cy.contains('Sala A308AC').should('be.visible');
    });
  });
});
