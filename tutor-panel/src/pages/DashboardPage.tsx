import type React from 'react';
import { useEffect, useState } from 'react';
import { Menu, RefreshCw } from 'lucide-react';
import { tutoresApi } from '../api/tutores.api';
import { BannerAlertas } from '../components/BannerAlertas';
import { ModalEstudiante } from '../components/ModalEstudiante';
import { ModalNuevoEstudiante } from '../components/ModalNuevoEstudiante';
import { Sidebar, type SeccionPanel } from '../components/Sidebar';
import { TablaEstudiantes } from '../components/TablaEstudiantes';
import { TarjetasMetricas } from '../components/TarjetasMetricas';
import { VistaActividades } from '../components/VistaActividades';
import { VistaHorarioConsultas } from '../components/VistaHorarioConsultas';
import { useAuth } from '../context/AuthContext';
import type { Estudiante, MetricasDashboard, ActividadResumen } from '../types/index';

export const DashboardPage: React.FC = () => {
  const { usuario } = useAuth();

  const [metricas, setMetricas] = useState<MetricasDashboard | null>(null);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [actividades, setActividades] = useState<ActividadResumen[]>([]);
  const [seccionActiva, setSeccionActiva] = useState<SeccionPanel>('dashboard');
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [estudianteModalId, setEstudianteModalId] = useState<number | null>(null);
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState<boolean>(false);
  const [sidebarAbierto, setSidebarAbierto] = useState<boolean>(false);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);

    try {
      const [resDashboard, resEstudiantes, resActividades] = await Promise.all([
        tutoresApi.obtenerDashboard(),
        tutoresApi.obtenerEstudiantes(),
        tutoresApi.obtenerActividades(),
        new Promise((resolve) => setTimeout(resolve, 400)),
      ]);

      setMetricas(resDashboard.metricas);
      setEstudiantes(resEstudiantes.estudiantes);
      setActividades(resActividades.actividades);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la información del panel');
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

  let alertasGrupo: any[] = [];
  if (metricas && metricas.alertas) {
    alertasGrupo = metricas.alertas;
  }

  return (
    <div className="layout-container">
      {sidebarAbierto && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarAbierto(false)}
        />
      )}

      <Sidebar
        seccionActiva={seccionActiva}
        onCambiarSeccion={(s) => {
          setSeccionActiva(s);
          setSidebarAbierto(false);
        }}
        conteoAlertas={alertasGrupo.length}
        abierto={sidebarAbierto}
        onCerrar={() => setSidebarAbierto(false)}
      />

      <div className="main-content">
        <header className="top-bar">
          <div className="header-brand-greeting" style={styles.brandGreetingWrapper}>
            <button
              type="button"
              onClick={() => setSidebarAbierto(true)}
              className="menu-toggle-btn"
              title="Abrir menú"
            >
              <Menu size={20} />
            </button>

            <img
              src="/logo-ubb-navbar.png"
              alt="Universidad del Bío-Bío"
              className="header-logo-mobile"
              style={styles.headerLogo}
            />
            <div className="header-separator-mobile" style={styles.headerSeparator}></div>
            <div className="header-greeting-mobile">
              <span className="top-tag-mobile" style={styles.topTag}>Campus Concepción • Segundo Semestre 2026</span>
              <h2 className="top-greeting-mobile" style={styles.topGreeting}>Bienvenido(a), {nombreTutor}</h2>
            </div>
          </div>

          <button
            onClick={cargarDatos}
            disabled={cargando}
            className="btn-secondary sync-btn-mobile"
            style={styles.refreshBtn}
            title="Sincronizar información del sistema"
            type="button"
          >
            <RefreshCw size={15} className={iconoRefrescarClase} />
            <span>Sincronizar</span>
          </button>
        </header>

        {error && (
          <div style={styles.errorAlert}>
            <span>Ocurrió un problema: {error}</span>
            <button
              onClick={cargarDatos}
              className="btn-secondary"
              style={{ marginLeft: '1rem', padding: '0.3rem 0.6rem' }}
              type="button"
            >
              Reintentar
            </button>
          </div>
        )}

        <main className="content-body">
          {seccionActiva === 'dashboard' && (
            <div>
              <TarjetasMetricas metricas={metricas} />

              <BannerAlertas
                alertas={alertasGrupo}
                onSelectEstudiante={(id: number) => setEstudianteModalId(id)}
                onIrActividades={() => setSeccionActiva('actividades')}
              />
            </div>
          )}

          {seccionActiva === 'estudiantes' && (
            <div>
              <div style={styles.sectionHeader}>
                <div>
                  <h3 style={styles.sectionTitle}>Gestión y Nómina de Estudiantes Novatos</h3>
                  <p style={styles.sectionSubtitle}>
                    Búsqueda en tiempo real por nombre o RUT institucional, filtrado por estado de atención y registro de estudiantes.
                  </p>
                </div>
              </div>

              <TablaEstudiantes
                estudiantes={estudiantes}
                onSelectEstudiante={(id: number) => setEstudianteModalId(id)}
                onNuevoEstudiante={() => setMostrarModalNuevo(true)}
              />
            </div>
          )}

          {seccionActiva === 'actividades' && (
            <VistaActividades
              actividades={actividades}
              cargando={cargando}
              onSelectEstudiante={(id: number) => setEstudianteModalId(id)}
            />
          )}

          {seccionActiva === 'consultas' && <VistaHorarioConsultas />}
        </main>
      </div>

      {estudianteModalId && (
        <ModalEstudiante
          estudianteId={estudianteModalId}
          onClose={() => setEstudianteModalId(null)}
          onEstudianteEliminado={() => {
            setEstudianteModalId(null);
            cargarDatos();
          }}
        />
      )}

      {mostrarModalNuevo && (
        <ModalNuevoEstudiante
          onClose={() => setMostrarModalNuevo(false)}
          onEstudianteCreado={() => {
            cargarDatos();
          }}
        />
      )}

      {cargando && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingBox}>
            <div style={styles.loadingSpinnerWrapper}>
              <RefreshCw size={36} color="#0284c7" className="spin-icon" />
            </div>
            <p style={styles.loadingTitle}>Cargando información institucional...</p>
            <span style={styles.loadingSubtitle}>Conectando con el servidor UBB</span>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  layout: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
  },
  mainContent: {
    marginLeft: '270px',
    flex: 1,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  topBar: {
    backgroundColor: '#002b49',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '1.25rem 2.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  brandGreetingWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  headerLogo: {
    height: '42px',
    width: 'auto',
    objectFit: 'contain',
    display: 'block',
  },
  headerSeparator: {
    width: '1px',
    height: '36px',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  topTag: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#93c5fd',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'block',
    marginBottom: '0.2rem',
  },
  topGreeting: {
    fontSize: '1.45rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
    lineHeight: 1.2,
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.5rem 0.95rem',
    fontSize: '0.85rem',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.15s ease',
  },
  contentBody: {
    padding: '2rem 2.5rem 4rem 2.5rem',
    flex: 1,
  },
  errorAlert: {
    margin: '1.5rem 2.5rem 0 2.5rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    color: '#b91c1c',
    padding: '1rem',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
  },
  sectionHeader: {
    marginBottom: '1.25rem',
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
