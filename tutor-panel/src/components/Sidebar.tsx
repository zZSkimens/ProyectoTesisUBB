import type React from 'react';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Target, Clock, LogOut, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ModalPerfilTutor } from './ModalPerfilTutor';

export type SeccionPanel = 'dashboard' | 'estudiantes' | 'actividades' | 'consultas';

export interface SidebarProps {
  seccionActiva: SeccionPanel;
  onCambiarSeccion: (seccion: SeccionPanel) => void;
  conteoAlertas?: number;
  abierto?: boolean;
  onCerrar?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  seccionActiva,
  onCambiarSeccion,
  conteoAlertas = 0,
  abierto = false,
  onCerrar,
}) => {
  const { usuario, cerrarSesion } = useAuth();
  const [modalPerfilAbierto, setModalPerfilAbierto] = useState<boolean>(false);
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

  useEffect(() => {
    let storageKey = 'tutor_foto_perfil_default';
    if (usuario && usuario.id) {
      storageKey = 'tutor_foto_perfil_' + usuario.id;
    }
    setFotoPerfil(localStorage.getItem(storageKey));
  }, [usuario?.id]);

  let nombreTutor = 'Tutor UBB';
  if (usuario && usuario.nombre) {
    nombreTutor = usuario.nombre;
  }

  let avatarTutor = <span>{nombreTutor.charAt(0).toUpperCase()}</span>;
  if (fotoPerfil) {
    avatarTutor = <img src={fotoPerfil} alt="" style={styles.avatarImage} />;
  }

  let badgeDashboard: string | null = null;
  if (conteoAlertas > 0) {
    badgeDashboard = `${conteoAlertas}`;
  }

  let claseSidebar = 'sidebar-desktop';
  if (abierto) {
    claseSidebar = 'sidebar-desktop sidebar-abierta';
  }

  const handleSeleccionarSeccion = (id: SeccionPanel) => {
    onCambiarSeccion(id);
    if (onCerrar) {
      onCerrar();
    }
  };

  const items = [
    {
      id: 'dashboard' as SeccionPanel,
      label: 'Panel Principal',
      sublabel: 'Métricas y alertas tempranas',
      icon: <LayoutDashboard size={20} />,
      badge: badgeDashboard,
    },
    {
      id: 'estudiantes' as SeccionPanel,
      label: 'Nómina de Estudiantes',
      sublabel: 'Seguimiento y búsqueda',
      icon: <Users size={20} />,
      badge: null,
    },
    {
      id: 'actividades' as SeccionPanel,
      label: 'Actividades de Inducción',
      sublabel: 'Módulos y misiones UBB',
      icon: <Target size={20} />,
      badge: null,
    },
    {
      id: 'consultas' as SeccionPanel,
      label: 'Horario de Consultas',
      sublabel: 'Atención presencial y virtual',
      icon: <Clock size={20} />,
      badge: null,
    },
  ];

  return (
    <aside className={claseSidebar}>
      <div style={styles.brandHeader}>
        <div style={styles.brandHeaderInner}>
          <div>
            <h1 style={styles.brandTitle}>Panel de Tutor</h1>
            <span style={styles.brandSubtitle}>Sede Concepción</span>
          </div>
          {onCerrar && (
            <button
              type="button"
              onClick={onCerrar}
              className="sidebar-close-btn"
              title="Cerrar barra lateral"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div style={styles.navSection}>
        <span style={styles.navCategory}>Opciones</span>
        <nav style={styles.nav}>
          {items.map((item) => {
            const activo = seccionActiva === item.id;
            let itemEstilo = styles.navItem;
            if (activo) {
              itemEstilo = { ...styles.navItem, ...styles.navItemActive };
            }

            let iconEstilo = styles.iconInactive;
            if (activo) {
              iconEstilo = styles.iconActive;
            }

            let labelEstilo = styles.itemLabel;
            if (activo) {
              labelEstilo = styles.itemLabelActive;
            }

            return (
              <button
                key={item.id}
                onClick={() => handleSeleccionarSeccion(item.id)}
                style={itemEstilo}
                type="button"
              >
                <div style={iconEstilo}>
                  {item.icon}
                </div>
                <div style={styles.itemTextContainer}>
                  <span style={labelEstilo}>
                    {item.label}
                  </span>
                  <span style={styles.itemSublabel}>{item.sublabel}</span>
                </div>
                {item.badge && (
                  <span style={styles.alertBadge}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div style={styles.userFooter}>
        <button
          onClick={() => setModalPerfilAbierto(true)}
          style={styles.userInfoButton}
          title="Abrir mi perfil de tutor"
          aria-label="Abrir mi perfil de tutor"
          type="button"
        >
          <div style={styles.userInfo}>
            <div style={styles.avatarCircle}>
              {avatarTutor}
            </div>
            <div style={styles.userDetails}>
              <strong style={styles.userName}>{nombreTutor}</strong>
            </div>
            <UserRound size={16} style={styles.profileIcon} />
          </div>
        </button>

        <button
          onClick={cerrarSesion}
          style={styles.logoutBtn}
          title="Cerrar sesión del panel"
          type="button"
        >
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {modalPerfilAbierto && (
        <ModalPerfilTutor
          usuario={usuario}
          fotoPerfil={fotoPerfil}
          onFotoActualizada={setFotoPerfil}
          onClose={() => setModalPerfilAbierto(false)}
        />
      )}
    </aside>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '270px',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    backgroundColor: '#001e36',
    borderRight: '1px solid #002b49',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    zIndex: 100,
    color: '#ffffff',
    boxShadow: '4px 0 16px rgba(0, 0, 0, 0.15)',
  },
  brandHeader: {
    padding: '1.5rem 1.5rem 1.25rem 1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  brandHeaderInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  brandTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.3px',
  },
  brandSubtitle: {
    fontSize: '0.78rem',
    color: '#93c5fd',
    display: 'block',
    marginTop: '0.25rem',
  },
  navSection: {
    padding: '1.25rem 0.75rem',
    flex: 1,
    overflowY: 'auto',
  },
  navCategory: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.75px',
    padding: '0 0.75rem 0.75rem 0.75rem',
    display: 'block',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.75rem 0.85rem',
    borderRadius: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  navItemActive: {
    backgroundColor: '#0284c7',
    boxShadow: '0 4px 10px rgba(2, 132, 199, 0.35)',
  },
  iconInactive: {
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
  },
  iconActive: {
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
  },
  itemTextContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  itemLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#e2e8f0',
  },
  itemLabelActive: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  itemSublabel: {
    fontSize: '0.7rem',
    color: '#94a3b8',
    marginTop: '0.15rem',
  },
  alertBadge: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '0.7rem',
    fontWeight: '800',
    padding: '0.15rem 0.45rem',
    borderRadius: '999px',
  },
  userFooter: {
    padding: '1.25rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  userInfoButton: {
    display: 'block',
    width: '100%',
    padding: 0,
    margin: 0,
    border: 'none',
    borderRadius: '8px',
    color: 'inherit',
    backgroundColor: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
  },
  avatarCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#f59e0b',
    color: '#002b49',
    fontWeight: '800',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  userName: {
    fontSize: '0.85rem',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  profileIcon: {
    color: '#93c5fd',
    flexShrink: 0,
    marginLeft: 'auto',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.55rem',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#fca5a5',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
};
