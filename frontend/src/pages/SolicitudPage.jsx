import { useState, useEffect } from 'react';
import { createSolicitud, getSolicitudesAlumno, getEvaluacionesEstudiante, getPautas } from '@services/solicitud.service.js';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import '@styles/SolicitudPage.css';

const SolicitudPage = () => {
  // Estado para el formulario
  const [tipo, setTipo] = useState('revision');
  const [selectedEvaluations, setSelectedEvaluations] = useState([]);
  const [modalidad, setModalidad] = useState('presencial');
  const [descripcion, setDescripcion] = useState('');
  const [evidencia, setEvidencia] = useState(null);
  const [misSolicitudes, setMisSolicitudes] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [pautas, setPautas] = useState([]);
  const [showPautas, setShowPautas] = useState(false);

  useEffect(() => {
    // Cargar solicitudes, evaluaciones y pautas al montar el componente
    const fetchData = async () => {
      try {
        const [solicitudesRes, evaluacionesRes, pautasRes] = await Promise.all([
          getSolicitudesAlumno(),
          getEvaluacionesEstudiante(),
          getPautas()
        ]);
        setMisSolicitudes(solicitudesRes.data || []);
        setEvaluaciones(evaluacionesRes.data || []);
        setPautas(pautasRes.data || []);
      } catch (error) {
        showErrorAlert('Error al cargar datos', error.message);
      }
    };
    fetchData();
  }, []);

  // Manejar selección de evaluaciones
  const handleEvaluationSelect = (id) => {
    if (isEvaluacionEnSolicitud(id)) return; // No permitir seleccionar si ya tiene solicitud
    if (tipo === 'revision') {
      // Para revisión, múltiples selecciones con checkboxes
      setSelectedEvaluations(prev =>
        prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
      );
    } else {
      // Para recuperación, solo una selección con radio
      setSelectedEvaluations([id]);
    }
  };

  // Enviar formulario
  const onSubmit = async (e) => {
    e.preventDefault();
    if (selectedEvaluations.length === 0) {
      return showErrorAlert('Error', 'Debes seleccionar al menos una evaluación');
    }
    // Verificar que ninguna evaluación seleccionada ya tenga solicitud
    const yaEnSolicitud = selectedEvaluations.some(id => isEvaluacionEnSolicitud(id));
    if (yaEnSolicitud) {
      return showErrorAlert('Error', 'No puedes enviar solicitudes para evaluaciones que ya tienen solicitudes previas');
    }
    if (tipo === 'recuperacion' && !evidencia) {
      return showErrorAlert('Error', 'Para recuperación debes subir evidencia');
    }

    const formData = new FormData();
    formData.append('tipo', tipo);
    formData.append('notas', JSON.stringify(selectedEvaluations));
    formData.append('modalidad', modalidad);
    formData.append('descripcion', descripcion);
    if (evidencia) formData.append('evidencia', evidencia);

    try {
      await createSolicitud(formData);
      showSuccessAlert('Solicitud enviada', 'Su solicitud fue enviada correctamente');
      // Limpiar formulario
      setSelectedEvaluations([]);
      setDescripcion('');
      setEvidencia(null);
      // Recargar solicitudes
      const solicitudesRes = await getSolicitudesAlumno();
      setMisSolicitudes(solicitudesRes.data || []);
    } catch (error) {
      showErrorAlert('Error', error?.response?.data?.message || 'Error al enviar la solicitud');
    }
  };

  // Filtrar evaluaciones para revisión (solo las que asistió)
  const evaluacionesParaRevision = evaluaciones.filter(evaluacion => evaluacion.asiste);

  // Filtrar evaluaciones para recuperación (no asistió y no repetido)
  const evaluacionesParaRecuperacion = evaluaciones.filter(evaluacion => !evaluacion.asiste && !evaluacion.repiticion);

  // Función para verificar si una evaluación ya está en alguna solicitud
  const isEvaluacionEnSolicitud = (evaluacionId) => {
    return misSolicitudes.some(solicitud => 
      solicitud.notas && solicitud.notas.some(nota => Number(nota) === evaluacionId)
    );
  };

  return (
    <div className="solicitud-container">
      <h2>Solicitar Revisión/Recuperación</h2>

      <form onSubmit={onSubmit} className="solicitud-form">
        <label>
          Tipo:
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="revision">Revisión</option>
            <option value="recuperacion">Recuperación</option>
          </select>
        </label>

        <div>
          <h3>Seleccionar Evaluaciones</h3>
          {tipo === 'revision' ? (
            // Mostrar evaluaciones donde asistió con checkboxes para múltiples selecciones
            evaluacionesParaRevision.map(evaluacion => (
              <div key={evaluacion.id}>
                <input
                  type="checkbox"
                  id={`eval-${evaluacion.id}`}
                  checked={selectedEvaluations.includes(evaluacion.id)}
                  onChange={() => handleEvaluationSelect(evaluacion.id)}
                  disabled={isEvaluacionEnSolicitud(evaluacion.id)}
                />
                <label htmlFor={`eval-${evaluacion.id}`}>
                  {evaluacion.pauta?.nombre_pauta} - Nota: {evaluacion.nota} - Asistió: {evaluacion.asiste ? 'Sí' : 'No'}
                  {isEvaluacionEnSolicitud(evaluacion.id) && ' (Ya tiene solicitud)'}
                </label>
              </div>
            ))
          ) : (
            // Mostrar evaluaciones filtradas con radio para una sola selección
            evaluacionesParaRecuperacion.map(evaluacion => (
              <div key={evaluacion.id}>
                <input
                  type="radio"
                  name="recuperacion"
                  id={`eval-${evaluacion.id}`}
                  checked={selectedEvaluations[0] === evaluacion.id}
                  onChange={() => handleEvaluationSelect(evaluacion.id)}
                  disabled={isEvaluacionEnSolicitud(evaluacion.id)}
                />
                <label htmlFor={`eval-${evaluacion.id}`}>
                  {evaluacion.pauta?.nombre_pauta} - Nota: {evaluacion.nota}
                  {isEvaluacionEnSolicitud(evaluacion.id) && ' (Ya tiene solicitud)'}
                </label>
              </div>
            ))
          )}
        </div>

        {tipo === 'revision' && (
          <>
            <button type="button" onClick={() => setShowPautas(!showPautas)}>
              {showPautas ? 'Ocultar Pautas' : 'Mostrar Todas las Pautas'}
            </button>
            {showPautas && (
              <div>
                {pautas.map(pauta => (
                  <div key={pauta.id}>
                    <h4>{pauta.nombre_pauta}</h4>
                    <ul>
                      {pauta.items?.map(item => (
                        <li key={item.id}>{item.descripcion} - Puntaje máximo: {item.puntaje_maximo}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <label>
          Modalidad:
          <select value={modalidad} onChange={(e) => setModalidad(e.target.value)}>
            <option value="presencial">Presencial</option>
            <option value="online">Online</option>
          </select>
        </label>

        <label>
          Descripción:
          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </label>

        {tipo === 'recuperacion' && (
          <label>
            Evidencia (imagen):
            <input type="file" accept="image/*" onChange={(e) => setEvidencia(e.target.files[0])} />
          </label>
        )}

        <button type="submit" className="solicitud-btn">Enviar solicitud</button>
      </form>

      <h3>Mis solicitudes</h3>
      {misSolicitudes.length > 0 ? (
        <ul className="solicitudes-list">
          {misSolicitudes.map(s => (
            <li key={s.id}>
              <strong>{s.tipo}</strong> – Estado: {s.estado}
              {s.descripcion && <div>Descripción: {s.descripcion}</div>}
              {s.justificacionProfesor && <div>Justificación: {s.justificacionProfesor}</div>}
              {s.evidenciaPath && <div><a href={s.evidenciaPath} target="_blank">Ver evidencia</a></div>}
            </li>
          ))}
        </ul>
      ) : (
        <div>No hay solicitudes.</div>
      )}
    </div>
  );
};

export default SolicitudPage;
