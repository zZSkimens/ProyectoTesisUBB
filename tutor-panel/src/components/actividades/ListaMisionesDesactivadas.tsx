import type { MisionDesactivada } from '../../types';
import { styles } from './actividades.styles';

interface ListaMisionesDesactivadasProps {
  misiones: MisionDesactivada[];
  confirmarRetiroId: number | undefined;
  actualizandoId: number | null;
  errorAsignacion: { id: number; mensaje: string } | null;
  onActualizarAsignacion: (id: number, accion: 'reactivar' | 'quitar') => void;
  onSolicitarRetiro: (id: number) => void;
  onCancelarRetiro: () => void;
}

export function ListaMisionesDesactivadas({
  misiones,
  confirmarRetiroId,
  actualizandoId,
  errorAsignacion,
  onActualizarAsignacion,
  onSolicitarRetiro,
  onCancelarRetiro,
}: ListaMisionesDesactivadasProps) {
  return (
    <section style={styles.container} aria-labelledby="misiones-desactivadas-titulo">
      <div style={styles.header}>
        <div>
          <h4 id="misiones-desactivadas-titulo" style={styles.title}>
            Misiones desactivadas ({misiones.length})
          </h4>
          <p style={styles.subtitle}>
            Al reactivar una misión, volverá a contar para el avance de tus estudiantes.
          </p>
        </div>
      </div>
      {misiones.length === 0 ? (
        <p style={styles.emptyText}>No tienes misiones desactivadas.</p>
      ) : (
        <div style={styles.grid}>
          {misiones.map((mision) => (
            <div key={mision.id} style={styles.card}>
              <div style={styles.cardTop}><span style={styles.moduleBadge}>{mision.modulo}</span></div>
              <h5 style={styles.actTitle}>{mision.titulo}</h5>
              {errorAsignacion?.id === mision.id && (
                <p role="alert" className="mission-message-error">{errorAsignacion.mensaje}</p>
              )}
              {confirmarRetiroId === mision.id ? (
                <div>
                  <p style={styles.subtitle}>
                    La misión desaparecerá de tu lista. Se conservarán los puntos que tus estudiantes ya ganaron.
                  </p>
                  <div style={styles.filterGroup}>
                    <button
                      type="button"
                      className="btn-danger"
                      disabled={actualizandoId !== null}
                      onClick={() => onActualizarAsignacion(mision.id, 'quitar')}
                    >
                      {actualizandoId === mision.id ? 'Quitando…' : 'Confirmar retiro'}
                    </button>
                    <button type="button" className="btn-secondary" disabled={actualizandoId !== null} onClick={onCancelarRetiro}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={styles.cardActionArea}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={styles.expandBtn}
                    disabled={actualizandoId !== null}
                    onClick={() => onActualizarAsignacion(mision.id, 'reactivar')}
                  >
                    {actualizandoId === mision.id ? 'Reactivando…' : 'Reactivar misión para mi grupo'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={styles.expandBtn}
                    disabled={actualizandoId !== null}
                    onClick={() => onSolicitarRetiro(mision.id)}
                  >
                    Quitar de mi lista
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
