import Form from './Form';
import '@styles/comisiones.css';

export default function Modal({ open, onClose, title, children, type, horario, profesores, onSubmit, maxWidth = '560px' }) {
  if (!open) return null;

  const formatHora = (hora) => {
    if (!hora) return '';
    // Si ya tiene formato HH:MM, devolverlo así
    if (hora.length === 5 && hora.includes(':')) return hora;
    // Si tiene HH:MM:SS, extraer solo HH:MM
    return hora.substring(0, 5);
  };

  const renderContent = () => {
    // Si se pasa children directamente, renderizarlos
    if (children) return children;

    /* Editar horario */
    if (type === 'edit' && horario) {
      return (
        <>
          <p className="mb-20">
            <strong>Horario actual:</strong> <span style={{color: '#92400e', padding: '4px 10px', borderRadius: '6px', fontWeight: '600', fontSize: '14px' }}>{horario.fecha} de {formatHora(horario.horaInicio)} a {formatHora(horario.horaFin)}</span>
          </p>
          <div className="modal-form-wrapper">
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
                  defaultValue: horario.fecha,
                },
                {
                  name: 'horaInicio',
                  label: 'Hora inicio',
                  placeholder: 'HH:MM',
                  required: true,
                  type: 'time',
                  fieldType: 'input',
                  defaultValue: horario.horaInicio?.substring(0, 5) || horario.horaInicio,
                },
                {
                  name: 'horaFin',
                  label: 'Hora fin',
                  placeholder: 'HH:MM',
                  required: true,
                  type: 'time',
                  fieldType: 'input',
                  defaultValue: horario.horaFin?.substring(0, 5) || horario.horaFin,
                },
                {
                  name: 'modalidad',
                  label: 'Modalidad',
                  fieldType: 'select',
                  required: false,
                  defaultValue: horario.modalidad || '',
                  options: [
                    { label: 'Presencial', value: 'presencial' },
                    { label: 'Online', value: 'online' },
                    { label: 'Híbrida', value: 'híbrida' },
                  ],
                },
              ]}
              onSubmit={onSubmit}
            />
          </div>
        </>
      );
    }

    /* Asignar profesor */
    if (type === 'assign' && profesores) {
      return (
        <>
          {horario && (
            <h4 className="mb-20" style={{ fontWeight: '300', marginTop: '0' }}>
              Selecciona a un profesor para el horario: 
              <br />
              <span style={{ color: '#92400e', borderRadius: '6px', fontWeight: '600', fontSize: '14px', marginTop: '8px', display: 'inline-block' }}>{horario.fecha} de {formatHora(horario.horaInicio)} a {formatHora(horario.horaFin)}</span>
            </h4>
          )}
          <div className="modal-form-wrapper">
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
              onSubmit={onSubmit}
            />
          </div>
        </>
      );
    }

    return null;
  };

  const stop = (e) => e.stopPropagation();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ width: `min(92vw, ${maxWidth})` }} onClick={stop}>
        <div className="modal-header">
          {type === 'edit' && <span className="material-symbols-outlined page-icon">edit</span>}
          {type === 'assign' && <span className="material-symbols-outlined page-icon">person_add</span>}
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="modal-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
