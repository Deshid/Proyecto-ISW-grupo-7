import { useEffect, useState } from "react";
import Table from '@components/Table';
import MiniHeader from '@components/MiniHeader';
import '@styles/comisiones.css';

const Asignacion = () => {
    const [comisiones, setComisiones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    //
    // función para obtener las comisiones del alumno
    const obtenerMisComisiones = async () => {
        try {
            setCargando(true);
            setError(null);
            
            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error('No hay sesión activa');
            }

            const response = await fetch('http://localhost:3000/api/mis-comisiones', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                setComisiones(result.data || []); // guarda datos en estado
            } else {
                throw new Error(result.message || 'Error al obtener comisiones');
            }
            
        } catch (err) {
            console.error('Error obteniendo comisiones:', err);
            setError(err.message);
            setComisiones([]); // array vacío en caso de error
        } finally {
            setCargando(false);
        }
    };

    // luego de cargar el componente
    useEffect(() => {
        obtenerMisComisiones();
    }, []);



    // Por ahora solo muestra estados (después aquí renderizarás los datos)
    return (
        <div>
            <h1>Mi Comisión Asignada</h1>
            
            {cargando && <p>Cargando comisiones...</p>}
            
            {error && (
                <div style={{ color: 'red', padding: '1rem', background: '#fee' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}
            
            {!cargando && !error && (
                <div>
                    <p>✅ Datos cargados correctamente en el estado.</p>
                    <p>Número de comisiones encontradas: {comisiones.length}</p>
                    
                    {/* Por ahora solo console.log para ver la estructura */}
                    {console.log('Datos de comisiones recibidos:', comisiones)}
                </div>
            )}
        </div>
    );

}

export default Asignacion;