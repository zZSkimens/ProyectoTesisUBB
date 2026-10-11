import type React from 'react';
import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, User, Target, CheckCircle2 } from 'lucide-react';
import type { Alerta } from '../types/index';

export interface BannerAlertasProps {
  alertas?: Alerta[];
  onSelectEstudiante: (id: number) => void;
  onIrActividades: () => void;
}

export const BannerAlertas: React.FC<BannerAlertasProps> = ({
  alertas = [],
  onSelectEstudiante,
  onIrActividades,
}) => {
  const [expandido, setExpandido] = useState<boolean>(true);

  if (!alertas || alertas.length === 0) {
    return (
      <div style={styles.bannerOk}>
        <div style={styles.okIconWrapper}>
          <CheckCircle2 size={20} color="#10b981" />
        </div>
        <div>
          <strong style={styles.okTitle}>Todo en orden en tu cohorte</strong>
          <p style={styles.okText}>
            Tus estudiantes novatos avanzan según lo esperado en los módulos de inducción UBB.
          </p>
        </div>
      </div>
    );
  }

  const totalCriticas = alertas.filter((a) => a.nivel === 'critico').length;
  let etiquetaCriticas = '';
  if (totalCriticas > 0) {
    etiquetaCriticas = `${totalCriticas} urgente`;
    if (totalCriticas > 1) {
      etiquetaCriticas = `${totalCriticas} urgentes`;
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <AlertTriangle size={20} color="#dc2626" />
          </div>
          <div>
            <div style={styles.titleRow}>
              <h4 style={styles.title}>Alertas Tempranas de Seguimiento</h4>
              <span style={styles.countBadge}>{alertas.length} activas</span>
              {totalCriticas > 0 && (
                <span style={styles.urgentBadge}>{etiquetaCriticas}</span>
              )}
            </div>
            <p style={styles.subtitle}>
              Estudiantes rezagados o actividades con baja participación que requieren intervención.
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpandido(!expandido)}
          className="btn-secondary"
          style={styles.toggleBtn}
          title={expandido ? 'Minimizar alertas' : 'Ver detalle de alertas'}
        >
          {expandido ? (
            <>
              <span>Ocultar</span>
              <ChevronUp size={16} />
            </>
          ) : (
            <>
              <span>Ver alertas</span>
              <ChevronDown size={16} />
            </>
          )}
        </button>
      </div>

      {expandido && (
        <div style={styles.alertList}>
          {alertas.map((alerta) => {
            let esCritico = alerta.nivel === 'critico';
            let cardStyle = styles.alertCardWarning;
            let iconColor = '#d97706';
            if (esCritico) {
              cardStyle = styles.alertCardCritical;
              iconColor = '#dc2626';
            }

            return (
              <div key={alerta.id} style={{ ...styles.alertCard, ...cardStyle }}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardLeft}>
                    {alerta.tipo === 'estudiante_riesgo' ? (
                      <div style={styles.tagEstudiante}>
                        <User size={14} color={iconColor} />
                        <span>Estudiante en riesgo</span>
                      </div>
                    ) : (
                      <div style={styles.tagActividad}>
                        <Target size={14} color={iconColor} />
                        <span>Actividad de inducción</span>
                      </div>
                    )}
                    <h5 style={styles.cardTitle}>{alerta.titulo}</h5>
                  </div>

                  <span style={esCritico ? styles.levelBadgeCritical : styles.levelBadgeWarning}>
                    {esCritico ? 'Atención urgente' : 'Revisión recomendada'}
                  </span>
                </div>

                <p style={styles.cardDesc}>{alerta.descripcion}</p>

                <div style={styles.cardFooter}>
                  {alerta.tipo === 'estudiante_riesgo' && alerta.estudianteId ? (
                    <button
                      onClick={() => onSelectEstudiante(alerta.estudianteId!)}
                      className="btn-primary"
                      style={styles.actionBtn}
                    >
                      <span>Ver ficha y apoyar estudiante</span>
                    </button>
                  ) : null}

                  {alerta.tipo === 'actividad_critica' ? (
                    <button
                      onClick={onIrActividades}
                      className="btn-secondary"
                      style={styles.actionBtn}
                    >
                      <span>Ver actividades de inducción</span>
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#ffffff',
    border: '1px solid #fee2e2',
    borderLeft: '5px solid #dc2626',
    borderRadius: '12px',
    padding: '1.25rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.08)',
  },
  bannerOk: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderLeft: '5px solid #10b981',
    borderRadius: '12px',
    padding: '1rem 1.25rem',
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
  },
  okIconWrapper: {
    backgroundColor: '#dcfce7',
    padding: '0.5rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  okTitle: {
    color: '#166534',
    fontSize: '0.95rem',
    display: 'block',
    marginBottom: '0.15rem',
  },
  okText: {
    color: '#15803d',
    fontSize: '0.85rem',
    margin: 0,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.85rem',
  },
  headerIcon: {
    backgroundColor: '#fee2e2',
    padding: '0.65rem',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#991b1b',
    margin: 0,
  },
  countBadge: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.15rem 0.55rem',
    borderRadius: '999px',
  },
  urgentBadge: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.15rem 0.5rem',
    borderRadius: '999px',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: '0.25rem 0 0 0',
  },
  toggleBtn: {
    padding: '0.4rem 0.85rem',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  alertList: {
    marginTop: '1.25rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
    gap: '1rem',
  },
  alertCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '1rem',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  alertCardCritical: {
    borderColor: '#fca5a5',
    backgroundColor: '#fffbfa',
  },
  alertCardWarning: {
    borderColor: '#fde68a',
    backgroundColor: '#fffdf5',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  cardLeft: {
    flex: 1,
  },
  tagEstudiante: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: '0.25rem',
  },
  tagActividad: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#d97706',
    marginBottom: '0.25rem',
  },
  cardTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  levelBadgeCritical: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#b91c1c',
    backgroundColor: '#fee2e2',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    whiteSpace: 'nowrap',
  },
  levelBadgeWarning: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    whiteSpace: 'nowrap',
  },
  cardDesc: {
    fontSize: '0.85rem',
    color: '#475569',
    lineHeight: '1.4',
    margin: '0 0 0.85rem 0',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '0.65rem',
  },
  actionBtn: {
    fontSize: '0.8rem',
    padding: '0.35rem 0.75rem',
  },
};
