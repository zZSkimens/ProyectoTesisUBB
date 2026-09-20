import { useEffect, useRef, useState } from 'react';
import { Camera, Trash2, Upload, User, X } from 'lucide-react';

export const ModalPerfilTutor = ({ usuario, fotoPerfil, onFotoActualizada, onClose }) => {
  const [foto, setFoto] = useState(fotoPerfil);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [errorArchivo, setErrorArchivo] = useState(null);
  const fileInputRef = useRef(null);

useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

const handleSeleccionarArchivo = (e) => {
    setErrorArchivo(null);
    setMensajeExito(null);

    const archivo = e.target.files && e.target.files[0];
    if (!archivo) {
      return;
    }

const formatosPermitidos = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!formatosPermitidos.includes(archivo.type.toLowerCase())) {
      setErrorArchivo('Formato no valido. Por favor seleccione un archivo PNG, JPG o WEBP.');
      return;
    }

const tamanoMaximoBytes = 5 * 1024 * 1024;
    if (archivo.size > tamanoMaximoBytes) {
      setErrorArchivo('La imagen supera el limite maximo de 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setFoto(dataUrl);

let storageKey = 'tutor_foto_perfil_default';
      if (usuario && usuario.id) {
        storageKey = 'tutor_foto_perfil_' + usuario.id;
      }
      localStorage.setItem(storageKey, dataUrl);

      if (onFotoActualizada) {
        onFotoActualizada(dataUrl);
      }

      setMensajeExito('Foto de perfil actualizada correctamente.');
    };

    reader.readAsDataURL(archivo);
  };

const handleEliminarFoto = () => {
    setFoto(null);
    setMensajeExito(null);
    setErrorArchivo(null);

    let storageKey = 'tutor_foto_perfil_default';
    if (usuario && usuario.id) {
      storageKey = 'tutor_foto_perfil_' + usuario.id;
    }
    localStorage.removeItem(storageKey);

    if (onFotoActualizada) {
      onFotoActualizada(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setMensajeExito('Foto eliminada.');
  };

  let nombreTutor = 'Tutor Institucional';
  if (usuario && usuario.nombre) {
    nombreTutor = usuario.nombre;
  }

  let emailTutor = 'tutor@alumnos.ubiobio.cl';
  if (usuario && usuario.email) {
    emailTutor = usuario.email;
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.modalTitle}>Mi Perfil de Tutor</h2>
            <p style={styles.modalSubtitle}>Programa de Acompañamiento y Tutores UBB</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Cerrar ventana">
            <X size={20} />
          </button>
        </div>
        <div style={styles.body}>
          <div style={styles.photoSection}>
            <div style={styles.avatarWrapper}>
              {foto ? (
                <img src={foto} alt={nombreTutor} style={styles.avatarImg} />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  <User size={50} color="#002b49" />
                </div>
              )}
            </div>

            <div style={styles.photoControls}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                style={{ display: 'none' }}
                onChange={handleSeleccionarArchivo}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="btn-primary"
                style={styles.uploadBtn}
              >
                <Camera size={16} />
                <span>{foto ? 'Cambiar Foto' : 'Subir Foto'}</span>
              </button>

              {foto ? (
                <button
                  type="button"
                  onClick={handleEliminarFoto}
                  className="btn-secondary"
                  style={styles.removeBtn}
                  title="Eliminar foto de perfil"
                >
                  <Trash2 size={16} color="#ef4444" />
                  <span style={{ color: '#ef4444' }}>Eliminar</span>
                </button>
              ) : null}
            </div>

            <p style={styles.formatHint}>Formatos admitidos: PNG, JPG, JPEG o WEBP (máx. 5 MB)</p>

            {mensajeExito ? (
              <div style={styles.successAlert}>
                <span>{mensajeExito}</span>
              </div>
            ) : null}

            {errorArchivo ? (
              <div style={styles.errorAlert}>
                <span>{errorArchivo}</span>
              </div>
            ) : null}
          </div>
          <div style={styles.infoCard}>
            <div style={styles.infoHeader}>
              <div style={styles.tutorNameGroup}>
                <h3 style={styles.tutorNameText}>{nombreTutor}</h3>
                <span style={styles.tutorBadge}>Tutor</span>
              </div>
            </div>

            <div style={styles.infoList}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>RUT Institucional</span>
                <strong style={styles.infoValue}>19.876.543-2</strong>
              </div>

              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Carrera</span>
                <strong style={styles.infoValue}>Ingeniería de Ejecución en Computación e Informática</strong>
              </div>

              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Correo UBB</span>
                <strong style={styles.infoValue}>{emailTutor}</strong>
              </div>

              <div style={styles.infoItemLast}>
                <span style={styles.infoLabel}>Año de Ingreso</span>
                <strong style={styles.infoValue}>2024</strong>
              </div>
            </div>
          </div>
        </div>
        <div style={styles.footer}>
          <button onClick={onClose} className="btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 1000,
    backdropFilter: 'blur(3px)',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    width: '100%',
    maxWidth: '560px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)',
    overflow: 'hidden',
  },
  header: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#002b49',
    color: '#ffffff',
  },
  modalTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    margin: 0,
  },
  modalSubtitle: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    margin: 0,
    marginTop: '2px',
  },
  closeBtn: {
    color: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '6px',
    padding: '0.4rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: '1.5rem',
    overflowY: 'auto',
  },
  photoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1.25rem',
    borderBottom: '1px solid #e2e8f0',
  },
  avatarWrapper: {
    width: '108px',
    height: '108px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '3px solid #1d70b8',
    boxShadow: '0 4px 10px rgba(0, 43, 73, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    marginBottom: '1rem',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0f2fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoControls: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  uploadBtn: {
    fontSize: '0.85rem',
    padding: '0.5rem 1rem',
  },
  removeBtn: {
    fontSize: '0.85rem',
    padding: '0.5rem 0.9rem',
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  formatHint: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '0.65rem',
    marginBottom: 0,
    textAlign: 'center',
  },
  successAlert: {
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    color: '#065f46',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
    marginTop: '0.75rem',
    textAlign: 'center',
    fontWeight: '500',
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
    marginTop: '0.75rem',
    textAlign: 'center',
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1.25rem',
  },
  infoHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '0.5rem',
  },
  tutorNameGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
  },
  tutorNameText: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#002b49',
    margin: 0,
  },
  tutorBadge: {
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#002b49',
    color: '#f59e0b',
    border: '1px solid #1d70b8',
    padding: '0.2rem 0.55rem',
    borderRadius: '4px',
    letterSpacing: '0.5px',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
    paddingBottom: '0.65rem',
    borderBottom: '1px solid #e2e8f0',
  },
  infoItemLast: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
  infoLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    display: 'block',
  },
  infoValue: {
    fontSize: '0.9rem',
    color: '#0f172a',
  },
  footer: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: '#f8fafc',
  },
};
