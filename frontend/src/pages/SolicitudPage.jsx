import { useState, useEffect } from 'react';
import { createSolicitud, getSolicitudesAlumno } from '@services/solicitud.service.js';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import '@styles/form.css';

const SolicitudPage = () => {
  const [tipo, setTipo] = useState('revision');
  const [notasText, setNotasText] = useState('');
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
        // nota= notasText.split(',').map(n => n.trim()).filter(Boolean);
        formData.append('notas', JSON.stringify(notas));
        formData.append('modalidad', modalidad);
      } else {
        formData.append('descripcion', descripcion);
        if (evidencia) formData.append('evidencia', evidencia);
      }

      await createSolicitud(formData);
      showSuccessAlert('Solicitud enviada', 'Su solicitud fue enviada correctamente');
      // reset
      setNotasText('');
      setDescripcion('');
      setEvidencia(null);
      fetchMisSolicitudes();
    } catch (error) {
      console.error(error);
      showErrorAlert('Error', error?.response?.data?.message || 'Error al enviar la solicitud');
    }
  };

  return (
    <div className="table-container" style={{ marginTop: '80px' }}>
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
              Notas (ingrese identificadores separados por coma):
              <input type="text" value={notasText} onChange={(e) => setNotasText(e.target.value)} />
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

        <button type="submit">Enviar solicitud</button>
      </form>

      <section>
        <h3>Mis solicitudes</h3>
        {misSolicitudes && misSolicitudes.length > 0 ? (
          <ul>
            {misSolicitudes.map(s => (
              <li key={s.id}>
                <strong>{s.tipo}</strong> - Estado: {s.estado}
                {s.justificacionProfesor && (<div>Justificación: {s.justificacionProfesor}</div>)}
                {s.evidenciaPath && (<div><a href={s.evidenciaPath} target="_blank" rel="noreferrer">Ver evidencia</a></div>)}
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
