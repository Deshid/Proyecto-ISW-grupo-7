import { useState, useEffect } from 'react';
import { getSolicitudesProfesor, updateSolicitudEstado } from '@services/solicitud.service.js';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';
import '@styles/table.css';

const SolicitudesProfesor = () => {
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    try {
      const res = await getSolicitudesProfesor();
      if (res && res.data) setSolicitudes(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const decide = async (id, decision) => {
  try {
    const justificacion = prompt("Opcional: ingrese una justificación para el alumno (dejar vacío si no aplica)");

    // Si el usuario presiona "Cancelar", no hacemos nada
    if (justificacion === null) {
      return;
    }

    // Construimos el payload solo con los campos necesarios
    const payload = { estado: decision };
    if (justificacion.trim() !== '') {
      payload.justificacionProfesor = justificacion.trim();
    }

    await updateSolicitudEstado(id, payload);
    showSuccessAlert('Hecho', 'Se actualizó el estado de la solicitud');
    fetchSolicitudes();
  } catch (error) {
    console.error(error);
    showErrorAlert('Error', error?.response?.data?.message || 'Error al actualizar la solicitud');
  }
};


  return (
    <div className="table-container">
      <h2>Solicitudes Revisión/Recuperación</h2>
      {solicitudes && solicitudes.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Alumno</th>
              <th>Tipo</th>
              <th>Notas</th>
              <th>Descripción</th>
              <th>Evidencia</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map(s => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.alumno?.nombre || s.alumno?.email}</td>
                <td>{s.tipo}</td>
                <td>{s.notas ? s.notas.join(', ') : '-'}</td>
                <td>{s.descripcion || '-'}</td>
                <td>{s.evidenciaPath ? <a href={s.evidenciaPath} target="_blank" rel="noreferrer">Ver</a> : '-'}</td>
                <td>{s.estado}</td>
                <td>
                  {s.estado === 'pendiente' && (
                    <>
                      <button onClick={() => decide(s.id, 'aprobada')}>Aprobar</button>
                      <button onClick={() => decide(s.id, 'rechazada')}>Rechazar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No hay solicitudes</div>
      )}
    </div>
  );
};

export default SolicitudesProfesor;
