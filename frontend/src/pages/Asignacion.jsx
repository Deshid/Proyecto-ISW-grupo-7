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



    // Mostrar la comisión asignada y el/los temas asignados por el profesor
    return (
        <div className="comisiones">
            <div className="page-header">
                <h1 className="titulo"><span className="material-symbols-outlined page-icon">event_available</span> Mi Comisión Asignada</h1>
                <p className="subtitulo">Información de la comisión y tema asignado por tu profesor</p>
            </div>

            {cargando && <p style={{ padding: '1rem' }}>Cargando comisiones...</p>}

            {error && (
                <div style={{ color: 'red', padding: '1rem', background: '#fee' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {!cargando && !error && (
                <div style={{ padding: '16px' }}>
                    {comisiones.length === 0 ? (
                        <div className="card card-stone">
                            <p>No tienes ninguna comisión asignada.</p>
                        </div>
                    ) : (
                        comisiones.map((com, idx) => {
                            // Extraer campos comunes con fallback
                            const lugar = com.lugar?.nombre || com.nombreLugar || com.lugar || com.lugarName || '-';
                            const fecha = com.fecha || com.fecha_programada || com.fechaHora || '-';
                            const horaInicio = com.horaInicio || com.hora_inicio || com.hora || '-';
                            const horaFin = com.horaFin || com.hora_fin || '-';
                            const profesor = com.profesor?.nombreCompleto || com.profesor?.nombre || com.nombreProfesor || com.profesor || '-';
                            const temas = com.subjects || com.temas || com.subject || com.tema || [];

                            const temasTexto = Array.isArray(temas)
                                ? temas.map(t => t.nombre || t.subject?.nombre || t).join(', ')
                                : (typeof temas === 'string' ? temas : (temas?.nombre || 'Sin tema'));

                            return (
                                <section className="card card-amber" key={idx} style={{ marginBottom: '12px' }}>
                                    <h2 className="titulo-seccion">Comisión asignada</h2>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <div><strong>Lugar:</strong> {lugar}</div>
                                        <div><strong>Profesor:</strong> {profesor}</div>
                                        <div><strong>Fecha:</strong> {fecha}</div>
                                        <div><strong>Hora:</strong> {horaInicio} - {horaFin}</div>
                                        <div style={{ gridColumn: '1 / -1' }}><strong>Tema(s) asignado(s):</strong> {temasTexto || 'Sin tema asignado'}</div>
                                    </div>
                                </section>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );

}

export default Asignacion;