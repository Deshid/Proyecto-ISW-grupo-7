import Table from '@components/Table';
import Search from '../components/Search';
import Popup from '../components/Popup';
import SubjectModal from './SubjectModal.jsx';
import DeleteIcon from '../assets/deleteIcon.svg';
import UpdateIcon from '../assets/updateIcon.svg';
import UpdateIconDisable from '../assets/updateIconDisabled.svg';
import DeleteIconDisable from '../assets/deleteIconDisabled.svg';
import { useCallback, useState, useEffect } from 'react';
import '@styles/users.css';

const UsersProfe = () => {
  const [users, setUsers] = useState([]);
  const [filterRut, setFilterRut] = useState('');
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectsList, setSubjectsList] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [dataUser, setDataUser] = useState([]); // Usuarios seleccionados en la tabla
  const usuario = JSON.parse(sessionStorage.getItem('usuario')) || null;

  // Obtener información del profesor logueado desde sessionStorage y cargar estudiantes
  useEffect(() => {
    const init = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          console.log('No hay sesión activa');
          setIsLoading(false);
          return;
        }

        if (!usuario || !usuario.id) {
          console.error('Usuario no encontrado en sessionStorage');
          setIsLoading(false);
          return;
        }

        setUserId(usuario.id);
        await Promise.all([
          fetchProfesorEstudiantes(usuario.id),
          loadAllSubjects()
        ]);
      } catch (error) {
        console.error('Error inicializando UsersProfe:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Cargar estudiantes asignados al profesor
  // acepta un objeto usuario o directamente un id (number|string)
  const fetchProfesorEstudiantes = async (usuarioOrId) => {
    try {
      const id = usuarioOrId && typeof usuarioOrId === 'object' ? usuarioOrId.id : usuarioOrId;
      console.log("Cargando estudiantes del profesor ID:", id);
      
      const token = sessionStorage.getItem('token');
      if (!token) return;
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Obtener estudiantes asignados al profesor
      console.log("Haciendo fetch a estudiantes con id...", id);
      const response = await fetch(`http://localhost:3000/api/profesor/${id}/estudiantes`, { 
        headers 
      });
      
      if (!response.ok) {
        console.error("Error obteniendo estudiantes:", response.status);
        return;
      }
      
      const result = await response.json();
      console.log("Estudiantes recibidos:", result);

      // Aceptar múltiples formatos: { success, data } o { status: 'Success', data }
      const rawStudents = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);

      if (!rawStudents || rawStudents.length === 0) {
        setUsers([]);
        return;
      }

      // Normalizar datos: eliminar password
      const estudiantesNormalizados = rawStudents.map(estudiante => {
        const { password, ...estudianteSinPassword } = estudiante;
        return estudianteSinPassword;
      });

      // Enriquecer cada estudiante con sus temas
      const estudiantesConTemas = await Promise.all(
        estudiantesNormalizados.map(async (estudiante) => {
            try {
              const temasResponse = await fetch(
                `http://localhost:3000/api/subjectAssign/user/${estudiante.id}/subjects`,
                { headers }
              );
              
              if (temasResponse.ok) {
                const temasData = await temasResponse.json();
                const temas = temasData.data || temasData || [];
                
                return {
                  ...estudiante,
                  subjects: Array.isArray(temas) ? temas.map(item => item.subject || item) : [],
                  subjectsCount: Array.isArray(temas) ? temas.length : 0,
                  assignedSubject: Array.isArray(temas) && temas.length > 0 
                    ? temas.map(item => (item.subject?.nombre || item.nombre || 'Sin nombre')).join(', ') 
                    : "Sin tema"
                };
              }
            } catch (error) {
              console.error(`Error obteniendo temas para estudiante ${estudiante.id}:`, error);
              return {
                ...estudiante,
                subjects: [],
                subjectsCount: 0,
                assignedSubject: "Error"
              };
            }
          })
        );
        
        setUsers(Array.isArray(estudiantesConTemas) ? estudiantesConTemas : []);
    } catch (error) {
      console.error("Error en fetchProfesorEstudiantes:", error);
    }
  };

  // Debug: ver cuando cambia el estado users
  useEffect(() => {
    console.log('Users state actualizado. length=', Array.isArray(users) ? users.length : 'not-array', users);
  }, [users]);

  // Función para cargar todos los subjects del backend
  const loadAllSubjects = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return;
      // Si hay un usuario (profesor) en sessionStorage, pedir solo sus subjects
      const creatorIdQuery = usuario && usuario.id ? `?creatorId=${usuario.id}` : '';

      const response = await fetch(`http://localhost:3000/api/subject/subject-list${creatorIdQuery}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Filtrar por creador en frontend como salvaguarda extra
          const allSubjects = result.data || [];
          let filtered = allSubjects;
          if (usuario && usuario.rol === 'profesor' && usuario.id) {
            filtered = allSubjects.filter(s => s.creatorId == usuario.id);
            // además, descartar subjects sin creatorId
            filtered = filtered.filter(s => s.creatorId != null && s.creatorId !== undefined);
          }
          setSubjectsList(filtered);
        }
      }
    } catch (error) {
      console.error('Error cargando subjects:', error);
    }
  };

  // Crear tema
  const handleAddSubject = async (subjectName) => {
    try {
      if (!subjectName || subjectName.trim() === '') {
        throw new Error('El nombre del tema es obligatorio');
      }

      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No hay sesión activa. Por favor, inicia sesión.');
      }

      const response = await fetch('http://localhost:3000/api/subject/subject-create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: subjectName.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Error ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      
      // Actualizar lista de temas
      await loadAllSubjects();

      return {
        success: true,
        message: 'Tema creado exitosamente',
        data: result.data || result
      };

    } catch (error) {
      console.error('Error creando tema:', error);
      return {
        success: false,
        message: error.message || 'Error al crear el tema'
      };
    }
  };

  // Borrar tema
  const handleDeleteSubject = async (subjectName) => {
    try {
      if (!subjectName || subjectName.trim() === '') {
        return {
          success: false,
          message: 'El nombre del tema es obligatorio'
        };
      }

      const token = sessionStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          message: 'No hay sesión activa. Por favor, inicia sesión.'
        };
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // 1. Buscar tema por nombre
      const searchResponse = await fetch(
        `http://localhost:3000/api/subject/search?name=${encodeURIComponent(subjectName.trim())}`,
        { headers }
      );

      if (!searchResponse.ok) {
        return {
          success: false,
          message: 'Error al buscar el tema en el sistema'
        };
      }

      const searchResult = await searchResponse.json();

      if (!searchResult.success || !searchResult.data || searchResult.data.length === 0) {
        return {
          success: false,
          message: `No se encontró el tema "${subjectName}"`
        };
      }

      const subjectToDelete = searchResult.data[0];
      const subjectId = subjectToDelete.id;
      const exactName = subjectToDelete.nombre;

      const confirmDelete = window.confirm(
        `¿Estás seguro de borrar el tema "${exactName}"?\nEsta acción no se puede deshacer.`
      );
      
      if (!confirmDelete) {
        return {
          success: false,
          message: 'Borrado cancelado'
        };
      }

      // 2. Borrar tema
      const deleteResponse = await fetch(
        `http://localhost:3000/api/subject/${subjectId}`,
        {
          method: 'DELETE',
          headers
        }
      );

      if (!deleteResponse.ok) {
        return {
          success: false,
          message: 'Error al borrar el tema del sistema'
        };
      }

      // 3. Limpiar relaciones huérfanas
      try {
        await fetch('http://localhost:3000/api/temp/cleanup-orphans', {
          method: 'POST',
          headers
        });
      } catch (cleanupError) {
        console.warn('Error en limpieza:', cleanupError.message);
      }

      // Actualizar lista de temas
      await loadAllSubjects();

      return {
        success: true,
        message: `Tema "${exactName}" borrado exitosamente`
      };

    } catch (error) {
      console.error('Error borrando tema:', error);
      return {
        success: false,
        message: error.message || 'Error inesperado al borrar el tema'
      };
    }
  };

  // Asignar tema seleccionado a estudiantes
  const assignSubjectToUsers = async () => {
    if (!selectedSubjectId) {
      alert('Por favor, selecciona un tema del dropdown');
      return;
    }
    
    if (!dataUser || dataUser.length === 0) {
      alert('Por favor, selecciona al menos un estudiante de la tabla');
      return;
    }
    
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert('No hay sesión activa');
      return;
    }
    
    const subjectName = subjectsList.find(s => s.id == selectedSubjectId)?.nombre || 'el tema';
    
    const confirmMessage = dataUser.length === 1 
      ? `¿Asignar "${subjectName}" al estudiante ${dataUser[0].nombreCompleto}?`
      : `¿Asignar "${subjectName}" a ${dataUser.length} estudiantes seleccionados?`;

    if (!window.confirm(confirmMessage + '\n\nNota: Se reemplazará cualquier tema previo.')) {
      return;
    }
    
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const results = [];
      
      for (const user of dataUser) {
        try {
          // Limpiar temas previos
          const currentSubjectsRes = await fetch(
            `http://localhost:3000/api/subjectAssign/user/${user.id}/subjects`,
            { headers }
          );
          
          if (currentSubjectsRes.ok) {
            const currentData = await currentSubjectsRes.json();
            if (currentData.success && currentData.data && currentData.data.length > 0) {
              for (const relation of currentData.data) {
                await fetch('http://localhost:3000/api/subjectAssign/remove', {
                  method: 'DELETE',
                  headers,
                  body: JSON.stringify({
                    userId: user.id,
                    subjectId: relation.subject.id
                  })
                });
              }
            }
          }
          
          // Asignar nuevo tema
          const response = await fetch('http://localhost:3000/api/subjectAssign/assign', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              userId: user.id,
              subjectId: parseInt(selectedSubjectId)
            })
          });
          
          const result = await response.json();
          
          results.push({
            user: user.nombreCompleto,
            success: response.ok && result.success,
            message: result.message
          });
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          results.push({
            user: user.nombreCompleto,
            success: false,
            message: error.message
          });
        }
      }
      
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      if (failed.length === 0) {
        alert(`✅ Tema asignado exitosamente a ${successful.length} estudiante(s)`);
      } else if (successful.length === 0) {
        alert(`❌ Error asignando tema a todos los estudiantes`);
      } else {
        alert(`📊 Resultados:\n✅ Éxitos: ${successful.length}\n❌ Fallos: ${failed.length}`);
      }
      
      // Recargar datos
      if (userId) {
        await fetchProfesorEstudiantes(userId);
      }
      setSelectedSubjectId('');
      
    } catch (error) {
      console.error('Error general en asignación:', error);
      alert('Error inesperado al asignar tema');
    }
  };

  // Asignar temas aleatoriamente
  const assignRandomUser = async () => {
    if (!dataUser || dataUser.length === 0) {
      alert('Por favor, selecciona al menos un estudiante en la tabla');
      return;
    }
    
    if (subjectsList.length === 0) {
      alert('No hay temas disponibles en el sistema');
      return;
    }
    
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert('No hay sesión activa');
      return;
    }
    
    // Pedir límite máximo de usuarios por tema
    const limitInput = window.prompt(
      `Ingresa el número MÁXIMO de estudiantes que pueden tener el mismo tema:\n\n` +
      `• Estudiantes seleccionados: ${dataUser.length}\n` +
      `• Temas disponibles: ${subjectsList.length}`,
      "1"
    );
    
    if (limitInput === null) return;
    
    const maxUsersPerSubject = parseInt(limitInput);
    if (isNaN(maxUsersPerSubject) || maxUsersPerSubject < 1) {
      alert('Por favor ingresa un número válido mayor a 0');
      return;
    }

    const confirmMessage = 
      `¿Asignar temas aleatorios a ${dataUser.length} estudiantes?\n\n` +
      `• Límite: Máximo ${maxUsersPerSubject} estudiante(s) por tema\n` +
      `• Los temas pueden repetirse hasta alcanzar el límite\n\n` +
      `¿Continuar?`;

    if (!window.confirm(confirmMessage)) return;
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    try {
      const results = [];
      const subjectUsageCount = {};
      
      subjectsList.forEach(subject => {
        subjectUsageCount[subject.id] = 0;
      });
      
      for (const user of dataUser) {
        try {
          const availableSubjects = subjectsList.filter(subject => 
            subjectUsageCount[subject.id] < maxUsersPerSubject
          );
          
          if (availableSubjects.length === 0) {
            results.push({
              user: user.nombreCompleto,
              subject: 'Ninguno (límite alcanzado)',
              success: false,
              message: `Todos los temas alcanzaron el límite de ${maxUsersPerSubject} estudiantes`
            });
            continue;
          }
          
          const randomIndex = Math.floor(Math.random() * availableSubjects.length);
          const selectedSubject = availableSubjects[randomIndex];
          
          // Limpiar temas previos
          try {
            const currentSubjectsRes = await fetch(
              `http://localhost:3000/api/subjectAssign/user/${user.id}/subjects`,
              { headers }
            );
            
            if (currentSubjectsRes.ok) {
              const currentData = await currentSubjectsRes.json();
              if (currentData.success && currentData.data && currentData.data.length > 0) {
                for (const relation of currentData.data) {
                  if (subjectUsageCount[relation.subject.id] > 0) {
                    subjectUsageCount[relation.subject.id]--;
                  }
                  
                  await fetch('http://localhost:3000/api/subjectAssign/remove', {
                    method: 'DELETE',
                    headers,
                    body: JSON.stringify({
                      userId: user.id,
                      subjectId: relation.subject.id
                    })
                  });
                }
              }
            }
          } catch (cleanupError) {
            console.error(`Error limpiando temas previos:`, cleanupError);
          }
          
          // Asignar nuevo tema
          const assignResponse = await fetch('http://localhost:3000/api/subjectAssign/assign', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              userId: user.id,
              subjectId: selectedSubject.id
            })
          });
          
          const assignResult = await assignResponse.json();
          
          if (assignResponse.ok && assignResult.success) {
            subjectUsageCount[selectedSubject.id]++;
          }
          
          results.push({
            user: user.nombreCompleto,
            subject: selectedSubject.nombre,
            success: assignResponse.ok && assignResult.success,
            message: assignResult.message || (assignResponse.ok ? 'Éxito' : 'Error')
          });
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          results.push({
            user: user.nombreCompleto,
            subject: 'N/A',
            success: false,
            message: error.message
          });
        }
      }
      
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      let resultMessage = `📊 Resultados de asignación aleatoria:\n\n`;
      resultMessage += `• Límite configurado: ${maxUsersPerSubject} estudiante(s) por tema\n`;
      resultMessage += `• Estudiantes procesados: ${dataUser.length}\n`;
      resultMessage += `• ✅ Éxitos: ${successful.length}\n`;
      resultMessage += `• ❌ Fallos: ${failed.length}\n\n`;
      
      resultMessage += `Distribución final:\n`;
      subjectsList.forEach(subject => {
        const count = subjectUsageCount[subject.id] || 0;
        if (count > 0) {
          resultMessage += `  • "${subject.nombre}": ${count} estudiante(s)\n`;
        }
      });
      
      if (failed.length > 0) {
        resultMessage += `\nErrores:\n`;
        failed.forEach(r => {
          resultMessage += `  • ${r.user}: ${r.message}\n`;
        });
      }
      
      alert(resultMessage);
      
      // Recargar datos
      if (userId) {
        await fetchProfesorEstudiantes(userId);
      }
      
    } catch (error) {
      console.error('Error en asignación aleatoria:', error);
      alert(`❌ Error general: ${error.message}`);
    }
  };

  // Función para actualizar estudiante (placeholder - puedes implementarla)
  const handleUpdate = async (userData) => {
    alert('Función de actualización de estudiante - Implementar según necesidades');
    console.log('Actualizar estudiante:', userData);
  };

  // Función para eliminar estudiante (placeholder - cuidado con permisos)
  const handleDelete = async (usersToDelete) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar ${usersToDelete.length} estudiante(s)?\nEsta acción no se puede deshacer.`
    );
    
    if (confirmDelete) {
      alert('Función de eliminación de estudiante - Implementar con cuidado');
      console.log('Eliminar estudiantes:', usersToDelete);
    }
  };

  const handleRutFilterChange = (e) => {
    setFilterRut(e.target.value);
  };

  const handleSelectionChange = useCallback((selectedUsers) => {
    setDataUser(selectedUsers);
  }, []);

  const columns = [
    { title: "Nombre", field: "nombreCompleto", width: 150, responsive: 0 },
    { title: "Correo electrónico", field: "email", width:200, responsive: 3 },
    { title: "Rut", field: "rut", width: 100, responsive: 2 },
    { title: "Rol", field: "rol", width: 100, responsive: 2 },
    { title: "Creado", field: "createdAt", width: 100, responsive: 2 },
    { title: "Tema asignado", field: "assignedSubject", width: 100, responsive: 2,
      render: (rowData) => {
        if (rowData.subjectsCount === 0) {
          return <span style={{ color: '#666' }}>0 temas</span>;
        }
        return (
          <div>
            <strong>{rowData.subjectsCount} tema(s)</strong>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              {rowData.subjects.map(s => s.nombre).join('')}
            </div>
          </div>
        );
      }
    }
  ];

  if (isLoading) {
    return (
      <div className='main-container'>
        <div className='table-container'>
          <div className='top-table'>
            <h1 className='title-table'>Mis Estudiantes</h1>
          </div>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            Cargando estudiantes...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='main-container'>
      <div className='table-container'>
        <div className='top-table page-header'>
          <h1 className="titulo">
            <span className="material-symbols-outlined page-icon">group</span> 
            Mis Estudiantes - Profesor
            </h1>
        </div>

        <div className='filter-actions'>
          <Search 
            value={filterRut} 
            onChange={handleRutFilterChange} 
            placeholder={'Filtrar por rut'} 
          />

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              minWidth: '200px',
              marginLeft: '10px'
            }}
          >
            <option value="">Seleccionar tema</option>
            {subjectsList.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.nombre}
              </option>
            ))}
          </select>

          <button
            className="btn btn-outline-amber"
            onClick={() => setIsSubjectModalOpen(true)}
            style={{ marginLeft: '10px' }}
          >
            Crear/Borrar Tema
          </button>

          <button
            className="btn btn-primary"
            onClick={assignRandomUser}
            style={{ marginLeft: '10px' }}
            title="Asignar temas aleatoriamente a estudiantes seleccionados"
          >
            Sortear tema
          </button>

          <button
            className="btn btn-primary"
            onClick={assignSubjectToUsers}
            disabled={!selectedSubjectId || dataUser.length === 0}
            style={{ marginLeft: '10px' }}
            title="Asignar tema seleccionado a estudiantes"
          >
            Asignar
          </button>

        </div>

        <Table
          data={users}
          columns={columns}
          filter={filterRut}
          dataToFilter={'rut'}
          initialSortName={'nombreCompleto'}
          onSelectionChange={handleSelectionChange}
        />
        <SubjectModal
          isOpen={isSubjectModalOpen}
          onClose={() => setIsSubjectModalOpen(false)}
          onSubmit={handleAddSubject}
          onDelete={handleDeleteSubject}
          subjectsList={subjectsList}
        />
      </div>
    </div>
  );
};

export default UsersProfe;