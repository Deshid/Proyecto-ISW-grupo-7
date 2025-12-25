import '@styles/comisiones.css';
import MiniHeader from '@components/MiniHeader';
import { asignarEstudiantesAProfesor, getProfesores, getEstudiantes, getHorariosPorProfesor } from '@services/comision.service.js';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';
import { useEffect, useState } from 'react';

const Profesores = () => {
  const [profesores, setProfesores] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showHorariosModal, setShowHorariosModal] = useState(false);
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState({ profesorId: '', estudiantes: [] });
  const [profesorSeleccionado, setProfesorSeleccionado] = useState(null);
  const [horariosProfesor, setHorariosProfesor] = useState([]);

  const formatHora = (hora) => {
    if (!hora) return '';
    // Formato HH:MM
    if (hora.length === 5 && hora.includes(':')) return hora;
    // Si tiene HH:MM:SS, obtener solo HH:MM
    return hora.substring(0, 5);
  };

  useEffect(() => {
    const fetchProfesores = async () => {
      const data = await getProfesores();
      setProfesores(data);
    };
    const fetchEstudiantes = async () => {
      const data = await getEstudiantes();
      setEstudiantes(data);
    };
    fetchProfesores();
    fetchEstudiantes();
  }, []);

  const handleOpenModal = (profesor) => {
    setProfesorSeleccionado(profesor);
    setEstudiantesSeleccionados({ profesorId: profesor.id, estudiantes: [] });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setProfesorSeleccionado(null);
    setEstudiantesSeleccionados({ profesorId: '', estudiantes: [] });
  };

  const recargarProfesores = async () => {
    const data = await getProfesores();
    setProfesores(data);
  };

  const handleOpenHorariosModal = async (profesor) => {
    setProfesorSeleccionado(profesor);
    try {
      const horarios = await getHorariosPorProfesor(profesor.id);
      setHorariosProfesor(horarios);
    } catch {
      showErrorAlert('Error', 'No se pudieron obtener los horarios');
    }
    setShowHorariosModal(true);
  };

  const handleCloseHorariosModal = () => {
    setShowHorariosModal(false);
    setProfesorSeleccionado(null);
    setHorariosProfesor([]);
  };

  return (
    <div className="comisiones">
      <MiniHeader icon="person" title="Profesores" subtitle="Asigna estudiantes a los evaluadores" />

      {/* Lista de profesores */}
      <section className="card card-stone">
        <h2 className="titulo-seccion">
          <span className="material-symbols-outlined page-icon">badge</span>
          Listado de profesores
        </h2>
        
        <div className="overflow-x-auto">
          {profesores.length > 0 ? (
            <table className="tabla tabla-comisiones">
              <thead>
                <tr>
                  <th>Profesor</th>
                  <th>Estudiantes</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {profesores.map((profesor) => (
                  <tr key={profesor.id}>
                    <td style={{ fontWeight: '500' }}>{profesor.nombreCompleto}</td>
                    <td>
                      <span className="badge badge-amber">
                        {profesor.estudiantesAsignados ? profesor.estudiantesAsignados.length : 0} estudiantes
                      </span>
                    </td>
                    <td className="celda-acciones">
                      <button
                        className="btn btn-outline-amber"
                        onClick={() => handleOpenModal(profesor)}
                        title="Asignar estudiantes a este profesor"
                      >
                        <span className="material-symbols-outlined">group_add</span>
                        Asignar
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleOpenHorariosModal(profesor)}
                        title="Ver horarios asignados"
                      >
                        <span className="material-symbols-outlined">schedule</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ marginTop: '20px', color: '#999', textAlign: 'center' }}>
              No hay profesores disponibles.
            </p>
          )}
        </div>
      </section>

      {/* Modal para asignar estudiantes */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
            <span className="material-symbols-outlined page-icon">group_add</span>
              <h3>Asignar Estudiantes</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-subtitle">
                Selecciona estudiantes para <span className="profesor-name">{profesorSeleccionado?.nombreCompleto}</span>
              </p>
              
              <div className="scroll-box modal-scroll">
                {estudiantes.map((est) => (
                  <label key={est.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={estudiantesSeleccionados.estudiantes.includes(est.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEstudiantesSeleccionados(prev => ({
                            ...prev,
                            estudiantes: [...prev.estudiantes, est.id]
                          }));
                        } else {
                          setEstudiantesSeleccionados(prev => ({
                            ...prev,
                            estudiantes: prev.estudiantes.filter(id => id !== est.id)
                          }));
                        }
                      }}
                      className="checkbox-input"
                    />
                    <span className="checkbox-text">{est.nombreCompleto} - {est.email}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-primary btn-cancel"
                onClick={handleCloseModal}
              >
                Cancelar
              </button>
              <button
                className="btn btn-outline-amber"
                onClick={async () => {
                  if (estudiantesSeleccionados.estudiantes.length === 0) {
                    showErrorAlert('Error', 'Debes seleccionar al menos un estudiante');
                    return;
                  }

                  const res = await asignarEstudiantesAProfesor(
                    Number(estudiantesSeleccionados.profesorId),
                    estudiantesSeleccionados.estudiantes
                  );
                  if (res && res.status && res.status.toLowerCase() === 'success') {
                    showSuccessAlert('Estudiantes asignados', res.message || 'Asignación exitosa');
                    await recargarProfesores();
                    handleCloseModal();
                  } else {
                    showErrorAlert('Error', res.message || 'No se pudo asignar los estudiantes');
                  }
                }}
              >
                <span className="material-symbols-outlined">check</span>
                Confirmar ({estudiantesSeleccionados.estudiantes.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver horarios asignados */}
      {showHorariosModal && (
        <div className="modal-overlay" onClick={handleCloseHorariosModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="material-symbols-outlined page-icon">schedule</span>
              <h3>Horarios Asignados</h3>
              <button className="modal-close" onClick={handleCloseHorariosModal} aria-label="Cerrar">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-subtitle">
                Horarios de <span className="profesor-name">{profesorSeleccionado?.nombreCompleto}</span>
              </p>
              
              {horariosProfesor && horariosProfesor.length > 0 ? (
                <div className="scroll-box modal-scroll">
                  <table className="tabla tabla-comisiones" style={{ fontSize: '14px' }}>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Inicio</th>
                        <th>Fin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {horariosProfesor.map((horario, idx) => (
                        <tr key={idx}>
                          <td>{horario.fecha}</td>
                          <td>{formatHora(horario.horaInicio)}</td>
                          <td>{formatHora(horario.horaFin)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                  No hay horarios asignados a este profesor.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profesores;
