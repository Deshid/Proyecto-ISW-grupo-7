import { useEffect, useState } from "react";
import Table from '@components/Table';
import MiniHeader from '@components/MiniHeader';
import '@styles/comisiones.css';

const Asignacion = () => {
    const [comisiones, setComisiones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [assignedSubjects, setAssignedSubjects] = useState([]);
    const alumno = JSON.parse(sessionStorage.getItem('usuario')) || JSON.parse(sessionStorage.getItem('user')) || null;
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

            // soportar ambos formatos de respuesta: { success: true, data: [...] } o { status: 'Success', data: [...] }
            const isSuccess = result && (result.success === true || result.status === 'Success' || response.status === 200);
            if (isSuccess) {
                setComisiones(result.data || []); // guarda datos en estado
                // También obtener los temas asignados al estudiante (si el backend no los incluye en la comision)
                try {
                    if (alumno && alumno.id) {
                        const subjRes = await fetch(`http://localhost:3000/api/subjectAssign/user/${alumno.id}/subjects`, {
                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                        });
                        if (subjRes.ok) {
                            const subjData = await subjRes.json();
                            // subjData.data expected to be array of relations { subject: {...} }
                            const subjects = Array.isArray(subjData.data)
                                ? subjData.data.map(item => item.subject || item)
                                : [];
                            setAssignedSubjects(subjects);
                        }
                    }
                } catch (err) {
                    console.warn('No se pudieron cargar los temas asignados del estudiante:', err.message || err);
                }
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
                            // Función auxiliar para formatear hora sin segundos (HH:mm)
                            const formatearHora = (hora) => {
                                if (!hora) return '-';
                                // Si es un string con formato HH:mm:ss, extraer HH:mm
                                if (typeof hora === 'string' && hora.includes(':')) {
                                    const partes = hora.split(':');
                                    return `${partes[0]}:${partes[1]}`;
                                }
                                return hora;
                            };

                            // Extraer campos comunes con fallback
                            const lugar = com.lugar_evaluacion?.nombre || com.lugar_evaluacion || com.lugar || com.lugarName || '-';
                            const fecha = com.fecha || com.fecha_programada || com.fechaHora || '-';
                            const horaInicio = formatearHora(com.horaInicio || com.hora_inicio || com.hora || '-');
                            const horaFin = formatearHora(com.horaFin || com.hora_fin || '-');
                            const profesor = com.profesor_asignado?.nombreCompleto || com.profesor_asignado?.nombre || com.nombreProfesor || com.profesor_asignado || '-';
                            const estado = com.estado || com.tipo || '-';
                            const modalidad = com.modalidad || com.mode || com.tipoModalidad || '-';
                            // Obtener temas desde la comisión; si no vienen, usar los temas asignados al estudiante
                            let temas = com.temas || com.subjects || com.subject || com.tema || [];
                            if ((!temas || (Array.isArray(temas) && temas.length === 0)) && Array.isArray(assignedSubjects) && assignedSubjects.length > 0) {
                                temas = assignedSubjects;
                            }

                            const temasTexto = Array.isArray(temas)
                                ? temas.map(t => t.nombre || t.subject?.nombre || t).join(', ')
                                : (typeof temas === 'string' ? temas : (temas?.nombre || 'Sin tema'));

                            return (
                                <section className="card card-amber" key={idx} style={{ marginBottom: '12px' }}>
                                    <h2 className="titulo-seccion">Comisión asignada</h2>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <div><strong>Lugar:</strong> {lugar}</div>
                                        <div><strong style={{ color: '#2c5f8d', fontSize: '1.05em' }}>Profesor:</strong> <span style={{ color: '#2c5f8d', fontWeight: 'bold', fontSize: '1.05em' }}>{profesor}</span></div>
                                        <div><strong>Fecha:</strong> {fecha}</div>
                                        <div><strong style={{ color: '#d97706', fontSize: '1.05em' }}>Hora:</strong> <span style={{ color: '#d97706', fontWeight: 'bold', fontSize: '1.05em' }}>{horaInicio} - {horaFin}</span></div>
                                        <div><strong>Modalidad:</strong> {modalidad}</div>
                                        <div><strong>Estado:</strong> {estado}</div>
                                        <div style={{ gridColumn: '1 / -1' }}><strong>Tema asignado:</strong> {temasTexto || 'Sin tema asignado'}</div>
                                        
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