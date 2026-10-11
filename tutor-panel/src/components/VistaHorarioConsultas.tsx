import type React from 'react';
import { useState, useEffect } from 'react';
import { Clock, MapPin, MessageSquare, Save, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { tutoresApi } from '../api/tutores.api';
import type { CentroAtencionData, CentroAtencionInput } from '../types/index';

const configuracionSalas: Record<string, { pisos: number[]; salasPorPiso: number }> = {
  AA: { pisos: [1], salasPorPiso: 8 },
  AB: { pisos: [1, 2, 3], salasPorPiso: 2 },
  AC: { pisos: [1, 2, 3], salasPorPiso: 8 },
  AD: { pisos: [2, 3], salasPorPiso: 2 },
};

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

interface CentroAtencionFormulario extends CentroAtencionInput {
  edificioSala: string;
  pisoSala: number;
  diasPorSemana: number;
  diasSeleccionados: string[];
  horaInicio: string;
  horaFin: string;
  guardado: boolean;
}

const analizarHorario = (horario: string) => {
  const horarioNormalizado = horario.toLowerCase();
  let diasSeleccionados = diasSemana.filter((dia) => horarioNormalizado.includes(dia.toLowerCase()));
  if (diasSeleccionados.length > 2) {
    diasSeleccionados = diasSeleccionados.slice(0, 2);
  }
  const coincidenciaHoras = /(\d{1,2}:\d{2})\s+a\s+(\d{1,2}:\d{2})/i.exec(horario);
  let horaInicio = '';
  let horaFin = '';
  if (coincidenciaHoras) {
    horaInicio = coincidenciaHoras[1].padStart(5, '0');
    horaFin = coincidenciaHoras[2].padStart(5, '0');
  }

  let diasPorSemana = diasSeleccionados.length;
  if (diasPorSemana === 0) {
    diasPorSemana = 1;
  }

  return { diasPorSemana, diasSeleccionados, horaInicio, horaFin };
};

const formatearHorario = (centro: CentroAtencionFormulario): string => {
  const diasOrdenados = diasSemana.filter((dia) => centro.diasSeleccionados.includes(dia));
  if (diasOrdenados.length === 0 || !centro.horaInicio || !centro.horaFin) {
    return 'Pendiente de definición';
  }
  return diasOrdenados.join(', ') + ' de ' + centro.horaInicio + ' a ' + centro.horaFin + ' hrs';
};

const crearCentroVacio = (numeroCentro: number): CentroAtencionFormulario => {
  let horarioConsultas = '';
  let oficina = '';
  if (numeroCentro === 1) {
    horarioConsultas = 'Martes y Jueves de 15:00 a 17:00 hrs';
    oficina = 'A101AA';
  }

  return {
    numeroCentro,
    modalidad: 'presencial',
    oficina,
    horarioConsultas,
    canalContacto: '',
    urlContacto: '',
    guardado: false,
    edificioSala: 'AA',
    pisoSala: 1,
    ...analizarHorario(horarioConsultas),
  };
};

const convertirCentroFormulario = (centro: CentroAtencionData): CentroAtencionFormulario => {
  let edificioSala = 'AA';
  let pisoSala = 1;
  let canalContacto = centro.canalContacto;
  if (centro.modalidad === 'online' && canalContacto.length === 0) {
    canalContacto = 'Discord';
  }
  const coincidencia = centro.oficina.match(/A([1-3])\d{2}(AA|AB|AC|AD)/);
  if (coincidencia) {
    edificioSala = coincidencia[2];
    pisoSala = Number(coincidencia[1]);
  }

  return {
    numeroCentro: centro.numeroCentro,
    modalidad: centro.modalidad,
    oficina: centro.oficina,
    horarioConsultas: centro.horarioConsultas,
    canalContacto,
    urlContacto: centro.urlContacto,
    guardado: centro.guardado === true,
    edificioSala,
    pisoSala,
    ...analizarHorario(centro.horarioConsultas),
  };
};

const centroEstaConfigurado = (centro: CentroAtencionFormulario): boolean => {
  if (centro.diasSeleccionados.length === 0 || !centro.horaInicio || !centro.horaFin) {
    return false;
  }
  if (centro.modalidad === 'presencial' && centro.oficina.length > 0) {
    return true;
  }
  if (centro.modalidad === 'online' && centro.canalContacto.length > 0) {
    return true;
  }
  return false;
};

export const VistaHorarioConsultas: React.FC = () => {
  const [centros, setCentros] = useState<CentroAtencionFormulario[]>([
    crearCentroVacio(1),
    crearCentroVacio(2),
  ]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardandoCentro, setGuardandoCentro] = useState<number | null>(null);
  const [centrosAbiertos, setCentrosAbiertos] = useState<number[]>([]);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const actualizarCentro = (numeroCentro: number, cambios: Partial<CentroAtencionFormulario>) => {
    setCentros((actuales) => actuales.map((centro) => {
      if (centro.numeroCentro === numeroCentro) {
        return { ...centro, ...cambios };
      }
      return centro;
    }));
  };

  useEffect(() => {
    async function cargarHorario() {
      setCargando(true);
      setError(null);
      try {
        const res = await tutoresApi.obtenerHorarioConsultas();
        if (res && res.centros) {
          const centrosCargados = res.centros.map(convertirCentroFormulario);
          const centroUno = centrosCargados.find((centro) => centro.numeroCentro === 1);
          const centroDos = centrosCargados.find((centro) => centro.numeroCentro === 2);
          const centrosFinales = [];
          if (centroUno) {
            centrosFinales.push(centroUno);
          } else {
            centrosFinales.push(crearCentroVacio(1));
          }
          if (centroDos) {
            centrosFinales.push(centroDos);
          } else {
            centrosFinales.push(crearCentroVacio(2));
          }
          setCentros(centrosFinales);
          setCentrosAbiertos(centrosFinales
            .filter((centro) => !centro.guardado)
            .map((centro) => centro.numeroCentro));
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar el horario de atencion');
      } finally {
        setCargando(false);
      }
    }

    cargarHorario();
  }, []);

  const handleGuardarCentro = async (e: React.FormEvent<HTMLFormElement>, centro: CentroAtencionFormulario) => {
    e.preventDefault();

    if (centro.diasSeleccionados.length !== centro.diasPorSemana) {
      setError('Selecciona exactamente la cantidad de días indicada para este centro.');
      return;
    }
    if (!centro.horaInicio || !centro.horaFin || centro.horaInicio >= centro.horaFin) {
      setError('Indica una hora de inicio y una hora de término posterior para este centro.');
      return;
    }

    setGuardandoCentro(centro.numeroCentro);
    setError(null);
    setMensajeExito(null);

    try {
      const centroLimpio: CentroAtencionInput = {
        numeroCentro: centro.numeroCentro,
        modalidad: centro.modalidad,
        oficina: '',
        horarioConsultas: formatearHorario(centro),
        canalContacto: '',
        urlContacto: '',
      };
      if (centro.modalidad === 'presencial') {
        centroLimpio.oficina = centro.oficina;
      } else {
        centroLimpio.canalContacto = centro.canalContacto;
        centroLimpio.urlContacto = centro.urlContacto.trim();
      }

      const res = await tutoresApi.actualizarHorarioConsultas({ centros: [centroLimpio] });
      if (res && res.centros) {
        const centroGuardado = res.centros.find((centroActualizado) => centroActualizado.numeroCentro === centro.numeroCentro);
        if (centroGuardado) {
          const centroFormulario = convertirCentroFormulario(centroGuardado);
          setCentros((actuales) => actuales.map((centroActual) => {
            if (centroActual.numeroCentro === centro.numeroCentro) {
              return { ...centroFormulario, guardado: true };
            }
            return centroActual;
          }));
          setCentrosAbiertos((actuales) => actuales.filter((numeroCentro) => numeroCentro !== centro.numeroCentro));
        }
      }
      setMensajeExito('Centro de atención ' + centro.numeroCentro + ' guardado correctamente.');
    } catch (err: any) {
      setError(err.message || 'Ocurrio un problema al guardar los cambios.');
    } finally {
      setGuardandoCentro(null);
    }
  };

  if (cargando) {
    return (
      <div style={styles.loadingBox}>
        <Clock size={32} color="#0284c7" />
        <p style={{ color: '#64748b', marginTop: '0.75rem' }}>Cargando disponibilidad de consultas...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Horario de Atención para Consultas</h3>
          <p style={styles.subtitle}>Configura y publica dos opciones de atención para tus estudiantes asignados.</p>
        </div>
      </div>

      {mensajeExito && (
        <div style={styles.alertSuccess}>
          <CheckCircle2 size={18} color="#15803d" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {error && (
        <div style={styles.alertError}>
          <AlertCircle size={18} color="#b91c1c" />
          <span>{error}</span>
        </div>
      )}

      <div className="consultas-content-grid" style={styles.contentGrid}>
        <div className="consultas-card-form" style={styles.cardForm}>
          <h4 style={styles.cardTitle}>Configuración de Disponibilidad</h4>
          <p style={styles.cardDesc}>
            Esta información es visible para la coordinación de tutores y tus estudiantes asignados.
          </p>

          <div style={styles.form}>
            {centros.map((centro) => {
              const configuracionActual = configuracionSalas[centro.edificioSala];
              const numerosSalaDisponibles = Array.from(
                { length: configuracionActual.salasPorPiso },
                (_, indice) => indice + 1
              );
              const centroAbierto = centrosAbiertos.includes(centro.numeroCentro);
              let clasesCentro = 'consultas-center-form';
              if (centroAbierto) {
                clasesCentro += ' consultas-center-open';
              }
              let textoBotonCentro = 'Configurar';
              let resumenCentro = centro.horarioConsultas;
              if (centro.modalidad === 'presencial') {
                resumenCentro += ' · Presencial';
                if (centro.oficina) {
                  resumenCentro += ' · Sala ' + centro.oficina;
                }
              } else {
                resumenCentro += ' · Online';
                if (centro.canalContacto) {
                  resumenCentro += ' · ' + centro.canalContacto;
                }
              }
              if (centro.guardado) {
                textoBotonCentro = 'Editar';
              }
              if (centroAbierto && centro.guardado) {
                textoBotonCentro = 'Cerrar edición';
              } else if (centroAbierto) {
                textoBotonCentro = 'Ocultar';
              }

              return (
                <form className={clasesCentro} key={centro.numeroCentro} onSubmit={(e) => handleGuardarCentro(e, centro)} style={styles.centerFormCard}>
                  <div className="consultas-center-heading">
                    <div className="consultas-center-heading-info">
                      <h5 style={styles.centerTitle}>Centro de atención {centro.numeroCentro}</h5>
                      {centro.guardado && !centroAbierto && (
                        <span className="consultas-center-summary">{resumenCentro}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="consultas-mobile-toggle"
                      onClick={() => setCentrosAbiertos((actuales) => {
                        if (actuales.includes(centro.numeroCentro)) {
                          return actuales.filter((numeroCentro) => numeroCentro !== centro.numeroCentro);
                        }
                        return [...actuales, centro.numeroCentro];
                      })}
                      aria-expanded={centroAbierto}
                    >
                      <span>{textoBotonCentro}</span>
                      <ChevronDown size={16} />
                    </button>
                  </div>
                  <div className="consultas-form-fields">
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <Clock size={16} color="#0284c7" />
                      <span>¿Cuántos días por semana?</span>
                    </label>
                    <select
                      value={centro.diasPorSemana}
                      onChange={(e) => {
                        const cantidad = Number(e.target.value);
                        const diasRecortados = centro.diasSeleccionados.slice(0, cantidad);
                        actualizarCentro(centro.numeroCentro, {
                          diasPorSemana: cantidad,
                          diasSeleccionados: diasRecortados,
                        });
                      }}
                      style={styles.select}
                      disabled={guardandoCentro !== null}
                      required
                    >
                      {[1, 2].map((cantidad) => (
                        <option key={cantidad} value={cantidad}>{cantidad}</option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}><span>¿Qué días?</span></label>
                    <div className="consultas-week-days" style={styles.weekDaysGrid}>
                      {diasSemana.map((dia) => {
                        const seleccionado = centro.diasSeleccionados.includes(dia);
                        const limiteAlcanzado = centro.diasSeleccionados.length >= centro.diasPorSemana;
                        return (
                          <label className="consultas-week-day-option" key={dia} style={styles.weekDayOption}>
                            <input
                              type="checkbox"
                              checked={seleccionado}
                              disabled={guardandoCentro !== null || (!seleccionado && limiteAlcanzado)}
                              onChange={(e) => {
                                let nuevosDias: string[];
                                if (e.target.checked) {
                                  nuevosDias = [...centro.diasSeleccionados, dia];
                                } else {
                                  nuevosDias = centro.diasSeleccionados.filter((diaActual) => diaActual !== dia);
                                }
                                actualizarCentro(centro.numeroCentro, { diasSeleccionados: nuevosDias });
                              }}
                            />
                            <span>{dia}</span>
                          </label>
                        );
                      })}
                    </div>
                    <span style={styles.fieldHelp}>
                      Seleccionados: {centro.diasSeleccionados.length} de {centro.diasPorSemana} días.
                    </span>
                  </div>

                  <div className="consultas-time-range" style={styles.timeRangeRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}><span>Hora de inicio</span></label>
                      <input
                        type="time"
                        value={centro.horaInicio}
                        onChange={(e) => actualizarCentro(centro.numeroCentro, { horaInicio: e.target.value })}
                        style={styles.input}
                        disabled={guardandoCentro !== null}
                        required
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}><span>Hora de término</span></label>
                      <input
                        type="time"
                        value={centro.horaFin}
                        onChange={(e) => actualizarCentro(centro.numeroCentro, { horaFin: e.target.value })}
                        style={styles.input}
                        disabled={guardandoCentro !== null}
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}><MapPin size={16} color="#0284c7" /><span>Modalidad</span></label>
                    <select
                      value={centro.modalidad}
                      onChange={(e) => {
                        const nuevaModalidad = e.target.value as 'presencial' | 'online';
                        let nuevoCanalContacto = '';
                        if (nuevaModalidad === 'online') {
                          nuevoCanalContacto = 'Discord';
                        }
                        actualizarCentro(centro.numeroCentro, {
                          modalidad: nuevaModalidad,
                          oficina: '',
                          canalContacto: nuevoCanalContacto,
                          urlContacto: '',
                        });
                      }}
                      style={styles.select}
                      disabled={guardandoCentro !== null}
                      required
                    >
                      <option value="presencial">Presencial</option>
                      <option value="online">Online</option>
                    </select>
                  </div>

                  {centro.modalidad === 'presencial' && (
                    <div style={styles.formGroup}>
                      <label style={styles.label}><MapPin size={16} color="#0284c7" /><span>Sala de atención</span></label>
                      <div className="consultas-room-selectors" style={styles.roomSelectors}>
                        <select
                          value={centro.edificioSala}
                          onChange={(e) => {
                            const nuevoEdificio = e.target.value;
                            actualizarCentro(centro.numeroCentro, {
                              edificioSala: nuevoEdificio,
                              pisoSala: configuracionSalas[nuevoEdificio].pisos[0],
                              oficina: '',
                            });
                          }}
                          style={styles.select}
                          disabled={guardandoCentro !== null}
                          required
                        >
                          <option value="AA">Edificio AA</option>
                          <option value="AB">Edificio AB</option>
                          <option value="AC">Edificio AC</option>
                          <option value="AD">Edificio AD</option>
                        </select>
                        <select
                          value={centro.pisoSala}
                          onChange={(e) => actualizarCentro(centro.numeroCentro, {
                            pisoSala: Number(e.target.value),
                            oficina: '',
                          })}
                          style={styles.select}
                          disabled={guardandoCentro !== null}
                          required
                        >
                          {configuracionActual.pisos.map((piso) => (
                            <option key={piso} value={piso}>Piso {piso}</option>
                          ))}
                        </select>
                        <select
                          value={centro.oficina}
                          onChange={(e) => actualizarCentro(centro.numeroCentro, { oficina: e.target.value })}
                          style={styles.select}
                          disabled={guardandoCentro !== null}
                          required
                        >
                          <option value="" disabled>Selecciona una sala</option>
                          {numerosSalaDisponibles.map((numeroSala) => {
                            const codigoSala = 'A' + centro.pisoSala + String(numeroSala).padStart(2, '0') + centro.edificioSala;
                            return <option key={codigoSala} value={codigoSala}>Sala {codigoSala}</option>;
                          })}
                        </select>
                      </div>
                      <span style={styles.fieldHelp}>Selecciona edificio, piso y sala.</span>
                    </div>
                  )}

                  {centro.modalidad === 'online' && (
                    <>
                      <div style={styles.formGroup}>
                        <label style={styles.label}><MessageSquare size={16} color="#0284c7" /><span>Plataforma online</span></label>
                        <select
                          value={centro.canalContacto}
                          onChange={(e) => actualizarCentro(centro.numeroCentro, { canalContacto: e.target.value })}
                          style={styles.select}
                          disabled={guardandoCentro !== null}
                          required
                        >
                          <option value="Discord">Discord</option>
                          <option value="Meet">Meet</option>
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}><span>URL de contacto (opcional)</span></label>
                        <input
                          type="url"
                          value={centro.urlContacto}
                          onChange={(e) => actualizarCentro(centro.numeroCentro, { urlContacto: e.target.value })}
                          placeholder="https://..."
                          style={styles.input}
                          disabled={guardandoCentro !== null}
                        />
                      </div>
                    </>
                  )}
                  <div style={styles.btnRow}>
                    <button type="submit" disabled={guardandoCentro !== null} className="btn-primary consultas-save-button" style={styles.saveBtn}>
                      <Save size={16} />
                      <span>
                        {guardandoCentro === centro.numeroCentro && 'Guardando...'}
                        {guardandoCentro !== centro.numeroCentro && centro.guardado && 'Actualizar Centro ' + centro.numeroCentro}
                        {guardandoCentro !== centro.numeroCentro && !centro.guardado && 'Guardar Centro ' + centro.numeroCentro}
                      </span>
                    </button>
                  </div>
                  </div>
                </form>
              );
            })}

          </div>
        </div>

        <div className="consultas-card-preview" style={styles.cardPreview}>
          <h4 style={styles.cardTitle}>Ficha Pública de Atención</h4>
          <span style={styles.previewTag}>Vista de tu cohorte</span>

          <div style={styles.previewBody}>
            {centros.filter(centroEstaConfigurado).map((centro) => (
              <div key={centro.numeroCentro} style={styles.previewCenter}>
                <h5 style={styles.centerTitle}>Centro de atención {centro.numeroCentro}</h5>
                <div className="consultas-preview-item" style={styles.previewItem}>
                  <div style={styles.previewIconBox}><Clock size={20} color="#0284c7" /></div>
                  <div>
                    <strong style={styles.previewItemTitle}>Horario de consultas</strong>
                    <p style={styles.previewItemValue}>{formatearHorario(centro)}</p>
                  </div>
                </div>
                {centro.modalidad === 'presencial' && (
                  <div className="consultas-preview-item" style={styles.previewItem}>
                    <div style={styles.previewIconBox}><MapPin size={20} color="#059669" /></div>
                    <div>
                      <strong style={styles.previewItemTitle}>Ubicación presencial</strong>
                      <p style={styles.previewItemValue}>{centro.oficina ? 'Sala ' + centro.oficina : 'Pendiente de definición'}</p>
                    </div>
                  </div>
                )}
                {centro.modalidad === 'online' && (
                  <div className="consultas-preview-item" style={styles.previewItem}>
                    <div style={styles.previewIconBox}><MessageSquare size={20} color="#d97706" /></div>
                    <div>
                      <strong style={styles.previewItemTitle}>Atención online</strong>
                      <p style={styles.previewItemValue}>{centro.canalContacto || 'Discord o Meet'}</p>
                      {centro.urlContacto && <p style={styles.previewItemValue}>{centro.urlContacto}</p>}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {centros.every((centro) => !centroEstaConfigurado(centro)) && (
              <p style={styles.previewItemValue}>Aún no hay centros de atención configurados.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '0',
  },
  header: {
    marginBottom: '1.75rem',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#002b49',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#64748b',
    marginTop: '0.25rem',
  },
  alertSuccess: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#15803d',
    padding: '0.85rem 1.25rem',
    borderRadius: '10px',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  alertError: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    color: '#b91c1c',
    padding: '0.85rem 1.25rem',
    borderRadius: '10px',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  loadingBox: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e2e8f0',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
    gap: '1.5rem',
    alignItems: 'start',
  },
  cardForm: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '1.75rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 0.35rem 0',
  },
  cardDesc: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: '0 0 1.5rem 0',
    lineHeight: '1.4',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  centerFormCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1.25rem',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
  },
  centerTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#002b49',
    margin: 0,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    color: '#0f172a',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  select: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
  },
  roomSelectors: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
    gap: '0.6rem',
  },
  weekDaysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '0.5rem',
  },
  weekDayOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    color: '#334155',
    fontSize: '0.85rem',
  },
  timeRangeRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 170px), 1fr))',
    gap: '0.75rem',
  },
  fieldHelp: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    lineHeight: '1.3',
  },
  btnRow: {
    marginTop: '0.75rem',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    fontSize: '0.9rem',
  },
  cardPreview: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '1.75rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
  },
  previewTag: {
    display: 'inline-block',
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#0284c7',
    backgroundColor: '#e0f2fe',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    textTransform: 'uppercase',
    marginBottom: '1.25rem',
  },
  previewBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  previewCenter: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    paddingBottom: '1.25rem',
    borderBottom: '1px solid #e2e8f0',
  },
  previewItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #f1f5f9',
  },
  previewIconBox: {
    backgroundColor: '#ffffff',
    padding: '0.65rem',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewItemTitle: {
    display: 'block',
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  previewItemValue: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
    lineHeight: '1.4',
  },
};
