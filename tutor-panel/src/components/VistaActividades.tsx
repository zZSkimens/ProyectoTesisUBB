import type React from 'react';
import { useState } from 'react';
import { Target, Users, Compass, HelpCircle, MessageSquare, ChevronDown, ChevronUp, UserCheck, Clock, Award } from 'lucide-react';
import type { ActividadResumen } from '../types/index';

export interface VistaActividadesProps {
  actividades: ActividadResumen[];
  cargando?: boolean;
  onSelectEstudiante: (id: number) => void;
}

export const VistaActividades: React.FC<VistaActividadesProps> = ({
  actividades,
  cargando = false,
  onSelectEstudiante,
}) => {
  const [moduloFiltro, setModuloFiltro] = useState<string>('todos');
  const [actividadExpandidaId, setActividadExpandidaId] = useState<number | null>(null);

  const modulosDisponibles = Array.from(
    new Set(actividades.map((a) => a.modulo))
  );

  let actividadesFiltradas = actividades;
  if (moduloFiltro !== 'todos') {
    actividadesFiltradas = actividades.filter((a) => a.modulo === moduloFiltro);
  }

  const toggleExpandir = (id: number) => {
    if (actividadExpandidaId === id) {
      setActividadExpandidaId(null);
    } else {
      setActividadExpandidaId(id);
    }
  };

  const getTipoIcon = (tipo: string) => {
    if (tipo === 'trivia') {
      return <HelpCircle size={14} color="#d97706" />;
    }
    if (tipo === 'npc_dialogo') {
      return <MessageSquare size={14} color="#2563eb" />;
    }
    return <Compass size={14} color="#059669" />;
  };

  const getTipoLabel = (tipo: string) => {
    if (tipo === 'trivia') {
      return 'Trivia institucional';
    }
    if (tipo === 'npc_dialogo') {
      return 'Diálogo con NPC';
    }
    return 'Exploración en campus';
  };

  if (cargando) {
    return (
      <div style={styles.emptyContainer}>
        <p style={{ color: '#64748b' }}>Cargando actividades del programa...</p>
      </div>
    );
  }

  if (actividades.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <Target size={40} color="#94a3b8" />
        <h4 style={styles.emptyTitle}>No hay actividades de inducción registradas</h4>
        <p style={styles.emptyText}>
          Las misiones configuradas en la base de datos aparecerán en este panel.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Actividades de Inducción UBB</h3>
          <p style={styles.subtitle}>
            Seguimiento del progreso de la cohorte por misión y detección de novatos con actividades pendientes.
          </p>
        </div>

        <div style={styles.filterGroup}>
          <button
            onClick={() => setModuloFiltro('todos')}
            style={moduloFiltro === 'todos' ? styles.filterBtnActive : styles.filterBtn}
          >
            <span>Todos los módulos ({actividades.length})</span>
          </button>
          {modulosDisponibles.map((mod) => {
            const count = actividades.filter((a) => a.modulo === mod).length;
            const activo = moduloFiltro === mod;
            return (
              <button
                key={mod}
                onClick={() => setModuloFiltro(mod)}
                style={activo ? styles.filterBtnActive : styles.filterBtn}
              >
                <span>{mod} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={styles.grid}>
        {actividadesFiltradas.map((act) => {
          const expandido = actividadExpandidaId === act.id;
          const pct = act.porcentajeCompletitud;
          let progressClass = 'progress-fill-high';
          if (pct < 35) {
            progressClass = 'progress-fill-low';
          } else if (pct < 70) {
            progressClass = 'progress-fill-medium';
          }

          const totalPendientes = act.estudiantesPendientes.length;

          return (
            <div key={act.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.badgesRow}>
                  <span style={styles.moduleBadge}>{act.modulo}</span>
                  <div style={styles.typeBadge}>
                    {getTipoIcon(act.tipo)}
                    <span>{getTipoLabel(act.tipo)}</span>
                  </div>
                  <span style={styles.codeBadge}>{act.codigo}</span>
                </div>

                <div style={styles.pointsBadge}>
                  <Award size={14} color="#d97706" />
                  <span>+{act.puntosRecompensa} pts</span>
                </div>
              </div>

              <h4 style={styles.actTitle}>{act.titulo}</h4>
              <p style={styles.actDesc}>{act.descripcion}</p>

              <div style={styles.progressSection}>
                <div style={styles.progressHeader}>
                  <span style={styles.progressLabel}>Completitud grupal</span>
                  <span style={styles.progressPct}>{pct}%</span>
                </div>
                <div className="progress-bar-container" style={{ height: '8px' }}>
                  <div
                    className={`progress-bar-fill ${progressClass}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div style={styles.statsRow}>
                  <div style={styles.statItem}>
                    <UserCheck size={14} color="#10b981" />
                    <span><strong>{act.completadas}</strong> completaron</span>
                  </div>
                  <div style={styles.statItem}>
                    <Clock size={14} color="#f59e0b" />
                    <span><strong>{act.enProgreso}</strong> en progreso</span>
                  </div>
                  <div style={styles.statItem}>
                    <Users size={14} color="#64748b" />
                    <span><strong>{act.noIniciadas}</strong> no iniciadas</span>
                  </div>
                </div>
              </div>

              <div style={styles.cardActionArea}>
                <button
                  onClick={() => toggleExpandir(act.id)}
                  className="btn-secondary"
                  style={styles.expandBtn}
                >
                  <span>
                    {expandido
                      ? 'Ocultar nómina pendiente'
                      : `Ver estudiantes con esta actividad pendiente (${totalPendientes})`}
                  </span>
                  {expandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {expandido && (
                <div style={styles.pendingListContainer}>
                  {totalPendientes === 0 ? (
                    <p style={styles.allDoneMessage}>
                      ¡Excelente! Todos tus estudiantes asignados han completado esta misión.
                    </p>
                  ) : (
                    <div>
                      <span style={styles.pendingListTitle}>
                        Estudiantes que aún no completan ({totalPendientes}):
                      </span>
                      <div style={styles.pendingList}>
                        {act.estudiantesPendientes.map((est) => {
                          let badgeBg = '#fef3c7';
                          let badgeColor = '#b45309';
                          let badgeText = 'En progreso';
                          if (est.estado === 'pendiente') {
                            badgeBg = '#fee2e2';
                            badgeColor = '#b91c1c';
                            badgeText = 'No iniciada';
                          }

                          return (
                            <div key={est.id} style={styles.pendingItem}>
                              <div style={styles.pendingInfo}>
                                <strong style={styles.pendingName}>{est.nombre}</strong>
                                <span style={styles.pendingRut}>{est.rut}</span>
                              </div>
                              <div style={styles.pendingRight}>
                                <span
                                  style={{
                                    ...styles.statusPill,
                                    backgroundColor: badgeBg,
                                    color: badgeColor,
                                  }}
                                >
                                  {badgeText}
                                </span>
                                <button
                                  onClick={() => onSelectEstudiante(est.id)}
                                  className="btn-secondary"
                                  style={styles.viewStudentBtn}
                                  title="Ver ficha completa del estudiante"
                                >
                                  <span>Ver ficha</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: '1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#002b49',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginTop: '0.25rem',
  },
  filterGroup: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.4rem 0.85rem',
    fontSize: '0.8rem',
    color: '#475569',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.15s ease',
  },
  filterBtnActive: {
    backgroundColor: '#002b49',
    border: '1px solid #002b49',
    borderRadius: '8px',
    padding: '0.4rem 0.85rem',
    fontSize: '0.8rem',
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: '600',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '1.25rem',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'box-shadow 0.2s ease',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  badgesRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    flexWrap: 'wrap',
  },
  moduleBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#002b49',
    backgroundColor: '#e0f2fe',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    textTransform: 'uppercase',
  },
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.7rem',
    fontWeight: '600',
    color: '#334155',
    backgroundColor: '#f1f5f9',
    padding: '0.2rem 0.45rem',
    borderRadius: '6px',
  },
  codeBadge: {
    fontSize: '0.7rem',
    fontFamily: 'monospace',
    color: '#94a3b8',
  },
  pointsBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
  },
  actTitle: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 0.4rem 0',
  },
  actDesc: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: '0 0 1.25rem 0',
    lineHeight: '1.4',
    flex: 1,
  },
  progressSection: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '0.85rem',
    marginBottom: '1rem',
    border: '1px solid #f1f5f9',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.4rem',
  },
  progressLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  progressPct: {
    fontSize: '0.95rem',
    fontWeight: '800',
    color: '#002b49',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.75rem',
    paddingTop: '0.65rem',
    borderTop: '1px solid #e2e8f0',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.75rem',
    color: '#475569',
  },
  cardActionArea: {
    marginTop: 'auto',
  },
  expandBtn: {
    width: '100%',
    padding: '0.5rem',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
  },
  pendingListContainer: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px dashed #cbd5e1',
  },
  allDoneMessage: {
    fontSize: '0.85rem',
    color: '#15803d',
    backgroundColor: '#f0fdf4',
    padding: '0.75rem',
    borderRadius: '6px',
    textAlign: 'center',
    margin: 0,
    fontWeight: '500',
  },
  pendingListTitle: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#475569',
    display: 'block',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
  },
  pendingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    maxHeight: '220px',
    overflowY: 'auto',
  },
  pendingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0.65rem',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  pendingInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  pendingName: {
    fontSize: '0.8rem',
    color: '#0f172a',
  },
  pendingRut: {
    fontSize: '0.7rem',
    color: '#94a3b8',
  },
  pendingRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  statusPill: {
    fontSize: '0.65rem',
    fontWeight: '700',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  viewStudentBtn: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.7rem',
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px dashed #cbd5e1',
    padding: '3rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
  },
  emptyTitle: {
    fontSize: '1.1rem',
    color: '#334155',
    margin: 0,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: 0,
    maxWidth: '400px',
  },
};
