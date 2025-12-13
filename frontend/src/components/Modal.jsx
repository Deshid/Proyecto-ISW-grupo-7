import Form from './Form';

export default function Modal({ open, onClose, title, children, type, horario, profesores, onSubmit, maxWidth = '560px' }) {
  if (!open) return null;

  const renderContent = () => {
    // Si se pasa children directamente, renderizarlos
    if (children) return children;

    /* Editar horario */
    if (type === 'edit' && horario) {
      return (
        <>
          <p className="mb-20">
            <strong>Horario actual:</strong> <span style={{color: '#92400e', padding: '4px 10px', borderRadius: '6px', fontWeight: '600', fontSize: '14px' }}>{horario.fecha} de {horario.horaInicio} a {horario.horaFin}</span>
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
              <span style={{ color: '#92400e', borderRadius: '6px', fontWeight: '600', fontSize: '14px', marginTop: '8px', display: 'inline-block' }}>{horario.fecha} de {horario.horaInicio} a {horario.horaFin}</span>
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

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(2px)'
  };

  const dialogStyle = {
    background: '#fff',
    borderRadius: 12,
    borderLeft: type === 'edit' ? '4px solid #57534e' : type === 'assign' ? '4px solid #d97706' : 'none',
    width: `min(92vw, ${maxWidth})`,
    maxHeight: '90vh',
    boxShadow: '0 12px 24px rgba(0,0,0,0.18)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const headerStyle = {
    padding: '20px 24px 16px',
    borderBottom: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const contentStyle = {
    padding: '0 24px 24px',
    overflowY: 'auto'
  };

  const closeBtnStyle = {
    background: 'transparent',
    border: 'none',
    padding: 4,
    borderRadius: 6,
    cursor: 'pointer',
    color: '#78716c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  };

  const stop = (e) => e.stopPropagation();

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={stop}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#292524', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {type === 'edit' && <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#57534e' }}>edit</span>}
            {type === 'assign' && <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#d97706' }}>person_add</span>}
            {title}
          </h2>
          <button onClick={onClose} style={closeBtnStyle} onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f4'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} aria-label="Cerrar">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>
        <div style={contentStyle}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
