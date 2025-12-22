import { useState, useEffect } from 'react';
import { getSolicitudesProfesor, updateSolicitudEstado } from '@services/solicitud.service.js';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';
import '@styles/SolicitudesProfesor.css';

const SolicitudesProfesor = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [filtro, setFiltro] = useState("todos");


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
      await updateSolicitudEstado(id, { estado: decision, justificacionProfesor: justificacion });
      showSuccessAlert('Hecho', 'Se actualizó el estado de la solicitud');
      fetchSolicitudes();
    } catch (error) {
      console.error(error);
      showErrorAlert('Error', error?.response?.data?.message || 'Error al actualizar la solicitud');
    }
  };

  const solicitudesFiltradas = solicitudes.filter(s => {
  if (filtro === "todos") return true;
  return s.tipo?.toLowerCase() === filtro;
  });


  return (
   <div className="table-container solicitudes-profesor" style={{ marginTop: '30px' }}>
      <div className="page-header">
       <h1 className="titulo"><span className="material-symbols-outlined page-icon">balance</span>Solicitudes</h1>
       <p className="subtitulo">Control de solicitudes académicas: revisión y recuperación</p>
      </div>
      <div className="filtros-container">
        <button className={filtro === "todos" ? "filtro-activo" : ""} onClick={() => setFiltro("todos")}>
        Todos
        </button>

        <button className={filtro === "revision" ? "filtro-activo" : ""} onClick={() => setFiltro("revision")}>
         Revisión
        </button>

        <button className={filtro === "recuperacion" ? "filtro-activo" : ""} onClick={() => setFiltro("recuperacion")}>
        Recuperación
        </button>
      </div>

      {solicitudes && solicitudes.length > 0 ? (
        <table>
          <thead>
            <tr>
              {/*<th>ID</th>*/}
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
            {solicitudesFiltradas.map(s => (
              <tr key={s.id}>
               {/*<td>{s.id}</td>*/}
                <td>{s.alumno?.nombreCompleto || s.alumno?.email}</td>
                <td>{s.tipo}</td>
                <td>{s.notas ? s.notas.join(', ') : '-'}</td>
                <td>{s.descripcion || '-'}</td>
                <td>{s.evidenciaPath ? <a href={s.evidenciaPath} target="_blank" rel="norefeCompletorrer">Ver</a> : '-'}</td>
                <td>{s.estado}</td>
                <td>
                  {s.estado === 'pendiente' && (
                    <>
                      <button className="btn-azul" onClick={() => decide(s.id, 'aprobada')}>Aprobar</button>
                      <button className="btn-rojo" onClick={() => decide(s.id, 'rechazada')}>Rechazar</button>

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
