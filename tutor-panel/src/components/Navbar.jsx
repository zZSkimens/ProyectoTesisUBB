import { useEffect, useRef, useState } from 'react';
import { LogOut, Menu, User, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { ModalPerfilTutor } from './ModalPerfilTutor.jsx';

export const Navbar = () => {
  const { usuario, cerrarSesion } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modalPerfilAbierto, setModalPerfilAbierto] = useState(false);
  const menuRef = useRef(null);

const [fotoPerfil, setFotoPerfil] = useState(() => {
    let key = 'tutor_foto_perfil_default';
    if (usuario && usuario.id) {
      key = 'tutor_foto_perfil_' + usuario.id;
    }
    const guardada = localStorage.getItem(key);
    if (guardada) {
      return guardada;
    }
    return null;
  });

useEffect(() => {
    const handleClickAfuera = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(false);
      }
    };

    document.addEventListener('mousedown', handleClickAfuera);
    return () => {
      document.removeEventListener('mousedown', handleClickAfuera);
    };
  }, []);

  let nombreTutor = 'Tutor';
  if (usuario && usuario.nombre) {
    const partes = usuario.nombre.trim().split(' ');
    if (partes.length > 0 && partes[0]) {
      nombreTutor = partes[0];
    }
  }

  return (
    <>
      <header style={styles.header}>
        <div style={styles.container}>
          <div style={styles.brandContainer}>
            <img
              src="/logo-ubb-dashboard.png"
              alt="Universidad del Bío-Bío"
              style={styles.logoImg}
            />
            <div style={styles.separator}></div>
            <div>
              <h1 style={styles.title}>Panel de Tutor</h1>
              <p style={styles.subtitle}>Programa de Acompañamiento y Tutores</p>
            </div>
          </div>
          <div style={styles.userSection} ref={menuRef}>
            <div style={styles.userInfo}>
              <div style={styles.avatar}>
                {fotoPerfil ? (
                  <img src={fotoPerfil} alt={nombreTutor} style={styles.avatarImg} />
                ) : (
                  <UserCheck size={18} color="#ffffff" />
                )}
              </div>
              <span style={styles.welcomeText}>Bienvenid@, {nombreTutor}</span>
            </div>
            <div style={styles.menuWrapper}>
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                style={menuAbierto ? styles.menuBtnActive : styles.menuBtn}
                title="Menú de opciones"
                aria-label="Menú de opciones"
                aria-expanded={menuAbierto}
              >
                <Menu size={22} color="#ffffff" />
              </button>
              {menuAbierto ? (
                <div style={styles.dropdownMenu}>
                  <button
                    onClick={() => {
                      setMenuAbierto(false);
                      setModalPerfilAbierto(true);
                    }}
                    style={styles.dropdownItem}
                  >
                    <User size={16} color="#1d70b8" />
                    <span>Mi Perfil</span>
                  </button>

                  <div style={styles.dropdownDivider}></div>

                  <button
                    onClick={() => {
                      setMenuAbierto(false);
                      cerrarSesion();
                    }}
                    style={styles.dropdownItemDanger}
                  >
                    <LogOut size={16} color="#ef4444" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>
      {modalPerfilAbierto ? (
        <ModalPerfilTutor
          usuario={usuario}
          fotoPerfil={fotoPerfil}
          onFotoActualizada={(nuevaFoto) => setFotoPerfil(nuevaFoto)}
          onClose={() => setModalPerfilAbierto(false)}
        />
      ) : null}
    </>
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
    gap: '1.25rem',
  },
  logoImg: {
    height: '48px',
    width: 'auto',
    objectFit: 'contain',
    display: 'block',
  },
  separator: {
    width: '1px',
    height: '34px',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    margin: '0 0.15rem',
  },
  title: {
    fontSize: '1.15rem',
    fontWeight: '700',
    margin: 0,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    margin: 0,
    marginTop: '2px',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    position: 'relative',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#0b3d66',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1.5px solid #1d70b8',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  welcomeText: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: '0.2px',
  },
  menuWrapper: {
    position: 'relative',
  },
  menuBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: '0.45rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s, transform 0.1s',
  },
  menuBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.35)',
    borderRadius: '8px',
    padding: '0.45rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    minWidth: '180px',
    padding: '0.4rem',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    animation: 'fadeIn 0.15s ease',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.65rem 0.85rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#0f172a',
    fontSize: '0.9rem',
    fontWeight: '500',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'background-color 0.15s',
  },
  dropdownItemDanger: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.65rem 0.85rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#ef4444',
    fontSize: '0.9rem',
    fontWeight: '500',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'background-color 0.15s',
  },
  dropdownDivider: {
    height: '1px',
    backgroundColor: '#f1f5f9',
    margin: '0.3rem 0',
  },
};
