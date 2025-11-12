import Form from '@components/Form';
import '@styles/users.css';
import { createHorario, getLugares, getHorariosPorLugar } from '@services/comision.service.js';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';
import { useEffect, useState } from 'react';

const Comisiones = () => {
  const [lugares, setLugares] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [lugarSeleccionado, setLugarSeleccionado] = useState('');

  useEffect(() => {
    const fetchLugares = async () => {
      const data = await getLugares();
      setLugares(data);
    };
    fetchLugares();
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
    <div className="page-container" style={{ paddingTop: '10vh' }}>

      <section style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px', width: '100%' }}>
        <div>
          <h1 style={{ marginTop: 0 }}>Gestión de Comisiones</h1>
          <p>Aquí podrás gestionar horarios y asignar profesores.</p>
          <div style={{ maxWidth: '100%', display: 'flex', justifyContent: 'center' }}>
            <Form
            title="Crear horario"
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
                placeholder: 'YYYY-MM-DD',
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
          </div>
        </div>
      </section>

      <section>
        <h2>Ver horarios por lugar</h2>
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
                    <button style={{ marginRight: '5px', cursor: 'pointer' }}>Editar</button>
                    <button
                      style={{
                        cursor: 'pointer',
                        backgroundColor: '#ff6b6b',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
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
    </div>
  );
};

export default Comisiones;
