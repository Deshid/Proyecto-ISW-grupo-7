import { useState } from 'react'; // AÑADE ESTE IMPORT
import '@styles/form.css';
import './SubjectModal.css'; // Crea este archivo para estilos

const SubjectModal = ({ isOpen, onClose, onSubmit, onDelete, subjectsList = [] }) => {
  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;
  
  const [subjectName, setSubjectName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [subjectToDelete, setSubjectToDelete] = useState('');

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Llamar a la función del padre (pasada como prop)
      const result = await onSubmit(formData.nombre);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        // Limpiar y cerrar después de 1.5 segundos
        setTimeout(() => {
          setSubjectName('');
          onClose();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Error al crear tema' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!subjectToDelete.trim()) {
      setMessage({ type: 'error', text: 'Ingresa un nombre de tema para borrar' });
      return;
    }
    
    setIsLoading(true);
    const result = await onDelete(subjectToDelete); // Llama a la función del padre
    setIsLoading(false);
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setSubjectToDelete('');
      setTimeout(() => onClose(), 2000);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  return (
  <div className="modal-overlay">
    <div className="modal-content">
      <button className="close-button" onClick={onClose}>×</button>
      
      {/* SECCIÓN CREAR TEMA (sin caja) */}
      <h3>Crear Nuevo Tema</h3>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const nombre = (subjectName || '').trim();
          if (nombre.length < 3) {
            setMessage({ type: 'error', text: 'El nombre debe tener al menos 3 caracteres' });
            return;
          }
          if (nombre.length > 50) {
            setMessage({ type: 'error', text: 'El nombre no debe exceder los 50 caracteres' });
            return;
          }
          await handleSubmit({ nombre });
        }}
        style={{ margin: 0, padding: 0 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="create-subject">Nombre</label>
          <input
            id="create-subject"
            type="text"
            name="nombre"
            placeholder="Ingrese el nombre del tema"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            disabled={isLoading}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || (subjectName || '').trim().length < 3}
            >
              {isLoading ? 'Creando...' : 'Crear tema'}
            </button>
          </div>
        </div>
      </form>
            
      {/* SEPARADOR */}
      <hr />
      
      {/* SECCIÓN BORRAR TEMA (nueva) */}
      <h3>Borrar Tema Existente</h3>
      <div>
        <label htmlFor="delete-subject">Selecciona el tema a borrar:</label>
        {Array.isArray(subjectsList) && subjectsList.length > 0 ? (
          <select
            id="delete-subject"
            value={subjectToDelete}
            onChange={(e) => setSubjectToDelete(e.target.value)}
            disabled={isLoading}
            style={{ padding: '8px', marginTop: '6px', minWidth: '220px' }}
          >
            <option value="">-- Seleccionar tema --</option>
            {subjectsList.map((s) => (
              <option key={s.id} value={s.nombre}>{s.nombre}</option>
            ))}
          </select>
        ) : (
          <div style={{ color: '#666', marginTop: '6px' }}>No hay temas creados por ti aún.</div>
        )}
      </div>

      <button
        className="delete-button"
        onClick={handleDeleteClick}
        disabled={isLoading || !subjectToDelete}
      >
        {isLoading ? 'Procesando...' : 'Borrar Tema'}
      </button>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  </div>
);
};

export default SubjectModal;