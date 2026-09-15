import { useState } from 'react';
import { AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const LoginPage = () => {
  const { iniciarSesion } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorLocal, setErrorLocal] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLocal('');

    if (!email.trim()) {
      setErrorLocal('Por favor ingrese su correo institucional');
      return;
    }

    if (!password) {
      setErrorLocal('Por favor ingrese su contraseña');
      return;
    }

    setCargando(true);

    try {
      await iniciarSesion(email, password);
    } catch (err) {
      setErrorLocal(err.message || 'Credenciales invalidas. Intente nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        
        <div style={styles.brandHeader}>
          <img
            src="/escudo-ubb.svg"
            alt="Escudo Universidad del Bío-Bío"
            style={styles.logoUBB}
          />
          <h1 style={styles.title}>Panel de Tutor</h1>
          <p style={styles.subtitle}>Monitoreo y Acompañamiento Estudiantil</p>
        </div>

        {errorLocal ? (
          <div style={styles.alertError}>
            <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
            <span>{errorLocal}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Correo Institucional</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
              <input
                type="email"
                placeholder="ejemplo@alumnos.ubiobio.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                disabled={cargando}
                autoFocus
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                disabled={cargando}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="btn-primary"
            style={styles.submitBtn}
          >
            {cargando ? (
              <span>Iniciando sesion...</span>
            ) : (
              <>
                <span>Ingresar al Panel</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#001b2e',
    backgroundImage: 'radial-gradient(#0b3d66 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    padding: '1.5rem',
  },
  loginBox: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '440px',
    padding: '2.5rem 2rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
    borderTop: '4px solid #f59e0b',
  },
  brandHeader: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  logoUBB: {
    height: '75px',
    width: 'auto',
    display: 'block',
    margin: '0 auto 1rem auto',
    objectFit: 'contain',
  },
  title: {
    fontSize: '1.35rem',
    fontWeight: '700',
    color: '#002b49',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginTop: '0.35rem',
  },
  alertError: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    fontSize: '0.85rem',
    color: '#b91c1c',
    marginBottom: '1.25rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#334155',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  submitBtn: {
    width: '100%',
    justifyContent: 'center',
    padding: '0.85rem',
    fontSize: '0.95rem',
    marginTop: '0.5rem',
    backgroundColor: '#002b49',
    color: '#ffffff',
  },
};
