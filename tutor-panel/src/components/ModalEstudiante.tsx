import type React from 'react';
import { useEffect, useState } from 'react';
import { Award, Calendar, Clock, X, Target, FileText, Trash2 } from 'lucide-react';
import { tutoresApi } from '../api/tutores.api';
import { BarraPuntos } from './BarraPuntos';
import type { DetalleEstudianteResponse } from '../types/index';
import { useBitacoraEstudiante } from '../hooks/useBitacoraEstudiante';
import { BitacoraEstudiante } from './BitacoraEstudiante';

export interface ModalEstudianteProps {
  estudianteId: number | null;
  onClose: () => void;
  onEstudianteEliminado: () => void;
}

export const ModalEstudiante: React.FC<ModalEstudianteProps> = ({ estudianteId, onClose, onEstudianteEliminado }) => {
  const [detalle, setDetalle] = useState<DetalleEstudianteResponse | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [tabModal, setTabModal] = useState<'misiones' | 'observaciones'>('misiones');
  const [confirmarEliminacion, setConfirmarEliminacion] = useState<boolean>(false);
  const [eliminando, setEliminando] = useState<boolean>(false);
  const [errorEliminacion, setErrorEliminacion] = useState<string | null>(null);

  useEffect(() => {
    if (!estudianteId) return;
    let vigente = true;

    tutoresApi.obtenerDetalleEstudiante(estudianteId)
      .then((data) => {
        if (vigente) setDetalle(data);
      })
      .catch((err: unknown) => {
        if (vigente) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar la ficha del estudiante');
        }
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => { vigente = false; };
  }, [estudianteId]);

  const bitacora = useBitacoraEstudiante(estudianteId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleEliminarEstudiante = async () => {
    if (!estudianteId) {
      return;
    }

    setEliminando(true);
    setErrorEliminacion(null);
    try {
      await tutoresApi.eliminarEstudiante(estudianteId);
      onEstudianteEliminado();
    } catch (err: any) {
      setErrorEliminacion(err.message || 'No se pudo eliminar al estudiante');
      setEliminando(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.modalTitle}>Ficha de Progreso del Estudiante</h2>
            <p style={styles.modalSubtitle}>Programa de Inducción y Tutorías UBB</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Cerrar ventana" type="button">
            <X size={20} />
          </button>
        </div>

        <div style={styles.body}>
          {cargando && (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={{ marginTop: '1rem', color: '#64748b' }}>Cargando datos del estudiante...</p>
            </div>
          )}

          {error && (
            <div style={styles.errorContainer}>
              <p style={{ color: '#ef4444', fontWeight: '500' }}>{error}</p>
              <button onClick={onClose} className="btn-secondary" style={{ marginTop: '1rem' }} type="button">
                Cerrar
              </button>
            </div>
          )}

          {!cargando && !error && detalle && (
            <div>
              <div style={styles.studentCard}>
                <div style={styles.studentHeader}>
                  <h3 style={styles.studentNameText}>{detalle.estudiante.nombre}</h3>
                </div>

                <div style={styles.studentDetailsList}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>RUT Institucional</span>
                    <strong style={styles.detailValue}>{detalle.estudiante.rut}</strong>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Carrera</span>
                    <strong style={styles.detailValue}>{detalle.estudiante.carrera}</strong>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Correo UBB</span>
                    <strong style={styles.detailValue}>{detalle.estudiante.email}</strong>
                  </div>
                  <div style={styles.detailItemLast}>
                    <span style={styles.detailLabel}>Año de Ingreso</span>
                    <strong style={styles.detailValue}>
                      {detalle.estudiante.añoIngreso || detalle.estudiante.anioIngreso || 2026}
                    </strong>
                  </div>
                </div>
              </div>

              <BarraPuntos estudiante={detalle.estudiante} />
              <div style={styles.modalTabs}>
                <button
                  type="button"
                  onClick={() => setTabModal('misiones')}
                  style={tabModal === 'misiones' ? styles.modalTabActive : styles.modalTab}
                >
                  <Target size={16} />
                  <span>Desafíos y Misiones ({detalle.misiones.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTabModal('observaciones')}
                  style={tabModal === 'observaciones' ? styles.modalTabActive : styles.modalTab}
                >
                  <FileText size={16} />
                  <span>Bitácora de Observaciones{bitacora.estadoBitacora === 'lista' && ` (${bitacora.observaciones.length})`}</span>
                </button>
              </div>

              {tabModal === 'misiones' && (
                <div style={styles.missionsList}>
                  {detalle.misiones.length === 0 && <p>Sin misiones asignadas.</p>}
                  {detalle.misiones.map((mision) => {
                    let badgeClass = 'badge-en-progreso';
                    let statusText = 'En progreso';

                    if (mision.estado === 'completada') {
                      badgeClass = 'badge-al-dia';
                      statusText = 'Completada';
                    } else if (mision.estado === 'pendiente') {
                      badgeClass = 'badge-en-riesgo';
                      statusText = 'Pendiente';
                    }

                    let fechaFormateada = 'Sin completar';
                    if (mision.fechaCompletado) {
                      const d = new Date(mision.fechaCompletado);
                      fechaFormateada = d.toLocaleDateString('es-CL', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      });
                    }

                    return (
                      <div key={mision.misionId} style={styles.missionItem}>
                        <div style={styles.missionTop}>
                          <div>
                            <span style={styles.missionModule}>{mision.modulo}</span>
                            <h5 style={styles.missionTitleText}>{mision.titulo}</h5>
                          </div>
                          <span className={`badge ${badgeClass}`}>{statusText}</span>
                        </div>

                        <p style={styles.missionDesc}>{mision.descripcion}</p>
                        {mision.condicionCumplimiento && (
                          <p style={styles.missionDesc}><strong>Cómo se completa</strong> · {mision.condicionCumplimiento}</p>
                        )}

                        <div style={styles.missionFooter}>
                          <div style={styles.footerItem}>
                            <Award size={15} color="#d97706" />
                            <span>
                              Puntaje: {mision.puntajeObtenido} / {mision.puntosMaximos}
                            </span>
                          </div>
                          <div style={styles.footerItem}>
                            <Clock size={15} color="#64748b" />
                            <span>Intentos: {mision.intentos}</span>
                          </div>
                          <div style={styles.footerItem}>
                            <Calendar size={15} color="#64748b" />
                            <span>{fechaFormateada}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <BitacoraEstudiante
                estudianteId={estudianteId}
                visible={tabModal === 'observaciones'}
                bitacora={bitacora}
              />
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <div style={styles.deleteArea}>
            {errorEliminacion && <p style={styles.deleteError}>{errorEliminacion}</p>}
            {confirmarEliminacion && (
              <div style={styles.deleteConfirmation}>
                <p style={styles.deleteWarning}>
                  Se eliminarán también su progreso de misiones y las observaciones de tutoría. Esta acción no se puede deshacer.
                </p>
                <button
                  onClick={handleEliminarEstudiante}
                  className="btn-danger"
                  type="button"
                  disabled={eliminando}
                >
                  {eliminando ? 'Eliminando...' : 'Confirmar eliminación'}
                </button>
                <button
                  onClick={() => setConfirmarEliminacion(false)}
                  className="btn-secondary"
                  type="button"
                  disabled={eliminando}
                >
                  Cancelar
                </button>
              </div>
            )}
            {!confirmarEliminacion && (
              <button
                onClick={() => setConfirmarEliminacion(true)}
                className="btn-danger"
                style={styles.deleteButton}
                type="button"
                disabled={cargando || !detalle}
              >
                <Trash2 size={15} />
                <span>Eliminar estudiante</span>
              </button>
            )}
          </div>
          {!confirmarEliminacion && (
            <button onClick={onClose} className="btn-secondary" type="button">
              Cerrar Ficha
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 1000,
    backdropFilter: 'blur(3px)',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    maxWidth: '720px',
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid #e2e8f0',
  },
  header: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#002b49',
    margin: 0,
  },
  modalSubtitle: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginTop: '0.2rem',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '0.25rem',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: '1.5rem',
    overflowY: 'auto',
    flex: 1,
  },
  studentCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '1.25rem',
    border: '1px solid #e2e8f0',
    marginBottom: '1.25rem',
  },
  studentHeader: {
    marginBottom: '0.75rem',
  },
  studentNameText: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  studentDetailsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
    paddingBottom: '0.65rem',
    borderBottom: '1px solid #e2e8f0',
    minWidth: 0,
  },
  detailItemLast: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
    minWidth: 0,
  },
  detailLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginBottom: '0.2rem',
  },
  detailValue: {
    fontSize: '0.85rem',
    color: '#0f172a',
    overflowWrap: 'anywhere',
    minWidth: 0,
  },
  modalTabs: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '2px solid #e2e8f0',
    marginBottom: '1.25rem',
    overflowX: 'auto',
  },
  modalTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.6rem 1rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  modalTabActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.6rem 1rem',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#0284c7',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid #0284c7',
    marginBottom: '-2px',
    cursor: 'pointer',
  },
  missionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  missionItem: {
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1rem',
    backgroundColor: '#ffffff',
  },
  missionTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '0.5rem',
  },
  missionModule: {
    fontSize: '0.75rem',
    color: '#1d70b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    display: 'block',
  },
  missionTitleText: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#0f172a',
    margin: '0.2rem 0 0 0',
  },
  missionDesc: {
    fontSize: '0.85rem',
    color: '#475569',
    marginBottom: '0.75rem',
    lineHeight: 1.4,
  },
  missionFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    flexWrap: 'wrap',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '0.6rem',
    fontSize: '0.8rem',
    color: '#64748b',
  },
  footerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  footer: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
    backgroundColor: '#f8fafc',
  },
  deleteArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
    minWidth: 0,
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  deleteConfirmation: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  deleteWarning: {
    flexBasis: '100%',
    color: '#b91c1c',
    fontSize: '0.8rem',
    margin: 0,
  },
  deleteError: {
    color: '#b91c1c',
    fontSize: '0.8rem',
    margin: 0,
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '3rem 1rem',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#002b49',
    borderRadius: '50%',
    margin: '0 auto',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '2rem 1rem',
  },
};
