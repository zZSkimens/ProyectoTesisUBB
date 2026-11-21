import type { FormEvent } from 'react';
import { ChevronDown, Clock, MapPin, MessageSquare, Save } from 'lucide-react';
import { configuracionSalas, diasSemana, type CentroAtencionFormulario } from '../../utils/horarioConsultas';
import { styles } from './horarioConsultas.styles';

interface FormularioCentroAtencionProps {
  centro: CentroAtencionFormulario;
  centroAbierto: boolean;
  bloqueado: boolean;
  guardando: boolean;
  onToggle: () => void;
  onActualizar: (cambios: Partial<CentroAtencionFormulario>) => void;
  onGuardar: (evento: FormEvent<HTMLFormElement>) => void;
}

export function FormularioCentroAtencion({
  centro, centroAbierto, bloqueado, guardando, onToggle, onActualizar, onGuardar,
}: FormularioCentroAtencionProps) {
  const configuracionActual = configuracionSalas[centro.edificioSala];
  const numerosSalaDisponibles = Array.from(
    { length: configuracionActual.salasPorPiso },
    (_, indice) => indice + 1
  );
  let clasesCentro = 'consultas-center-form';
  if (centroAbierto) {
    clasesCentro += ' consultas-center-open';
  }
  let textoBotonCentro = 'Configurar';
  let resumenCentro = centro.horarioConsultas;
  if (centro.modalidad === 'presencial') {
    resumenCentro += ' · Presencial';
    if (centro.oficina) {
      resumenCentro += ' · Sala ' + centro.oficina;
    }
  } else {
    resumenCentro += ' · Online';
    if (centro.canalContacto) {
      resumenCentro += ' · ' + centro.canalContacto;
    }
  }
  if (centro.guardado) {
    textoBotonCentro = 'Editar';
  }
  if (centroAbierto && centro.guardado) {
    textoBotonCentro = 'Cerrar edición';
  } else if (centroAbierto) {
    textoBotonCentro = 'Ocultar';
  }

  return (
    <form className={clasesCentro} onSubmit={onGuardar} style={styles.centerFormCard}>
      <div className="consultas-center-heading">
        <div className="consultas-center-heading-info">
          <h5 style={styles.centerTitle}>Centro de atención {centro.numeroCentro}</h5>
          {centro.guardado && !centroAbierto && (
            <span className="consultas-center-summary">{resumenCentro}</span>
          )}
        </div>
        <button
          type="button"
          className="consultas-mobile-toggle"
          onClick={onToggle}
          aria-expanded={centroAbierto}
        >
          <span>{textoBotonCentro}</span>
          <ChevronDown size={16} />
        </button>
      </div>
      <div className="consultas-form-fields">
        <div style={styles.formGroup}>
          <label style={styles.label}>
            <Clock size={16} color="#0284c7" />
            <span>¿Cuántos días por semana?</span>
          </label>
          <select
            value={centro.diasPorSemana}
            onChange={(e) => {
              const cantidad = Number(e.target.value);
              const diasRecortados = centro.diasSeleccionados.slice(0, cantidad);
              onActualizar({
                diasPorSemana: cantidad,
                diasSeleccionados: diasRecortados,
              });
            }}
            style={styles.select}
            disabled={bloqueado}
            required
          >
            {[1, 2].map((cantidad) => (
              <option key={cantidad} value={cantidad}>{cantidad}</option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}><span>¿Qué días?</span></label>
          <div className="consultas-week-days" style={styles.weekDaysGrid}>
            {diasSemana.map((dia) => {
              const seleccionado = centro.diasSeleccionados.includes(dia);
              const limiteAlcanzado = centro.diasSeleccionados.length >= centro.diasPorSemana;
              return (
                <label className="consultas-week-day-option" key={dia} style={styles.weekDayOption}>
                  <input
                    type="checkbox"
                    checked={seleccionado}
                    disabled={bloqueado || (!seleccionado && limiteAlcanzado)}
                    onChange={(e) => {
                      let nuevosDias: string[];
                      if (e.target.checked) {
                        nuevosDias = [...centro.diasSeleccionados, dia];
                      } else {
                        nuevosDias = centro.diasSeleccionados.filter((diaActual) => diaActual !== dia);
                      }
                      onActualizar({ diasSeleccionados: nuevosDias });
                    }}
                  />
                  <span>{dia}</span>
                </label>
              );
            })}
          </div>
          <span style={styles.fieldHelp}>
            Seleccionados: {centro.diasSeleccionados.length} de {centro.diasPorSemana} días.
          </span>
        </div>

        <div className="consultas-time-range" style={styles.timeRangeRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}><span>Hora de inicio</span></label>
            <input
              type="time"
              value={centro.horaInicio}
              onChange={(e) => onActualizar({ horaInicio: e.target.value })}
              style={styles.input}
              disabled={bloqueado}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}><span>Hora de término</span></label>
            <input
              type="time"
              value={centro.horaFin}
              onChange={(e) => onActualizar({ horaFin: e.target.value })}
              style={styles.input}
              disabled={bloqueado}
              required
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}><MapPin size={16} color="#0284c7" /><span>Modalidad</span></label>
          <select
            value={centro.modalidad}
            onChange={(e) => {
              const nuevaModalidad = e.target.value as 'presencial' | 'online';
              let nuevoCanalContacto = '';
              if (nuevaModalidad === 'online') {
                nuevoCanalContacto = 'Discord';
              }
              onActualizar({
                modalidad: nuevaModalidad,
                oficina: '',
                canalContacto: nuevoCanalContacto,
                urlContacto: '',
              });
            }}
            style={styles.select}
            disabled={bloqueado}
            required
          >
            <option value="presencial">Presencial</option>
            <option value="online">Online</option>
          </select>
        </div>

        {centro.modalidad === 'presencial' && (
          <div style={styles.formGroup}>
            <label style={styles.label}><MapPin size={16} color="#0284c7" /><span>Sala de atención</span></label>
            <div className="consultas-room-selectors" style={styles.roomSelectors}>
              <select
                value={centro.edificioSala}
                onChange={(e) => {
                  const nuevoEdificio = e.target.value;
                  onActualizar({
                    edificioSala: nuevoEdificio,
                    pisoSala: configuracionSalas[nuevoEdificio].pisos[0],
                    oficina: '',
                  });
                }}
                style={styles.select}
                disabled={bloqueado}
                required
              >
                <option value="AA">Edificio AA</option>
                <option value="AB">Edificio AB</option>
                <option value="AC">Edificio AC</option>
                <option value="AD">Edificio AD</option>
              </select>
              <select
                value={centro.pisoSala}
                onChange={(e) => onActualizar({
                  pisoSala: Number(e.target.value),
                  oficina: '',
                })}
                style={styles.select}
                disabled={bloqueado}
                required
              >
                {configuracionActual.pisos.map((piso) => (
                  <option key={piso} value={piso}>Piso {piso}</option>
                ))}
              </select>
              <select
                value={centro.oficina}
                onChange={(e) => onActualizar({ oficina: e.target.value })}
                style={styles.select}
                disabled={bloqueado}
                required
              >
                <option value="" disabled>Selecciona una sala</option>
                {numerosSalaDisponibles.map((numeroSala) => {
                  const codigoSala = 'A' + centro.pisoSala + String(numeroSala).padStart(2, '0') + centro.edificioSala;
                  return <option key={codigoSala} value={codigoSala}>Sala {codigoSala}</option>;
                })}
              </select>
            </div>
            <span style={styles.fieldHelp}>Selecciona edificio, piso y sala.</span>
          </div>
        )}

        {centro.modalidad === 'online' && (
          <>
            <div style={styles.formGroup}>
              <label style={styles.label}><MessageSquare size={16} color="#0284c7" /><span>Plataforma online</span></label>
              <select
                value={centro.canalContacto}
                onChange={(e) => onActualizar({ canalContacto: e.target.value })}
                style={styles.select}
                disabled={bloqueado}
                required
              >
                <option value="Discord">Discord</option>
                <option value="Meet">Meet</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}><span>URL de contacto (opcional)</span></label>
              <input
                type="url"
                value={centro.urlContacto}
                onChange={(e) => onActualizar({ urlContacto: e.target.value })}
                placeholder="https://..."
                style={styles.input}
                disabled={bloqueado}
              />
            </div>
          </>
        )}
        <div style={styles.btnRow}>
          <button type="submit" disabled={bloqueado} className="btn-primary consultas-save-button" style={styles.saveBtn}>
            <Save size={16} />
            <span>
              {guardando && 'Guardando...'}
              {!guardando && centro.guardado && 'Actualizar Centro ' + centro.numeroCentro}
              {!guardando && !centro.guardado && 'Guardar Centro ' + centro.numeroCentro}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
