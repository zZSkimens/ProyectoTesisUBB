import type React from 'react';
import { useEffect, useState } from 'react';
import { RefreshCw, Users, Target } from 'lucide-react';
import { tutoresApi } from '../api/tutores.api';
import { BannerAlertas } from '../components/BannerAlertas';
import { ModalEstudiante } from '../components/ModalEstudiante';
import { Navbar } from '../components/Navbar';
import { TablaEstudiantes } from '../components/TablaEstudiantes';
import { TarjetasMetricas } from '../components/TarjetasMetricas';
import { VistaActividades } from '../components/VistaActividades';
import { useAuth } from '../context/AuthContext';
import type { Estudiante, MetricasDashboard, ActividadResumen } from '../types/index';

export const DashboardPage: React.FC = () => {
  const { usuario } = useAuth();

  const [metricas, setMetricas] = useState<MetricasDashboard | null>(null);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [actividades, setActividades] = useState<ActividadResumen[]>([]);
  const [pestanaActiva, setPestanaActiva] = useState<'estudiantes' | 'actividades'>('estudiantes');
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [estudianteModalId, setEstudianteModalId] = useState<number | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);

    try {
      const [resDashboard, resEstudiantes, resActividades] = await Promise.all([
        tutoresApi.obtenerDashboard(),
        tutoresApi.obtenerEstudiantes(),
        tutoresApi.obtenerActividades(),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);

      setMetricas(resDashboard.metricas);
      setEstudiantes(resEstudiantes.estudiantes);
      setActividades(resActividades.actividades);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la informacion del panel');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  let nombreTutor = 'Tutor';
  if (usuario && usuario.nombre) {
    nombreTutor = usuario.nombre;
  }

  let iconoRefrescarClase = '';
  if (cargando) {
    iconoRefrescarClase = 'spin-icon';
  }

  let alertasGrupo = metricas && metricas.alertas ? metricas.alertas : [];

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.welcomeBanner}>
          <div>
            <span style={styles.welcomeTag}>Campus Concepción • Segundo Semestre 2026</span>
            <h2 style={styles.welcomeTitle}>Bienvenido(a), {nombreTutor}</h2>
            <p style={styles.welcomeDesc}>
              Monitorea en tiempo real la participación, avance de misiones y necesidades de apoyo de tus estudiantes novatos.
            </p>
          </div>

          <button
            onClick={cargarDatos}
            disabled={cargando}
            className="btn-secondary"
            style={styles.refreshBtn}
            title="Actualizar datos"
          >
            <RefreshCw size={16} className={iconoRefrescarClase} />
            <span>Actualizar</span>
          </button>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <span>Ocurrió un problema: {error}</span>
            <button
              onClick={cargarDatos}
              className="btn-secondary"
              style={{ marginLeft: '1rem', padding: '0.3rem 0.6rem' }}
            >
              Reintentar
            </button>
          </div>
        )}

        <BannerAlertas
          alertas={alertasGrupo}
          onSelectEstudiante={(id: number) => setEstudianteModalId(id)}
          onIrActividades={() => setPestanaActiva('actividades')}
        />

        <TarjetasMetricas metricas={metricas} />

        <div style={styles.tabContainer}>
          <button
            onClick={() => setPestanaActiva('estudiantes')}
            style={pestanaActiva === 'estudiantes' ? styles.tabButtonActive : styles.tabButton}
          >
            <Users size={18} />
            <span>Nómina de Estudiantes ({estudiantes.length})</span>
          </button>

          <button
            onClick={() => setPestanaActiva('actividades')}
            style={pestanaActiva === 'actividades' ? styles.tabButtonActive : styles.tabButton}
          >
            <Target size={18} />
            <span>Actividades de Inducción ({actividades.length})</span>
          </button>
        </div>

        {pestanaActiva === 'estudiantes' && (
          <div>
            <div style={styles.sectionHeader}>
              <div>
                <h3 style={styles.sectionTitle}>Nómina de Estudiantes de Primer Año</h3>
                <p style={styles.sectionSubtitle}>
                  Revisa el porcentaje de avance en los módulos "Presentemos la UBB" y "Caja de herramientas".
                </p>
              </div>
            </div>
            <TablaEstudiantes
              estudiantes={estudiantes}
              onSelectEstudiante={(id: number) => setEstudianteModalId(id)}
            />
          </div>
        )}

        {pestanaActiva === 'actividades' && (
          <VistaActividades
            actividades={actividades}
            cargando={cargando}
            onSelectEstudiante={(id: number) => setEstudianteModalId(id)}
          />
        )}
      </main>

      {estudianteModalId && (
        <ModalEstudiante
          estudianteId={estudianteModalId}
          onClose={() => setEstudianteModalId(null)}
        />
      )}

      {cargando && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingBox}>
            <div style={styles.loadingSpinnerWrapper}>
              <RefreshCw size={36} color="#1d70b8" className="spin-icon" />
            </div>
            <p style={styles.loadingTitle}>Espere un momento por favor...</p>
            <span style={styles.loadingSubtitle}>Actualizando información del sistema</span>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1.5rem 4rem 1.5rem',
  },
  welcomeBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  welcomeTag: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#1d70b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'block',
    marginBottom: '0.25rem',
  },
  welcomeTitle: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#002b49',
    margin: 0,
    lineHeight: 1.2,
  },
  welcomeDesc: {
    fontSize: '0.95rem',
    color: '#64748b',
    marginTop: '0.35rem',
    maxWidth: '650px',
  },
  refreshBtn: {
    padding: '0.55rem 1rem',
    fontSize: '0.85rem',
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    color: '#b91c1c',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
  },
  tabContainer: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '0.5rem',
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 1.25rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabButtonActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 1.25rem',
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#ffffff',
    backgroundColor: '#002b49',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 43, 73, 0.2)',
  },
  sectionHeader: {
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  sectionSubtitle: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginTop: '0.25rem',
  },
  loadingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  loadingBox: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '2rem 2.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
    border: '1px solid #e2e8f0',
    minWidth: '280px',
    textAlign: 'center',
  },
  loadingSpinnerWrapper: {
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#f0f7ff',
  },
  loadingTitle: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#002b49',
    margin: 0,
  },
  loadingSubtitle: {
    fontSize: '0.8rem',
    color: '#64748b',
    marginTop: '0.35rem',
  },
};
