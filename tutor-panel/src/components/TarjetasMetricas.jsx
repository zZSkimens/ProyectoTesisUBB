import { AlertTriangle, Award, CheckCircle2, TrendingUp, Users } from 'lucide-react';

export const TarjetasMetricas = ({ metricas }) => {
  let totalEstudiantes = 0;
  let totalMisiones = 0;
  let promedioAvance = 0;
  let enRiesgo = 0;
  let alDia = 0;

  if (metricas) {
    totalEstudiantes = metricas.totalEstudiantes || 0;
    totalMisiones = metricas.totalMisiones || 0;
    promedioAvance = metricas.promedioAvanceGrupal || 0;
    enRiesgo = metricas.estudiantesEnRiesgo || 0;
    alDia = metricas.estudiantesAlDia || 0;
  }

  return (
    <div style={styles.grid}>
      
      <div style={styles.card}>
        <div style={styles.iconContainerBlue}>
          <Users size={24} color="#002b49" />
        </div>
        <div style={styles.content}>
          <span style={styles.label}>Estudiantes Asignados</span>
          <h3 style={styles.value}>{totalEstudiantes}</h3>
          <span style={styles.helperText}>Generación 2026 UBB</span>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.iconContainerGold}>
          <Award size={24} color="#d97706" />
        </div>
        <div style={styles.content}>
          <span style={styles.label}>Misiones de Induccion</span>
          <h3 style={styles.value}>{totalMisiones}</h3>
          <span style={styles.helperText}>Modulos activos</span>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.iconContainerGreen}>
          <TrendingUp size={24} color="#10b981" />
        </div>
        <div style={styles.content}>
          <span style={styles.label}>Avance Promedio Grupal</span>
          <div style={styles.progressRow}>
            <h3 style={styles.value}>{promedioAvance}%</h3>
            <span style={styles.helperBadge}>{alDia} al dia</span>
          </div>
          <div className="progress-bar-container" style={{ marginTop: '0.4rem' }}>
            <div
              className="progress-bar-fill progress-fill-medium"
              style={{ width: `${promedioAvance}%` }}
            />
          </div>
        </div>
      </div>

      <div style={{ ...styles.card, ...(enRiesgo > 0 ? styles.cardAlert : {}) }}>
        <div style={styles.iconContainerRed}>
          <AlertTriangle size={24} color="#ef4444" />
        </div>
        <div style={styles.content}>
          <span style={styles.label}>Requieren Apoyo</span>
          <h3 style={{ ...styles.value, color: enRiesgo > 0 ? '#ef4444' : '#0f172a' }}>
            {enRiesgo}
          </h3>
          <span style={styles.helperText}>
            {enRiesgo === 1 ? '1 estudiante rezagado' : `${enRiesgo} estudiantes rezagados`}
          </span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.25rem',
    marginBottom: '2rem',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  cardAlert: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: '#fffdfd',
  },
  iconContainerBlue: {
    backgroundColor: '#e0f2fe',
    padding: '0.75rem',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerGold: {
    backgroundColor: '#fef3c7',
    padding: '0.75rem',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerGreen: {
    backgroundColor: '#ecfdf5',
    padding: '0.75rem',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerRed: {
    backgroundColor: '#fee2e2',
    padding: '0.75rem',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: '0.8rem',
    color: '#64748b',
    fontWeight: '500',
    display: 'block',
    marginBottom: '0.25rem',
  },
  value: {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
    lineHeight: 1.2,
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helperText: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '0.25rem',
    display: 'block',
  },
  helperBadge: {
    fontSize: '0.75rem',
    color: '#10b981',
    fontWeight: '600',
    backgroundColor: '#ecfdf5',
    padding: '0.15rem 0.5rem',
    borderRadius: '999px',
  },
};
