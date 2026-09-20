import { useEffect, useState } from 'react';
import { Award, Calendar, CheckCircle2, Clock, MapPin, X } from 'lucide-react';
import { tutoresApi } from '../api/tutores.api.js';

export const ModalEstudiante = ({ estudianteId, onClose }) => {
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
    async function cargarFicha() {
      if (!estudianteId) {
        return;
      }

      setCargando(true);
      setError(null);

      try {
        const data = await tutoresApi.obtenerDetalleEstudiante(estudianteId);
        setDetalle(data);
      } catch (err) {
        setError(err.message || 'No se pudo cargar la ficha del estudiante');
      } finally {
        setCargando(false);
      }
    }

    cargarFicha();
  }, [estudianteId]);

useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.modalTitle}>Ficha de Progreso del Estudiante</h2>
            <p style={styles.modalSubtitle}>Programa de Induccion y Tutorias UBB</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Cerrar ventana">
            <X size={20} />
          </button>
        </div>
        <div style={styles.body}>
          {cargando ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={{ marginTop: '1rem', color: '#64748b' }}>Cargando datos del estudiante...</p>
            </div>
          ) : null}

          {error ? (
            <div style={styles.errorContainer}>
              <p style={{ color: '#ef4444', fontWeight: '500' }}>{error}</p>
              <button onClick={onClose} className="btn-secondary" style={{ marginTop: '1rem' }}>
                Cerrar
              </button>
            </div>
          ) : null}

          {!cargando && !error && detalle ? (
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
                    <strong style={styles.detailValue}>{detalle.estudiante.añoIngreso}</strong>
                  </div>
                </div>
              </div>
              <h4 style={styles.missionsTitle}>Desafíos y Misiones del Videojuego</h4>

              <div style={styles.missionsList}>
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

                      <div style={styles.missionFooter}>
                        <div style={styles.footerItem}>
                          <Award size={15} color="#d97706" />
                          <span>
                            Puntaje: <strong>{mision.puntajeObtenido}</strong> / {mision.puntosMaximos} pts
                          </span>
                        </div>

                        <div style={styles.footerItem}>
                          <Clock size={15} color="#64748b" />
                          <span>
                            Intentos: <strong>{mision.intentos}</strong>
                          </span>
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
            </div>
          ) : null}
        </div>
        <div style={styles.footer}>
          <button onClick={onClose} className="btn-secondary">
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
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
    borderRadius: '14px',
    width: '100%',
    maxWidth: '680px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)',
    overflow: 'hidden',
  },
  header: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#002b49',
    color: '#ffffff',
  },
  modalTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    margin: 0,
  },
  modalSubtitle: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    margin: 0,
  },
  closeBtn: {
    color: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '6px',
    padding: '0.4rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: '1.5rem',
    overflowY: 'auto',
  },
  studentCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1.25rem',
    marginBottom: '1.5rem',
  },
  studentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '0.5rem',
  },
  studentNameText: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#002b49',
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
  },
  detailItemLast: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
  detailLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    display: 'block',
  },
  detailValue: {
    fontSize: '0.9rem',
    color: '#0f172a',
  },
  missionsTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  missionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
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
    justifyContent: 'flex-end',
    backgroundColor: '#f8fafc',
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
