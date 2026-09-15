import { LogOut, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const Navbar = () => {
  const { usuario, cerrarSesion } = useAuth();

  let nombreTutor = 'Tutor';
  if (usuario && usuario.nombre) {
    nombreTutor = usuario.nombre;
  }

  let rolUsuario = 'Tutor';
  if (usuario && usuario.rol) {
    rolUsuario = usuario.rol.toUpperCase();
  }

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        
        <div style={styles.brandContainer}>
          <img
            src="/escudo-ubb.svg"
            alt="Escudo Universidad del Bío-Bío"
            style={styles.logoImg}
          />
          <div>
            <h1 style={styles.title}>Universidad del Bío-Bío</h1>
            <p style={styles.subtitle}>Programa de Tutores • Panel de Seguimiento</p>
          </div>
        </div>

        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              <UserCheck size={18} color="#ffffff" />
            </div>
            <div style={styles.userDetails}>
              <span style={styles.userName}>{nombreTutor}</span>
              <span style={styles.userRole}>{rolUsuario}</span>
            </div>
          </div>

          <button
            onClick={cerrarSesion}
            style={styles.logoutBtn}
            title="Cerrar sesion"
            aria-label="Cerrar sesion"
          >
            <LogOut size={16} />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#002b49',
    color: '#ffffff',
    borderBottom: '3px solid #f59e0b',
    padding: '0.85rem 1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  logoImg: {
    height: '42px',
    width: 'auto',
    objectFit: 'contain',
    backgroundColor: '#ffffff',
    padding: '3px 6px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '700',
    margin: 0,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    margin: 0,
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#0b3d66',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #1d70b8',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  userRole: {
    fontSize: '0.75rem',
    color: '#f59e0b',
    fontWeight: '500',
    letterSpacing: '0.5px',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#ffffff',
    padding: '0.45rem 0.85rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.2)',
    transition: 'background-color 0.2s',
  },
};
