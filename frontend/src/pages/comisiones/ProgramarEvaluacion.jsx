import Form from '@components/Form';
import Modal from '@components/Modal';
import MiniHeader from '@components/MiniHeader';
import '@styles/comisiones.css';
import { createHorario, getLugares, getHorariosPorLugar, asignarProfesorAHorario, getProfesores, actualizarHorario, eliminarHorario } from '@services/comision.service.js';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';
import { useEffect, useState } from 'react';

const ProgramarEvaluacion = () => {
  const [lugares, setLugares] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [lugarSeleccionado, setLugarSeleccionado] = useState('');
  const [profesores, setProfesores] = useState([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState('');
  const [horarioEditando, setHorarioEditando] = useState(null);

  const formatHora = (hora) => {
    if (!hora) return '';
    // Formato HH:MM
    if (hora.length === 5 && hora.includes(':')) return hora;
    // Si tiene HH:MM:SS, obtener solo HH:MM
    return hora.substring(0, 5);
  };

  useEffect(() => {
    const fetchLugares = async () => {
      const data = await getLugares();
      setLugares(data);
    };
    const fetchProfesores = async () => {
      const data = await getProfesores();
      setProfesores(data);
    };
    fetchLugares();
    fetchProfesores();
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
    <div className="comisiones">
        <MiniHeader icon="schedule" title="Programar Evaluación" subtitle="Crea y gestiona horarios de evaluación" />
     

      {/* Dos columnas */}
      <div className="grid grid-1-3">
        
        {/* Columna Izquierda */}
        <div>
          <section className="card card-amber">
            <h2 className="titulo-seccion">
              <span className="material-symbols-outlined page-icon">add_circle</span> 
              Crear nuevo horario
            </h2>
            <div>
              <Form
                title=""
                buttonText="Crear"
                fields={[
                  {
                    name: 'id_lugar',
                    label: 'Lugar de evaluación',
                    fieldType: 'select',
                    required: true,
                    options: lugares.map((lugar) => ({
                      label: lugar.nombre,
                      value: lugar.id_lugar,
                    })),
                  },
                  {
                    name: 'modalidad',
                    label: 'Modalidad',
                    fieldType: 'select',
                    required: false,
                    options: [
                      { label: 'Presencial', value: 'presencial' },
                      { label: 'Online', value: 'online' },
                      { label: 'Híbrida', value: 'híbrida' },
                    ],
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
                  if (formData.modalidad) {
                    payload.modalidad = formData.modalidad;
                  }
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
            </div>
          </section>
        </div>

        {/* Columna Derecha - Ver horarios por lugar */}
        <div>
          <section className="card card-stone">
            <h2 className="titulo-seccion">
              <span className="material-symbols-outlined page-icon">event_available</span>
              Evaluaciones programadas 
            </h2>
            <div className="mb-20">
              <label htmlFor="selectLugar" style={{ marginBottom: '10px', display: 'block' }}>Selecciona un lugar</label>
              <select
                id="selectLugar"
                className="ds-input"
                value={lugarSeleccionado}
                onChange={(e) => handleLugarChange(e.target.value)}
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
              <p className="info-seleccion">
                Horarios de: <span className="lugar">{lugarActual?.nombre || '—'}</span>
              </p>
            )}

            {horarios && horarios.length > 0 ? (
              <table className="tabla tabla-comisiones">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora Inicio</th>
                    <th>Hora Fin</th>
                    <th>Modalidad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {horarios.map((horario) => (
                    <tr key={horario.id_horario}>
                      <td>{horario.fecha}</td>
                      <td>{formatHora(horario.horaInicio)}</td>
                      <td>{formatHora(horario.horaFin)}</td>
                      <td>{horario.modalidad ? horario.modalidad.charAt(0).toUpperCase() + horario.modalidad.slice(1) : '—'}</td>
                      <td className="celda-acciones">
                        <button 
                          className="btn btn-outline-amber"
                          onClick={() => setHorarioSeleccionado(horario.id_horario)}
                        >
                          Asignar Profesor
                        </button>
                        <button 
                          className="btn btn-primary"
                          onClick={() => setHorarioEditando(horario)}
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          className="btn btn-danger-icon"
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
                          <span className="material-symbols-outlined">delete</span>
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
        </div>
      </div>

      <Modal
        open={Boolean(horarioEditando)}
        type="edit"
        title="Editar horario"
        horario={horarioEditando}
        onClose={() => setHorarioEditando(null)}
        onSubmit={async (formData) => {
          const payload = {
            fecha: formData.fecha,
            horaInicio: formData.horaInicio,
            horaFin: formData.horaFin,
          };
          if (formData.modalidad) {
            payload.modalidad = formData.modalidad;
          }
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

      <Modal
        open={Boolean(horarioSeleccionado)}
        type="assign"
        title="Asignar profesor a horario"  
        horario={horarios.find(h => h.id_horario === horarioSeleccionado)}
        profesores={profesores}
        onClose={() => setHorarioSeleccionado('')}
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
    </div>
  );
};

export default ProgramarEvaluacion;
