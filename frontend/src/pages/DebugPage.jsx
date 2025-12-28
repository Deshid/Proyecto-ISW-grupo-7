import { useEffect, useState } from "react";
import Table from '@components/Table';

const DebugPage = () => {
    const user = JSON.parse(sessionStorage.getItem('usuario'));
    const [subject, setSubject] = useState(null);
    const [commission, setCommission] = useState(null);

    //tengo que conseguir el tema que este usuario tiene asignado
    const loadSubject = async () => {
        if (user && user.assignedSubjectId) {
            try {
                const response = await fetch(`http://localhost:3000/api/subject/${user.assignedSubjectId}`);
                const data = await response.json();
                setSubject(data);
            } catch (error) {
                console.error("Error cargando el tema:", error);
            }
        }
    };

    const columns = [
        { title: "ID", field: "id" },
        { title: "Nombre", field: "nombre" },
        { title: "Tema", field: "subjectsCount",
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
         },
    ];

    /*
    const loadCommission = async () => {
        if (user && user.rol === 'estudiante') {
            try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(
                `http://localhost:3000/api/comisiones/estudiante/${user.id}/completas`,
                {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
                }
            );
            const data = await response.json();
            if (data.success && data.data.length > 0) {
                setCommission(data.data[0]); // Toma la primera comisión
            }
            } catch (error) {
            console.error("Error cargando comisión:", error);
            }
        }
    };
    */

    const [loadingCommission, setLoadingCommission] = useState(true);

    useEffect(() => {
    loadSubject();
    // Cargar comisión automáticamente si es estudiante
        if (user && user.rol === 'estudiante') {
            const loadCommission = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const response = await fetch(
                `http://localhost:3000/api/comisiones/estudiante/${user.id}/completas`,
                {
                    headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                    }
                }
                );
                const data = await response.json();
                if (data.success && data.data.length > 0) {
                setCommission(data.data[0]);
                }
            } catch (error) {
                console.error("Error cargando comisión:", error);
            } finally {
                setLoadingCommission(false);
            }
            };
            
            loadCommission();
        } else {
            setLoadingCommission(false);
        }
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            {/* CAJA DE INFORMACIÓN DE COMISIÓN */}
            <div style={{
            border: '2px solid #4CAF50',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '20px',
            backgroundColor: '#f9f9f9'
            }}>
            <h2 style={{ color: '#4CAF50', marginTop: 0 }}>📋 Información de Comisión Asignada</h2>
            
            {commission ? (
                <div style={{ display: 'grid', gap: '15px' }}>
                <div>
                    <strong>👨‍🏫 Profesor:</strong> {commission.profesor?.nombre_completo}
                </div>
                <div>
                    <strong>📍 Lugar:</strong> {commission.lugar?.nombre} ({commission.lugar?.ubicacion})
                </div>
                <div>
                    <strong>📅 Fecha:</strong> {new Date(commission.horario?.fecha).toLocaleDateString()}
                </div>
                <div>
                    <strong>🕐 Horario:</strong> {commission.horario?.hora_inicio} - {commission.horario?.hora_fin}
                </div>
                <div>
                    <strong>📝 Estado:</strong> {commission.horario?.estado}
                </div>
                <div>
                    <strong>👥 Estudiantes asignados:</strong> {commission.estudiantes?.length || 0}
                </div>
                </div>
            ) : (
                <div>
                <p style={{ color: '#666', fontStyle: 'italic' }}>
                    {loadingCommission 
                    ? 'Cargando información de comisión...' 
                    : 'No tienes una comisión asignada'}
                </p>
                </div>
            )}
            </div>
            
            <h1>Debug SessionStorage</h1>
            <pre>{JSON.stringify(user, null, 2)}</pre>
            
            <button onClick={() => {
            sessionStorage.setItem('usuario', JSON.stringify({
                nombreCompleto: 'Test User',
                rol: 'estudiante',
                email: 'test@test.com'
            }));
            window.location.reload();
            }}>
            Set Test User
            </button>
        </div>
    );

};

export default DebugPage;