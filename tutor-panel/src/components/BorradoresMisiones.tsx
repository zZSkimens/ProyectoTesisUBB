import { useEffect, useState, type FormEvent } from 'react';
import { misionesApi, LUGARES_MISION, MODULOS_MISION, type BorradorInput, type BorradorMision } from '../api/misiones.api';

const nuevoBorrador = (): BorradorInput => ({
  titulo: '', objetivo: '', descripcion: '', lugar: 'Biblioteca',
  modulo: 'Descubre la UBB', puntosRecompensa: 100, orden: 1,
});

export function BorradoresMisiones({ onPublicada }: { onPublicada: () => void }) {
  const [borradores, setBorradores] = useState<BorradorMision[]>([]);
  const [formulario, setFormulario] = useState<BorradorInput | null>(null);
  const [editandoId, setEditandoId] = useState<number>();
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [borradorPublicacion, setBorradorPublicacion] = useState<BorradorMision | null>(null);
  const [condicionCumplimiento, setCondicionCumplimiento] = useState('');
  const [publicando, setPublicando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const accionesBloqueadas = cargando || guardando || publicando || formulario !== null || borradorPublicacion !== null;

  async function cargar() {
    setCargando(true);
    setError('');
    try { setBorradores((await misionesApi.listar()).misiones); }
    catch (err) { setError(err instanceof Error ? err.message : 'No se pudieron cargar los borradores'); }
    finally { setCargando(false); }
  }
  useEffect(() => {
    let vigente = true;
    misionesApi.listar()
      .then(({ misiones }) => { if (vigente) setBorradores(misiones); })
      .catch((err: unknown) => { if (vigente) setError(err instanceof Error ? err.message : 'No se pudieron cargar los borradores'); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, []);

  function editar(borrador?: BorradorMision) {
    setEditandoId(borrador?.id);
    setFormulario(borrador ? { ...borrador } : nuevoBorrador());
    setError(''); setExito('');
  }
  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formulario || guardando) return;
    setGuardando(true); setError(''); setExito('');
    try {
      const { mision } = await misionesApi.guardar(formulario, editandoId);
      setBorradores((anteriores) => [mision, ...anteriores.filter((b) => b.id !== mision.id)]);
      setFormulario(null); setEditandoId(undefined);
      setExito('Borrador guardado. No modifica el avance de los estudiantes.');
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo guardar el borrador'); }
    finally { setGuardando(false); }
  }

  function prepararPublicacion(borrador: BorradorMision) {
    setExito('');
    setError('');
    if (!borrador.objetivo.trim() || !borrador.descripcion.trim()) {
      editar(borrador);
      setError('Completa el objetivo y la descripción, guarda el borrador y vuelve a publicarlo.');
      return;
    }
    setCondicionCumplimiento('');
    setBorradorPublicacion(borrador);
  }

  async function publicar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!borradorPublicacion || publicando || !condicionCumplimiento.trim()) return;
    const id = borradorPublicacion.id;
    setPublicando(true);
    setError('');
    try {
      await misionesApi.publicar(id, condicionCumplimiento.trim());
      setBorradores((anteriores) => anteriores.filter((borrador) => borrador.id !== id));
      setBorradorPublicacion(null);
      setExito('Misión publicada para tu grupo. Ahora aparece entre las actividades activas.');
      onPublicada();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo publicar la misión');
    } finally {
      setPublicando(false);
    }
  }

  return <section className="mission-drafts" aria-labelledby="borradores-titulo">
    <div className="mission-drafts-heading">
      <div>
        <h3 id="borradores-titulo">Preparación de misiones</h3>
        <p>Prepara tus misiones como borradores y publícalas para tu grupo cuando estén listas.</p>
      </div>
      <button className="btn-primary" type="button" disabled={accionesBloqueadas} onClick={() => editar()}>Crear misión</button>
    </div>
    {error && <div role="alert" className="mission-message-error">{error} {!formulario && <button type="button" className="btn-secondary" onClick={() => void cargar()}>Reintentar</button>}</div>}
    {exito && <p role="status" className="mission-message-success">{exito}</p>}
    {formulario && <form onSubmit={guardar} className="mission-form">
      <h4>{editandoId === undefined ? 'Nueva misión' : 'Editar misión'} · Borrador</h4>
      <fieldset disabled={guardando}>
        <div className="mission-form-grid">
          <label>Título *<input required minLength={3} maxLength={150} value={formulario.titulo} onChange={(e) => setFormulario({ ...formulario, titulo: e.target.value })} /></label>
          <label>Lugar *<select value={formulario.lugar} onChange={(e) => setFormulario({ ...formulario, lugar: e.target.value as BorradorInput['lugar'] })}>{LUGARES_MISION.map((lugar) => <option key={lugar}>{lugar}</option>)}</select></label>
          <label>Módulo *<select required value={formulario.modulo} onChange={(e) => setFormulario({ ...formulario, modulo: e.target.value })}>
            {!MODULOS_MISION.includes(formulario.modulo as typeof MODULOS_MISION[number]) && <option value="">Selecciona un módulo</option>}
            {MODULOS_MISION.map((modulo) => <option key={modulo}>{modulo}</option>)}
          </select></label>
          <label>Puntos de recompensa (100–200)<input required type="number" min={100} max={200} step={1} value={formulario.puntosRecompensa} onChange={(e) => setFormulario({ ...formulario, puntosRecompensa: e.target.valueAsNumber })} /></label>
          <label>Orden<input required type="number" min={1} max={10000} step={1} value={formulario.orden} onChange={(e) => setFormulario({ ...formulario, orden: e.target.valueAsNumber })} /></label>
        </div>
        <label>Objetivo<textarea maxLength={2000} rows={2} placeholder="Indica qué aprenderá o logrará el estudiante al completar la misión." value={formulario.objetivo} onChange={(e) => setFormulario({ ...formulario, objetivo: e.target.value })} /></label>
        <label>Descripción e instrucciones preliminares<textarea maxLength={5000} rows={3} placeholder="Describe la actividad y los pasos que deberá seguir el estudiante." value={formulario.descripcion} onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })} /></label>
        <p>Selecciona el módulo, el lugar y una recompensa de 100 a 200 puntos. Puedes completar el objetivo y las instrucciones antes de publicar.</p>
        <div className="mission-form-actions">
          <button type="button" className="btn-secondary" onClick={() => { setFormulario(null); setError(''); }}>Cancelar</button>
          <button type="submit" className="btn-primary">{guardando ? 'Guardando…' : 'Guardar borrador'}</button>
        </div>
      </fieldset>
    </form>}
    {borradorPublicacion && <form onSubmit={publicar} className="mission-form">
      <h4>Publicar «{borradorPublicacion.titulo}»</h4>
      <fieldset disabled={publicando}>
        <label>
          Condición de cumplimiento *
          <textarea
            required
            maxLength={2000}
            rows={3}
            placeholder="Indica qué debe hacer el estudiante para completar la misión."
            value={condicionCumplimiento}
            onChange={(event) => setCondicionCumplimiento(event.target.value)}
          />
        </label>
        <p>La misión se asignará a tu grupo y empezará a contar para el avance de tus estudiantes.</p>
        <div className="mission-form-actions">
          <button type="button" className="btn-secondary" onClick={() => { setBorradorPublicacion(null); setError(''); }}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={!condicionCumplimiento.trim()}>
            {publicando ? 'Publicando…' : 'Confirmar publicación'}
          </button>
        </div>
      </fieldset>
    </form>}
    {cargando ? <p role="status">Cargando borradores…</p> : <>
      {!borradores.length && <p>Aún no tienes misiones en borrador.</p>}
      <div className="mission-drafts-grid">{borradores.map((borrador) => <article key={borrador.id} className="mission-draft-card">
        <span className="mission-draft-badge">Borrador · {borrador.lugar}</span>
        <h4>{borrador.titulo}</h4>
        <p>{borrador.objetivo || 'Objetivo pendiente de definir'}</p>
        <p>{borrador.modulo || 'Módulo pendiente'} · {borrador.puntosRecompensa} puntos · Orden {borrador.orden}</p>
        <small>Acción pendiente · Sin asignar</small>
        <div className="mission-form-actions">
          <button type="button" className="btn-secondary" disabled={accionesBloqueadas} onClick={() => editar(borrador)}>Editar borrador</button>
          <button type="button" className="btn-primary" disabled={accionesBloqueadas} onClick={() => prepararPublicacion(borrador)}>Publicar para mi grupo</button>
        </div>
      </article>)}</div>
    </>}
  </section>;
}
