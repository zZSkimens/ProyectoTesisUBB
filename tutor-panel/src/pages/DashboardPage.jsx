import { useEffect, useState } from 'react';
import { BookOpen, RefreshCw } from 'lucide-react';
import { tutoresApi } from '../api/tutores.api.js';
import { ModalEstudiante } from '../components/ModalEstudiante.jsx';
import { Navbar } from '../components/Navbar.jsx';
import { TablaEstudiantes } from '../components/TablaEstudiantes.jsx';
import { TarjetasMetricas } from '../components/TarjetasMetricas.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const DashboardPage = () => {
  const { usuario } = useAuth();

  const [metricas, setMetricas] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [estudianteModalId, setEstudianteModalId] = useState(null);

const cargarDatos = async () => {
    setCargando(true);
    setError(null);

    try {
      const [resDashboard, resEstudiantes] = await Promise.all([
        tutoresApi.obtenerDashboard(),
        tutoresApi.obtenerEstudiantes(),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);

      setMetricas(resDashboard.metricas);
      setEstudiantes(resEstudiantes.estudiantes);
    } catch (err) {
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

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.welcomeBanner}>
          <div>
            <span style={styles.welcomeTag}>Campus Concepción • Segundo Semestre 2026</span>
            <h2 style={styles.welcomeTitle}>Bienvenido(a), {nombreTutor}</h2>
            <p style={styles.welcomeDesc}>
              Monitorea en tiempo real la participacion, avance de misiones y necesidades de apoyo de tus estudiantes novatos.
            </p>
          </div>

          <button
            onClick={cargarDatos}
            disabled={cargando}
            className="btn-secondary"
            style={styles.refreshBtn}
            title="Actualizar datos"
          >
            <RefreshCw size={16} className={cargando ? 'spin-icon' : ''} />
            <span>Actualizar</span>
          </button>
        </div>
        {error ? (
          <div style={styles.errorAlert}>
            <span>Ocurrio un problema: {error}</span>
            <button onClick={cargarDatos} className="btn-secondary" style={{ marginLeft: '1rem', padding: '0.3rem 0.6rem' }}>
              Reintentar
            </button>
          </div>
        ) : null}
        <TarjetasMetricas metricas={metricas} />
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
          onSelectEstudiante={(id) => setEstudianteModalId(id)}
        />
      </main>
      {estudianteModalId ? (
        <ModalEstudiante
          estudianteId={estudianteModalId}
          onClose={() => setEstudianteModalId(null)}
        />
      ) : null}
      {cargando ? (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingBox}>
            <div style={styles.loadingSpinnerWrapper}>
              <RefreshCw size={36} color="#1d70b8" className="spin-icon" />
            </div>
            <p style={styles.loadingTitle}>Espere un momento por favor...</p>
            <span style={styles.loadingSubtitle}>Actualizando información del sistema</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const styles = {
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
    marginBottom: '2rem',
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
