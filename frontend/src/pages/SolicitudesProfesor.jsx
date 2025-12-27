import { useState, useEffect } from 'react';
import { getSolicitudesProfesor, updateSolicitudEstado } from '@services/solicitud.service.js';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';
import '@styles/SolicitudesProfesor.css';

const SolicitudesProfesor = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSolicitudId, setCurrentSolicitudId] = useState(null);
  const [decision, setDecision] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const maxJustificacionLength = 200;

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : str;


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

  const openDecisionModal = (id, decisionType) => {
    setCurrentSolicitudId(id);
    setDecision(decisionType);
    setJustificacion('');
    setModalOpen(true);
  };

  const handleDecisionSubmit = async () => {
    try {
      await updateSolicitudEstado(currentSolicitudId, { estado: decision, justificacionProfesor: justificacion });
      showSuccessAlert('Hecho', 'Se actualizó el estado de la solicitud');
      setModalOpen(false);
      fetchSolicitudes();
    } catch (error) {
      console.error(error);
      showErrorAlert('Error', error?.response?.data?.message || 'Error al actualizar la solicitud');
    }
  };

  const solicitudesFiltradas = solicitudes.filter(s => {
    if (filtro === "todos") return true;
    if (filtro === "pendiente") return s.estado?.toLowerCase() === "pendiente";
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
          <span className="material-symbols-outlined">list</span>
          Todos
        </button>

        <button className={filtro === "revision" ? "filtro-activo" : ""} onClick={() => setFiltro("revision")}>
          <span className="material-symbols-outlined">search</span>
          Revisión
        </button>

        <button className={filtro === "recuperacion" ? "filtro-activo" : ""} onClick={() => setFiltro("recuperacion")}>
          <span className="material-symbols-outlined">refresh</span>
          Recuperación
        </button>
        <button className={filtro === "pendiente" ? "filtro-activo" : ""} onClick={() => setFiltro("pendiente")}>
          <span className="material-symbols-outlined">schedule</span>
          Pendiente
        </button>
      </div>

      {solicitudes && solicitudes.length > 0 ? (
        <table>
          <thead>
            <tr>
              {/*<th>ID</th>*/}
              <th>Alumno</th>
              <th>Tipo</th>
              <th>Modalidad</th>
              <th>Notas</th>
              <th>Descripción</th>
              <th>Evidencia</th>
              <th>Estado</th>
              <th>Decisión</th>
            </tr>
          </thead>
          <tbody>
            {solicitudesFiltradas.map(s => (
              <tr key={s.id}>
               {/*<td>{s.id}</td>*/}
                <td>{s.alumno?.nombreCompleto || s.alumno?.email}</td>
                <td>{capitalize(s.tipo)}</td>
                <td>{capitalize(s.modalidad) || '-'}</td>
                <td>{s.evaluaciones && s.evaluaciones.length > 0 ? s.evaluaciones.map(e => `${e.pauta?.nombre_pauta || 'Sin nombre'}: ${e.nota}`).join(', ') : '-'}</td>
                <td>{s.descripcion || '-'}</td>
                <td>{s.evidenciaPath ? <a href={s.evidenciaPath} target="_blank" rel="norefeCompletorrer">Ver</a> : '-'}</td>
                <td>{capitalize(s.estado)}</td>
                <td className="decision-cell">
                  {s.estado === 'pendiente' ? (
                    <>
                      <button className="btn-azul" onClick={() => openDecisionModal(s.id, 'aprobada')}>
                        Aprobar
                      </button>
                      <button className="btn-rojo" onClick={() => openDecisionModal(s.id, 'rechazada')}>
                        Rechazar
                      </button>
                    </>
                  ) : (
                    s.justificacionProfesor || '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No hay solicitudes</div>
      )}

      {/* Modal para justificación */}
      {modalOpen && (
        <div className="modal-overlay">
    <div className="modal-content-alone">
      <h3>
        Justificación para {decision === 'aprobada' ? 'aprobación' : 'rechazo'}
      </h3>

      <p>
        Opcional: ingrese una justificación para el alumno (dejar vacío si no aplica)
      </p>

      <textarea
        value={justificacion}
        onChange={(e) => setJustificacion(e.target.value)}
        maxLength={maxJustificacionLength}
        placeholder="Escribe aquí la justificación..."
        rows={6}
      />

      <div className="char-counter">
        {justificacion.length}/{maxJustificacionLength} caracteres
      </div>

      <div className="modal-buttons">
        <button className="btn-rojo" onClick={() => setModalOpen(false)}>
          <span className="material-symbols-outlined">close</span>
          Cancelar
        </button>
        <button className="btn-azul" onClick={handleDecisionSubmit}>
          <span className="material-symbols-outlined">check</span>
          Confirmar {decision === 'aprobada' ? 'Aprobación' : 'Rechazo'}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default SolicitudesProfesor;
