import { Clock, MapPin, MessageSquare } from 'lucide-react';
import { centroEstaConfigurado, formatearHorario, type CentroAtencionFormulario } from '../../utils/horarioConsultas';
import { styles } from './horarioConsultas.styles';

export function VistaPreviaCentrosAtencion({ centros }: { centros: CentroAtencionFormulario[] }) {
  return (
    <div className="consultas-card-preview" style={styles.cardPreview}>
      <h4 style={styles.cardTitle}>Ficha Pública de Atención</h4>
      <span style={styles.previewTag}>Vista de tu cohorte</span>

      <div style={styles.previewBody}>
        {centros.filter(centroEstaConfigurado).map((centro) => (
          <div key={centro.numeroCentro} style={styles.previewCenter}>
            <h5 style={styles.centerTitle}>Centro de atención {centro.numeroCentro}</h5>
            <div className="consultas-preview-item" style={styles.previewItem}>
              <div style={styles.previewIconBox}><Clock size={20} color="#0284c7" /></div>
              <div>
                <strong style={styles.previewItemTitle}>Horario de consultas</strong>
                <p style={styles.previewItemValue}>{formatearHorario(centro)}</p>
              </div>
            </div>
            {centro.modalidad === 'presencial' && (
              <div className="consultas-preview-item" style={styles.previewItem}>
                <div style={styles.previewIconBox}><MapPin size={20} color="#059669" /></div>
                <div>
                  <strong style={styles.previewItemTitle}>Ubicación presencial</strong>
                  <p style={styles.previewItemValue}>{centro.oficina ? 'Sala ' + centro.oficina : 'Pendiente de definición'}</p>
                </div>
              </div>
            )}
            {centro.modalidad === 'online' && (
              <div className="consultas-preview-item" style={styles.previewItem}>
                <div style={styles.previewIconBox}><MessageSquare size={20} color="#d97706" /></div>
                <div>
                  <strong style={styles.previewItemTitle}>Atención online</strong>
                  <p style={styles.previewItemValue}>{centro.canalContacto || 'Discord o Meet'}</p>
                  {centro.urlContacto && <p style={styles.previewItemValue}>{centro.urlContacto}</p>}
                </div>
              </div>
            )}
          </div>
        ))}
        {centros.every((centro) => !centroEstaConfigurado(centro)) && (
          <p style={styles.previewItemValue}>Aún no hay centros de atención configurados.</p>
        )}
      </div>
    </div>
  );
}
