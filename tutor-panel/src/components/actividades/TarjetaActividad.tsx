import { Award, ChevronDown, ChevronUp, Clock, Compass, HelpCircle, MessageSquare, UserCheck, Users } from 'lucide-react';
import type { ActividadResumen } from '../../types';
import { styles } from './actividades.styles';

interface TarjetaActividadProps {
  actividad: ActividadResumen;
  expandido: boolean;
  confirmandoDesactivacion: boolean;
  accionesBloqueadas: boolean;
  desactivando: boolean;
  error?: string;
  onAlternarDetalle: () => void;
  onSelectEstudiante: (id: number) => void;
  onSolicitarDesactivacion: () => void;
  onConfirmarDesactivacion: () => void;
  onCancelarDesactivacion: () => void;
}

const obtenerIconoTipo = (tipo: string) => {
  if (tipo === 'trivia') {
    return <HelpCircle size={14} color="#d97706" />;
  }
  if (tipo === 'npc_dialogo') {
    return <MessageSquare size={14} color="#2563eb" />;
  }
  return <Compass size={14} color="#059669" />;
};

const obtenerEtiquetaTipo = (tipo: string) => {
  if (tipo === 'trivia') {
    return 'Trivia institucional';
  }
  if (tipo === 'npc_dialogo') {
    return 'Diálogo con NPC';
  }
  if (tipo === 'guiada') return 'Actividad guiada';
  return 'Exploración en campus';
};

export function TarjetaActividad({
  actividad,
  expandido,
  confirmandoDesactivacion,
  accionesBloqueadas,
  desactivando,
  error,
  onAlternarDetalle,
  onSelectEstudiante,
  onSolicitarDesactivacion,
  onConfirmarDesactivacion,
  onCancelarDesactivacion,
}: TarjetaActividadProps) {
  const pct = actividad.porcentajeCompletitud;
  let progressClass = 'progress-fill-high';
  if (pct < 35) {
    progressClass = 'progress-fill-low';
  } else if (pct < 70) {
    progressClass = 'progress-fill-medium';
  }

  const totalPendientes = actividad.estudiantesPendientes.length;

  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <div style={styles.badgesRow}>
          <span style={styles.moduleBadge}>{actividad.modulo}</span>
          <div style={styles.typeBadge}>
            {obtenerIconoTipo(actividad.tipo)}
            <span>{obtenerEtiquetaTipo(actividad.tipo)}</span>
          </div>
        </div>

        <div style={styles.pointsBadge}>
          <Award size={14} color="#d97706" />
          <span>+{actividad.puntosRecompensa} pts</span>
        </div>
      </div>

      <h4 style={styles.actTitle}>{actividad.titulo}</h4>
      <p style={styles.actDesc}>{actividad.descripcion}</p>
      {actividad.condicionCumplimiento && (
        <p style={styles.actDesc}><strong>Cómo se completa</strong> · {actividad.condicionCumplimiento}</p>
      )}

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
            <span><strong>{actividad.completadas}</strong> completaron</span>
          </div>
          <div style={styles.statItem}>
            <Clock size={14} color="#f59e0b" />
            <span><strong>{actividad.enProgreso}</strong> en progreso</span>
          </div>
          <div style={styles.statItem}>
            <Users size={14} color="#64748b" />
            <span><strong>{actividad.noIniciadas}</strong> no iniciadas</span>
          </div>
        </div>
      </div>

      <div style={styles.cardActionArea}>
        <button
          onClick={onAlternarDetalle}
          className="btn-secondary"
          style={styles.expandBtn}
          aria-expanded={expandido}
        >
          <span>
            {expandido
              ? 'Ocultar nómina pendiente'
              : `Ver estudiantes con esta actividad pendiente (${totalPendientes})`}
          </span>
          {expandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {confirmandoDesactivacion ? (
          <div>
            <p style={styles.subtitle}>
              Esta misión dejará de contar para el avance de tus estudiantes. Se conservarán los puntos que ya ganaron.
            </p>
            {error && <p role="alert" className="mission-message-error">{error}</p>}
            <div style={styles.filterGroup}>
              <button type="button" className="btn-danger" disabled={accionesBloqueadas} onClick={onConfirmarDesactivacion}>
                {desactivando ? 'Desactivando…' : 'Confirmar desactivación'}
              </button>
              <button type="button" className="btn-secondary" disabled={accionesBloqueadas} onClick={onCancelarDesactivacion}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="btn-secondary"
            style={styles.expandBtn}
            disabled={accionesBloqueadas}
            onClick={onSolicitarDesactivacion}
          >
            Desactivar misión para mi grupo
          </button>
        )}
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
                {actividad.estudiantesPendientes.map((est) => {
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
}
