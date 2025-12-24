import Table from '@components/Table';
import useUsers from '@hooks/users/useGetUsers.jsx';
import Search from '../components/Search';
import Popup from '../components/Popup';
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
    
    // 1. Obtener usuarios
    console.log("3. Llamando a /api/user/ ...");
    const usersResponse = await fetch('http://localhost:3000/api/user/', { headers });
    console.log("4. Respuesta usuarios status:", usersResponse.status);
    
    const usersData = await usersResponse.json();
    console.log("5. Datos usuarios recibidos:", usersData);
    console.log("6. Número de usuarios:", usersData.data?.length || 0);
    
    // 2. Para cada usuario, obtener sus temas
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

  const columns = [
    /*ATENCIÓN: la suma de los anchos totales de los campos debe ser igual o menor a 995.
    De otra forma, la tabla pasa a usar dos filas por instancia, lo cual tapa algunos botones
    de la página.
    */
    { title: "Nombre", field: "nombreCompleto", width: 250, responsive: 0 },
    { title: "Correo electrónico", field: "email", width: 250, responsive: 3 },
    { title: "Rut", field: "rut", width: 100, responsive: 2 },
    { title: "Rol", field: "rol", width: 100, responsive: 2 },
    { title: "Creado", field: "createdAt", width: 100, responsive: 2 },
    { title: "Tema asignado", field: "assignedSubject",  width: 195, responsive: 2,
        render: (rowData) => {
        if (rowData.subjectsCount === 0) {
          return <span style={{ color: '#666' }}>0 temas</span>;
        }
        return (
          <div>
            <strong>{rowData.subjectsCount} tema(s)</strong>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              {rowData.subjects.map(s => s.nombre).join(', ')}
            </div>
          </div>
        );
      }
    }
  ];

  return (
    <div className='main-container'>    
      <div className='table-container'>       
        <div className='top-table'>
          <h1 className='title-table'>Usuarios</h1>
          <div className='filter-actions'>
            <Search value={filterRut} onChange={handleRutFilterChange} placeholder={'Filtrar por rut'} />
            <select
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
            <button onClick={() => setIsSubjectModalOpen(true)}>
              <img src={ViewIcon} alt="view" />
            </button>

            <button onClick={handleClickUpdate} disabled={dataUser.length === 0}>
              {dataUser.length === 0 ? (
                <img src={UpdateIconDisable} alt="edit-disabled" />
              ) : (
                <img src={UpdateIcon} alt="edit" />
              )}
            </button>
            <button className='delete-user-button' disabled={dataUser.length === 0} onClick={() => handleDelete(dataUser)}>
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