import type React from 'react';
import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { tutoresApi } from '../api/tutores.api';
import type { CentroAtencionInput } from '../types/index';
import { convertirCentroFormulario, crearCentroVacio, formatearHorario, type CentroAtencionFormulario } from '../utils/horarioConsultas';
import { FormularioCentroAtencion } from './consultas/FormularioCentroAtencion';
import { VistaPreviaCentrosAtencion } from './consultas/VistaPreviaCentrosAtencion';
import { styles } from './consultas/horarioConsultas.styles';

export const VistaHorarioConsultas: React.FC = () => {
  const [centros, setCentros] = useState<CentroAtencionFormulario[]>([
    crearCentroVacio(1),
    crearCentroVacio(2),
  ]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardandoCentro, setGuardandoCentro] = useState<number | null>(null);
  const [centrosAbiertos, setCentrosAbiertos] = useState<number[]>([]);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const alternarCentro = (numeroCentro: number) => {
    setCentrosAbiertos((actuales) => {
      if (actuales.includes(numeroCentro)) {
        return actuales.filter((numero) => numero !== numeroCentro);
      }
      return [...actuales, numeroCentro];
    });
  };

  const actualizarCentro = (numeroCentro: number, cambios: Partial<CentroAtencionFormulario>) => {
    setCentros((actuales) => actuales.map((centro) => {
      if (centro.numeroCentro === numeroCentro) {
        return { ...centro, ...cambios };
      }
      return centro;
    }));
  };

  useEffect(() => {
    async function cargarHorario() {
      setCargando(true);
      setError(null);
      try {
        const res = await tutoresApi.obtenerHorarioConsultas();
        if (res && res.centros) {
          const centrosCargados = res.centros.map(convertirCentroFormulario);
          const centroUno = centrosCargados.find((centro) => centro.numeroCentro === 1);
          const centroDos = centrosCargados.find((centro) => centro.numeroCentro === 2);
          const centrosFinales = [];
          if (centroUno) {
            centrosFinales.push(centroUno);
          } else {
            centrosFinales.push(crearCentroVacio(1));
          }
          if (centroDos) {
            centrosFinales.push(centroDos);
          } else {
            centrosFinales.push(crearCentroVacio(2));
          }
          setCentros(centrosFinales);
          setCentrosAbiertos(centrosFinales
            .filter((centro) => !centro.guardado)
            .map((centro) => centro.numeroCentro));
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar el horario de atencion');
      } finally {
        setCargando(false);
      }
    }

    cargarHorario();
  }, []);

  const handleGuardarCentro = async (e: React.FormEvent<HTMLFormElement>, centro: CentroAtencionFormulario) => {
    e.preventDefault();

    if (centro.diasSeleccionados.length !== centro.diasPorSemana) {
      setError('Selecciona exactamente la cantidad de días indicada para este centro.');
      return;
    }
    if (!centro.horaInicio || !centro.horaFin || centro.horaInicio >= centro.horaFin) {
      setError('Indica una hora de inicio y una hora de término posterior para este centro.');
      return;
    }

    setGuardandoCentro(centro.numeroCentro);
    setError(null);
    setMensajeExito(null);

    try {
      const centroLimpio: CentroAtencionInput = {
        numeroCentro: centro.numeroCentro,
        modalidad: centro.modalidad,
        oficina: '',
        horarioConsultas: formatearHorario(centro),
        canalContacto: '',
        urlContacto: '',
      };
      if (centro.modalidad === 'presencial') {
        centroLimpio.oficina = centro.oficina;
      } else {
        centroLimpio.canalContacto = centro.canalContacto;
        centroLimpio.urlContacto = centro.urlContacto.trim();
      }

      const res = await tutoresApi.actualizarHorarioConsultas({ centros: [centroLimpio] });
      if (res && res.centros) {
        const centroGuardado = res.centros.find((centroActualizado) => centroActualizado.numeroCentro === centro.numeroCentro);
        if (centroGuardado) {
          const centroFormulario = convertirCentroFormulario(centroGuardado);
          setCentros((actuales) => actuales.map((centroActual) => {
            if (centroActual.numeroCentro === centro.numeroCentro) {
              return { ...centroFormulario, guardado: true };
            }
            return centroActual;
          }));
          setCentrosAbiertos((actuales) => actuales.filter((numeroCentro) => numeroCentro !== centro.numeroCentro));
        }
      }
      setMensajeExito('Centro de atención ' + centro.numeroCentro + ' guardado correctamente.');
    } catch (err: any) {
      setError(err.message || 'Ocurrio un problema al guardar los cambios.');
    } finally {
      setGuardandoCentro(null);
    }
  };

  if (cargando) {
    return (
      <div style={styles.loadingBox}>
        <Clock size={32} color="#0284c7" />
        <p style={{ color: '#64748b', marginTop: '0.75rem' }}>Cargando disponibilidad de consultas...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Horario de Atención para Consultas</h3>
          <p style={styles.subtitle}>Configura y publica dos opciones de atención para tus estudiantes asignados.</p>
        </div>
      </div>

      {mensajeExito && (
        <div style={styles.alertSuccess}>
          <CheckCircle2 size={18} color="#15803d" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {error && (
        <div style={styles.alertError}>
          <AlertCircle size={18} color="#b91c1c" />
          <span>{error}</span>
        </div>
      )}

      <div className="consultas-content-grid" style={styles.contentGrid}>
        <div className="consultas-card-form" style={styles.cardForm}>
          <h4 style={styles.cardTitle}>Configuración de Disponibilidad</h4>
          <p style={styles.cardDesc}>
            Esta información es visible para la coordinación de tutores y tus estudiantes asignados.
          </p>

          <div style={styles.form}>
            {centros.map((centro) => (
              <FormularioCentroAtencion
                key={centro.numeroCentro}
                centro={centro}
                centroAbierto={centrosAbiertos.includes(centro.numeroCentro)}
                bloqueado={guardandoCentro !== null}
                guardando={guardandoCentro === centro.numeroCentro}
                onToggle={() => alternarCentro(centro.numeroCentro)}
                onActualizar={(cambios) => actualizarCentro(centro.numeroCentro, cambios)}
                onGuardar={(e) => handleGuardarCentro(e, centro)}
              />
            ))}

          </div>
        </div>

        <VistaPreviaCentrosAtencion centros={centros} />
      </div>
    </div>
  );
};
