import { useState } from 'react';
import { ChevronRight, Filter, Search, User } from 'lucide-react';

export const TablaEstudiantes = ({ estudiantes, onSelectEstudiante }) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

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
      if (estudiante.estadoAtencion.toLowerCase() !== filtroEstado.toLowerCase()) {
        coincideEstado = false;
      }
    }

    return coincideTexto && coincideEstado;
  });

  return (
    <div style={styles.container}>
      
      <div style={styles.toolbar}>
        <div style={styles.searchWrapper}>
          <Search size={18} color="#94a3b8" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por nombre o RUT del estudiante..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>
            <Filter size={15} /> Filtrar:
          </span>
          <button
            onClick={() => setFiltroEstado('todos')}
            style={filtroEstado === 'todos' ? styles.filterBtnActive : styles.filterBtn}
          >
            Todos ({estudiantes.length})
          </button>
          <button
            onClick={() => setFiltroEstado('Al dia')}
            style={filtroEstado === 'Al dia' ? styles.filterBtnActive : styles.filterBtn}
          >
            Al día
          </button>
          <button
            onClick={() => setFiltroEstado('En progreso')}
            style={filtroEstado === 'En progreso' ? styles.filterBtnActive : styles.filterBtn}
          >
            En progreso
          </button>
          <button
            onClick={() => setFiltroEstado('En riesgo')}
            style={filtroEstado === 'En riesgo' ? styles.filterBtnActiveRisk : styles.filterBtn}
          >
            En riesgo
          </button>
        </div>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
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
                
                let progressClass = 'progress-fill-medium';
                if (estudiante.porcentajeAvance >= 50) {
                  progressClass = 'progress-fill-high';
                } else if (estudiante.porcentajeAvance < 25) {
                  progressClass = 'progress-fill-low';
                }

                let badgeClass = 'badge-en-progreso';
                if (estudiante.estadoAtencion === 'Al dia') {
                  badgeClass = 'badge-al-dia';
                } else if (estudiante.estadoAtencion === 'En riesgo') {
                  badgeClass = 'badge-en-riesgo';
                }

                return (
                  <tr key={estudiante.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.studentInfo}>
                        <div style={styles.studentAvatar}>
                          <User size={16} color="#002b49" />
                        </div>
                        <div>
                          <span style={styles.studentName}>{estudiante.nombre}</span>
                          <span style={styles.studentRut}>{estudiante.rut}</span>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.careerText}>{estudiante.carrera}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.missionsCount}>
                        <strong>{estudiante.misionesCompletadas}</strong> de {estudiante.totalMisiones}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.progressCell}>
                        <div className="progress-bar-container" style={{ width: '110px' }}>
                          <div
                            className={`progress-bar-fill ${progressClass}`}
                            style={{ width: `${estudiante.porcentajeAvance}%` }}
                          />
                        </div>
                        <span style={styles.progressPercent}>{estudiante.porcentajeAvance}%</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span className={`badge ${badgeClass}`}>{estudiante.estadoAtencion}</span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <button
                        onClick={() => onSelectEstudiante(estudiante.id)}
                        className="btn-secondary"
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
  );
};

const styles = {
  container: {
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
    minWidth: '280px',
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
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: '0.85rem',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginRight: '0.25rem',
  },
  filterBtn: {
    padding: '0.45rem 0.85rem',
    fontSize: '0.8rem',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontWeight: '500',
  },
  filterBtnActive: {
    padding: '0.45rem 0.85rem',
    fontSize: '0.8rem',
    borderRadius: '6px',
    border: '1px solid #002b49',
    backgroundColor: '#002b49',
    color: '#ffffff',
    fontWeight: '600',
  },
  filterBtnActiveRisk: {
    padding: '0.45rem 0.85rem',
    fontSize: '0.8rem',
    borderRadius: '6px',
    border: '1px solid #ef4444',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontWeight: '600',
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
