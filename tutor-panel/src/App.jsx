import { useAuth } from './context/AuthContext.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';

export default function App() {
  const { estaAutenticado, cargando, usuario, cerrarSesion } = useAuth();

  if (cargando) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Cargando Plataforma de Tutores UBB...</p>
      </div>
    );
  }

  if (!estaAutenticado) {
    return <LoginPage />;
  }

  if (usuario && usuario.rol === 'estudiante') {
    return (
      <div style={styles.restrictedScreen}>
        <div style={styles.restrictedCard}>
          <h2 style={{ color: '#002b49', marginBottom: '0.5rem' }}>Portal de Tutores UBB</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Hola <strong>{usuario.nombre}</strong>. Este panel es exclusivo para el equipo de tutores y coordinadores. Para realizar tus misiones de inducción, por favor ingresa al videojuego móvil en tu dispositivo.
          </p>
          <button onClick={cerrarSesion} className="btn-primary">
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  return <DashboardPage />;
}

const styles = {
  loadingScreen: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#001b2e',
    color: '#ffffff',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255,255,255,0.2)',
    borderTopColor: '#f59e0b',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '1.25rem',
    fontSize: '0.95rem',
    color: '#94a3b8',
  },
  restrictedScreen: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    padding: '1.5rem',
  },
  restrictedCard: {
    backgroundColor: '#ffffff',
    padding: '2.5rem',
    borderRadius: '16px',
    maxWidth: '500px',
    textAlign: 'center',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
    borderTop: '4px solid #f59e0b',
  },
};
