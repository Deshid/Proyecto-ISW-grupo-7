import { useState, useEffect } from 'react';
import { createSolicitud, getSolicitudesAlumno } from '@services/solicitud.service.js';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';
import '@styles/form.css';

const SolicitudPage = () => {
  const [tipo, setTipo] = useState('revision');
  const [evaluacion, setEvaluacion] = useState(''); // reemplaza notasText
  const [modalidad, setModalidad] = useState('presencial');
  const [descripcion, setDescripcion] = useState('');
  const [evidencia, setEvidencia] = useState(null);
  const [misSolicitudes, setMisSolicitudes] = useState([]);

  useEffect(() => {
    fetchMisSolicitudes();
  }, []);

  const fetchMisSolicitudes = async () => {
    try {
      const res = await getSolicitudesAlumno();
      if (res && res.data) setMisSolicitudes(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async (e) => {
  e.preventDefault();
  try {
    const formData = new FormData();
    formData.append('tipo', tipo);

    if (tipo === 'revision') {
      // 👇 Añadimos "notas" para que el backend no falle
      formData.append('notas', JSON.stringify([{ id: 0 }])); 
      formData.append('descripcion', evaluacion);
      formData.append('modalidad', modalidad);
    } else {
      formData.append('descripcion', descripcion);
      if (evidencia) formData.append('evidencia', evidencia);
    }

    await createSolicitud(formData);
    showSuccessAlert('Solicitud enviada', 'Su solicitud fue enviada correctamente');

    // reset
    setEvaluacion('');
    setDescripcion('');
    setEvidencia(null);
    fetchMisSolicitudes();
  } catch (error) {
    console.error(error);
    showErrorAlert('Error', error?.response?.data?.message || 'Error al enviar la solicitud');
  }
};

  return (
    <div className="form-container">
      <h2>Solicitar Revisión/Recuperación</h2>
      <form onSubmit={onSubmit}>
        <label>
          Tipo:
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="revision">Revisión</option>
            <option value="recuperacion">Recuperación</option>
          </select>
        </label>

        {tipo === 'revision' && (
          <>
            <label>
              Evaluación a revisar (Ej: Evaluación 1, Examen Final, etc.):
              <input
                type="text"
                value={evaluacion}
                onChange={(e) => setEvaluacion(e.target.value)}
                placeholder="Ej: Evaluación 1"
                required
              />
            </label>
            <label>
              Modalidad:
              <select value={modalidad} onChange={(e) => setModalidad(e.target.value)}>
                <option value="presencial">Presencial</option>
                <option value="online">Online</option>
              </select>
            </label>
          </>
        )}

        {tipo === 'recuperacion' && (
          <>
            <label>
              Descripción del caso:
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Explique brevemente el motivo de la recuperación"
              />
            </label>
            <label>
              Evidencia (imagen):
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEvidencia(e.target.files[0])}
              />
            </label>
          </>
        )}

        <button type="submit">Enviar solicitud</button>
      </form>

      <section>
        <h3>Mis solicitudes</h3>
        {misSolicitudes && misSolicitudes.length > 0 ? (
          <ul>
            {misSolicitudes.map((s) => (
              <li key={s.id}>
                <strong>{s.tipo}</strong> - Estado: {s.estado}
                {s.evaluacion && <div>Evaluación: {s.evaluacion}</div>}
                {s.justificacionProfesor && (
                  <div>Justificación: {s.justificacionProfesor}</div>
                )}
                {s.evidenciaPath && (
                  <div>
                    <a href={s.evidenciaPath} target="_blank" rel="noreferrer">
                      Ver evidencia
                    </a>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div>No hay solicitudes.</div>
        )}
      </section>
    </div>
  );
};

export default SolicitudPage;
