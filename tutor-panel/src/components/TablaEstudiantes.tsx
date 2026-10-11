import type React from 'react';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Filter, Search, User, UserPlus } from 'lucide-react';
import type { Estudiante } from '../types/index.js';

export interface TablaEstudiantesProps {
  estudiantes: Estudiante[];
  onSelectEstudiante: (id: number) => void;
  onNuevoEstudiante?: () => void;
}

export const TablaEstudiantes: React.FC<TablaEstudiantesProps> = ({
  estudiantes,
  onSelectEstudiante,
  onNuevoEstudiante,
}) => {
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState<boolean>(false);

  const estudiantesFiltrados = estudiantes.filter((estudiante) => {
    const termino = busqueda.toLowerCase().trim();
    let coincideTexto = true;

    if (termino !== '') {
      const nombreMatch = estudiante.nombre.toLowerCase().includes(termino);
      const rutMatch = estudiante.rut.toLowerCase().includes(termino);

      if (!nombreMatch && !rutMatch) {
        coincideTexto = false;
      }
    }

    let coincideEstado = true;
    if (filtroEstado !== 'todos') {
      const estadoActual = (estudiante.estadoAtencion || estudiante.estado || '').toLowerCase();
      if (estadoActual !== filtroEstado.toLowerCase()) {
        coincideEstado = false;
      }
    }

    return coincideTexto && coincideEstado;
  });

  let textoFiltroSeleccionado = 'Todos';
  if (filtroEstado === 'Al dia') {
    textoFiltroSeleccionado = 'Al día';
  } else if (filtroEstado === 'En progreso') {
    textoFiltroSeleccionado = 'En progreso';
  } else if (filtroEstado === 'En riesgo') {
    textoFiltroSeleccionado = 'En riesgo';
  }

  let estiloBotonFiltro = styles.filterToggle;
  if (filtroEstado !== 'todos') {
    estiloBotonFiltro = styles.filterToggleActive;
  }

  const seleccionarFiltro = (estado: string) => {
    setFiltroEstado(estado);
    setFiltrosAbiertos(false);
  };

  return (
    <div style={styles.container}>
      {onNuevoEstudiante && (
        <div className="students-actions-row" style={styles.actionsRow}>
          <button
            type="button"
            onClick={onNuevoEstudiante}
            className="btn-primary students-add-button"
            style={styles.addStudentBtn}
          >
            <UserPlus size={16} />
            <span>Inscribir Estudiante</span>
          </button>
        </div>
      )}

      <div style={styles.tableCard}>
        <div className="students-toolbar" style={styles.toolbar}>
        <div className="students-search-wrapper" style={styles.searchWrapper}>
          <Search size={18} color="#94a3b8" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar estudiante por nombre o RUT institucional..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div className="students-filter-wrapper" style={styles.filterMenuWrapper}>
          <button
            type="button"
            onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
            className="students-filter-toggle"
            style={estiloBotonFiltro}
            aria-expanded={filtrosAbiertos}
          >
            <Filter size={15} />
            <span>Filtrar: {textoFiltroSeleccionado}</span>
            <ChevronDown size={15} />
          </button>
          {filtrosAbiertos && (
            <div className="students-filter-menu" style={styles.filterMenu}>
              <button type="button" onClick={() => seleccionarFiltro('todos')} style={styles.filterMenuOption}>
                Todos ({estudiantes.length})
              </button>
              <button type="button" onClick={() => seleccionarFiltro('Al dia')} style={styles.filterMenuOption}>
                Al día
              </button>
              <button type="button" onClick={() => seleccionarFiltro('En progreso')} style={styles.filterMenuOption}>
                En progreso
              </button>
              <button type="button" onClick={() => seleccionarFiltro('En riesgo')} style={styles.filterMenuOption}>
                En riesgo
              </button>
            </div>
          )}
        </div>
        </div>
        <div style={styles.tableWrapper}>
        <table className="students-responsive-table" style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.th}>Estudiante</th>
              <th style={styles.th}>Carrera</th>
              <th style={styles.th}>Misiones</th>
              <th style={styles.th}>Avance Global</th>
              <th style={styles.th}>Estado</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {estudiantesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} style={styles.emptyCell}>
                  No se encontraron estudiantes con los filtros aplicados.
                </td>
              </tr>
            ) : (
              estudiantesFiltrados.map((estudiante) => {
                const avance = estudiante.porcentajeAvance || estudiante.promedioProgreso || 0;
                let progressClass = 'progress-fill-medium';
                if (avance >= 50) {
                  progressClass = 'progress-fill-high';
                } else if (avance < 25) {
                  progressClass = 'progress-fill-low';
                }

                const estado = estudiante.estadoAtencion || estudiante.estado || 'En progreso';
                let badgeClass = 'badge-en-progreso';
                if (estado === 'Al dia') {
                  badgeClass = 'badge-al-dia';
                } else if (estado === 'En riesgo') {
                  badgeClass = 'badge-en-riesgo';
                }

                const completadas = estudiante.misionesCompletadas || 0;
                const total = estudiante.totalMisiones || 0;

                return (
                  <tr key={estudiante.id} style={styles.tr}>
                    <td data-label="Estudiante" style={styles.td}>
                      <div style={styles.studentInfo}>
                        <div style={styles.studentAvatar}>
                          <User size={16} color="#002b49" />
                        </div>
                        <span style={styles.studentName}>{estudiante.nombre}</span>
                      </div>
                    </td>
                    <td data-label="Carrera" style={styles.td}>
                      <span style={styles.careerText}>{estudiante.carrera}</span>
                    </td>
                    <td data-label="Misiones" style={styles.td}>
                      <span style={styles.missionsCount}>
                        <strong>{completadas}</strong> de {total}
                      </span>
                    </td>
                    <td data-label="Avance global" style={styles.td}>
                      <div className="students-progress-cell" style={styles.progressCell}>
                        <div className="progress-bar-container" style={{ width: '110px' }}>
                          <div
                            className={`progress-bar-fill ${progressClass}`}
                            style={{ width: `${avance}%` }}
                          />
                        </div>
                        <span style={styles.progressPercent}>{avance}%</span>
                      </div>
                    </td>
                    <td data-label="Estado" style={styles.td}>
                      <span className={`badge ${badgeClass}`}>{estado}</span>
                    </td>
                    <td data-label="Acción" style={{ ...styles.td, textAlign: 'right' }}>
                      <button
                        onClick={() => onSelectEstudiante(estudiante.id)}
                        className="btn-secondary students-action-button"
                        style={styles.actionBtn}
                      >
                        <span>Ver Ficha</span>
                        <ChevronRight size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  actionsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  addStudentBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.65rem 1rem',
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  toolbar: {
    padding: '1.25rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    backgroundColor: '#ffffff',
  },
  searchWrapper: {
    position: 'relative',
    flex: '1',
    minWidth: 'min(100%, 260px)',
    maxWidth: '450px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  searchInput: {
    width: '100%',
    padding: '0.65rem 1rem 0.65rem 2.5rem',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    outline: 'none',
  },
  filterMenuWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  filterToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.55rem 0.8rem',
    borderRadius: '7px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: '0.85rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  filterToggleActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.55rem 0.8rem',
    borderRadius: '7px',
    border: '1px solid #002b49',
    backgroundColor: '#002b49',
    color: '#ffffff',
    fontSize: '0.85rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  filterMenu: {
    position: 'absolute',
    top: 'calc(100% + 0.4rem)',
    right: 0,
    zIndex: 10,
    minWidth: '160px',
    padding: '0.35rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '9px',
    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.12)',
  },
  filterMenuOption: {
    padding: '0.6rem 0.75rem',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    color: '#334155',
    textAlign: 'left',
    fontSize: '0.85rem',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeaderRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  th: {
    padding: '0.85rem 1.25rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '1rem 1.25rem',
    fontSize: '0.9rem',
    verticalAlign: 'middle',
  },
  studentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  studentAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    backgroundColor: '#e0f2fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentName: {
    display: 'block',
    fontWeight: '600',
    color: '#0f172a',
  },
  studentRut: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  careerText: {
    fontSize: '0.85rem',
    color: '#475569',
  },
  missionsCount: {
    fontSize: '0.9rem',
    color: '#334155',
  },
  progressCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  progressPercent: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#0f172a',
    minWidth: '35px',
  },
  actionBtn: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.8rem',
  },
  emptyCell: {
    padding: '3rem 1rem',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '0.95rem',
  },
};
