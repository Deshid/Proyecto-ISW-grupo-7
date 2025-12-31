import '@styles/comisiones.css';
import MiniHeader from '@components/MiniHeader';
import { asignarEstudiantesAProfesor, getProfesores, getEstudiantes, getHorariosPorProfesor } from '@services/comision.service.js';
import axios from '@services/root.service.js';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';
import { formatFecha } from '@helpers/formatData.js';
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

  const estadoHorario = (horario) => {
    if (!horario) return '';
    if (horario.estado) {
      return horario.estado.charAt(0).toUpperCase() + horario.estado.slice(1);
    }
    try {
      const fin = new Date(`${horario.fecha}T${formatHora(horario.horaFin)}:00`);
      return fin < new Date() ? 'Finalizado' : 'Activo';
    } catch {
      return 'Activo';
    }
  };

  useEffect(() => {
    const fetchProfesores = async () => {
      const data = await getProfesores();
      setProfesores(data);
    };

    const fetchEstudiantes = async () => {
      try {
        const usuario = JSON.parse(sessionStorage.getItem('usuario')) || null;
        if (usuario && usuario.rol === 'profesor') {
          const resp = await axios.get('/user/students');
          const users = resp?.data?.data || [];
          const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });
          setEstudiantes(users.sort((a, b) => collator.compare(a.nombreCompleto || '', b.nombreCompleto || '')));
        } else {
          const data = await getEstudiantes();
          setEstudiantes(data);
        }
      } catch (error) {
        console.error('Error cargando estudiantes:', error);
        setEstudiantes([]);
      }
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

  const handleSorteo = () => {
    try {
      const input = window.prompt('¿Cuántos estudiantes quieres tener seleccionados en total?', '3');
      const nTotal = Number(input);
      if (!nTotal || nTotal < 1) return;

      setEstudiantesSeleccionados((prev) => {
        const yaSeleccionados = new Set(prev.estudiantes);
        // Id disponibles: todos los estudiantes que no estén ya seleccionados
        const idsDisponibles = estudiantes
          .map((e) => e.id)
          .filter((id) => !yaSeleccionados.has(id));

        // Si ya hay suficientes, no hacemos nada
        if (prev.estudiantes.length >= nTotal) {
          return prev;
        }

        const faltan = nTotal - prev.estudiantes.length;
        // Mezclar y tomar los faltantes sin duplicar
        const nuevos = [...idsDisponibles]
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.max(0, Math.min(faltan, idsDisponibles.length)));

        return { ...prev, estudiantes: [...prev.estudiantes, ...nuevos] };
      });
    } catch (err) {
      console.error('Error en sorteo:', err);
    }
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
                {estudiantes.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                    No hay estudiantes disponibles para asignar.
                  </p>
                ) : (
                  estudiantes.map((est) => (
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
                  ))
                )}
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <button
                className="btn btn-outline-amber"
                onClick={handleSorteo}
                title="Seleccionar estudiantes aleatoriamente"
              >
                <span className="material-symbols-outlined">shuffle</span>
                Sorteo
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
          <div className="modal-content horarios-modal" onClick={(e) => e.stopPropagation()}>
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
                        <th>Lugar</th>
                        <th>Modalidad</th>
                        <th>Fecha</th>
                        <th>Inicio</th>
                        <th>Fin</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {horariosProfesor.map((horario, idx) => (
                        <tr key={idx}>
                          <td>{horario.lugar?.nombre || '—'}</td>
                          <td>{horario.modalidad ? horario.modalidad.charAt(0).toUpperCase() + horario.modalidad.slice(1) : '—'}</td>
                          <td>{formatFecha(horario.fecha)}</td>
                          <td>{formatHora(horario.horaInicio)}</td>
                          <td>{formatHora(horario.horaFin)}</td>
                          <td>{estadoHorario(horario)}</td>
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
