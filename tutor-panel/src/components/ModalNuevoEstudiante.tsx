import type React from 'react';
import { useState } from 'react';
import { X, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { tutoresApi } from '../api/tutores.api';

const SUFIJO_CORREO_ESTUDIANTIL = '2601';

const generarCorreoInstitucional = (nombreCompleto: string): string => {
  const palabras = nombreCompleto.trim().split(/\s+/).filter((palabra) => palabra.length > 0);
  if (palabras.length < 2) {
    return '';
  }

  let apellido = palabras[palabras.length - 1];
  if (palabras.length >= 4) {
    apellido = palabras[palabras.length - 2];
  }

  const normalizarParte = (texto: string): string => texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  const nombreCorreo = normalizarParte(palabras[0]);
  const apellidoCorreo = normalizarParte(apellido);
  if (!nombreCorreo || !apellidoCorreo) {
    return '';
  }

  return nombreCorreo + '.' + apellidoCorreo + SUFIJO_CORREO_ESTUDIANTIL + '@alumnos.ubiobio.cl';
};

export interface ModalNuevoEstudianteProps {
  onClose: () => void;
  onEstudianteCreado: () => void;
}

export const ModalNuevoEstudiante: React.FC<ModalNuevoEstudianteProps> = ({
  onClose,
  onEstudianteCreado,
}) => {
  const [rut, setRut] = useState<string>('');
  const [nombre, setNombre] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [correoEditado, setCorreoEditado] = useState<boolean>(false);
  const [carrera, setCarrera] = useState<string>(
    'Ingeniería de Ejecución en Computación e Informática'
  );
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!rut.trim() || !nombre.trim() || !email.trim() || !carrera.trim()) {
      setError('Por favor complete todos los campos obligatorios.');
      return;
    }

    setGuardando(true);
    try {
      await tutoresApi.crearEstudiante({
        rut: rut.trim(),
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        carrera: carrera.trim(),
      });

      onEstudianteCreado();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al inscribir el estudiante novato');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.iconBox}>
              <UserPlus size={20} color="#0284c7" />
            </div>
            <div>
              <h3 style={styles.title}>Inscribir Mechón</h3>
              <p style={styles.subtitle}>Generación Primer Año 2026 • Campus Concepción</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={styles.closeBtn}
            title="Cerrar ventana"
            type="button"
          >
            <X size={20} color="#64748b" />
          </button>
        </div>

        {error && (
          <div style={styles.alertError}>
            <AlertCircle size={18} color="#b91c1c" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>RUT del Estudiante</label>
            <input
              type="text"
              placeholder="Ej: 21.999.888-7"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              style={styles.input}
              disabled={guardando}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Nombre Completo</label>
            <input
              type="text"
              placeholder="Ej: Camila Andrea Soto Bravo"
              value={nombre}
              onChange={(e) => {
                const nuevoNombre = e.target.value;
                setNombre(nuevoNombre);
                if (!correoEditado) {
                  setEmail(generarCorreoInstitucional(nuevoNombre));
                }
              }}
              style={styles.input}
              disabled={guardando}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Correo Institucional</label>
            <input
              type="email"
              placeholder="Ej: camila.soto2601@alumnos.ubiobio.cl"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setCorreoEditado(true);
              }}
              style={styles.input}
              disabled={guardando}
              required
            />
            <span style={styles.fieldHelp}>
              Se propone automáticamente a partir del nombre; puedes corregirlo si el correo asignado es distinto.
            </span>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Carrera</label>
            <select
              value={carrera}
              onChange={(e) => setCarrera(e.target.value)}
              style={styles.select}
              disabled={guardando}
            >
              <option value="Ingeniería de Ejecución en Computación e Informática">
                Ingeniería de Ejecución en Computación e Informática
              </option>
              <option value="Ingeniería Civil Informática">
                Ingeniería Civil Informática
              </option>
            </select>
          </div>

          <div style={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={styles.cancelBtn}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={styles.submitBtn}
              disabled={guardando}
            >
              <CheckCircle2 size={16} />
              <span>{guardando ? 'Inscribiendo...' : 'Registrar Estudiante'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    maxWidth: '520px',
    width: '100%',
    padding: '1.75rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid #e2e8f0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.25rem',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  iconBox: {
    backgroundColor: '#e0f2fe',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#002b49',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#64748b',
    marginTop: '0.2rem',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.4rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertError: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    color: '#b91c1c',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    fontSize: '0.85rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#334155',
  },
  fieldHelp: {
    fontSize: '0.75rem',
    color: '#64748b',
    lineHeight: '1.35',
  },
  input: {
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    color: '#0f172a',
    outline: 'none',
  },
  select: {
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    color: '#0f172a',
    outline: 'none',
    backgroundColor: '#ffffff',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.25rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f1f5f9',
  },
  cancelBtn: {
    padding: '0.55rem 1rem',
    fontSize: '0.85rem',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.55rem 1.25rem',
    fontSize: '0.85rem',
  },
};
