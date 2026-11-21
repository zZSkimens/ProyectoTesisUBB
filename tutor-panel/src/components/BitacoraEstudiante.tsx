import type React from 'react';
import { useState } from 'react';
import { AlertCircle, CheckCircle2, PlusCircle } from 'lucide-react';
import { tutoresApi } from '../api/tutores.api';
import type { useBitacoraEstudiante } from '../hooks/useBitacoraEstudiante';

interface BitacoraEstudianteProps {
  estudianteId: number | null;
  visible: boolean;
  bitacora: ReturnType<typeof useBitacoraEstudiante>;
}

export function BitacoraEstudiante({ estudianteId, visible, bitacora }: BitacoraEstudianteProps) {
  const { observaciones, estadoBitacora, reintentarBitacora, agregarObservacion } = bitacora;
  const [tituloObs, setTituloObs] = useState<string>('Seguimiento por rezago');
  const [contenidoObs, setContenidoObs] = useState<string>('');
  const [compromisoObs, setCompromisoObs] = useState<string>('');
  const [tipoObs, setTipoObs] = useState<string>('alerta');
  const titulosObservacion: Record<string, string[]> = {
    alerta: ['Seguimiento por rezago', 'Baja participación', 'Dificultad académica', 'Inasistencia a actividades'],
    compromiso: ['Compromiso académico', 'Compromiso de participación', 'Compromiso de asistencia'],
  };
  const [guardandoObs, setGuardandoObs] = useState<boolean>(false);
  const [errorObs, setErrorObs] = useState<string | null>(null);
  const [exitoObs, setExitoObs] = useState<string | null>(null);

  const handleCrearObservacion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!estudianteId || guardandoObs || estadoBitacora === 'cargando') {
      return;
    }

    if (!tituloObs.trim() || !contenidoObs.trim()) {
      setErrorObs('El título y contenido son obligatorios');
      return;
    }

    setGuardandoObs(true);
    setErrorObs(null);
    setExitoObs(null);

    let compromisoFinal: string | undefined;
    if (tipoObs === 'compromiso' && compromisoObs.trim()) {
      compromisoFinal = compromisoObs.trim();
    }

    try {
      const res = await tutoresApi.crearObservacion(estudianteId, {
        tipo: tipoObs,
        titulo: tituloObs.trim(),
        contenido: contenidoObs.trim(),
        compromiso: compromisoFinal,
      });

      if (res && res.observacion) {
        agregarObservacion(res.observacion);
      }

      setTituloObs(titulosObservacion[tipoObs][0]);
      setContenidoObs('');
      setCompromisoObs('');
      setExitoObs('Observación de tutoría registrada exitosamente');
    } catch (err: any) {
      setErrorObs(err.message || 'Error al guardar la observación');
    } finally {
      setGuardandoObs(false);
    }
  };

  if (!visible) return null;

  return (
    <div style={styles.observationsContainer}>
      <div style={styles.obsFormCard}>
        <h5 style={styles.obsFormTitle}>Registrar Nueva Observación o Compromiso</h5>

        {exitoObs && (
          <div style={styles.obsSuccess}>
            <CheckCircle2 size={16} color="#15803d" />
            <span>{exitoObs}</span>
          </div>
        )}
        {errorObs && (
          <div style={styles.obsError}>
            <AlertCircle size={16} color="#b91c1c" />
            <span>{errorObs}</span>
          </div>
        )}

        <form onSubmit={handleCrearObservacion} style={styles.obsForm}>
          <div className="observation-form-row">
            <div className="observation-form-field">
              <label style={styles.obsLabel}>Título / Motivo</label>
              <select
                value={tituloObs}
                onChange={(e) => setTituloObs(e.target.value)}
                style={styles.obsSelect}
                disabled={guardandoObs}
                required
              >
                {titulosObservacion[tipoObs].map((titulo) => (
                  <option key={titulo} value={titulo}>{titulo}</option>
                ))}
              </select>
            </div>
            <div className="observation-form-field">
              <label style={styles.obsLabel}>Tipo</label>
              <select
                value={tipoObs}
                onChange={(e) => {
                  const nuevoTipo = e.target.value;
                  setTipoObs(nuevoTipo);
                  setTituloObs(titulosObservacion[nuevoTipo][0]);
                  if (nuevoTipo !== 'compromiso') {
                    setCompromisoObs('');
                  }
                }}
                style={styles.obsSelect}
                disabled={guardandoObs}
              >
                <option value="alerta">Alerta de rezago</option>
                <option value="compromiso">Compromiso acordado</option>
              </select>
            </div>
          </div>

          <div>
            <label style={styles.obsLabel}>Detalle de la Observación</label>
            <textarea
              placeholder="Describe la situación tratada en la tutoría o el contacto realizado..."
              value={contenidoObs}
              onChange={(e) => setContenidoObs(e.target.value)}
              style={styles.obsTextarea}
              rows={3}
              disabled={guardandoObs}
              required
            />
          </div>

          {tipoObs === 'compromiso' && (
            <div>
              <label style={styles.obsLabel}>Compromiso acordado</label>
              <input
                type="text"
                placeholder="Ej: Realizar la misión DDE antes del próximo taller"
                value={compromisoObs}
                onChange={(e) => setCompromisoObs(e.target.value)}
                style={styles.obsInput}
                disabled={guardandoObs}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
              disabled={guardandoObs || estadoBitacora === 'cargando'}
            >
              <PlusCircle size={15} />
              <span>{guardandoObs ? 'Guardando...' : 'Guardar Observación'}</span>
            </button>
          </div>
        </form>
      </div>

      <div style={styles.obsHistoryList}>
        <h5 style={styles.obsHistoryTitle}>
          Historial de Acompañamiento{estadoBitacora === 'lista' && ` (${observaciones.length})`}
        </h5>
        {estadoBitacora === 'cargando' && (
          <p role="status" style={styles.obsEmptyText}>Cargando observaciones…</p>
        )}
        {estadoBitacora === 'error' && (
          <div>
            <p role="alert" style={styles.obsError}>No se pudo cargar la bitácora.</p>
            <button type="button" className="btn-secondary" onClick={reintentarBitacora} disabled={guardandoObs}>
              Reintentar
            </button>
          </div>
        )}
        {estadoBitacora === 'lista' && (observaciones.length === 0 ? (
          <p style={styles.obsEmptyText}>No hay observaciones previas registradas para este estudiante.</p>
        ) : (
          observaciones.map((obs) => {
            let badgeBg = '#e0f2fe';
            let badgeCol = '#002b49';
            let labelTipo = 'Consulta';

            if (obs.tipo === 'alerta') {
              badgeBg = '#fee2e2';
              badgeCol = '#b91c1c';
              labelTipo = 'Alerta';
            } else if (obs.tipo === 'compromiso') {
              badgeBg = '#fef3c7';
              badgeCol = '#b45309';
              labelTipo = 'Compromiso';
            }

            const d = new Date(obs.creadoEn);
            const fechaStr = d.toLocaleDateString('es-CL', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div key={obs.id} style={styles.obsCard}>
                <div style={styles.obsCardHeader}>
                  <div>
                    <span style={{ ...styles.obsTypeBadge, backgroundColor: badgeBg, color: badgeCol }}>
                      {labelTipo}
                    </span>
                    <h6 style={styles.obsCardTitle}>{obs.titulo}</h6>
                  </div>
                  <span style={styles.obsDate}>{fechaStr}</span>
                </div>
                <p style={styles.obsCardContent}>{obs.contenido}</p>
                {obs.compromiso && (
                  <div style={styles.obsCompromisoBox}>
                    <strong style={{ color: '#002b49' }}>Compromiso:</strong> {obs.compromiso}
                  </div>
                )}
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  observationsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  obsFormCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '1.25rem',
    border: '1px solid #e2e8f0',
  },
  obsFormTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#002b49',
    margin: '0 0 1rem 0',
  },
  obsSuccess: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#15803d',
    padding: '0.6rem 0.85rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    marginBottom: '1rem',
  },
  obsError: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    color: '#b91c1c',
    padding: '0.6rem 0.85rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    marginBottom: '1rem',
  },
  obsForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  obsLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#334155',
    display: 'block',
    marginBottom: '0.25rem',
  },
  obsInput: {
    width: '100%',
    padding: '0.55rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    outline: 'none',
  },
  obsSelect: {
    width: '100%',
    padding: '0.55rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    outline: 'none',
    backgroundColor: '#ffffff',
  },
  obsTextarea: {
    width: '100%',
    padding: '0.55rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    outline: 'none',
    resize: 'vertical',
  },
  obsHistoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  obsHistoryTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  obsEmptyText: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    fontStyle: 'italic',
    margin: '0.5rem 0',
  },
  obsCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '0.85rem',
    border: '1px solid #e2e8f0',
  },
  obsCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.35rem',
  },
  obsTypeBadge: {
    fontSize: '0.65rem',
    fontWeight: '700',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
    display: 'inline-block',
    marginBottom: '0.25rem',
    textTransform: 'uppercase',
  },
  obsCardTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  obsDate: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  obsCardContent: {
    fontSize: '0.85rem',
    color: '#475569',
    margin: '0 0 0.5rem 0',
    lineHeight: '1.4',
  },
  obsCompromisoBox: {
    fontSize: '0.8rem',
    color: '#0284c7',
    backgroundColor: '#f0f9ff',
    padding: '0.4rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid #e0f2fe',
  },
};
