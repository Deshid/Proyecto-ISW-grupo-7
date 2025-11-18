import Form from '@components/Form';
import '@styles/users.css';
import { createHorario, getLugares, getHorariosPorLugar, asignarProfesorAHorario, asignarEstudiantesAProfesor, getProfesores, getEstudiantes, actualizarHorario, eliminarHorario } from '@services/comision.service.js';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';
import { useEffect, useState } from 'react';

const Comisiones = () => {
  const [lugares, setLugares] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [lugarSeleccionado, setLugarSeleccionado] = useState('');
  const [profesores, setProfesores] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState('');
  const [horarioEditando, setHorarioEditando] = useState(null);
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState({ profesorId: '', estudiantes: [] });

  useEffect(() => {
    const fetchLugares = async () => {
      const data = await getLugares();
      setLugares(data);
    };
    const fetchProfesores = async () => {
      const data = await getProfesores();
      setProfesores(data);
    };
    const fetchEstudiantes = async () => {
      const data = await getEstudiantes();
      setEstudiantes(data);
    };
    fetchLugares();
    fetchProfesores();
    fetchEstudiantes();
  }, []);

  const handleLugarChange = async (id_lugar) => {
    setLugarSeleccionado(id_lugar);
    if (id_lugar) {
      const data = await getHorariosPorLugar(id_lugar);
      setHorarios(data);
    } else {
      setHorarios([]);
    }
  };

  const lugarActual = lugares.find((l) => l.id_lugar === Number(lugarSeleccionado));

  return (
    <div className="page-container" style={{ padding: '40px 20px 20px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Gestión de Comisiones</h1>
      
      {/* Dos columnas */}
      <div style={{ display: 'flex', gap: '30px', marginBottom: '40px', alignItems: 'flex-start' }}>
        
        {/* Columna Izquierda */}
        <div style={{ flex: '0 0 350px', maxWidth: '350px' }}>
          <section style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <h2 style={{ marginTop: 0 }}>Crear Horario</h2>
            <Form
            title=""
            buttonText="Crear"
            fields={[
              {
                name: 'id_lugar',
                label: 'Lugar',
                fieldType: 'select',
                required: true,
                options: lugares.map((lugar) => ({
                  label: lugar.nombre,
                  value: lugar.id_lugar,
                })),
              },
              {
                name: 'fecha',
                label: 'Fecha',
                placeholder: 'DD-MM-YYYY',
                required: true,
                type: 'date',
                fieldType: 'input',
              },
              {
                name: 'horaInicio',
                label: 'Hora inicio',
                placeholder: 'HH:MM',
                required: true,
                type: 'time',
                fieldType: 'input',
              },
              {
                name: 'horaFin',
                label: 'Hora fin',
                placeholder: 'HH:MM',
                required: true,
                type: 'time',
                fieldType: 'input',
              },
            ]}
            onSubmit={async (formData) => {
              const payload = {
                id_lugar: Number(formData.id_lugar),
                fecha: formData.fecha,
                horaInicio: formData.horaInicio,
                horaFin: formData.horaFin,
              };
              const res = await createHorario(payload);
              if (res && res.status && res.status.toLowerCase() === 'success') {
                showSuccessAlert(
                  'Horario creado',
                  res.message || 'Horario creado exitosamente'
                );
              } else {
                showErrorAlert('Error', res.message || 'No se pudo crear el horario');
              }
            }}
            />
          </section>
        </div>

        {/* Columna Derecha - Ver horarios por lugar */}
        <div style={{ flex: '1', minWidth: '500px' }}>
          <section style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
        <h2 style={{ marginTop: 0 }}>Ver horarios por lugar</h2>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="selectLugar">Selecciona un lugar: </label>
          <select
            id="selectLugar"
            value={lugarSeleccionado}
            onChange={(e) => handleLugarChange(e.target.value)}
            style={{ padding: '8px', marginLeft: '10px' }}
          >
            <option value="">-- Selecciona un lugar --</option>
            {lugares.map((lugar) => (
              <option key={lugar.id_lugar} value={lugar.id_lugar}>
                {lugar.nombre}
              </option>
            ))}
          </select>
        </div>

        {lugarSeleccionado && (
          <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>
            Horarios de: <span style={{ color: '#0066cc' }}>{lugarActual?.nombre || '—'}</span>
          </p>
        )}

        {horarios && horarios.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ccc' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Fecha</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Hora Inicio</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Hora Fin</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {horarios.map((horario) => (
                <tr key={horario.id_horario} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>{horario.fecha}</td>
                  <td style={{ padding: '10px' }}>{horario.horaInicio}</td>
                  <td style={{ padding: '10px' }}>{horario.horaFin}</td>
                  <td style={{ padding: '10px' }}>
                    <button 
                      style={{ marginRight: '5px', cursor: 'pointer', padding: '5px 10px' }}
                      onClick={() => setHorarioSeleccionado(horario.id_horario)}
                    >
                      Asignar Profesor
                    </button>
                    <button 
                      style={{ marginRight: '5px', cursor: 'pointer', padding: '5px 10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
                      onClick={() => setHorarioEditando(horario)}
                    >
                      Editar
                    </button>
                    <button
                      style={{
                        cursor: 'pointer',
                        backgroundColor: '#ff6b6b',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                      }}
                      onClick={async () => {
                        if (window.confirm('¿Estás seguro de eliminar este horario?')) {
                          const res = await eliminarHorario(horario.id_horario);
                          if (res && res.status && res.status.toLowerCase() === 'success') {
                            showSuccessAlert('Horario eliminado', res.message || 'Eliminación exitosa');
                            const data = await getHorariosPorLugar(lugarSeleccionado);
                            setHorarios(data);
                          } else {
                            showErrorAlert('Error', res.message || 'No se pudo eliminar el horario');
                          }
                        }
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : lugarSeleccionado ? (
          <p style={{ marginTop: '20px', color: '#666' }}>No hay horarios para este lugar.</p>
        ) : (
          <p style={{ marginTop: '20px', color: '#999' }}>
            Selecciona un lugar para ver sus horarios.
          </p>
        )}
          </section>

          {/* Asignar estudiantes a profesor */}
          <section style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#e8f5e9' }}>
            <h2 style={{ marginTop: 0 }}>Asignar estudiantes a profesor</h2>
            <div>
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="selectProfesor" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                  Selecciona un profesor:
                </label>
                <select
                  id="selectProfesor"
                  value={estudiantesSeleccionados.profesorId || ''}
                  onChange={(e) => setEstudiantesSeleccionados({ profesorId: e.target.value, estudiantes: [] })}
                  style={{ padding: '8px', width: '100%', marginTop: '5px' }}
                >
                  <option value="">-- Selecciona un profesor --</option>
                  {profesores.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.nombreCompleto}
                    </option>
                  ))}
                </select>
              </div>

              {estudiantesSeleccionados.profesorId && (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Selecciona estudiantes:</p>
                    <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '4px', backgroundColor: 'white' }}>
                      {estudiantes.map((est) => (
                        <label key={est.id} style={{ display: 'block', marginBottom: '8px', cursor: 'pointer' }}>
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
                            style={{ marginRight: '8px' }}
                          />
                          {est.nombreCompleto} - {est.email}
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
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
                        setEstudiantesSeleccionados({ profesorId: '', estudiantes: [] });
                      } else {
                        showErrorAlert('Error', res.message || 'No se pudo asignar los estudiantes');
                      }
                    }}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '10px'
                    }}
                  >
                    Asignar Estudiantes ({estudiantesSeleccionados.estudiantes.length})
                  </button>

                  <button
                    onClick={() => setEstudiantesSeleccionados({ profesorId: '', estudiantes: [] })}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#ccc',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      </div>

      {horarioEditando && (
        <section style={{ marginTop: '40px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff3cd' }}>
          <h2>Editar horario</h2>
          <p style={{ marginBottom: '20px' }}>
            <strong>Horario actual:</strong> {horarioEditando.fecha} de {horarioEditando.horaInicio} a {horarioEditando.horaFin}
          </p>
          <div style={{ maxWidth: '500px' }}>
            <Form
              title="Modificar horario"
              buttonText="Actualizar"
              fields={[
                {
                  name: 'fecha',
                  label: 'Fecha',
                  placeholder: 'DD-MM-YYYY',
                  required: true,
                  type: 'date',
                  fieldType: 'input',
                  defaultValue: horarioEditando.fecha,
                },
                {
                  name: 'horaInicio',
                  label: 'Hora inicio',
                  placeholder: 'HH:MM',
                  required: true,
                  type: 'time',
                  fieldType: 'input',
                  defaultValue: horarioEditando.horaInicio,
                },
                {
                  name: 'horaFin',
                  label: 'Hora fin',
                  placeholder: 'HH:MM',
                  required: true,
                  type: 'time',
                  fieldType: 'input',
                  defaultValue: horarioEditando.horaFin,
                },
              ]}
              onSubmit={async (formData) => {
                const payload = {
                  fecha: formData.fecha,
                  horaInicio: formData.horaInicio,
                  horaFin: formData.horaFin,
                };
                const res = await actualizarHorario(horarioEditando.id_horario, payload);
                if (res && res.status && res.status.toLowerCase() === 'success') {
                  showSuccessAlert('Horario actualizado', res.message || 'Actualización exitosa');
                  setHorarioEditando(null);
                  if (lugarSeleccionado) {
                    const data = await getHorariosPorLugar(lugarSeleccionado);
                    setHorarios(data);
                  }
                } else {
                  showErrorAlert('Error', res.message || 'No se pudo actualizar el horario');
                }
              }}
            />
            <button 
              onClick={() => setHorarioEditando(null)}
              style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}
            >
              Cancelar
            </button>
          </div>
        </section>
      )}

      {horarioSeleccionado && (
        <section style={{ marginTop: '40px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h2>Asignar profesor a horario</h2>
          {(() => {
            const horario = horarios.find(h => h.id_horario === horarioSeleccionado);
            return horario ? (
              <p style={{ marginBottom: '20px' }}>
                <strong>Horario seleccionado:</strong> {horario.fecha} de {horario.horaInicio} a {horario.horaFin}
              </p>
            ) : null;
          })()}
          <div style={{ maxWidth: '500px' }}>
            <Form
              title="Seleccionar profesor"
              buttonText="Asignar"
              fields={[
                {
                  name: 'id_profesor',
                  label: 'Profesor',
                  fieldType: 'select',
                  required: true,
                  options: profesores.map((prof) => ({
                    label: prof.nombreCompleto,
                    value: prof.id,
                  })),
                },
              ]}
              onSubmit={async (formData) => {
                const res = await asignarProfesorAHorario(
                  horarioSeleccionado,
                  Number(formData.id_profesor)
                );
                if (res && res.status && res.status.toLowerCase() === 'success') {
                  showSuccessAlert('Profesor asignado', res.message || 'Asignación exitosa');
                  setHorarioSeleccionado('');
                  if (lugarSeleccionado) {
                    const data = await getHorariosPorLugar(lugarSeleccionado);
                    setHorarios(data);
                  }
                } else {
                  showErrorAlert('Error', res.message || 'No se pudo asignar el profesor');
                }
              }}
            />
            <button 
              onClick={() => setHorarioSeleccionado('')}
              style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}
            >
              Cancelar
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Comisiones;
