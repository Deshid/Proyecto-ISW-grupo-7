import Table from '@components/Table';
import useUsers from '@hooks/users/useGetUsers.jsx';
import Search from '../components/Search.jsx';
import Popup from '../components/Popup.jsx';
import SubjectModal from './SubjectModal.jsx';
import DeleteIcon from '../assets/deleteIcon.svg';
import UpdateIcon from '../assets/updateIcon.svg';
import UpdateIconDisable from '../assets/updateIconDisabled.svg';
import DeleteIconDisable from '../assets/deleteIconDisabled.svg';
import ViewIcon from '../assets/ViewIcon.svg';
import { useCallback, useState, useEffect } from 'react';
import '@styles/users.css';
import useEditUser from '@hooks/users/useEditUser';
import useDeleteUser from '@hooks/users/useDeleteUser';


const Users = () => {
  const { users, fetchUsers, setUsers } = useUsers();
  const [filterRut, setFilterRut] = useState('');
  const token = localStorage.getItem('token');
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectsList, setSubjectsList] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  console.log("Token disponible:", token ? "SÍ" : "NO"); 

  const headers = {
    'Authorization': `Bearer ${token}`,  // ← Asegúrate que esto esté presente
    'Content-Type': 'application/json'
  };

  useEffect(() => {
      fetchUsersWithSubjects();
      loadAllSubjects(); // ← AÑADE ESTA LÍNEA
  }, []);

  // Función para cargar todos los subjects del backend
  const loadAllSubjects = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('http://localhost:3000/api/subject/subject-list', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSubjectsList(result.data || []);
        }
      }
    } catch (error) {
      console.error('Error cargando subjects:', error);
    }
  };

  const handleAddSubject = async (subjectName) => {
    try {
      // 1. Validación básica
      if (!subjectName || subjectName.trim() === '') {
        throw new Error('El nombre del tema es obligatorio');
      }

      // 2. Obtener token (usa sessionStorage como funcionó antes)
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No hay sesión activa. Por favor, inicia sesión.');
      }

      // 3. Configurar petición
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

      // 4. Manejar respuesta
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Error ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();

      // 5. Éxito - devolver datos para manejar en el componente padre
      return {
        success: true,
        message: 'Tema creado exitosamente',
        data: result.data || result
      };

    } catch (error) {
      // 6. Error - devolver para mostrar en el modal
      console.error('Error creando tema:', error);
      return {
        success: false,
        message: error.message || 'Error al crear el tema'
      };
    }
  };

  const handleDeleteSubject = async (subjectName) => {
  try {
    // Validación básica
    if (!subjectName || subjectName.trim() === '') {
      return {
        success: false,
        message: 'El nombre del tema es obligatorio'
      };
    }

    // Obtener token
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

    // 1. BUSCAR el tema por nombre para obtener su ID
    console.log(`Buscando tema: "${subjectName}"`);
    const searchResponse = await fetch(
      `http://localhost:3000/api/subject/search?name=${encodeURIComponent(subjectName.trim())}`,
      { headers }
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Error en búsqueda:', errorText);
      return {
        success: false,
        message: 'Error al buscar el tema en el sistema'
      };
    }

    const searchResult = await searchResponse.json();
    console.log('Resultado búsqueda:', searchResult);

    // 2. Verificar si se encontró
    if (!searchResult.success || !searchResult.data || searchResult.data.length === 0) {
      return {
        success: false,
        message: `No se encontró el tema "${subjectName}"`
      };
    }

    // 3. Si hay múltiples resultados, usar el primero
    const subjectToDelete = searchResult.data[0];
    const subjectId = subjectToDelete.id;
    const exactName = subjectToDelete.nombre;
    
    console.log(`Tema encontrado: ID=${subjectId}, Nombre="${exactName}"`);

    // 4. CONFIRMAR borrado (opcional - puedes eliminar esto si quieres borrar directo)
    const confirmDelete = window.confirm(
      `¿Estás seguro de borrar el tema "${exactName}"?\nEsta acción no se puede deshacer.`
    );
    
    if (!confirmDelete) {
      return {
        success: false,
        message: 'Borrado cancelado'
      };
    }

    // 5. BORRAR el tema
    console.log(`Borrando tema ID: ${subjectId}`);
    const deleteResponse = await fetch(
      `http://localhost:3000/api/subject/${subjectId}`,
      {
        method: 'DELETE',
        headers
      }
    );

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error('Error en borrado:', errorText);
      return {
        success: false,
        message: 'Error al borrar el tema del sistema'
      };
    }

    const deleteResult = await deleteResponse.json();
    console.log('Resultado borrado:', deleteResult);

    try {
      const cleanupResponse = await fetch('http://localhost:3000/api/temp/cleanup-orphans', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
        // NO necesita body
      });

      if (cleanupResponse.ok) {
        const cleanupResult = await cleanupResponse.json();
        console.log('✅ Limpieza completada:', cleanupResult.deletedCount, 'relaciones eliminadas');
      } else {
        console.warn('⚠️ Limpieza falló, pero el subject fue borrado');
      }
    } catch (cleanupError) {
      console.warn('⚠️ Error en limpieza (no crítico):', cleanupError.message);
    }

    // 6. Éxito - opcionalmente actualizar la lista de usuarios
    // Si quieres que se actualicen los temas asignados en la tabla:
    // fetchUsersWithSubjects();

    return {
      success: true,
      message: `Tema "${exactName}" borrado exitosamente`,
      data: deleteResult.data || { id: subjectId, nombre: exactName }
    };

  } catch (error) {
    console.error('Error borrando tema:', error);
    return {
      success: false,
      message: error.message || 'Error inesperado al borrar el tema'
    };
  }
  };

  console.log("✅ handleDeleteSubject definida:", typeof handleDeleteSubject);

  const fetchUsersWithSubjects = async () => {
  try {
    console.log("1. Iniciando carga de usuarios con temas...");
    
    /*con esto, obtenemos el token del usuario que ingresó a la página.
    es necesario para la autenticación y el uso de los endpoints del usuario*/
    const token = sessionStorage.getItem('token');

    console.log("2. Token:", token ? "Presente" : "FALTANTE");
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // obtener usuarios
    console.log("3. Llamando a /api/user/ ...");
    const usersResponse = await fetch('http://localhost:3000/api/user/', { headers });
    console.log("4. Respuesta usuarios status:", usersResponse.status);
    
    const usersData = await usersResponse.json();
    console.log("5. Datos usuarios recibidos:", usersData);
    console.log("6. Número de usuarios:", usersData.data?.length || 0);
    
    // Para cada usuario, obtener sus temas
    console.log("7. Obteniendo temas para cada usuario...");
    const usersWithSubjects = await Promise.all(
      usersData.data.map(async (user, index) => {
        console.log(`   Usuario ${index+1}/${usersData.data.length}: ID=${user.id}, Nombre=${user.nombreCompleto}`);
        
        try {
          const url = `http://localhost:3000/api/subjectAssign/user/${user.id}/subjects`;
          console.log(`   Llamando a: ${url}`);
          
          const subjectsResponse = await fetch(url, { headers });
          console.log(`   Respuesta temas status: ${subjectsResponse.status}`);
          
          const subjectsData = await subjectsResponse.json();
          console.log(`   Datos temas recibidos:`, subjectsData);
          console.log(`   Número de temas: ${subjectsData.data?.length || 0}`);
          
          const userEnriquecido = {
            ...user,
            subjects: subjectsData.data?.map(item => item.subject) || [],
            subjectsCount: subjectsData.data?.length || 0,
            assignedSubject: subjectsData.data?.map(item => item.subject?.nombre).join(', ') || "Sin tema"
          };
          
          console.log(`   Usuario enriquecido:`, userEnriquecido);
          return userEnriquecido;
          
        } catch (error) {
          console.error(`   ERROR con usuario ${user.id}:`, error);
          return {
            ...user,
            subjects: [],
            subjectsCount: 0,
            assignedSubject: "Error"
          };
        }
      })
    );
    
    console.log("8. TODOS los usuarios enriquecidos:", usersWithSubjects);
    console.log("9. ¿Algún usuario tiene subjects?", usersWithSubjects.some(u => u.subjectsCount > 0));
    
    setUsers(usersWithSubjects);
    console.log("10. Estado actualizado con setUsers");
    
  } catch (error) {
    console.error("ERROR GENERAL en fetchUsersWithSubjects:", error);
  }
  };

  /*esto sirve para verificar el estado de una ventana modal, la cual usaremos para crear temas*/

  const {
    handleClickUpdate,
    handleUpdate,
    isPopupOpen,
    setIsPopupOpen,
    dataUser,
    setDataUser
  } = useEditUser(setUsers);

  const { handleDelete } = useDeleteUser(fetchUsers, setDataUser);

  const handleRutFilterChange = (e) => {
    setFilterRut(e.target.value);
  };

  const handleSelectionChange = useCallback((selectedUsers) => {
    setDataUser(selectedUsers);
  }, [setDataUser]);

  const assignSubjectToUsers = async () => {

    // 1. Filtrar usuarios no asignables
    const usuariosAsignables = dataUser.filter(user => 
      user.rol !== 'profesor' && user.rol !== 'administrador'
    );
    
    if (usuariosAsignables.length === 0) {
      alert('No hay usuarios asignables.\nProfesores y administradores no pueden recibir temas.');
      return;
    }


    // Validaciones básicas
    if (!selectedSubjectId) {
      alert('Por favor, selecciona un tema del dropdown');
      return;
    }
    
    if (!dataUser || dataUser.length === 0) {
      alert('Por favor, selecciona al menos un usuario de la tabla');
      return;
    }
    
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert('No hay sesión activa');
      return;
    }
    
      // 3. Actualiza los mensajes para usar usuariosAsignables
    const subjectName = subjectsList.find(s => s.id == selectedSubjectId)?.nombre || 'el tema';
    
    const confirmMessage = usuariosAsignables.length === 1 
      ? `¿Asignar "${subjectName}" al usuario ${usuariosAsignables[0].nombreCompleto}?`
      : `¿Asignar "${subjectName}" a ${usuariosAsignables.length} usuarios seleccionados?`;

    if (!window.confirm(confirmMessage + '\n\nNota: Se reemplazará cualquier tema previo.')) {
      return;
    }
    
    try {
      // Deshabilitar UI si quieres
      // setIsAssigning(true);
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const results = [];
      
      // 1. Primero, remover temas previos de cada usuario
      // 4. En los bucles, usa usuariosAsignables en lugar de dataUser
    for (const user of usuariosAsignables) {

        try {
          // Obtener temas actuales del usuario
          const currentSubjectsRes = await fetch(
            `http://localhost:3000/api/subjectAssign/user/${user.id}/subjects`,
            { headers }
          );
          
          if (currentSubjectsRes.ok) {
            const currentData = await currentSubjectsRes.json();
            // Quitar todos los temas existentes
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
                // quitar relaciones entre temas borrados y usuarios
                await fetch('http://localhost:3000/api/temp/cleanup-orphans', {
                  method: 'POST',
                  headers,
                  body: JSON.stringify({
                    userId: user.id,
                    subjectId: relation.subject.id
                  })
                });
              }
            }
          }
        } catch (error) {
          console.error(`Error limpiando temas previos de ${user.nombreCompleto}:`, error);
        }
      }
      
      // asignar el nuevo tema a todos los usuarios
      for (const user of usuariosAsignables) {

        try {
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
          
          // Pequeña pausa entre peticiones
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          results.push({
            user: user.nombreCompleto,
            success: false,
            message: error.message
          });
        }
      }
      
      // 3. Analizar resultados
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      // 4. Mostrar resultados
      if (failed.length === 0) {
        alert(`✅ Tema asignado exitosamente a ${successful.length} usuario(s)`);
      } else if (successful.length === 0) {
        alert(`❌ Error asignando tema a todos los usuarios`);
      } else {
        alert(`📊 Resultados:\n✅ Éxitos: ${successful.length}\n❌ Fallos: ${failed.length}`);
      }
      
      // 5. Recargar datos y limpiar
      fetchUsersWithSubjects(); // Recargar tabla
      setSelectedSubjectId(''); // Limpiar selección del dropdown
      
    } catch (error) {
      console.error('Error general en asignación:', error);
      alert('Error inesperado al asignar tema');
    } finally {
      // setIsAssigning(false);
    }
  };

  const assignRandomUser = async () => {
  // 1. Validaciones básicas (igual que antes)
  if (!dataUser || dataUser.length === 0) {
    alert('Por favor, selecciona al menos un usuario en la tabla');
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
  
  // 2. Pedir el límite máximo de usuarios por tema
  const limitInput = window.prompt(
    `Ingresa el número MÁXIMO de usuarios que pueden tener el mismo tema:\n\n` +
    `• Usuarios seleccionados: ${dataUser.length}\n` +
    `• Temas disponibles: ${subjectsList.length}`,
    "1"  // Valor por defecto
  );
  
  // Si el usuario cancela
  if (limitInput === null) {
    return;
  }
  
  // Validar que sea un número válido
  const maxUsersPerSubject = parseInt(limitInput);
  if (isNaN(maxUsersPerSubject) || maxUsersPerSubject < 1) {
    alert('Por favor ingresa un número válido mayor a 0');
    return;
  }

  // 4. Filtrar usuarios que NO sean profesor o administrador
const usuariosParaAsignar = dataUser.filter(user => 
  user.rol !== 'profesor' && user.rol !== 'administrador'
);

// Si no hay usuarios válidos después del filtro
if (usuariosParaAsignar.length === 0) {
  alert('No hay usuarios asignables.\nLos profesores y administradores son excluidos automáticamente.');
  return;
}

// 5. Confirmación con toda la información (AHORA usando usuariosParaAsignar)
  const confirmMessage = 
    `¿Asignar temas aleatorios a ${usuariosParaAsignar.length} usuarios?\n\n` +
    `• Límite: Máximo ${maxUsersPerSubject} usuario(s) por tema\n` +
    `• Excluidos: ${dataUser.length - usuariosParaAsignar.length} profesor(es)/administrador(es)\n` +
    `• Los temas pueden repetirse hasta alcanzar el límite\n\n` +
    `¿Continuar?`;

  if (!window.confirm(confirmMessage)) {
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  try {
    const results = [];
    // Contador para llevar registro de cuántos usuarios tiene cada tema
    const subjectUsageCount = {};
    
    // contadores
    subjectsList.forEach(subject => {
      subjectUsageCount[subject.id] = 0;
    });
    
    // para cada usuario seleccionado
    for (const user of usuariosParaAsignar) {
      try {
        // temas disponibles que NO, (NO), N-O, hayan alcanzado el límite
        const availableSubjects = subjectsList.filter(subject => 
          subjectUsageCount[subject.id] < maxUsersPerSubject
        );
        
        // si no hay temas disponibles (todos alcanzaron su límite)
        // dios no existe
        if (availableSubjects.length === 0) {
          results.push({
            user: user.nombreCompleto,
            subject: 'Ninguno (límite alcanzado)',
            success: false,
            message: `Todos los temas alcanzaron el límite de ${maxUsersPerSubject} usuarios`
          });
          continue; // saltar a siguiente usuario
        }
        
        // elegir un tema aleatorio de los disponibles
        const randomIndex = Math.floor(Math.random() * availableSubjects.length);
        const selectedSubject = availableSubjects[randomIndex];
        
        console.log(`Asignando "${selectedSubject.nombre}" a ${user.nombreCompleto}...`);
        
        // limpiar temas previos (igual que tu lógica actual)
        try {
          const currentSubjectsRes = await fetch(
            `http://localhost:3000/api/subjectAssign/user/${user.id}/subjects`,
            { headers }
          );
          
          if (currentSubjectsRes.ok) {
            const currentData = await currentSubjectsRes.json();
            if (currentData.success && currentData.data && currentData.data.length > 0) {
              for (const relation of currentData.data) {
                // IMPORTANTE: disminuir contador al eliminar tema previo
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
          console.error(`Error limpiando temas previos de ${user.nombreCompleto}:`, cleanupError);
        }
        
        // asignar tema
        const assignResponse = await fetch('http://localhost:3000/api/subjectAssign/assign', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            userId: user.id,
            subjectId: selectedSubject.id
          })
        });
        
        const assignResult = await assignResponse.json();
        
        // actualizar contador con asignación exitosa
        if (assignResponse.ok && assignResult.success) {
          subjectUsageCount[selectedSubject.id]++;
        }
        
        results.push({
          user: user.nombreCompleto,
          subject: selectedSubject.nombre,
          success: assignResponse.ok && assignResult.success,
          message: assignResult.message || (assignResponse.ok ? 'Éxito' : 'Error'),
          currentUsage: subjectUsageCount[selectedSubject.id] // Para debug
        });
        
        // pequeña pausa entre peticiones
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
    
    // mostrar resultados detallados
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    let resultMessage = `📊 Resultados de asignación aleatoria con límite:\n\n`;
    resultMessage += `• Límite configurado: ${maxUsersPerSubject} usuario(s) por tema\n`;
    resultMessage += `• Usuarios procesados: ${dataUser.length}\n`;
    resultMessage += `• ✅ Éxitos: ${successful.length}\n`;
    resultMessage += `• ❌ Fallos: ${failed.length}\n\n`;
    
    // mostrar y errores por límite distribución de temas
    // este quizá debería quitarlo más adelante
    resultMessage += `Distribución final:\n`;
    subjectsList.forEach(subject => {
      const count = subjectUsageCount[subject.id] || 0;
      if (count > 0) {
        resultMessage += `  • "${subject.nombre}": ${count} usuario(s)\n`;
      }
    });
    
    if (failed.length > 0) {
      resultMessage += `\nErrores:\n`;
      failed.forEach(r => {
        resultMessage += `  • ${r.user}: ${r.message}\n`;
      });
    }
    
    alert(resultMessage);
    
    // actualiza tabla
    fetchUsersWithSubjects();
    
  } catch (error) {
    console.error('Error en asignación aleatoria:', error);
    alert(`❌ Error general: ${error.message}`);
  }
};

  const columns = [
    /*ATENCIÓN: la suma de los anchos totales de los campos debe ser igual o menor a 828.
    De otra forma, la tabla pasa a usar dos filas por instancia, lo cual tapa algunos botones
    de la página.
    */
    { title: "Nombre", field: "nombreCompleto", width: 150, responsive: 0 },
    { title: "Correo electrónico", field: "email", width: 200, responsive: 3 },
    { title: "Rut", field: "rut", width: 100, responsive: 2 },
    { title: "Rol", field: "rol", width: 100, responsive: 2 },
    { title: "Creado", field: "createdAt", width: 100, responsive: 2 },
    { title: "Tema asignado", field: "assignedSubject",  width: 100, responsive: 2,
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

  return (
    <div className='main-container'>    
      <div className='table-container'>       
        <div className='top-table page-header'>
          <h1 className='titulo'>
            <span className="material-symbols-outlined page-icon">group</span>
            Usuarios
          </h1>
          <div className='filter-actions'>
            <Search value={filterRut} onChange={handleRutFilterChange} placeholder={'Filtrar por rut'} />
            <select //dropdown para seleccionar tema
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                minWidth: '200px'
              }}
            >
              <option value="">Seleccionar tema</option>
              {subjectsList.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.nombre}
                </option>
              ))}
            </select>
            <button className="btn btn-outline-amber" onClick={() => setIsSubjectModalOpen(true)}>Crear/Borrar Tema</button>
            <button className="btn btn-primary" onClick={assignRandomUser} title="Asignar tema seleccionado a usuarios aleatoriamente">Sortear tema</button>
            <button className="btn btn-primary" onClick={assignSubjectToUsers} disabled={!selectedSubjectId || dataUser.length === 0} title="Asignar tema seleccionado a usuarios">Asignar</button>
            <button className="btn" onClick={handleClickUpdate} disabled={dataUser.length === 0} style={{ marginLeft: '6px' }}>
              {dataUser.length === 0 ? (
                <img src={UpdateIconDisable} alt="edit-disabled" />
              ) : (
                <img src={UpdateIcon} alt="edit" />
              )}
            </button>
            <button className='btn btn-danger-icon' disabled={dataUser.length === 0} onClick={() => handleDelete(dataUser)}>
              {dataUser.length === 0 ? (
                <img src={DeleteIconDisable} alt="delete-disabled" />
              ) : (
                <img src={DeleteIcon} alt="delete" />
              )}
            </button>
          </div>
        </div>     
        <Table
          data={users}
          columns={columns}
          filter={filterRut}
          dataToFilter={'rut'}
          initialSortName={'nombreCompleto'}
          onSelectionChange={handleSelectionChange}
        />
        
        
      </div>
      <Popup show={isPopupOpen} setShow={setIsPopupOpen} data={dataUser} action={handleUpdate} />
      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        onSubmit={handleAddSubject}      // Ya lo tenías
        onDelete={handleDeleteSubject}
      />
    </div>
  );
};

export default Users;