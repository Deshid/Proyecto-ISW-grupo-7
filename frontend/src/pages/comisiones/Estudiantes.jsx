import '@styles/comisiones.css';
import MiniHeader from '@components/MiniHeader';
import { getEstudiantes, getProfesores } from '@services/comision.service.js';
import { useEffect, useState } from 'react';

const Estudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    const fetchEstudiantes = async () => {
      const data = await getEstudiantes();
      setEstudiantes(data);
    };
    const fetchProfesores = async () => {
      const data = await getProfesores();
      setProfesores(data);
    };
    fetchEstudiantes();
    fetchProfesores();
  }, []);

  const getProfessorNameByEstudiante = (estudianteId) => {
    // Buscar en qué profesor está asignado el estudiante
    for (const profesor of profesores) {
      if (profesor.estudiantesAsignados && profesor.estudiantesAsignados.some(e => e.id === estudianteId)) {
        return profesor.nombreCompleto;
      }
    }
    return 'Sin asignar';
  };

  const isEstudianteAsignado = (estudianteId) => {
    // Verificar si el estudiante está asignado a algún profesor
    for (const profesor of profesores) {
      if (profesor.estudiantesAsignados && profesor.estudiantesAsignados.some(e => e.id === estudianteId)) {
        return true;
      }
    }
    return false;
  };

  const estudiantesFiltrados = estudiantes.filter(est => {
    const asignado = isEstudianteAsignado(est.id);
    if (filtro === 'asignados') {
      return asignado;
    } else if (filtro === 'sin-asignar') {
      return !asignado;
    }
    return true;
  });

  const countAsignados = estudiantes.filter(e => isEstudianteAsignado(e.id)).length;
  const countSinAsignar = estudiantes.filter(e => !isEstudianteAsignado(e.id)).length;

  return (
    <div className="comisiones">
      <MiniHeader icon="school" title="Estudiantes" subtitle="Visualiza el estado de asignación" />

      {/* Estadísticas */}
      <div className="grid grid-3">
        <div className="card card-amber">
          <h3 className="titulo-seccion" style={{ fontSize: '14px', marginBottom: '10px' }}>
            <span className="material-symbols-outlined page-icon">people</span>
            Total estudiantes
          </h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#92400e' }}>
            {estudiantes.length}
          </p>
        </div>

        <div className="card card-green">
          <h3 className="titulo-seccion" style={{ fontSize: '14px', marginBottom: '10px' }}>
            <span className="material-symbols-outlined page-icon">check_circle</span>
            Asignados
          </h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#166534' }}>
            {countAsignados}
          </p>
        </div>

        <div className="card card-yellow">
          <h3 className="titulo-seccion" style={{ fontSize: '14px', marginBottom: '10px' }}>
            <span className="material-symbols-outlined page-icon">pending</span>
            Sin asignar
          </h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#854d0e' }}>
            {countSinAsignar}
          </p>
        </div>
      </div>

      {/* Tabla de estudiantes */}
      <section className="card card-stone">
        <h2 className="titulo-seccion">
          <span className="material-symbols-outlined page-icon">list</span>
          Lista de estudiantes
        </h2>

        <div className="mb-20">
          <label htmlFor="filtro" style={{ fontWeight: '500', fontSize: '14px', color: '#78716c', marginBottom: '8px', display: 'block' }}>
            Filtrar por:
          </label>
          <select
            id="filtro"
            className="ds-input"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            <option value="todos">Todos los estudiantes</option>
            <option value="asignados">Asignados</option>
            <option value="sin-asignar">Sin asignar</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {estudiantesFiltrados.length > 0 ? (
            <table className="tabla tabla-comisiones">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Email</th>
                  <th>Profesor Asignado</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {estudiantesFiltrados.map((est) => {
                  const asignado = isEstudianteAsignado(est.id);
                  return (
                  <tr key={est.id}>
                    <td data-label="Estudiante" style={{ fontWeight: '500' }}>{est.nombreCompleto}</td>
                    <td data-label="Email">{est.email}</td>
                    <td data-label="Profesor Asignado">{getProfessorNameByEstudiante(est.id)}</td>
                    <td data-label="Estado">
                      <span 
                        className={`badge ${asignado ? 'badge-green' : 'badge-yellow'}`}
                      >
                        {asignado ? 'Asignado' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p style={{ marginTop: '20px', color: '#999', textAlign: 'center' }}>
              No hay estudiantes que coincidan con el filtro seleccionado.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Estudiantes;
