import { useState } from 'react';
import { Target } from 'lucide-react';
import { useAsignacionesMisiones } from '../../hooks/useAsignacionesMisiones';
import type { AccionAsignacion, ActividadResumen, MisionDesactivada } from '../../types';
import { styles } from './actividades.styles';
import { ListaMisionesDesactivadas } from './ListaMisionesDesactivadas';
import { TarjetaActividad } from './TarjetaActividad';

export interface VistaActividadesProps {
  actividades: ActividadResumen[];
  misionesDesactivadas: MisionDesactivada[];
  cargando?: boolean;
  onSelectEstudiante: (id: number) => void;
  onAsignacionCambiada: (id: number, accion: AccionAsignacion) => void;
}

export function VistaActividades({
  actividades,
  misionesDesactivadas,
  cargando = false,
  onSelectEstudiante,
  onAsignacionCambiada,
}: VistaActividadesProps) {
  const [moduloFiltro, setModuloFiltro] = useState('todos');
  const [actividadExpandidaId, setActividadExpandidaId] = useState<number | null>(null);
  const {
    confirmacion,
    actualizandoId,
    errorAsignacion,
    prepararConfirmacion,
    cancelarConfirmacion,
    actualizarAsignacion,
  } = useAsignacionesMisiones((id, accion) => {
    if (accion === 'reactivar') setModuloFiltro('todos');
    onAsignacionCambiada(id, accion);
  });

  const modulosDisponibles = Array.from(new Set(actividades.map((actividad) => actividad.modulo)));
  const moduloActivo = modulosDisponibles.includes(moduloFiltro) ? moduloFiltro : 'todos';
  const actividadesFiltradas = moduloActivo === 'todos'
    ? actividades
    : actividades.filter((actividad) => actividad.modulo === moduloActivo);

  function alternarDetalle(id: number) {
    setActividadExpandidaId((actual) => actual === id ? null : id);
  }

  if (cargando) {
    return (
      <div style={styles.emptyContainer}>
        <p style={{ color: '#64748b' }}>Cargando actividades del programa...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Actividades de Inducción UBB</h3>
          <p style={styles.subtitle}>
            Seguimiento del progreso de la cohorte por misión y detección de novatos con actividades pendientes.
          </p>
        </div>

        {actividades.length > 0 && <div style={styles.filterGroup}>
          <button
            onClick={() => setModuloFiltro('todos')}
            style={moduloActivo === 'todos' ? styles.filterBtnActive : styles.filterBtn}
          >
            <span>Todos los módulos ({actividades.length})</span>
          </button>
          {modulosDisponibles.map((mod) => {
            const count = actividades.filter((a) => a.modulo === mod).length;
            const activo = moduloActivo === mod;
            return (
              <button
                key={mod}
                onClick={() => setModuloFiltro(mod)}
                style={activo ? styles.filterBtnActive : styles.filterBtn}
              >
                <span>{mod} ({count})</span>
              </button>
            );
          })}
        </div>}
      </div>

      {actividades.length === 0 && (
        <div style={styles.emptyContainer}>
          <Target size={40} color="#94a3b8" />
          <h4 style={styles.emptyTitle}>No tienes misiones activas</h4>
          <p style={styles.emptyText}>Las misiones asignadas a tu lista aparecerán aquí cuando estén activas.</p>
        </div>
      )}

      <div style={styles.grid}>
        {actividadesFiltradas.map((actividad) => (
          <TarjetaActividad
            key={actividad.id}
            actividad={actividad}
            expandido={actividadExpandidaId === actividad.id}
            confirmandoDesactivacion={confirmacion?.accion === 'desactivar' && confirmacion.id === actividad.id}
            accionesBloqueadas={actualizandoId !== null}
            desactivando={actualizandoId === actividad.id}
            error={errorAsignacion?.id === actividad.id ? errorAsignacion.mensaje : undefined}
            onAlternarDetalle={() => alternarDetalle(actividad.id)}
            onSelectEstudiante={onSelectEstudiante}
            onSolicitarDesactivacion={() => prepararConfirmacion(actividad.id, 'desactivar')}
            onConfirmarDesactivacion={() => void actualizarAsignacion(actividad.id, 'desactivar')}
            onCancelarDesactivacion={cancelarConfirmacion}
          />
        ))}
      </div>

      <ListaMisionesDesactivadas
        misiones={misionesDesactivadas}
        confirmarRetiroId={confirmacion?.accion === 'quitar' ? confirmacion.id : undefined}
        actualizandoId={actualizandoId}
        errorAsignacion={errorAsignacion}
        onActualizarAsignacion={(id, accion) => void actualizarAsignacion(id, accion)}
        onSolicitarRetiro={(id) => prepararConfirmacion(id, 'quitar')}
        onCancelarRetiro={cancelarConfirmacion}
      />
    </div>
  );
}
