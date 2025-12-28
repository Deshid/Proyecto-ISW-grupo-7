import '@styles/comisiones.css';
import MiniHeader from '@components/MiniHeader';
import { getProfesores, getHorariosPorProfesor } from '@services/comision.service.js';
import { formatFecha } from '@helpers/formatData.js';
import { useEffect, useState } from 'react';

const Registros = () => {
  const [profesores, setProfesores] = useState([]);
  const [horariosProfesor, setHorariosProfesor] = useState({});
  const [loading, setLoading] = useState(true);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);
  const [profesorDelHorario, setProfesorDelHorario] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const profesoresData = await getProfesores();
      console.log('Profesores con estudiantes:', profesoresData);
      setProfesores(profesoresData);
      
      // Cargar horarios para cada profesor
      const horariosMap = {};
      for (const profesor of profesoresData) {
        const horarios = await getHorariosPorProfesor(profesor.id);
        horariosMap[profesor.id] = horarios || [];
      }
      setHorariosProfesor(horariosMap);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatHora = (hora) => {
    if (!hora) return '';
    if (hora.length === 5 && hora.includes(':')) return hora;
    return hora.substring(0, 5);
  };

  const esHorarioFinalizado = (horario) => {
    if (horario.estado === 'finalizado') return true;
    
    const ahora = new Date();
    const fechaActual = ahora.toISOString().split('T')[0];
    const horaActual = ahora.toTimeString().split(' ')[0].substring(0, 5);
    
    // Comparar fechas
    if (horario.fecha < fechaActual) return true;
    if (horario.fecha === fechaActual && horario.horaFin <= horaActual) return true;
    
    return false;
  };
  const profesoresConEstudiantes = profesores.map(profesor => ({
    ...profesor,
    estudiantesAsignados: profesor.estudiantes || profesor.estudiantesAsignados || []
  }));

  // Profesores con estudiantes
  if (loading) {
    return (
      <div className="comisiones">
        <MiniHeader icon="school" title="Estudiantes" subtitle="Visualiza el estado de asignación" />
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Cargando datos...
        </div>
      </div>
    );
  }

  return (
    <div className="comisiones">
      <MiniHeader icon="school" title="Registros de Asignaciones" subtitle="Visualiza el estado de asignación" />

      {/* Vista de Profesores con sus Estudiantes */}
        <div className="registros-container">
          <h3 className="registros-subtitle">
            Profesores y sus grupos de estudiantes asignados
          </h3>
          
          {profesoresConEstudiantes.length === 0 ? (
            <p className="empty-message">No hay profesores registrados</p>
          ) : (
            <div className="registros-list">
              {profesoresConEstudiantes.map((profesor) => (
                <div key={profesor.id} className="registro-card">
                  <div className="registro-header">
                    <span className="material-symbols-outlined registro-icon">person</span>
                    <div className="registro-info">
                      <h4>{profesor.nombreCompleto}</h4>
                      <p className="registro-email">{profesor.email}</p>
                      <p className="registro-rut">{profesor.rut}</p>
                    </div>
                    <span className="registro-badge">
                      {profesor.estudiantesAsignados.length} estudiante{profesor.estudiantesAsignados.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {profesor.estudiantesAsignados.length > 0 ? (
                    <div className="registro-estudiantes">
                      <p className="estudiantes-title">Estudiantes asignados:</p>
                      <div className="estudiantes-grid">
                        {profesor.estudiantesAsignados.map((estudiante) => (
                          <div key={estudiante.id} className="estudiante-chip">
                            <span className="material-symbols-outlined chip-icon">school</span>
                            <span className="chip-text">{estudiante.nombreCompleto}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="no-asignaciones">Sin estudiantes asignados</p>
                  )}

                  {horariosProfesor[profesor.id] && horariosProfesor[profesor.id].length > 0 ? (
                    <div className="registro-horarios">
                      <p className="horarios-title">Horarios asignados:</p>
                      <div className="horarios-grid">
                        {horariosProfesor[profesor.id].map((horario, idx) => (
                          <div 
                            key={idx} 
                            className={`horario-chip ${esHorarioFinalizado(horario) ? 'horario-finalizado' : ''}`}
                            onClick={() => {
                              setHorarioSeleccionado(horario);
                              setProfesorDelHorario(profesor);
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <span className="material-symbols-outlined chip-icon">schedule</span>
                            <div className="horario-info">
                              <span className="horario-fecha">{formatFecha(horario.fecha)}</span>
                              <span className="horario-hora">{formatHora(horario.horaInicio)} - {formatHora(horario.horaFin)}</span>
                              {horario.modalidad && <span className="horario-modalidad">{horario.modalidad}</span>}
                              {esHorarioFinalizado(horario) && <span className="horario-estado">Finalizado</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="no-asignaciones">Sin horarios asignados</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Registro del Horario */}
        {horarioSeleccionado && (
          <div className="modal-overlay" onClick={() => setHorarioSeleccionado(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <span className="material-symbols-outlined page-icon">schedule</span>
                <h3>Registro del Horario</h3>
                <button className="modal-close" onClick={() => setHorarioSeleccionado(null)} aria-label="Cerrar">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="modal-body">
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ marginBottom: '8px' }}>
                    <strong style={{ color: '#57534e' }}>Lugar:</strong> <span style={{ color: '#92400e', fontWeight: '500' }}>{horarioSeleccionado.lugar?.nombre || '—'}</span>
                  </p>
                  <p style={{ marginBottom: '8px' }}>
                    <strong style={{ color: '#57534e' }}>Fecha:</strong> <span style={{ color: '#92400e', fontWeight: '500' }}>{formatFecha(horarioSeleccionado.fecha)}</span>
                  </p>
                  <p style={{ marginBottom: '8px' }}>
                    <strong style={{ color: '#57534e' }}>Hora:</strong> <span style={{ color: '#92400e', fontWeight: '500' }}>{formatHora(horarioSeleccionado.horaInicio)} - {formatHora(horarioSeleccionado.horaFin)}</span>
                  </p>
                  <p style={{ marginBottom: '8px' }}>
                    <strong style={{ color: '#57534e' }}>Modalidad:</strong> <span style={{ color: '#92400e', fontWeight: '500' }}>{horarioSeleccionado.modalidad ? horarioSeleccionado.modalidad.charAt(0).toUpperCase() + horarioSeleccionado.modalidad.slice(1) : '—'}</span>
                  </p>
                  <p style={{ marginBottom: '8px' }}>
                    <strong style={{ color: '#57534e' }}>Estado:</strong> <span style={{ color: esHorarioFinalizado(horarioSeleccionado) ? '#57534e' : '#92400e', fontWeight: '500' }}>{esHorarioFinalizado(horarioSeleccionado) ? 'Finalizado' : 'Activo'}</span>
                  </p>
                </div>

                <hr style={{ borderColor: '#e7e5e4', margin: '20px 0' }} />

                <div>
                  <p style={{ marginBottom: '12px', fontWeight: '600', color: '#57534e', fontSize: '15px' }}>
                    <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px', fontSize: '18px' }}>person</span>
                    Profesor Asignado
                  </p>
                  <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px', marginBottom: '20px' }}>
                    <p style={{ margin: '4px 0', fontWeight: '600', color: '#92400e' }}>{profesorDelHorario?.nombreCompleto}</p>
                    <p style={{ margin: '4px 0', fontSize: '13px', color: '#57534e' }}>{profesorDelHorario?.email}</p>
                  </div>
                </div>

                <div>
                  <p style={{ marginBottom: '12px', fontWeight: '600', color: '#57534e', fontSize: '15px' }}>
                    <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px', fontSize: '18px' }}>school</span>
                    Estudiantes Participantes
                  </p>
                  {horarioSeleccionado.estudiantes && horarioSeleccionado.estudiantes.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {horarioSeleccionado.estudiantes.map((est) => (
                        <div key={est.id} style={{ padding: '10px 12px', backgroundColor: '#f5f5f4', borderRadius: '6px', borderLeft: '3px solid #d97706' }}>
                          <p style={{ margin: '0', fontWeight: '500', color: '#57534e' }}>{est.nombreCompleto}</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#78716c' }}>{est.email}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                      {horarioSeleccionado.estado === 'finalizado' 
                        ? 'No hay estudiantes registrados para este horario'
                        : profesorDelHorario?.estudiantesAsignados?.length > 0
                          ? `Los estudiantes actuales del profesor son: ${profesorDelHorario.estudiantesAsignados.map(e => e.nombreCompleto).join(', ')}`
                          : 'No hay estudiantes asignados'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Registros;
