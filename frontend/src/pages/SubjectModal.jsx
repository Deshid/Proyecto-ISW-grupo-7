import { useState } from 'react'; // AÑADE ESTE IMPORT
import Form from '@components/Form';
import '@styles/form.css';
import './SubjectModal.css'; // Crea este archivo para estilos

const SubjectModal = ({ isOpen, onClose, onSubmit, onDelete }) => {
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
      
      {/* SECCIÓN CREAR TEMA (existente) */}
      <h3>Crear Nuevo Tema</h3>
      <Form
  title="Crear Tema"
  fields={[
    { 
      label: "Nombre",
      type: "text",
      name: "nombre",
      placeholder: "Ingrese el nombre del tema",
      fieldType: 'input',
      required: true,
      validate: {
        minLength: (value) => value.length >= 3 || 'El nombre debe tener al menos 3 caracteres',
        maxLength: (value) => value.length <= 50 || 'El nombre no debe exceder los 50 caracteres',
      }
    },
  ]}
  buttonText={isLoading ? "Creando..." : "Crear tema"}
  onSubmit={handleSubmit}
  disabled={isLoading}
/>
      
      {/* SEPARADOR */}
      <hr />
      
      {/* SECCIÓN BORRAR TEMA (nueva) */}
      <h3>Borrar Tema Existente</h3>
      <div>
        <label htmlFor="delete-subject">Nombre del tema a borrar:</label>
        <input
          id="delete-subject"
          type="text"
          value={subjectToDelete}
          onChange={(e) => setSubjectToDelete(e.target.value)}
          placeholder="Ingresa el nombre exacto"
          disabled={isLoading}
        />
      </div>
      
      <button
        className="delete-button"
        onClick={handleDeleteClick}
        disabled={isLoading || !subjectToDelete.trim()}
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