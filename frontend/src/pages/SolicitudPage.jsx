import { useState, useEffect } from 'react';
import { createSolicitud, getSolicitudesAlumno } from '@services/solicitud.service.js';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import '@styles/SolicitudPage.css';

const SolicitudPage = () => {
  const [tipo, setTipo] = useState('revision');
  const [evaluacion, setEvaluacion] = useState('');
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
      if (tipo === 'revision') {
        if (!evaluacion.trim()) return showErrorAlert('Error', 'Debes indicar la evaluación a revisar');
      } else {
        if (!descripcion.trim()) return showErrorAlert('Error', 'Debes describir el caso de recuperación');
        if (!evidencia) return showErrorAlert('Error', 'Debes subir una evidencia');
      }

      const formData = new FormData();
      formData.append('tipo', tipo);
      formData.append('modalidad', modalidad);

      if (tipo === 'revision') {
        formData.append('descripcion', evaluacion);
      } else {
        formData.append('descripcion', descripcion);
        if (evidencia) formData.append('evidencia', evidencia);
      }

      await createSolicitud(formData);
      showSuccessAlert('Solicitud enviada', 'Su solicitud fue enviada correctamente');

      setEvaluacion('');
      setDescripcion('');
      setEvidencia(null);
      fetchMisSolicitudes();
    } catch (error) {
      showErrorAlert('Error', error?.response?.data?.message || 'Error al enviar la solicitud');
    }
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

        {tipo === 'revision' && (
          <>
            <label>
              Evaluación a revisar:
              <input
                type="text"
                value={evaluacion}
                onChange={(e) => setEvaluacion(e.target.value)}
                placeholder="Ej: Evaluación 1"
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
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </label>

            <label>
              Evidencia (imagen):
              <input type="file" accept="image/*" onChange={(e) => setEvidencia(e.target.files[0])} />
            </label>
          </>
        )}

        <button type="submit" className="solicitud-btn">Enviar solicitud</button>
      </form>

      <h3>Mis solicitudes</h3>
      {misSolicitudes.length > 0 ? (
        <ul className="solicitudes-list">
          {misSolicitudes.map(s => (
            <li key={s.id}>
              <strong>{s.tipo}</strong> – Estado: {s.estado}
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
