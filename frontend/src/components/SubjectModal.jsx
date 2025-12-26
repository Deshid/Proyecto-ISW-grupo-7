import { useState } from 'react'; // AÑADE ESTE IMPORT
import Form from '@components/Form';
import '@styles/form.css';
import './SubjectModal.css'; // Crea este archivo para estilos

const SubjectModal = ({ isOpen, onClose, onSubmit }) => {
  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;
  
  const [subjectName, setSubjectName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        
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